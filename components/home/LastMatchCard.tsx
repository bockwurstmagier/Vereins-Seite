"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Goal, Trophy } from "lucide-react";

import vereinsLogo from "@/app/logo.png";
import { lastMatch } from "../../data";

export default function LastMatchCard() {
  return (
    <section id="last-match" className="club-section py-10">
      <div className="pointer-events-none absolute right-[-4rem] top-10 h-56 w-56 rounded-full bg-club-red/10 blur-3xl" />

      <div className="club-container">
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <Trophy
              size={16}
              strokeWidth={2.5}
              className="text-club-light-red"
              aria-hidden="true"
            />

            <p className="club-eyebrow">Rückblick</p>
          </div>

          <h2 className="club-heading mt-2">Letztes Ergebnis</h2>
        </div>

        <motion.article
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="club-card overflow-hidden"
        >
          <div className="border-b border-white/10 bg-gradient-to-r from-club-burgundy/60 via-club-dark-red/25 to-transparent px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-200">
                {lastMatch.competition}
              </p>

              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                {lastMatch.date}
              </p>
            </div>
          </div>

          <div className="px-5 pb-6 pt-8">
            <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-3 text-center">
              <Team name={lastMatch.homeTeam} label="Heim" showClubLogo />

              <div className="flex min-h-28 flex-col items-center justify-center">
                <div className="rounded-2xl border border-club-light-red/20 bg-black/45 px-4 py-3 shadow-[0_0_30px_rgba(193,18,31,0.18)]">
                  <p className="text-4xl font-black tabular-nums text-white">
                    {lastMatch.homeScore ?? 0}
                    <span className="mx-2 text-club-light-red">:</span>
                    {lastMatch.awayScore ?? 0}
                  </p>
                </div>

                <p className="mt-3 text-[10px] font-black uppercase tracking-[0.2em] text-club-light-red">
                  Endstand
                </p>
              </div>

              <Team name={lastMatch.awayTeam} label="Gast" />
            </div>

            <div className="club-card-inner mt-8 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Goal
                  size={17}
                  className="text-club-light-red"
                  aria-hidden="true"
                />

                <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-300">
                  Torschützen
                </p>
              </div>

              <div className="space-y-2">
                {(lastMatch.scorers ?? []).length > 0 ? (
                  lastMatch.scorers?.map((scorer) => (
                    <div
                      key={scorer}
                      className="flex items-center gap-3 rounded-2xl bg-white/[0.035] px-3 py-3"
                    >
                      <span
                        className="h-2 w-2 rounded-full bg-club-light-red shadow-[0_0_14px_rgba(239,51,64,0.75)]"
                        aria-hidden="true"
                      />
                      <p className="text-sm font-semibold text-zinc-100">
                        {scorer}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-zinc-500">
                    Noch keine Torschützen eingetragen.
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.article>
      </div>
    </section>
  );
}

type TeamProps = {
  name: string;
  label: string;
  showClubLogo?: boolean;
};

function Team({ name, label, showClubLogo = false }: TeamProps) {
  return (
    <div className="min-w-0">
      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl border border-white/10 bg-black/40 p-3">
        {showClubLogo ? (
          <Image
            src={vereinsLogo}
            alt="Logo der SpVgg Middelich-Resse"
            className="h-auto max-h-full w-auto max-w-full object-contain"
          />
        ) : (
          <span className="text-4xl font-black text-zinc-600">?</span>
        )}
      </div>

      <p className="mt-4 text-sm font-black leading-tight text-club-white">
        {name}
      </p>

      <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
        {label}
      </p>
    </div>
  );
}
