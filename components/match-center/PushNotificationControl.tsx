"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, BellOff, Volume2, VolumeX } from "lucide-react";

type Preferences = {
  liveStarts: boolean;
  news: boolean;
  goals: boolean;
  cards: boolean;
  substitutions: boolean;
};

const DEFAULT_PREFERENCES: Preferences = {
  liveStarts: true,
  news: true,
  goals: true,
  cards: true,
  substitutions: true,
};

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

function getDeviceToken() {
  const key = "huja-push-device-token";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;

  const created = crypto.randomUUID();
  window.localStorage.setItem(key, created);
  return created;
}

export default function PushNotificationControl() {
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [preferences, setPreferences] =
    useState<Preferences>(DEFAULT_PREFERENCES);

  const supported = useMemo(
    () =>
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window,
    [],
  );

  useEffect(() => {
    if (!supported) {
      setLoading(false);
      return;
    }

    const storedSound =
      window.localStorage.getItem("huja-live-sound") === "true";
    setSoundEnabled(storedSound);

    const storedPreferences = window.localStorage.getItem(
      "huja-push-preferences",
    );
    if (storedPreferences) {
      try {
        setPreferences({
          ...DEFAULT_PREFERENCES,
          ...(JSON.parse(storedPreferences) as Partial<Preferences>),
        });
      } catch {
        // Ungültige alte Einstellung ignorieren.
      }
    }

    void navigator.serviceWorker.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => setSubscribed(Boolean(subscription)))
      .finally(() => setLoading(false));
  }, [supported]);

  async function saveSubscription(
    subscription: PushSubscription,
    nextPreferences = preferences,
  ) {
    const response = await fetch("/api/push/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deviceToken: getDeviceToken(),
        subscription: subscription.toJSON(),
        preferences: nextPreferences,
      }),
    });

    const result = (await response.json()) as { error?: string };
    if (!response.ok) {
      throw new Error(result.error || "Push-Abo konnte nicht gespeichert werden.");
    }
  }

  async function enablePush() {
    if (!supported) {
      setMessage("Push-Nachrichten werden auf diesem Gerät nicht unterstützt.");
      return;
    }

    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey) {
      setMessage("Der öffentliche VAPID-Schlüssel fehlt.");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setMessage("Benachrichtigungen wurden nicht erlaubt.");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
      }

      await saveSubscription(subscription);
      setSubscribed(true);
      setMessage("Push-Hinweise bleiben jetzt auf diesem Gerät aktiv.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Push-Hinweise konnten nicht aktiviert werden.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function disablePush() {
    setLoading(true);
    setMessage(null);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
      }

      await fetch("/api/push/subscriptions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceToken: getDeviceToken() }),
      });

      setSubscribed(false);
      setMessage("Push-Hinweise wurden für dieses Gerät deaktiviert.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Push-Hinweise konnten nicht deaktiviert werden.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function updatePreferences(next: Preferences) {
    setPreferences(next);
    window.localStorage.setItem(
      "huja-push-preferences",
      JSON.stringify(next),
    );

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await saveSubscription(subscription, next);
    }
  }

  function toggleSound() {
    const next = !soundEnabled;
    setSoundEnabled(next);
    window.localStorage.setItem("huja-live-sound", String(next));

    if (next) {
      const audio = new Audio("/sounds/goal.wav");
      audio.volume = 0.7;
      void audio.play().catch(() => {
        setMessage("Ton ist aktiviert und wird beim nächsten Tor abgespielt.");
      });
    }
  }

  return (
    <div className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-50 sm:bottom-5">
      {open && (
        <div className="mb-3 w-[min(22rem,calc(100vw-2rem))] rounded-[1.75rem] border border-white/10 bg-black/95 p-4 text-white shadow-2xl backdrop-blur-2xl">
          <p className="text-sm font-black uppercase tracking-wider">
            Push-Hinweise
          </p>
          <p className="mt-1 text-xs leading-5 text-zinc-400">
            Das Push-Abo bleibt gespeichert und funktioniert auch bei
            geschlossener App.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {(
              [
                ["liveStarts", "Spiel live"],
                ["news", "News"],
                ["goals", "Tore"],
                ["cards", "Karten"],
                ["substitutions", "Wechsel"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() =>
                  void updatePreferences({
                    ...preferences,
                    [key]: !preferences[key],
                  })
                }
                className={`rounded-2xl border px-2 py-3 text-[10px] font-black uppercase tracking-wider ${
                  preferences[key]
                    ? "border-club-light-red/30 bg-club-red/20 text-white"
                    : "border-white/10 bg-white/[0.04] text-zinc-500"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={toggleSound}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-black uppercase"
          >
            {soundEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
            Torsound {soundEnabled ? "an" : "aus"}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() =>
              void (subscribed ? disablePush() : enablePush())
            }
            className={`mt-3 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-xs font-black uppercase ${
              subscribed
                ? "border border-white/10 bg-white/[0.04] text-zinc-300"
                : "bg-club-red text-white"
            }`}
          >
            {subscribed ? <BellOff size={17} /> : <Bell size={17} />}
            {loading
              ? "Bitte warten …"
              : subscribed
                ? "Hinweise deaktivieren"
                : "Dauerhaft aktivieren"}
          </button>

          {message && (
            <p className="mt-3 rounded-xl bg-white/[0.05] px-3 py-2 text-xs leading-5 text-zinc-300">
              {message}
            </p>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`flex h-14 items-center gap-2 rounded-full border px-4 text-[10px] font-black uppercase tracking-wider text-white shadow-2xl backdrop-blur-xl ${
          subscribed
            ? "border-emerald-500/25 bg-emerald-950/90"
            : "border-white/10 bg-black/90"
        }`}
      >
        <Bell size={16} />
        {subscribed ? "Push-Hinweise aktiv" : "Push-Hinweise"}
      </button>
    </div>
  );
}
