"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "../../../lib/auth/roles";
import { createClient } from "../../../lib/supabase/server";

const ROLES = ["administrator", "trainer", "betreuer"] as const;

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function required(formData: FormData, key: string) {
  const value = text(formData, key);
  if (!value) throw new Error(`Das Feld "${key}" fehlt.`);
  return value;
}

function refresh() {
  revalidatePath("/admin/trainer");
}

export async function createTrainingSession(formData: FormData) {
  await requireRole([...ROLES]);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const sessionDate = required(formData, "session_date");
  const intensity = Number(text(formData, "intensity") || 3);
  const duration = Number(text(formData, "duration_minutes") || 90);

  const { data, error } = await supabase
    .from("training_sessions")
    .insert({
      title: text(formData, "title") || "Training",
      session_date: new Date(sessionDate).toISOString(),
      location: text(formData, "location") || null,
      focus: text(formData, "focus") || null,
      intensity,
      duration_minutes: duration,
      notes: text(formData, "notes") || null,
      created_by: user?.id ?? null,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(
      `Training konnte nicht angelegt werden: ${error?.message ?? "Unbekannter Fehler"}`,
    );
  }

  refresh();
  redirect(`/admin/trainer/training/${data.id}`);
}

export async function saveAttendance(formData: FormData) {
  await requireRole([...ROLES]);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const sessionId = required(formData, "session_id");
  const playerIds = formData.getAll("player_id").map(String);
  const rows = playerIds.map((playerId) => ({
    training_session_id: sessionId,
    player_id: playerId,
    status: text(formData, `status_${playerId}`) || "pending",
    minutes: Number(text(formData, `minutes_${playerId}`) || 0) || null,
    note: text(formData, `note_${playerId}`) || null,
    updated_by: user?.id ?? null,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from("training_attendance")
    .upsert(rows, { onConflict: "training_session_id,player_id" });

  if (error) {
    throw new Error(`Anwesenheit konnte nicht gespeichert werden: ${error.message}`);
  }

  refresh();
  revalidatePath(`/admin/trainer/training/${sessionId}`);
  redirect(`/admin/trainer/training/${sessionId}?saved=1`);
}

export async function saveAvailability(formData: FormData) {
  await requireRole([...ROLES]);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const playerId = required(formData, "player_id");
  const status = required(formData, "status");

  if (status === "fit") {
    await supabase
      .from("player_availability")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("player_id", playerId)
      .eq("is_active", true);

    refresh();
    redirect("/admin/trainer?availability=1");
  }

  await supabase
    .from("player_availability")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("player_id", playerId)
    .eq("is_active", true);

  const { error } = await supabase.from("player_availability").insert({
    player_id: playerId,
    status,
    reason: text(formData, "reason") || null,
    start_date: text(formData, "start_date") || new Date().toISOString().slice(0, 10),
    end_date: text(formData, "end_date") || null,
    note: text(formData, "note") || null,
    is_active: true,
    created_by: user?.id ?? null,
  });

  if (error) {
    throw new Error(`Spielerstatus konnte nicht gespeichert werden: ${error.message}`);
  }

  refresh();
  redirect("/admin/trainer?availability=1");
}
