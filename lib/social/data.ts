import { createClient } from "../supabase/server";
import { getClubIdentityMap } from "../clubs";
import type {
  SocialGoal,
  SocialMatch,
  SocialNews,
  SocialPlayer,
  SocialSponsor,
  SocialStanding,
} from "./types";

export async function getSocialStudioData() {
  const supabase = await createClient();

  const [
    matchesResult,
    newsResult,
    playersResult,
    sponsorsResult,
    standingsResult,
    goalsResult,
  ] = await Promise.all([
    supabase
      .from("matches")
      .select(
        "id, competition, home_team, away_team, match_date, location, home_score, away_score, status",
      )
      .or("home_team.ilike.%Middelich-Resse%,away_team.ilike.%Middelich-Resse%")
      .order("match_date", { ascending: false })
      .limit(60),
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
      .limit(120),
    supabase
      .from("sponsors")
      .select("id, name, category, description, logo_url, website_url")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .limit(100),
    supabase
      .from("standings")
      .select(
        "id, position, team_name, played, goals_for, goals_against, points, is_club",
      )
      .order("position", { ascending: true })
      .limit(30),
    supabase
      .from("match_events")
      .select("id, match_id, minute, player_id, description")
      .eq("event_type", "goal")
      .order("minute", { ascending: true })
      .limit(500),
  ]);

  const matches = (matchesResult.data ?? []) as SocialMatch[];
  const players = (playersResult.data ?? []) as SocialPlayer[];
  const standings = (standingsResult.data ?? []) as SocialStanding[];

  const clubMap = await getClubIdentityMap(
    supabase,
    [
      ...matches.flatMap((match) => [match.home_team, match.away_team]),
      ...standings.map((row) => row.team_name),
    ],
  );

  const playerMap = new Map(
    players.map((player) => [
      player.id,
      `${player.first_name} ${player.last_name}`,
    ]),
  );

  const goals = ((goalsResult.data ?? []) as Omit<SocialGoal, "player_name">[])
    .map((goal) => ({
      ...goal,
      player_name: goal.player_id ? playerMap.get(goal.player_id) ?? null : null,
    }));

  return {
    matches: matches.map((match) => ({
      ...match,
      home_logo_url: clubMap.get(match.home_team)?.logo_url ?? null,
      away_logo_url: clubMap.get(match.away_team)?.logo_url ?? null,
    })),
    news: (newsResult.data ?? []) as SocialNews[],
    players,
    sponsors: (sponsorsResult.data ?? []) as SocialSponsor[],
    standings: standings.map((row) => ({
      ...row,
      logo_url: clubMap.get(row.team_name)?.logo_url ?? null,
    })),
    goals,
  };
}
