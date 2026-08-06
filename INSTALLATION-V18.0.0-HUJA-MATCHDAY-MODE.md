# Version 18.0.0 – HUJA Matchday Mode

## Automatischer Spieltagsmodus

Die öffentliche Seite:

```text
/matchday
```

erkennt automatisch:

- ob heute ein Spiel stattfindet
- ob der Countdown läuft
- ob das Spiel live ist
- ob Halbzeit ist
- ob das Spiel beendet wurde

## Vor dem Spiel

- Countdown bis zum Anpfiff
- Wettbewerb, Uhrzeit und Spielort
- Heim- und Gastmannschaft
- Aufstellung, sobald sie im Match-Center gepflegt wurde
- nächstes Spiel

## Während des Spiels

- Live-Spielstand
- aktuelle Spielminute
- Tore, Karten, Wechsel und weitere Ereignisse
- automatische Aktualisierung alle 30 Sekunden
- Live-Tabelle
- Aufstellung

## Nach dem Abpfiff

- Endstand
- Ereignisse und Spieler des Spiels
- direkter Einstieg in HUJA AI Engine
- direkter Einstieg ins Grafikstudio
- nächstes Spiel

## Installation

Für diese Version ist kein neues SQL nötig.

```powershell
npm run build
git add -A
git commit -m "Funktion: HUJA Matchday Mode"
git push origin main
```

## Aufruf

Öffentlich:

```text
/matchday
```

Im Adminbereich:

```text
Admin → Sport → Matchday Mode
```
