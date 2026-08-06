"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "../../../lib/auth/roles";
import { createClient } from "../../../lib/supabase/server";

const ALLOWED_ROLES = ["administrator", "vorstand", "social_media"] as const;

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function getContext() {
  await requireRole([...ALLOWED_ROLES]);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  return { supabase, user };
}

export async function createGalleryAlbum(formData: FormData) {
  const { supabase, user } = await getContext();

  const title = text(formData, "title");
  if (!title) throw new Error("Bitte einen Albumtitel eingeben.");

  const slug = `${slugify(title)}-${Date.now()}`;

  const { data, error } = await supabase
    .from("gallery_albums")
    .insert({
      title,
      slug,
      description: text(formData, "description") || null,
      category: text(formData, "category") || "Spieltag",
      season: text(formData, "season") || null,
      match_id: text(formData, "match_id") || null,
      is_public: text(formData, "is_public") !== "false",
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(
      `Album konnte nicht erstellt werden: ${error?.message ?? "Unbekannter Fehler"}`,
    );
  }

  revalidateGallery();
  redirect(`/admin/galerie?album=${data.id}&created=1`);
}

export async function updateGalleryAlbum(formData: FormData) {
  const { supabase } = await getContext();
  const albumId = text(formData, "album_id");
  const title = text(formData, "title");

  if (!albumId || !title) throw new Error("Albumdaten fehlen.");

  const { error } = await supabase
    .from("gallery_albums")
    .update({
      title,
      description: text(formData, "description") || null,
      category: text(formData, "category") || "Spieltag",
      season: text(formData, "season") || null,
      match_id: text(formData, "match_id") || null,
      is_public: text(formData, "is_public") === "true",
      updated_at: new Date().toISOString(),
    })
    .eq("id", albumId);

  if (error) throw new Error(`Album konnte nicht gespeichert werden: ${error.message}`);

  revalidateGallery();
  redirect(`/admin/galerie?album=${albumId}&saved=1`);
}

type DirectUploadItem = {
  mediaType: "image" | "video";
  title: string;
  fileUrl: string;
  filePath: string;
  mimeType: string;
};

export async function registerDirectGalleryUploads(input: {
  albumId: string;
  photographer?: string;
  items: DirectUploadItem[];
}) {
  const { supabase, user } = await getContext();

  const albumId = input.albumId.trim();
  const photographer = input.photographer?.trim() || null;
  const items = Array.isArray(input.items) ? input.items : [];

  if (!albumId) throw new Error("Bitte ein Album auswählen.");
  if (!items.length) throw new Error("Es wurden keine Uploads übermittelt.");
  if (items.length > 100) {
    throw new Error("Maximal 100 Dateien pro Upload-Vorgang.");
  }

  const { data: lastMedia, error: lastMediaError } = await supabase
    .from("gallery_media")
    .select("sort_order")
    .eq("album_id", albumId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lastMediaError) {
    throw new Error(
      `Reihenfolge konnte nicht ermittelt werden: ${lastMediaError.message}`,
    );
  }

  let sortOrder = (lastMedia?.sort_order ?? -1) + 1;

  const rows = items.map((item) => {
    if (!["image", "video"].includes(item.mediaType)) {
      throw new Error("Ungültiger Medientyp.");
    }

    if (
      !item.filePath.startsWith(`${albumId}/`) ||
      !item.fileUrl.includes("/gallery-media/")
    ) {
      throw new Error("Ungültiger Galerie-Dateipfad.");
    }

    return {
      album_id: albumId,
      media_type: item.mediaType,
      title: item.title.trim() || "Galerie-Medium",
      file_url: item.fileUrl,
      file_path: item.filePath,
      mime_type: item.mimeType || null,
      sort_order: sortOrder++,
      is_public: true,
      photographer,
      created_by: user.id,
    };
  });

  const { data: inserted, error: insertError } = await supabase
    .from("gallery_media")
    .insert(rows)
    .select("id,media_type");

  if (insertError) {
    throw new Error(
      `Dateiinformationen konnten nicht gespeichert werden: ${insertError.message}`,
    );
  }

  const { data: album, error: albumError } = await supabase
    .from("gallery_albums")
    .select("cover_media_id")
    .eq("id", albumId)
    .single();

  if (albumError) {
    throw new Error(`Album konnte nicht geladen werden: ${albumError.message}`);
  }

  if (!album.cover_media_id) {
    const firstImage = inserted?.find((item) => item.media_type === "image");

    if (firstImage) {
      const { error: coverError } = await supabase
        .from("gallery_albums")
        .update({
          cover_media_id: firstImage.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", albumId);

      if (coverError) {
        throw new Error(
          `Titelbild konnte nicht automatisch gesetzt werden: ${coverError.message}`,
        );
      }
    }
  }

  revalidateGallery();

  return {
    success: true,
    uploaded: rows.length,
  };
}

export async function addExternalVideo(formData: FormData) {
  const { supabase, user } = await getContext();
  const albumId = text(formData, "album_id");
  const externalUrl = text(formData, "external_url");

  if (!albumId || !externalUrl) throw new Error("Album oder Video-Link fehlt.");

  const { data: lastMedia } = await supabase
    .from("gallery_media")
    .select("sort_order")
    .eq("album_id", albumId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("gallery_media").insert({
    album_id: albumId,
    media_type: "video",
    title: text(formData, "title") || "Video",
    caption: text(formData, "caption") || null,
    external_url: externalUrl,
    sort_order: (lastMedia?.sort_order ?? -1) + 1,
    is_public: true,
    photographer: text(formData, "photographer") || null,
    created_by: user.id,
  });

  if (error) throw new Error(`Video konnte nicht gespeichert werden: ${error.message}`);

  revalidateGallery();
  redirect(`/admin/galerie?album=${albumId}&video=1`);
}

export async function updateGalleryMedia(formData: FormData) {
  const { supabase } = await getContext();
  const mediaId = text(formData, "media_id");
  const albumId = text(formData, "album_id");

  const { error } = await supabase
    .from("gallery_media")
    .update({
      title: text(formData, "title") || null,
      caption: text(formData, "caption") || null,
      photographer: text(formData, "photographer") || null,
      is_public: text(formData, "is_public") === "true",
    })
    .eq("id", mediaId);

  if (error) throw new Error(`Medium konnte nicht gespeichert werden: ${error.message}`);

  revalidateGallery();
  redirect(`/admin/galerie?album=${albumId}&media_saved=1`);
}

export async function setAlbumCover(formData: FormData) {
  const { supabase } = await getContext();
  const albumId = text(formData, "album_id");
  const mediaId = text(formData, "media_id");

  const { error } = await supabase
    .from("gallery_albums")
    .update({
      cover_media_id: mediaId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", albumId);

  if (error) throw new Error(`Titelbild konnte nicht gesetzt werden: ${error.message}`);

  revalidateGallery();
  redirect(`/admin/galerie?album=${albumId}&cover=1`);
}

export async function moveGalleryMedia(formData: FormData) {
  const { supabase } = await getContext();
  const albumId = text(formData, "album_id");
  const mediaId = text(formData, "media_id");
  const direction = text(formData, "direction") === "up" ? -1 : 1;

  const { data: items, error } = await supabase
    .from("gallery_media")
    .select("id,sort_order")
    .eq("album_id", albumId)
    .order("sort_order")
    .order("created_at");

  if (error || !items) throw new Error("Reihenfolge konnte nicht geladen werden.");

  const index = items.findIndex((item) => item.id === mediaId);
  const targetIndex = index + direction;

  if (index < 0 || targetIndex < 0 || targetIndex >= items.length) {
    redirect(`/admin/galerie?album=${albumId}`);
  }

  const current = items[index];
  const target = items[targetIndex];

  await supabase
    .from("gallery_media")
    .update({ sort_order: target.sort_order })
    .eq("id", current.id);
  await supabase
    .from("gallery_media")
    .update({ sort_order: current.sort_order })
    .eq("id", target.id);

  revalidateGallery();
  redirect(`/admin/galerie?album=${albumId}`);
}

export async function deleteGalleryMedia(formData: FormData) {
  const { supabase } = await getContext();
  const mediaId = text(formData, "media_id");
  const albumId = text(formData, "album_id");

  const { data: media } = await supabase
    .from("gallery_media")
    .select("file_path")
    .eq("id", mediaId)
    .single();

  const { error } = await supabase.from("gallery_media").delete().eq("id", mediaId);
  if (error) throw new Error(`Medium konnte nicht gelöscht werden: ${error.message}`);

  if (media?.file_path) {
    await supabase.storage.from("gallery-media").remove([media.file_path]);
  }

  revalidateGallery();
  redirect(`/admin/galerie?album=${albumId}&deleted=1`);
}

export async function deleteGalleryAlbum(formData: FormData) {
  const { supabase } = await getContext();
  const albumId = text(formData, "album_id");

  const { data: media } = await supabase
    .from("gallery_media")
    .select("file_path")
    .eq("album_id", albumId)
    .not("file_path", "is", null);

  const { error } = await supabase.from("gallery_albums").delete().eq("id", albumId);
  if (error) throw new Error(`Album konnte nicht gelöscht werden: ${error.message}`);

  const paths = (media ?? [])
    .map((item) => item.file_path)
    .filter((value): value is string => Boolean(value));

  if (paths.length) await supabase.storage.from("gallery-media").remove(paths);

  revalidateGallery();
  redirect("/admin/galerie?album_deleted=1");
}

function revalidateGallery() {
  revalidatePath("/", "page");
  revalidatePath("/galerie", "page");
  revalidatePath("/galerie", "layout");
  revalidatePath("/admin", "page");
  revalidatePath("/admin/galerie", "page");
}
