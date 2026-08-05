# Installation Version 9.0.1

Es ist kein neues Supabase-SQL notwendig.

1. Dateien in den aktuellen Projektstand übernehmen.
2. Lokal prüfen:

```powershell
npm run build
```

3. Zu GitHub hochladen:

```powershell
git add -A
git commit -m "Design: App Experience 9.0.1"
git push origin main
```

4. Nach erfolgreichem Vercel-Deployment die installierte PWA vollständig schließen.
5. Beim erneuten Öffnen erscheint ein Update-Hinweis. Falls nicht, die App einmal entfernen und neu zum Homescreen hinzufügen.

Neue Funktionen:
- Splashscreen nur beim ersten Start pro App-Sitzung
- Offline- und Update-Hinweise
- Vollbild und Display-Wake-Lock unter `/admin/live/[id]`
