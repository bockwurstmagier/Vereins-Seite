# Hotfix 19.2.1 – Galerie Upload Pro

## Behobenes Problem

Der bisherige Upload lief über eine Next.js Server Action:

```text
Browser → Hostinger/Vercel → Supabase Storage
```

Große Handyfotos oder mehrere Dateien konnten dadurch einen allgemeinen
Serverfehler auslösen.

## Neuer Uploadweg

```text
Handy/PC → direkt zu Supabase Storage
```

Nur die kleinen Dateiinformationen werden danach serverseitig in der Datenbank
gespeichert.

## Neu

- Drag & Drop
- mehrere Dateien gleichzeitig
- sichtbarer Upload-Fortschritt
- verständliche Fehlermeldungen
- direkte Uploads unabhängig von Hostinger/Vercel-Request-Limits
- automatische Titelbildauswahl beim ersten Bild
- automatische Aktualisierung der Albumansicht

## Installation

Es ist kein neues SQL nötig, wenn Version 19.2.0 bereits vollständig
installiert wurde.

```powershell
npm run build
git add -A
git commit -m "Hotfix: direkter Galerie Upload"
git push origin main
```

Nach dem Deployment die App vollständig neu laden.
