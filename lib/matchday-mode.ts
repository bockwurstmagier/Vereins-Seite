import "server-only";

import { createClient } from "./supabase/server";

type MatchRow = {
  id: string;
  home_team: string;
  away_team: string;
  match_date: string;
  competition: string;
  location: string | null;
  status: string;
  home_score: number | null;
  away_score: number | null;
  current_minute: number | null;
  clock_phase: string | null;
  player_of_match_id: string | null;
};

type EventRow = {
  id: string;
  match_id: string;
  event_type: string;
  minute: number;
  player_id: string | null;
  secondary_player_id: string | null;
  description: string | null;
  created_at: string;
};

type PlayerRow = {
  id: string;
  first_name: string;
  last_name: string;
  position: string | null;
  shirt_number: number | null;
  image_url: string | null;
};

type LineupRow = {
  match_id: string;
  player_id: string;
  is_starting: boolean;
  position_label: string | null;
  shirt_number: number | null;
};

type StandingRow = {
  position: number;
  team_name: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  points: number;
  logo_url: string | null;
  is_club: boolean;
};

const CLUB_MARKER = "middelich-resse";

function isClub(name: string) {
  return name.toLowerCase().includes(CLUB_MARKER);
}

export async function getMatchdayModeData() {
  const supabase = await createClient();
  const now = new Date();
  const windowStart = new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString();
  const windowEnd = new Date(now.getTime() + 72 * 60 * 60 * 1000).toISOString();

  const [{ data: activeMatches }, { data: fallbackMatch }] = await Promise.all([
    supabase
      .from("matches")
      .select(
        "id,home_team,away_team,match_date,competition,location,status,home_score,away_score,current_minute,clock_phase,player_of_match_id",
      )
      .or("home_team.ilike.%Middelich-Resse%,away_team.ilike.%Middelich-Resse%")
      .gte("match_date", windowStart)
      .lte("match_date", windowEnd)
      .order("match_date", { ascending: true }),
    supabase
      .from("matches")
      .select(
        "id,home_team,away_team,match_date,competition,location,status,home_score,away_score,current_minute,clock_phase,player_of_match_id",
      )
      .or("home_team.ilike.%Middelich-Resse%,away_team.ilike.%Middelich-Resse%")
      .gte("match_date", now.toISOString())
      .order("match_date", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);

  const candidates = (activeMatches ?? []) as MatchRow[];
  const live = candidates.find((match) =>
    ["live", "halftime"].includes(match.status),
  );
  const today = candidates.find((match) => {
    const date = new Date(match.match_date);
    return date.toDateString() === now.toDateString();
  });
  const match = live ?? today ?? (fallbackMatch as MatchRow | null);

  if (!match) {
    return {
      mode: "idle" as const,
      match: null,
      events: [],
      players: [],
      lineup: [],
      standings: [],
      nextMatch: null,
      mediaReady: false,
    };
  }

  const [
    eventsResult,
    playersResult,
    lineupResult,
    standingsResult,
    nextMatchResult,
    mediaResult,
  ] = await Promise.all([
    supabase
      .from("match_events")
      .select(
        "id,match_id,event_type,minute,player_id,secondary_player_id,description,created_at",
      )
      .eq("match_id", match.id)
      .order("minute", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("players")
      .select("id,first_name,last_name,position,shirt_number,image_url")
      .eq("is_active", true),
    supabase
      .from("match_lineups")
      .select("match_id,player_id,is_starting,position_label,shirt_number")
      .eq("match_id", match.id)
      .order("is_starting", { ascending: false }),
    supabase
      .from("standings")
      .select(
        "position,team_name,played,wins,draws,losses,goals_for,goals_against,points,logo_url,is_club",
      )
      .order("position", { ascending: true })
      .limit(10),
    supabase
      .from("matches")
      .select(
        "id,home_team,away_team,match_date,competition,location,status,home_score,away_score,current_minute,clock_phase,player_of_match_id",
      )
      .or("home_team.ilike.%Middelich-Resse%,away_team.ilike.%Middelich-Resse%")
      .gt("match_date", match.match_date)
      .order("match_date", { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("media_center_packages")
      .select("id")
      .eq("match_id", match.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const mode =
    match.status === "live"
      ? "live"
      : match.status === "halftime"
        ? "halftime"
        : match.status === "finished"
          ? "finished"
          : "countdown";

  return {
    mode,
    match,
    events: (eventsResult.data ?? []) as EventRow[],
    players: (playersResult.data ?? []) as PlayerRow[],
    lineup: (lineupResult.data ?? []) as LineupRow[],
    standings: (standingsResult.data ?? []) as StandingRow[],
    nextMatch: (nextMatchResult.data ?? null) as MatchRow | null,
    mediaReady: Boolean(mediaResult.data),
  };
}

export function getClubSide(match: MatchRow) {
  return isClub(match.home_team) ? "home" : "away";
}
