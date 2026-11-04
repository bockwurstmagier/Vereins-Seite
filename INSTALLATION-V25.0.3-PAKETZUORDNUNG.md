# HUJA v25.0.3 – eindeutige minimatch-Paketzuordnung

Basis v25.0.2. minimatch ist jetzt überall das echte Registry-Paket 11.0.4, ohne Paketalias mit eigener Versionsnummer. Der Scanner kann Paketname und Version direkt zuordnen. Der alte Adapter @huja/minimatch-compat@1.0.3 ist nicht mehr installiert.

Für alte ESLint-Aufrufe lädt die Codeprüfung tools/eslint-minimatch-compat.cjs. Diese Datei passt ausschließlich den CommonJS-Export im Speicher des Prüfprozesses an. Paketdateien, Paketname und Versionsangaben werden nicht verändert. Sie wird durch den lint-Befehl und durch eslint.config.mjs geladen; Anwendung und Produktionsbuild laden sie nicht. Aktuelle Matcher-Exports bleiben auch als benannte Eigenschaften erhalten. makeRe().test() für das Import-Plugin delegiert an den aktuellen Matcher, nicht an einen alten regulären Ausdruck. Keine Warnungen werden unterdrückt.

## Installation

Projekt sichern. PATCH über v25.0.2 entpacken, Dateien ersetzen. Vorhandene eigene Änderungen vergleichen. Die bestehende next.config.ts und Hosting-Variablen bleiben erhalten.

Die vier alten Adapterdateien müssen zusätzlich entfernt werden. Im VS-Code-Terminal im Projektordner:

```powershell
Remove-Item -LiteralPath 'vendor/huja-minimatch-compat-1.0.3.tgz','vendor/minimatch-compat/index.cjs','vendor/minimatch-compat/package.json','vendor/minimatch-compat/README.md' -ErrorAction SilentlyContinue
npm.cmd ci
npm.cmd audit
npm.cmd test
npm.cmd run build
```

Leere vendor-Unterordner dürfen bestehen bleiben. Der neue tools-Ordner muss mit übertragen werden. Keine SQL-Migration.

Nach erfolgreichem Build:

```powershell
git add package.json package-lock.json VERSION lib/branding.ts eslint.config.mjs tools/eslint-minimatch-compat.cjs tests/minimatch-security.test.cjs INSTALLATION-V25.0.3-PAKETZUORDNUNG.md
git add -u
git diff --cached --stat
git commit -m "HUJA v25.0.3 eindeutige minimatch Paketzuordnung"
git push
```

Vor dem Commit die Dateiliste prüfen: git add -u nimmt auch andere bereits verfolgte Änderungen auf. Den alten Pull Request #1 nicht zusammenführen.

Nach dem Deployment Hostinger erneut scannen lassen und prüfen, dass der Scan den neuen Commit verwendet. Der Hostinger-Scanner selbst wurde hier nicht ausgeführt; sein Ergebnis kann erst nach dem Deployment bestätigt werden.

Prüfergebnisse stehen separat in PRUEFUNG-V25.0.3.txt. Frühere Installationsnotizen im Projekt beschreiben historische Stände; für dieses Update gilt diese Anleitung.
