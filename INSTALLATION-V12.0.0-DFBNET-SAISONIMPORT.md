# Version 12.0.0 – DFBnet-Saisonimport

## Was automatisch wird

Nach einem einmaligen CSV-Import greifen alle vorhandenen Bereiche auf
dieselben Supabase-Spiele zu:

- nächstes Spiel
- Countdown
- letztes Ergebnis
- öffentlicher Spielplan
- Match-Center und LiveCenter
- Ein-Klick-Spieltag
- Spieler- und Saisonstatistiken
- Social Studio

Wird später eine aktualisierte DFBnet-Datei importiert, werden vorhandene
Spiele aktualisiert und nicht doppelt angelegt.

## Vollständige Tabelle

Für die komplette Ligatabelle benötigst du einen Staffelspielplan mit den
Spielen und Ergebnissen aller Mannschaften. Im Import muss dann die Option
`Nur Spiele unseres Vereins importieren` ausgeschaltet sein.

## Installation

### 1. SQL ausführen

```text
sql/VERSION-12.0.0-DFBNET-SAISONIMPORT.sql
```

### 2. Patch kopieren

Alle Patch-Dateien in das aktuelle Projekt kopieren.

### 3. Build und Deployment

```powershell
npm run build
git add -A
git commit -m "Funktion: DFBnet Saisonimport und Automatik"
git push origin main
```

## Verwendung

```text
Admin → Sport → Saisonimport
```

1. Saison und Vereinsnamen prüfen.
2. DFBnet-CSV auswählen.
3. Vorschau kontrollieren.
4. Import starten.

## Unterstützte CSV-Strukturen

Der Import erkennt verschiedene deutsche Spaltenbezeichnungen automatisch,
unter anderem:

- Spielkennung / Spielnummer
- Wettbewerb / Staffel / Liga
- Spieltag / Runde
- Datum / Spieldatum / Termin
- Uhrzeit / Anstoßzeit
- Heimverein / Heimmannschaft
- Gastverein / Gastmannschaft
- Spielstätte / Spielort / Sportplatz
- Ergebnis / Endergebnis

Sollte die echte DFBnet-Datei andere Spaltennamen verwenden, kann der Parser
später anhand einer Beispieldatei gezielt erweitert werden.
