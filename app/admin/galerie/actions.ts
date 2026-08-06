"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "../../../lib/auth/roles";
import { createClient } from "../../../lib/supabase/server";

const ALLOWED_ROLES = ["administrator", "vorstand", "social_media"] as const;
const MAX_IMAGE_SIZE = 15 * 1024 * 1024;
const MAX_VIDEO_SIZE = 25 * 1024 * 1024;

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

export async function uploadGalleryMedia(formData: FormData) {
  const { supabase, user } = await getContext();
  const albumId = text(formData, "album_id");
  const photographer = text(formData, "photographer") || null;
  const files = formData
    .getAll("files")
    .filter((value): value is File => value instanceof File && value.size > 0);

  if (!albumId) throw new Error("Bitte ein Album auswählen.");
  if (!files.length) throw new Error("Bitte mindestens eine Datei auswählen.");

  const { data: lastMedia } = await supabase
    .from("gallery_media")
    .select("sort_order")
    .eq("album_id", albumId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  let sortOrder = (lastMedia?.sort_order ?? -1) + 1;
  const uploadedPaths: string[] = [];

  try {
    for (const file of files) {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");

      if (!isImage && !isVideo) {
        throw new Error(`${file.name}: Nur Bilder und Videos sind erlaubt.`);
      }

      const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
      if (file.size > maxSize) {
        throw new Error(
          `${file.name}: Datei ist größer als ${isImage ? "15" : "25"} MB.`,
        );
      }

      const extension =
        file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") ||
        (isVideo ? "mp4" : "jpg");
      const filePath = `${albumId}/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("gallery-media")
        .upload(filePath, file, {
          cacheControl: "31536000",
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`${file.name}: ${uploadError.message}`);
      }

      uploadedPaths.push(filePath);

      const { data: publicUrl } = supabase.storage
        .from("gallery-media")
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase
        .from("gallery_media")
        .insert({
          album_id: albumId,
          media_type: isVideo ? "video" : "image",
          title: file.name.replace(/\.[^.]+$/, ""),
          file_url: publicUrl.publicUrl,
          file_path: filePath,
          mime_type: file.type,
          sort_order: sortOrder,
          is_public: true,
          photographer,
          created_by: user.id,
        });

      if (insertError) throw new Error(insertError.message);
      sortOrder += 1;
    }
  } catch (error) {
    if (uploadedPaths.length) {
      await supabase.storage.from("gallery-media").remove(uploadedPaths);
    }
    throw error;
  }

  const { data: album } = await supabase
    .from("gallery_albums")
    .select("cover_media_id")
    .eq("id", albumId)
    .single();

  if (!album?.cover_media_id) {
    const { data: firstImage } = await supabase
      .from("gallery_media")
      .select("id")
      .eq("album_id", albumId)
      .eq("media_type", "image")
      .order("sort_order")
      .limit(1)
      .maybeSingle();

    if (firstImage) {
      await supabase
        .from("gallery_albums")
        .update({ cover_media_id: firstImage.id })
        .eq("id", albumId);
    }
  }

  revalidateGallery();
  redirect(`/admin/galerie?album=${albumId}&uploaded=${files.length}`);
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
  revalidatePath("/");
  revalidatePath("/galerie");
  revalidatePath("/admin");
  revalidatePath("/admin/galerie");
}
