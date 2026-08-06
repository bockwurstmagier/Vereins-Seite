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
  originalHeaders: string[];
  records: CsvRecord[];
};

function normalizeHeader(value: string) {
  return value
    .replace(/^\uFEFF/, "")
    .replace(/\s+\[\d+\]$/, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function findHeader(headers: string[], aliases: string[], preferLast = false) {
  const normalized = headers.map((header) => ({
    original: header,
    normalized: normalizeHeader(header),
  }));

  for (const alias of aliases) {
    const matches = normalized.filter((item) => item.normalized === alias);
    if (matches.length) return preferLast ? matches.at(-1)!.original : matches[0].original;
  }

  for (const alias of aliases) {
    const matches = normalized.filter((item) => item.normalized.includes(alias));
    if (matches.length) return preferLast ? matches.at(-1)!.original : matches[0].original;
  }

  return null;
}

function detectDelimiter(firstLine: string) {
  return ["\t", ";", ","]
    .map((delimiter) => ({ delimiter, count: firstLine.split(delimiter).length }))
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
      } else quoted = !quoted;
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

function uniqueHeaders(headers: string[]) {
  const counts = new Map<string, number>();
  return headers.map((header) => {
    const cleaned = header.replace(/^\uFEFF/, "").trim();
    const key = normalizeHeader(cleaned);
    const count = (counts.get(key) ?? 0) + 1;
    counts.set(key, count);
    return count === 1 ? cleaned : `${cleaned} [${count}]`;
  });
}

export function parseCsv(text: string): CsvPreviewResult {
  const cleaned = text
    .replace(/\u0000/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();

  if (!cleaned) return { delimiter: ";", headers: [], originalHeaders: [], records: [] };

  const lines = cleaned.split("\n").filter((line) => line.trim());
  const delimiter = detectDelimiter(lines[0] ?? "");
  const originalHeaders = parseLine(lines[0] ?? "", delimiter);
  const headers = uniqueHeaders(originalHeaders);
  const records = lines.slice(1).map((line) => {
    const values = parseLine(line, delimiter);
    return headers.reduce<CsvRecord>((record, header, index) => {
      record[header] = values[index]?.trim() ?? "";
      return record;
    }, {});
  });

  return { delimiter, headers, originalHeaders, records };
}

function parseGermanDate(value: string) {
  const match = value.trim().match(/(?:\w{2,10},?\s*)?(\d{1,2})\.(\d{1,2})\.(\d{2,4})/);
  if (!match) return null;
  const year = match[3].length === 2 ? `20${match[3]}` : match[3];
  return `${year}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}`;
}

function parseTime(value: string) {
  const match = value.match(/(\d{1,2})[:.](\d{2})/);
  return match ? `${match[1].padStart(2, "0")}:${match[2]}` : "00:00";
}

function parseScore(value: string) {
  const match = value.match(/(\d+)\s*[:\-]\s*(\d+)/);
  return match ? { home: Number(match[1]), away: Number(match[2]) } : null;
}

function toIso(date: string, time: string) {
  const parsed = new Date(`${date}T${time}:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
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

function read(record: CsvRecord, header: string | null) {
  return header ? record[header]?.trim() ?? "" : "";
}

export function mapCsvRecords(input: {
  headers: string[];
  records: CsvRecord[];
  season: string;
  defaultCompetition: string;
  clubName: string;
  onlyClubMatches: boolean;
  defaultLocation: string;
}) {
  const headers = input.headers;
  const columns = {
    matchId: findHeader(headers, ["spielkennung", "spielnummer", "spiel-id"]),
    season: findHeader(headers, ["saison", "spielzeit"]),
    staffel: findHeader(headers, ["staffel"]),
    competition: findHeader(headers, ["wettkampf", "spielklasse", "wettbewerb", "liga"]),
    matchday: findHeader(headers, ["spieltag", "runde"]),
    date: findHeader(headers, ["spieldatum", "datum"]),
    movedDate: findHeader(headers, ["verlegtspieldatum", "verlegt spieldatum"]),
    time: findHeader(headers, ["uhrzeit", "anstoßzeit", "anstosszeit"], true),
    movedTime: findHeader(headers, ["verlegtuhrzeit", "verlegt uhrzeit"]),
    home: findHeader(headers, ["heimmannschaft", "heimverein", "heim"]),
    away: findHeader(headers, ["gastmannschaft", "gastverein", "gast"]),
    location: findHeader(headers, ["spielstätte", "spielstaette", "spielort", "sportplatz"]),
    result: findHeader(headers, ["ergebnis", "endergebnis", "resultat"]),
  };

  const matches: ImportedMatch[] = [];
  let skipped = 0;
  let detectedSeason: string | null = null;

  for (const record of input.records) {
    const homeTeam = read(record, columns.home);
    const awayTeam = read(record, columns.away);
    const date = parseGermanDate(read(record, columns.movedDate) || read(record, columns.date));
    if (!homeTeam || !awayTeam || !date) {
      skipped += 1;
      continue;
    }

    if (
      input.onlyClubMatches &&
      !`${homeTeam} ${awayTeam}`.toLowerCase().includes(input.clubName.toLowerCase())
    ) continue;

    const time = parseTime(read(record, columns.movedTime) || read(record, columns.time));
    const matchDateIso = toIso(date, time);
    if (!matchDateIso) {
      skipped += 1;
      continue;
    }

    const result = parseScore(read(record, columns.result));
    const sourceMatchId = read(record, columns.matchId) || null;
    const csvSeason = read(record, columns.season);
    if (!detectedSeason && csvSeason) detectedSeason = csvSeason;
    const season = input.season || csvSeason;
    const competition =
      read(record, columns.staffel) ||
      read(record, columns.competition) ||
      input.defaultCompetition;
    const location = read(record, columns.location) || input.defaultLocation || null;
    const importKey = sourceMatchId
      ? `dfbnet:${sourceMatchId}`
      : ["dfbnet", season, slugPart(competition), slugPart(homeTeam), slugPart(awayTeam), date, time].join(":");

    matches.push({
      importKey,
      sourceMatchId,
      season,
      competition,
      matchday: read(record, columns.matchday) || null,
      homeTeam,
      awayTeam,
      matchDateIso,
      location,
      mapsQuery: location,
      status: result ? "finished" : "scheduled",
      homeScore: result?.home ?? null,
      awayScore: result?.away ?? null,
    });
  }

  return { matches, skipped, detected: columns, detectedSeason };
}
