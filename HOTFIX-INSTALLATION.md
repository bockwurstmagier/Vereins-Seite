# Hotfix v11.2.1 – Fehlendes KI-Modul

Der Vercel-Build schlug fehl, weil die Datei

```text
lib/ai/match-day-ai.ts
```

im zuvor gelieferten Patch fehlte.

## Installation

Die Datei aus diesem Patch in den Projektordner kopieren. Danach:

```powershell
npm run build
git add -A
git commit -m "Hotfix: Fehlendes KI-Modul ergänzt"
git push origin main
```

Auch im kostenlosen Hybrid-Modus wird das Modul weiterhin für den optionalen
Button „Mit KI veredeln“ benötigt. Ohne API-Schlüssel fällt es automatisch
auf den kostenlosen Vorlagenmodus zurück.
