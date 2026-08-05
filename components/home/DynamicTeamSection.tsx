"use client";

import { motion } from "framer-motion";
import { ArrowRight, Shirt, Users } from "lucide-react";
import type { PublicPlayer } from "../../lib/team";

type DynamicTeamSectionProps = {
  players: PublicPlayer[];
};

export default function DynamicTeamSection({
  players,
}: DynamicTeamSectionProps) {
  const preview = players.slice(0, 6);

  return (
    <section id="team" className="club-section py-10">
      <div className="pointer-events-none absolute left-[-5rem] top-16 h-64 w-64 rounded-full bg-club-red/10 blur-3xl" />

      <div className="club-container">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Users
                size={16}
                strokeWidth={2.5}
                className="text-club-light-red"
                aria-hidden="true"
              />
              <p className="club-eyebrow">Unser Verein</p>
            </div>

            <h2 className="club-heading mt-2">Mannschaft</h2>
          </div>

          <a
            href="/team"
            className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.16em] text-club-light-red"
          >
            Alle Spieler
            <ArrowRight size={14} aria-hidden="true" />
          </a>
        </div>

        {!preview.length ? (
          <div className="club-card p-6 text-sm text-zinc-400">
            Aktuell sind noch keine Spielerprofile veröffentlicht.
          </div>
        ) : (
          <div className="-mx-4 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex w-max gap-4">
              {preview.map((player, index) => (
                <motion.a
                  key={player.id}
                  href={`/team/${player.slug}`}
                  initial={{ opacity: 0, x: 35 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: 0.45,
                    delay: index * 0.06,
                    ease: "easeOut",
                  }}
                  className="group relative h-80 w-[72vw] max-w-[280px] overflow-hidden rounded-[2rem] border border-white/10 bg-black"
                >
                  {player.image_url ? (
                    <img
                      src={player.image_url}
                      alt={`${player.first_name} ${player.last_name}`}
                      className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-club-burgundy to-black">
                      <Shirt
                        size={64}
                        className="text-club-light-red/45"
                        aria-hidden="true"
                      />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />

                  {player.shirt_number !== null && (
                    <span className="absolute left-4 top-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-club-red text-xl font-black text-white">
                      {player.shirt_number}
                    </span>
                  )}

                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-club-light-red">
                      {player.position}
                    </p>
                    <h3 className="mt-2 text-2xl font-black leading-tight text-white">
                      {player.first_name} {player.last_name}
                    </h3>
                    <p className="mt-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
                      {player.squad}
                    </p>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
