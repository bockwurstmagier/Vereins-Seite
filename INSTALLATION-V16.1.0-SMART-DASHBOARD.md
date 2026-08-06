# Version 16.1.0 – Smart Dashboard

## Neu

### Wetter am Vereinsgelände

Das Dashboard zeigt automatisch für Gelsenkirchen:

- aktuelle Temperatur
- gefühlte Temperatur
- Wetterlage
- Luftfeuchtigkeit
- Windgeschwindigkeit
- Regenwahrscheinlichkeit
- Wetterprognose für den nächsten Spieltag, sofern dieser innerhalb der
  verfügbaren Vorhersage liegt

Die Wetterdaten werden serverseitig über Open-Meteo geladen und 15 Minuten
zwischengespeichert. Es ist kein API-Key nötig.

### Smart Countdown

Der Countdown erkennt automatisch den zeitlich nächsten Eintrag aus:

- nächstem Spiel
- nächstem Vereinstermin
- nächstem Training, sofern dieses als Termin gepflegt wird

Er zeigt Tage, Stunden, Minuten und Sekunden und verlinkt direkt zum passenden
Bereich.

### Persönliche Begrüßung

Je nach Tageszeit erscheint automatisch:

- Guten Morgen
- Hallo
- Guten Abend

### Dashboard-Anpassung erweitert

Die beiden neuen Widgets können wie alle anderen Bereiche:

- verschoben
- ausgeblendet
- wieder eingeblendet
- auf den Rollenstandard zurückgesetzt werden

## Installation

Für diese Version ist kein SQL und kein neuer Vercel-Key erforderlich.

```powershell
npm run build
git add -A
git commit -m "Funktion: Smart Dashboard"
git push origin main
```

Nach dem Deployment die installierte App vollständig schließen und neu öffnen.
