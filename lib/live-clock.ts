export type LiveClockPhase =
  | "stopped"
  | "first_half"
  | "halftime"
  | "second_half"
  | "paused"
  | "finished";

export type RunningClockPhase = "first_half" | "second_half";

export type LiveClockData = {
  current_minute: number | null;
  clock_phase: LiveClockPhase | null;
  clock_started_at: string | null;
  clock_base_minute: number | null;
  clock_resume_phase?: RunningClockPhase | null;
};

export function isClockRunning(clock: LiveClockData) {
  return (
    Boolean(clock.clock_started_at) &&
    (clock.clock_phase === "first_half" ||
      clock.clock_phase === "second_half")
  );
}

export function getDisplayPhase(clock: LiveClockData): LiveClockPhase | null {
  if (clock.clock_phase === "paused") {
    return clock.clock_resume_phase ?? "stopped";
  }

  return clock.clock_phase;
}

export function calculateLiveMinute(
  clock: LiveClockData,
  now = Date.now(),
): number {
  const fallback = Math.max(0, clock.current_minute ?? 0);

  if (!isClockRunning(clock) || !clock.clock_started_at) {
    return fallback;
  }

  const startedAt = new Date(clock.clock_started_at).getTime();

  if (Number.isNaN(startedAt)) {
    return fallback;
  }

  const elapsedMinutes = Math.max(
    0,
    Math.floor((now - startedAt) / 60_000),
  );

  const baseMinute =
    clock.clock_base_minute ??
    (clock.clock_phase === "second_half" ? 46 : 1);

  return Math.min(130, Math.max(0, baseMinute + elapsedMinutes));
}

export function formatLiveMinute(
  minute: number,
  phase: LiveClockPhase | null,
) {
  if (phase === "first_half" && minute > 45) {
    return `45+${minute - 45}'`;
  }

  if (phase === "second_half" && minute > 90) {
    return `90+${minute - 90}'`;
  }

  return `${minute}'`;
}
