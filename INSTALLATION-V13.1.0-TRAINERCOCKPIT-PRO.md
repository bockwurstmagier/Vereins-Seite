# Version 13.1.0 – Trainercockpit Pro

## Neu

- Trainingseinheiten anlegen
- Trainingsschwerpunkt, Dauer und Intensität pflegen
- Anwesenheit pro Spieler erfassen
- Status: anwesend, zu spät, entschuldigt, unentschuldigt oder verletzt
- individuelle Trainingsminuten speichern
- Anwesenheitsquote automatisch berechnen
- Spieler als fit, fraglich, verletzt, in Reha, gesperrt oder nicht verfügbar markieren
- Start- und Enddatum sowie interne Notizen
- aktuelle Ausfälle direkt im Trainercockpit
- Verbindung mit bestehenden Einsatz-, Tor-, Vorlagen- und Kartenstatistiken
- mobile Bedienung für Trainer und Betreuer

## Installation

### 1. SQL ausführen

```text
sql/VERSION-13.1.0-TRAINERCOCKPIT-PRO.sql
```

### 2. Patch kopieren

Alle Dateien aus dem Patch in dein aktuelles Projekt kopieren.

### 3. Build und Deployment

```powershell
npm run build
git add -A
git commit -m "Funktion: Trainercockpit Pro"
git push origin main
```

Danach findest du das Modul weiterhin unter:

```text
Admin → Sport → Trainercockpit
```
