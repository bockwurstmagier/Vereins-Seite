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
  homeScore?: number;
  awayScore?: number;
  status: "scheduled" | "live" | "finished";
  scorers?: string[];
};
