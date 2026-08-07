const CACHE = "huja-v20.6.2";
const CORE = [
  "/",
  "/team",
  "/news",
  "/match-center",
  "/termine",
  "/kontakt",
  "/icons/icon-192.png",
];
const NETWORK_ONLY_PREFIXES = [
  "/admin",
  "/login",
  "/konto",
  "/auth",
  "/api",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);

      // Ein einzelner temporaer nicht erreichbarer Core-Pfad darf ein HUJA-
      // Update nicht komplett blockieren. Erfolgreiche Antworten werden
      // vorgeladen, fehlgeschlagene Pfade spaeter normal ueber das Netz geholt.
      await Promise.allSettled(
        CORE.map(async (path) => {
          const response = await fetch(path, { cache: "reload" });
          if (response.ok) await cache.put(path, response.clone());
        }),
      );

      // Wichtig fuer installierte PWAs: Der neue Worker wartet nicht mehr
      // auf den alten Worker/Button, sondern uebernimmt nach der Installation.
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("huja-v") && key !== CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
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
      data: {
        url: payload.url,
      },
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
            if ("navigate" in client) {
              client.navigate(targetUrl);
            }
            return client.focus();
          }
        }

        return self.clients.openWindow(targetUrl);
      }),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (
    NETWORK_ONLY_PREFIXES.some((prefix) =>
      url.pathname.startsWith(prefix),
    )
  ) {
    event.respondWith(fetch(request));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(
          async () =>
            (await caches.match(request)) || (await caches.match("/")),
        ),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);

      return cached || network;
    }),
  );
});
