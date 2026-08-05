import { ChevronRight, Trophy } from "lucide-react";
import { getStandings } from "../../lib/sport-center";
import StandingsTable from "../sport/StandingsTable";

export default async function LeagueTableFromSupabase() {
  const rows = await getStandings();
  const competition = rows[0]?.competition ?? "Kreisliga";

  return (
    <section id="spiele" className="club-section py-10">
      <div className="pointer-events-none absolute left-[-5rem] top-14 h-64 w-64 rounded-full bg-club-red/10 blur-3xl" />
      <div className="club-container">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Trophy
                size={16}
                strokeWidth={2.5}
                className="text-club-light-red"
                aria-hidden="true"
              />
              <p className="club-eyebrow">Aktueller Stand</p>
            </div>
            <h2 className="club-heading mt-2">Tabelle</h2>
          </div>
          <span className="rounded-full border border-club-light-red/30 bg-club-burgundy/40 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-club-light-red">
            {competition}
          </span>
        </div>

        <StandingsTable rows={rows} compact />

        <a href="/tabelle" className="club-button-secondary mt-4 w-full">
          Komplette Tabelle
          <ChevronRight size={17} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
