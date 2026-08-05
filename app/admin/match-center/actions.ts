"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function required(formData: FormData, key: string) {
  const value = text(formData, key);
  if (!value) throw new Error(`Das Feld "${key}" fehlt.`);
  return value;
}

function integer(formData: FormData, key: string, fallback = 0) {
  const value = text(formData, key);
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 0) {
    throw new Error(`Das Feld "${key}" enthält keine gültige Zahl.`);
  }
  return parsed;
}

async function authenticatedClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  return { supabase, user };
}

function refresh(matchId: string) {
  revalidatePath("/");
  revalidatePath("/match-center");
  revalidatePath(`/match-center/${matchId}`);
  revalidatePath("/admin");
  revalidatePath("/admin/match-center");
  revalidatePath(`/admin/match-center/${matchId}`);
}

export async function updateMatchCenter(formData: FormData) {
  const { supabase } = await authenticatedClient();
  const matchId = required(formData, "match_id");
  const status = required(formData, "status");
  const homeScore = integer(formData, "home_score");
  const awayScore = integer(formData, "away_score");
  const currentMinute = integer(formData, "current_minute");
  const playerOfMatchId = text(formData, "player_of_match_id") || null;
  const report = text(formData, "report") || null;

  const { error } = await supabase
    .from("matches")
    .update({
      status,
      home_score: homeScore,
      away_score: awayScore,
      current_minute: currentMinute,
      player_of_match_id: playerOfMatchId,
      report,
      updated_at: new Date().toISOString(),
    })
    .eq("id", matchId);

  if (error) throw new Error(`Match-Center konnte nicht gespeichert werden: ${error.message}`);

  refresh(matchId);
  redirect(`/admin/match-center/${matchId}?saved=1`);
}

export async function addMatchEvent(formData: FormData) {
  const { supabase, user } = await authenticatedClient();
  const matchId = required(formData, "match_id");
  const eventType = required(formData, "event_type");
  const minute = integer(formData, "minute");
  const playerId = text(formData, "player_id") || null;
  const secondaryPlayerId = text(formData, "secondary_player_id") || null;
  const description = text(formData, "description") || null;

  const { error } = await supabase.from("match_events").insert({
    match_id: matchId,
    event_type: eventType,
    minute,
    player_id: playerId,
    secondary_player_id: secondaryPlayerId,
    description,
    created_by: user.id,
  });

  if (error) throw new Error(`Ereignis konnte nicht gespeichert werden: ${error.message}`);

  refresh(matchId);
  redirect(`/admin/match-center/${matchId}?event=1`);
}

export async function deleteMatchEvent(formData: FormData) {
  const { supabase } = await authenticatedClient();
  const matchId = required(formData, "match_id");
  const eventId = required(formData, "event_id");

  const { error } = await supabase.from("match_events").delete().eq("id", eventId);
  if (error) throw new Error(`Ereignis konnte nicht gelöscht werden: ${error.message}`);

  refresh(matchId);
  redirect(`/admin/match-center/${matchId}?deleted=1`);
}

export async function saveMatchSquad(formData: FormData) {
  const { supabase } = await authenticatedClient();
  const matchId = required(formData, "match_id");
  const starters = formData.getAll("starters").map(String);
  const bench = formData.getAll("bench").map(String);

  const uniqueStarters = [...new Set(starters)];
  const uniqueBench = [...new Set(bench)].filter(
    (playerId) => !uniqueStarters.includes(playerId),
  );

  const { error: deleteError } = await supabase
    .from("match_squad")
    .delete()
    .eq("match_id", matchId);

  if (deleteError) {
    throw new Error(`Alte Aufstellung konnte nicht ersetzt werden: ${deleteError.message}`);
  }

  const rows = [
    ...uniqueStarters.map((playerId, index) => ({
      match_id: matchId,
      player_id: playerId,
      role: "starter",
      sort_order: index,
    })),
    ...uniqueBench.map((playerId, index) => ({
      match_id: matchId,
      player_id: playerId,
      role: "bench",
      sort_order: index,
    })),
  ];

  if (rows.length) {
    const { error } = await supabase.from("match_squad").insert(rows);
    if (error) throw new Error(`Aufstellung konnte nicht gespeichert werden: ${error.message}`);
  }

  refresh(matchId);
  redirect(`/admin/match-center/${matchId}?squad=1`);
}

export async function quickLiveAction(formData: FormData) {
  const { supabase, user } = await authenticatedClient();
  const matchId = required(formData, "match_id");
  const action = required(formData, "live_action");

  const presets: Record<
    string,
    { status: "live" | "finished"; minute: number; description: string }
  > = {
    kickoff: { status: "live", minute: 1, description: "Anpfiff" },
    halftime: { status: "live", minute: 45, description: "Halbzeit" },
    second_half: {
      status: "live",
      minute: 46,
      description: "Anpfiff zur zweiten Halbzeit",
    },
    fulltime: { status: "finished", minute: 90, description: "Abpfiff" },
  };

  const preset = presets[action];

  if (!preset) {
    throw new Error("Unbekannte Live-Aktion.");
  }

  const { error: matchError } = await supabase
    .from("matches")
    .update({
      status: preset.status,
      current_minute: preset.minute,
      updated_at: new Date().toISOString(),
    })
    .eq("id", matchId);

  if (matchError) {
    throw new Error(`Spielstatus konnte nicht geändert werden: ${matchError.message}`);
  }

  const { error: eventError } = await supabase.from("match_events").insert({
    match_id: matchId,
    event_type: "note",
    minute: preset.minute,
    description: preset.description,
    created_by: user.id,
  });

  if (eventError) {
    throw new Error(`Ticker-Eintrag konnte nicht gespeichert werden: ${eventError.message}`);
  }

  refresh(matchId);
  redirect(`/admin/match-center/${matchId}?quick=1`);
}
