# HUJA v22.5.1 – LiveCenter Quality Hotfix

- „2. Halbzeit“ startet jetzt immer exakt bei 45:00, unabhängig davon, wann die erste Hälfte gestoppt wurde.
- Danach läuft die Uhr 46, 47, 48 … weiter; Nachspielzeit >90 bleibt 90+X.
- Video-Limit von 35 MB auf 100 MB erhöht, damit das Smartphone bei Direktaufnahmen weniger Grund hat, kurze/niedrige Qualitätsvarianten zu erzeugen.
- HUJA komprimiert die Kameradatei nicht erneut: Upload bleibt Originaldatei → Supabase.
- Kameraqualität selbst wird vom iPhone/Android-Kamerasystem bestimmt.

Installation:
1. SQL VERSION-22.5.1-HUJA-LIVECENTER-QUALITY-HOTFIX.sql in Supabase ausführen.
2. Patch einspielen.
3. npm run build
