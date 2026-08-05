"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { RefreshCw, WifiOff, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import clubLogo from "../app/logo.png";

export default function AppExperience({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showSplash, setShowSplash] = useState(false);
  const [online, setOnline] = useState(true);
  const [updateReady, setUpdateReady] = useState(false);

  useEffect(() => {
    const alreadyShown = window.sessionStorage.getItem("huja-splash-seen");
    if (!alreadyShown && window.matchMedia("(display-mode: standalone)").matches) {
      setShowSplash(true);
      window.sessionStorage.setItem("huja-splash-seen", "1");
      const timer = window.setTimeout(() => setShowSplash(false), 1450);
      return () => window.clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const sync = () => setOnline(navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const onControllerChange = () => window.location.reload();
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    void navigator.serviceWorker.ready.then((registration) => {
      if (registration.waiting) setUpdateReady(true);
      registration.addEventListener("updatefound", () => {
        const worker = registration.installing;
        worker?.addEventListener("statechange", () => {
          if (worker.state === "installed" && navigator.serviceWorker.controller) {
            setUpdateReady(true);
          }
        });
      });
    });

    return () => navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
  }, []);

  const installUpdate = async () => {
    const registration = await navigator.serviceWorker.ready;
    registration.waiting?.postMessage({ type: "SKIP_WAITING" });
  };

  return (
    <>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="min-h-full flex-1"
        >
          {children}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-[#050505]"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(193,18,31,0.28),transparent_55%)]" />
            <motion.div
              initial={{ scale: 0.82, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 18, stiffness: 160 }}
              className="relative text-center"
            >
              <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-[2.2rem] border border-white/10 bg-black/45 p-5 shadow-[0_0_70px_rgba(193,18,31,0.35)]">
                <Image src={clubLogo} alt="SpVgg Middelich-Resse" priority className="h-auto max-h-full w-auto" />
              </div>
              <p className="mt-6 text-xs font-black uppercase tracking-[0.42em] text-club-light-red">HUJA</p>
              <p className="mt-2 text-sm font-black uppercase tracking-[0.16em] text-white">Middelich-Resse</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!online && (
          <motion.div
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            className="fixed inset-x-3 top-[max(0.75rem,env(safe-area-inset-top))] z-[160] mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-amber-500/25 bg-amber-950/95 px-4 py-3 text-amber-100 shadow-2xl backdrop-blur-xl"
          >
            <WifiOff size={19} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black">Du bist offline</p>
              <p className="text-xs text-amber-200/70">Gespeicherte Inhalte bleiben verfügbar.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {updateReady && (
          <motion.div
            initial={{ y: 90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 90, opacity: 0 }}
            className="fixed inset-x-3 bottom-[calc(5.9rem+env(safe-area-inset-bottom))] z-[160] mx-auto max-w-md rounded-3xl border border-club-light-red/25 bg-[#101014]/95 p-4 shadow-2xl backdrop-blur-2xl"
          >
            <button onClick={() => setUpdateReady(false)} aria-label="Hinweis schließen" className="absolute right-3 top-3 text-zinc-500">
              <X size={17} />
            </button>
            <p className="club-eyebrow">Neue Version</p>
            <p className="mt-2 pr-8 text-sm font-bold text-white">Ein Update der HUJA App ist verfügbar.</p>
            <button type="button" onClick={() => void installUpdate()} className="club-button-primary mt-4 w-full">
              <RefreshCw size={17} /> Jetzt aktualisieren
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
