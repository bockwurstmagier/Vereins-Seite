# Version 18.1.0 – HUJA AutoGraphics

## Automatische Grafiken

Nach Auswahl eines Spiels werden mit einem Klick sieben fertige PNG-Dateien
erstellt:

- Ergebnisgrafik
- Spieler-des-Spiels-Grafik
- Torschützengrafik
- Tabellengrafik
- Nächstes-Spiel-Grafik
- Instagram-Story
- Reel-Cover

## Automatisch verwendete Daten

- Mannschaftsnamen
- Heim- und Gastlogo
- Endergebnis
- Torschützen
- Spieler des Spiels
- aktuelle Tabelle
- nächstes Spiel
- Datum und Uhrzeit

## Design

- dunkelrote HUJA-Optik
- starke Typografie
- Licht- und Glow-Effekte
- Vereinsbranding
- optional eigenes Hintergrundfoto
- frei wählbare Haupt- und Zweitfarbe

## Keine API-Kosten

Alle Grafiken werden direkt im Browser mit Canvas erzeugt. Es ist weder ein
OpenAI-Key noch eine externe Grafik-API erforderlich.

## Installation

Für diese Version ist kein neues SQL nötig.

```powershell
npm run build
git add -A
git commit -m "Funktion: HUJA AutoGraphics"
git push origin main
```

## Aufruf

```text
Admin → Medien → HUJA AutoGraphics
```

Direkter Pfad:

```text
/admin/autographics
```
