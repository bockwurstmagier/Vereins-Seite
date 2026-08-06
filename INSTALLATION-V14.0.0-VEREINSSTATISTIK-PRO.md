# Version 14.0.0 – Vereinsstatistik Pro

## Neu

### Saisonstatistik

- Spiele, Siege, Unentschieden und Niederlagen
- Tore, Gegentore und Tordifferenz
- Punkte, Siegquote und Punkte pro Spiel
- Heim- und Auswärtsbilanz
- Formkurve der letzten Spiele

### Spielerstatistik

- saisonale Torjägerliste
- saisonale Assistliste
- Einsätze, Startelf, Minuten und Spieler-des-Spiels
- ewige Torjägerliste aus allen erfassten Match-Center-Ereignissen
- ewige Assistliste
- Kartenübersicht

### Vereinsrekorde

- höchster Sieg
- höchste Niederlage
- torreichstes Spiel
- schnellstes Tor
- längste Siegesserie
- längste Serie ohne Niederlage

### Gegnerbilanz

Für jeden Gegner werden automatisch berechnet:

- Spiele
- Siege, Unentschieden und Niederlagen
- Tore
- Punkte
- letztes Aufeinandertreffen

## Installation

Für diese Version ist kein neues SQL erforderlich.

```powershell
npm run build
git add -A
git commit -m "Funktion: Vereinsstatistik Pro"
git push origin main
```

## Aufruf

Öffentlich:

```text
/statistiken
```

Im Adminbereich:

```text
Admin → Sport → Statistiken
```

## Datenhinweis

Die ewigen Spielerlisten können nur Ereignisse berücksichtigen, die im
Match-Center gespeichert wurden. Historische Spiele ohne erfasste
Torschützen, Vorlagen oder Aufstellungen sind nicht vollständig enthalten.
