# Version 16.0.0 – Vereins-App 2.0

## Neu

### Modernes Dashboard

- neue persönliche Startseite
- große rollenbezogene Schnellaktionen
- moderne Karten und kompakte Statusanzeigen
- für Smartphone, Tablet und Desktop optimiert

### Persönliche Startseiten je Rolle

Jede Rolle erhält eine eigene Standardanordnung:

- Administrator: System, Inhalte und Organisation
- Vorstand: Übersicht, Termine und Kontrolle
- Trainer: nächstes Spiel, Leistung und Trainingsbereich
- Social Media: News, Medien und Grafikstudio
- Betreuer: Spielbetrieb, Termine und Anwesenheit

### Widgets frei anordnen

Über `Dashboard anpassen` können Nutzer:

- Widgets per Drag-and-drop verschieben
- auf Mobilgeräten mit Pfeilen verschieben
- einzelne Widgets ausblenden
- ausgeblendete Widgets wieder einblenden
- die persönliche Anordnung auf den Rollenstandard zurücksetzen

Die Einstellung wird im Browser gespeichert. Es ist kein neues SQL nötig.

### Rollenbezogene Schnellaktionen

Beispiele:

- Trainer: Trainercockpit, LiveCenter und Spielerportal
- Social Media: News, Social Studio und Grafikpaket
- Vorstand: Saisonimport, Termine und Aktivitäten
- Administrator: Spiele, News, Einladungen und Grafikstudio

## Installation

Für diese Version ist kein SQL erforderlich.

```powershell
npm run build
git add -A
git commit -m "Funktion: Vereins-App 2.0 Dashboard"
git push origin main
```

Nach dem Deployment die installierte App vollständig schließen und neu öffnen.
