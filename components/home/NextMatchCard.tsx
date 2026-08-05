"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Clock3,
  MapPin,
  Navigation,
  Trophy,
} from "lucide-react";

import vereinsLogo from "@/app/logo.png";
import type { DatabaseMatch } from "../../lib/matches";

type NextMatchCardProps = {
  match: DatabaseMatch | null;
};

const dateFormatter = new Intl.DateTimeFormat("de-DE", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: "Europe/Berlin",
});

const timeFormatter = new Intl.DateTimeFormat("de-DE", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Berlin",
});

export default function NextMatchCard({ match }: NextMatchCardProps) {
  if (!match) {
    return (
      <section id="next-match" className="club-section scroll-mt-20 pb-20">
        <div className="club-container">
          <div className="club-card px-6 py-10 text-center">
            <p className="club-eyebrow">Spieltag</p>
            <h2 className="club-heading mt-2">Nächstes Spiel</h2>
            <p className="mt-4 text-sm leading-6 text-zinc-400">
              Aktuell ist kein kommendes Spiel eingetragen.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const matchDate = new Date(match.match_date);
  const mapsQuery = match.maps_query || match.location || "";
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    mapsQuery,
  )}`;

  return (
    <section id="next-match" className="club-section scroll-mt-20 pb-20">
      <div className="pointer-events-none absolute left-1/2 top-24 h-72 w-72 -translate-x-1/2 rounded-full bg-club-red/15 blur-3xl" />

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
              <p className="club-eyebrow">Spieltag</p>
            </div>

            <h2 className="club-heading mt-2">Nächstes Spiel</h2>
          </div>

          <span className="shrink-0 rounded-full border border-club-light-red/30 bg-club-burgundy/40 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-club-light-red backdrop-blur-xl">
            {match.competition}
          </span>
        </div>

        <motion.article
          initial={{ opacity: 0, y: 45 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="club-card overflow-hidden"
        >
          <div className="border-b border-white/10 bg-gradient-to-r from-club-burgundy/60 via-club-dark-red/25 to-transparent px-5 py-4 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-300">
              {match.matchday || "Spieltag"}
            </p>
          </div>

          <div className="px-5 pb-6 pt-8">
            <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-3 text-center">
              <TeamBlock name={match.home_team} label="Heim" showClubLogo />

              <div className="flex h-24 items-center justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-club-light-red/30 bg-club-red/10 text-xl font-black italic text-club-light-red shadow-[0_0_30px_rgba(193,18,31,0.22)]">
                  VS
                </div>
              </div>

              <TeamBlock name={match.away_team} label="Gast" />
            </div>

            <div className="club-card-inner mt-8 space-y-1 p-2">
              <InfoRow
                icon={<CalendarDays size={19} aria-hidden="true" />}
                label="Datum"
                value={dateFormatter.format(matchDate)}
              />
              <InfoRow
                icon={<Clock3 size={19} aria-hidden="true" />}
                label="Anstoß"
                value={`${timeFormatter.format(matchDate)} Uhr`}
              />
              <InfoRow
                icon={<MapPin size={19} aria-hidden="true" />}
                label="Spielort"
                value={match.location || "Spielort folgt"}
              />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="club-button-secondary"
              >
                <Navigation size={17} aria-hidden="true" />
                Route
              </a>

              <a href="#spiele" className="club-button-primary">
                <CalendarDays size={17} aria-hidden="true" />
                Spielplan
              </a>
            </div>
          </div>
        </motion.article>
      </div>
    </section>
  );
}

type TeamBlockProps = {
  name: string;
  label: string;
  showClubLogo?: boolean;
};

function TeamBlock({ name, label, showClubLogo = false }: TeamBlockProps) {
  return (
    <div className="min-w-0">
      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl border border-white/10 bg-black/40 p-3">
        {showClubLogo ? (
          <Image
            src={vereinsLogo}
            alt="Logo der SpVgg Middelich-Resse"
            priority
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

type InfoRowProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-center gap-4 rounded-2xl px-3 py-3 transition hover:bg-white/[0.04]">
      <div className="club-icon-box">{icon}</div>

      <div className="min-w-0 text-left">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
          {label}
        </p>

        <p className="mt-0.5 text-sm font-semibold leading-snug text-zinc-100">
          {value}
        </p>
      </div>
    </div>
  );
}
