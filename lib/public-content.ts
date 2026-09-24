import { getNextMatch } from "./matches";
import { createClient } from "./supabase/server";
import { getClubIdentityMap } from "./clubs";
import { scorersFromEvents } from "./match-scorers";

export type PublicNewsItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  category: string;
  image_url: string | null;
  published_at: string | null;
  created_at: string;
};

export type PublicMatch = {
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
  home_logo_url?: string | null;
  away_logo_url?: string | null;
};

export async function getPublishedNews(limit = 3): Promise<PublicNewsItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("news")
    .select(
      "id, title, slug, excerpt, content, category, image_url, published_at, created_at",
    )
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error) {
    console.error("Veröffentlichte News konnten nicht geladen werden:", error);
    return [];
  }

  return data ?? [];
}

export async function getLastFinishedMatch(): Promise<PublicMatch | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("matches")
    .select(
      "id, competition, matchday, home_team, away_team, match_date, location, maps_query, home_score, away_score, status, scorers",
    )
    .eq("status", "finished")
    .or("home_team.ilike.%Middelich-Resse%,away_team.ilike.%Middelich-Resse%")
    .order("match_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Letztes Spiel konnte nicht geladen werden:", error);
    return null;
  }

  if (!data) return null;

  const match = data as PublicMatch;
  // LiveCenter goals are authoritative when present. No write-back or finalization is needed.
  const { data: goals, error: goalsError } = await supabase.from("match_events")
    .select("event_type, minute, player_id, description")
    .eq("match_id", match.id).eq("event_type", "goal");
  let scorers = match.scorers;
  if (goalsError) {
    console.error("Live-Torschützen konnten nicht geladen werden:", goalsError.message);
  } else if (goals?.length) {
    const playerIds = [...new Set(goals.flatMap(goal => goal.player_id ? [goal.player_id] : []))];
    const { data: players, error: playersError } = playerIds.length
      ? await supabase.from("players").select("id, first_name, last_name").in("id", playerIds)
      : { data: [], error: null };
    if (playersError) console.error("Torschützennamen konnten nicht geladen werden:", playersError.message);
    else scorers = scorersFromEvents(goals, players ?? []);
  }
  const clubMap = await getClubIdentityMap(supabase, [
    match.home_team,
    match.away_team,
  ]);

  return {
    ...match,
    scorers,
    home_logo_url: clubMap.get(match.home_team)?.logo_url ?? null,
    away_logo_url: clubMap.get(match.away_team)?.logo_url ?? null,
  };
}

export async function getUpcomingMatch(): Promise<PublicMatch | null> {
  return getNextMatch();
}
