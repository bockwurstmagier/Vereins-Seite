# Version 12.1.0 – DFBnet-Originalformat

Unterstützt den bereitgestellten offiziellen UTF-16-LE-Tabulator-Export.

- Doppelte Spalten wie `Uhrzeit` werden korrekt getrennt.
- `Spieldatum` wird statt des Exportdatums verwendet.
- `verlegtSpieldatum` und `verlegtUhrzeit` haben Vorrang.
- `Spielkennung` verhindert Duplikate.

Kein neues SQL erforderlich, wenn Version 12.0.0 bereits installiert ist.

```powershell
npm run build
git add -A
git commit -m "Fehler: DFBnet UTF-16 Originalformat unterstützt"
git push origin main
```
