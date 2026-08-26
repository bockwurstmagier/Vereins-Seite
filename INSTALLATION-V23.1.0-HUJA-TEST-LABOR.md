# HUJA v23.1.0 – Test-Labor

- Neuer Admin-only Bereich `/admin/test-labor`.
- Testspiel läuft vollständig lokal im Browserzustand.
- Es wird KEIN Match in Supabase angelegt.
- Keine Match-Events werden in Supabase geschrieben.
- Keine Push-Nachrichten.
- Keine Startseiten-/MatchCenter-Veröffentlichung.
- Keine Spieler-/Saisonstatistiken.
- Keine News oder Abschlussautomatik.
- Echte aktive Spieler werden nur lesend geladen, damit Auswahl und Namen realistisch getestet werden können.
- Testbar: Anpfiff, Halbzeit, 2. Halbzeit, Abpfiff, Tor, Gegentor, Gelb, Wechsel, Minuten.
- Schnelltests: Hattrick, Comeback, Last-Minute.
- Reset löscht nur den lokalen Simulatorzustand.

Keine SQL erforderlich.
