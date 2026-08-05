"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Users } from "lucide-react";

import vereinsLogo from "@/app/logo.png";

const teamGroups = [
  {
    title: "1. Mannschaft",
    description: "Kader, Trainerteam und aktuelle Saisoninfos.",
    href: "#erste-mannschaft",
    label: "Zum Kader",
  },
  {
    title: "2. Mannschaft",
    description: "Spieler, Verantwortliche und alle Termine.",
    href: "#zweite-mannschaft",
    label: "Zum Team",
  },
  {
    title: "Trainer & Staff",
    description: "Trainer, Co-Trainer, Betreuer und Vereinsleitung.",
    href: "#trainerteam",
    label: "Zum Staff",
  },
];

export default function TeamSection() {
  return (
    <section id="team" className="club-section py-10">
      <div className="pointer-events-none absolute left-[-5rem] top-16 h-64 w-64 rounded-full bg-club-red/10 blur-3xl" />

      <div className="club-container">
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <Users
              size={16}
              strokeWidth={2.5}
              className="text-club-light-red"
              aria-hidden="true"
            />

            <p className="club-eyebrow">Unser Verein</p>
          </div>

          <h2 className="club-heading mt-2">Mannschaften</h2>

          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Entdecke unsere Teams, Spieler und Verantwortlichen.
          </p>
        </div>

        <div className="space-y-4">
          {teamGroups.map((group, index) => (
            <motion.article
              key={group.title}
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
              <div className="grid grid-cols-[84px_1fr] gap-4 p-4">
                <div className="flex h-24 w-24 max-w-full items-center justify-center rounded-3xl border border-club-light-red/20 bg-gradient-to-br from-club-burgundy/80 to-black p-3 shadow-[0_0_30px_rgba(193,18,31,0.15)]">
                  <Image
                    src={vereinsLogo}
                    alt="Logo der SpVgg Middelich-Resse"
                    className="h-auto max-h-full w-auto max-w-full object-contain"
                  />
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-club-light-red">
                    SpVgg Middelich-Resse
                  </p>

                  <h3 className="mt-2 text-xl font-black leading-tight text-white">
                    {group.title}
                  </h3>

                  <p className="mt-2 text-sm leading-5 text-zinc-400">
                    {group.description}
                  </p>

                  <a
                    href={group.href}
                    className="mt-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-club-light-red"
                  >
                    {group.label}
                    <ArrowRight size={15} aria-hidden="true" />
                  </a>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
