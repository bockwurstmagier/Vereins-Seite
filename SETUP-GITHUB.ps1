$ErrorActionPreference = "Stop"

Write-Host "Vereinsmanager – GitHub-Einrichtung" -ForegroundColor Red

if (-not (Test-Path "package.json")) {
  throw "package.json wurde nicht gefunden. Starte das Skript im Projektordner."
}

if (-not (Test-Path ".git")) {
  git init
}

git branch -M main

$remote = git remote 2>$null
if ($remote -contains "origin") {
  git remote set-url origin "https://github.com/bockwurstmagier/Vereins-Seite.git"
} else {
  git remote add origin "https://github.com/bockwurstmagier/Vereins-Seite.git"
}

git add .
git commit -m "Vereinsmanager v5.1 – GitHub und Vercel Setup"

Write-Host ""
Write-Host "Lokaler Commit wurde erstellt." -ForegroundColor Green
Write-Host "Prüfe jetzt, dass .env.local NICHT im Commit enthalten ist:" -ForegroundColor Yellow
git status

Write-Host ""
Write-Host "Danach manuell ausführen:" -ForegroundColor Cyan
Write-Host "git push -u origin main"
