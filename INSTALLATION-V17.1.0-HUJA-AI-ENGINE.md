# Version 17.1.0 – HUJA AI Engine

## Komplett ohne externe API

Die HUJA AI Engine arbeitet ausschließlich mit euren eigenen Daten:

- Ergebnis
- Heim- oder Auswärtsspiel
- Wettbewerb
- Torschützen
- Vorlagen
- Karten
- Wechsel
- Spieler des Spiels
- Sieg, Unentschieden oder Niederlage
- Kantersieg, knappe Niederlage oder Zu-Null-Spiel

Es wird kein OpenAI-Key und keine andere externe KI benötigt.

## Automatisch erzeugte Inhalte

- Instagram-Beitrag
- Facebook-Beitrag
- WhatsApp-Kurztext
- Homepage-Titel
- Homepage-Teaser
- ausführlicher Spielbericht
- Pressemitteilung
- Reel-Skript
- Instagram-Story-Ablauf
- Grafik-Headlines
- Hashtag-Paket

## Vereinsstil

Fest integriert:

- HUJA – die Middelicher sind da!
- rot-schwarze Vereinsidentität
- emotionaler Amateurfußball-Stil
- unterschiedliche Texte für Sieg, Remis und Niederlage
- optional professioneller, kämpferischer oder lockerer Ton

## Installation

### 1. SQL ausführen

Nur nötig, wenn Version 17.0 noch nicht installiert wurde:

```text
sql/VERSION-17.1.0-HUJA-AI-ENGINE.sql
```

Wenn die Tabelle `media_center_packages` bereits existiert, ist kein neues SQL
notwendig.

### 2. Patch kopieren und deployen

```powershell
npm run build
git add -A
git commit -m "Funktion: HUJA AI Engine ohne API"
git push origin main
```

## Aufruf

```text
Admin → Medien → HUJA AI Engine
```

Direkter Pfad:

```text
/admin/mediencenter
```
