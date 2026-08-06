# Version 12.3.0 – Vereinslogos überall

## Neu

Die zentral gepflegten Vereinslogos erscheinen jetzt zusätzlich in:

- Countdown auf der Startseite
- letztem Ergebnis
- öffentlichem LiveCenter
- detailliertem Match-Center
- Social Studio für Matchday- und Ergebnisgrafiken

Bereits enthalten bleiben:

- nächstes Spiel
- Tabelle
- Spielplan
- Startseiten-Match-Center

## Installation

Für diese Version ist kein neues SQL notwendig. Voraussetzung ist, dass das
SQL aus Version 12.2.0 bereits ausgeführt wurde.

Patch kopieren und danach:

```powershell
npm run build
git add -A
git commit -m "Design: Vereinslogos in allen Spielbereichen"
git push origin main
```

Nach dem Vercel-Deployment die PWA vollständig schließen und neu öffnen.

## Logo-Pflege

```text
Admin → Verein → Vereine & Logos
```

Ein dort ausgetauschtes Logo wird automatisch in allen angebundenen Bereichen
verwendet.
