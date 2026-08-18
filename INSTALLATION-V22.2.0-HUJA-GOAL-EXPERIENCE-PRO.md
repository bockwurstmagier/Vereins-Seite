# HUJA v22.2.0 – Goal Experience Pro

## Neu
- Spielerfoto des Torschützen automatisch in der Vollbild-Toranimation.
- Nutzt das bereits vorhandene `players.image_url`; kein zusätzlicher Upload nötig.
- Automatische Situations-Headlines:
  - ELFMETERTOR! bei als Elfmeter markiertem Tor
  - LAST-MINUTE! ab Minute 85
  - AUSGLEICH! wenn der aktuelle Spielstand ausgeglichen ist
  - FÜHRUNG! wenn Middelich nach dem Tor mit einem Treffer führt
  - sonst TOOOOR!
- Eigener Tor-Sound aus v22.1.0 bleibt vollständig erhalten.
- Ohne Spielerfoto funktioniert die Animation weiterhin normal.

## Unverändert
Login/Auth, Rollen, Admin-LiveCenter, Match Story, Fanpass, Voting und Matchday Hub.

## Installation
Keine neue Supabase-SQL notwendig.
Nach Einspielen: `npm run build`.
