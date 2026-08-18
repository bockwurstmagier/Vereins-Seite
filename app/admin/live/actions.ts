"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "../../../lib/auth/roles";
import { calculateLiveMinute } from "../../../lib/live-clock";
import { sendLivePush, sendMatchLivePush } from "../../../lib/push/server";
import { createClient } from "../../../lib/supabase/server";

const ALLOWED_ROLES = ["administrator", "trainer", "betreuer"] as const;

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function required(formData: FormData, key: string) {
  const result = value(formData, key);
  if (!result) throw new Error(`Das Feld „${key}“ fehlt.`);
  return result;
}

function numberValue(formData: FormData, key: string, fallback = 0) {
  const raw = value(formData, key);
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed)) throw new Error(`Ungültige Zahl in „${key}“.`);
  return parsed;
}

async function authorizedClient() {
  await requireRole([...ALLOWED_ROLES]);
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
  revalidatePath("/admin/live");
  revalidatePath(`/admin/live/${matchId}`);
  revalidatePath("/admin/match-center");
  revalidatePath(`/admin/match-center/${matchId}`);
  revalidatePath("/admin/trainer");
}

async function readMatch(matchId: string) {
  const { supabase } = await authorizedClient();
  const { data, error } = await supabase
    .from("matches")
    .select("id, home_score, away_score, current_minute, status, clock_phase, clock_started_at, clock_base_minute, clock_resume_phase")
    .eq("id", matchId)
    .maybeSingle();

  if (error || !data) {
    throw new Error(`Spiel konnte nicht geladen werden: ${error?.message ?? "nicht gefunden"}`);
  }

  return { supabase, match: data };
}

export async function changeMinute(formData: FormData) {
  const matchId = required(formData, "match_id");
  const delta = numberValue(formData, "delta");
  const { supabase, match } = await readMatch(matchId);
  const liveMinute = calculateLiveMinute(match);
  const nextMinute = Math.max(
    0,
    Math.min(130, liveMinute + delta),
  );
  const running =
    match.clock_phase === "first_half" ||
    match.clock_phase === "second_half";

  const { error } = await supabase
    .from("matches")
    .update({
      current_minute: nextMinute,
      clock_base_minute: nextMinute,
      clock_started_at: running ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", matchId);

  if (error) throw new Error(`Minute konnte nicht geändert werden: ${error.message}`);
  refresh(matchId);
  redirect(`/admin/live/${matchId}`);
}


export async function pauseLiveClock(formData: FormData) {
  const matchId = required(formData, "match_id");
  const { supabase, match } = await readMatch(matchId);
  const liveMinute = calculateLiveMinute(match);
  const runningPhase =
    match.clock_phase === "second_half" ? "second_half" : "first_half";

  const { error } = await supabase
    .from("matches")
    .update({
      current_minute: liveMinute,
      clock_base_minute: liveMinute,
      clock_started_at: null,
      clock_phase: "paused",
      clock_resume_phase: runningPhase,
      updated_at: new Date().toISOString(),
    })
    .eq("id", matchId);

  if (error) throw new Error(`Spieluhr konnte nicht pausiert werden: ${error.message}`);
  refresh(matchId);
  redirect(`/admin/live/${matchId}?paused=1`);
}

export async function resumeLiveClock(formData: FormData) {
  const matchId = required(formData, "match_id");
  const { supabase, match } = await readMatch(matchId);
  const resumePhase =
    match.clock_resume_phase === "second_half" ? "second_half" : "first_half";
  const minute = Math.max(1, match.current_minute ?? match.clock_base_minute ?? 1);

  const { error } = await supabase
    .from("matches")
    .update({
      status: "live",
      clock_phase: resumePhase,
      clock_started_at: new Date().toISOString(),
      clock_base_minute: minute,
      current_minute: minute,
      updated_at: new Date().toISOString(),
    })
    .eq("id", matchId);

  if (error) throw new Error(`Spieluhr konnte nicht fortgesetzt werden: ${error.message}`);
  refresh(matchId);
  redirect(`/admin/live/${matchId}?resumed=1`);
}

export async function setExactMinute(formData: FormData) {
  const matchId = required(formData, "match_id");
  const minute = Math.max(0, Math.min(130, numberValue(formData, "minute")));
  const { supabase, match } = await readMatch(matchId);
  const running = match.clock_phase === "first_half" || match.clock_phase === "second_half";

  const { error } = await supabase
    .from("matches")
    .update({
      current_minute: minute,
      clock_base_minute: minute,
      clock_started_at: running ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", matchId);

  if (error) throw new Error(`Spielminute konnte nicht gesetzt werden: ${error.message}`);
  refresh(matchId);
  redirect(`/admin/live/${matchId}?minute=1`);
}

export async function setLivePhase(formData: FormData) {
  const { supabase, user } = await authorizedClient();
  const matchId = required(formData, "match_id");
  const phase = required(formData, "phase");

  const { data: match, error: readError } = await supabase
    .from("matches")
    .select(
      "current_minute, status, clock_phase, clock_started_at, clock_base_minute, clock_resume_phase",
    )
    .eq("id", matchId)
    .maybeSingle();

  if (readError || !match) {
    throw new Error("Die aktuelle Spieluhr konnte nicht geladen werden.");
  }

  const now = new Date();
  const liveMinute = calculateLiveMinute(match, now.getTime());

  const phases = {
    kickoff: {
      status: "live" as const,
      minute: 1,
      clockPhase: "first_half",
      clockStartedAt: now.toISOString(),
      label: "Anpfiff",
    },
    halftime: {
      status: "live" as const,
      minute: Math.max(45, liveMinute),
      clockPhase: "halftime",
      clockStartedAt: null,
      label: "Halbzeit",
    },
    second_half: {
      status: "live" as const,
      minute: Math.max(46, liveMinute),
      clockPhase: "second_half",
      clockStartedAt: now.toISOString(),
      label: "Anpfiff zur zweiten Halbzeit",
    },
    fulltime: {
      status: "finished" as const,
      minute: Math.max(90, liveMinute),
      clockPhase: "finished",
      clockStartedAt: null,
      label: "Abpfiff",
    },
  } as const;

  const selected = phases[phase as keyof typeof phases];

  if (!selected) {
    throw new Error("Unbekannte Spielphase.");
  }

  const { error: matchError } = await supabase
    .from("matches")
    .update({
      status: selected.status,
      current_minute: selected.minute,
      clock_phase: selected.clockPhase,
      clock_started_at: selected.clockStartedAt,
      clock_base_minute: selected.minute,
      clock_resume_phase: selected.clockPhase === "first_half" || selected.clockPhase === "second_half" ? selected.clockPhase : null,
      updated_at: now.toISOString(),
    })
    .eq("id", matchId);

  if (matchError) {
    throw new Error(
      `Spielphase konnte nicht geändert werden: ${matchError.message}`,
    );
  }

  const { error: eventError } = await supabase
    .from("match_events")
    .insert({
      match_id: matchId,
      event_type: "note",
      minute: selected.minute,
      description: selected.label,
      created_by: user.id,
    });

  if (eventError) {
    throw new Error(
      `Ticker-Eintrag konnte nicht gespeichert werden: ${eventError.message}`,
    );
  }

  if (
    phase === "kickoff" &&
    !(match.status === "live" && match.clock_phase === "first_half")
  ) {
    await sendMatchLivePush(matchId);
  }

  refresh(matchId);
  redirect(`/admin/live/${matchId}`);
}

export async function addGoal(formData: FormData) {
  const { supabase, user } = await authorizedClient();
  const matchId = required(formData, "match_id");
  const side = required(formData, "side");
  const minute = numberValue(formData, "minute");
  const playerId = value(formData, "player_id") || null;
  const assistId = value(formData, "secondary_player_id") || null;
  const description = value(formData, "description") || null;

  const { data: match, error: readError } = await supabase
    .from("matches")
    .select("home_score, away_score")
    .eq("id", matchId)
    .maybeSingle();

  if (readError || !match) throw new Error("Spielstand konnte nicht geladen werden.");

  const scores = {
    home_score: match.home_score ?? 0,
    away_score: match.away_score ?? 0,
  };

  if (side === "home") scores.home_score += 1;
  else if (side === "away") scores.away_score += 1;
  else throw new Error("Ungültige Mannschaftsseite.");

  const { error: scoreError } = await supabase
    .from("matches")
    .update({ ...scores, current_minute: minute, status: "live", updated_at: new Date().toISOString() })
    .eq("id", matchId);

  if (scoreError) throw new Error(`Spielstand konnte nicht geändert werden: ${scoreError.message}`);

  const { error: eventError } = await supabase.from("match_events").insert({
    match_id: matchId,
    event_type: "goal",
    minute,
    player_id: playerId,
    secondary_player_id: assistId,
    description: description || (side === "away" ? "Tor für den Gegner" : null),
    created_by: user.id,
  });

  if (eventError) throw new Error(`Tor konnte nicht gespeichert werden: ${eventError.message}`);

  await sendLivePush({
    matchId,
    eventType: "goal",
    minute,
    playerId,
    secondaryPlayerId: assistId,
    description,
    homeScore: scores.home_score,
    awayScore: scores.away_score,
  });

  refresh(matchId);
  redirect(`/admin/live/${matchId}?goal=1`);
}

export async function addCard(formData: FormData) {
  const { supabase, user } = await authorizedClient();
  const matchId = required(formData, "match_id");
  const card = required(formData, "card");
  const minute = numberValue(formData, "minute");
  const playerId = value(formData, "player_id") || null;
  const description = value(formData, "description") || null;
  const eventType = card === "red" ? "red_card" : "yellow_card";

  const { error } = await supabase.from("match_events").insert({
    match_id: matchId,
    event_type: eventType,
    minute,
    player_id: playerId,
    description,
    created_by: user.id,
  });

  if (error) throw new Error(`Karte konnte nicht gespeichert werden: ${error.message}`);
  await supabase
    .from("matches")
    .update({ current_minute: minute, status: "live", updated_at: new Date().toISOString() })
    .eq("id", matchId);

  await sendLivePush({
    matchId,
    eventType: eventType,
    minute,
    playerId,
    description,
  });

  refresh(matchId);
  redirect(`/admin/live/${matchId}?card=1`);
}

export async function addSubstitution(formData: FormData) {
  const { supabase, user } = await authorizedClient();
  const matchId = required(formData, "match_id");
  const minute = numberValue(formData, "minute");
  const playerIn = required(formData, "player_id");
  const playerOut = required(formData, "secondary_player_id");

  if (playerIn === playerOut) throw new Error("Ein- und ausgewechselter Spieler müssen verschieden sein.");

  const { error } = await supabase.from("match_events").insert({
    match_id: matchId,
    event_type: "substitution",
    minute,
    player_id: playerIn,
    secondary_player_id: playerOut,
    created_by: user.id,
  });

  if (error) throw new Error(`Wechsel konnte nicht gespeichert werden: ${error.message}`);
  await supabase
    .from("matches")
    .update({ current_minute: minute, status: "live", updated_at: new Date().toISOString() })
    .eq("id", matchId);

  await sendLivePush({
    matchId,
    eventType: "substitution",
    minute,
    playerId: playerIn,
    secondaryPlayerId: playerOut,
  });

  refresh(matchId);
  redirect(`/admin/live/${matchId}?substitution=1`);
}


export async function addLiveMoment(input: {
  matchId: string;
  minute: number;
  eventType: "penalty" | "moment";
  description?: string;
  videoPath: string;
}) {
  const { supabase, user } = await authorizedClient();
  const matchId = input.matchId.trim();
  const minute = Math.max(0, Math.min(130, Number(input.minute) || 0));
  const description = input.description?.trim() ||
    (input.eventType === "penalty" ? "Elfmeter" : "Live-Moment");

  if (!matchId) throw new Error("Spiel fehlt.");
  if (!input.videoPath.startsWith(`${user.id}/${matchId}/`)) {
    throw new Error("Ungültiger Video-Pfad.");
  }

  const { data: publicVideo } = supabase.storage
    .from("live-moments")
    .getPublicUrl(input.videoPath);

  const { error } = await supabase.from("match_events").insert({
    match_id: matchId,
    event_type: "note",
    minute,
    description,
    moment_type: input.eventType,
    video_url: publicVideo.publicUrl,
    video_path: input.videoPath,
    created_by: user.id,
  });

  if (error) {
    await supabase.storage.from("live-moments").remove([input.videoPath]);
    throw new Error(`Live-Moment konnte nicht gespeichert werden: ${error.message}`);
  }

  await supabase
    .from("matches")
    .update({ current_minute: minute, status: "live", updated_at: new Date().toISOString() })
    .eq("id", matchId);

  refresh(matchId);
  return { ok: true };
}

export async function undoLastEvent(formData: FormData) {
  const { supabase } = await authorizedClient();
  const matchId = required(formData, "match_id");

  const { data: event, error: eventError } = await supabase
    .from("match_events")
    .select("id, event_type, description, video_path")
    .eq("match_id", matchId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (eventError || !event) throw new Error("Kein Ereignis zum Rückgängig machen vorhanden.");

  if (event.event_type === "goal") {
    const { data: match } = await supabase
      .from("matches")
      .select("home_score, away_score")
      .eq("id", matchId)
      .maybeSingle();

    if (match) {
      const opponentGoal = event.description === "Tor für den Gegner";
      await supabase
        .from("matches")
        .update({
          home_score: opponentGoal ? match.home_score : Math.max(0, (match.home_score ?? 0) - 1),
          away_score: opponentGoal ? Math.max(0, (match.away_score ?? 0) - 1) : match.away_score,
          updated_at: new Date().toISOString(),
        })
        .eq("id", matchId);
    }
  }

  if (event.video_path) {
    await supabase.storage.from("live-moments").remove([event.video_path]);
  }

  const { error } = await supabase.from("match_events").delete().eq("id", event.id);
  if (error) throw new Error(`Ereignis konnte nicht zurückgenommen werden: ${error.message}`);

  refresh(matchId);
  redirect(`/admin/live/${matchId}?undone=1`);
}

export async function toggleVideoHighlight(formData: FormData) {
  const { supabase } = await authorizedClient();
  const matchId = required(formData, "match_id");
  const eventId = required(formData, "event_id");
  const nextValue = required(formData, "next_value") === "true";
  const { data: event, error: readError } = await supabase.from("match_events").select("id, video_url").eq("id", eventId).eq("match_id", matchId).maybeSingle();
  if (readError || !event?.video_url) throw new Error("Video-Moment wurde nicht gefunden.");
  const { error } = await supabase.from("match_events").update({ is_highlight: nextValue }).eq("id", eventId).eq("match_id", matchId);
  if (error) throw new Error(`Highlight konnte nicht geändert werden: ${error.message}`);
  refresh(matchId);
}
