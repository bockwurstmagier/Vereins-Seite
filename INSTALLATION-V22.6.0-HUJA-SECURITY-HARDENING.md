# HUJA v22.6.0 – Security Hardening

## Neu
- Zentrale Same-Origin-Prüfung für alle öffentlichen schreibenden HUJA APIs.
- Verteilter, Supabase-basierter Rate-Limiter für Fanpass, Voting, Tipps, Reaktionen, Analytics und Push-Subscriptions.
- Request-Body-Größenlimits vor JSON-Verarbeitung.
- Interne Supabase-Fehler aus Push-Endpunkten werden nicht mehr an Besucher ausgegeben.
- Globale Security Headers: HSTS, X-Frame-Options DENY, nosniff, Referrer Policy, Permissions Policy sowie CSP-Härtung für frame-ancestors/object/base/form-action.
- `X-Powered-By` wird deaktiviert.
- Neues Admin → Security Center, nur für Administratoren.
- Keine Änderungen an LiveCenter-Automatik, Matchday Hub, Fanpass-Logik, Push-Zustellung oder Rollenmodell.
- Nanoid bleibt auf 3.3.18 gepinnt im Lockfile.

## Installation
1. `sql/VERSION-22.6.0-HUJA-SECURITY-HARDENING.sql` einmal im Supabase SQL Editor ausführen.
2. Patch einspielen.
3. `npm install` bzw. vorhandene Dependencies verwenden.
4. `npm audit` → Ziel: 0 vulnerabilities.
5. `npm run build`.
6. Nach Deployment Admin → Security Center öffnen. Rate Limiting muss dort als Aktiv erscheinen.

## Hinweis
Kein Websystem kann garantieren, niemals angegriffen oder kopiert zu werden. Diese Version reduziert aber die praktisch relevanten Angriffsflächen der öffentlichen HUJA-Endpunkte deutlich.
