import { createClient } from "./supabase/server";

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

  return data;
}

export async function getUpcomingMatch(): Promise<PublicMatch | null> {
  const supabase = await createClient();

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
    console.error("Nächstes Spiel konnte nicht geladen werden:", error);
    return null;
  }

  return data;
}
