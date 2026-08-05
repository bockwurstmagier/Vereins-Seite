import { Trophy } from "lucide-react";
import StandingsTable from "../../components/sport/StandingsTable";
import { getStandings } from "../../lib/sport-center";

export const metadata = {
  title: "Tabelle | SpVgg Middelich-Resse",
};

export default async function TablePage() {
  const rows = await getStandings();
  const season = rows[0]?.season ?? "2026/27";
  const competition = rows[0]?.competition ?? "Kreisliga";

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
              <p className="club-eyebrow">Saison {season}</p>
            </div>
            <h1 className="club-heading mt-2">{competition}-Tabelle</h1>
          </div>
          <a href="/fussball" className="club-button-secondary">
            Offizielle FUSSBALL.DE-Daten
          </a>
        </div>

        <div className="mt-8">
          <StandingsTable rows={rows} />
        </div>
      </div>
    </main>
  );
}
