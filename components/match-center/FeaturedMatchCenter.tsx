import { Radio, Trophy, CalendarDays } from "lucide-react";
import { getFeaturedMatchCenterMatch } from "../../lib/match-center";

const dateFormatter = new Intl.DateTimeFormat("de-DE", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Berlin",
});

export default async function FeaturedMatchCenter() {
  const match = await getFeaturedMatchCenterMatch();

  if (!match) return null;

  const live = match.status === "live";
  const finished = match.status === "finished";
  const Icon = live ? Radio : finished ? Trophy : CalendarDays;

  return (
    <section className="club-section py-10">
      <div className="club-container">
        <a
          href={`/match-center/${match.id}`}
          className="club-card block overflow-hidden transition hover:border-club-light-red/30"
        >
          <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-gradient-to-r from-club-burgundy/65 to-transparent px-5 py-4">
            <div className="flex items-center gap-2">
              <Icon size={17} className="text-club-light-red" aria-hidden="true" />
              <p className="text-xs font-black uppercase tracking-[0.2em] text-white">
                {live ? "Live Match-Center" : finished ? "Letztes Match-Center" : "Nächstes Match-Center"}
              </p>
            </div>
            <span className="rounded-full border border-club-light-red/25 bg-club-red/10 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-club-light-red">
              {live ? `${match.current_minute}'` : finished ? "Beendet" : "Vorschau"}
            </span>
          </div>

          <div className="px-5 py-7">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
              <p className="text-sm font-black leading-tight text-white">{match.home_team}</p>
              <p className="text-4xl font-black tabular-nums text-white">
                {match.home_score ?? 0}
                <span className="mx-2 text-club-light-red">:</span>
                {match.away_score ?? 0}
              </p>
              <p className="text-sm font-black leading-tight text-white">{match.away_team}</p>
            </div>

            <p className="mt-5 text-center text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
              {dateFormatter.format(new Date(match.match_date))} Uhr
            </p>

            <div className="club-button-primary mt-5 w-full">Match-Center öffnen</div>
          </div>
        </a>
      </div>
    </section>
  );
}
