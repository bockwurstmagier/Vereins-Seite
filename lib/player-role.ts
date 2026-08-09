export type PlayerRoleLike = {
  squad?: string | null;
  position?: string | null;
};

function normalizeRole(value: string | null | undefined) {
  return (value ?? "")
    .toLocaleLowerCase("de-DE")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const STAFF_POSITIONS = new Set([
  "trainer",
  "cheftrainer",
  "co trainer",
  "cotrainer",
  "betreuer",
  "vereinsleitung",
]);

export function isPlayingProfile(profile: PlayerRoleLike) {
  const squad = normalizeRole(profile.squad);
  const position = normalizeRole(profile.position);

  if (squad === "trainer staff") return false;
  if (STAFF_POSITIONS.has(position)) return false;
  if (position.includes("trainer")) return false;
  if (position.includes("betreuer")) return false;
  if (position.includes("vereinsleitung")) return false;

  return true;
}
