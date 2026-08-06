import Link from "next/link";
import { ArrowLeft, Camera, Film, ImageIcon } from "lucide-react";
import { notFound } from "next/navigation";

import GalleryLightbox from "../../../components/gallery/GalleryLightbox";
import BottomNavigation from "../../../components/home/layout/BottomNavigation";
import { createClient } from "../../../lib/supabase/server";

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 60;

export default async function GalleryAlbumPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: album } = await supabase
    .from("gallery_albums")
    .select(
      "id,title,description,category,season,created_at,match_id,matches(home_team,away_team,match_date)",
    )
    .eq("slug", slug)
    .eq("is_public", true)
    .maybeSingle();

  if (!album) notFound();

  const { data: media } = await supabase
    .from("gallery_media")
    .select(
      "id,media_type,title,caption,file_url,external_url,photographer,sort_order",
    )
    .eq("album_id", album.id)
    .eq("is_public", true)
    .order("sort_order")
    .order("created_at");

  const images = (media ?? []).filter((item) => item.media_type === "image");
  const videos = (media ?? []).filter((item) => item.media_type === "video");

  return (
    <main className="min-h-screen bg-black pb-28 text-white">
      <section className="border-b border-white/10 bg-gradient-to-br from-club-burgundy/75 via-club-dark-red/35 to-black px-4 py-10">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/galerie"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-club-light-red"
          >
            <ArrowLeft size={16} />
            Alle Alben
          </Link>

          <div className="mt-7 flex items-start gap-4">
            <div className="club-icon-box mt-1">
              <Camera size={20} />
            </div>
            <div>
              <p className="club-eyebrow">
                {album.category}
                {album.season ? ` · ${album.season}` : ""}
              </p>
              <h1 className="club-heading mt-2">{album.title}</h1>
              {album.description && (
                <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
                  {album.description}
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-4 py-2 text-xs font-black">
              <ImageIcon size={15} className="text-club-light-red" />
              {images.length} Bilder
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-4 py-2 text-xs font-black">
              <Film size={15} className="text-club-light-red" />
              {videos.length} Videos
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        {(media ?? []).length ? (
          <GalleryLightbox media={media ?? []} />
        ) : (
          <div className="rounded-3xl border border-dashed border-white/10 py-16 text-center text-zinc-600">
            Dieses Album enthält noch keine öffentlichen Medien.
          </div>
        )}
      </section>

      <BottomNavigation />
    </main>
  );
}
