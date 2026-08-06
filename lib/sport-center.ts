import { createClient } from "./supabase/server";
import { getClubIdentityMap } from "./clubs";

export const CLUB_NAME = "SpVgg Middelich-Resse";

export type StandingRow = {
  id: string;
  season: string;
  competition: string;
  position: number;
  team_name: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  points: number;
  form: string[];
  is_club: boolean;
  logo_url?: string | null;
};

export type SportMatch = {
  id: string;
  competition: string;
  matchday: string | null;
  home_team: string;
  away_team: string;
  match_date: string;
  location: string | null;
  home_score: number | null;
  away_score: number | null;
  status: "scheduled" | "live" | "finished";
  home_logo_url?: string | null;
  away_logo_url?: string | null;
};

export type SeasonStats = {
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  winRate: number;
  homePlayed: number;
  homeWins: number;
  awayPlayed: number;
  awayWins: number;
  form: Array<"W" | "D" | "L">;
};

export function isOurClub(team: string) {
  return team.toLowerCase().includes("middelich");
}

export async function getStandings(
  season?: string,
  competition?: string,
): Promise<StandingRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from("standings")
    .select(
      "id, season, competition, position, team_name, played, wins, draws, losses, goals_for, goals_against, points, form, is_club",
    )
    .order("position", { ascending: true });

  if (season) query = query.eq("season", season);
  if (competition) query = query.eq("competition", competition);

  const { data, error } = await query;

  if (error) {
    console.error("Tabelle konnte nicht geladen werden:", error.message);
    return [];
  }

  const rows = (data ?? []) as StandingRow[];
  const clubMap = await getClubIdentityMap(
    supabase,
    rows.map((row) => row.team_name),
  );

  return rows.map((row) => ({
    ...row,
    logo_url: clubMap.get(row.team_name)?.logo_url ?? null,
  }));
}

export async function getMatches(): Promise<SportMatch[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("matches")
    .select(
      "id, competition, matchday, home_team, away_team, match_date, location, home_score, away_score, status",
    )
    .or("home_team.ilike.%Middelich-Resse%,away_team.ilike.%Middelich-Resse%")
    .order("match_date", { ascending: true });

  if (error) {
    console.error("Spielplan konnte nicht geladen werden:", error.message);
    return [];
  }

  const matches = (data ?? []) as SportMatch[];
  const clubMap = await getClubIdentityMap(
    supabase,
    matches.flatMap((match) => [match.home_team, match.away_team]),
  );

  return matches.map((match) => ({
    ...match,
    home_logo_url: clubMap.get(match.home_team)?.logo_url ?? null,
    away_logo_url: clubMap.get(match.away_team)?.logo_url ?? null,
  }));
}

export async function getSeasonStats(): Promise<SeasonStats> {
  const matches = (await getMatches()).filter(
    (match) => match.status === "finished",
  );

  const stats: SeasonStats = {
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    points: 0,
    winRate: 0,
    homePlayed: 0,
    homeWins: 0,
    awayPlayed: 0,
    awayWins: 0,
    form: [],
  };

  for (const match of matches) {
    const oursHome = isOurClub(match.home_team);
    const oursAway = isOurClub(match.away_team);
    if (!oursHome && !oursAway) continue;

    const scored = oursHome ? match.home_score ?? 0 : match.away_score ?? 0;
    const conceded = oursHome ? match.away_score ?? 0 : match.home_score ?? 0;

    stats.played += 1;
    stats.goalsFor += scored;
    stats.goalsAgainst += conceded;

    if (oursHome) stats.homePlayed += 1;
    if (oursAway) stats.awayPlayed += 1;

    if (scored > conceded) {
      stats.wins += 1;
      stats.points += 3;
      stats.form.push("W");
      if (oursHome) stats.homeWins += 1;
      if (oursAway) stats.awayWins += 1;
    } else if (scored === conceded) {
      stats.draws += 1;
      stats.points += 1;
      stats.form.push("D");
    } else {
      stats.losses += 1;
      stats.form.push("L");
    }
  }

  stats.winRate = stats.played
    ? Math.round((stats.wins / stats.played) * 100)
    : 0;
  stats.form = stats.form.slice(-5);

  return stats;
}
