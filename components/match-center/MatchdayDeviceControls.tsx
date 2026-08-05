"use client";

import { Expand, Minimize2, Smartphone, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function MatchdayDeviceControls() {
  const [fullscreen, setFullscreen] = useState(false);
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    const sync = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  useEffect(() => {
    return () => {
      void wakeLockRef.current?.release();
    };
  }, []);

  const vibrate = () => navigator.vibrate?.(18);

  const toggleFullscreen = async () => {
    vibrate();
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await document.documentElement.requestFullscreen?.();
    }
  };

  const toggleWakeLock = async () => {
    vibrate();
    if (wakeLockRef.current) {
      await wakeLockRef.current.release();
      wakeLockRef.current = null;
      setWakeLockActive(false);
      return;
    }

    if ("wakeLock" in navigator) {
      try {
        wakeLockRef.current = await navigator.wakeLock.request("screen");
        setWakeLockActive(true);
        wakeLockRef.current.addEventListener("release", () => setWakeLockActive(false));
      } catch {
        setWakeLockActive(false);
      }
    }
  };

  return (
    <div className="mt-4 grid grid-cols-2 gap-3">
      <button type="button" onClick={() => void toggleFullscreen()} className="club-button-secondary min-h-14 w-full">
        {fullscreen ? <Minimize2 size={18} /> : <Expand size={18} />}
        {fullscreen ? "Vollbild beenden" : "Spieltags-Vollbild"}
      </button>
      <button type="button" onClick={() => void toggleWakeLock()} className={wakeLockActive ? "club-button-primary min-h-14 w-full" : "club-button-secondary min-h-14 w-full"}>
        {wakeLockActive ? <Sun size={18} /> : <Smartphone size={18} />}
        {wakeLockActive ? "Display bleibt an" : "Display wach halten"}
      </button>
    </div>
  );
}
