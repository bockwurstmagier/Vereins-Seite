# HUJA v20.6.1 – Smart Update Hotfix

## Behoben
- Update-Button reagiert jetzt auch dann zuverlässig, wenn die Versions-API das neue Deployment bereits meldet, der neue Service Worker aber noch nicht als `waiting` bereitsteht.
- Wartender Service Worker wird weiterhin per `SKIP_WAITING` aktiviert.
- Falls noch kein wartender Worker vorhanden ist, werden ausschließlich HUJA-App-Caches (`huja-v*`) entfernt und die aktuelle Seite mit Cache-Buster frisch vom Server geladen.
- Fallback nach Service-Worker-Aktivierung wurde auf 2,5 Sekunden verkürzt.

## Nicht verändert
- Login / Auth
- Rollen / Berechtigungen
- Supabase
- Push-Subscriptions / Push-Handler
- LiveCenter / MatchCenter
- News / Termine

## Supabase
Keine SQL-Datei erforderlich.

## Installation
Patch auf v20.6.0 kopieren und danach:

```bash
npm run build
git add -A
git commit -m "HUJA v20.6.1 - Smart Update Hotfix"
git push origin main
```
