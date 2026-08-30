# HUJA v23.6.0 – Mobile Tipp-System

## Installation

### Vollständiges Projekt

1. Das vollständige ZIP entpacken.
2. Die vorhandene `.env.local` übernehmen beziehungsweise die bekannten Hostinger-Umgebungsvariablen erneut eintragen.
3. Abhängigkeiten mit `npm ci` installieren.
4. Mit `npm run build` bauen und wie gewohnt deployen.

### Patch

1. Vorher eine Sicherung des bestehenden HUJA-Projekts anlegen.
2. Den Inhalt des Patch-ZIPs in das Projektverzeichnis kopieren und vorhandene Dateien ersetzen.
3. `npm ci` und anschließend `npm run build` ausführen.
4. Neu deployen.

## Hinweise

- Es ist keine SQL-Migration erforderlich.
- Auth, Supabase-Speicherung, Tippauswertung und API-Endpunkte bleiben unverändert.
- `nanoid` bleibt auf Version 3.3.18 fixiert.
- Die Zahlen 0–6 sind direkt antippbar; höhere Ergebnisse sind weiterhin über Plus bis maximal 30 möglich.

