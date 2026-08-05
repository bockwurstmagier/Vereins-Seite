"use client";

import { motion } from "framer-motion";
import { ArrowRight, Newspaper } from "lucide-react";
import type { PublicNewsItem } from "../../lib/public-content";

type PublicNewsSectionProps = {
  items: PublicNewsItem[];
};

const dateFormatter = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: "Europe/Berlin",
});

export default function PublicNewsSection({
  items,
}: PublicNewsSectionProps) {
  return (
    <section id="news" className="club-section py-10">
      <div className="pointer-events-none absolute right-[-5rem] top-16 h-64 w-64 rounded-full bg-club-red/10 blur-3xl" />

      <div className="club-container">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Newspaper
                size={16}
                strokeWidth={2.5}
                className="text-club-light-red"
                aria-hidden="true"
              />
              <p className="club-eyebrow">Aktuelles</p>
            </div>

            <h2 className="club-heading mt-2">Vereinsnews</h2>
          </div>

          <a
            href="/news"
            className="text-[10px] font-black uppercase tracking-[0.16em] text-club-light-red"
          >
            Alle ansehen
          </a>
        </div>

        {!items.length ? (
          <div className="club-card p-6 text-sm leading-6 text-zinc-400">
            Aktuell sind noch keine veröffentlichten Vereinsnews vorhanden.
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item, index) => {
              const displayDate = item.published_at || item.created_at;

              return (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 35 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: 0.45,
                    delay: index * 0.08,
                    ease: "easeOut",
                  }}
                  className="club-card overflow-hidden"
                >
                  <div className="grid grid-cols-[100px_1fr] gap-4 p-4">
                    <div className="relative min-h-32 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-club-burgundy via-club-dark-red to-black">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <>
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,51,64,0.45),transparent_55%)]" />
                          <div className="absolute bottom-3 left-3">
                            <p className="text-3xl font-black leading-none text-white/90">
                              71
                            </p>
                            <p className="mt-1 text-[9px] font-black uppercase tracking-[0.18em] text-club-light-red">
                              SpVgg
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-club-light-red/25 bg-club-red/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-club-light-red">
                          {item.category}
                        </span>

                        <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                          {dateFormatter.format(new Date(displayDate))}
                        </span>
                      </div>

                      <h3 className="mt-3 text-lg font-black leading-tight text-white">
                        {item.title}
                      </h3>

                      <p className="mt-2 line-clamp-3 text-sm leading-5 text-zinc-400">
                        {item.excerpt || item.content}
                      </p>

                      <a
                        href={`/news/${item.slug}`}
                        className="mt-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-club-light-red"
                      >
                        Weiterlesen
                        <ArrowRight size={15} aria-hidden="true" />
                      </a>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
