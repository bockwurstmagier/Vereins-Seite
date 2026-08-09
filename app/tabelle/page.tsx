import { BadgeCheck, Trophy } from "lucide-react";
import FussballWidget from "../../components/fussball/FussballWidget";
import StandingsTable from "../../components/sport/StandingsTable";
import { getStandings } from "../../lib/sport-center";

export const metadata = {
  title: "Tabelle | SpVgg Middelich-Resse",
};

const COMPETITION = "Kreisliga B 2";
const SEASON = "2026/27";
const STAFFEL_ID = "031BHFIC0G000004VS5489BUVUR5FS5A-G";

export default async function TablePage() {
  const widgetId =
    process.env.FUSSBALL_TABLE_WIDGET_ID?.trim() ||
    process.env.NEXT_PUBLIC_FUSSBALL_TABLE_WIDGET_ID?.trim() ||
    "";
  const rows = await getStandings();
  const fallbackSeason = rows[0]?.season ?? SEASON;
  const fallbackCompetition = rows[0]?.competition ?? COMPETITION;

  return (
    <main className="min-h-screen bg-club-black px-4 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <a href="/" className="club-eyebrow">
          Zurück zur Startseite
        </a>

        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-club-light-red">
              <Trophy size={18} aria-hidden="true" />
              <p className="club-eyebrow">Saison {widgetId ? SEASON : fallbackSeason}</p>
            </div>
            <h1 className="club-heading mt-2">
              {widgetId ? COMPETITION : fallbackCompetition}-Tabelle
            </h1>
          </div>
          <a href="/fussball" className="club-button-secondary">
            Offizielle FUSSBALL.DE-Daten
          </a>
        </div>

        {widgetId ? (
          <div className="mt-8">
            <div className="mb-4 flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3 text-sm text-emerald-200">
              <BadgeCheck size={18} aria-hidden="true" />
              Tabelle wird über das offizielle FUSSBALL.DE-Widget automatisch aktualisiert.
            </div>
            <FussballWidget
              widgetId={widgetId}
              widgetType="table"
              title={`Offizielle ${COMPETITION}-Tabelle ${SEASON}`}
            />
            <p className="mt-3 text-xs text-zinc-600">Staffel-ID: {STAFFEL_ID}</p>
          </div>
        ) : (
          <div className="mt-8">
            <div className="mb-4 rounded-2xl border border-amber-400/20 bg-amber-400/5 px-4 py-3 text-sm leading-6 text-amber-100">
              Das FUSSBALL.DE-Tabellenwidget ist vorbereitet, aber noch nicht aktiviert. Bis die 36-stellige Widget-data-id eingetragen ist, zeigt HUJA sicherheitshalber eure bisherige Supabase-Tabelle.
            </div>
            <StandingsTable rows={rows} />
          </div>
        )}
      </div>
    </main>
  );
}
