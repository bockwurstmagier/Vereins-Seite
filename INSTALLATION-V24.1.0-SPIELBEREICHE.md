# HUJA v24.1.0 – Liga und Pokal getrennt

## Neu

- Unter Admin → Spiele sowie im öffentlichen Spielplan gibt es drei getrennte Bereiche: Liga, Pokal und Testspiele / Sonstige. Standardmäßig wird Liga angezeigt.
- Zuordnung anhand des bestehenden Wettbewerbsfelds: Pokal/Cup → Pokal, Testspiel/Freundschaftsspiel/Turnier → Sonstige, ansonsten Liga (einschließlich bisher unbekannter Wettbewerbsnamen).
- Bestehende Spiele werden automatisch eingeordnet. Keine Kopien, keine neuen Tabellen, kein erneutes Anlegen notwendig.
- Im Pokalbereich ist beim Anlegen „Kreispokal“ vorbelegt, im Testbereich „Freundschaftsspiel“. Nach Anlegen/Bearbeiten wird der zum gespeicherten Wettbewerb passende Bereich geöffnet. Beim Löschen bleibt der gewählte Bereich erhalten.
- Jedes Spiel bleibt bearbeitbar und hat Links zum bestehenden Match-Center und LiveCenter. Deren Rollenprüfungen bleiben unverändert. Tore, Karten, Aufstellung, Videos und Top Highlights verwenden weiterhin dieselben Match-IDs und Funktionen.
- Der Uhrzeit-Fix v24.0.1 ist enthalten. Bereits falsch gespeicherte Spielzeiten nach dem Deployment einmal korrekt einstellen und speichern.

## Installation

1. Projekt sichern. PATCH-ZIP über den vorhandenen Stand v24.0.0 oder v24.0.1 entpacken und Dateien ersetzen. Alternativ FULL-ZIP verwenden. Bestehende `.env.local` bzw. Hosting-Variablen behalten.
2. Ausführen:

```powershell
npm.cmd ci
npm.cmd test
npm.cmd run build
```

3. Über euren vorhandenen Hostinger-Deploymentweg veröffentlichen. Bei GitHub mit eingerichtetem automatischem Deployment:

```powershell
git add .
git commit -m "HUJA v24.1.0 Liga und Pokal getrennt"
git push
```

4. Nach erfolgreicher Veröffentlichung Admin → Spiele öffnen und zwischen Liga und Pokal wechseln. Das vorhandene Kreispokalspiel muss nur unter Pokal erscheinen. Auch im öffentlichen Spielplan prüfen.

Für dieses Update keine neue SQL-Migration erforderlich; Voraussetzungen von v24.0.0 bleiben bestehen. Keine Änderungen an eurer laufenden Datenbank oder Veröffentlichung vorgenommen.

## Prüfung

30 automatisierte Tests erfolgreich, einschließlich getrennter Admin-/Fanansichten, Erhalt der Spiel-Links, Filterzuordnung sowie der bisherigen Live-/Video-/Zeittests. Produktionsbuild mit Platzhalter-Supabase-Konfiguration erfolgreich. Keine Live-Prüfung gegen eure Datenbank. Abhängigkeiten gegenüber v24.0.1 unverändert.

Beide ZIPs CRC- und inhaltsgeprüft. Patch plus Ausgangsstand v24.0.0 ergibt die Full ZIP bytegenau. Full ZIP ohne node_modules, .next, .git, .env.local und tsconfig.tsbuildinfo.
