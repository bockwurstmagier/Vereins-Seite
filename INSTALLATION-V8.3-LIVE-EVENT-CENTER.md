# Vereinsmanager v8.3 – Live Event Center

## Neu

- Spieluhr pausieren und exakt fortsetzen
- Spielminute frei korrigieren
- Nachspielzeit weiterhin automatisch als 45+X und 90+X
- animierte Live-Einblendungen bei Toren, Karten und Wechseln
- optionale Browser-Benachrichtigungen während die Website/PWA geöffnet ist
- große mobile Schnellaktionen bleiben erhalten

## Installation

1. `.env.local` aus der bisherigen Version übernehmen.
2. In Supabase den SQL Editor öffnen.
3. `sql/VERSION-8.3-LIVE-EVENT-CENTER.sql` vollständig ausführen.
4. Danach:

```bash
npm install
npm run build
npm run dev
```

## Test

- `/admin/live` öffnen und ein Spiel auswählen.
- Anpfiff starten.
- „Uhr pausieren“ drücken; die Minute muss stehen bleiben.
- „Uhr fortsetzen“ drücken; die Minute läuft ab dem gespeicherten Wert weiter.
- Eine Minute manuell setzen und speichern.
- Öffentliche Match-Center-Seite in einem zweiten Fenster öffnen.
- Tor oder Karte eintragen; die Animation sollte sofort erscheinen.

## Benachrichtigungen

Der Button „Live-Hinweise aktivieren“ nutzt die Browser Notification API.
Das funktioniert, solange Website oder installierte PWA geöffnet ist. Echte Push-Nachrichten bei komplett geschlossener App benötigen zusätzlich Web-Push-Abonnements und einen Versanddienst; das ist nicht Bestandteil dieser Version.
