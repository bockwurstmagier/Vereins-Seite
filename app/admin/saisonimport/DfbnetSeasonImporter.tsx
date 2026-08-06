"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  LoaderCircle,
  UploadCloud,
} from "lucide-react";

import {
  mapCsvRecords,
  parseCsv,
  type CsvPreviewResult,
  type ImportedMatch,
} from "../../../lib/dfbnet/csv-parser";
import { decodeCsvFile, type DetectedEncoding } from "../../../lib/dfbnet/file-decoder";
import { importDfbnetSeason } from "./actions";

type Preview = {
  parsed: CsvPreviewResult;
  matches: ImportedMatch[];
  skipped: number;
  detected: Record<string, string | null>;
  detectedSeason: string | null;
  encoding: DetectedEncoding;
};

export default function DfbnetSeasonImporter() {
  const [season, setSeason] = useState("2026/27");
  const [clubName, setClubName] = useState("SpVgg Middelich-Resse");
  const [competition, setCompetition] = useState("Kreisliga");
  const [defaultLocation, setDefaultLocation] = useState(
    "Kanzlerstraße 44, 45883 Gelsenkirchen",
  );
  const [onlyClubMatches, setOnlyClubMatches] = useState(true);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [fileName, setFileName] = useState("");
  const [reading, setReading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const payload = useMemo(
    () =>
      preview
        ? JSON.stringify({
            season,
            clubName,
            matches: preview.matches,
          })
        : "",
    [clubName, preview, season],
  );

  async function readFile(file: File) {
    setReading(true);
    setError(null);

    try {
      const decoded = await decodeCsvFile(file);
      const parsed = parseCsv(decoded.text);

      if (!parsed.headers.length || !parsed.records.length) {
        throw new Error("Die CSV-Datei enthält keine verwertbaren Datensätze.");
      }

      const mapped = mapCsvRecords({
        headers: parsed.headers,
        records: parsed.records,
        season,
        defaultCompetition: competition,
        clubName,
        onlyClubMatches,
        defaultLocation,
      });

      if (!mapped.matches.length) {
        throw new Error(
          "Es wurden keine Spiele erkannt. Prüfe Vereinsname, CSV-Spalten und Importfilter.",
        );
      }

      setFileName(file.name);
      setPreview({ parsed, ...mapped, encoding: decoded.encoding });
    } catch (caught) {
      setPreview(null);
      setError(
        caught instanceof Error
          ? caught.message
          : "Die CSV-Datei konnte nicht gelesen werden.",
      );
    } finally {
      setReading(false);
    }
  }

  function remap() {
    if (!preview) return;

    const mapped = mapCsvRecords({
      headers: preview.parsed.headers,
      records: preview.parsed.records,
      season,
      defaultCompetition: competition,
      clubName,
      onlyClubMatches,
      defaultLocation,
    });

    setPreview({ parsed: preview.parsed, ...mapped, encoding: preview.encoding });
  }

  return (
    <div className="space-y-6">
      <section className="club-card p-5 sm:p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Saison">
            <input
              value={season}
              onChange={(event) => setSeason(event.target.value)}
              className="admin-input"
              placeholder="2026/27"
            />
          </Field>

          <Field label="Standard-Wettbewerb">
            <input
              value={competition}
              onChange={(event) => setCompetition(event.target.value)}
              className="admin-input"
            />
          </Field>

          <Field label="Unser Vereinsname">
            <input
              value={clubName}
              onChange={(event) => setClubName(event.target.value)}
              className="admin-input"
            />
          </Field>

          <Field label="Standard-Spielort">
            <input
              value={defaultLocation}
              onChange={(event) => setDefaultLocation(event.target.value)}
              className="admin-input"
            />
          </Field>
        </div>

        <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
          <input
            type="checkbox"
            checked={onlyClubMatches}
            onChange={(event) => setOnlyClubMatches(event.target.checked)}
            className="h-5 w-5 accent-red-600"
          />
          <span>
            <span className="block text-sm font-black text-white">
              Nur Spiele unseres Vereins importieren
            </span>
            <span className="mt-1 block text-xs leading-5 text-zinc-500">
              Für eine automatisch berechnete vollständige Ligatabelle muss
              diese Option ausgeschaltet sein und der Staffelspielplan alle
              Mannschaften enthalten.
            </span>
          </span>
        </label>

        <label className="mt-5 flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-club-light-red/25 bg-club-red/[0.06] p-6 text-center transition hover:border-club-light-red/45 hover:bg-club-red/10">
          {reading ? (
            <LoaderCircle className="animate-spin text-club-light-red" size={36} />
          ) : (
            <UploadCloud className="text-club-light-red" size={40} />
          )}

          <span className="mt-4 text-lg font-black uppercase text-white">
            DFBnet-CSV auswählen
          </span>
          <span className="mt-2 max-w-md text-sm leading-6 text-zinc-400">
            Unterstützt Semikolon-, Komma- und Tabulator-getrennte Dateien.
            UTF-16-DFBnet-Exporte und UTF-8-Dateien werden automatisch erkannt.
            Bestehende Spiele werden beim erneuten Import aktualisiert.
          </span>

          <input
            type="file"
            accept=".csv,text/csv,.txt"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void readFile(file);
            }}
          />
        </label>

        {error && (
          <div className="mt-4 flex gap-3 rounded-2xl border border-red-500/25 bg-red-950/25 p-4 text-sm text-red-200">
            <AlertTriangle className="mt-0.5 shrink-0" size={18} />
            <p>{error}</p>
          </div>
        )}
      </section>

      {preview && (
        <>
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Datei" value={fileName} />
            <Stat label="Kodierung" value={encodingLabel(preview.encoding)} />
            <Stat label="CSV-Zeilen" value={String(preview.parsed.records.length)} />
            <Stat label="Erkannte Spiele" value={String(preview.matches.length)} />
          </section>

          <section className="club-card p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="club-eyebrow">Vorschau</p>
                <h2 className="mt-1 text-xl font-black uppercase text-white">
                  Erkannte Spiele prüfen
                </h2>
              </div>
              <button type="button" onClick={remap} className="club-button-secondary">
                Vorschau aktualisieren
              </button>
            </div>

            <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-white/[0.04] text-[10px] font-black uppercase tracking-wider text-zinc-500">
                  <tr>
                    <th className="px-4 py-3">Termin</th>
                    <th className="px-4 py-3">Spieltag</th>
                    <th className="px-4 py-3">Begegnung</th>
                    <th className="px-4 py-3">Ergebnis</th>
                    <th className="px-4 py-3">Wettbewerb</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.07]">
                  {preview.matches.slice(0, 50).map((match) => (
                    <tr key={match.importKey}>
                      <td className="whitespace-nowrap px-4 py-3 text-zinc-300">
                        {new Intl.DateTimeFormat("de-DE", {
                          dateStyle: "short",
                          timeStyle: "short",
                        }).format(new Date(match.matchDateIso))}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-zinc-500">
                        {match.matchday || "–"}
                      </td>
                      <td className="min-w-72 px-4 py-3 font-bold text-white">
                        {match.homeTeam} – {match.awayTeam}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-black text-club-light-red">
                        {match.homeScore !== null && match.awayScore !== null
                          ? `${match.homeScore}:${match.awayScore}`
                          : "Geplant"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-zinc-400">
                        {match.competition}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {preview.matches.length > 50 && (
              <p className="mt-3 text-xs text-zinc-500">
                Es werden die ersten 50 Spiele angezeigt. Importiert werden alle
                {` ${preview.matches.length}`} erkannten Spiele.
              </p>
            )}

            <form action={importDfbnetSeason} className="mt-6">
              <input type="hidden" name="payload" value={payload} />
              <button type="submit" className="club-button-primary w-full">
                <FileSpreadsheet size={18} />
                {preview.matches.length} Spiele sicher importieren
              </button>
            </form>
          </section>

          <section className="rounded-3xl border border-emerald-500/20 bg-emerald-950/20 p-5">
            <div className="flex gap-3">
              <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-400" size={20} />
              <div>
                <p className="font-black text-emerald-200">
                  Automatische Aktualisierung vorbereitet
                </p>
                <p className="mt-2 text-sm leading-6 text-emerald-100/70">
                  Beim späteren erneuten Import erkennt das System Spiele über
                  die DFBnet-Spielkennung oder eine stabile Kombination aus
                  Saison, Teams, Datum und Uhrzeit. Geänderte Termine und
                  Ergebnisse werden aktualisiert, ohne Duplikate anzulegen.
                </p>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label>
      <span className="mb-2 block text-xs font-black uppercase tracking-wider text-zinc-400">
        {label}
      </span>
      {children}
    </label>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="club-card p-4">
      <p className="text-[10px] font-black uppercase tracking-wider text-zinc-600">
        {label}
      </p>
      <p className="mt-2 truncate text-lg font-black text-white">{value}</p>
    </div>
  );
}


function encodingLabel(encoding: DetectedEncoding) {
  if (encoding === "utf-16le") return "UTF-16 LE";
  if (encoding === "utf-16be") return "UTF-16 BE";
  if (encoding === "utf-8-bom") return "UTF-8 BOM";
  return "UTF-8";
}
