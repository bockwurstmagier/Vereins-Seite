# Version 16.2.0 – Vollautomatisierung

## Was beim Klick auf „Spiel abschließen“ automatisch passiert

1. Spielstatus wird auf beendet gesetzt.
2. Endstand und Spielzeit werden gespeichert.
3. Tabelle verwendet sofort das neue Ergebnis.
4. Das nächste Spiel rückt automatisch nach.
5. Ein vollständiger Website-Spielbericht wird erstellt.
6. Der Spielbericht wird standardmäßig direkt veröffentlicht.
7. Instagram-, Facebook-, WhatsApp- und Pressetext werden erstellt.
8. Eine Ergebnisgrafik wird vorbereitet.
9. Die Abpfiff-Push-Benachrichtigung wird versendet.
10. Jeder Schritt wird in der Automatik-Zentrale protokolliert.

## Automatik-Zentrale

Nach dem Abschluss erscheint eine Statusübersicht mit allen erledigten
Arbeitsschritten. Von dort aus kann direkt geöffnet werden:

- Spielbericht
- Medienpaket
- Match-Center

Das Grafikstudio erhält das abgeschlossene Spiel automatisch vorausgewählt.

## Installation

### 1. SQL ausführen

```text
sql/VERSION-16.2.0-VOLLAUTOMATISIERUNG.sql
```

### 2. Patch kopieren

Alle Dateien aus dem Patch in das Projekt kopieren und vorhandene ersetzen.

### 3. Build und Deployment

```powershell
npm run build
git add -A
git commit -m "Funktion: Spieltag Vollautomatisierung"
git push origin main
```

## Hinweis

Der automatisch veröffentlichte Spielbericht kann jederzeit unter
`Admin → News` bearbeitet oder wieder als Entwurf gespeichert werden.
