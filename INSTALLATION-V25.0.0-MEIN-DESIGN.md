# HUJA v25.0.0 – Mein Design

Auf Basis des zuletzt erstellten Projektstands v24.2.0.

## Funktionen

Über das Startseitenmenü oder mobile Menü „Mein Design“ öffnen. Hell, Dunkel oder Geräteeinstellung wählen; Hintergründe Flutlicht, Rot & Schwarz, Vereinsliebe und Pur. Auswahl wird sofort übernommen und lokal im Browser gespeichert, auch ohne Anmeldung. Keine Synchronisierung zwischen Geräten. Zurücksetzen stellt Dunkel/Flutlicht/Effekte an wieder her. Die Geräteeinstellung „Bewegung reduzieren“ hat Vorrang. Fotos, Spielfeld und Pokalkarte behalten ihre eigenen Kontrastfarben.

Vorhandenes Stadionbild und Vereinswappen werden wiederverwendet, ein kleines Rauch-SVG ergänzt die Auswahl. Keine zusätzlichen Pakete, keine SQL-Migration. Auth, Rollen, RLS und Live-/Push-Logik wurden nicht geändert.

## Installation

Projekt sichern. PATCH über v24.2.0 entpacken und vorhandene Dateien ersetzen; bei anderem Ausgangsstand das FULL-Paket verwenden und eigene Änderungen vergleichen. Bestehende Hosting-Variablen und .env.local behalten.

```powershell
npm.cmd ci
npm.cmd test
npm.cmd run build
```

Bei bestehendem automatischem Hostinger-Deployment über GitHub anschließend Änderungen committen und pushen. Dieses Paket wurde nicht veröffentlicht.

## Prüfungen und Grenzen

41 Tests erfolgreich. Produktionsbuild einschließlich TypeScript erfolgreich, mit Platzhalter-Supabase-Zugang. Browserprüfung: Hell/Dunkel-Auswahl, Hintergrundwechsel, Effektschalter, Speicherung nach Neuladen sowie mobile Ansicht mit 390 Pixel Breite. Produktive Daten, eingeloggte Rollen und jede einzelne Unterseite wurden nicht durchgeklickt.

npm audit ausgeführt: 21 Befunde (16 mittel, 4 hoch, 1 kritisch); kritisch: Next.js. Die Paketversionen wurden für dieses Design-Update nicht verändert. Vor Veröffentlichung Sicherheitsupdates vornehmen und erneut testen. Vollständiger Auditbericht liegt separat bei.

ZIPs werden auf CRC und vollständige Rekonstruktion aus v24.2.0 plus Patch geprüft. FULL ohne node_modules, .next, .git, .env.local und tsconfig.tsbuildinfo.
