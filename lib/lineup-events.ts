import type { MatchCenterEvent } from "./match-center";

export type PlayerLiveStatus = {
  goals: number;
  yellowCards: number;
  redCards: number;
  substitution: "in" | "out" | null;
};

/** Rebuild from current events so corrections and Undo cannot leave stale badges. */
export function summarizeLineupEvents(events: readonly MatchCenterEvent[]) {
  const result = new Map<string, PlayerLiveStatus>();
  const statusFor = (id: string) => {
    let status = result.get(id);
    if (!status) {
      status = { goals: 0, yellowCards: 0, redCards: 0, substitution: null };
      result.set(id, status);
    }
    return status;
  };

  // Recording order also works across first-half added time and the restart at 45.
  const ordered = [...events].sort((a, b) =>
    a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id),
  );
  for (const event of ordered) {
    if (event.event_type === "substitution") {
      if (event.player_id) statusFor(event.player_id).substitution = "in";
      if (event.secondary_player_id) statusFor(event.secondary_player_id).substitution = "out";
    } else if (event.player_id) {
      if (event.event_type === "goal") statusFor(event.player_id).goals += 1;
      if (event.event_type === "yellow_card") statusFor(event.player_id).yellowCards += 1;
      if (event.event_type === "red_card") statusFor(event.player_id).redCards += 1;
    }
  }
  return result;
}
