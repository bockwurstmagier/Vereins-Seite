"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "../../../lib/auth/roles";
import { createClient } from "../../../lib/supabase/server";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function required(formData: FormData, key: string) {
  const value = text(formData, key);
  if (!value) throw new Error(`Das Feld ${key} fehlt.`);
  return value;
}

function integer(formData: FormData, key: string) {
  const value = Number.parseInt(required(formData, key), 10);
  if (Number.isNaN(value)) throw new Error(`${key} ist ungültig.`);
  return value;
}

function formValues(formData: FormData) {
  const form = text(formData, "form")
    .toUpperCase()
    .split(/[\s,;]+/)
    .filter((value) => ["W", "D", "L"].includes(value))
    .slice(-5);

  return {
    season: required(formData, "season"),
    competition: required(formData, "competition"),
    position: integer(formData, "position"),
    team_name: required(formData, "team_name"),
    played: integer(formData, "played"),
    wins: integer(formData, "wins"),
    draws: integer(formData, "draws"),
    losses: integer(formData, "losses"),
    goals_for: integer(formData, "goals_for"),
    goals_against: integer(formData, "goals_against"),
    points: integer(formData, "points"),
    form,
    is_club: formData.get("is_club") === "on",
    updated_at: new Date().toISOString(),
  };
}

export async function createStanding(formData: FormData) {
  const profile = await requireRole(["administrator", "vorstand", "trainer"]);
  const supabase = await createClient();
  const { error } = await supabase.from("standings").insert({
    ...formValues(formData),
    created_by: profile.id,
  });
  if (error) throw new Error(`Tabellenzeile konnte nicht gespeichert werden: ${error.message}`);
  revalidatePath("/");
  revalidatePath("/tabelle");
  revalidatePath("/admin/tabelle");
  redirect("/admin/tabelle?created=1");
}

export async function updateStanding(formData: FormData) {
  await requireRole(["administrator", "vorstand", "trainer"]);
  const supabase = await createClient();
  const id = required(formData, "id");
  const { error } = await supabase
    .from("standings")
    .update(formValues(formData))
    .eq("id", id);
  if (error) throw new Error(`Tabellenzeile konnte nicht aktualisiert werden: ${error.message}`);
  revalidatePath("/");
  revalidatePath("/tabelle");
  revalidatePath("/admin/tabelle");
  redirect("/admin/tabelle?updated=1");
}

export async function deleteStanding(formData: FormData) {
  await requireRole(["administrator", "vorstand"]);
  const supabase = await createClient();
  const id = required(formData, "id");
  const { error } = await supabase.from("standings").delete().eq("id", id);
  if (error) throw new Error(`Tabellenzeile konnte nicht gelöscht werden: ${error.message}`);
  revalidatePath("/");
  revalidatePath("/tabelle");
  revalidatePath("/admin/tabelle");
  redirect("/admin/tabelle?deleted=1");
}
