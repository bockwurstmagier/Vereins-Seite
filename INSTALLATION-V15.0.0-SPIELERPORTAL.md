# Version 15.0.0 – HUJA Spielerportal

## Funktionen für Spieler

- eigener Login
- kommende Spiele und Trainings sehen
- zu-, vielleicht- oder absagen
- optionale Notiz zur Rückmeldung
- persönliche Saisonstatistiken
- Nachrichten des Trainerteams
- freigegebene Dokumente
- Verletzungen und Abwesenheiten melden
- eigene Meldungen einsehen

## Funktionen im Adminbereich

- Benutzerkonto mit Spielerprofil verknüpfen
- Benutzer automatisch auf Rolle `spieler` setzen
- Nachrichten an alle oder einzelne Spieler
- Rückmeldungen überblicken
- Verletzungsmeldungen anzeigen

## Installation

### 1. SQL ausführen

```text
sql/VERSION-15.0.0-SPIELERPORTAL.sql
```

### 2. Patch kopieren

Alle Dateien aus dem Patch in dein aktuelles Projekt kopieren.

### 3. Build und Deployment

```powershell
npm run build
git add -A
git commit -m "Funktion: HUJA Spielerportal"
git push origin main
```

## Einrichtung eines Spielers

1. Benutzerkonto wie gewohnt im Adminbereich anlegen.
2. `Admin → Verein → Spielerportal` öffnen.
3. Benutzer und Spieler auswählen.
4. Auf `Verknüpfen und Spielerrolle setzen` klicken.
5. Der Spieler meldet sich über die normale Login-Seite an.

Spieler werden nach dem Login automatisch zu:

```text
/spielerportal
```

weitergeleitet.

## Hinweis zu Dokumenten

Die Datenbankstruktur für Dokumente ist enthalten. Dokumente können zunächst
über eine öffentliche oder Supabase-Storage-URL hinterlegt werden. Eine eigene
Upload-Oberfläche kann als nächster Schritt ergänzt werden.
