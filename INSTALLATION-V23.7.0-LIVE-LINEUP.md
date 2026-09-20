# HUJA v23.7.0 – Live-Aufstellung

Basis: die bereitgestellte Projekt-ZIP mit VERSION 23.6.3.

## Installation

1. Den aktuellen Projektordner sichern.
2. Die Patch-ZIP direkt in den bestehenden Projektordner entpacken und die enthaltenen Dateien ersetzen. Alternativ die vollständige ZIP in einen neuen Projektordner entpacken.
3. Die vorhandene `.env.local` bzw. die bestehenden Hosting-Umgebungsvariablen weiterverwenden. Zugangsdaten sind nicht in diesen ZIPs enthalten.
4. Im Projektordner ausführen:

   ```sh
   npm ci
   npm test
   npm run build
   ```

5. Anschließend wie gewohnt veröffentlichen und die App neu laden.

Für dieses Update ist keine zusätzliche SQL-Migration nötig. Die bereits vorhandenen Tabellen `matches`, `match_events` und `match_squad` sowie deren bisherige Realtime-Konfiguration werden weiterverwendet.

## Änderungen

- Pro-Tor, normales Live-Tor, gelbe/rote Karte und Wechsel berechnen die Minute beim Speichern auf dem Server aus der aktuellen Spieluhr. Der alte Formularwert (häufig 1) wird nicht mehr verwendet.
- Eine pausierte Uhr bleibt maßgeblich. Die bestehende Minuten- und Nachspielzeitberechnung bleibt erhalten; Ereignisse speichern weiterhin numerische Minuten (z. B. 92).
- Öffentliche Aufstellung und interaktiver Aufstellungseditor zeigen Tore (bei mehreren mit Anzahl), gelbe und rote Karten sowie Ein-/Auswechslungen. Auch Ersatzspieler erhalten die Symbole.
- Zwei gespeicherte gelbe Karten für denselben Spieler werden als Gelb-Rot angezeigt. Es gibt keinen neuen Ereignistyp und keine automatische zusätzliche rote Karte in der Datenbank.
- Die Symbole werden aus den aktuellen Ereignissen berechnet: Löschen, Korrigieren und Undo aktualisieren sie automatisch. Ereignisse ohne Spielerzuordnung erscheinen weiterhin nur im Ticker.
- Der Editor aktualisiert Ereignisse über Realtime, ohne ungespeicherte Spielerpositionen zu überschreiben. Im Hintergrund wird die zusätzliche Verbindung geschlossen.
- Wechsel werden markiert; Spieler werden nicht automatisch auf der Taktiktafel verschoben oder entfernt.
- VERSION, Package-Version und die Versionsanzeige der App stehen auf 23.7.0.
- Die Lockdatei wird mit den bereits in package.json aufgeführten Push-Abhängigkeiten abgeglichen.

## Kurzer Test mit einem Testspiel

1. Die zweite Halbzeit starten, auf 67 Minuten stellen und die Uhr weiterlaufen lassen.
2. Pro-Tor öffnen, Spieler und optional Vorlage wählen, sofort speichern: Die aktuelle Minute muss erscheinen, nicht 1.
3. Gelb, Rot und Wechsel eintragen und deren Minuten kontrollieren.
4. Die öffentliche Aufstellung und den Editor in einem zweiten Fenster öffnen: Tore/Karten/Wechsel müssen am jeweiligen Spieler erscheinen.
5. Ein zweites Tor und eine zweite gelbe Karte eintragen: Toranzahl bzw. Gelb-Rot kontrollieren.
6. Undo ausführen: Das zugehörige Symbol bzw. die Anzahl muss zurückgehen.
7. Im Editor eine Position verschieben, ohne zu speichern. Ein Ereignis im anderen Fenster hinzufügen: Die Position muss erhalten bleiben.

Die Live-Verbindung zu eurer produktiven Supabase-Datenbank muss nach dem Einspielen mit einem Testspiel geprüft werden.
