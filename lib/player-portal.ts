import "server-only";

import { redirect } from "next/navigation";

import { getPlayerSeasonStats } from "./player-statistics";
import { createClient } from "./supabase/server";

export async function requirePlayerPortal() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("id,email,display_name,role,is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_active) redirect("/login?error=inactive");
  if (profile.role !== "spieler") redirect("/admin");

  const { data: account } = await supabase
    .from("player_accounts")
    .select("player_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!account) {
    return { supabase, user, profile, playerId: null as string | null };
  }

  return { supabase, user, profile, playerId: account.player_id as string };
}

export async function getPlayerPortalData() {
  const auth = await requirePlayerPortal();

  if (!auth.playerId) {
    return {
      ...auth,
      player: null,
      matches: [],
      trainings: [],
      responses: [],
      messages: [],
      documents: [],
      injuries: [],
      stats: null,
    };
  }

  const [
    playerResult,
    matchesResult,
    trainingsResult,
    responsesResult,
    messagesResult,
    documentsResult,
    injuriesResult,
  ] = await Promise.all([
    auth.supabase
      .from("players")
      .select("id,first_name,last_name,slug,position,shirt_number,squad,image_url,strong_foot,height_cm,birth_date,nationality,instagram_url,short_profile,favorite_club,favorite_player")
      .eq("id", auth.playerId)
      .single(),
    auth.supabase
      .from("matches")
      .select("id,home_team,away_team,match_date,competition,location,status")
      .eq("status", "scheduled")
      .or("home_team.ilike.%Middelich-Resse%,away_team.ilike.%Middelich-Resse%")
      .gte("match_date", new Date().toISOString())
      .order("match_date", { ascending: true })
      .limit(8),
    auth.supabase
      .from("training_sessions")
      .select("id,title,session_date,location,focus,intensity,duration_minutes")
      .gte("session_date", new Date().toISOString())
      .order("session_date", { ascending: true })
      .limit(8),
    auth.supabase
      .from("player_responses")
      .select("id,event_type,event_id,response,note")
      .eq("player_id", auth.playerId),
    auth.supabase
      .from("player_messages")
      .select("id,title,body,is_important,created_at,audience,player_id")
      .or(`audience.eq.all,player_id.eq.${auth.playerId}`)
      .order("created_at", { ascending: false })
      .limit(20),
    auth.supabase
      .from("player_documents")
      .select("id,title,description,file_url,created_at,audience,player_id")
      .or(`audience.eq.all,player_id.eq.${auth.playerId}`)
      .order("created_at", { ascending: false })
      .limit(20),
    auth.supabase
      .from("player_injury_reports")
      .select("id,status,body_area,description,available_from,created_at")
      .eq("player_id", auth.playerId)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const seasons = await auth.supabase
    .from("matches")
    .select("season")
    .not("season", "is", null)
    .order("season", { ascending: false });

  const season =
    [...new Set((seasons.data ?? []).map((row) => row.season).filter(Boolean))][0] ??
    "2026/27";

  const stats = (await getPlayerSeasonStats(season)).find(
    (entry) => entry.playerId === auth.playerId,
  ) ?? null;

  return {
    ...auth,
    player: playerResult.data,
    matches: matchesResult.data ?? [],
    trainings: trainingsResult.data ?? [],
    responses: responsesResult.data ?? [],
    messages: messagesResult.data ?? [],
    documents: documentsResult.data ?? [],
    injuries: injuriesResult.data ?? [],
    stats,
  };
}
