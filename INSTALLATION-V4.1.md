# Vereinsmanager v4.1 – Aktivitätsprotokoll

## Installation

1. Die vorhandene `.env.local` in den Projektordner kopieren.
2. Supabase öffnen: **SQL Editor → New query**.
3. Den vollständigen Inhalt von `sql/AKTIVITAETSLOG-V4.1.sql` ausführen.
4. Danach im Projektordner:

```bash
npm install
npm run dev
```

5. Aktivitätsprotokoll öffnen:

```text
http://localhost:3000/admin/aktivitaeten
```

## Berechtigungen

- Administratoren sehen das Aktivitätsprotokoll.
- Vorstands-Benutzer sehen das Aktivitätsprotokoll.
- Andere Rollen erhalten keinen Menüpunkt und werden serverseitig abgewiesen.

## Protokollierte Bereiche

- Spiele
- News
- Spieler und Staff
- Sponsoren
- Termine
- Anfragen
- Match-Center-Ereignisse
- Aufstellungen
- Benutzerprofile

Neue Einträge entstehen erst nach Ausführung der SQL-Datei und bei zukünftigen Änderungen.
