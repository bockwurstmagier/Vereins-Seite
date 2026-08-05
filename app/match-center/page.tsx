import { CalendarDays, Radio, Trophy } from "lucide-react";
import { getMatchCenterOverview } from "../../lib/match-center";

const dateFormatter = new Intl.DateTimeFormat("de-DE", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Berlin",
});

export default async function MatchCenterOverviewPage() {
  const matches = await getMatchCenterOverview();

  return (
    <main className="min-h-screen bg-club-black px-4 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <a href="/" className="club-eyebrow">Zurück zur Startseite</a>
        <h1 className="club-heading mt-4">Match-Center</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
          Live-Spielstände, Aufstellungen, Ereignisse und Spielberichte an einem Ort.
        </p>

        {!matches.length ? (
          <div className="club-card mt-8 p-6 text-sm text-zinc-400">
            Aktuell sind noch keine Spiele vorhanden.
          </div>
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {matches.map((match) => {
              const Icon = match.status === "live" ? Radio : match.status === "finished" ? Trophy : CalendarDays;
              return (
                <a key={match.id} href={`/match-center/${match.id}`} className="club-card p-5 transition hover:-translate-y-1 hover:border-club-light-red/25">
                  <div className="flex items-start justify-between gap-4">
                    <div className="club-icon-box"><Icon size={19} aria-hidden="true" /></div>
                    <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-zinc-400">
                      {match.status === "live" ? `Live · ${match.current_minute}'` : match.status === "finished" ? "Beendet" : "Geplant"}
                    </span>
                  </div>

                  <p className="mt-5 text-[10px] font-black uppercase tracking-[0.18em] text-club-light-red">
                    {match.competition} · {match.matchday || "Spieltag"}
                  </p>
                  <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
                    <p className="text-sm font-black leading-tight">{match.home_team}</p>
                    <p className="text-3xl font-black tabular-nums">
                      {match.home_score ?? 0}<span className="mx-2 text-club-light-red">:</span>{match.away_score ?? 0}
                    </p>
                    <p className="text-sm font-black leading-tight">{match.away_team}</p>
                  </div>
                  <p className="mt-5 text-center text-xs text-zinc-600">{dateFormatter.format(new Date(match.match_date))} Uhr</p>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
