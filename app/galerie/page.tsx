import Link from "next/link";
import { Camera, ChevronRight, Film, ImageIcon } from "lucide-react";

import BottomNavigation from "../../components/home/layout/BottomNavigation";
import { createClient } from "../../lib/supabase/server";

export const metadata = {
  title: "Galerie | SpVgg Middelich-Resse",
};

export const revalidate = 0;

type AlbumRow = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string;
  season: string | null;
  cover_media_id: string | null;
};

type MediaRow = {
  id: string;
  album_id: string;
  media_type: string;
  file_url: string | null;
};

export default async function GalleryPage() {
  const supabase = await createClient();

  const { data: albums } = await supabase
    .from("gallery_albums")
    .select(
      "id,title,slug,description,category,season,cover_media_id",
    )
    .eq("is_public", true)
    .order("sort_order")
    .order("created_at", { ascending: false });

  const albumIds = (albums ?? []).map((album) => album.id);

  const { data: media } = albumIds.length
    ? await supabase
        .from("gallery_media")
        .select("id,album_id,media_type,file_url")
        .in("album_id", albumIds)
        .eq("is_public", true)
        .order("sort_order")
        .order("created_at")
    : { data: [] };

  const mediaByAlbum = new Map<string, MediaRow[]>();

  for (const item of (media ?? []) as MediaRow[]) {
    const current = mediaByAlbum.get(item.album_id) ?? [];
    current.push(item);
    mediaByAlbum.set(item.album_id, current);
  }

  const resolvedAlbums = ((albums ?? []) as AlbumRow[]).map((album) => {
    const albumMedia = mediaByAlbum.get(album.id) ?? [];
    const cover =
      albumMedia.find(
        (item) =>
          item.id === album.cover_media_id &&
          item.media_type === "image" &&
          item.file_url,
      ) ??
      albumMedia.find(
        (item) => item.media_type === "image" && item.file_url,
      ) ??
      albumMedia.find((item) => item.file_url);

    return { ...album, media: albumMedia, cover };
  });

  return (
    <main className="min-h-screen bg-black pb-28 text-white">
      <section className="border-b border-white/10 bg-gradient-to-br from-club-burgundy/75 via-club-dark-red/35 to-black px-4 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-3">
            <div className="club-icon-box">
              <Camera size={20} />
            </div>
            <div>
              <p className="club-eyebrow">Unsere Momente</p>
              <h1 className="club-heading mt-2">Galerie</h1>
            </div>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400">
            Spieltage, Training, Mannschaft, Fans und besondere Vereinsmomente.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        {resolvedAlbums.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {resolvedAlbums.map((album) => {
              const videoCount = album.media.filter(
                (item) => item.media_type === "video",
              ).length;

              return (
                <Link
                  key={album.id}
                  href={`/galerie/${album.slug}`}
                  className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035] transition hover:-translate-y-1 hover:border-club-light-red/25"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-black">
                    {album.cover?.file_url ? (
                      <img
                        src={album.cover.file_url}
                        alt={album.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-club-burgundy to-black">
                        <ImageIcon size={42} className="text-club-light-red" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/15 to-transparent" />
                    <span className="absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-club-light-red backdrop-blur">
                      {album.category}
                    </span>
                    <div className="absolute bottom-4 right-4 flex gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-3 py-1.5 text-[9px] font-black text-white backdrop-blur">
                        <ImageIcon size={12} />
                        {album.media.length}
                      </span>
                      {videoCount > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-3 py-1.5 text-[9px] font-black text-white backdrop-blur">
                          <Film size={12} />
                          {videoCount}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <h2 className="truncate text-xl font-black uppercase text-white">
                          {album.title}
                        </h2>
                        <p className="mt-1 text-xs text-zinc-600">
                          {album.season || "SpVgg Middelich-Resse"}
                        </p>
                      </div>
                      <ChevronRight
                        size={18}
                        className="text-club-light-red"
                      />
                    </div>
                    {album.description && (
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-500">
                        {album.description}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-white/10 py-16 text-center">
            <Camera size={42} className="mx-auto text-zinc-700" />
            <h2 className="mt-4 text-xl font-black uppercase">
              Noch keine öffentlichen Alben
            </h2>
            <p className="mt-2 text-sm text-zinc-600">
              Neue Vereinsmomente erscheinen hier automatisch.
            </p>
          </div>
        )}
      </section>

      <BottomNavigation />
    </main>
  );
}
