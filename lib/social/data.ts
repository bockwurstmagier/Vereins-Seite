import { createClient } from "../supabase/server";
import type {
  SocialMatch,
  SocialNews,
  SocialPlayer,
  SocialSponsor,
} from "./types";

export async function getSocialStudioData() {
  const supabase = await createClient();

  const [matchesResult, newsResult, playersResult, sponsorsResult] =
    await Promise.all([
      supabase
        .from("matches")
        .select(
          "id, competition, home_team, away_team, match_date, location, home_score, away_score, status",
        )
        .order("match_date", { ascending: false })
        .limit(50),
      supabase
        .from("news")
        .select("id, title, category, excerpt, image_url")
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("players")
        .select(
          "id, first_name, last_name, squad, shirt_number, position, image_url",
        )
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .limit(100),
      supabase
        .from("sponsors")
        .select("id, name, category, description, logo_url, website_url")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .limit(100),
    ]);

  if (matchesResult.error) {
    console.error("Social Studio: Spiele konnten nicht geladen werden", matchesResult.error);
  }
  if (newsResult.error) {
    console.error("Social Studio: News konnten nicht geladen werden", newsResult.error);
  }
  if (playersResult.error) {
    console.error("Social Studio: Spieler konnten nicht geladen werden", playersResult.error);
  }
  if (sponsorsResult.error) {
    console.error("Social Studio: Sponsoren konnten nicht geladen werden", sponsorsResult.error);
  }

  return {
    matches: (matchesResult.data ?? []) as SocialMatch[],
    news: (newsResult.data ?? []) as SocialNews[],
    players: (playersResult.data ?? []) as SocialPlayer[],
    sponsors: (sponsorsResult.data ?? []) as SocialSponsor[],
  };
}
