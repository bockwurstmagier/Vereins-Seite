# Hotfix 19.2.3 – Teamfoto Direktupload

## Behobenes Problem

Spielerfotos wurden bisher über eine Next.js Server Action hochgeladen. Große
Handyfotos konnten dadurch denselben allgemeinen Serverfehler auslösen wie
zuvor die Galerie.

## Neuer Uploadweg

```text
Handy/PC → direkt zu Supabase Storage
```

## Neu

- Spielerfoto wird direkt beim Auswählen hochgeladen
- sichtbare Vorschau
- Upload-Fortschritt
- verständliche Fehlermeldungen
- neues Foto beim Bearbeiten ersetzen oder entfernen
- Formular kann während eines laufenden Uploads nicht versehentlich gesendet werden

## Installation

### 1. SQL ausführen

```text
sql/VERSION-19.2.3-TEAMFOTO-DIREKTUPLOAD.sql
```

### 2. Patch kopieren und deployen

```powershell
npm run build
git add -A
git commit -m "Hotfix: direkter Teamfoto Upload"
git push origin main
```
