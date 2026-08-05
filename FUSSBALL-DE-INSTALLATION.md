# FUSSBALL.DE-Widget – vollständige Installation

## Bereits eingebaut

Widget-ID:

```text
0e4d6599-b984-4c8e-ba9d-d5e864925837
```

Widget-Typ:

```text
next-match
```

Offizielles Script:

```text
https://www.fussball.de/widgets.js
```

Es ist keine zusätzliche Variable in `.env.local` nötig.

## Enthaltene Bereiche

```text
/components/fussball/FussballWidget.tsx
/components/home/FussballNextMatchSection.tsx
/app/fussball/page.tsx
```

Das Widget wird aus Datenschutzgründen erst nach einem Klick geladen.

## Start

```bash
npm install
npm run dev
```

Testseite:

```text
http://localhost:3000/fussball
```

Auf **„Offizielle Daten laden“** klicken.

## Vercel

Für das Widget muss keine zusätzliche Environment Variable angelegt werden.
Nach dem Hochladen der Version genügt ein neues Deployment.

## Hinweis zur Domain

FUSSBALL.DE kann Widgets auf bestimmte Domains beschränken. Sollte es lokal
nicht erscheinen, teste zusätzlich die Vercel-Preview-URL oder die endgültige
Vereinsdomain.

## Datenschutz

Das Widget lädt Inhalte eines Drittanbieters. Der Klick-Platzhalter verhindert
das automatische Laden vor einer bewussten Nutzeraktion. Ergänze FUSSBALL.DE
gegebenenfalls in deiner Datenschutzerklärung und Consent-Konfiguration.
