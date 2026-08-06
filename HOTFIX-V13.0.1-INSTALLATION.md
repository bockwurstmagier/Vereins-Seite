# Hotfix v13.0.1 – Berechtigungsdatei repariert

Der Buildfehler entstand durch zwei fehlende Kommas in:

```text
lib/auth/permissions.ts
```

Betroffen waren die Rollen:

- trainer
- betreuer

## Installation

Die Datei aus diesem Patch in dein Projekt kopieren und ersetzen:

```text
lib/auth/permissions.ts
```

Danach:

```powershell
npm run build
git add -A
git commit -m "Hotfix: Berechtigungen repariert"
git push origin main
```
