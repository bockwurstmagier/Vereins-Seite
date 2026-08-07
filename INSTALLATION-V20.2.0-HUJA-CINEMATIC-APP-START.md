# Version 20.2.0 – HUJA Cinematic App Start

## Neue Startanimation

Beim ersten Öffnen pro App-/Browser-Sitzung erscheint ein kurzer cinematic
Splash Screen:

- dunkler Hintergrund
- roter Licht-Glow
- HUJA™ Logo mit Zoom-Effekt
- dezente Partikel
- Club Management System
- "Die Middelicher sind da."
- Progress-Bar
- weicher Fade/Zoom in die eigentliche App

## Wichtig

Die Login- und Authentifizierungslogik wurde NICHT verändert.

Es gibt keine neue automatische Weiterleitung ins Dashboard und keine Änderung
an bestehenden Sessions oder Rollen.

## Verhalten

Die Animation erscheint nur einmal pro Sitzung. Beim Navigieren innerhalb der
App wird sie nicht erneut abgespielt.

## Installation

Für Version 20.2 ist kein neues SQL erforderlich.

```powershell
npm run build
git add -A
git commit -m "Version 20.2: HUJA Cinematic App Start"
git push origin main
```
