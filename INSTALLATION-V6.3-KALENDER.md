# Vereinskalender Pro – Version 6.3

## Installation

1. In Supabase den SQL Editor öffnen.
2. `sql/VERSION-6.3-VEREINSKALENDER-PRO.sql` vollständig ausführen.
3. `.env.local` aus deinem bisherigen Projekt beibehalten.
4. Projekt starten:

```bash
npm install
npm run build
npm run dev
```

## Neue und erweiterte Bereiche

- `/termine` – öffentliche Monats- und Listenansicht
- `/admin/termine` – Kalenderverwaltung
- `/admin/termine/[id]` – Termin bearbeiten
- Startseite – die nächsten drei öffentlichen Termine

## Rechte

Termine verwalten dürfen:

- Administrator
- Vorstand
- Trainer

Öffentliche Termine sind ohne Anmeldung sichtbar. Interne Termine sind nur im Adminbereich sichtbar.
