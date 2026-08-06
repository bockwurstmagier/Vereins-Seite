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

function createSlug(value: string) {
  const normalized = value
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

  if (!user) {
    redirect("/login");
  }

  return { supabase, user };
}

export async function createNews(formData: FormData) {
  const { supabase, user } = await requireUser();

  const title = getRequiredText(formData, "title");
  const excerpt = getText(formData, "excerpt") || null;
  const content = getRequiredText(formData, "content");
  const category = getRequiredText(formData, "category");
  const status = getRequiredText(formData, "status");
  const imageUrl = getText(formData, "direct_image_url") || null;
  const imagePath = getText(formData, "direct_image_path") || null;

  const publishedAt =
    status === "published" ? new Date().toISOString() : null;

  const { error } = await supabase.from("news").insert({
    title,
    slug: createSlug(title),
    excerpt,
    content,
    category,
    image_url: imageUrl,
    image_path: imagePath,
    status,
    published_at: publishedAt,
    created_by: user.id,
  });

  if (error) {
    if (imagePath) {
      await supabase.storage.from("news-images").remove([imagePath]);
    }

    throw new Error(`News konnte nicht gespeichert werden: ${error.message}`);
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/news");
  redirect("/admin/news?created=1");
}

export async function updateNews(formData: FormData) {
  const { supabase } = await requireUser();

  const id = getRequiredText(formData, "id");
  const title = getRequiredText(formData, "title");
  const excerpt = getText(formData, "excerpt") || null;
  const content = getRequiredText(formData, "content");
  const category = getRequiredText(formData, "category");
  const status = getRequiredText(formData, "status");
  const oldImagePath = getText(formData, "old_image_path") || null;
  const oldPublishedAt = getText(formData, "old_published_at") || null;
  const directImageUrl = getText(formData, "direct_image_url");
  const directImagePath = getText(formData, "direct_image_path");

  const imageUrl = directImageUrl || null;
  const imagePath = directImagePath || null;

  const publishedAt =
    status === "published"
      ? oldPublishedAt || new Date().toISOString()
      : null;

  const { error } = await supabase
    .from("news")
    .update({
      title,
      excerpt,
      content,
      category,
      image_url: imageUrl,
      image_path: imagePath,
      status,
      published_at: publishedAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    if (imagePath && imagePath !== oldImagePath) {
      await supabase.storage.from("news-images").remove([imagePath]);
    }

    throw new Error(`News konnte nicht aktualisiert werden: ${error.message}`);
  }

  if (oldImagePath && imagePath !== oldImagePath) {
    await supabase.storage.from("news-images").remove([oldImagePath]);
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/news");
  revalidatePath(`/admin/news/${id}`);
  redirect("/admin/news?updated=1");
}

export async function deleteNews(formData: FormData) {
  const { supabase } = await requireUser();

  const id = getRequiredText(formData, "id");
  const imagePath = getText(formData, "image_path");

  const { error } = await supabase.from("news").delete().eq("id", id);

  if (error) {
    throw new Error(`News konnte nicht gelöscht werden: ${error.message}`);
  }

  if (imagePath) {
    await supabase.storage.from("news-images").remove([imagePath]);
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/news");
  redirect("/admin/news?deleted=1");
}
