# Installation Version 6.0

1. Deine vorhandene `.env.local` in den Projektordner kopieren.
2. In Supabase den SQL Editor öffnen.
3. `sql/VERSION-6.0-SPORTZENTRUM.sql` vollständig ausführen.
4. Im Terminal:

```bash
npm install
npm run build
npm run dev
```

## Neue Seiten

- `/spielplan`
- `/tabelle`
- `/statistiken`
- `/admin/tabelle`

## Tabelle pflegen

Im Adminbereich unter **Tabelle** jede Mannschaft als eigene Zeile anlegen. Die Form wird mit `W D L` eingetragen.
