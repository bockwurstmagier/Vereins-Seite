"use client";

import { useEffect, useMemo, useState } from "react";

import {
  calculateLiveMinute,
  formatLiveMinute,
  getDisplayPhase,
  type LiveClockData,
} from "../../lib/live-clock";

type LiveClockProps = LiveClockData & {
  status: "scheduled" | "live" | "finished";
  className?: string;
  prefix?: string;
  syncMinuteInputs?: boolean;
};

export default function LiveClock({
  status,
  current_minute,
  clock_phase,
  clock_started_at,
  clock_base_minute,
  clock_resume_phase,
  className = "",
  prefix = "",
  syncMinuteInputs = false,
}: LiveClockProps) {
  const clock = useMemo(
    () => ({
      current_minute,
      clock_phase,
      clock_started_at,
      clock_base_minute,
      clock_resume_phase,
    }),
    [
      clock_base_minute,
      clock_phase,
      clock_resume_phase,
      clock_started_at,
      current_minute,
    ],
  );

  const [minute, setMinute] = useState(() => calculateLiveMinute(clock));

  useEffect(() => {
    let timeoutId: number | null = null;

    const update = () => {
      const nextMinute = calculateLiveMinute(clock);
      setMinute(nextMinute);

      if (syncMinuteInputs) {
        document
          .querySelectorAll<HTMLInputElement>('input[data-auto-live-minute="true"]')
          .forEach((input) => {
            input.value = String(nextMinute);
          });
      }
    };

    const schedule = () => {
      if (timeoutId !== null) window.clearTimeout(timeoutId);
      timeoutId = null;
      update();

      if (
        document.visibilityState !== "visible" ||
        status !== "live" ||
        !clock_started_at ||
        (clock_phase !== "first_half" && clock_phase !== "second_half")
      ) {
        return;
      }

      // Die Anzeige ändert sich nur pro Spielminute. Statt jede Sekunde React
      // neu zu rendern, wecken wir die Uhr erst am nächsten Minutenwechsel.
      const startedAt = new Date(clock_started_at).getTime();
      const elapsed = Math.max(0, Date.now() - startedAt);
      const untilNextMinute = Math.max(750, 60_000 - (elapsed % 60_000) + 25);
      timeoutId = window.setTimeout(schedule, untilNextMinute);
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") schedule();
      else if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    schedule();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      if (timeoutId !== null) window.clearTimeout(timeoutId);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [clock, clock_phase, clock_started_at, status, syncMinuteInputs]);

  if (status === "finished") {
    return <span className={className}>Endstand</span>;
  }

  if (status !== "live") {
    return <span className={className}>Geplant</span>;
  }

  if (clock_phase === "halftime") {
    return <span className={className}>Halbzeit</span>;
  }

  const displayPhase = getDisplayPhase(clock);
  const timeLabel = formatLiveMinute(minute, displayPhase);
  const label =
    clock_phase === "paused"
      ? `Pausiert · ${timeLabel}`
      : `${prefix}${timeLabel}`;

  return (
    <span className={className} suppressHydrationWarning>
      {label}
    </span>
  );
}
