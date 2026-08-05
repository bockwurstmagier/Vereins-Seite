# Vereinsmanager v4.0 – Rollen & Rechte

## 1. Datenbank vorbereiten

Im Supabase SQL Editor nacheinander ausführen:

1. `sql/ROLLEN-UND-RECHTE-V4.0.sql`
2. In `sql/ERSTEN-ADMIN-FESTLEGEN.sql` deine echte Login-E-Mail einsetzen und ausführen.

## 2. Weitere Benutzer hinzufügen

In Supabase:

`Authentication → Users → Add user`

Nach dem Anlegen erscheint der Benutzer automatisch unter:

`/admin/benutzer`

Dort weist der Administrator Rolle, Anzeigename und aktiven Status zu.

## 3. Rollen

- Administrator: vollständiger Zugriff
- Vorstand: Spiele, News, Sponsoren, Termine, Anfragen und Medien
- Trainer: Spiele, Match-Center, Mannschaft und Termine
- Social Media: News, Galerie, Medien und Text-Assistent
- Betreuer: Spiele, Match-Center, Mannschaft und Termine

## 4. Start

```bash
npm install
npm run dev
```

Danach anmelden und `/admin/benutzer` öffnen.

## Sicherheit

Die Navigation blendet nicht erlaubte Bereiche aus. Zusätzlich schützen die neuen Supabase-RLS-Regeln Schreibzugriffe direkt in der Datenbank. Dadurch reicht es nicht, nur eine URL manuell aufzurufen.
