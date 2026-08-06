# Hotfix 20.1.2 – Termine

## Behobenes Problem

Beim Speichern eines Termins konnte die allgemeine Hostinger-/Next.js-Meldung
erscheinen:

```text
This page couldn't load
A server error occurred
```

Eine häufige Ursache war eine fehlende Startzeit bei einem nicht ganztägigen
Termin. Fehler aus Supabase oder der Formularprüfung wurden außerdem als
allgemeine Serverfehler angezeigt.

## Änderungen

- Startzeit ist bei normalen Terminen verpflichtend.
- Als praktische Vorgabe wird `18:30 Uhr` eingesetzt.
- Bei ganztägigen Terminen wird die Uhrzeit automatisch ignoriert.
- Fehler werden direkt im Terminbereich angezeigt.
- Supabase-Fehler führen nicht mehr zur allgemeinen Fehlerseite.
- Erstellen, Bearbeiten und Löschen geben verständliche Meldungen aus.

## Installation

Für diesen Hotfix ist kein neues SQL nötig.

```powershell
npm run build
git add -A
git commit -m "Hotfix: Termine stabilisieren"
git push origin main
```
