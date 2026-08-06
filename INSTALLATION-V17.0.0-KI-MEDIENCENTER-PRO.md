# Version 17.0.0 – KI-Mediencenter Pro

## Automatisch erzeugte Inhalte

- Instagram-Beitrag
- Facebook-Beitrag
- WhatsApp-Kurztext
- Homepage-Titel, Teaser und Spielbericht
- Pressemitteilung
- Reel-Skript
- Story-Ablauf mit mehreren Slides
- Grafik-Headlines
- Hashtag-Paket

Die Texte basieren ausschließlich auf den echten Daten des ausgewählten
Spiels: Ergebnis, Ereignisse, Torschützen, Vorlagen und Spieler des Spiels.

## Zwei Betriebsarten

### OpenAI-Modus

Wenn `OPENAI_API_KEY` in Vercel hinterlegt ist, werden die Texte über die
OpenAI Responses API erstellt.

Optional:

```text
OPENAI_MEDIA_MODEL=gpt-5-mini
```

### Kostenloser Fallback-Modus

Fehlt der API-Key oder schlägt ein API-Aufruf fehl, erstellt HUJA automatisch
ein vollständiges regelbasiertes Medienpaket. Das Modul bleibt also nutzbar.

## Installation

### 1. SQL ausführen

```text
sql/VERSION-17.0.0-KI-MEDIENCENTER-PRO.sql
```

### 2. Optionalen Vercel-Key prüfen

```text
OPENAI_API_KEY
```

Der Key darf niemals mit `NEXT_PUBLIC_` beginnen.

### 3. Patch kopieren und deployen

```powershell
npm run build
git add -A
git commit -m "Funktion: KI Mediencenter Pro"
git push origin main
```

## Aufruf

```text
Admin → Medien → KI-Mediencenter
```

Direkter Pfad:

```text
/admin/mediencenter
```
