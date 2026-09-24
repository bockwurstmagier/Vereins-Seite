export type ScorerEvent = {
  event_type: string;
  minute: number;
  player_id: string | null;
  description: string | null;
};
export type ScorerPlayer = { id: string; first_name: string; last_name: string };

/** Derive the display from current events, including corrections and deletions. */
export function scorersFromEvents(events: readonly ScorerEvent[], players: readonly ScorerPlayer[]): string[] {
  const names = new Map(players.map(player => [player.id, `${player.first_name} ${player.last_name}`.trim()]));
  const grouped = new Map<string, { name: string; minutes: number[] }>();
  for (const goal of [...events].filter(event => event.event_type === "goal").sort((a,b) => a.minute - b.minute)) {
    // Legacy away goals could carry the opponent label despite having our player assigned.
    if (!goal.player_id && goal.description === "Tor für den Gegner") continue;
    const key = goal.player_id || "unassigned";
    const scorer = grouped.get(key) ?? { name: names.get(key) || "Torschütze nicht zugeordnet", minutes: [] };
    scorer.minutes.push(goal.minute);
    grouped.set(key, scorer);
  }
  return [...grouped.values()].map(scorer => `${scorer.name} (${scorer.minutes.map(minute => `${minute}′`).join(", ")})`);
}
