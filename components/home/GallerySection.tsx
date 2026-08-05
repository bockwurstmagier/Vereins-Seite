"use client";

import { motion } from "framer-motion";
import { Camera, ChevronRight } from "lucide-react";

const galleryItems = [
  {
    title: "Training",
    subtitle: "Vorbereitung 2026",
    image: "/images/hero.png",
  },
  {
    title: "Spieltag",
    subtitle: "Gemeinsam für Middelich",
    image: "/images/hero.png",
  },
  {
    title: "Mannschaft",
    subtitle: "Ein Team. Ein Verein.",
    image: "/images/hero.png",
  },
];

export default function GallerySection() {
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

          <a
            href="#all-gallery"
            className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.16em] text-club-light-red"
          >
            Alle Bilder
            <ChevronRight size={14} aria-hidden="true" />
          </a>
        </div>

        <div className="-mx-4 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex w-max gap-4">
            {galleryItems.map((item, index) => (
              <motion.article
                key={`${item.title}-${index}`}
                initial={{ opacity: 0, x: 35 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.45,
                  delay: index * 0.08,
                  ease: "easeOut",
                }}
                className="group relative h-72 w-[78vw] max-w-[320px] overflow-hidden rounded-[2rem] border border-white/10 bg-black shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-club-light-red">
                    {item.subtitle}
                  </p>

                  <h3 className="mt-2 text-2xl font-black uppercase text-white">
                    {item.title}
                  </h3>
                </div>
              </motion.article>
            ))}
          </div>
        </div>

        <p className="mt-3 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-600">
          Zum Entdecken nach links wischen
        </p>
      </div>
    </section>
  );
}
