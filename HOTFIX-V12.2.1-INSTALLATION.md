# Hotfix v12.2.1 – Logos beim nächsten Spiel

Der Vercel-Build ist fehlgeschlagen, weil `NextMatchCard.tsx` bereits auf
`home_logo_url` und `away_logo_url` zugreift, diese Felder aber im Typ
`DatabaseMatch` noch fehlten.

Der Hotfix:

- ergänzt beide Felder im Typ,
- lädt die Vereinslogos aus der Tabelle `clubs`,
- ordnet Logos über Vereinsnamen und Aliase zu,
- behebt den TypeScript-Buildfehler.

## Installation

Die Datei aus diesem Patch in dein Projekt kopieren und ersetzen:

```text
lib/matches.ts
```

Danach:

```powershell
npm run build
git add -A
git commit -m "Hotfix: Logos beim nächsten Spiel"
git push origin main
```
