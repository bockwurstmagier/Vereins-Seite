# HUJA v22.9.0 – Live-Regie

## Automatische Tor-Momente
- Doppelpack: zweites Tor desselben Spielers.
- Hattrick: drittes oder weiteres Tor desselben Spielers.
- Führung und Ausgleich bleiben erhalten.
- Last-Minute und Elfmetertor bleiben erhalten.
- Comeback wird erkannt, wenn das aktuelle eigene Tor aus einem Rückstand direkt in eine Führung führt.
- Alles wird aus vorhandenen Live-Ereignissen berechnet; keine Extra-Eingabe.

## Stadion-Reaktionen
- Reaktionsleiste jetzt direkt im öffentlichen MatchCenter.
- 🔥 ❤️ 👏 ⚽
- Bestehendes Security-Rate-Limiting wird weiterverwendet.
- Reaktionszahlen aktualisieren sich während LIVE alle 15 Sekunden, aber nur bei sichtbarer App.
- Bei jeder neuen Zehner-Marke erscheint kurz „HUJA! – Die Fans sind da“.
- Nach Abpfiff bleiben die Endstände der Reaktionen sichtbar.

## Smart Video Link
- Video-Momente bis zu 3 Spielminuten nach einem Tor werden in Match Story und Highlights automatisch als Tor-Moment erkannt.
- Keine zusätzliche Auswahl in der Live-Steuerung nötig.
- Bestehende Videos und MatchTV bleiben vollständig erhalten.

## Installation
Keine neue Supabase-SQL nötig. Die vorhandene Tabelle `match_reactions` wird genutzt.
Patch einspielen, `npm audit` und `npm run build` ausführen.
