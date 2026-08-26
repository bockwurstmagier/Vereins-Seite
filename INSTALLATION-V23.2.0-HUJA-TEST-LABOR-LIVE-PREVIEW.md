# HUJA v23.2.0 – Test-Labor Live Preview

## Neu
- Echte HUJA Tor-Vorschau im Test-Labor.
- Spielerbild, Spielername, Vorlage, Minute und Spielstand werden angezeigt.
- Vorschau für Hattrick, Comeback und Last-Minute.
- Anpfiff-, Halbzeit-, 2.-Halbzeit- und Abpfiff-Overlay.
- Eigener Tor-Sound wird mit dem aktuell gespeicherten Start-/End-Ausschnitt getestet.
- Tor-Push und Halbzeit-Push können visuell als Vorschau getestet werden.
- Push-Vorschauen werden niemals versendet.

## Isolation
- Kein Testspiel wird in Supabase gespeichert.
- Keine Match-Events werden geschrieben.
- Keine Push-Nachrichten werden verschickt.
- Keine Statistiken, Tabelle, News oder öffentliche MatchCenter-Daten werden verändert.
- Spieler und Tor-Sound-Einstellungen werden nur lesend verwendet.

Keine neue Supabase-SQL erforderlich.
