# HUJA v25.0.1 – Sicherheitsupdate

Basis: v25.0.0 Mein Design. Der Hostinger-Build verwendet jetzt dauerhaft `next build --webpack`.

Aktualisiert: Next.js und eslint-config-next auf 16.4.5; indirekte Sicherheitsupdates unter anderem sharp 0.35.5, zod 4.6.7, source-map-js 1.2.2, brace-expansion 1.1.21/5.0.12. nanoid bleibt 3.3.18. Keine SQL-Migration und keine Änderung an Auth, Rollen, Push oder LiveCenter.

## Sicherheitsprüfung

- Laufzeitpakete: npm audit --omit=dev meldet 0 Befunde.
- Gesamter Paketbaum: 0 kritisch, 0 hoch, 16 mittel.
- Die verbleibenden Meldungen stammen von minimatch und betroffenen ESLint-Abhängigkeiten. Die aktuellen React/Import/Accessibility-Plugins benötigen noch ältere minimatch-Schnittstellen. Ein globaler Override auf Version 11 würde diese Aufrufe brechen; npm audit fix --force schlägt sogar inkompatible Downgrades vor. Deshalb keine erzwungenen Overrides und keine unterdrückten Meldungen. Behebung dieser restlichen Entwicklungswerkzeug-Befunde benötigt kompatible Herstellerupdates oder eine gesonderte Migration der Prüfwerkzeuge.
- Keine Garantie, dass die Anwendung frei von allen Sicherheitsproblemen ist. Auditberichte dokumentieren den aktuellen Registry-Stand.
- 41 Tests bestanden. ESLint ausgeführt: 103 Fehler, 81 Warnungen im Projekt; kein sauberer Lint-Lauf. Build-Ergebnis siehe separate PRUEFUNG-V25.0.1.txt.

## Installation

Projekt sichern. PATCH-ZIP über v25.0.0 entpacken und Dateien ersetzen. Die vorhandene next.config.ts (einschließlich Hostinger-Einstellungen) bleibt dabei erhalten. FULL ist alternativ der komplette lokale Projektstand; individuelle Änderungen vorher vergleichen. Umgebungsvariablen/.env.local behalten.

Im VS-Code-Terminal im Projektordner:

```powershell
npm.cmd ci
npm.cmd audit --omit=dev
npm.cmd test
npm.cmd run build
```

Nach erfolgreichem Build die ersetzten Dateien prüfen und veröffentlichen:

```powershell
git add package.json package-lock.json VERSION lib/branding.ts INSTALLATION-V25.0.1-SECURITY.md
git commit -m "HUJA v25.0.1 Sicherheitsupdates und Webpack-Build"
git push
```

Bei aktivem automatischem Deployment veröffentlicht Hostinger den neuen Stand. Danach dort erneut den Sicherheitsscan und das Build-Protokoll prüfen. Lokal wurde kein Deployment ausgeführt.
