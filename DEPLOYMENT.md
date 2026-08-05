# GitHub- und Vercel-Bereitstellung

## 1. Sicherheitsprüfung

Diese Dateien und Ordner dürfen nicht zu GitHub:

```text
.env.local
.env
node_modules
.next
```

In `.gitignore` sollte mindestens stehen:

```text
.env*
!.env.example
node_modules
.next
```

## 2. Projekt zu GitHub hochladen

Im Projektordner:

```bash
git init
git add .
git commit -m "Vereinsmanager v5.1"
git branch -M main
git remote add origin https://github.com/bockwurstmagier/Vereins-Seite.git
git push -u origin main
```

Falls `origin` bereits existiert:

```bash
git remote set-url origin https://github.com/bockwurstmagier/Vereins-Seite.git
git push -u origin main
```

## 3. GitHub-Secrets für die Build-Prüfung

Im GitHub-Repository:

```text
Settings
→ Secrets and variables
→ Actions
→ New repository secret
```

Diese beiden Secrets anlegen:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

Die Werte stammen aus deiner lokalen `.env.local`.

## 4. Vercel verbinden

1. Bei Vercel anmelden.
2. `Add New` → `Project`.
3. GitHub verbinden.
4. Das Repository `Vereins-Seite` auswählen.
5. Framework Preset: `Next.js`.
6. Root Directory unverändert lassen, sofern `package.json` im Hauptordner liegt.

## 5. Umgebungsvariablen in Vercel

Vor dem ersten Deployment unter `Environment Variables` hinzufügen:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

Beide mindestens für:

```text
Production
Preview
Development
```

Danach `Deploy` anklicken.

## 6. Deployment-Verhalten

- Push auf `main`: neues Produktions-Deployment.
- Pull Request oder anderer Branch: Preview-Deployment.
- Jede Bereitstellung erhält eine eigene Vorschau-URL.
- Änderungen an Vercel-Umgebungsvariablen gelten erst nach einem neuen Deployment.

## 7. Eigene Domain verbinden

In Vercel:

```text
Project
→ Settings
→ Domains
```

Domain eintragen:

```text
spvgg-middelich-resse.eu
```

Vercel zeigt anschließend die benötigten DNS-Einträge. Diese beim Domainanbieter übernehmen.

## 8. Empfohlener Arbeitsablauf

Neue Funktion beginnen:

```bash
git switch -c feature/meine-funktion
```

Änderungen sichern:

```bash
git add .
git commit -m "Funktion: Beschreibung"
git push -u origin feature/meine-funktion
```

Auf GitHub einen Pull Request nach `main` öffnen. Erst zusammenführen, wenn die CI-Prüfung grün ist und das Vercel-Preview geprüft wurde.
