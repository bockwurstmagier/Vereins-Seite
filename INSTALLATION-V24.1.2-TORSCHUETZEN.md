# HUJA v24.1.2 – Automatische Torschützen im letzten Spiel

„Letztes Ergebnis“ liest nun die Tore des beendeten Spiels direkt aus den vorhandenen LiveCenter-Ereignissen. Zugeordnete Spieler werden mit ihren Tor-Minuten angezeigt, mehrere Treffer pro Spieler zusammengefasst. Reine Gegentor-Ereignisse werden ausgeschlossen. Videos, Karten und Notizen zählen nicht als weitere Tore.

Damit funktioniert die Anzeige auch für bereits abgeschlossene Spiele: Nach dem Deployment die Hauptseite neu laden. Das Spiel muss nicht nochmals beendet werden; keine erneute Automatisierung, Nachricht oder Push-Auslösung nötig. Änderungen an den Tor-Ereignissen werden beim nächsten Laden berücksichtigt.

Voraussetzung für Namen: Beim Eintragen des Tores muss ein Spieler zugeordnet worden sein. Ohne Zuordnung oder verfügbaren Spielernamen zeigt die Karte „Torschütze nicht zugeordnet“ mit der Minute. Eine nachträgliche Spielerzuordnung im bestehenden Match-Center wird ebenfalls berücksichtigt. Ohne Live-Torereignisse werden vorhandene manuelle Torschützen weiterhin angezeigt. Bei einem Lesefehler bleibt ebenfalls die bisherige manuelle Anzeige erhalten.

## Installation

1. Projekt sichern und PATCH-ZIP über den vorhandenen Stand v24.0.0 bis v24.1.1 entpacken, Dateien ersetzen. Frühere Korrekturen sind enthalten. Alternativ FULL-ZIP verwenden. Bestehende Hosting-Variablen/.env.local behalten.
2. Prüfen und bereitstellen:

```powershell
npm.cmd ci
npm.cmd test
npm.cmd run build
```

Bei bestehender GitHub-Anbindung mit automatischem Hostinger-Deployment:

```powershell
git add .
git commit -m "HUJA v24.1.2 Torschuetzen aus LiveCenter"
git push
```

3. Nach erfolgreicher Veröffentlichung Hauptseite neu laden. Das letzte beendete Spiel mit Live-Toren muss jetzt die Namen und Minuten anzeigen.

Keine neue SQL-Migration erforderlich. Keine Änderungen an Toren, Spielständen, Auth, Rollen, Statistiken, Push oder Abschlussautomatik. Die Änderung liest vorhandene Daten und verändert eure Datenbank nicht.

## Prüfung

33 Tests erfolgreich: darunter Tor-Gruppierung, Nachspielzeit, Ausschluss von Gegentoren/Notizen, fehlende Spieler und die tatsächliche Datenladefunktion für bereits beendete Spiele einschließlich Korrekturen und manuellem Rückfall. Produktionsbuild mit Platzhalter-Supabase-Konfiguration erfolgreich; keine Prüfung gegen eure produktiven Datenbankinhalte. ZIPs werden auf CRC und Inhaltsgleichheit geprüft.
