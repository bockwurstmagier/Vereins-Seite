# Hotfix v14.1.1 – Grafikstudio-Berechtigung

Der Buildfehler entstand, weil `grafikstudio` zwar in den Rollenlisten
eingetragen war, aber im Typ `AdminArea` fehlte.

## Installation

Diese Datei ersetzen:

```text
lib/auth/permissions.ts
```

Danach:

```powershell
npm run build
git add -A
git commit -m "Hotfix: Grafikstudio-Berechtigung"
git push origin main
```
