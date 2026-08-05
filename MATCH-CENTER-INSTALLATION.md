# Match-Center v2.1 installieren

1. Projekt entpacken und die bestehende `.env.local` in den Projektordner kopieren.
2. In Supabase den **SQL Editor** öffnen.
3. `sql/MATCH-CENTER-V2.1.sql` vollständig ausführen. Bei einer neuen Installation kann stattdessen `sql/SETUP-KOMPLETT.sql` verwendet werden.
4. Im Projektordner ausführen:

```bash
npm install
npm run dev
```

## Adressen

- Admin: `http://localhost:3000/admin/match-center`
- Öffentlich: `http://localhost:3000/match-center`

## Funktionen

- Status: geplant, live, beendet
- aktueller Spielstand und Spielminute
- Startelf und Ersatzbank
- Tore, gelbe/rote Karten, Auswechslungen und Notizen
- Spieler des Spiels
- Spielbericht
- öffentliches Match-Center auf dem Handy

Die Spieler müssen zuvor unter `/admin/team` angelegt sein, damit sie in Aufstellung und Ereignissen ausgewählt werden können.
