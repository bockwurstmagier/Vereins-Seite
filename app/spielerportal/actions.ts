"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requirePlayerPortal } from "../../lib/player-portal";

export async function savePlayerResponse(formData: FormData) {
  const auth = await requirePlayerPortal();
  if (!auth.playerId) throw new Error("Kein Spielerprofil verknüpft.");

  const eventType = String(formData.get("event_type") ?? "");
  const eventId = String(formData.get("event_id") ?? "");
  const response = String(formData.get("response") ?? "");
  const note = String(formData.get("note") ?? "").trim() || null;

  if (!["training", "match"].includes(eventType)) {
    throw new Error("Ungültiger Termin.");
  }

  if (!["yes", "maybe", "no"].includes(response)) {
    throw new Error("Ungültige Rückmeldung.");
  }

  const { error } = await auth.supabase.from("player_responses").upsert(
    {
      user_id: auth.user.id,
      player_id: auth.playerId,
      event_type: eventType,
      event_id: eventId,
      response,
      note,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "player_id,event_type,event_id" },
  );

  if (error) {
    throw new Error(`Rückmeldung konnte nicht gespeichert werden: ${error.message}`);
  }

  revalidatePath("/spielerportal");
  redirect("/spielerportal?saved=1");
}

export async function createInjuryReport(formData: FormData) {
  const auth = await requirePlayerPortal();
  if (!auth.playerId) throw new Error("Kein Spielerprofil verknüpft.");

  const description = String(formData.get("description") ?? "").trim();
  if (!description) throw new Error("Bitte Beschwerden beschreiben.");

  const { error } = await auth.supabase.from("player_injury_reports").insert({
    user_id: auth.user.id,
    player_id: auth.playerId,
    body_area: String(formData.get("body_area") ?? "").trim() || null,
    description,
    available_from: String(formData.get("available_from") ?? "").trim() || null,
  });

  if (error) {
    throw new Error(`Meldung konnte nicht gespeichert werden: ${error.message}`);
  }

  revalidatePath("/spielerportal");
  redirect("/spielerportal?injury=1");
}
