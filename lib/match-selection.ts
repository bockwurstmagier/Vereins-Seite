import { isMiddelichResse } from "./club-name";
export function isClubMatch(match: { home_team: string; away_team: string }) {
  return isMiddelichResse(match.home_team) || isMiddelichResse(match.away_team);
}
export function isCupCompetition(value: string | null) { return /pokal|cup/i.test(value ?? ""); }
export function isLeagueCompetition(value: string | null) {
  return !isCupCompetition(value) && !/freundschaft|testspiel|turnier|friendly|test match/i.test(value ?? "");
}
