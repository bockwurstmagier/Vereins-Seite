# HUJA v20.4.0 – Club Atmosphere

## Inhalt
Die öffentliche Startseite erhält unterhalb des Hero-Bereichs einen durchgängigen HUJA-Hintergrund statt einzelner schwarzer Standardflächen.

### Neu
- mehrstufige Schwarz-/Burgunder-Verläufe über die komplette Startseite
- dezente rote Lichtfelder mit Tiefenwirkung
- feines geometrisches Raster und diagonale Struktur
- sehr zurückhaltende Vereinslogo-Wasserzeichen
- weiche Vignette für bessere Lesbarkeit der Inhalte
- bestehende Karten und Sektionen bleiben unverändert

## Technische Änderungen
- `components/home/HomeAtmosphere.tsx` neu
- `app/page.tsx` auf eine gemeinsame atmosphärische Hintergrundebene umgestellt
- `app/globals.css` um ausschließlich auf `.huja-home-content` begrenzte Styles erweitert
- Version auf 20.4.0 aktualisiert

## Datenbank
Keine Supabase-SQL-Änderung erforderlich.

## Sicherheit / bestehende Funktionen
Login, Authentifizierung, Rollen, Adminbereich, Push, LiveCenter und Datenbanklogik wurden nicht verändert.
