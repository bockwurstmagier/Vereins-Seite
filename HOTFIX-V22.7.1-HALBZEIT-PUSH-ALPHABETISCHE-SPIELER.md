# HUJA v22.7.1 – Halbzeit Push & alphabetische Spielerauswahl

## Halbzeit Push
- Beim ersten Klick auf „Halbzeit“ wird automatisch eine Push-Nachricht versendet.
- Inhalt: Halbzeit + aktueller Spielstand.
- Öffnet direkt das öffentliche MatchCenter.
- Doppel-Push-Schutz über die bereits vorhandene `push_delivery_log`.
- Verwendet die bestehende Push-Präferenz `live_starts_enabled`.
- Ein Push-Fehler blockiert den Halbzeitwechsel nicht.

## Spielerauswahl
- Torschütze und Vorlage werden alphabetisch nach Nachname, danach Vorname sortiert.
- Zur besseren Konsistenz gilt dieselbe Sortierung auch bei Karten und Wechseln.
- Darstellung der Namen bleibt „Vorname Nachname“.
- Keine Datenbankänderung notwendig.

## Installation
Patch einspielen, `npm audit` und `npm run build` ausführen.
Keine neue Supabase-SQL erforderlich.
