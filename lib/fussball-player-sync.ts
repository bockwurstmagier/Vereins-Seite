import "server-only";

export const FUSSBALL_TEAM_URL =
  "https://www.fussball.de/mannschaft/spvgg-middelich-resse-71-81-spvgg-middelich-resse-71-81-westfalen/-/saison/2627/team-id/011MIEU2B0000000VTVG0001VTR8C1K7";

const BASE = "https://www.fussball.de";
const USER_AGENT =
  "Mozilla/5.0 (compatible; HUJA-Vereinsapp/22.5; +https://spvgg-middelich-resse.eu)";

type LocalPlayer = {
  id: string;
  first_name: string;
  last_name: string;
  birth_date: string | null;
};

export type FussballProfile = {
  name: string;
  profileUrl: string;
  userId: string | null;
  birthDate: string | null;
};

export type PlayerSyncMatch = {
  player: LocalPlayer;
  status: "exact" | "possible" | "not_found";
  candidate: FussballProfile | null;
  keepsExistingBirthday: boolean;
};

export type PlayerSyncResult = {
  matches: PlayerSyncMatch[];
  profilesFound: number;
  matchPagesScanned: number;
  warning: string | null;
};

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&auml;/g, "ä")
    .replace(/&ouml;/g, "ö")
    .replace(/&uuml;/g, "ü")
    .replace(/&Auml;/g, "Ä")
    .replace(/&Ouml;/g, "Ö")
    .replace(/&Uuml;/g, "Ü")
    .replace(/&szlig;/g, "ß")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

function textFromHtml(html: string) {
  return decodeHtml(
    html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  ).replace(/\s+/g, " ");
}

function normalizeName(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function toIsoDate(value: string | null) {
  if (!value) return null;
  const match = value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!match) return null;
  return `${match[3]}-${match[2]}-${match[1]}`;
}

async function getHtml(url: string) {
  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      "user-agent": USER_AGENT,
      accept: "text/html,application/xhtml+xml",
      "accept-language": "de-DE,de;q=0.9",
    },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`FUSSBALL.DE antwortet mit HTTP ${response.status}.`);
  return response.text();
}

function absoluteUrl(value: string) {
  const decoded = decodeHtml(value).replace(/#!\/?$/, "");
  if (decoded.startsWith("http://") || decoded.startsWith("https://")) return decoded;
  return new URL(decoded, BASE).toString();
}

function extractMatchUrls(html: string) {
  const urls = new Set<string>();
  const regex = /href=["']([^"']*\/spiel\/[^"']*\/-\/spiel\/[A-Z0-9]+[^"']*)["']/gi;
  for (const match of html.matchAll(regex)) {
    try {
      urls.add(absoluteUrl(match[1]));
    } catch {}
  }
  return [...urls].slice(0, 10);
}

function extractProfileUrls(html: string) {
  const urls = new Set<string>();
  const regex = /href=["']([^"']*\/spielerprofil(?:\.fieberkurve)?\/[^"']*userid\/[A-Z0-9]+[^"']*)["']/gi;
  for (const match of html.matchAll(regex)) {
    try {
      urls.add(absoluteUrl(match[1]));
    } catch {}
  }
  return [...urls];
}

function parseProfile(html: string, profileUrl: string): FussballProfile | null {
  const plain = textFromHtml(html);
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const ogMatch = html.match(/property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
  const rawTitle = decodeHtml((ogMatch?.[1] ?? titleMatch?.[1] ?? "").replace(/<[^>]+>/g, " "));
  let name = rawTitle
    .replace(/\s*\([^)]*\)\s*Spielerprofil.*$/i, "")
    .replace(/\s*Spielerprofil.*$/i, "")
    .replace(/\s*\|\s*FUSSBALL\.DE.*$/i, "")
    .trim();

  if (!name) {
    const beforeBirthday = plain.match(/Spielerprofil\s+([A-ZÄÖÜ][^]{2,80}?)\s+(?:Image:|Profil bearbeiten|Meine Position)/i);
    name = beforeBirthday?.[1]?.trim() ?? "";
  }
  if (!name || name.length > 80) return null;

  const dateNearLabel =
    plain.match(/(\d{2}\.\d{2}\.\d{4})\s+Geburtsdatum/i)?.[1] ??
    plain.match(/Geburtsdatum\s+(\d{2}\.\d{2}\.\d{4})/i)?.[1] ??
    null;
  const userId = profileUrl.match(/userid\/([A-Z0-9]+)/i)?.[1] ?? null;
  return { name, profileUrl, userId, birthDate: toIsoDate(dateNearLabel) };
}

async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>) {
  const result: R[] = new Array(items.length);
  let index = 0;
  async function worker() {
    while (true) {
      const current = index++;
      if (current >= items.length) return;
      result[current] = await fn(items[current]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return result;
}

function chooseCandidate(player: LocalPlayer, profiles: FussballProfile[]) {
  const local = normalizeName(`${player.first_name} ${player.last_name}`);
  const exact = profiles.find((profile) => normalizeName(profile.name) === local);
  if (exact) return { status: "exact" as const, candidate: exact };

  const localLast = normalizeName(player.last_name);
  const localFirst = normalizeName(player.first_name);
  const possible = profiles.find((profile) => {
    const parts = normalizeName(profile.name).split(" ");
    const candidateLast = parts.at(-1) ?? "";
    const candidateFirst = parts[0] ?? "";
    return candidateLast === localLast && candidateFirst[0] === localFirst[0];
  });
  return possible
    ? { status: "possible" as const, candidate: possible }
    : { status: "not_found" as const, candidate: null };
}

export async function discoverFussballPlayerProfiles(players: LocalPlayer[]): Promise<PlayerSyncResult> {
  try {
    const teamHtml = await getHtml(FUSSBALL_TEAM_URL);
    const matchUrls = extractMatchUrls(teamHtml);
    if (!matchUrls.length) {
      return { matches: players.map((player) => ({ player, status: "not_found", candidate: null, keepsExistingBirthday: Boolean(player.birth_date) })), profilesFound: 0, matchPagesScanned: 0, warning: "Auf der Mannschaftsseite konnten derzeit keine öffentlichen Spielseiten gefunden werden." };
    }

    const matchPages = await mapLimit(matchUrls, 3, async (url) => {
      try { return await getHtml(url); } catch { return ""; }
    });
    const profileUrls = [...new Set(matchPages.flatMap(extractProfileUrls))].slice(0, 60);
    const profilesRaw = await mapLimit(profileUrls, 5, async (url) => {
      try { return parseProfile(await getHtml(url), url); } catch { return null; }
    });
    const profiles = profilesRaw.filter((profile): profile is FussballProfile => Boolean(profile));

    const matches = players.map((player) => {
      const selected = chooseCandidate(player, profiles);
      return { player, ...selected, keepsExistingBirthday: Boolean(player.birth_date) };
    });

    const noBirthdays = profiles.length > 0 && profiles.every((profile) => !profile.birthDate);
    return {
      matches,
      profilesFound: profiles.length,
      matchPagesScanned: matchPages.filter(Boolean).length,
      warning: noBirthdays ? "Spielerprofile wurden gefunden, aber FUSSBALL.DE gibt bei den gefundenen Profilen aktuell keine öffentlichen Geburtsdaten aus." : null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unbekannter Abruffehler";
    return {
      matches: players.map((player) => ({ player, status: "not_found", candidate: null, keepsExistingBirthday: Boolean(player.birth_date) })),
      profilesFound: 0,
      matchPagesScanned: 0,
      warning: `FUSSBALL.DE konnte nicht synchronisiert werden: ${message}`,
    };
  }
}
