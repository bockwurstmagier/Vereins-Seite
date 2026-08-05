# Vereinsmanager v8.2 – automatische Spielzeit

## Installation

1. Bestehende `.env.local` in den neuen Projektordner kopieren.
2. Im Supabase SQL Editor diese Datei vollständig ausführen:

```text
sql/VERSION-8.2-AUTOMATISCHE-SPIELZEIT.sql
```

3. Danach:

```bash
npm install
npm run build
npm run dev
```

## Verhalten

- **Anpfiff:** Uhr beginnt automatisch bei 1'.
- **Halbzeit:** Uhr wird angehalten.
- **2. Halbzeit:** Uhr startet automatisch ab 46'.
- **Abpfiff:** Uhr wird angehalten und das Spiel beendet.
- **+1 / -1:** korrigiert die automatisch berechnete Minute.
- Nachspielzeit wird als `45+1'` bzw. `90+1'` angezeigt.
- Die Datenbank wird nicht jede Minute beschrieben. Gespeichert werden nur
  Startzeit, Basisminute und Spielphase. Browser berechnen die Minute lokal.
- Tor-, Karten- und Wechsel-Formulare übernehmen automatisch die laufende Minute.
