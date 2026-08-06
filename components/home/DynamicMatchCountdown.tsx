"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shield, Timer } from "lucide-react";
import type { PublicMatch } from "../../lib/public-content";

type DynamicMatchCountdownProps = {
  match: PublicMatch | null;
};

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  finished: boolean;
};

function calculateTimeLeft(matchDate: string): TimeLeft {
  const difference = new Date(matchDate).getTime() - Date.now();

  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      finished: true,
    };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    finished: false,
  };
}

export default function DynamicMatchCountdown({
  match,
}: DynamicMatchCountdownProps) {
  const matchDate = match?.match_date ?? null;
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    if (!matchDate) {
      setTimeLeft(null);
      return;
    }

    const updateCountdown = () => {
      setTimeLeft(calculateTimeLeft(matchDate));
    };

    updateCountdown();
    const intervalId = window.setInterval(updateCountdown, 1000);

    return () => window.clearInterval(intervalId);
  }, [matchDate]);

  return (
    <section className="club-section py-12">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-club-red/15 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="club-container"
      >
        <div className="mb-6 flex items-center justify-center gap-2 text-club-light-red">
          <Timer size={18} strokeWidth={2.5} aria-hidden="true" />
          <p className="club-eyebrow">Anpfiff in</p>
        </div>

        {!matchDate || !match ? (
          <div className="club-card p-6 text-center text-sm text-zinc-400">
            Aktuell ist kein kommendes Spiel eingetragen.
          </div>
        ) : !timeLeft ? (
          <div className="h-28 animate-pulse rounded-3xl bg-white/[0.05]" />
        ) : timeLeft.finished ? (
          <div className="club-card px-5 py-8 text-center">
            <p className="text-2xl font-black uppercase text-club-light-red">
              Das Spiel läuft oder ist beendet
            </p>
          </div>
        ) : (
          <>
            <div className="club-card mb-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3 p-4 text-center">
              <CountdownTeam
                name={match.home_team}
                logoUrl={match.home_logo_url}
              />
              <span className="text-lg font-black text-club-light-red">VS</span>
              <CountdownTeam
                name={match.away_team}
                logoUrl={match.away_logo_url}
              />
            </div>

            <div className="grid grid-cols-4 gap-2">
              <CountdownBox value={timeLeft.days} label="Tage" />
              <CountdownBox value={timeLeft.hours} label="Std." />
              <CountdownBox value={timeLeft.minutes} label="Min." />
              <CountdownBox value={timeLeft.seconds} label="Sek." />
            </div>
          </>
        )}
      </motion.div>
    </section>
  );
}

function CountdownBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="club-card px-2 py-5 text-center">
      <p className="text-3xl font-black tabular-nums text-white">
        {String(value).padStart(2, "0")}
      </p>
      <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </p>
    </div>
  );
}


function CountdownTeam({
  name,
  logoUrl,
}: {
  name: string;
  logoUrl?: string | null;
}) {
  return (
    <div className="min-w-0">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white p-2">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={`Logo von ${name}`}
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <Shield size={25} className="text-zinc-400" />
        )}
      </div>
      <p className="mt-2 truncate text-xs font-black text-white">{name}</p>
    </div>
  );
}
