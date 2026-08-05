import { createClient } from "./supabase/server";

export type MatchCenterMatch = {
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
  current_minute: number;
  report: string | null;
  player_of_match_id: string | null;
};

export type MatchCenterPlayer = {
  id: string;
  first_name: string;
  last_name: string;
  shirt_number: number | null;
  position: string;
  image_url: string | null;
};

export type MatchCenterEvent = {
  id: string;
  match_id: string;
  event_type: "goal" | "yellow_card" | "red_card" | "substitution" | "note";
  minute: number;
  player_id: string | null;
  secondary_player_id: string | null;
  description: string | null;
  created_at: string;
};

export type MatchSquadEntry = {
  id: string;
  match_id: string;
  player_id: string;
  role: "starter" | "bench";
  sort_order: number;
};

export async function getMatchCenterOverview() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("matches")
    .select(
      "id, competition, matchday, home_team, away_team, match_date, location, home_score, away_score, status, current_minute, report, player_of_match_id",
    )
    .order("match_date", { ascending: false })
    .limit(30);

  if (error) {
    console.error("Match-Center konnte nicht geladen werden:", error.message);
    return [] as MatchCenterMatch[];
  }

  return (data ?? []) as MatchCenterMatch[];
}

export async function getPublicMatchCenterMatch(id: string) {
  const supabase = await createClient();

  const [matchResult, playersResult, eventsResult, squadResult] =
    await Promise.all([
      supabase
        .from("matches")
        .select(
          "id, competition, matchday, home_team, away_team, match_date, location, home_score, away_score, status, current_minute, report, player_of_match_id",
        )
        .eq("id", id)
        .maybeSingle(),
      supabase
        .from("players")
        .select("id, first_name, last_name, shirt_number, position, image_url")
        .eq("is_active", true),
      supabase
        .from("match_events")
        .select(
          "id, match_id, event_type, minute, player_id, secondary_player_id, description, created_at",
        )
        .eq("match_id", id)
        .order("minute", { ascending: false })
        .order("created_at", { ascending: false }),
      supabase
        .from("match_squad")
        .select("id, match_id, player_id, role, sort_order")
        .eq("match_id", id)
        .order("role", { ascending: true })
        .order("sort_order", { ascending: true }),
    ]);

  if (matchResult.error || !matchResult.data) return null;

  return {
    match: matchResult.data as MatchCenterMatch,
    players: (playersResult.data ?? []) as MatchCenterPlayer[],
    events: (eventsResult.data ?? []) as MatchCenterEvent[],
    squad: (squadResult.data ?? []) as MatchSquadEntry[],
  };
}

export async function getFeaturedMatchCenterMatch() {
  const matches = await getMatchCenterOverview();

  return (
    matches.find((match) => match.status === "live") ??
    [...matches]
      .filter((match) => match.status === "scheduled")
      .sort(
        (a, b) =>
          new Date(a.match_date).getTime() - new Date(b.match_date).getTime(),
      )[0] ??
    matches.find((match) => match.status === "finished") ??
    null
  );
}
