# Vereinsmanager v6.1 – Spielerstatistiken

## 1. Datenbank aktualisieren

In Supabase den SQL Editor öffnen und vollständig ausführen:

```text
sql/VERSION-6.1-SPIELERSTATISTIKEN.sql
```

Dadurch erhalten Spiele die Felder:

- `season`
- `match_duration`

Bestehende Spiele werden automatisch der Saison `2026/27` zugeordnet.

## 2. Projekt starten

```bash
npm install
npm run build
npm run dev
```

## 3. Neue Bereiche

```text
Öffentlich: /statistiken
Admin:      /admin/statistiken
```

## 4. Richtige Erfassung im Match-Center

### Tor

- **Spieler:** Torschütze
- **Vorlage / ausgewechselt für:** Vorlagengeber

### Auswechslung

- **Spieler:** eingewechselter Spieler
- **Vorlage / ausgewechselt für:** ausgewechselter Spieler

Dadurch werden Tore, Vorlagen, Einsätze und Spielminuten automatisch berechnet.

## 5. Saison pflegen

Beim Anlegen oder Bearbeiten eines Spiels ist jetzt das Feld **Saison** vorhanden.
Beispiel:

```text
2026/27
```
