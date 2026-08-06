# Hotfix 20.1.1 – News-Titelbild Direktupload

## Behobenes Problem

Beim Erstellen oder Bearbeiten einer News wurde das Titelbild über eine
Next.js Server Action an den Hostinger-Server geschickt. Normale Handyfotos
konnten dadurch die allgemeine Meldung auslösen:

```text
This page couldn't load
A server error occurred
```

## Neuer Uploadweg

```text
Handy/PC → direkt zu Supabase Storage
```

Die News selbst wird anschließend nur noch mit der Bild-URL und dem Dateipfad
gespeichert.

## Neu

- direkter Titelbild-Upload
- Bildvorschau
- Fortschrittsanzeige
- verständliche Uploadfehler
- Titelbild beim Bearbeiten ersetzen oder entfernen
- Schutz vor dem Speichern während eines laufenden Uploads

## Installation

### 1. SQL ausführen

```text
sql/VERSION-20.1.1-NEWS-DIREKTUPLOAD.sql
```

### 2. Patch installieren

```powershell
npm run build
git add -A
git commit -m "Hotfix: direkter News Bild Upload"
git push origin main
```
