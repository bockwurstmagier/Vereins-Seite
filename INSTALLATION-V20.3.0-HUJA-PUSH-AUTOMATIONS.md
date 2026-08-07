# Version 20.3.0 – HUJA Push Automations

## Automatische Push-Nachrichten

### Spiel geht live

Sobald im LiveCenter auf `Anpfiff` geklickt wird, erhalten abonnierte Geräte
automatisch eine Nachricht:

```text
🔴 JETZT LIVE!
Middelich gegen Gegner läuft jetzt im HUJA MatchCenter.
```

Ein Tippen auf die Nachricht öffnet direkt das MatchCenter.

### Neue Vereinsnews

Wird eine News direkt veröffentlicht oder ein Entwurf erstmals auf
`Veröffentlicht` gestellt, erscheint automatisch:

```text
📰 Neue Vereinsnews
Titel · Kurztext
```

Ein Tippen öffnet direkt den News-Beitrag.

## Doppel-Push-Schutz

`push_delivery_log` speichert eindeutige Ereignisschlüssel. Dadurch wird
derselbe Live-Start oder dieselbe News nicht mehrfach automatisch versendet,
selbst wenn ein Button erneut gespeichert wird.

## Push-Einstellungen

Im vorhandenen Push-Menü gibt es jetzt fünf Auswahlmöglichkeiten:

- Spiel live
- News
- Tore
- Karten
- Wechsel

Bestehende Push-Abos erhalten `Spiel live` und `News` automatisch als aktiviert.

## Wichtig

Push-Fehler blockieren weder das Starten eines Spiels noch das Veröffentlichen
einer News.

## Installation

### 1. SQL ausführen

```text
sql/VERSION-20.3.0-HUJA-PUSH-AUTOMATIONS.sql
```

### 2. Prüfen, dass diese Hostinger-Variablen weiterhin gesetzt sind

```text
NEXT_PUBLIC_SUPABASE_URL
SUPABASE_SECRET_KEY
NEXT_PUBLIC_VAPID_PUBLIC_KEY
VAPID_PRIVATE_KEY
VAPID_SUBJECT
```

### 3. Deployen

```powershell
npm run build
git add -A
git commit -m "Version 20.3: automatische Live und News Pushs"
git push origin main
```

### 4. Test

Auf einem Handy Push-Nachrichten aktivieren und anschließend:

1. ein Testspiel auf `Anpfiff` stellen
2. eine Test-News veröffentlichen

Beide Pushs sollten auch erscheinen, wenn die installierte PWA geschlossen ist.
