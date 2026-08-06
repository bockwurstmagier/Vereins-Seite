# Version 19.1.0 – HUJA Vereinszentrale

## Das neue Club-OS-Dashboard

Die Vereinszentrale bündelt alle wichtigen Bereiche des Vereins auf einer
Seite.

### Spielbetrieb

- Live-Spielstatus
- nächstes Spiel
- Tabellenplatz
- letzte Ergebnisse
- direkte Zugänge zu LiveCenter, Match-Center und Statistiken

### Mannschaft

- Anzahl aktiver Spieler
- aktuell verfügbare Spieler
- Verletzte, gesperrte und nicht verfügbare Spieler
- unsichere Rückmeldungen
- Geburtstage der nächsten 45 Tage

### Training und Termine

- Anwesenheitsquote des letzten gepflegten Trainings
- kommende Trainingseinheiten
- heutige Vereinstermine
- nächste öffentliche und interne Termine

### Kommunikation

- neue Spielernachrichten der letzten sieben Tage
- wichtige Nachrichten werden hervorgehoben
- direkter Zugang zum Spielerportal

### Sponsoren

- Sponsoreneinträge, deren Laufzeit innerhalb von 60 Tagen endet
- direkter Zugang zur Sponsorenverwaltung

## Installation

Für Version 19.1 ist kein neues SQL erforderlich. Die Vereinszentrale verwendet
die bereits vorhandenen Daten aus den bisherigen HUJA-Modulen.

```powershell
npm run build
git add -A
git commit -m "Funktion: HUJA Vereinszentrale"
git push origin main
```

## Aufruf

```text
Admin → Übersicht → Vereinszentrale
```

Direkter Pfad:

```text
/admin/vereinszentrale
```
