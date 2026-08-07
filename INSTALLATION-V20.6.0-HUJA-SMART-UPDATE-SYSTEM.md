# HUJA v20.6.0 – Smart Update System

## Ziel
HUJA erkennt neue Deployments automatisch, ohne dass Nutzer die installierte PWA schließen müssen.

## Neu
- Öffentliche, nicht gecachte Versionsabfrage über `/api/version`.
- Update-Prüfung beim Start der App.
- Erneute Prüfung, wenn die App wieder in den Vordergrund kommt.
- Zusätzliche Prüfung alle 5 Minuten bei länger geöffneter App.
- Service Worker wird explizit mit `updateViaCache: "none"` registriert und auf Updates geprüft.
- Zentraler HUJA-Update-Dialog mit installierter und verfügbarer Versionsnummer.
- Klick auf „Jetzt aktualisieren“ aktiviert den wartenden Service Worker per `SKIP_WAITING`.
- Nach `controllerchange` lädt sich HUJA automatisch neu.
- Sicherheits-Fallback lädt die App neu, falls ein Browser keinen `controllerchange` auslöst.
- Fehler bei der Update-Prüfung blockieren die App nicht.
- „Später“ bleibt für normale Updates möglich.

## Service Worker
Der Cache-Key wurde auf `huja-v20.6.0` angehoben. Beim Aktivieren werden ältere HUJA-Caches wie bisher entfernt.
Push- und Notification-Handler wurden nicht verändert.

## Nicht verändert
- Login / Auth
- Rollen und Berechtigungen
- Supabase-Datenbank
- Push-Subscriptions und Push-Nachrichtenlogik
- LiveCenter / MatchCenter
- News / Termine

## Supabase
Keine SQL-Datei erforderlich.

## Installation
Patch über den vorhandenen v20.5.0-Stand kopieren oder die vollständige v20.6.0-ZIP verwenden.

Danach:

```bash
npm run build
git add -A
git commit -m "HUJA v20.6.0 - Smart Update System"
git push origin main
```

## Test
1. v20.6.0 deployen und PWA öffnen.
2. Für einen Folgetest Versionsnummer und `public/sw.js`-Cache-Key in einer Testversion erhöhen und deployen.
3. HUJA geöffnet lassen oder wieder in den Vordergrund holen.
4. Das Update-Fenster muss erscheinen.
5. „Jetzt aktualisieren“ drücken.
6. HUJA muss die neue Service-Worker-Version aktivieren und automatisch neu laden.
