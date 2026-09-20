"use client";

import type { MatchCenterEvent, MatchCenterPlayer, MatchSquadEntry } from "../../lib/match-center";
import { summarizeLineupEvents } from "../../lib/lineup-events";
import PlayerEventBadges from "./PlayerEventBadges";

type Props = { entries: MatchSquadEntry[]; players: MatchCenterPlayer[]; events: MatchCenterEvent[]; formation?: string | null };

export default function FormationDisplay({ entries, players, events, formation }: Props) {
  const statuses = summarizeLineupEvents(events);
  const map = new Map(players.map((player) => [player.id, player]));
  const starters = entries.filter((entry) => entry.role === "starter");
  const bench = entries.filter((entry) => entry.role === "bench");
  if (!starters.length) return null;

  return (
    <section className="club-card p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3"><div><p className="club-eyebrow">Aufstellung</p><h2 className="mt-1 text-xl font-black uppercase">{formation || "Startelf"}</h2></div><span className="rounded-full border border-white/10 px-3 py-1 text-[9px] font-black uppercase text-zinc-400">{starters.length} Spieler</span></div>
      <div className="relative mx-auto mt-5 aspect-[2/3] w-full max-w-[28rem] overflow-hidden rounded-[2rem] border-2 border-white/15 bg-[linear-gradient(90deg,rgba(255,255,255,.03)_50%,transparent_50%),linear-gradient(rgba(255,255,255,.03)_50%,transparent_50%)] bg-[length:12%_12%]">
        <div className="absolute inset-3 rounded-[1.5rem] border-2 border-white/30" /><div className="absolute left-3 right-3 top-1/2 border-t-2 border-white/30" /><div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/30" />
        {starters.map((entry, index) => {
          const player=map.get(entry.player_id); if(!player) return null;
          return <div key={entry.id || `${entry.player_id}-${index}`} className="absolute flex w-16 -translate-x-1/2 -translate-y-1/2 flex-col items-center" style={{left:`clamp(2rem, ${entry.pitch_x ?? 50}%, calc(100% - 2rem))`,top:`clamp(3rem, ${entry.pitch_y ?? 50}%, calc(100% - 3rem))`}}><span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-club-light-red/60 bg-club-red text-xs font-black shadow-xl">{player.image_url?<img src={player.image_url} alt="" className="h-full w-full object-cover"/>:player.shirt_number??"?"}</span><span className="mt-1 max-w-16 truncate rounded-md bg-black/75 px-1.5 py-0.5 text-[8px] font-black">{player.last_name}</span><PlayerEventBadges status={statuses.get(player.id)} /></div>;
        })}
      </div>
      {bench.length > 0 && <div className="mt-4"><p className="text-[10px] font-black uppercase text-zinc-500">Ersatzbank</p><div className="mt-2 flex flex-wrap gap-2">{bench.map((entry) => {
        const player = map.get(entry.player_id);
        return player ? <span key={entry.player_id} className="inline-flex flex-col items-center rounded-xl border border-white/10 px-2 py-1 text-xs"><span>{player.shirt_number != null ? `#${player.shirt_number} ` : ""}{player.last_name}</span><PlayerEventBadges status={statuses.get(player.id)} /></span> : null;
      })}</div></div>}
      <p className="mt-3 text-center text-[10px] leading-5 text-zinc-400">⚽ Tore · 🟨 Gelb · 🟥 Rot · ↗ rein · ↙ raus</p>
      <p className="mt-1 text-center text-[10px] text-zinc-500">Wechsel werden markiert; die gespeicherten Positionen bleiben erhalten.</p>
    </section>
  );
}
