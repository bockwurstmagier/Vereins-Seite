import { Trophy } from "lucide-react";
import type { StandingRow } from "../../lib/sport-center";

export default function StandingsTable({
  rows,
  compact = false,
}: {
  rows: StandingRow[];
  compact?: boolean;
}) {
  const visibleRows = compact ? rows.slice(0, 6) : rows;

  if (!visibleRows.length) {
    return (
      <div className="club-card p-6 text-sm leading-6 text-zinc-400">
        Noch keine Tabellendaten eingetragen. Im Adminbereich unter
        „Tabelle“ kannst du die Kreisliga-Tabelle pflegen.
      </div>
    );
  }

  return (
    <div className="club-card overflow-hidden">
      <div className="grid grid-cols-[44px_1fr_42px_54px_44px] border-b border-white/10 bg-white/[0.035] px-3 py-3 text-[9px] font-black uppercase tracking-[0.14em] text-zinc-500 sm:grid-cols-[50px_1fr_48px_70px_52px]">
        <span className="text-center">Pos.</span>
        <span>Verein</span>
        <span className="text-center">Sp.</span>
        <span className="text-center">Tore</span>
        <span className="text-center">Pkt.</span>
      </div>

      {visibleRows.map((row) => {
        const difference = row.goals_for - row.goals_against;

        return (
          <div
            key={row.id}
            className={`relative grid grid-cols-[44px_1fr_42px_54px_44px] items-center border-b border-white/[0.07] px-3 py-4 last:border-b-0 sm:grid-cols-[50px_1fr_48px_70px_52px] ${
              row.is_club
                ? "bg-gradient-to-r from-club-red/25 via-club-red/10 to-transparent"
                : ""
            }`}
          >
            {row.is_club && (
              <span className="absolute inset-y-0 left-0 w-1 bg-club-light-red shadow-[0_0_18px_rgba(239,51,64,0.9)]" />
            )}

            <div className="text-center">
              <span
                className={`inline-flex h-8 w-8 items-center justify-center rounded-xl text-sm font-black ${
                  row.position === 1
                    ? "bg-club-red text-white"
                    : row.is_club
                      ? "bg-club-red/20 text-club-light-red"
                      : "bg-white/[0.05] text-zinc-400"
                }`}
              >
                {row.position === 1 ? (
                  <Trophy size={15} aria-label="Tabellenführer" />
                ) : (
                  row.position
                )}
              </span>
            </div>

            <div className="min-w-0 pr-2">
              <p className="truncate text-sm font-black text-zinc-100">
                {row.team_name}
              </p>
              <div className="mt-1 flex items-center gap-2">
                {row.is_club && (
                  <span className="text-[8px] font-black uppercase tracking-[0.14em] text-club-light-red">
                    Unser Verein
                  </span>
                )}
                {!compact && row.form?.length > 0 && (
                  <div className="flex gap-1">
                    {row.form.slice(-5).map((result, index) => (
                      <span
                        key={`${row.id}-${index}`}
                        className={`flex h-4 w-4 items-center justify-center rounded-full text-[7px] font-black ${
                          result === "W"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : result === "D"
                              ? "bg-amber-500/20 text-amber-300"
                              : "bg-red-500/20 text-red-300"
                        }`}
                      >
                        {result}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <p className="text-center text-sm font-bold tabular-nums text-zinc-400">
              {row.played}
            </p>
            <div className="text-center">
              <p className="text-xs font-bold tabular-nums text-zinc-300">
                {row.goals_for}:{row.goals_against}
              </p>
              <p
                className={`mt-0.5 text-[9px] font-bold tabular-nums ${
                  difference > 0
                    ? "text-emerald-400"
                    : difference < 0
                      ? "text-red-400"
                      : "text-zinc-600"
                }`}
              >
                {difference > 0 ? "+" : ""}
                {difference}
              </p>
            </div>
            <p className="text-center text-sm font-black tabular-nums text-white">
              {row.points}
            </p>
          </div>
        );
      })}
    </div>
  );
}
