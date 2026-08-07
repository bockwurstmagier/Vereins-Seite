# HUJA v20.6.2 – PWA Update Recovery Hotfix

## Problem
Auf bereits installierten PWAs konnte weiterhin der alte App-Shell/Service-Worker aktiv bleiben. Dadurch erschien der Update-Dialog, aber der alte Client konnte den neuen Worker nicht verlaesslich aktivieren.

## Aenderung
- Neue HUJA-Service-Worker aktivieren sich nach erfolgreicher Installation selbst (`skipWaiting`).
- Beim Aktivieren uebernimmt der neue Worker offene HUJA-Fenster weiterhin ueber `clients.claim()`.
- Das Core-Precache ist fehlertolerant: ein einzelner temporaer nicht ladbarer Pfad blockiert das gesamte Update nicht mehr.
- Nur alte `huja-v*`-Caches werden entfernt.
- Ab dem neuen Client fuehrt `controllerchange` nicht mehr ungefragt zu einem Reload. Stattdessen erscheint der HUJA-Update-Dialog; erst der Klick auf `Jetzt aktualisieren` laedt kontrolliert neu.
- Der vorhandene Cache-Buster/Fallback bleibt bestehen.

## Nicht veraendert
Login/Auth, Rollen, Supabase, Push-Subscription/Push-Handler, LiveCenter, MatchCenter, News und Termine.

## Supabase
Keine SQL-Datei erforderlich.

## Installation
```bash
npm run build
git add -A
git commit -m "HUJA v20.6.2 - PWA Update Recovery Hotfix"
git push origin main
```

## Hinweis fuer vorhandene v20.6.0/v20.6.1-PWAs
Da dort noch der alte Worker aktiv sein kann, kann genau dieser Recovery-Release einmalig einen manuellen Neustart der PWA oder einen normalen Browser-Reload erfordern. Danach koennen kuenftige Worker-Versionen den alten Worker selbst abloesen.
