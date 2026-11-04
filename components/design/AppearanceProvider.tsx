"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import { APPEARANCE_KEY, DEFAULT_APPEARANCE, normalizeAppearance, applyAppearance, type Appearance } from "../../lib/appearance";

const Context = createContext<{ value: Appearance; update: (value: Appearance) => void; reset: () => void; ready: boolean; persistent: boolean } | null>(null);
export function useAppearance() {
  const context = useContext(Context);
  if (!context) throw new Error("Mein Design benötigt den AppearanceProvider.");
  return context;
}
export default function AppearanceProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState(DEFAULT_APPEARANCE);
  const [ready, setReady] = useState(false);
  const [persistent, setPersistent] = useState(true);
  useEffect(() => {
    try { setValue(normalizeAppearance(JSON.parse(localStorage.getItem(APPEARANCE_KEY) || "null"))); }
    catch { setPersistent(false); }
    setReady(true);
    const sync = (event: StorageEvent) => {
      if (event.key !== APPEARANCE_KEY && event.key !== null) return;
      try { setValue(normalizeAppearance(JSON.parse(event.newValue || "null"))); } catch { setValue(DEFAULT_APPEARANCE); }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  useEffect(() => {
    if (!ready) return;
    const dark = matchMedia("(prefers-color-scheme: dark)");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => applyAppearance(value, dark.matches, reduced.matches);
    sync(); dark.addEventListener("change", sync); reduced.addEventListener("change", sync);
    return () => { dark.removeEventListener("change", sync); reduced.removeEventListener("change", sync); };
  }, [value, ready]);
  function update(next: Appearance) {
    const safe = normalizeAppearance(next);
    setValue(safe);
    applyAppearance(safe, matchMedia("(prefers-color-scheme: dark)").matches, matchMedia("(prefers-reduced-motion: reduce)").matches);
    try { localStorage.setItem(APPEARANCE_KEY, JSON.stringify(safe)); setPersistent(true); }
    catch { setPersistent(false); }
  }
  function reset() {
    update(DEFAULT_APPEARANCE);
    try { localStorage.removeItem(APPEARANCE_KEY); } catch { setPersistent(false); }
  }
  return <Context.Provider value={{ value, update, reset, ready, persistent }}>
    <MotionConfig reducedMotion={value.effects ? "user" : "always"}>{children}</MotionConfig>
  </Context.Provider>;
}
