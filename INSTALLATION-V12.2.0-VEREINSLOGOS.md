# Version 12.2.0 – Vereinsdatenbank und Vereinslogos

## Neu

Nach einem DFBnet-Import werden alle erkannten Mannschaften automatisch in
der zentralen Vereinsdatenbank angelegt.

Unter:

```text
Admin → Verein → Vereine & Logos
```

kannst du für jeden Verein einmalig hinterlegen:

- Logo
- Kurzname
- Website
- Haupt- und Zweitfarbe
- Namens-Aliase

Die Logos erscheinen automatisch in:

- Tabelle
- Spielplan
- nächstem Spiel
- Startseiten-Match-Center

## Installation

### 1. SQL ausführen

```text
sql/VERSION-12.2.0-VEREINSLOGOS.sql
```

### 2. Patch kopieren

Alle Dateien in dein aktuelles Projekt kopieren und vorhandene ersetzen.

### 3. Veröffentlichen

```powershell
npm run build
git add -A
git commit -m "Funktion: Zentrale Vereinslogos"
git push origin main
```

### 4. Vereine erzeugen

Nach dem Deployment die aktuelle DFBnet-Datei einmal erneut importieren.
Es entstehen keine doppelten Spiele. Dabei werden alle Vereine automatisch
in der Tabelle `clubs` angelegt.

Danach unter `Admin → Verein → Vereine & Logos` die Logos hochladen.

## Empfohlene Dateien

- PNG oder WebP mit transparentem Hintergrund
- möglichst quadratisch
- mindestens 500 × 500 Pixel
- maximal 5 MB
