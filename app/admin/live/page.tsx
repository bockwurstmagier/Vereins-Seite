import { CalendarDays, ChevronRight, Radio, Smartphone } from "lucide-react";

import { requireRole } from "../../../lib/auth/roles";
import { getMatchCenterOverview } from "../../../lib/match-center";

const dateFormatter = new Intl.DateTimeFormat("de-DE", {
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Berlin",
});

export default async function MobileLiveOverviewPage() {
  await requireRole(["administrator", "trainer", "betreuer"]);
  const matches = await getMatchCenterOverview();
  const ordered = [...matches].sort((a, b) => {
    const priority = { live: 0, scheduled: 1, finished: 2 } as const;
    const statusDifference = priority[a.status] - priority[b.status];
    if (statusDifference !== 0) return statusDifference;
    return new Date(a.match_date).getTime() - new Date(b.match_date).getTime();
  });

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center gap-3">
        <div className="club-icon-box"><Smartphone size={20} aria-hidden="true" /></div>
        <div>
          <p className="club-eyebrow">Spieltagsmodus</p>
          <h1 className="club-heading mt-1">Mobile Live-Steuerung</h1>
        </div>
      </div>

      <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400">
        Wähle ein Spiel aus und steuere Minute, Spielstand, Tore, Karten und Wechsel mit großen Touch-Flächen direkt vom Spielfeldrand.
      </p>

      <div className="mt-8 space-y-4">
        {ordered.length ? ordered.map((match) => (
          <a
            key={match.id}
            href={`/admin/live/${match.id}`}
            className="club-card group block p-5 transition hover:-translate-y-0.5 hover:border-club-light-red/25"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={match.status} />
                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-600">{match.competition}</span>
                </div>
                <h2 className="mt-4 text-lg font-black leading-tight text-white">
                  {match.home_team}
                  <span className="mx-2 text-club-light-red">
                    {match.status === "scheduled" ? "vs." : `${match.home_score ?? 0}:${match.away_score ?? 0}`}
                  </span>
                  {match.away_team}
                </h2>
                <p className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
                  <CalendarDays size={14} className="text-club-light-red" aria-hidden="true" />
                  {dateFormatter.format(new Date(match.match_date))}
                </p>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-zinc-500 transition group-hover:text-club-light-red">
                <ChevronRight size={21} aria-hidden="true" />
              </div>
            </div>
          </a>
        )) : (
          <div className="club-card p-8 text-center text-sm text-zinc-500">Noch keine Spiele vorhanden.</div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: "scheduled" | "live" | "finished" }) {
  const label = status === "live" ? "Live" : status === "finished" ? "Beendet" : "Geplant";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-wider ${status === "live" ? "border-red-500/30 bg-red-950/50 text-red-300" : status === "finished" ? "border-zinc-500/20 bg-zinc-900/50 text-zinc-400" : "border-amber-500/20 bg-amber-950/30 text-amber-300"}`}>
      {status === "live" && <Radio size={11} aria-hidden="true" />}
      {label}
    </span>
  );
}
