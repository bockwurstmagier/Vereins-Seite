"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const STORAGE_KEY = "huja-anonymous-device-v1";

function deviceId() {
  let value = window.localStorage.getItem(STORAGE_KEY);
  if (!value) {
    value = typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem(STORAGE_KEY, value);
  }
  return value;
}

async function send(path: string, pageView: boolean) {
  if (path.startsWith("/admin") || path.startsWith("/login") || path.startsWith("/registrieren")) return;
  try {
    await fetch("/api/analytics/heartbeat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ deviceId: deviceId(), path, pageView }),
      keepalive: true,
    });
  } catch {
    // Analytics darf die App niemals blockieren.
  }
}

export default function AppAnalyticsTracker() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    const pageView = lastPath.current !== pathname;
    lastPath.current = pathname;
    void send(pathname, pageView);

    const interval = window.setInterval(() => void send(pathname, false), 45_000);
    const onVisibility = () => {
      if (document.visibilityState === "visible") void send(pathname, false);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [pathname]);

  return null;
}
