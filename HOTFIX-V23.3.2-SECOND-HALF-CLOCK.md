# HUJA v23.3.2 – Second Half Clock Hotfix

Behoben:
- Beim Start der zweiten Halbzeit beginnt die Spieluhr jetzt bei 45:00 statt sofort bei 46'.
- Live-Steuerung und Match-Center-Aktion wurden angeglichen.
- Das Test-Labor startet die zweite Halbzeit ebenfalls bei 45.
- `lib/live-clock.ts` nutzte bereits korrekt 45 als Basis und musste nicht geändert werden.

Keine SQL erforderlich.
