# HUJA v22.8.0 – Goal Sound Studio

## Fix
- Eigener Tor-Sound wird bei jedem neuen Tor frisch aus `/api/match-experience` geladen.
- Dadurch greift ein neu hochgeladener Sound auch dann zuverlässig, wenn das MatchCenter bereits geöffnet war.
- Vorher laufender Tor-Sound wird sauber gestoppt, bevor ein neuer startet.
- Live-Sound muss beim Fan weiterhin aktiviert sein.

## Goal Sound Studio
- Start- und Endpunkt in 0,1-Sekunden-Schritten.
- Slider + numerische Eingabe.
- „Ausschnitt testen“ spielt exakt den gewählten Bereich.
- Der Sound selbst wird nicht neu geschnitten oder komprimiert.
- HUJA speichert nur `start_seconds` und `end_seconds` in `app_settings`.
- Beim Tor springt der Player zum Startpunkt und stoppt am Endpunkt.

## Installation
Keine neue Supabase-SQL nötig, weil `app_settings.value` bereits JSONB ist.
Patch einspielen, `npm audit` und `npm run build` ausführen.
