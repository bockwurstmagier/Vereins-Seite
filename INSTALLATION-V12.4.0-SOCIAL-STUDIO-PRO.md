# Version 12.4.0 – Social Studio Pro

## Neue Grafiktypen

- Matchday
- Endergebnis
- aktuelle Tabelle
- Torschützen eines Spiels
- Spieler des Spiels
- News
- Spieler
- Sponsoren

Alle spielbezogenen Vorlagen verwenden automatisch:

- Vereinslogos aus der zentralen Vereinsdatenbank
- Gegnerlogo
- Datum und Uhrzeit
- Ergebnis
- Tabellenplatz und Punkte
- Torschützen aus dem LiveCenter

## Formate

Jede Vorlage kann als folgende PNG-Größe exportiert werden:

- Instagram Feed: 1080 × 1350
- Instagram Story: 1080 × 1920
- Quadrat: 1080 × 1080

## Installation

Für diese Version ist kein neues SQL erforderlich.

```powershell
npm run build
git add -A
git commit -m "Funktion: Social Studio Pro"
git push origin main
```

Danach findest du die neuen Vorlagen weiterhin unter:

```text
Admin → Social Studio
```
