# HUJA v20.7.1 – Stability Audit

## Ziel
Der komplette v20.7.0-Projektstand wurde auf wiederkehrende Fehlerquellen geprüft und an kritischen Stellen gehärtet.

## Geprüft
- Versionsstände in VERSION, package.json, package-lock.json und lib/branding.ts
- alle process.env-Verwendungen und .env.example
- Supabase Browser-/Server-/Admin-Clients
- Spieler-Einladungsroute und Token-Registrierung
- interne fest eingetragene App-Routen
- relative TypeScript/TSX-Imports
- Syntax aller TypeScript-/TSX-Dateien
- Service Worker / Smart-Update-Grundlage
- LiveCenter Live-Moments und Storage-Pfad
- SQL-Abhängigkeit für v20.7.0
- statische öffentliche Assets

## Korrigiert
1. Supabase-Serverkonfiguration zentral prüfbar gemacht.
2. Adminbereich Spieler-Einladungen zeigt eine klare Warnung, wenn Server-ENV fehlt.
3. Öffentliche Einladungsseite stürzt bei fehlender Serverkonfiguration oder DB-Ladefehler nicht mehr mit der allgemeinen Next.js-Fehlerseite ab.
4. Registrierungs-Server-Action gibt bei fehlender Serverkonfiguration einen kontrollierten Fehler zurück.
5. Einladungs-Origin wird validiert; ungültige Origins werden nicht übernommen.
6. .env.example und Deployment-Dokumentation an aktuelle Secret-Key-/Site-URL-/Push-Konfiguration angepasst.
7. Live-Moment-Video-URL wird serverseitig aus dem Storage-Pfad erzeugt und nicht mehr vom Client vertraut.
8. Veraltete Service-Worker-Versionsbeschriftung aktualisiert.
9. Push-Fehlermeldung dokumentiert beide unterstützten Supabase-Server-Key-Namen korrekt.

## Prüfergebnis
- 188 TypeScript/TSX-Dateien: Syntaxprüfung ohne Fehler.
- Fehlende relative Imports: 0.
- Nicht vorhandene fest eingetragene interne Routen: 0.
- Versionsstände: vollständig 20.7.1.
- Vier nicht vorhandene Sponsor-Platzhalterbilder wurden gefunden. Der zugehörige alte SponsorSection-Baustein ist im aktuellen Projekt nicht eingebunden; die aktive Startseite verwendet die dynamische Supabase-Sponsorenkomponente. Deshalb keine funktionale Änderung vorgenommen.

## Build-Hinweis
Ein vollständiger `npm run build` konnte in der Prüf-Umgebung nicht gestartet werden, da `npm ci` am internen Paket-Registry mit `@types/web-push` (404) scheitert. Dies ist kein festgestellter Projektfehler. Lokal/Deployment bitte weiterhin `npm run build` ausführen.

## Supabase
Für v20.7.1 ist keine zusätzliche SQL-Datei erforderlich.
Die SQL-Datei aus v20.7.0 für Live-Moments muss vorher vollständig ausgeführt worden sein:

`sql/VERSION-20.7.0-HUJA-INVITATIONS-LIVE-MOMENTS.sql`

## Wichtige Deployment-Variablen
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
- NEXT_PUBLIC_SITE_URL
- SUPABASE_SECRET_KEY
- NEXT_PUBLIC_VAPID_PUBLIC_KEY
- VAPID_PRIVATE_KEY
- VAPID_SUBJECT

`SUPABASE_SERVICE_ROLE_KEY` bleibt als Fallback für ältere Konfigurationen unterstützt.

## Installation
1. Patch über v20.7.0 kopieren oder vollständige v20.7.1 verwenden.
2. Deployment-Variablen prüfen.
3. `npm run build`
4. `git add -A`
5. `git commit -m "HUJA v20.7.1 - Stability Audit"`
6. `git push origin main`
