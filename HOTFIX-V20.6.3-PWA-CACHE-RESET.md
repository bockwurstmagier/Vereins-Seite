# HUJA v20.6.3 – PWA Cache Reset

## Ursache
Der bisherige HUJA-Service-Worker war gleichzeitig für Push und App-/Offline-Caching zuständig. Dadurch konnten ältere Next.js-Seiten oder Assets nach einem Deployment weiter aus dem Service-Worker-Cache kommen. Die Versions-API sah bereits eine neue Version, während die Oberfläche noch auf einem alten Build lief.

## Änderung
- Service Worker ist ab v20.6.3 ausschließlich für Push/Notifications zuständig.
- Kein `fetch`-Handler und kein App-Shell-/Next.js-Cache mehr.
- Beim Aktivieren werden nur alte Cache-Namen mit Präfix `huja-v` gelöscht.
- Neue Worker verwenden weiterhin `skipWaiting()` und `clients.claim()`.
- Das Update-Fenster erscheint nur noch, wenn `/api/version` wirklich eine höhere Version meldet.
- Service-Worker-Zustände allein lösen kein Update-Fenster mehr aus.
- „Jetzt aktualisieren“ fordert die Registrierung neu an, entfernt alte HUJA-Caches und navigiert mit Cache-Buster direkt zur aktuell deployten App.
- `/api/version` hat zusätzliche No-Cache/CDN-No-Cache-Header.

## Nicht verändert
- Login/Auth
- Rollen/Berechtigungen
- Supabase
- Push-Subscriptions / Push-Payloads
- LiveCenter / MatchCenter
- News / Termine

## Hinweis
Der bisherige Offline-App-Cache entfällt bewusst. Push bleibt erhalten. Das priorisiert zuverlässige App-Updates und verhindert, dass ein altes Next.js-Frontend durch den Service Worker festgehalten wird.

## Installation
```bash
npm run build
git add -A
git commit -m "HUJA v20.6.3 - PWA Cache Reset"
git push origin main
```
