# Hotfix v18.0.1 – Matchday-Mode-Typ

Der Buildfehler entstand, weil TypeScript die Variable `mode` nur als
allgemeinen `string` erkannt hat.

Die Variable besitzt jetzt ausdrücklich diesen Typ:

```ts
"countdown" | "live" | "halftime" | "finished"
```

## Installation

Diese Datei ersetzen:

```text
lib/matchday-mode.ts
```

Danach:

```powershell
npm run build
git add -A
git commit -m "Hotfix: Matchday Mode Typ"
git push origin main
```
