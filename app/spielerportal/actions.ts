"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requirePlayerPortal } from "../../lib/player-portal";
import { createAdminClient } from "../../lib/supabase/admin";

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


function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function optionalInteger(
  formData: FormData,
  key: string,
  min: number,
  max: number,
) {
  const value = text(formData, key);
  if (!value) return null;

  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    throw new Error(`Ungültiger Wert für ${key}.`);
  }

  return parsed;
}

export async function updateOwnPlayerProfile(formData: FormData) {
  const auth = await requirePlayerPortal();
  if (!auth.playerId) throw new Error("Kein Spielerprofil verknüpft.");

  const position = text(formData, "position");
  const allowedPositions = ["Torwart", "Abwehr", "Mittelfeld", "Sturm"];
  if (!allowedPositions.includes(position)) {
    throw new Error("Ungültige Spielerposition.");
  }

  const strongFoot = text(formData, "strong_foot");
  if (strongFoot && !["Rechts", "Links", "Beidfüßig"].includes(strongFoot)) {
    throw new Error("Ungültige Angabe beim starken Fuß.");
  }

  const instagramUrl = text(formData, "instagram_url");
  if (instagramUrl) {
    try {
      const url = new URL(instagramUrl);
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
    } catch {
      throw new Error("Bitte einen vollständigen Instagram-Link eingeben.");
    }
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("players")
    .update({
      position,
      shirt_number: optionalInteger(formData, "shirt_number", 0, 99),
      strong_foot: strongFoot || null,
      height_cm: optionalInteger(formData, "height_cm", 120, 230),
      birth_date: text(formData, "birth_date") || null,
      nationality: text(formData, "nationality") || null,
      instagram_url: instagramUrl || null,
      short_profile: text(formData, "short_profile") || null,
      favorite_club: text(formData, "favorite_club") || null,
      favorite_player: text(formData, "favorite_player") || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", auth.playerId);

  if (error) {
    throw new Error(`Profil konnte nicht gespeichert werden: ${error.message}`);
  }

  revalidatePath("/spielerportal");
  revalidatePath("/");
  revalidatePath("/team");
  redirect("/spielerportal?profile_saved=1");
}
