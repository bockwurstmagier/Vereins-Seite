# Version 10.1.0 – Ein-Klick-Spieltag

## Installation

1. Im Supabase SQL Editor vollständig ausführen:

```text
sql/VERSION-10.1.0-EIN-KLICK-SPIELTAG.sql
```

2. Patch-Dateien in das aktuelle Projekt kopieren.

3. Prüfen und veröffentlichen:

```powershell
npm run build
git add -A
git commit -m "Funktion: Ein-Klick-Spieltag"
git push origin main
```

## Verwendung

Im mobilen LiveCenter oder Match-Center auf:

```text
Spiel beenden & alles automatisch erstellen
```

klicken.

Automatisch erledigt werden:

- Status und Spieluhr auf beendet setzen
- finale Spielminute und Einsatzdauer speichern
- Abpfiff im Liveticker eintragen
- Abpfiff-Push an registrierte Geräte senden
- Spielerstatistiken durch den Status `finished` aktualisieren
- Website-Spielbericht erzeugen
- News als Entwurf anlegen
- Instagram-, Facebook-, WhatsApp- und Pressetext erzeugen
- Ergebnisgrafik als exportierbare PNG-Vorschau vorbereiten

Die Texte sind automatisch erzeugte Entwürfe und können vor der Veröffentlichung bearbeitet werden.
