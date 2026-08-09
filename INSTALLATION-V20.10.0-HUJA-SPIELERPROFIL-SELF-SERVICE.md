# HUJA v20.10.0 – Spielerprofil Self-Service

## Neu
- Spieler können im Spielerportal ihr eigenes öffentliches Profil bearbeiten.
- Bearbeitbar: Position, Rückennummer, starker Fuß, Größe, Geburtsdatum, Nationalität, Instagram, Kurzprofil, Lieblingsverein und Lieblingsspieler.
- Nicht bearbeitbar: Name, Mannschaft, Rolle, Aktiv-Status, Sortierung und Spielerfoto.
- Änderungen erscheinen direkt im öffentlichen Bereich Team.
- Die Server Action prüft zuerst den Spieler-Login und aktualisiert ausschließlich das mit dem Benutzerkonto verknüpfte `players`-Profil.
- Keine neue Supabase-Tabelle und keine SQL-Datei erforderlich.

## Deployment
1. Patch über v20.9.0 kopieren.
2. `npm run build` ausführen.
3. Danach committen und deployen.
