# Version 14.1.0 – HUJA Ein-Klick-Grafikstudio

## Funktion

Ein Spiel auswählen und auf:

```text
Alle Grafiken automatisch erstellen
```

klicken. Anschließend lädt der Browser nacheinander sieben PNG-Dateien:

- Matchday Feed – 1080 × 1350
- Matchday Story – 1080 × 1920
- Ergebnis Feed – 1080 × 1350
- Ergebnis Story – 1080 × 1920
- Torschützen – 1080 × 1080
- Spieler des Spiels – 1080 × 1080
- Tabelle Feed – 1080 × 1350

## Automatisch verwendete Daten

- Heim- und Gastmannschaft
- Vereinslogos
- Datum und Uhrzeit
- Spielort
- Endergebnis
- Torschützen aus dem Match-Center
- ausgewählter Spieler des Spiels
- aktuelle Tabelle
- Vereinsfarben

Zusätzlich wird ein kopierbares Textpaket für Matchday und Endergebnis
erstellt.

## Keine API-Kosten

Die Grafiken werden mit dem Browser-Canvas gerendert. Es ist kein
OpenAI-Schlüssel und keine externe Grafik-API erforderlich.

## Installation

Für diese Version ist kein neues SQL notwendig.

```powershell
npm run build
git add -A
git commit -m "Funktion: HUJA Ein-Klick-Grafikstudio"
git push origin main
```

Danach findest du das Modul unter:

```text
Admin → Medien → Ein-Klick-Grafikstudio
```

## Browser-Hinweis

Beim ersten Paket kann der Browser fragen, ob mehrere Dateien heruntergeladen
werden dürfen. Diese Erlaubnis muss bestätigt werden.
