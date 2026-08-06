# Version 20.1.0 – Impressum & Teamordnung

## Impressum

Auf der Startseite befindet sich jetzt unter `Mehr entdecken` die neue Kachel:

```text
Impressum
```

Öffentliche Seite:

```text
/impressum
```

Verwaltung:

```text
Admin → Verein → Impressum
```

Dort können Vorstand oder Administrator eintragen:

- Vereinsname und Anschrift
- 1. und 2. Vorsitzender
- Präsident
- Telefon, E-Mail und Website
- verantwortliche Person für Inhalte
- Registergericht und Registernummer
- Steuernummer
- zusätzliche Angaben

Leere Felder werden auf der öffentlichen Seite nicht angezeigt.

## Neue Teamordnung

Die öffentliche Seite `/team` ist automatisch gegliedert:

1. Mannschaft
- Torhüter
- Abwehr
- Mittelfeld
- Sturm

Danach:

- Trainer
- Co-Trainer
- Betreuer
- Vereinsleitung

Die vorhandenen Werte `Mannschaft`, `Position` und `Sortierung` aus der
Teamverwaltung bestimmen die Darstellung automatisch.

## Installation

### 1. SQL ausführen

```text
sql/VERSION-20.1.0-IMPRESSUM.sql
```

### 2. Patch installieren

```powershell
npm run build
git add -A
git commit -m "Version 20.1: Impressum und Teamordnung"
git push origin main
```
