# HUJA v25.0.2 – minimatch

Basis: v25.0.1. Beide alten minimatch-Versionen werden durch den gepatchten Upstream-Matcher 11.0.4 ersetzt. Next.js 16.4.5 und der Webpack-Build bleiben erhalten. Keine SQL-Migration.

## Umsetzung

Requests für minimatch 10 werden gezielt auf 11.0.4 aufgelöst. Für die ESLint-Plugins mit Version-3-Aufrufen wird ein kleines lokales Paket @huja/minimatch-compat verwendet. Es enthält keinen alten Matcher, sondern delegiert an unverändertes minimatch 11.0.4. Der callable CommonJS-Export und das vom Import-Plugin verwendete makeRe().test() werden angepasst; letzteres erzeugt kein RegExp, sondern verwendet den neuen Matcher. Das ist eine auf diese Entwicklungswerkzeuge begrenzte Kompatibilitätsschicht, keine universelle Version-3-Nachbildung.

Quelltext und installierbares Paket liegen unter vendor/. npm verwendet die committed Tarball-Datei samt Lockfile-Integrität. Den vendor-Ordner unbedingt mit übertragen. Die Adapterlösung benötigt Pflege, bis die Plugins selbst moderne minimatch-Exports unterstützen. Sicherheitsmeldungen werden nicht deaktiviert.

## Installation

Projekt sichern. PATCH über v25.0.1 entpacken und Dateien ersetzen; individuelle Änderungen vergleichen. Die bestehende next.config.ts bleibt im Patch unverändert. FULL ist alternativ der vollständige lokale Projektstand. Hosting-Variablen/.env.local behalten.

```powershell
npm.cmd ci
npm.cmd audit
npm.cmd test
npm.cmd run build
```

Nach erfolgreicher Prüfung:

```powershell
git add package.json package-lock.json VERSION lib/branding.ts vendor tests/minimatch-security.test.cjs INSTALLATION-V25.0.2-MINIMATCH.md
git commit -m "HUJA v25.0.2 minimatch Sicherheitsfix"
git push
```

Bei automatischem Hostinger-Deployment danach dort Build und Sicherheitsscan prüfen. Nicht den alten Pull Request #1 zusammenführen. Dieses Paket wurde lokal erstellt, nicht veröffentlicht.

Prüfergebnisse und Einschränkungen stehen in PRUEFUNG-V25.0.2.txt neben den ZIPs. Ein leerer Auditbericht ist keine Garantie für vollständige Anwendungssicherheit.
