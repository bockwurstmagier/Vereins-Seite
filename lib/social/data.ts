import { createClient } from "../supabase/server";
import type { SocialMatch, SocialNews } from "./types";

export async function getSocialStudioData() {
  const supabase = await createClient();

  const [matchesResult, newsResult] = await Promise.all([
    supabase
      .from("matches")
      .select(
        "id, competition, home_team, away_team, match_date, location, home_score, away_score, status",
      )
      .order("match_date", { ascending: false })
      .limit(30),
    supabase
      .from("news")
      .select("id, title, category, excerpt, image_url")
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  return {
    matches: (matchesResult.data ?? []) as SocialMatch[],
    news: (newsResult.data ?? []) as SocialNews[],
  };
}
