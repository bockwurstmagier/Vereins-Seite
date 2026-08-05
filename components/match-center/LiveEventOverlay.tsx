"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Goal, RefreshCcw, ShieldAlert } from "lucide-react";

import PushNotificationControl from "./PushNotificationControl";
import type { MatchCenterEvent, MatchCenterPlayer } from "../../lib/match-center";

type Props = {
  events: MatchCenterEvent[];
  players: MatchCenterPlayer[];
  homeTeam: string;
  awayTeam: string;
  score: string;
};

export default function LiveEventOverlay({
  events,
  players,
  homeTeam,
  awayTeam,
  score,
}: Props) {
  const [visibleEvent, setVisibleEvent] =
    useState<MatchCenterEvent | null>(null);
  const previousId = useRef(events[0]?.id ?? null);
  const playerMap = useMemo(
    () =>
      new Map(
        players.map((player) => [
          player.id,
          `${player.first_name} ${player.last_name}`,
        ]),
      ),
    [players],
  );

  useEffect(() => {
    const latest = events[0];
    if (!latest || latest.id === previousId.current) return;

    previousId.current = latest.id;
    setVisibleEvent(latest);
    const timer = window.setTimeout(() => setVisibleEvent(null), 4200);

    if (
      latest.event_type === "goal" &&
      window.localStorage.getItem("huja-live-sound") === "true"
    ) {
      const audio = new Audio("/sounds/goal.wav");
      audio.volume = 0.85;
      void audio.play().catch(() => {
        // Manche Geräte blockieren Ton, bis der Nutzer die Soundtaste benutzt hat.
      });
    }

    return () => window.clearTimeout(timer);
  }, [events]);

  return (
    <>
      <PushNotificationControl />

      {visibleEvent && (
        <div className="pointer-events-none fixed inset-x-4 top-20 z-[70] mx-auto max-w-md animate-[liveEventIn_.35s_ease-out] rounded-[2rem] border border-club-light-red/30 bg-black/90 p-5 text-center shadow-[0_0_60px_rgba(220,38,38,.45)] backdrop-blur-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-club-red text-white">
            {eventIcon(visibleEvent.event_type)}
          </div>
          <p className="mt-4 text-[10px] font-black uppercase tracking-[0.25em] text-club-light-red">
            {visibleEvent.minute}' · {eventTitle(visibleEvent.event_type)}
          </p>
          <p className="mt-2 text-2xl font-black text-white">
            {visibleEvent.player_id
              ? playerMap.get(visibleEvent.player_id)
              : visibleEvent.description ||
                `${homeTeam} ${score} ${awayTeam}`}
          </p>
        </div>
      )}
    </>
  );
}

function eventTitle(type: MatchCenterEvent["event_type"]) {
  if (type === "goal") return "TOOOOR!";
  if (type === "yellow_card") return "Gelbe Karte";
  if (type === "red_card") return "Rote Karte";
  if (type === "substitution") return "Auswechslung";
  return "Live-Update";
}

function eventIcon(type: MatchCenterEvent["event_type"]) {
  if (type === "goal") return <Goal size={28} />;
  if (type === "yellow_card" || type === "red_card") {
    return <ShieldAlert size={28} />;
  }
  return <RefreshCcw size={28} />;
}
