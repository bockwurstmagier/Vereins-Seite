# Mitarbeit am Vereinsmanager

## Branches

- `main`: veröffentlichte, stabile Version
- `develop`: gemeinsamer Entwicklungsstand
- `feature/<name>`: neue Funktionen
- `fix/<name>`: Fehlerbehebungen

## Commit-Beispiele

```text
Funktion: Sponsorenslider ergänzt
Fehler: Supabase-Import im Dashboard korrigiert
Design: Match-Center mobil optimiert
Datenbank: RLS-Regeln für Social Studio ergänzt
```

## Vor einem Push

```bash
npm install
npx tsc --noEmit
npm run build
```

## Sicherheitsregeln

- Niemals `.env.local` hochladen.
- Keine geheimen Supabase-Schlüssel im Browser verwenden.
- Niemals den `service_role`-Key in `NEXT_PUBLIC_*` Variablen speichern.
- SQL-Änderungen als eigene Datei im Ordner `sql/` dokumentieren.
