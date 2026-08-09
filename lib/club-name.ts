export function normalizeClubName(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function isMiddelichResse(value: string) {
  const normalized = normalizeClubName(value);
  return normalized.includes("middelich") && normalized.includes("resse");
}
