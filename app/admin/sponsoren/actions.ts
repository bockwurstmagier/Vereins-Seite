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

function integer(formData: FormData, key: string) {
  const value = text(formData, key);
  if (!value) return 0;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) throw new Error(`Ungültige Zahl in "${key}".`);
  return parsed;
}

async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

async function uploadLogo(file: File, userId: string) {
  if (!file.size) return { logoUrl: null, logoPath: null };
  if (!file.type.startsWith("image/")) throw new Error("Bitte eine Bilddatei auswählen.");
  if (file.size > 5 * 1024 * 1024) throw new Error("Das Logo darf maximal 5 MB groß sein.");

  const ext = (file.name.split(".").pop() || "png").replace(/[^a-z0-9]/gi, "").toLowerCase();
  const logoPath = `${userId}/${crypto.randomUUID()}.${ext || "png"}`;
  const { supabase } = await requireUser();
  const { error } = await supabase.storage.from("sponsor-logos").upload(logoPath, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  });
  if (error) throw new Error(`Logo konnte nicht hochgeladen werden: ${error.message}`);
  const { data } = supabase.storage.from("sponsor-logos").getPublicUrl(logoPath);
  return { logoUrl: data.publicUrl, logoPath };
}

export async function createSponsor(formData: FormData) {
  const { supabase, user } = await requireUser();
  const logo = formData.get("logo");
  let uploaded = { logoUrl: null as string | null, logoPath: null as string | null };
  if (logo instanceof File && logo.size > 0) uploaded = await uploadLogo(logo, user.id);

  const { error } = await supabase.from("sponsors").insert({
    name: required(formData, "name"),
    website_url: text(formData, "website_url") || null,
    category: required(formData, "category"),
    description: text(formData, "description") || null,
    logo_url: uploaded.logoUrl,
    logo_path: uploaded.logoPath,
    start_date: text(formData, "start_date") || null,
    end_date: text(formData, "end_date") || null,
    is_active: formData.get("is_active") === "on",
    sort_order: integer(formData, "sort_order"),
    created_by: user.id,
  });

  if (error) {
    if (uploaded.logoPath) await supabase.storage.from("sponsor-logos").remove([uploaded.logoPath]);
    throw new Error(`Sponsor konnte nicht gespeichert werden: ${error.message}`);
  }
  revalidatePath("/"); revalidatePath("/sponsoren"); revalidatePath("/admin"); revalidatePath("/admin/sponsoren");
  redirect("/admin/sponsoren?created=1");
}

export async function updateSponsor(formData: FormData) {
  const { supabase, user } = await requireUser();
  const id = required(formData, "id");
  const oldLogoUrl = text(formData, "old_logo_url") || null;
  const oldLogoPath = text(formData, "old_logo_path") || null;
  const logo = formData.get("logo");
  let logoUrl = oldLogoUrl;
  let logoPath = oldLogoPath;
  if (logo instanceof File && logo.size > 0) {
    const uploaded = await uploadLogo(logo, user.id);
    logoUrl = uploaded.logoUrl;
    logoPath = uploaded.logoPath;
  }

  const { error } = await supabase.from("sponsors").update({
    name: required(formData, "name"),
    website_url: text(formData, "website_url") || null,
    category: required(formData, "category"),
    description: text(formData, "description") || null,
    logo_url: logoUrl,
    logo_path: logoPath,
    start_date: text(formData, "start_date") || null,
    end_date: text(formData, "end_date") || null,
    is_active: formData.get("is_active") === "on",
    sort_order: integer(formData, "sort_order"),
    updated_at: new Date().toISOString(),
  }).eq("id", id);

  if (error) {
    if (logoPath && logoPath !== oldLogoPath) await supabase.storage.from("sponsor-logos").remove([logoPath]);
    throw new Error(`Sponsor konnte nicht aktualisiert werden: ${error.message}`);
  }
  if (oldLogoPath && oldLogoPath !== logoPath) await supabase.storage.from("sponsor-logos").remove([oldLogoPath]);
  revalidatePath("/"); revalidatePath("/sponsoren"); revalidatePath("/admin"); revalidatePath("/admin/sponsoren");
  redirect("/admin/sponsoren?updated=1");
}

export async function deleteSponsor(formData: FormData) {
  const { supabase } = await requireUser();
  const id = required(formData, "id");
  const logoPath = text(formData, "logo_path");
  const { error } = await supabase.from("sponsors").delete().eq("id", id);
  if (error) throw new Error(`Sponsor konnte nicht gelöscht werden: ${error.message}`);
  if (logoPath) await supabase.storage.from("sponsor-logos").remove([logoPath]);
  revalidatePath("/"); revalidatePath("/sponsoren"); revalidatePath("/admin"); revalidatePath("/admin/sponsoren");
  redirect("/admin/sponsoren?deleted=1");
}
