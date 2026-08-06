import { supabase } from "./supabase";

export type DatabaseMatch = {
  id: string;
  competition: string;
  matchday: string | null;
  home_team: string;
  away_team: string;
  match_date: string;
  location: string | null;
  maps_query: string | null;
  home_score: number | null;
  away_score: number | null;
  status: "scheduled" | "live" | "finished";
  scorers: string[] | null;
};

export async function getNextMatch(): Promise<DatabaseMatch | null> {
  const { data, error } = await supabase
    .from("matches")
    .select(
      "id, competition, matchday, home_team, away_team, match_date, location, maps_query, home_score, away_score, status, scorers",
    )
    .eq("status", "scheduled")
    .or("home_team.ilike.%Middelich-Resse%,away_team.ilike.%Middelich-Resse%")
    .gte("match_date", new Date().toISOString())
    .order("match_date", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Fehler beim Laden des nächsten Spiels:", error.message);
    return null;
  }

  return data;
}
