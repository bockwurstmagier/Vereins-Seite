# HUJA v20.5.0 – Stadium Experience

## Ziel
Die öffentliche Startseite erhält eine deutlich dichtere, mobile Stadion-Atmosphäre im HUJA-Look, ohne bestehende Funktionslogik zu verändern.

## Änderungen
- Neuer Hero-Aufbau mit echtem Vereinswappen aus `public/branding/middelich-resse-original.png`.
- HUJA™-Branding und „Die Middelicher sind da.“ stärker in Szene gesetzt.
- Mehrschichtiger, langsam animierter virtueller Rauch per CSS.
- Zusätzliche Glut-/Funkenebenen und rote Lichtfelder.
- Virtuelle Flutlichtbänke mit dezent pulsierenden Lichtpunkten.
- Stadionartige Hintergrundstruktur und stärkere Vignette beim Scrollen.
- Vereinswappen als mehrere dezente Wasserzeichen über der Startseite.
- Öffentliche Startseiten-Karten mit roten Konturen, Glow und stärkerer Tiefenwirkung.
- `prefers-reduced-motion` wird respektiert; Animationen werden für Nutzer mit reduzierter Bewegung deaktiviert.

## Nicht verändert
- Login / Authentifizierung
- Rollen und Berechtigungen
- Adminbereich
- Supabase-Datenlogik
- LiveCenter-/MatchCenter-Logik
- Push-Automationen
- News-/Termin-/Galerie-Funktionen

## Datenbank
Keine SQL-Datei erforderlich. v20.5.0 enthält keine Datenbankänderung.

## Installation
Auf Basis von v20.4.1 den Patch entpacken bzw. die geänderten Dateien übernehmen.

Danach im Projektordner:

```bash
npm run build
git add -A
git commit -m "HUJA v20.5.0 - Stadium Experience"
git push origin main
```

Bei einem Build-Fehler nicht pushen, sondern zuerst die Fehlermeldung prüfen.
