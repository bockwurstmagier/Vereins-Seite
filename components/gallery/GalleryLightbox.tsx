"use client";

import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Maximize2,
  Play,
  X,
} from "lucide-react";

type Media = {
  id: string;
  media_type: string;
  title: string | null;
  caption: string | null;
  file_url: string | null;
  external_url: string | null;
  photographer: string | null;
};

export default function GalleryLightbox({ media }: { media: Media[] }) {
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (active === null) return;
      if (event.key === "Escape") setActive(null);
      if (event.key === "ArrowLeft") {
        setActive((active - 1 + media.length) % media.length);
      }
      if (event.key === "ArrowRight") {
        setActive((active + 1) % media.length);
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, media.length]);

  const current = active === null ? null : media[active];

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {media.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActive(index)}
            className="group relative aspect-square overflow-hidden rounded-3xl border border-white/10 bg-black text-left"
          >
            {item.media_type === "image" && item.file_url ? (
              <img
                src={item.file_url}
                alt={item.title ?? ""}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
            ) : item.file_url ? (
              <video
                src={item.file_url}
                muted
                preload="metadata"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-club-burgundy to-black">
                <Play size={42} className="text-club-light-red" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-white">
                  {item.title || (item.media_type === "video" ? "Video" : "Foto")}
                </p>
                {item.photographer && (
                  <p className="mt-1 truncate text-[10px] text-zinc-400">
                    📷 {item.photographer}
                  </p>
                )}
              </div>
              <Maximize2 size={17} className="shrink-0 text-club-light-red" />
            </div>
          </button>
        ))}
      </div>

      {current && active !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-3 sm:p-8"
          onClick={() => setActive(null)}
        >
          <button
            type="button"
            onClick={() => setActive(null)}
            className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white"
          >
            <X size={21} />
          </button>

          {media.length > 1 && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setActive((active - 1 + media.length) % media.length);
                }}
                className="absolute left-3 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white sm:left-6"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setActive((active + 1) % media.length);
                }}
                className="absolute right-3 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white sm:right-6"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          <div
            className="flex max-h-full max-w-6xl flex-col items-center"
            onClick={(event) => event.stopPropagation()}
          >
            {current.media_type === "image" && current.file_url ? (
              <img
                src={current.file_url}
                alt={current.title ?? ""}
                className="max-h-[78vh] max-w-full rounded-2xl object-contain"
              />
            ) : current.file_url ? (
              <video
                src={current.file_url}
                controls
                autoPlay
                className="max-h-[78vh] max-w-full rounded-2xl"
              />
            ) : (
              <a
                href={current.external_url ?? "#"}
                target="_blank"
                rel="noreferrer"
                className="club-button-primary"
              >
                <ExternalLink size={17} />
                Video öffnen
              </a>
            )}

            {(current.title || current.caption || current.photographer) && (
              <div className="mt-4 max-w-3xl text-center">
                {current.title && (
                  <h2 className="text-xl font-black text-white">
                    {current.title}
                  </h2>
                )}
                {current.caption && (
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    {current.caption}
                  </p>
                )}
                {current.photographer && (
                  <p className="mt-2 text-xs text-zinc-600">
                    Foto/Video: {current.photographer}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
