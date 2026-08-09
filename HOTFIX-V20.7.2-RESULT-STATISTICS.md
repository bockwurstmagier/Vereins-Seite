# HUJA v20.7.2 – Result Statistics Hotfix

## Fehlerbild
Ein Heimsieg konnte in der Vereinsstatistik als Niederlage erscheinen. Beispiel: Ein 2:1-Heimsieg wurde intern als 1:2 aus Vereinssicht gewertet.

## Ursache
Die Vereinsstatistik normalisierte Teamnamen (Bindestriche wurden zu Leerzeichen), verglich danach aber mit dem nicht normalisierten Marker `middelich-resse`. Dadurch wurde Middelich-Resse bei Heimspielen nicht zuverlässig als Heimteam erkannt. Dieselbe inkonsistente Erkennung war auch in weiteren Bereichen vorhanden.

## Korrektur
- Neue gemeinsame Vereinserkennung in `lib/club-name.ts`.
- Erkennt Schreibweisen wie `Middelich-Resse`, `Middelich Resse` und `SpVgg Middelich-Resse 71/81`.
- Vereinsstatistik Pro verwendet die gemeinsame Erkennung.
- Admin-Dashboard-Saisonbilanz verwendet die gemeinsame Erkennung.
- Trainer-Cockpit verwendet die gemeinsame Erkennung.
- Matchday Mode verwendet die gemeinsame Erkennung.
- Vereinszentrale/Command Center verwendet die gemeinsame Erkennung.
- Vereinsassistent verwendet die gemeinsame Erkennung.
- Startseiten-Spielkarten verwenden dieselbe Erkennung.

## Datenbank
Keine SQL-Datei erforderlich. Bestehende Match-Ergebnisse werden nicht verändert. Die Statistik wird aus den vorhandenen Ergebnissen neu und korrekt berechnet.

## Beispiel
`SpVgg Middelich-Resse 2:1 Gegner` → Heimteam wird als Verein erkannt → 2 Tore für uns, 1 Gegentor → Sieg.
