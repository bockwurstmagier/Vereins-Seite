import type { DatabaseMatch } from "../../lib/matches";
export default function CupMatch({ match }: { match: DatabaseMatch | null }) {
  if (!match) return null;
  return <section className="club-section py-10"><div className="club-container"><a href={`/match-center/${match.id}`} className="club-card block border-amber-400/30 p-6">
    <p className="font-bold text-amber-300">🏆 {match.competition}</p><h2 className="club-heading mt-2">Nächstes Pokalspiel</h2>
    <p className="my-6 text-center text-xl font-black text-white">{match.home_team} <span className="text-amber-300">vs.</span> {match.away_team}</p>
    <p className="text-center text-zinc-300">{new Intl.DateTimeFormat("de-DE", { dateStyle: "full", timeStyle: "short", timeZone: "Europe/Berlin" }).format(new Date(match.match_date))} Uhr</p>
    <span className="club-button-primary mt-5 w-full">Pokal-Matchcenter →</span>
  </a></div></section>;
}
