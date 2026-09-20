# Changelog

## v23.7.0 – Live-Aufstellung

- Aktuelle Spielminute für Live-Tore, Karten und Wechsel serverseitig berechnen.
- Tore, Karten und Wechsel direkt an Spielern auf der öffentlichen Aufstellung und im Editor anzeigen.
- Ereigniskorrekturen und Undo aktualisieren die Symbole; ungespeicherte Positionen im Editor bleiben erhalten.
- 14 Regressionstests, einheitliche Versionsanzeige und reparierte Lockdatei für die vorhandenen Push-Abhängigkeiten.
- Keine neue SQL-Migration erforderlich.

## v2.0

- Projektstruktur bereinigt
- Importfehler in Admin-Dashboard und Spielerprofil behoben
- Lucide-Icons korrigiert
- Sponsorenverwaltung (Anlegen, Bearbeiten, Löschen, Logo-Upload) ergänzt
- Dynamische Sponsoren auf Startseite und eigener Seite ergänzt
- vollständiges Supabase-SQL-Setup hinzugefügt
- Installationsanleitung erneuert


## v2.1 – Match-Center

- Admin-Match-Center für Status, Spielstand und Spielminute
- Startelf und Ersatzbank pro Spiel
- Ereignisse: Tore, Karten, Auswechslungen und Notizen
- Spieler des Spiels und Spielbericht
- Öffentliche Match-Center-Übersicht und Detailseiten
- Match-Center-Vorschau auf der Startseite
- Supabase-Tabellen `match_squad` und `match_events`
