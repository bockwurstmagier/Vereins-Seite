"use client";

import { CheckCircle2, Trophy } from "lucide-react";
import { useMemo, useState } from "react";
import type { FanPollView } from "../../lib/fan-experience";

const STORAGE_KEY = "huja-anonymous-device-v1";

function getDeviceId() {
  let value = window.localStorage.getItem(STORAGE_KEY);
  if (!value) {
    value = typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem(STORAGE_KEY, value);
  }
  return value;
}

export default function PlayerOfMatchVoteCard({ poll }: { poll: FanPollView }) {
  const [selected, setSelected] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [voted, setVoted] = useState(false);
  const [counts, setCounts] = useState<Record<string, number>>(
    Object.fromEntries(poll.candidates.map((candidate) => [candidate.playerId, candidate.votes])),
  );

  const totalVotes = useMemo(
    () => Object.values(counts).reduce<number>((sum, value) => sum + Number(value), 0),
    [counts],
  );
  const winner = poll.candidates.find((candidate) => candidate.playerId === poll.winnerPlayerId);

  async function vote() {
    if (!selected || busy) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/fan-vote", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ pollId: poll.id, candidateId: selected, deviceId: getDeviceId() }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Abstimmung fehlgeschlagen.");
      setCounts(payload.counts ?? counts);
      setVoted(true);
      setMessage("Deine Stimme wurde gezählt. HUJA!");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Abstimmung fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="club-card mx-auto mt-8 max-w-5xl overflow-hidden p-5 sm:p-7">
      <div className="flex items-center gap-3">
        <div className="club-icon-box"><Trophy size={20} /></div>
        <div>
          <p className="club-eyebrow">Fan-Voting</p>
          <h2 className="mt-1 text-2xl font-black uppercase text-white">Spieler des Spiels</h2>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-zinc-400">
        {poll.homeTeam} {poll.homeScore ?? "-"}:{poll.awayScore ?? "-"} {poll.awayTeam}
      </p>

      {poll.status === "closed" ? (
        <div className="mt-6 rounded-[1.75rem] border border-club-light-red/25 bg-club-red/10 p-5 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-club-light-red">Abstimmung beendet</p>
          <p className="mt-3 text-2xl font-black uppercase text-white">
            {winner ? `${winner.firstName} ${winner.lastName}` : "Ergebnis wird ausgewertet"}
          </p>
          <p className="mt-2 text-sm text-zinc-400">{totalVotes} abgegebene Stimmen</p>
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {poll.candidates.map((candidate) => (
              <button
                key={candidate.playerId}
                type="button"
                onClick={() => setSelected(candidate.playerId)}
                disabled={voted}
                className={`rounded-2xl border p-4 text-left transition ${selected === candidate.playerId ? "border-club-light-red bg-club-red/15" : "border-white/10 bg-black/25 hover:border-club-light-red/25"}`}
              >
                <div className="flex items-center gap-3">
                  {candidate.imageUrl ? (
                    <img src={candidate.imageUrl} alt="" className="h-14 w-14 rounded-2xl object-cover" />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-xl font-black text-zinc-600">{candidate.shirtNumber ?? "–"}</div>
                  )}
                  <div>
                    <p className="font-black text-white">{candidate.firstName} {candidate.lastName}</p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">#{candidate.shirtNumber ?? "–"}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-zinc-500">Abstimmung bis {new Date(poll.endsAt).toLocaleString("de-DE", { dateStyle: "short", timeStyle: "short" })} Uhr</p>
            <button type="button" onClick={vote} disabled={!selected || busy || voted} className="club-button-primary disabled:cursor-not-allowed disabled:opacity-40">
              {voted ? <CheckCircle2 size={17} /> : <Trophy size={17} />}
              {voted ? "Stimme abgegeben" : busy ? "Wird gespeichert …" : "Jetzt abstimmen"}
            </button>
          </div>
          {message && <p className="mt-3 text-sm font-bold text-club-light-red">{message}</p>}
        </>
      )}
    </section>
  );
}
