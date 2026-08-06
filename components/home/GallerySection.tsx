import Link from "next/link";
import { Camera, ChevronRight, ImageIcon } from "lucide-react";

import { createClient } from "../../lib/supabase/server";

export default async function GallerySection() {
  const supabase = await createClient();

  const { data: albums } = await supabase
    .from("gallery_albums")
    .select(
      "id,title,slug,category,season,cover_media_id,gallery_media(id,media_type,file_url)",
    )
    .eq("is_public", true)
    .order("sort_order")
    .order("created_at", { ascending: false })
    .limit(5);

  if (!albums?.length) return null;

  return (
    <section id="gallery" className="club-section py-10">
      <div className="pointer-events-none absolute left-[-5rem] top-20 h-64 w-64 rounded-full bg-club-red/10 blur-3xl" />

      <div className="club-container">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Camera
                size={16}
                strokeWidth={2.5}
                className="text-club-light-red"
                aria-hidden="true"
              />
              <p className="club-eyebrow">Momente</p>
            </div>
            <h2 className="club-heading mt-2">Galerie</h2>
          </div>

          <Link
            href="/galerie"
            className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.16em] text-club-light-red"
          >
            Alle Alben
            <ChevronRight size={14} aria-hidden="true" />
          </Link>
        </div>

        <div className="-mx-4 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex w-max gap-4">
            {albums.map((album) => {
              const media = Array.isArray(album.gallery_media)
                ? album.gallery_media
                : [];
              const cover =
                media.find((item) => item.id === album.cover_media_id) ??
                media.find((item) => item.media_type === "image");

              return (
                <Link
                  key={album.id}
                  href={`/galerie/${album.slug}`}
                  className="group relative h-72 w-[78vw] max-w-[320px] overflow-hidden rounded-[2rem] border border-white/10 bg-black shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
                >
                  {cover?.file_url ? (
                    <img
                      src={cover.file_url}
                      alt={album.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-club-burgundy to-black">
                      <ImageIcon size={42} className="text-club-light-red" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-club-light-red">
                      {album.category}
                      {album.season ? ` · ${album.season}` : ""}
                    </p>
                    <h3 className="mt-2 text-2xl font-black uppercase text-white">
                      {album.title}
                    </h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <p className="mt-3 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-600">
          Zum Entdecken nach links wischen
        </p>
      </div>
    </section>
  );
}
