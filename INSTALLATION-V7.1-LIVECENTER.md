# Vereinsmanager v7.1 – LiveCenter Realtime

## Neu

- öffentliche Live-Anzeige ohne Neuladen
- Supabase-Realtime für Spielstand, Minute, Status, Ticker und Aufstellung
- sichtbarer Verbindungsstatus
- manueller Aktualisieren-Button als Rückfallebene
- Handy-Schnellaktionen im Adminbereich:
  - Anpfiff
  - Halbzeit
  - zweite Halbzeit
  - Abpfiff
- automatische Ticker-Einträge für diese Schnellaktionen

## Installation

1. Bestehende `.env.local` in den Projektordner übernehmen.
2. In Supabase **SQL Editor → New query** öffnen.
3. Den vollständigen Inhalt ausführen:

```text
sql/VERSION-7.1-LIVECENTER-REALTIME.sql
```

4. Projekt neu starten:

```bash
npm install
npm run build
npm run dev
```

## Verwendung

Admin-Steuerung:

```text
/admin/match-center
```

Ein Spiel öffnen und über **Schnellaktionen** starten. Tore, Karten,
Auswechslungen, Minute und Spielstand werden weiterhin auf derselben Seite
gepflegt.

Öffentliche Live-Seite:

```text
/match-center/[spiel-id]
```

Die Seite aktualisiert sich bei Änderungen automatisch. Oben rechts zeigt
„Live verbunden“ an, dass die Supabase-Realtime-Verbindung aktiv ist.

## Test

1. Öffentliche Spielseite in einem zweiten Browserfenster öffnen.
2. Im Adminbereich auf „Anpfiff“ klicken.
3. Spielminute oder Spielstand speichern.
4. Ein Ereignis hinzufügen.
5. Die öffentliche Seite muss ohne Neuladen reagieren.
