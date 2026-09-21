import { isMiddelichResse } from "./club-name";
export function isClubMatch(match: { home_team: string; away_team: string }) {
  return isMiddelichResse(match.home_team) || isMiddelichResse(match.away_team);
}
export function isCupCompetition(value: string | null) { return /pokal|cup/i.test(value ?? ""); }
export function isLeagueCompetition(value: string | null) {
  return !isCupCompetition(value) && !/freundschaft|testspiel|turnier|friendly|test match/i.test(value ?? "");
}

export const MATCH_GROUPS = [
  { id: "league", label: "⚽ Liga" },
  { id: "cup", label: "🏆 Pokal" },
  { id: "other", label: "🤝 Testspiele / Sonstige" },
] as const;
export type MatchGroup = (typeof MATCH_GROUPS)[number]["id"];
export function matchGroup(competition: string | null): MatchGroup {
  return isCupCompetition(competition) ? "cup" : isLeagueCompetition(competition) ? "league" : "other";
}
export function selectedMatchGroup(value?: string): MatchGroup {
  return value === "cup" || value === "other" ? value : "league";
}
