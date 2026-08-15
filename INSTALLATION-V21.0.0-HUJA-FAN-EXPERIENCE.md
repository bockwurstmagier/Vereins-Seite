# HUJA v21.0.0 – Fan Experience

## Enthalten

- Spieler-des-Spiels-Fanvoting direkt auf der öffentlichen Startseite.
- Admin wählt nach Abpfiff 2–6 Kandidaten und ein Abstimmungsende.
- Pro Browser/Gerät ist je Abstimmung eine Stimme vorgesehen.
- Gewinner wird beim Abschluss automatisch in `matches.player_of_match_id` übernommen.
- Das vorhandene Ein-Klick-Grafikstudio übernimmt beim gewählten Spiel automatisch den Gewinner für die MVP-/Spieler-des-Spiels-Grafik.
- HUJA Live Analytics im Admin-Dashboard: aktuell online, Besucher heute, Aufrufe heute, LiveCenter-Zuschauer, Votes und beliebte Bereiche.
- Analytics arbeitet anonymisiert; es werden keine Namen, E-Mail-Adressen oder IP-Adressen in den neuen Tabellen gespeichert.

## Supabase – Pflichtschritt

Im Supabase SQL Editor ausführen:

`sql/VERSION-21.0.0-HUJA-FAN-EXPERIENCE.sql`

Die neuen Tabellen sind per RLS für direkten Browserzugriff gesperrt. HUJA greift ausschließlich über serverseitige Next.js-Routen mit `SUPABASE_SECRET_KEY` bzw. dem vorhandenen Service-Role-Fallback darauf zu.

## Optional empfohlen

In Hostinger kann zusätzlich gesetzt werden:

`FAN_VOTE_SALT=<lange-zufällige-Zeichenfolge>`

Ohne diese Variable nutzt HUJA den vorhandenen Supabase-Server-Key als Salt für die anonymen Hashes. Es ist also keine zusätzliche Variable zwingend notwendig.

## Ablauf Spieler des Spiels

1. Spiel im MatchCenter beenden.
2. Im neuen Bereich **HUJA Fan Experience** 2–6 Kandidaten auswählen.
3. Abstimmungsdauer (1/3/6/12/24 Stunden) wählen und Voting starten.
4. Voting erscheint automatisch auf der Startseite.
5. Nach Ablauf wird das Voting beim nächsten Abruf automatisch abgeschlossen; alternativ kann es im Admin vorzeitig beendet werden.
6. Gewinner wird als Spieler des Spiels gespeichert.
7. Button **Gewinner-Grafik erstellen** öffnet das vorhandene Ein-Klick-Grafikstudio für dieses Spiel.

## Datenschutz / Grenzen

Die Einmal-Stimme basiert auf einer anonymen lokalen Geräte-/Browserkennung, die serverseitig nur gehasht gespeichert wird. Das ist für ein Vereins-Fanvoting sinnvoll, aber nicht manipulationssicher wie eine rechtsverbindliche Wahl: Wer Browserdaten löscht oder ein anderes Gerät verwendet, kann technisch erneut abstimmen.

## Deployment

```bash
npm run build
git add -A
git commit -m "HUJA v21.0.0 - Fan Experience"
git push origin main
```
