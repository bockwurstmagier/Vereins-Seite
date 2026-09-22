# HUJA v24.1.1 – Pokalfenster mit Wappen

Das Pokalfenster zeigt beide Vereinswappen nebeneinander, Heim/Gast, den Wettbewerbsnamen als großen Titel, goldene Pokal-Akzente, Termin und Spielort sowie einen goldenen Matchcenter-Button. Das Layout ist für schmale Bildschirme ausgelegt. Die vorhandene Spielauswahl und LiveCenter-Funktionen bleiben unverändert.

Die Wappen kommen aus den vorhandenen Vereinsdaten (`clubs`, einschließlich hinterlegter Namensvarianten). Für Middelich-Resse wird ohne hinterlegtes Logo das enthaltene Vereinswappen verwendet. Für fehlende oder nicht ladbare Bilder erscheint ein neutrales Wappensymbol. Falls das Gegnerwappen fehlt: unter Admin → Vereine Logo und Vereinsname bzw. Namensvarianten prüfen.

## Installation

PATCH-ZIP über den vorhandenen Stand v24.0.0, v24.0.1 oder v24.1.0 entpacken und Dateien ersetzen. Das Paket enthält auch die bisherigen Uhrzeit- und Liga/Pokal-Korrekturen. Alternativ FULL-ZIP verwenden. Bestehende Umgebungsvariablen behalten.

```powershell
npm.cmd ci
npm.cmd run build
```

Anschließend wie gewohnt auf Hostinger veröffentlichen. Bei bestehender GitHub-Anbindung mit automatischem Deployment:

```powershell
git add .
git commit -m "HUJA v24.1.1 Pokalfenster mit Wappen"
git push
```

Keine neue SQL-Migration erforderlich. Produktionsbuild mit Platzhalter-Supabase-Konfiguration erfolgreich. Keine Verbindung zu eurer produktiven Datenbank und keine Veröffentlichung durch diesen Patch-Erstellungsschritt. Echte Gegnerlogos sind abhängig von euren hinterlegten Vereinsdaten.

ZIPs werden auf CRC und Inhaltsgleichheit geprüft. Full ZIP ohne node_modules, .next, .git, .env.local und tsconfig.tsbuildinfo.
