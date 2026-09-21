const berlin = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Europe/Berlin", year: "numeric", month: "2-digit", day: "2-digit",
  hour: "2-digit", minute: "2-digit", hourCycle: "h23",
});

function localParts(date: Date) {
  const parts = Object.fromEntries(berlin.formatToParts(date).map(part => [part.type, part.value]));
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` };
}

/** Interpret admin input as Berlin wall time, never as the host's local time. */
export function parseMatchDateTime(date: string, time: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    throw new Error("Datum oder Uhrzeit ist ungültig.");
  }
  const wall = Date.parse(`${date}T${time}:00Z`);
  if (!Number.isFinite(wall) || new Date(wall).toISOString().slice(0, 10) !== date) {
    throw new Error("Datum oder Uhrzeit ist ungültig.");
  }
  // Probe both sides of a possible clock change and validate each candidate.
  const offsets = new Set<number>();
  for (const delta of [-86400000, 0, 86400000]) {
    const instant = wall + delta;
    const local = localParts(new Date(instant));
    offsets.add(Date.parse(`${local.date}T${local.time}:00Z`) - instant);
  }
  const candidates = [...offsets].map(offset => new Date(wall - offset)).filter(candidate => {
    const local = localParts(candidate);
    return local.date === date && local.time === time;
  });
  if (!candidates.length) throw new Error("Diese Uhrzeit existiert wegen der Zeitumstellung in Deutschland nicht. Bitte eine andere Uhrzeit wählen.");
  if (candidates.length > 1) throw new Error("Diese Uhrzeit kommt bei der Zeitumstellung zweimal vor. Bitte eine eindeutige Uhrzeit außerhalb der doppelten Stunde wählen.");
  return candidates[0].toISOString();
}
