# HUJA v24.0.0 – Dynamic Home

Basis ist ausschließlich die zuletzt angehängte `vereins-seite.zip` aus dem referenzierten Gespräch, Versionsstand 23.7.0. Die Datei wurde in dieser Windows-Umgebung als Gesprächsanhang bereitgestellt, nicht unter dem Linux-Pfad `/mnt/data`.

SHA-256 der unveränderten Basis: `35a4052c8858ba9539ae1b4ee6061c24f64e8cd5805489f179fcf1d7641d3abb`.

## Einspielen

1. Bestehenden Projektordner und Datenbank sichern.
2. Die separat mitgelieferte `VERSION-24.0.0-DYNAMIC-HOME.sql` im Supabase SQL Editor ausführen. Voraussetzung ist die bereits vorhandene Tabelle `app_settings` aus v22.1.0. Die Migration ergänzt ausschließlich eine einschränkende Rollenregel für den neuen Schlüssel `home_modules`. Andere Settings, Tabellen, Storage- und Push-Regeln bleiben unverändert. Die Migration ist wiederholbar.
3. Entweder die Patch-ZIP direkt in den Projektordner des oben genannten v23.7.0-Stands entpacken und Dateien ersetzen, oder die vollständige Projekt-ZIP in einen neuen Ordner entpacken. Nicht beide Varianten nacheinander erforderlich. `PATCH-INHALT.txt` listet die enthaltenen Änderungen.
4. Bestehende `.env.local` bzw. Hosting-Variablen weiterverwenden. Für das öffentliche Lesen der Startseiten-Einstellungen wird wie bei den vorhandenen Sound-/Matchday-Funktionen der rein serverseitige `SUPABASE_SECRET_KEY` oder `SUPABASE_SERVICE_ROLE_KEY` benötigt. Niemals einen solchen Schlüssel als `NEXT_PUBLIC_*` setzen. Keine Zugangsdaten sind in den ZIPs enthalten.
5. Im Projektordner ausführen:

   ```sh
   npm ci
   npm test
   npm audit
   npm run build
   ```

6. Wie gewohnt veröffentlichen. Als Administrator oder Vorstand unter **Admin → Startseite verwalten** die gewünschten Bereiche einschalten und speichern. Niedrige Positionszahlen erscheinen zuerst. Ohne gespeicherte Konfiguration bleiben die bisherigen Bereiche eingeschaltet.

## Bedienung

- **Liga und Pokal:** Das normale nächste Spiel und der Countdown verwenden Liga-Spiele. Pokal/Cup und ausdrücklich als Test-/Freundschaftsspiel oder Turnier bezeichnete Wettbewerbe werden davon ausgeschlossen. Unbekannte oder leere Wettbewerbsnamen bleiben aus Kompatibilitätsgründen ligaähnlich; deshalb das Feld `competition` sauber pflegen. Das Pokalfenster zeigt das nächste geplante zukünftige Pokalspiel. Kein passendes Spiel: kein Fenster. Die Pokalspiele müssen in `matches` eingetragen sein; das Update importiert keine Spieldaten.
- **Fußball.de:** Das vorhandene externe Widget bleibt als eigener schaltbarer Bereich „Fußball.de-Spielplan“ erhalten. Seine Spielauswahl bestimmt weiterhin der externe Anbieter.
- **Startseite:** Match-Center/Liga-Nächstes-Spiel, Pokal, Tabelle, News, Galerie, Mannschaft, Sponsoren, Matchday-Hub einschließlich Tippspiel, Fanpass, Top Highlights sowie die weiteren vorhandenen Bereiche sind zentral schaltbar. Matchday-Hub und Tippspiel sind ein gemeinsames bestehendes Modul. Hero und Kontonavigation bleiben erhalten.
- **☰ Menü:** Zeigt aktivierte Bereiche mit tatsächlich gerendertem Inhalt, springt zu deren Abschnitt und schließt sich. Escape und Klick außerhalb schließen ebenfalls. Ausgeblendete Startseitenmodule löschen keine Inhalte und sperren keine eigenständigen Routen.
- **Top Moment:** Im LiveCenter bei „Live-Moment“ ein Video aufnehmen oder auswählen und „⭐ Top Moment“ aktivieren. Optional unter „Mit vorhandenem Ereignis verbinden“ das Tor bzw. Ereignis wählen. Dann werden Minute, Spieler und Ereignis direkt weiterverwendet; kein zusätzliches Tor wird gespeichert. Ein Ereignis kann ein Video enthalten; vorhandene Videos werden nicht überschrieben.
- **Nach dem Spiel:** Sobald der Spielstatus `finished` ist, werden markierte Videos beim nächsten Laden der Startseite automatisch berücksichtigt. Bis zu zwölf Clips werden angezeigt, nach Spieltermin und Minute sortiert. Ein Upload öffnet kein abgeschlossenes Spiel erneut. Vorhandene bereits markierte Videos werden ebenfalls übernommen.
- **Markierung entfernen:** In der Ereignisliste des LiveCenters die vorhandene Highlight-Schaltfläche erneut verwenden. Alle Video-Ereignisse bleiben dort zur Verwaltung erreichbar, auch wenn sie nicht zu den letzten acht Ereignissen gehören. Ohne markierte Videos beendeter Spiele wird Top Highlights samt Menüpunkt ausgeblendet. Der globale Startseiten-Schalter kann den Bereich zusätzlich abschalten.
- **Live-Aufstellung:** Die in der Basis enthaltenen automatischen Tor-, Karten- und Wechselanzeigen bleiben erhalten. Sie werden aus Match-Events abgeleitet, einschließlich Toranzahl und Gelb-Rot aus zwei gelben Karten. Undo/Änderungen aktualisieren die Anzeige. Die Spielminute kommt bei Tor/Karten/Wechseln serverseitig aus der Match-Uhr; numerische Nachspielzeit wie 92 bleibt erhalten. Eine getrennte Halbzeit-/Nachspielzeitangabe pro Event unterstützt das vorhandene Datenmodell nicht.
- **Test-Labor:** Tor simulieren, im neuen Top-Moment-Test ein lokales Video wählen, markieren und „Abpfiff“ simulieren. Die Vorschau nutzt dieselbe Highlight-Karte und Freigabebedingung. Markierung oder Modul ausschalten, Tor zurücknehmen bzw. Labor zurücksetzen: Vorschau verschwindet. Das Testvideo bleibt als lokale Browserdatei im Speicher; keine Upload-, Push- oder Statistik-Schreibaktion wird ausgelöst.

## Prüfungen und Grenzen

Siehe `PRUEFUNG-V24.0.0.md`. Build, 23 Tests und gezielte ESLint-Prüfung waren erfolgreich. Der abschließende npm-Audit meldete null bekannte Schwachstellen. Next.js/eslint-config-next wurden auf 16.3.5, sharp auf 0.35.4 und js-yaml auf 4.3.2 korrigiert. nanoid bleibt 3.3.18.

Keine Produktionsdatenbank wurde verwendet oder verändert. SQL/RLS, reale Handyaufnahme und Storage-Upload, Live-Realtime und Push-Zustellung müssen nach Installation in eurer Umgebung geprüft werden. Für den lokalen Build wurden ausschließlich Platzhalter-Konfigurationswerte verwendet.

## Kurzer Abnahmetest

1. Zwei Spiele anlegen: früheres Pokalspiel und späteres Ligaspiel, einmal mit Middelich als Auswärtsteam und ohne Bindestrich im Namen. Liga und Pokal müssen im richtigen Fenster erscheinen.
2. Pokal ausschalten und News nach oben sortieren; Startseite neu laden. Pokalfenster und Menüpunkt fehlen, News steht an der gewählten Position. Danach wieder aktivieren.
3. Im Testspiel Uhr auf 67 stellen, Pro-Tor, Gelb, Rot und Wechsel speichern; richtige Minute und Aufstellungssymbole prüfen. Auch pausierte Uhr und Minute 92 prüfen.
4. Video an das Tor hängen und markieren: Spielstand/Toranzahl bleiben unverändert. Vor Abpfiff kein Startseitenhighlight; nach Abpfiff und Neuladen sichtbar. Markierung entfernen: Highlight verschwindet.
5. Auswärtstor und Gegentor jeweils zurücknehmen; richtige Spielstandsseite und Aufstellung prüfen. Historische Tore ohne Spielerzuordnung können wegen älterer uneindeutiger Beschreibungen eine manuelle Spielstandskorrektur erfordern.
6. Als Trainer bzw. Spieler darf Startseitenverwaltung nicht speicherbar sein; vorhandene LiveCenter-Rollen bleiben unverändert.

Full ZIP enthält keine `node_modules`, `.next`, `.git`, `.env.local` oder `tsconfig.tsbuildinfo`. Die temporäre Layout-Testseite wird nicht ausgeliefert.
