"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Flame, Minus, Plus, Radio, Trophy } from "lucide-react";
import { isMiddelichResse } from "../../lib/club-name";
import type { MatchdayHubData } from "../../lib/matchday-hub";

const KEY = "huja-anonymous-device-v1";
const QUICK_SCORES = [0, 1, 2, 3, 4, 5, 6];

function deviceId() {
  let value = localStorage.getItem(KEY);
  if (!value) {
    value = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
    localStorage.setItem(KEY, value);
  }
  return value;
}

function haptic() {
  navigator.vibrate?.(12);
}

function Countdown({ date }: { date: string }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);
  const difference = Math.max(0, new Date(date).getTime() - now);
  const days = Math.floor(difference / 86400000);
  const hours = Math.floor(difference / 3600000) % 24;
  const minutes = Math.floor(difference / 60000) % 60;
  const seconds = Math.floor(difference / 1000) % 60;
  return <span className="tabular-nums">{days > 0 ? `${days}T ` : ""}{String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}</span>;
}

function ScoreSelector({ team, side, isClub, value, onChange }: {
  team: string;
  side: "Heim" | "Gast";
  isClub: boolean;
  value: number;
  onChange: (score: number) => void;
}) {
  function select(score: number) {
    haptic();
    onChange(Math.min(30, Math.max(0, score)));
  }

  return (
    <fieldset className={`rounded-2xl border p-3 ${isClub ? "border-club-light-red/50 bg-club-burgundy/25 shadow-[0_0_24px_rgba(193,18,31,0.12)]" : "border-white/10 bg-black/30"}`}>
      <legend className="sr-only">Tore für {team}</legend>
      <div className="flex min-h-12 items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">{side}</span>
            {isClub && <span className="rounded-full bg-club-red px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white">Unser Verein</span>}
          </div>
          <p className={`mt-1 truncate text-sm font-black ${isClub ? "text-white" : "text-zinc-300"}`}>{isClub ? "Middelich-Resse" : team}</p>
        </div>
        <span className="text-4xl font-black tabular-nums text-white" aria-live="polite">{value}</span>
      </div>

      <div className="mt-3 grid grid-cols-[minmax(3.5rem,1fr)_minmax(4rem,1.2fr)_minmax(3.5rem,1fr)] gap-2">
        <button type="button" onClick={() => select(value - 1)} disabled={value === 0} aria-label={`Ein Tor weniger für ${team}`} className="flex min-h-14 items-center justify-center rounded-xl border border-white/15 bg-white/[0.06] text-white transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-30">
          <Minus aria-hidden="true" />
        </button>
        <div className="flex min-h-14 items-center justify-center rounded-xl bg-black/40 text-3xl font-black tabular-nums text-white">{value}</div>
        <button type="button" onClick={() => select(value + 1)} disabled={value === 30} aria-label={`Ein Tor mehr für ${team}`} className="flex min-h-14 items-center justify-center rounded-xl border border-club-light-red/30 bg-club-red/15 text-club-light-red transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-30">
          <Plus aria-hidden="true" />
        </button>
      </div>

      <div className="mt-2 grid grid-cols-7 gap-1.5" aria-label={`Schnellauswahl für ${team}`}>
        {QUICK_SCORES.map((score) => (
          <button type="button" key={score} onClick={() => select(score)} aria-label={`${score} Tore für ${team}`} aria-pressed={value === score} className={`min-h-11 rounded-xl text-sm font-black tabular-nums transition active:scale-95 ${value === score ? "bg-club-red text-white shadow-[0_0_16px_rgba(193,18,31,0.3)]" : "border border-white/10 bg-white/[0.04] text-zinc-300"}`}>
            {score}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export default function MatchdayHubClient({ data }: { data: MatchdayHubData }) {
  const { match } = data;
  const [home, setHome] = useState(1);
  const [away, setAway] = useState(1);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [counts, setCounts] = useState(data.reactions);
  const phase = match.status;
  const total = useMemo(() => Object.values(counts).reduce((a, b) => a + b, 0), [counts]);
  const clubIsHome = isMiddelichResse(match.home_team);
  const clubScore = clubIsHome ? home : away;
  const opponentScore = clubIsHome ? away : home;
  const opponent = clubIsHome ? match.away_team : match.home_team;

  async function tip() {
    setBusy(true);
    setSaved(false);
    setMessage("");
    try {
      const response = await fetch("/api/matchday/predict", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ matchId: match.id, deviceId: deviceId(), displayName: name, homeScore: home, awayScore: away }),
      });
      const payload = await response.json();
      if (response.ok) {
        haptic();
        setSaved(true);
        setMessage(`✅ Dein Tipp: Middelich ${clubScore}:${opponentScore} ${opponent}`);
      } else {
        setMessage(payload.error);
      }
    } catch {
      setMessage("Tipp konnte nicht gespeichert werden.");
    } finally {
      setBusy(false);
    }
  }

  async function react(reaction: string) {
    const response = await fetch("/api/matchday/react", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ matchId: match.id, deviceId: deviceId(), reaction }),
    });
    const payload = await response.json();
    if (response.ok) setCounts(payload.counts);
    else setMessage(payload.error);
  }

  return (
    <section className="club-section py-8">
      <div className="club-container">
        <div className="club-card overflow-hidden border-club-light-red/20">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-gradient-to-r from-club-burgundy/80 to-transparent px-5 py-4">
            <div><p className="club-eyebrow">HUJA Matchday Hub</p><h2 className="mt-1 text-xl font-black uppercase text-white">{phase === "live" ? "🔴 Jetzt Live" : phase === "finished" ? "Abpfiff" : "Der Spieltag kommt"}</h2></div>
            {phase === "live" ? <Radio className="animate-pulse text-red-400" /> : <Flame className="text-club-light-red" />}
          </div>
          <div className="p-5 sm:p-7">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
              <p className="font-black text-white">{match.home_team}</p>
              <div><p className="text-4xl font-black text-white">{phase === "scheduled" ? "VS" : `${match.home_score ?? 0}:${match.away_score ?? 0}`}</p>{phase === "scheduled" && <p className="mt-2 text-xs font-bold text-club-light-red"><Countdown date={match.match_date} /></p>}</div>
              <p className="font-black text-white">{match.away_team}</p>
            </div>

            {phase === "scheduled" && (
              <div className="mt-7 rounded-2xl border border-white/10 bg-black/25 p-4">
                <p className="text-sm font-black uppercase text-white">⚽ Ergebnis tippen</p>
                <p className="mt-1 text-xs text-zinc-500">Zahlen antippen – keine Tastatur nötig.</p>
                <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Dein Fan-Name (optional)" maxLength={30} className="mt-4 min-h-14 w-full rounded-xl border border-white/10 bg-black/40 px-4 text-white outline-none placeholder:text-zinc-600 focus:border-club-light-red/40 focus:ring-2 focus:ring-club-red/15" />
                <div className="mt-3 grid gap-3">
                  <ScoreSelector team={match.home_team} side="Heim" isClub={clubIsHome} value={home} onChange={setHome} />
                  <ScoreSelector team={match.away_team} side="Gast" isClub={!clubIsHome} value={away} onChange={setAway} />
                </div>
                <button type="button" onClick={tip} disabled={busy} className="club-button-primary mt-4 w-full disabled:cursor-wait disabled:opacity-60">{busy ? "Speichert …" : "🔥 Tipp abgeben"}</button>
                {message && (
                  <div role="status" aria-live="polite" className={`mt-4 flex items-start gap-2 rounded-xl border px-3 py-3 text-sm font-bold ${saved ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300" : "border-club-light-red/25 bg-club-red/10 text-club-light-red"}`}>
                    {saved && <CheckCircle2 className="mt-0.5 shrink-0" size={17} aria-hidden="true" />}<span>{message}</span>
                  </div>
                )}
                <p className="mt-3 text-xs text-zinc-500">5 Punkte exaktes Ergebnis · 2 Punkte richtige Tendenz · {data.predictionCount} Tipps</p>
              </div>
            )}

            {phase === "live" && (
              <div className="mt-7">
                <a href={`/match-center/${match.id}`} className="club-button-primary w-full">🔴 LiveCenter öffnen</a>
                <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4">
                  <p className="text-sm font-black uppercase text-white">Live-Reaktionen</p>
                  <div className="mt-3 flex flex-wrap gap-2">{["🔥", "❤️", "👏", "⚽"].map((reaction) => <button key={reaction} onClick={() => react(reaction)} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-lg">{reaction} <span className="text-xs text-zinc-400">{counts[reaction] ?? 0}</span></button>)}</div>
                  <p className="mt-2 text-xs text-zinc-500">{total} Reaktionen</p>
                </div>
              </div>
            )}

            {phase === "finished" && <div className="mt-7 text-center"><Trophy className="mx-auto text-club-light-red" /><p className="mt-3 font-black uppercase text-white">Spiel beendet</p><p className="mt-2 text-sm text-zinc-400">Das nächste Spiel wird angezeigt, sobald es im Spielplan angesetzt ist.</p></div>}
            {phase !== "scheduled" && message && <p className="mt-4 text-sm font-bold text-club-light-red">{message}</p>}
            {data.leaderboard.length > 0 && (
              <div className="mt-7 border-t border-white/10 pt-5"><p className="text-xs font-black uppercase tracking-wider text-zinc-400">🏆 HUJA Tipprangliste</p><div className="mt-3 space-y-2">{data.leaderboard.map((entry, index) => <div key={`${entry.name}-${index}`} className="flex justify-between rounded-xl bg-white/[0.04] px-3 py-2 text-sm"><span className="font-bold text-white">{index + 1}. {entry.name}</span><span className="font-black text-club-light-red">{entry.points} Pkt.</span></div>)}</div></div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
