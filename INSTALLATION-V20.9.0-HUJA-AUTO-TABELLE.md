# HUJA v20.9.0 – Auto Tabelle

## Ziel
Die Tabelle der 1. Mannschaft kann über das offizielle FUSSBALL.DE-Widget automatisch aktualisiert werden.

- Wettbewerb: Kreisliga B 2 Herren
- Saison: 2026/27
- Staffel-ID: `031BHFIC0G000004VS5489BUVUR5FS5A-G`
- Team-ID: `011MIEU2B0000000VTVG0001VTR8C1K7`

## Noch einmalig erforderlich
Das aktuelle FUSSBALL.DE-System benötigt eine 36-stellige `data-id`, die in der Widget-Verwaltung für die Vereinsdomain erzeugt wird.

1. Auf `next.fussball.de` anmelden.
2. Widgets öffnen.
3. Tabellen-/Wettbewerbswidget für Kreisliga B 2, Saison 2026/27 auswählen.
4. Die produktive HUJA-Domain als Website hinterlegen.
5. `Code anzeigen` öffnen.
6. Aus `<div class="fussballde_widget" data-id="..." data-type="table">` die `data-id` kopieren.
7. In Vercel/Hosting eine Environment Variable anlegen:
   - Name: `FUSSBALL_TABLE_WIDGET_ID`
   - Wert: die 36-stellige `data-id`
8. Neu deployen.

## Fallback
Wenn `FUSSBALL_TABLE_WIDGET_ID` fehlt oder leer ist, verwendet HUJA automatisch die bisherige Supabase-Tabelle. Dadurch bleibt die App funktionsfähig.

## Datenschutz
Das offizielle Widget wird erst nach Zustimmung des Besuchers geladen. Diese Zustimmung merkt sich HUJA lokal im Browser, damit nicht bei jedem Öffnen erneut geklickt werden muss.

## Datenbank
Keine Supabase-SQL-Datei erforderlich.
