// HUJA – Push-only Service Worker (v20.8.0 Club Shop)
//
// Wichtig: Der Service Worker cached absichtlich KEINE Next.js-Seiten oder
// JavaScript-Bundles mehr. Dadurch kann eine alte PWA-Shell kein neues
// Deployment blockieren. Push und Notification-Klicks bleiben erhalten.

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    void self.skipWaiting();
  }
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Alte HUJA-App-Caches aus v20.6.2 und davor entfernen. Andere Cache-
      // Bereiche der Domain werden nicht angefasst.
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith("huja-v"))
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("push", (event) => {
  let payload = {
    title: "SpVgg Middelich-Resse",
    body: "Es gibt ein neues Live-Update.",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    url: "/match-center",
    tag: "huja-live-update",
    vibrate: [200, 100, 200],
  };

  try {
    if (event.data) {
      payload = { ...payload, ...event.data.json() };
    }
  } catch {
    if (event.data) payload.body = event.data.text();
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon,
      badge: payload.badge,
      tag: payload.tag,
      renotify: true,
      silent: false,
      vibrate: payload.vibrate,
      data: { url: payload.url },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = new URL(
    event.notification.data?.url || "/match-center",
    self.location.origin,
  ).href;

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        for (const client of clients) {
          if ("focus" in client && client.url.startsWith(self.location.origin)) {
            if ("navigate" in client) client.navigate(targetUrl);
            return client.focus();
          }
        }
        return self.clients.openWindow(targetUrl);
      }),
  );
});

// Kein fetch-Handler: Navigation und Next.js-Assets gehen direkt zum Server.
