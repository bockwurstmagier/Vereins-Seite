"use client";

import { useMemo, useRef, useState } from "react";
import { Move, Radio, Save, Shield, UserMinus, UserPlus, Users } from "lucide-react";

import { saveTacticalLineup } from "../../app/admin/match-center/actions";
import type { MatchCenterPlayer, MatchSquadEntry } from "../../lib/match-center";

type FormationEditorProps = {
  matchId: string;
  players: MatchCenterPlayer[];
  initialSquad: MatchSquadEntry[];
  initialFormation: string;
};

type LineupPlayer = {
  playerId: string;
  role: "starter" | "bench";
  x: number | null;
  y: number | null;
  positionLabel: string | null;
  sortOrder: number;
};

type Position = { x: number; y: number; label: string };

const FORMATIONS: Record<string, Position[]> = {
  "4-4-2": [
    { x: 50, y: 90, label: "TW" },
    { x: 14, y: 72, label: "LV" }, { x: 38, y: 76, label: "IV" }, { x: 62, y: 76, label: "IV" }, { x: 86, y: 72, label: "RV" },
    { x: 14, y: 48, label: "LM" }, { x: 38, y: 52, label: "ZM" }, { x: 62, y: 52, label: "ZM" }, { x: 86, y: 48, label: "RM" },
    { x: 36, y: 22, label: "ST" }, { x: 64, y: 22, label: "ST" },
  ],
  "4-3-3": [
    { x: 50, y: 90, label: "TW" },
    { x: 14, y: 72, label: "LV" }, { x: 38, y: 76, label: "IV" }, { x: 62, y: 76, label: "IV" }, { x: 86, y: 72, label: "RV" },
    { x: 28, y: 50, label: "ZM" }, { x: 50, y: 56, label: "ZM" }, { x: 72, y: 50, label: "ZM" },
    { x: 16, y: 24, label: "LA" }, { x: 50, y: 18, label: "ST" }, { x: 84, y: 24, label: "RA" },
  ],
  "4-2-3-1": [
    { x: 50, y: 90, label: "TW" },
    { x: 14, y: 72, label: "LV" }, { x: 38, y: 76, label: "IV" }, { x: 62, y: 76, label: "IV" }, { x: 86, y: 72, label: "RV" },
    { x: 38, y: 58, label: "DM" }, { x: 62, y: 58, label: "DM" },
    { x: 18, y: 38, label: "LM" }, { x: 50, y: 42, label: "OM" }, { x: 82, y: 38, label: "RM" },
    { x: 50, y: 18, label: "ST" },
  ],
  "3-5-2": [
    { x: 50, y: 90, label: "TW" },
    { x: 25, y: 74, label: "IV" }, { x: 50, y: 78, label: "IV" }, { x: 75, y: 74, label: "IV" },
    { x: 10, y: 50, label: "LM" }, { x: 32, y: 56, label: "ZM" }, { x: 50, y: 48, label: "ZM" }, { x: 68, y: 56, label: "ZM" }, { x: 90, y: 50, label: "RM" },
    { x: 36, y: 22, label: "ST" }, { x: 64, y: 22, label: "ST" },
  ],
  "3-4-3": [
    { x: 50, y: 90, label: "TW" },
    { x: 25, y: 74, label: "IV" }, { x: 50, y: 78, label: "IV" }, { x: 75, y: 74, label: "IV" },
    { x: 12, y: 50, label: "LM" }, { x: 38, y: 54, label: "ZM" }, { x: 62, y: 54, label: "ZM" }, { x: 88, y: 50, label: "RM" },
    { x: 16, y: 24, label: "LA" }, { x: 50, y: 18, label: "ST" }, { x: 84, y: 24, label: "RA" },
  ],
};

function clamp(value: number, min = 5, max = 95) {
  return Math.min(max, Math.max(min, value));
}

export default function FormationEditor({ matchId, players, initialSquad, initialFormation }: FormationEditorProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [formation, setFormation] = useState(FORMATIONS[initialFormation] ? initialFormation : "4-4-2");
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [lineup, setLineup] = useState<LineupPlayer[]>(() => {
    const preset = FORMATIONS[FORMATIONS[initialFormation] ? initialFormation : "4-4-2"];
    return initialSquad.map((entry, index) => ({
      playerId: entry.player_id,
      role: entry.role,
      x: entry.role === "starter" ? (entry.pitch_x ?? preset[index]?.x ?? 50) : null,
      y: entry.role === "starter" ? (entry.pitch_y ?? preset[index]?.y ?? 50) : null,
      positionLabel: entry.position_label ?? (entry.role === "starter" ? preset[index]?.label ?? null : null),
      sortOrder: entry.sort_order,
    }));
  });

  const playerMap = useMemo(() => new Map(players.map((player) => [player.id, player])), [players]);
  const starters = lineup.filter((entry) => entry.role === "starter").sort((a, b) => a.sortOrder - b.sortOrder);
  const bench = lineup.filter((entry) => entry.role === "bench").sort((a, b) => a.sortOrder - b.sortOrder);
  const assignedIds = new Set(lineup.map((entry) => entry.playerId));
  const available = players.filter((player) => !assignedIds.has(player.id));
  const selected = selectedPlayerId ? playerMap.get(selectedPlayerId) : null;

  function applyFormation(nextFormation: string) {
    setFormation(nextFormation);
    const positions = FORMATIONS[nextFormation];
    setLineup((current) => current.map((entry) => {
      if (entry.role !== "starter") return entry;
      const index = current.filter((item) => item.role === "starter").sort((a, b) => a.sortOrder - b.sortOrder).findIndex((item) => item.playerId === entry.playerId);
      const position = positions[index];
      return position ? { ...entry, x: position.x, y: position.y, positionLabel: position.label, sortOrder: index } : entry;
    }));
  }

  function addStarter(playerId: string) {
    if (starters.length >= 11) return;
    const position = FORMATIONS[formation][starters.length];
    setLineup((current) => [
      ...current.filter((entry) => entry.playerId !== playerId),
      { playerId, role: "starter", x: position?.x ?? 50, y: position?.y ?? 50, positionLabel: position?.label ?? null, sortOrder: starters.length },
    ]);
    setSelectedPlayerId(playerId);
  }

  function addBench(playerId: string) {
    setLineup((current) => [
      ...current.filter((entry) => entry.playerId !== playerId),
      { playerId, role: "bench", x: null, y: null, positionLabel: null, sortOrder: current.filter((entry) => entry.role === "bench").length },
    ]);
    setSelectedPlayerId(playerId);
  }

  function removePlayer(playerId: string) {
    setLineup((current) => current.filter((entry) => entry.playerId !== playerId));
    setSelectedPlayerId(null);
  }

  function movePlayer(event: React.PointerEvent<HTMLButtonElement>, playerId: string) {
    if (draggingId !== playerId || !boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const x = clamp(((event.clientX - rect.left) / rect.width) * 100);
    const y = clamp(((event.clientY - rect.top) / rect.height) * 100);
    setLineup((current) => current.map((entry) => entry.playerId === playerId ? { ...entry, x, y } : entry));
  }

  return (
    <section className="club-card relative z-0 mt-8 overflow-hidden">
      <div className="border-b border-white/10 p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="club-icon-box"><Shield size={19} aria-hidden="true" /></div>
            <div><p className="club-eyebrow">MatchCenter Pro</p><h2 className="mt-1 text-xl font-black uppercase">Interaktive Aufstellung</h2></div>
          </div>
          <div className="flex flex-wrap gap-2">
            <select value={formation} onChange={(event) => applyFormation(event.target.value)} className="admin-input min-w-36">
              {Object.keys(FORMATIONS).map((name) => <option key={name}>{name}</option>)}
            </select>
            <a href={`/admin/live/${matchId}`} className="club-button-secondary"><Radio size={17} /> Live-Aktionen</a>
          </div>
        </div>
        <p className="mt-3 text-sm leading-6 text-zinc-500">Spieler antippen, zur Startelf oder Bank hinzufügen und auf dem Feld mit dem Finger verschieben.</p>
      </div>

      <form action={saveTacticalLineup} className="grid gap-0 xl:grid-cols-[1fr_22rem]">
        <input type="hidden" name="match_id" value={matchId} />
        <input type="hidden" name="formation" value={formation} />
        <input type="hidden" name="lineup_json" value={JSON.stringify(lineup)} />

        <div className="p-4 sm:p-6">
          <div ref={boardRef} className="relative mx-auto aspect-[2/3] w-full max-w-[34rem] overflow-hidden rounded-[2rem] border-2 border-white/20 bg-[linear-gradient(90deg,rgba(255,255,255,.035)_50%,transparent_50%),linear-gradient(rgba(255,255,255,.035)_50%,transparent_50%)] bg-[length:12%_12%] shadow-inner touch-none">
            <div className="absolute inset-3 rounded-[1.5rem] border-2 border-white/40" />
            <div className="absolute left-3 right-3 top-1/2 border-t-2 border-white/40" />
            <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/40" />
            <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60" />
            <div className="absolute left-1/2 top-3 h-20 w-40 -translate-x-1/2 border-2 border-t-0 border-white/40" />
            <div className="absolute bottom-3 left-1/2 h-20 w-40 -translate-x-1/2 border-2 border-b-0 border-white/40" />

            {starters.map((entry) => {
              const player = playerMap.get(entry.playerId);
              if (!player) return null;
              return (
                <button
                  key={entry.playerId}
                  type="button"
                  onPointerDown={(event) => { setDraggingId(entry.playerId); setSelectedPlayerId(entry.playerId); event.currentTarget.setPointerCapture(event.pointerId); }}
                  onPointerMove={(event) => movePlayer(event, entry.playerId)}
                  onPointerUp={() => setDraggingId(null)}
                  onPointerCancel={() => setDraggingId(null)}
                  className={`absolute z-10 flex w-20 -translate-x-1/2 -translate-y-1/2 flex-col items-center transition ${selectedPlayerId === entry.playerId ? "scale-110" : ""}`}
                  style={{ left: `${entry.x ?? 50}%`, top: `${entry.y ?? 50}%` }}
                >
                  <span className={`flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 bg-club-red text-sm font-black text-white shadow-xl ${selectedPlayerId === entry.playerId ? "border-white" : "border-club-light-red/60"}`}>
                    {player.image_url ? <img src={player.image_url} alt="" className="h-full w-full object-cover" draggable={false} /> : player.shirt_number ?? "?"}
                  </span>
                  <span className="mt-1 max-w-20 truncate rounded-lg bg-black/75 px-2 py-1 text-[9px] font-black text-white backdrop-blur">{player.last_name}</span>
                  <span className="mt-0.5 text-[8px] font-black text-white/70">{entry.positionLabel}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-zinc-500"><Move size={14} /> Spieler mit Finger oder Maus verschieben</div>
        </div>

        <aside className="border-t border-white/10 bg-black/20 p-4 sm:p-6 xl:border-l xl:border-t-0">
          <div className="flex items-center justify-between"><p className="club-eyebrow">Kader</p><span className="text-xs font-black text-zinc-500">{starters.length}/11</span></div>

          {selected && (
            <div className="mt-4 rounded-3xl border border-club-light-red/20 bg-club-red/10 p-4">
              <p className="text-lg font-black text-white">{selected.first_name} {selected.last_name}</p>
              <p className="mt-1 text-xs text-zinc-400">{selected.position}{selected.shirt_number !== null ? ` · #${selected.shirt_number}` : ""}</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button type="button" onClick={() => addStarter(selected.id)} disabled={starters.length >= 11 && !starters.some((entry) => entry.playerId === selected.id)} className="rounded-xl bg-club-red px-3 py-2 text-[10px] font-black uppercase disabled:opacity-40"><UserPlus size={14} className="mx-auto mb-1" />Startelf</button>
                <button type="button" onClick={() => addBench(selected.id)} className="rounded-xl border border-white/10 px-3 py-2 text-[10px] font-black uppercase"><Users size={14} className="mx-auto mb-1" />Bank</button>
                <button type="button" onClick={() => removePlayer(selected.id)} className="col-span-2 rounded-xl border border-red-500/20 bg-red-950/25 px-3 py-2 text-[10px] font-black uppercase text-red-300"><UserMinus size={14} className="mr-1 inline" />Aus Kader entfernen</button>
              </div>
            </div>
          )}

          <p className="mt-5 text-xs font-black uppercase tracking-wider text-zinc-500">Ersatzbank</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {bench.length ? bench.map((entry) => { const player = playerMap.get(entry.playerId); return player ? <button key={entry.playerId} type="button" onClick={() => setSelectedPlayerId(entry.playerId)} className={`rounded-xl border px-3 py-2 text-xs font-bold ${selectedPlayerId === entry.playerId ? "border-club-light-red/40 bg-club-red/15 text-white" : "border-white/10 text-zinc-300"}`}>{player.shirt_number !== null ? `#${player.shirt_number} ` : ""}{player.last_name}</button> : null; }) : <p className="text-xs text-zinc-600">Noch niemand auf der Bank.</p>}
          </div>

          <p className="mt-5 text-xs font-black uppercase tracking-wider text-zinc-500">Verfügbare Spieler</p>
          <div className="mt-3 max-h-72 space-y-2 overflow-y-auto pr-1">
            {available.map((player) => (
              <button key={player.id} type="button" onClick={() => setSelectedPlayerId(player.id)} className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left ${selectedPlayerId === player.id ? "border-club-light-red/35 bg-club-red/10" : "border-white/[0.08] bg-black/20"}`}>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-club-red/20 text-xs font-black">{player.image_url ? <img src={player.image_url} alt="" className="h-full w-full object-cover" /> : player.shirt_number ?? "?"}</span>
                <span className="min-w-0"><span className="block truncate text-sm font-black text-white">{player.first_name} {player.last_name}</span><span className="block text-[10px] text-zinc-500">{player.position}</span></span>
              </button>
            ))}
          </div>

          <button type="submit" className="club-button-primary mt-5 w-full"><Save size={18} /> Aufstellung speichern</button>
        </aside>
      </form>
    </section>
  );
}
