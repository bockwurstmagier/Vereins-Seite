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
    const update = () => {
      const nextMinute = calculateLiveMinute(clock);
      setMinute(nextMinute);

      if (syncMinuteInputs) {
        document
          .querySelectorAll<HTMLInputElement>(
            'input[data-auto-live-minute="true"]',
          )
          .forEach((input) => {
            input.value = String(nextMinute);
          });
      }
    };

    update();

    if (
      status !== "live" ||
      !clock_started_at ||
      (clock_phase !== "first_half" && clock_phase !== "second_half")
    ) {
      return;
    }

    const intervalId = window.setInterval(update, 1_000);

    return () => window.clearInterval(intervalId);
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
