# Vereinsmanager v5.0 – Social Media Studio

## Funktionen

- Matchday-Grafik aus vorhandenen Spielen
- Ergebnisgrafik aus beendeten Spielen
- News-Grafik aus vorhandenen News
- Formate: Instagram Feed (1080×1350), Story (1080×1920), Quadrat (1080×1080)
- Live-Vorschau
- frei wählbare Akzentfarbe
- bearbeitbare Zusatzzeile
- PNG-Export direkt im Browser
- automatisch erzeugter Begleittext zum Kopieren
- Zugriff für Administrator, Vorstand und Social Media

## Installation

1. Projekt entpacken.
2. Bestehende `.env.local` übernehmen.
3. Optional im Supabase SQL Editor `sql/SOCIAL-STUDIO-V5.0.sql` ausführen. Die Tabellen sind für die spätere Vorlagen- und Projektverwaltung vorbereitet; der PNG-Generator funktioniert auch ohne dieses SQL.
4. `npm install`
5. `npm run build`
6. `npm run dev`
7. `/admin/social` öffnen.

## Hinweise

Der Export wird vollständig im Browser aus einer SVG-Vorschau erzeugt. Es wird keine zusätzliche Grafikbibliothek benötigt. Der erste Ausbaustand verwendet das Vereinslogo, Vereinsfarben und die vorhandenen Datenbankdaten. Ein Drag-and-Drop-Template-Designer folgt als nächste Ausbaustufe.
