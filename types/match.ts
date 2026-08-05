export type MatchStatus = "scheduled" | "live" | "finished";

export type Match = {
  id: string;
  competition: string;
  matchday: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  dateTime: string;
  location: string;
  mapsQuery: string;
  status: MatchStatus;
  homeScore?: number;
  awayScore?: number;
  scorers?: string[];
};