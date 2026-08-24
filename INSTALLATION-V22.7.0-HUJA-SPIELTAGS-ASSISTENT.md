# HUJA v22.7.0 – Spieltags-Assistent

## Neu
- Zentrale Admin-Seite `Admin → Spieltags-Assistent`.
- Automatische Phasenerkennung: Vor dem Spiel, 1. Halbzeit, Pause, Halbzeit, 2. Halbzeit, Abpfiff/Abschluss, abgeschlossen.
- Direkte Aktionen benutzen die bestehenden LiveCenter-Actions: Anpfiff, Halbzeit, 2. Halbzeit und Abpfiff. Kein zweiter Timer.
- Automatische Halbzeit-/Spielverlaufszusammenfassung aus vorhandenen LiveCenter-Ereignissen.
- Status-Check für Kader, LiveCenter, Videos/Top-Momente, Abschluss-Automatik und Spieler-des-Spiels-Voting.
- Live-Kennzahlen: Tore, Karten, Video-Momente und Top-Momente.
- Nach Abpfiff startet „Alles erstellen & Spieltag abschließen“ exakt die vorhandene Ein-Klick-Spieltag-Automatik.
- Nach Abschluss direkte Wege zu Abschlussausgabe, Voting/Match-Center, Fan-Liveansicht und Grafikstudio.

## Unverändert
- Live-Uhr und Halbzeitlogik aus v22.5.1.
- MatchTV/Direct Camera Capture.
- Fanpass/Voting.
- Push und Security Hardening.
- Keine neue Supabase-Tabelle, keine SQL notwendig.

## Installation
Patch einspielen, anschließend `npm audit` und `npm run build`.
