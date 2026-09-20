import type { PlayerLiveStatus } from "../../lib/lineup-events";

export default function PlayerEventBadges({ status }: { status?: PlayerLiveStatus }) {
  if (!status) return null;
  const badge = "inline-flex items-center gap-0.5 rounded bg-black/90 px-1 py-0.5 text-[10px] font-black leading-3 text-white shadow";
  const yellowRed = status.yellowCards >= 2;
  return (
    <span className="pointer-events-none mt-0.5 inline-flex max-w-20 flex-wrap justify-center gap-0.5">
      {status.goals > 0 && <span className={badge} title={`${status.goals} Tor${status.goals === 1 ? "" : "e"}`} aria-label={`${status.goals} Tor${status.goals === 1 ? "" : "e"}`}><span aria-hidden="true">⚽{status.goals > 1 ? ` ×${status.goals}` : ""}</span></span>}
      {status.yellowCards > 0 && <span className={badge} title={yellowRed ? "Gelb-Rot (zweite gelbe Karte)" : "Gelbe Karte"} aria-label={yellowRed ? "Gelb-Rot (zweite gelbe Karte)" : "Gelbe Karte"}><span aria-hidden="true">{yellowRed ? "🟨🟥" : "🟨"}</span></span>}
      {status.redCards > 0 && !yellowRed && <span className={badge} title="Rote Karte" aria-label="Rote Karte"><span aria-hidden="true">🟥</span></span>}
      {status.substitution && <span className={badge} title={status.substitution === "in" ? "Eingewechselt" : "Ausgewechselt"} aria-label={status.substitution === "in" ? "Eingewechselt" : "Ausgewechselt"}><span aria-hidden="true" className={status.substitution === "in" ? "text-emerald-300" : "text-orange-300"}>{status.substitution === "in" ? "↗" : "↙"}</span></span>}
    </span>
  );
}
