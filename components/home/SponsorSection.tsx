"use client";

import { motion } from "framer-motion";
import { Handshake, ExternalLink } from "lucide-react";

const sponsors = [
  {
    name: "Sponsor 01",
    logo: "/images/sponsors/sponsor-01.png",
    url: "#",
  },
  {
    name: "Sponsor 02",
    logo: "/images/sponsors/sponsor-02.png",
    url: "#",
  },
  {
    name: "Sponsor 03",
    logo: "/images/sponsors/sponsor-03.png",
    url: "#",
  },
  {
    name: "Sponsor 04",
    logo: "/images/sponsors/sponsor-04.png",
    url: "#",
  },
];

export default function SponsorSection() {
  const loopItems = [...sponsors, ...sponsors];

  return (
    <section id="sponsors" className="club-section py-10">
      <div className="pointer-events-none absolute right-[-5rem] top-16 h-64 w-64 rounded-full bg-club-red/10 blur-3xl" />

      <div className="club-container">
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <Handshake
              size={16}
              strokeWidth={2.5}
              className="text-club-light-red"
              aria-hidden="true"
            />

            <p className="club-eyebrow">Gemeinsam stark</p>
          </div>

          <h2 className="club-heading mt-2">Unsere Partner</h2>

          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Danke an alle Sponsoren und Unterstützer, die unseren Verein möglich
            machen.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="club-card overflow-hidden py-5"
        >
          <div className="relative overflow-hidden">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-club-black to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-club-black to-transparent" />

            <motion.div
              className="flex w-max gap-4 px-4"
              animate={{ x: ["0%", "-50%"] }}
              transition={{
                duration: 22,
                ease: "linear",
                repeat: Infinity,
              }}
            >
              {loopItems.map((sponsor, index) => (
                <a
                  key={`${sponsor.name}-${index}`}
                  href={sponsor.url}
                  target={sponsor.url === "#" ? undefined : "_blank"}
                  rel={sponsor.url === "#" ? undefined : "noreferrer"}
                  className="group flex h-28 w-44 shrink-0 flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/[0.045] px-4 text-center transition hover:border-club-light-red/30 hover:bg-white/[0.08]"
                  aria-label={`${sponsor.name} öffnen`}
                >
                  <div className="flex h-14 w-full items-center justify-center overflow-hidden rounded-2xl bg-white/95 px-3">
                    <img
                      src={sponsor.logo}
                      alt={sponsor.name}
                      className="max-h-10 max-w-full object-contain"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                    <span className="text-sm font-black uppercase tracking-wide text-zinc-800">
                      {sponsor.name}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.14em] text-zinc-500 transition group-hover:text-club-light-red">
                    Partner
                    <ExternalLink size={12} aria-hidden="true" />
                  </div>
                </a>
              ))}
            </motion.div>
          </div>
        </motion.div>

        <a
          href="#sponsor-werden"
          className="club-button-primary mt-5 w-full"
        >
          Sponsor werden
        </a>
      </div>
    </section>
  );
}
