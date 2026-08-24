# HUJA v22.6.1 – Fast Start

## Änderung
- Das alte Cinematic-AppSplash mit rund 1,95 Sekunden Laufzeit wurde aus dem Root-Layout entfernt.
- Beim PWA-Start bleibt nur ein sehr kurzer Logo-Fade von ca. 420 ms.
- Keine Skalierungs-/Spring-Animation, kein Fortschrittsbalken, kein künstliches Warten.
- Die eigentliche Startseite wird weiterhin sofort gerendert und liegt bereits hinter dem kurzen Fade.
- Der Fade blockiert keine Eingaben (`pointer-events-none`).
- Update-System, PWA-Registrierung, Analytics, Security Hardening und App-Navigation bleiben unverändert.

## Installation
Patch einspielen und `npm run build` ausführen. Keine Supabase-SQL erforderlich.
