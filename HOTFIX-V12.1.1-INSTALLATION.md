# Hotfix v12.1.1 – Vereinsfilter und Starttabelle

## Behoben

- Startseite zeigt nur noch das nächste Spiel von Middelich-Resse.
- Countdown nutzt nur noch ein Spiel von Middelich-Resse.
- Letztes Ergebnis nutzt nur noch ein Spiel von Middelich-Resse.
- Öffentliches Match-Center zeigt nur noch Vereinsspiele.
- Öffentlicher Spielplan zeigt nur noch Vereinsspiele.
- Admin-Dashboard zählt und berechnet nur noch Vereinsspiele.
- Alle 240 Staffelspiele bleiben trotzdem in Supabase, weil sie für die
  vollständige Ligatabelle benötigt werden.
- Die Tabelle zeigt bereits vor dem ersten Spieltag alle Mannschaften mit
  0 Spielen und 0 Punkten.

## Wichtig zu Ergebnissen

Die aktuell bereitgestellte DFBnet-Datei enthält Spielplan und Termine, aber
keine Ergebnis-Spalten. Deshalb kann die Tabelle aktuell nur als
Saisonstart-Tabelle mit 0 Punkten angezeigt werden.

Sobald eine spätere Exportdatei Ergebnisse enthält oder Ergebnisse im
Vereinsmanager gespeichert werden, berechnet das System Punkte, Tore und
Platzierungen neu.

## Installation

Patch in das aktuelle Projekt kopieren und vorhandene Dateien ersetzen.

```powershell
npm run build
git add -A
git commit -m "Fehler: Vereinsspiele filtern und Tabelle initialisieren"
git push origin main
```

Nach erfolgreichem Vercel-Deployment dieselbe DFBnet-Datei unter
`Admin → Sport → Saisonimport` noch einmal importieren. Der Upsert erzeugt
keine Duplikate, baut aber die Tabelle mit allen Mannschaften neu auf.
