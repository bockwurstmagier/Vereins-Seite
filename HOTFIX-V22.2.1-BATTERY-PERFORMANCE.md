# HUJA v22.2.1 – Battery & Performance Hotfix

- Live-Uhr aktualisiert nicht mehr jede Sekunde, sondern exakt zum nächsten Spielminuten-Wechsel.
- Besonders in Admin → Live-Steuerung reduziert das zwei parallele Sekundentimer auf minutenbasierte Updates.
- Timer pausieren automatisch, wenn die App nicht sichtbar ist, und synchronisieren beim Zurückkehren sofort.
- Analytics erzeugt auf Admin-/Loginseiten überhaupt keinen Heartbeat-Timer mehr.
- Öffentlicher LiveCenter-Realtime-Channel wird im Hintergrund sauber getrennt und beim Zurückkehren mit Sofort-Sync neu verbunden.
- Matchday-Auto-Refresh läuft nur bei sichtbarer App und wurde auf 60 Sekunden entschärft; bei Rückkehr erfolgt sofortiger Refresh.
- Admin-Dashboard-Countdown aktualisiert nur noch alle 15 Sekunden und pausiert im Hintergrund.
- Push-Benachrichtigungen, Live-Automatik, Matchday Hub, Voting, Fanpass, Toranimationen und eigener Tor-Sound bleiben unverändert.
- Keine Supabase-SQL notwendig.
