"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Timer } from "lucide-react";

import { nextMatch } from "../../data";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  finished: boolean;
};

function calculateTimeLeft(): TimeLeft {
  const matchDate = new Date(nextMatch.dateTime);
  const difference = matchDate.getTime() - Date.now();

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

export default function MatchCountdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const updateCountdown = () => {
      setTimeLeft(calculateTimeLeft());
    };

    updateCountdown();
    const intervalId = window.setInterval(updateCountdown, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

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

        {!timeLeft ? (
          <div className="h-28 animate-pulse rounded-3xl bg-white/[0.05]" />
        ) : timeLeft.finished ? (
          <div className="club-card px-5 py-8 text-center">
            <p className="text-2xl font-black uppercase text-club-light-red">
              Das Spiel läuft oder ist beendet
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            <CountdownBox value={timeLeft.days} label="Tage" />
            <CountdownBox value={timeLeft.hours} label="Std." />
            <CountdownBox value={timeLeft.minutes} label="Min." />
            <CountdownBox value={timeLeft.seconds} label="Sek." />
          </div>
        )}
      </motion.div>
    </section>
  );
}

type CountdownBoxProps = {
  value: number;
  label: string;
};

function CountdownBox({ value, label }: CountdownBoxProps) {
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
