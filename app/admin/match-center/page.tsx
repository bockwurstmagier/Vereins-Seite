import { CalendarDays, Radio, Trophy } from "lucide-react";
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

export default async function AdminMatchCenterPage() {
  const matches = await getMatchCenterOverview();

  return (
    <div className="mx-auto max-w-6xl">
      <div>
        <p className="club-eyebrow">Vereinsmanager</p>
        <h1 className="club-heading mt-2">Match-Center</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
          Verwalte Spielstand, Status, Aufstellung, Ereignisse, Spieler des Spiels
          und den Spielbericht.
        </p>
      </div>

      {!matches.length ? (
        <div className="club-card mt-8 p-6 text-sm text-zinc-400">
          Lege zuerst unter „Spiele“ ein Spiel an.
        </div>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {matches.map((match) => (
            <a
              key={match.id}
              href={`/admin/match-center/${match.id}`}
              className="club-card group p-5 transition hover:-translate-y-1 hover:border-club-light-red/30"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="club-icon-box">
                  {match.status === "live" ? (
                    <Radio size={20} aria-hidden="true" />
                  ) : match.status === "finished" ? (
                    <Trophy size={20} aria-hidden="true" />
                  ) : (
                    <CalendarDays size={20} aria-hidden="true" />
                  )}
                </div>

                <StatusBadge status={match.status} minute={match.current_minute} />
              </div>

              <p className="mt-5 text-[10px] font-black uppercase tracking-[0.18em] text-club-light-red">
                {match.competition} · {match.matchday || "Spieltag"}
              </p>

              <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
                <p className="text-sm font-black leading-tight text-white">{match.home_team}</p>
                <p className="text-3xl font-black tabular-nums text-white">
                  {match.home_score ?? 0}
                  <span className="mx-2 text-club-light-red">:</span>
                  {match.away_score ?? 0}
                </p>
                <p className="text-sm font-black leading-tight text-white">{match.away_team}</p>
              </div>

              <p className="mt-5 text-center text-xs font-bold uppercase tracking-wider text-zinc-600">
                {dateFormatter.format(new Date(match.match_date))}
              </p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status, minute }: { status: string; minute: number }) {
  const classes =
    status === "live"
      ? "border-red-500/25 bg-red-950/40 text-red-300"
      : status === "finished"
        ? "border-emerald-500/20 bg-emerald-950/30 text-emerald-300"
        : "border-white/10 bg-white/[0.04] text-zinc-400";

  return (
    <span className={`rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-wider ${classes}`}>
      {status === "live" ? `Live · ${minute}'` : status === "finished" ? "Beendet" : "Geplant"}
    </span>
  );
}
