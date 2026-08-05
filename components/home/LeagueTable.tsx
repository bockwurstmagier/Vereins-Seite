"use client";

import { motion } from "framer-motion";
import { ChevronRight, Trophy } from "lucide-react";

const tableRows = [
  {
    position: 1,
    team: "SV Beispiel 01",
    played: 6,
    goalDifference: 12,
    points: 16,
  },
  {
    position: 2,
    team: "FC Musterstadt",
    played: 6,
    goalDifference: 9,
    points: 14,
  },
  {
    position: 3,
    team: "SpVgg Middelich-Resse",
    played: 6,
    goalDifference: 7,
    points: 13,
    isClub: true,
  },
  {
    position: 4,
    team: "DJK Beispiel",
    played: 6,
    goalDifference: 4,
    points: 10,
  },
  {
    position: 5,
    team: "TuS Beispiel",
    played: 6,
    goalDifference: 1,
    points: 8,
  },
];

export default function LeagueTable() {
  return (
    <section id="spiele" className="club-section py-10">
      <div className="pointer-events-none absolute left-[-5rem] top-14 h-64 w-64 rounded-full bg-club-red/10 blur-3xl" />

      <div className="club-container">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Trophy
                size={16}
                strokeWidth={2.5}
                className="text-club-light-red"
                aria-hidden="true"
              />

              <p className="club-eyebrow">Aktueller Stand</p>
            </div>

            <h2 className="club-heading mt-2">Tabelle</h2>
          </div>

          <span className="rounded-full border border-club-light-red/30 bg-club-burgundy/40 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-club-light-red backdrop-blur-xl">
            Kreisliga
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="club-card overflow-hidden"
        >
          <div className="grid grid-cols-[42px_1fr_42px_50px_42px] border-b border-white/10 bg-white/[0.035] px-3 py-3 text-[9px] font-black uppercase tracking-[0.14em] text-zinc-500">
            <span className="text-center">Pos.</span>
            <span>Verein</span>
            <span className="text-center">Sp.</span>
            <span className="text-center">Diff.</span>
            <span className="text-center">Pkt.</span>
          </div>

          <div>
            {tableRows.map((row) => (
              <div
                key={row.position}
                className={`relative grid grid-cols-[42px_1fr_42px_50px_42px] items-center border-b border-white/[0.07] px-3 py-4 last:border-b-0 ${
                  row.isClub
                    ? "bg-gradient-to-r from-club-red/25 via-club-red/10 to-transparent"
                    : "bg-transparent"
                }`}
              >
                {row.isClub && (
                  <span
                    className="absolute inset-y-0 left-0 w-1 bg-club-light-red shadow-[0_0_18px_rgba(239,51,64,0.9)]"
                    aria-hidden="true"
                  />
                )}

                <div className="text-center">
                  <span
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-xl text-sm font-black ${
                      row.position <= 2
                        ? "bg-club-red/15 text-club-light-red"
                        : row.isClub
                          ? "bg-club-red text-white shadow-[0_0_18px_rgba(193,18,31,0.35)]"
                          : "bg-white/[0.05] text-zinc-400"
                    }`}
                  >
                    {row.position}
                  </span>
                </div>

                <div className="min-w-0 pr-2">
                  <p
                    className={`truncate text-sm font-black ${
                      row.isClub ? "text-white" : "text-zinc-200"
                    }`}
                  >
                    {row.team}
                  </p>

                  {row.isClub && (
                    <p className="mt-1 text-[9px] font-black uppercase tracking-[0.16em] text-club-light-red">
                      Unser Verein
                    </p>
                  )}
                </div>

                <p className="text-center text-sm font-bold tabular-nums text-zinc-400">
                  {row.played}
                </p>

                <p
                  className={`text-center text-sm font-bold tabular-nums ${
                    row.goalDifference > 0
                      ? "text-emerald-400"
                      : row.goalDifference < 0
                        ? "text-red-400"
                        : "text-zinc-400"
                  }`}
                >
                  {row.goalDifference > 0 ? "+" : ""}
                  {row.goalDifference}
                </p>

                <p
                  className={`text-center text-sm font-black tabular-nums ${
                    row.isClub ? "text-club-light-red" : "text-white"
                  }`}
                >
                  {row.points}
                </p>
              </div>
            ))}
          </div>

          <div className="p-4">
            <a href="#full-table" className="club-button-secondary w-full">
              Komplette Tabelle
              <ChevronRight size={17} aria-hidden="true" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
