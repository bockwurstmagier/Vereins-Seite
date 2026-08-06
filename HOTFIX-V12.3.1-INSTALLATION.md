# Hotfix v12.3.1 – Letztes Ergebnis mit Logos

Der Buildfehler entstand, weil die Team-Komponente bereits `logoUrl` und
`ours` verwendet hat, diese Werte aber noch nicht in den Props bzw. in der
Funktion definiert waren.

## Installation

Diese Datei ersetzen:

```text
components/home/DynamicLastMatchCard.tsx
```

Danach:

```powershell
npm run build
git add -A
git commit -m "Hotfix: Logos im letzten Ergebnis"
git push origin main
```
