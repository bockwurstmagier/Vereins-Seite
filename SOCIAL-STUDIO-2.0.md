# Social Media Studio 2.0

## Neu

- Matchday-Grafik
- Ergebnisgrafik
- News-Teaser
- Spielerkarte direkt aus Supabase
- Sponsorenvorstellung direkt aus Supabase
- Instagram Feed, Story und Quadrat
- eigene Akzent- und Hintergrundfarbe
- eigenes Hintergrundbild vom PC
- einstellbare Hintergrundstärke
- Live-Vorschau
- PNG-Export
- automatisch erzeugter Begleittext mit Kopierfunktion

## Start

```bash
npm install
npm run dev
```

Danach öffnen:

```text
http://localhost:3000/admin/social
```

Es ist kein zusätzliches SQL notwendig. Das Studio verwendet die vorhandenen Tabellen `matches`, `news`, `players` und `sponsors`.

## Hinweise zum PNG-Export

Bilder aus Supabase Storage müssen öffentlich erreichbar sein. Die bereits verwendeten öffentlichen Buckets für News, Spieler und Sponsoren erfüllen diese Voraussetzung.
