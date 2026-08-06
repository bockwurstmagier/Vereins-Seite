"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "../../../lib/auth/roles";
import { normalizeClubName } from "../../../lib/clubs";
import { createClient } from "../../../lib/supabase/server";

const ROLES = ["administrator", "vorstand"] as const;

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function required(formData: FormData, key: string) {
  const value = text(formData, key);
  if (!value) throw new Error(`Das Feld "${key}" fehlt.`);
  return value;
}

function parseAliases(formData: FormData) {
  return text(formData, "aliases")
    .split(/\r?\n|,/)
    .map((value) => value.trim())
    .filter(Boolean);
}

async function uploadLogo(
  supabase: Awaited<ReturnType<typeof createClient>>,
  file: File,
) {
  if (!file.size) return { logoUrl: null, logoPath: null };
  if (!file.type.startsWith("image/")) {
    throw new Error("Bitte eine PNG-, JPG-, SVG- oder WebP-Datei auswählen.");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Das Vereinslogo darf maximal 5 MB groß sein.");
  }

  const extension = (file.name.split(".").pop() || "png")
    .replace(/[^a-z0-9]/gi, "")
    .toLowerCase();
  const logoPath = `${crypto.randomUUID()}.${extension || "png"}`;

  const { error } = await supabase.storage
    .from("club-logos")
    .upload(logoPath, file, {
      cacheControl: "31536000",
      upsert: false,
      contentType: file.type,
    });

  if (error) {
    throw new Error(`Vereinslogo konnte nicht hochgeladen werden: ${error.message}`);
  }

  const { data } = supabase.storage.from("club-logos").getPublicUrl(logoPath);
  return { logoUrl: data.publicUrl, logoPath };
}

function revalidateClubViews() {
  revalidatePath("/");
  revalidatePath("/spielplan");
  revalidatePath("/tabelle");
  revalidatePath("/match-center");
  revalidatePath("/admin/vereine");
  revalidatePath("/admin/social");
}

export async function updateClub(formData: FormData) {
  await requireRole([...ROLES]);
  const supabase = await createClient();

  const id = required(formData, "id");
  const name = required(formData, "name");
  const oldLogoPath = text(formData, "old_logo_path") || null;
  const oldLogoUrl = text(formData, "old_logo_url") || null;
  const logo = formData.get("logo");

  let logoPath = oldLogoPath;
  let logoUrl = oldLogoUrl;

  if (logo instanceof File && logo.size > 0) {
    const uploaded = await uploadLogo(supabase, logo);
    logoPath = uploaded.logoPath;
    logoUrl = uploaded.logoUrl;
  }

  const { error } = await supabase
    .from("clubs")
    .update({
      name,
      normalized_name: normalizeClubName(name),
      short_name: text(formData, "short_name") || null,
      website_url: text(formData, "website_url") || null,
      primary_color: text(formData, "primary_color") || null,
      secondary_color: text(formData, "secondary_color") || null,
      aliases: parseAliases(formData),
      logo_url: logoUrl,
      logo_path: logoPath,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    if (logoPath && logoPath !== oldLogoPath) {
      await supabase.storage.from("club-logos").remove([logoPath]);
    }
    throw new Error(`Verein konnte nicht gespeichert werden: ${error.message}`);
  }

  if (oldLogoPath && oldLogoPath !== logoPath) {
    await supabase.storage.from("club-logos").remove([oldLogoPath]);
  }

  revalidateClubViews();
  redirect("/admin/vereine?updated=1");
}

export async function deleteClubLogo(formData: FormData) {
  await requireRole([...ROLES]);
  const supabase = await createClient();
  const id = required(formData, "id");
  const logoPath = text(formData, "logo_path");

  const { error } = await supabase
    .from("clubs")
    .update({
      logo_url: null,
      logo_path: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(`Logo konnte nicht entfernt werden: ${error.message}`);
  if (logoPath) await supabase.storage.from("club-logos").remove([logoPath]);

  revalidateClubViews();
  redirect("/admin/vereine?logoRemoved=1");
}
