# HUJA v22.5.0 – Player Sync & Birthday Automation

## Neu
- Admin → Mannschaft → FUSSBALL.DE Player Sync.
- HUJA nutzt nicht die derzeit unveröffentlichte FUSSBALL.DE-Kaderliste, sondern durchsucht bis zu 10 öffentliche Spielseiten und sammelt dort verlinkte Spielerprofile.
- Klarnamen werden aus den öffentlichen Spielerprofilen mit den HUJA-Spielern abgeglichen.
- Nur eindeutige Namens-Treffer werden automatisch importiert.
- Bereits vorhandene HUJA-Geburtstage werden niemals überschrieben.
- Nicht öffentliche Geburtsdaten bleiben leer.
- Profil-URL/User-ID und Zeitpunkt des erfolgreichen Imports werden gespeichert.
- Auf der Startseite erscheint an einem Geburtstag automatisch eine HUJA-Geburtstagskarte.

## Installation
1. `sql/VERSION-22.5.0-HUJA-PLAYER-SYNC-BIRTHDAYS.sql` einmal in Supabase ausführen.
2. Patch einspielen.
3. `npm run build`.
4. Admin → Mannschaft → FUSSBALL.DE Player Sync öffnen und den ersten Testlauf durchführen.

## Hinweis
FUSSBALL.DE kann Layout/HTML oder Freigaben jederzeit ändern. Deshalb importiert HUJA nur eindeutige Treffer und überschreibt keine bestehenden Geburtstage. Spieler, die auf keiner der geprüften öffentlichen Spielseiten verlinkt sind, können beim automatischen Lauf fehlen.
