export type CsvRecord = Record<string, string>;

export type ImportedMatch = {
  importKey: string;
  sourceMatchId: string | null;
  season: string;
  competition: string;
  matchday: string | null;
  homeTeam: string;
  awayTeam: string;
  matchDateIso: string;
  location: string | null;
  mapsQuery: string | null;
  status: "scheduled" | "finished";
  homeScore: number | null;
  awayScore: number | null;
};

export type CsvPreviewResult = {
  delimiter: string;
  headers: string[];
  records: CsvRecord[];
};

const HEADER_ALIASES = {
  matchId: [
    "spielkennung",
    "spiel id",
    "spiel-id",
    "spielnummer",
    "spiel-nr.",
    "spielnr",
    "kennung",
  ],
  competition: [
    "wettbewerb",
    "staffel",
    "liga",
    "klasse",
    "wettbewerbsname",
  ],
  matchday: [
    "spieltag",
    "st.",
    "staffelspieltag",
    "runde",
    "spielrunde",
  ],
  date: [
    "datum",
    "spieldatum",
    "tag",
    "datum/uhrzeit",
    "termin",
    "anstoss",
    "anstoß",
  ],
  time: [
    "uhrzeit",
    "zeit",
    "anstoßzeit",
    "anstosszeit",
    "beginn",
  ],
  home: [
    "heim",
    "heimverein",
    "heimmannschaft",
    "mannschaft 1",
    "team 1",
    "gastgeber",
  ],
  away: [
    "gast",
    "gastverein",
    "gastmannschaft",
    "mannschaft 2",
    "team 2",
  ],
  location: [
    "spielstätte",
    "spielstaette",
    "spielort",
    "sportplatz",
    "stätte",
    "platz",
    "anschrift",
    "adresse",
  ],
  result: [
    "ergebnis",
    "endergebnis",
    "resultat",
    "tore",
  ],
  homeScore: [
    "heimtore",
    "tore heim",
    "heim tore",
    "heim-ergebnis",
  ],
  awayScore: [
    "gasttore",
    "tore gast",
    "gast tore",
    "gast-ergebnis",
  ],
} as const;

function normalizeHeader(value: string) {
  return value
    .replace(/^\uFEFF/, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function findHeader(headers: string[], aliases: readonly string[]) {
  const normalized = headers.map((header) => ({
    original: header,
    normalized: normalizeHeader(header),
  }));

  for (const alias of aliases) {
    const exact = normalized.find((item) => item.normalized === alias);
    if (exact) return exact.original;
  }

  for (const alias of aliases) {
    const partial = normalized.find((item) =>
      item.normalized.includes(alias),
    );
    if (partial) return partial.original;
  }

  return null;
}

function detectDelimiter(firstLine: string) {
  const candidates = [";", "\t", ","];
  return candidates
    .map((delimiter) => ({
      delimiter,
      count: firstLine.split(delimiter).length,
    }))
    .sort((a, b) => b.count - a.count)[0]?.delimiter ?? ";";
}

function parseLine(line: string, delimiter: string) {
  const values: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }

    if (char === delimiter && !quoted) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

export function parseCsv(text: string): CsvPreviewResult {
  const cleaned = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  if (!cleaned) {
    return { delimiter: ";", headers: [], records: [] };
  }

  const lines = cleaned.split("\n").filter((line) => line.trim().length > 0);
  const delimiter = detectDelimiter(lines[0] ?? "");
  const headers = parseLine(lines[0] ?? "", delimiter).map((header) =>
    header.replace(/^\uFEFF/, "").trim(),
  );

  const records = lines.slice(1).map((line) => {
    const values = parseLine(line, delimiter);
    return headers.reduce<CsvRecord>((record, header, index) => {
      record[header] = values[index]?.trim() ?? "";
      return record;
    }, {});
  });

  return { delimiter, headers, records };
}

function parseGermanDate(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const iso = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

  const german = trimmed.match(
    /(?:\w{2,10},?\s*)?(\d{1,2})\.(\d{1,2})\.(\d{2,4})/,
  );
  if (german) {
    const year =
      german[3].length === 2 ? `20${german[3]}` : german[3];
    return `${year}-${german[2].padStart(2, "0")}-${german[1].padStart(2, "0")}`;
  }

  return null;
}

function parseTime(value: string) {
  const match = value.match(/(\d{1,2})[:.](\d{2})/);
  if (!match) return "00:00";
  return `${match[1].padStart(2, "0")}:${match[2]}`;
}

function parseScore(value: string) {
  const match = value.match(/(\d+)\s*[:\-]\s*(\d+)/);
  if (!match) return null;

  return {
    home: Number.parseInt(match[1], 10),
    away: Number.parseInt(match[2], 10),
  };
}

function toIsoInBrowser(date: string, time: string) {
  const local = new Date(`${date}T${time}:00`);
  if (Number.isNaN(local.getTime())) return null;
  return local.toISOString();
}

function slugPart(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 70);
}

export function mapCsvRecords(input: {
  headers: string[];
  records: CsvRecord[];
  season: string;
  defaultCompetition: string;
  clubName: string;
  onlyClubMatches: boolean;
  defaultLocation: string;
}): { matches: ImportedMatch[]; skipped: number; detected: Record<string, string | null> } {
  const { headers, records } = input;

  const columns = {
    matchId: findHeader(headers, HEADER_ALIASES.matchId),
    competition: findHeader(headers, HEADER_ALIASES.competition),
    matchday: findHeader(headers, HEADER_ALIASES.matchday),
    date: findHeader(headers, HEADER_ALIASES.date),
    time: findHeader(headers, HEADER_ALIASES.time),
    home: findHeader(headers, HEADER_ALIASES.home),
    away: findHeader(headers, HEADER_ALIASES.away),
    location: findHeader(headers, HEADER_ALIASES.location),
    result: findHeader(headers, HEADER_ALIASES.result),
    homeScore: findHeader(headers, HEADER_ALIASES.homeScore),
    awayScore: findHeader(headers, HEADER_ALIASES.awayScore),
  };

  const matches: ImportedMatch[] = [];
  let skipped = 0;

  for (const record of records) {
    const homeTeam = columns.home ? record[columns.home]?.trim() : "";
    const awayTeam = columns.away ? record[columns.away]?.trim() : "";
    const rawDate = columns.date ? record[columns.date] ?? "" : "";
    const rawTime =
      (columns.time ? record[columns.time] ?? "" : "") || rawDate;
    const date = parseGermanDate(rawDate);

    if (!homeTeam || !awayTeam || !date) {
      skipped += 1;
      continue;
    }

    if (
      input.onlyClubMatches &&
      !`${homeTeam} ${awayTeam}`
        .toLowerCase()
        .includes(input.clubName.toLowerCase())
    ) {
      continue;
    }

    const time = parseTime(rawTime);
    const matchDateIso = toIsoInBrowser(date, time);
    if (!matchDateIso) {
      skipped += 1;
      continue;
    }

    const result = columns.result
      ? parseScore(record[columns.result] ?? "")
      : null;

    const homeScoreText = columns.homeScore
      ? record[columns.homeScore]?.trim()
      : "";
    const awayScoreText = columns.awayScore
      ? record[columns.awayScore]?.trim()
      : "";

    const homeScore =
      result?.home ??
      (homeScoreText && /^\d+$/.test(homeScoreText)
        ? Number.parseInt(homeScoreText, 10)
        : null);
    const awayScore =
      result?.away ??
      (awayScoreText && /^\d+$/.test(awayScoreText)
        ? Number.parseInt(awayScoreText, 10)
        : null);

    const sourceMatchId = columns.matchId
      ? record[columns.matchId]?.trim() || null
      : null;
    const competition =
      (columns.competition
        ? record[columns.competition]?.trim()
        : "") || input.defaultCompetition;
    const matchday =
      (columns.matchday ? record[columns.matchday]?.trim() : "") || null;
    const location =
      (columns.location ? record[columns.location]?.trim() : "") ||
      input.defaultLocation ||
      null;

    const importKey = sourceMatchId
      ? `dfbnet:${sourceMatchId}`
      : [
          "dfbnet",
          input.season,
          slugPart(competition),
          slugPart(homeTeam),
          slugPart(awayTeam),
          date,
          time,
        ].join(":");

    matches.push({
      importKey,
      sourceMatchId,
      season: input.season,
      competition,
      matchday,
      homeTeam,
      awayTeam,
      matchDateIso,
      location,
      mapsQuery: location,
      status:
        homeScore !== null && awayScore !== null ? "finished" : "scheduled",
      homeScore,
      awayScore,
    });
  }

  return {
    matches,
    skipped,
    detected: columns,
  };
}
