# Version 9.0.2 – Dauerhafte Live-Hinweise und Torsound

## Was neu ist

- Push-Abo bleibt nach dem Schließen der App gespeichert.
- Tore, Karten und Wechsel können bei geschlossener PWA als
  Systembenachrichtigung erscheinen.
- Tore spielen bei geöffneter App einen eigenen HUJA-Torsound.
- Besucher können Tore, Karten und Wechsel einzeln an- oder ausschalten.
- Abgelaufene Geräte-Abos werden automatisch deaktiviert.

## 1. SQL ausführen

In Supabase:

```text
SQL Editor → New query
```

Den kompletten Inhalt dieser Datei ausführen:

```text
sql/VERSION-9.0.2-WEB-PUSH.sql
```

## 2. Paket installieren

Im Projektordner:

```powershell
npm install web-push
npm install -D @types/web-push
```

Dadurch wird auch `package-lock.json` korrekt aktualisiert.

## 3. VAPID-Schlüssel erzeugen

```powershell
npx web-push generate-vapid-keys
```

Du erhältst einen Public Key und einen Private Key.

## 4. Lokale `.env.local`

Ergänzen:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=DEIN_PUBLIC_KEY
VAPID_PRIVATE_KEY=DEIN_PRIVATE_KEY
VAPID_SUBJECT=mailto:deine-email@example.de
SUPABASE_SECRET_KEY=DEIN_SUPABASE_SECRET_KEY
```

Den Secret Key findest du in Supabase unter:

```text
Project Settings → API Keys → Secret keys
```

Alternativ funktioniert im Code auch der ältere:

```env
SUPABASE_SERVICE_ROLE_KEY=...
```

Wichtig: Secret Key, Private Key und Service-Role-Key niemals mit
`NEXT_PUBLIC_` benennen und niemals öffentlich teilen.

## 5. Vercel-Variablen

Unter:

```text
Vercel → Project → Settings → Environment Variables
```

dieselben vier Variablen eintragen:

```text
NEXT_PUBLIC_VAPID_PUBLIC_KEY
VAPID_PRIVATE_KEY
VAPID_SUBJECT
SUPABASE_SECRET_KEY
```

Danach ein neues Deployment starten.

## 6. GitHub und Vercel

```powershell
npm run build
git add -A
git commit -m "Funktion: Dauerhafte Live Push Hinweise und Torsound"
git push origin main
```

## 7. Auf dem Handy

1. PWA vollständig schließen und neu öffnen.
2. Im Match-Center auf `Live-Hinweise` tippen.
3. `Dauerhaft aktivieren` wählen.
4. Systemabfrage erlauben.
5. Optional `Torsound an` aktivieren.

Die Berechtigung und das Push-Abo bleiben anschließend gespeichert.
Nur nach Deinstallation, Löschen der Website-Daten oder manueller
Deaktivierung in den Systemeinstellungen ist eine erneute Aktivierung nötig.

## Sound-Hinweis

Bei geöffneter App wird `public/sounds/goal.wav` abgespielt.
Bei geschlossener App verwendet das Handy seinen System-
Benachrichtigungston. Eigene MP3-/WAV-Töne sind für Hintergrund-Web-Push
nicht plattformübergreifend zuverlässig festlegbar.
