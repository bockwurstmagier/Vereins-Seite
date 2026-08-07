"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

const STORAGE_KEY = "huja_app_splash_seen_v20_2";

export default function AppSplash() {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const alreadySeen = sessionStorage.getItem(STORAGE_KEY) === "1";

    if (alreadySeen) return;

    sessionStorage.setItem(STORAGE_KEY, "1");
    setVisible(true);

    const leaveTimer = window.setTimeout(() => setLeaving(true), 1500);
    const removeTimer = window.setTimeout(() => setVisible(false), 1950);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-black transition duration-500 ${
        leaving ? "pointer-events-none scale-[1.035] opacity-0" : "opacity-100"
      }`}
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(140,0,18,0.36),transparent_55%)]" />
      <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-club-red/20 blur-[90px] animate-pulse" />
      <div className="absolute inset-x-0 top-[46%] h-px bg-gradient-to-r from-transparent via-club-light-red/60 to-transparent opacity-70" />

      <div className="absolute inset-0">
        {[
          "left-[14%] top-[24%]",
          "left-[24%] top-[68%]",
          "left-[72%] top-[28%]",
          "left-[81%] top-[66%]",
          "left-[48%] top-[17%]",
          "left-[58%] top-[76%]",
        ].map((position, index) => (
          <span
            key={position}
            className={`absolute ${position} h-1.5 w-1.5 rounded-full bg-club-light-red/50 blur-[0.5px] ${
              index % 2 === 0 ? "animate-pulse" : ""
            }`}
          />
        ))}
      </div>

      <div
        className={`relative z-10 flex flex-col items-center px-6 text-center transition-all duration-700 ${
          leaving
            ? "translate-y-2 scale-110 opacity-0"
            : "translate-y-0 scale-100 opacity-100"
        }`}
      >
        <div className="relative">
          <div className="absolute inset-[-1.75rem] rounded-full border border-club-light-red/20 shadow-[0_0_80px_rgba(220,20,60,0.38)]" />
          <div className="absolute inset-[-0.75rem] rounded-full bg-club-red/20 blur-2xl" />

          <div className="relative flex h-28 w-28 items-center justify-center rounded-[2rem] border border-white/10 bg-gradient-to-br from-club-burgundy via-club-dark-red to-black shadow-[0_25px_80px_rgba(0,0,0,0.65)] sm:h-32 sm:w-32">
            <span className="text-4xl font-black italic tracking-[-0.08em] text-white sm:text-5xl">
              HUJA
            </span>
            <span className="absolute -right-1 -top-1 text-sm font-black text-club-light-red">
              ™
            </span>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-center gap-2">
            <Sparkles size={14} className="text-club-light-red" />
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-club-light-red">
              Club Management System
            </p>
            <Sparkles size={14} className="text-club-light-red" />
          </div>

          <h1 className="mt-4 text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
            Die Middelicher sind da.
          </h1>

          <div className="mx-auto mt-5 h-1 w-40 overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full w-full origin-left animate-[hujaSplashProgress_1.6s_ease-out_forwards] rounded-full bg-gradient-to-r from-club-red to-club-light-red" />
          </div>
        </div>
      </div>
    </div>
  );
}
