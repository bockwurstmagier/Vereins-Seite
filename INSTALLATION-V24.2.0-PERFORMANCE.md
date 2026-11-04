# HUJA v24.2.0 – Performance

## Änderungen

- Geplante Spiele und Vereinslogos werden innerhalb eines React-Seitenaufrufs gemeinsam geladen: Countdown, nächstes Ligaspiel und Pokal greifen auf dieselben Ergebnisse zurück. Auch Matchday-Hub und Featured-Match-Center teilen ihre Übersichtsabfrage. Es gibt keinen dauerhaften Cache und kein neues Zeitfenster für veraltete Live-Daten.
- Die Startseitenmodule liegen in einzelnen Suspense-Bereichen. Der Seitenkopf muss nach dem Laden der Modulkonfiguration nicht mehr auf Pokal, Highlights und sämtliche weiteren Module warten. Die Bereiche können unabhängig nachgeliefert werden. Das Schnellmenü berücksichtigt nachgeladene und leere Abschnitte.
- Das Schnellmenü beobachtet nur noch Änderungen unmittelbar an den Abschnittsgrenzen. Änderungen an Countdown-Texten und innerhalb von Widgets lösen keine ständigen vollständigen Menüprüfungen aus. Unveränderte Menüpunkte führen zu keiner neuen Zustandsliste.
- Die Mannschaftsvorschau fragt nur sechs Spieler ab und übergibt nur diese an den Browser. Die vollständige Mannschaftsseite behält ihren bisherigen Umfang.
- News-, Galerie-, Spieler- und Sponsorenbilder laden verzögert und werden asynchron dekodiert. Die priorisierten Bilder des oberen Startbereichs bleiben priorisiert.
- Die Größenangaben für Hero-Wappen und dekorative Wappen entsprechen jetzt den angezeigten Größen; der Browser kann passendere Bildvarianten wählen.
- Die Sponsorenleiste läuft über eine CSS-Animation und pausiert außerhalb des sichtbaren Bereichs sowie in einer ausgeblendeten App/einem Hintergrund-Tab. Bei reduzierter Bewegung wird sie abgeschaltet. Die Sponsoren bleiben über „Alle Sponsoren“ erreichbar.

Keine Änderungen an Auth/Rollen/RLS, Push-Zustellung, LiveCenter-Taktung oder Abschlussautomatik. Frühere Fixes für Uhrzeit, Pokal, getrennte Spielbereiche und Torschützen sind enthalten. Keine neue SQL-Migration.

## Installation

Projekt sichern. PATCH-ZIP über euren Stand v24.0.0 bis v24.1.2 entpacken und Dateien ersetzen; alternativ FULL-ZIP verwenden. Eigene nachträgliche Codeänderungen vorher vergleichen. Bestehende .env.local/Hosting-Variablen behalten.

```powershell
npm.cmd ci
npm.cmd test
npm.cmd run build
```

Bei bestehender GitHub-Anbindung mit automatischem Hostinger-Deployment:

```powershell
git add .
git commit -m "HUJA v24.2.0 Performance"
git push
```

## Nach dem Deployment prüfen

Startseite auf dem Handy öffnen: Wappen, Pokal, Highlights und Module prüfen, Menü aufklappen und zu nachgeladenen Abschnitten springen. Leere Highlights dürfen nicht dauerhaft im Menü erscheinen. Mannschaftsvorschau zeigt sechs Spieler, vollständige Teamseite weiterhin alle. Sponsorenleiste beim Scrollen und nach Rückkehr aus einer ausgeblendeten App prüfen. Live-Tore/Uhr/Push unverändert kontrollieren.

## Prüfstand

36 Tests erfolgreich und TypeScript-Prüfung erfolgreich. Produktionsbuild mit Platzhalter-Supabase-Konfiguration erfolgreich. Die Tests prüfen unter anderem die Datenabfrage-Zusammenführung mit einer simulierten React-Anfragegrenze und das Menü bei ein-/ausgeblendeten Abschnitten. Kein gemessener Vorher/Nachher-Geschwindigkeitsgewinn behauptet. Öffentliche Ausgangsmessung und Grenzen: PERFORMANCE-PRUEFUNG-V24.2.0.md.

Nicht veröffentlicht und keine produktiven Daten geändert. ZIPs sind inhalts- und CRC-geprüft, ohne node_modules/.next/.git/.env.local/tsconfig.tsbuildinfo.
