# Version 13.0.0 – HUJA Vereinsassistent

## Funktionen

Der neue Assistent beantwortet Fragen direkt aus den vorhandenen
Supabase-Daten:

- nächstes Spiel
- nächstes Heim- oder Auswärtsspiel
- Tabellenplatz
- beste Torschützen
- beste Vorlagengeber
- meiste Einsatzminuten
- Form der letzten fünf Spiele
- Spielerstatistik nach Namen
- Kartenübersicht
- Social-Media-Text zum letzten Ergebnis

## Kostenloser Grundmodus

Es wird keine externe KI-API aufgerufen. Der Assistent arbeitet vollständig
datenbasiert und verursacht keine zusätzlichen API-Kosten.

Bei Informationen, die noch nicht gespeichert werden, weist der Assistent
klar darauf hin. Beispiele:

- Zuschauerzahlen
- verbindliche Sperrenberechnung

## Installation

Für diese Version ist kein neues SQL erforderlich.

```powershell
npm run build
git add -A
git commit -m "Funktion: HUJA Vereinsassistent"
git push origin main
```

Nach dem Vercel-Deployment findest du ihn unter:

```text
Admin → Medien → Vereinsassistent
```
