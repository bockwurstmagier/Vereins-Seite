# Checkliste

## GitHub

- [ ] `.env.local` ist nicht im Repository
- [ ] `.env.example` ist vorhanden
- [ ] Repository ist privat oder bewusst öffentlich
- [ ] GitHub Actions Secrets sind angelegt
- [ ] CI-Workflow ist grün
- [ ] Branch-Schutz für `main` aktiviert

Empfohlener Branch-Schutz:

```text
Settings
→ Branches
→ Add branch protection rule
→ Branch name pattern: main
```

Aktivieren:

- Require a pull request before merging
- Require status checks to pass
- Require branches to be up to date
- Do not allow bypassing the above settings

## Vercel

- [ ] GitHub-Repository importiert
- [ ] Framework als Next.js erkannt
- [ ] Supabase-Variablen eingetragen
- [ ] Preview-Deployment getestet
- [ ] Production-Deployment getestet
- [ ] Domain verbunden
- [ ] Weiterleitung zwischen www und Hauptdomain geprüft

## Supabase

- [ ] RLS für alle öffentlichen Tabellen aktiviert
- [ ] Admin-Schreibrechte geprüft
- [ ] Keine `service_role`-Schlüssel im Frontend
- [ ] Storage-Buckets und Policies geprüft
- [ ] Datenbank-Backups geprüft
