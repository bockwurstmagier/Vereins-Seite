# Version 8.4 – Benutzerkonto & PWA-Navigation

## Neu

- Der Menüpunkt **Mehr** öffnet jetzt ein mobiles App-Menü.
- Nicht angemeldete Besucher sehen **Admin anmelden**.
- Angemeldete Benutzer sehen Namen, Rolle, Admin-Dashboard und LiveCenter.
- Neue Seite `/konto` mit Kontoübersicht und Abmelden.
- Login-Seite besitzt einen Rückweg zur öffentlichen App.
- Die Navigation berücksichtigt die Safe Area auf iPhone und Android.

## Installation

Es ist kein neues SQL notwendig.

1. Patch in den aktuellen Projektordner kopieren.
2. Vorhandene Dateien ersetzen.
3. Lokal prüfen:

```bash
npm install
npm run build
npm run dev
```

4. Danach veröffentlichen:

```bash
git add -A
git commit -m "Funktion: Benutzerkonto und PWA Navigation"
git push origin main
```

Vercel startet automatisch ein neues Deployment.

## Test

- App vom Homescreen öffnen.
- Unten **Mehr** antippen.
- Abgemeldet: **Admin anmelden** öffnen.
- Angemeldet: **Admin-Dashboard**, **LiveCenter** und **Abmelden** prüfen.
- `/konto` direkt öffnen.
