# Version 15.1.0 – Spieler-Einladungssystem

## Ablauf

1. Verantwortlicher öffnet:
   `Admin → Verein → Spielerportal → Spieler-Einladungen`
2. Spieler auswählen.
3. Telefonnummer und optional eine feste E-Mail-Adresse eintragen.
4. Einladung erstellen.
5. WhatsApp öffnet sich mit einer fertigen Nachricht und sicherem Link.
6. Spieler öffnet den Link, trägt E-Mail und Passwort ein.
7. Das Konto wird automatisch erstellt, als `spieler` eingerichtet und mit
   dem richtigen Spielerprofil verknüpft.
8. Der Spieler landet direkt im Spielerportal.

## Sicherheit

- zufälliger Token mit 256 Bit
- Link nur einmal nutzbar
- standardmäßig sieben Tage gültig
- jederzeit widerrufbar
- alte Einladung wird beim Neuerstellen automatisch ungültig
- Registrierung und Kontoverknüpfung laufen ausschließlich serverseitig

## Installation

### 1. SQL ausführen

```text
sql/VERSION-15.1.0-SPIELER-EINLADUNGEN.sql
```

### 2. Vercel-Variablen ergänzen

```text
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_SITE_URL
```

Beispiel:

```text
NEXT_PUBLIC_SITE_URL=https://vereins-seite-gamma.vercel.app
```

Den `SUPABASE_SERVICE_ROLE_KEY` findest du in Supabase unter:

```text
Project Settings → API Keys → service_role
```

Der Service-Role-Key darf niemals mit `NEXT_PUBLIC_` beginnen und niemals im
Browsercode verwendet werden.

### 3. Patch kopieren und deployen

```powershell
npm run build
git add -A
git commit -m "Funktion: Spieler-Einladungen per WhatsApp"
git push origin main
```

## Aufruf

```text
Admin → Verein → Spielerportal → Spieler-Einladungen
```

oder direkt:

```text
/admin/spielerportal/einladungen
```
