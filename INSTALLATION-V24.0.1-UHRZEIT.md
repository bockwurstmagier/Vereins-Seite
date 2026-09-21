# HUJA v24.0.1 – Spielzeit-Korrektur

Behebt die Verschiebung von 19:30 auf 21:30 beim Anlegen und Bearbeiten von Spielen auf Servern mit UTC-Zeitzone. Formulareingaben werden jetzt ausdrücklich als deutsche Zeit (Europe/Berlin) interpretiert und korrekt in UTC gespeichert. Sommer- und Winterzeit werden berücksichtigt. Ungültige und bei der Zeitumstellung nicht eindeutige Uhrzeiten werden mit Fehlermeldung abgewiesen.

1. Patch-ZIP in den bestehenden v24.0.0-Projektordner entpacken und enthaltene Dateien ersetzen. Alternativ das vollständige v24.0.1-Projekt verwenden. Bestehende Umgebungsvariablen behalten.
2. Im Projektordner ausführen:

```powershell
npm.cmd ci
npm.cmd test
npm.cmd run build
```

3. Über euren bisherigen Hostinger-Veröffentlichungsweg bereitstellen. Bei bestehender GitHub-Anbindung mit automatischem Deployment:

```powershell
git add .
git commit -m "HUJA v24.0.1 Spielzeit korrigiert"
git push
```

4. Nach erfolgreichem Deployment das betroffene Spiel im Admin bearbeiten, erneut **19:30** einstellen und speichern. Seite neu laden und kontrollieren. Bereits falsch gespeicherte Zeiten werden nicht pauschal verschoben, damit korrekt gespeicherte/importierte Spiele unverändert bleiben.

Keine zusätzliche SQL-Migration für v24.0.1 erforderlich. Die Installationsvoraussetzungen von v24.0.0 bleiben bestehen.

27 automatisierte Tests bestanden, einschließlich Anlegen/Bearbeiten mit 19:30, Sommer-/Winterzeit, Tageswechsel, UTC-/Berlin-/New-York-Serverzeitzone und Zeitumstellung. Produktionsbuild erfolgreich mit Platzhalter-Supabase-Konfiguration. Keine Änderungen an eurer produktiven Datenbank oder Hostinger-Installation durchgeführt. Abhängigkeiten gegenüber v24.0.0 unverändert.
