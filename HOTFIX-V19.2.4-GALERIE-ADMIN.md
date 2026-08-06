# Hotfix 19.2.4 – Galerie-Alben im Adminbereich

## Behobenes Problem

Auf der Startseite wurden die vorhandenen Alben korrekt angezeigt, während im
Adminbereich unter `Alle Alben` fälschlich `0 Alben` stand.

Die Ursache war eine mehrdeutige verschachtelte Supabase-Abfrage. Zwischen
`gallery_albums` und `gallery_media` existieren zwei Beziehungen:

- Album → enthaltene Medien
- Album → ausgewähltes Titelbild

Dadurch konnte Supabase die eingebettete Relation nicht eindeutig bestimmen und
lieferte keine Albumdaten zurück.

## Lösung

- Alben und Medien werden getrennt geladen.
- Die Medien werden anschließend anhand der `album_id` zugeordnet.
- Titelbild und Medienanzahl werden zuverlässig aufgelöst.
- Datenbankfehler werden im Adminbereich sichtbar angezeigt.

## Installation

Für diesen Hotfix ist kein neues SQL erforderlich.

```powershell
npm run build
git add -A
git commit -m "Hotfix: Galerie Alben im Admin anzeigen"
git push origin main
```
