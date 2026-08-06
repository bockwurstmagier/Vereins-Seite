# Version 19.2.0 – HUJA Galerie Pro

## Neue Galerieverwaltung

### Alben

- beliebig viele Alben erstellen
- Titel, Beschreibung, Kategorie und Saison
- optional einem Spiel zuordnen
- öffentlich oder verborgen
- komplettes Album löschen
- eigenes Titelbild auswählen

### Medien

- mehrere Bilder und Videos gleichzeitig hochladen
- Bilder bis 15 MB
- Videos bis 25 MB
- YouTube- und andere externe Video-Links einbinden
- Titel und Bildunterschrift
- Fotograf oder Urheber hinterlegen
- Sichtbarkeit pro Medium
- Reihenfolge ändern
- einzelne Medien löschen

### Öffentliche Galerie

```text
/galerie
```

- moderne Albumübersicht
- Bilder und Videos
- Vollbild-Lightbox
- Wischen beziehungsweise Pfeiltasten
- Tastatursteuerung
- Fotografenangabe
- mobile Darstellung

### Startseite

Die bisherigen Platzhalterbilder wurden entfernt. Auf der Startseite erscheinen
jetzt automatisch die neuesten öffentlichen Alben.

## Installation

### 1. SQL ausführen

```text
sql/VERSION-19.2.0-HUJA-GALERIE-PRO.sql
```

Das SQL erstellt:

- `gallery_albums`
- `gallery_media`
- den öffentlichen Storage-Bucket `gallery-media`
- die benötigten Zugriffsregeln

### 2. Patch kopieren und deployen

```powershell
npm run build
git add -A
git commit -m "Funktion: HUJA Galerie Pro"
git push origin main
```

## Aufruf

Admin:

```text
Admin → Inhalte → Galerie
```

Öffentlich:

```text
/galerie
```
