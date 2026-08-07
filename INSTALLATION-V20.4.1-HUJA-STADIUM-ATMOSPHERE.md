# HUJA v20.4.1 – Stadium Atmosphere

## Ausgangspunkt
Dieses Update baut ausschließlich auf v20.4.0 – HUJA Club Atmosphere auf. Die vorherige vollständige v20.4.0-ZIP bleibt die Rückfallebene, falls das neue Design nicht gefallen sollte.

## Neu auf der öffentlichen Startseite
- virtueller, langsam animierter dunkelroter Rauch über mehrere Ebenen
- dezente Flutlicht-/Lichtkegel von links und rechts
- kleine animierte Glut-/Partikelpunkte für mehr Stadionatmosphäre
- das originale Vereinswappen `SpVgg Middelich-Resse 71/81` als atmosphärisches Wasserzeichen
- sanft pulsierender roter Glow am Vereinswappen
- bestehende Burgunder-Verläufe, Raster und Vignette bleiben erhalten
- speziell für Mobilgeräte reduzierte Effektgrößen
- `prefers-reduced-motion` wird berücksichtigt; bei deaktivierten Animationen bleiben die Effekte statisch

## Performance
Der Rauch wird ausschließlich mit CSS-Verläufen, Blur und langsamen Transform-/Opacity-Animationen erzeugt. Es läuft kein Canvas, kein Video und kein JavaScript-Animationsloop. Dadurch bleibt die Lösung für die PWA deutlich leichter als ein permanentes Rauchvideo.

## Geänderte Dateien
- `components/home/HomeAtmosphere.tsx`
- `app/globals.css`
- `public/branding/middelich-resse-original.png` (neu, Originalwappen des Vereins)
- `VERSION`
- `package.json`
- `package-lock.json`
- `lib/branding.ts`

## Datenbank
Keine Supabase-SQL-Änderung erforderlich.

## Sicherheit / bestehende Funktionen
Login, Authentifizierung, Rollen, Adminbereich, Push, LiveCenter, News, Termine und Supabase-Logik wurden nicht verändert.

## Installation
Nach dem Entpacken bzw. Einspielen des Patches im VS-Code-Terminal:

```bash
npm run build
git add -A
git commit -m "HUJA v20.4.1 - Stadium Atmosphere"
git push origin main
```

Nur pushen, wenn der Build erfolgreich durchläuft.
