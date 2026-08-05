"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";

function getRequiredText(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();

  if (!value) {
    throw new Error(`Das Feld "${key}" fehlt.`);
  }

  return value;
}

function parseOptionalNumber(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();

  if (!value) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed) || parsed < 0) {
    throw new Error(`Das Feld "${key}" enthält keine gültige Zahl.`);
  }

  return parsed;
}

async function requireUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return supabase;
}

export async function createMatch(formData: FormData) {
  const supabase = await requireUser();

  const competition = getRequiredText(formData, "competition");
  const matchday = String(formData.get("matchday") ?? "").trim() || null;
  const homeTeam = getRequiredText(formData, "home_team");
  const awayTeam = getRequiredText(formData, "away_team");
  const date = getRequiredText(formData, "date");
  const time = getRequiredText(formData, "time");
  const location = getRequiredText(formData, "location");
  const mapsQuery =
    String(formData.get("maps_query") ?? "").trim() || location;
  const status = getRequiredText(formData, "status");

  const matchDate = new Date(`${date}T${time}:00`);

  if (Number.isNaN(matchDate.getTime())) {
    throw new Error("Datum oder Uhrzeit ist ungültig.");
  }

  const { error } = await supabase.from("matches").insert({
    competition,
    matchday,
    home_team: homeTeam,
    away_team: awayTeam,
    match_date: matchDate.toISOString(),
    location,
    maps_query: mapsQuery,
    status,
  });

  if (error) {
    throw new Error(`Spiel konnte nicht gespeichert werden: ${error.message}`);
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/spiele");
  redirect("/admin/spiele?created=1");
}

export async function updateMatch(formData: FormData) {
  const supabase = await requireUser();

  const id = getRequiredText(formData, "id");
  const competition = getRequiredText(formData, "competition");
  const matchday = String(formData.get("matchday") ?? "").trim() || null;
  const homeTeam = getRequiredText(formData, "home_team");
  const awayTeam = getRequiredText(formData, "away_team");
  const date = getRequiredText(formData, "date");
  const time = getRequiredText(formData, "time");
  const location = getRequiredText(formData, "location");
  const mapsQuery =
    String(formData.get("maps_query") ?? "").trim() || location;
  const status = getRequiredText(formData, "status");

  const homeScore = parseOptionalNumber(formData, "home_score");
  const awayScore = parseOptionalNumber(formData, "away_score");

  const scorersText = String(formData.get("scorers") ?? "").trim();
  const scorers = scorersText
    ? scorersText
        .split("\n")
        .map((scorer) => scorer.trim())
        .filter(Boolean)
    : [];

  const matchDate = new Date(`${date}T${time}:00`);

  if (Number.isNaN(matchDate.getTime())) {
    throw new Error("Datum oder Uhrzeit ist ungültig.");
  }

  const { error } = await supabase
    .from("matches")
    .update({
      competition,
      matchday,
      home_team: homeTeam,
      away_team: awayTeam,
      match_date: matchDate.toISOString(),
      location,
      maps_query: mapsQuery,
      status,
      home_score: homeScore,
      away_score: awayScore,
      scorers,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(
      `Spiel konnte nicht aktualisiert werden: ${error.message}`,
    );
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/spiele");
  revalidatePath(`/admin/spiele/${id}`);

  redirect("/admin/spiele?updated=1");
}

export async function deleteMatch(formData: FormData) {
  const supabase = await requireUser();
  const id = getRequiredText(formData, "id");

  const { error } = await supabase.from("matches").delete().eq("id", id);

  if (error) {
    throw new Error(`Spiel konnte nicht gelöscht werden: ${error.message}`);
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/spiele");
  redirect("/admin/spiele?deleted=1");
}
