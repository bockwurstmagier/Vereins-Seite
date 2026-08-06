# Hotfix 19.2.2 – Galerie auf der Startseite

## Behobenes Problem

Nach einem erfolgreichen direkten Upload wurden neue Bilder teilweise nicht
auf der Startseite angezeigt.

## Änderungen

- Die Startseite lädt öffentliche Alben und öffentliche Medien jetzt getrennt.
- Das Titelbild wird zuverlässig aufgelöst.
- Falls kein Titelbild gesetzt ist, wird automatisch das erste öffentliche Bild
  des Albums verwendet.
- Leere oder rein verborgene Alben werden auf der Startseite nicht angezeigt.
- Die Galerie ist ausdrücklich in die Hauptseite eingebunden.
- Startseite und öffentliche Galerie werden nach Änderungen neu validiert.
- Die Galerie-Abfragen werden nicht mehr statisch zwischengespeichert.

## Installation

Es ist kein neues SQL nötig.

```powershell
npm run build
git add -A
git commit -m "Hotfix: Galerie auf Startseite anzeigen"
git push origin main
```

Nach dem Deployment:

1. Browser/App vollständig schließen.
2. Seite neu öffnen.
3. Album muss auf `Öffentlich` stehen.
4. Mindestens ein Bild muss ebenfalls auf `Öffentlich` stehen.
