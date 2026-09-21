# HUJA v24.0.0 – Dynamic Home

Startseitenmodule mit zentralen Schaltern und Reihenfolge, Hamburger-Schnellnavigation, getrennte Liga-/Pokalanzeige und Top Highlights aus bestehenden Video-Ereignissen. Lokaler Highlight-Test im Test-Labor. Auswärtstor-Erkennung und Undo korrigiert; bestehende Minuten-/Aufstellungsfunktionen geprüft. Sicherheitspatches: Next.js 16.3.5, sharp 0.35.4, js-yaml 4.3.2; nanoid 3.3.18.

Details: INSTALLATION-V24.0.0-DYNAMIC-HOME.md und PRUEFUNG-V24.0.0.md.

---

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
