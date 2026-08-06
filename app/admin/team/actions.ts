"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";

function getText(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function getRequiredText(formData: FormData, key: string) {
  const value = getText(formData, key);

  if (!value) {
    throw new Error(`Das Feld "${key}" fehlt.`);
  }

  return value;
}

function parseOptionalInteger(formData: FormData, key: string) {
  const value = getText(formData, key);

  if (!value) return null;

  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed)) {
    throw new Error(`Das Feld "${key}" enthält keine gültige Zahl.`);
  }

  return parsed;
}

function createSlug(firstName: string, lastName: string) {
  const normalized = `${firstName}-${lastName}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${normalized}-${Date.now()}`;
}

async function requireUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return { supabase, user };
}

export async function createPlayer(formData: FormData) {
  const { supabase, user } = await requireUser();

  const firstName = getRequiredText(formData, "first_name");
  const lastName = getRequiredText(formData, "last_name");
  const position = getRequiredText(formData, "position");
  const squad = getRequiredText(formData, "squad");
  const directImageUrl = getText(formData, "direct_image_url") || null;
  const directImagePath = getText(formData, "direct_image_path") || null;

  const { error } = await supabase.from("players").insert({
    first_name: firstName,
    last_name: lastName,
    slug: createSlug(firstName, lastName),
    squad,
    shirt_number: parseOptionalInteger(formData, "shirt_number"),
    position,
    strong_foot: getText(formData, "strong_foot") || null,
    height_cm: parseOptionalInteger(formData, "height_cm"),
    birth_date: getText(formData, "birth_date") || null,
    nationality: getText(formData, "nationality") || null,
    instagram_url: getText(formData, "instagram_url") || null,
    short_profile: getText(formData, "short_profile") || null,
    favorite_club: getText(formData, "favorite_club") || null,
    favorite_player: getText(formData, "favorite_player") || null,
    image_url: directImageUrl,
    image_path: directImagePath,
    is_active: formData.get("is_active") === "on",
    sort_order: parseOptionalInteger(formData, "sort_order") ?? 0,
    created_by: user.id,
  });

  if (error) {
    if (directImagePath) {
      await supabase.storage.from("player-images").remove([directImagePath]);
    }

    throw new Error(
      `Spieler konnte nicht gespeichert werden: ${error.message}`,
    );
  }

  revalidatePath("/");
  revalidatePath("/team");
  revalidatePath("/admin");
  revalidatePath("/admin/team");
  redirect("/admin/team?created=1");
}

export async function updatePlayer(formData: FormData) {
  const { supabase } = await requireUser();

  const id = getRequiredText(formData, "id");
  const firstName = getRequiredText(formData, "first_name");
  const lastName = getRequiredText(formData, "last_name");
  const position = getRequiredText(formData, "position");
  const squad = getRequiredText(formData, "squad");
  const oldImageUrl = getText(formData, "old_image_url") || null;
  const oldImagePath = getText(formData, "old_image_path") || null;
  const directImageUrl = getText(formData, "direct_image_url");
  const directImagePath = getText(formData, "direct_image_path");

  const imageUrl = directImageUrl || null;
  const imagePath = directImagePath || null;

  const { error } = await supabase
    .from("players")
    .update({
      first_name: firstName,
      last_name: lastName,
      squad,
      shirt_number: parseOptionalInteger(formData, "shirt_number"),
      position,
      strong_foot: getText(formData, "strong_foot") || null,
      height_cm: parseOptionalInteger(formData, "height_cm"),
      birth_date: getText(formData, "birth_date") || null,
      nationality: getText(formData, "nationality") || null,
      instagram_url: getText(formData, "instagram_url") || null,
      short_profile: getText(formData, "short_profile") || null,
      favorite_club: getText(formData, "favorite_club") || null,
      favorite_player: getText(formData, "favorite_player") || null,
      image_url: imageUrl,
      image_path: imagePath,
      is_active: formData.get("is_active") === "on",
      sort_order: parseOptionalInteger(formData, "sort_order") ?? 0,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    if (imagePath && imagePath !== oldImagePath) {
      await supabase.storage.from("player-images").remove([imagePath]);
    }

    throw new Error(
      `Spieler konnte nicht aktualisiert werden: ${error.message}`,
    );
  }

  if (oldImagePath && imagePath !== oldImagePath) {
    await supabase.storage.from("player-images").remove([oldImagePath]);
  }

  revalidatePath("/");
  revalidatePath("/team");
  revalidatePath(`/team/${getText(formData, "slug")}`);
  revalidatePath("/admin");
  revalidatePath("/admin/team");
  revalidatePath(`/admin/team/${id}`);
  redirect("/admin/team?updated=1");
}

export async function deletePlayer(formData: FormData) {
  const { supabase } = await requireUser();

  const id = getRequiredText(formData, "id");
  const imagePath = getText(formData, "image_path");

  const { error } = await supabase.from("players").delete().eq("id", id);

  if (error) {
    throw new Error(
      `Spieler konnte nicht gelöscht werden: ${error.message}`,
    );
  }

  if (imagePath) {
    await supabase.storage.from("player-images").remove([imagePath]);
  }

  revalidatePath("/");
  revalidatePath("/team");
  revalidatePath("/admin");
  revalidatePath("/admin/team");
  redirect("/admin/team?deleted=1");
}
