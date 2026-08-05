# Sprint 8.1 – Mobile Admin & Trainercockpit

## Neu

- `/admin/live`: Spielauswahl für den mobilen Spieltag
- `/admin/live/[id]`: große Touch-Steuerung für Minute, Phasen, Tore, Karten und Wechsel
- `/admin/trainer`: Trainercockpit mit kommenden Spielen, Saisonbilanz, Torschützen, Einsätzen und Karten
- Rollen: Administrator, Trainer und Betreuer
- Navigationseinträge im Bereich Sport
- nutzt bestehende Tabellen `matches`, `players`, `match_events` und `match_squad`

## Installation

Es ist **kein neues SQL** erforderlich.

1. Dateien in das bestehende Projekt kopieren.
2. Server neu starten:

```bash
npm install
npm run build
npm run dev
```

## Test

```text
http://localhost:3000/admin/live
http://localhost:3000/admin/trainer
```

Für aussagekräftige Trainerdaten müssen beendete Spiele eine Saison besitzen und Aufstellungen/Ereignisse im Match-Center gepflegt sein.
