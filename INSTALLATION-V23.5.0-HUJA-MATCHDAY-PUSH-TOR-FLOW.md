# HUJA v23.5.0 – Matchday Countdown Push + TOR Flow

## 1. LiveCenter TOR
Der große TOR-Flow gehört jetzt immer Middelich-Resse.
HUJA erkennt automatisch, ob Middelich-Resse Heim- oder Gastmannschaft ist und erhöht die richtige Seite des Spielstands.

- TOR = immer Middelich-Resse
- Gegentor = eigener, klar beschrifteter Gegner-Button
- Im Torfenster wird HEIM oder AUSWÄRTS angezeigt
- Torschütze und Vorlage bleiben der schnelle Hauptablauf

## 2. Automatische Matchday-Pushs
- 24 Stunden: BALD GEHT ES LOS!
- 3 Stunden: MATCHDAY!
- 30 Minuten: GLEICH GEHT'S LOS!

Gegner, Heim/Auswärts und Anstoßzeit werden aus dem geplanten Spiel gelesen.
Die bestehende Push-Deduplizierung verhindert doppelte Countdown-Pushs.

## 3. Cron einrichten
Damit die Pushs auch ohne geöffneten Adminbereich automatisch kommen, muss der Server die Route regelmäßig aufrufen.

Neue Route:
`/api/cron/matchday-countdown`

Lege in der Produktionsumgebung eine starke Umgebungsvariable `CRON_SECRET` an.
Rufe die Route ungefähr alle 10 Minuten auf und übergib entweder:
- Header: `Authorization: Bearer <CRON_SECRET>`
oder
- Query-Parameter: `?secret=<CRON_SECRET>`

Empfehlung: alle 10 Minuten. Die Route hat Zeitfenster und Deduplizierung, daher wird jede Stufe pro Spiel höchstens einmal versendet.

## 4. Test-Labor
Neue Vorschauen:
- 24h Push
- 3h Push
- 30min Push

Die Vorschauen senden keine echten Push-Nachrichten.

Keine neue SQL-Migration erforderlich.
