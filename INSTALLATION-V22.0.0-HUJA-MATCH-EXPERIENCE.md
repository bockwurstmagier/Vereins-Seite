# HUJA v22.0.0 – Match Experience

## Neu
- Cinematic Vollbild-Toranimation im öffentlichen LiveCenter.
- Torschütze, Minute, Vorlage und aktueller Spielstand werden automatisch aus vorhandenen LiveCenter-Daten dargestellt.
- Eigene Anpfiff-, Halbzeit- und Abpfiff-Overlays bei Status-/Phasenwechsel.
- Bestehender optionaler Tor-Sound bleibt erhalten.
- Neue HUJA Match Story: chronologische Story aus Toren, Karten, Wechseln, Live-Momenten und vorhandenen Videos.
- Die Story aktualisiert sich während des Spiels über die bereits vorhandene Supabase-Realtime-Verbindung.
- Nach Abpfiff bleibt sie als Spielrückblick im MatchCenter erhalten.

## Unverändert
Login/Auth, Rollen, Admin-LiveCenter, Matchday Hub, Voting, Fanpass und Rangliste werden nicht umgebaut.

## Installation
Keine neue Supabase-SQL notwendig.
Nach Einspielen: `npm run build`.
