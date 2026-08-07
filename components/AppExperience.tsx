"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { RefreshCw, Sparkles, WifiOff, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import clubLogo from "../app/logo.png";
import { HUJA_BRANDING } from "../lib/branding";

const UPDATE_CHECK_INTERVAL_MS = 5 * 60 * 1000;

type VersionResponse = {
  version?: string;
};

function versionParts(version: string) {
  return version
    .replace(/^v/i, "")
    .split(".")
    .map((part) => Number.parseInt(part, 10) || 0);
}

function isNewerVersion(remoteVersion: string, localVersion: string) {
  const remote = versionParts(remoteVersion);
  const local = versionParts(localVersion);
  const length = Math.max(remote.length, local.length);

  for (let index = 0; index < length; index += 1) {
    const remotePart = remote[index] ?? 0;
    const localPart = local[index] ?? 0;
    if (remotePart > localPart) return true;
    if (remotePart < localPart) return false;
  }

  return false;
}

export default function AppExperience({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showSplash, setShowSplash] = useState(false);
  const [online, setOnline] = useState(true);
  const [updateReady, setUpdateReady] = useState(false);
  const [availableVersion, setAvailableVersion] = useState<string | null>(null);
  const [installingUpdate, setInstallingUpdate] = useState(false);
  const reloadFallbackRef = useRef<number | null>(null);

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

  const markWorkerReady = useCallback((worker: ServiceWorker | null) => {
    if (!worker) return;

    if (worker.state === "installed" && navigator.serviceWorker.controller) {
      setUpdateReady(true);
      return;
    }

    worker.addEventListener("statechange", () => {
      if (worker.state === "installed" && navigator.serviceWorker.controller) {
        setUpdateReady(true);
      }
    });
  }, []);

  const checkForUpdate = useCallback(async () => {
    if (!navigator.onLine || !("serviceWorker" in navigator)) return;

    try {
      const response = await fetch(`/api/version?t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });

      if (response.ok) {
        const data = (await response.json()) as VersionResponse;
        if (data.version && isNewerVersion(data.version, HUJA_BRANDING.version)) {
          setAvailableVersion(data.version);
        }
      }

      const registration = await navigator.serviceWorker.ready;
      await registration.update();

      if (registration.waiting) {
        setUpdateReady(true);
      } else {
        markWorkerReady(registration.installing);
      }
    } catch {
      // Eine fehlgeschlagene Update-Prüfung darf die App niemals blockieren.
    }
  }, [markWorkerReady]);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const onControllerChange = () => {
      if (reloadFallbackRef.current) {
        window.clearTimeout(reloadFallbackRef.current);
        reloadFallbackRef.current = null;
      }
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    let cancelled = false;
    let registrationRef: ServiceWorkerRegistration | null = null;

    void navigator.serviceWorker.ready.then((registration) => {
      if (cancelled) return;
      registrationRef = registration;

      if (registration.waiting) setUpdateReady(true);
      markWorkerReady(registration.installing);

      registration.addEventListener("updatefound", () => {
        markWorkerReady(registration.installing);
      });
    });

    void checkForUpdate();

    const interval = window.setInterval(() => void checkForUpdate(), UPDATE_CHECK_INTERVAL_MS);
    const onFocus = () => void checkForUpdate();
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") void checkForUpdate();
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelled = true;
      void registrationRef;
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
      if (reloadFallbackRef.current) window.clearTimeout(reloadFallbackRef.current);
    };
  }, [checkForUpdate, markWorkerReady]);

  useEffect(() => {
    if (availableVersion) setUpdateReady(true);
  }, [availableVersion]);

  const installUpdate = async () => {
    setInstallingUpdate(true);

    const reloadFresh = async () => {
      try {
        if ("caches" in window) {
          const keys = await window.caches.keys();
          await Promise.all(
            keys
              .filter((key) => key.startsWith("huja-v"))
              .map((key) => window.caches.delete(key)),
          );
        }
      } catch {
        // Cache-Bereinigung ist nur ein zusaetzliches Sicherheitsnetz.
      }

      const url = new URL(window.location.href);
      url.searchParams.set("huja-update", Date.now().toString());
      window.location.replace(url.toString());
    };

    if (!("serviceWorker" in navigator)) {
      await reloadFresh();
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.update();

      const waitingWorker = registration.waiting;
      if (waitingWorker) {
        waitingWorker.postMessage({ type: "SKIP_WAITING" });

        reloadFallbackRef.current = window.setTimeout(() => {
          void reloadFresh();
        }, 2500);
        return;
      }

      // Die Versions-API kann ein neues Deployment bereits sehen, bevor der
      // Browser den neuen Worker als "waiting" meldet. In diesem Fall laden
      // wir die aktuelle Server-Version gezielt frisch statt den Button ins
      // Leere laufen zu lassen.
      await reloadFresh();
    } catch {
      await reloadFresh();
    }
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[210] flex items-center justify-center bg-black/75 px-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 24, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.94, y: 18, opacity: 0 }}
              transition={{ type: "spring", stiffness: 210, damping: 22 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="huja-update-title"
              className="relative w-full max-w-sm overflow-hidden rounded-[2rem] border border-club-light-red/30 bg-[#09090b]/98 p-6 shadow-[0_0_90px_rgba(193,18,31,0.38)]"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(239,51,64,0.2),transparent_45%)]" />
              <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-club-red/15 blur-3xl" />

              {!installingUpdate && (
                <button
                  type="button"
                  onClick={() => setUpdateReady(false)}
                  aria-label="Update später installieren"
                  className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/35 text-zinc-500 transition hover:text-white"
                >
                  <X size={17} />
                </button>
              )}

              <div className="relative">
                <motion.div
                  animate={installingUpdate ? { rotate: 360 } : { scale: [1, 1.06, 1] }}
                  transition={installingUpdate ? { duration: 1.1, repeat: Infinity, ease: "linear" } : { duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  className="flex h-14 w-14 items-center justify-center rounded-2xl border border-club-light-red/30 bg-club-red/10 text-club-light-red shadow-[0_0_35px_rgba(239,51,64,0.2)]"
                >
                  {installingUpdate ? <RefreshCw size={25} /> : <Sparkles size={25} />}
                </motion.div>

                <p className="club-eyebrow mt-5">HUJA™ Smart Update</p>
                <h2 id="huja-update-title" className="mt-2 text-2xl font-black uppercase tracking-tight text-white">
                  {installingUpdate ? "Update wird geladen" : "Neues Update verfügbar"}
                </h2>
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  {installingUpdate
                    ? "Die neue HUJA-Version wird aktiviert. Die App startet danach automatisch neu."
                    : "Eine neue Version der HUJA Vereins-App ist bereit. Du musst die App nicht schließen."}
                </p>

                <div className="mt-5 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-xs">
                  <span className="font-bold text-zinc-500">Installiert</span>
                  <span className="font-black text-white">v{HUJA_BRANDING.version}</span>
                </div>
                {availableVersion && (
                  <div className="mt-2 flex items-center justify-between rounded-2xl border border-club-light-red/20 bg-club-red/10 px-4 py-3 text-xs">
                    <span className="font-bold text-club-light-red/75">Verfügbar</span>
                    <span className="font-black text-club-light-red">v{availableVersion}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => void installUpdate()}
                  disabled={installingUpdate}
                  className="club-button-primary mt-6 w-full disabled:cursor-wait disabled:opacity-70"
                >
                  <RefreshCw size={17} className={installingUpdate ? "animate-spin" : ""} />
                  {installingUpdate ? "Wird aktualisiert …" : "Jetzt aktualisieren"}
                </button>

                {!installingUpdate && (
                  <button
                    type="button"
                    onClick={() => setUpdateReady(false)}
                    className="mt-3 w-full py-2 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-600 transition hover:text-zinc-300"
                  >
                    Später
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
