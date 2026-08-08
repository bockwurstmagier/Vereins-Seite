# HUJA v20.7.0 – Invitations & Live Moments

## Spieler-Einladungen
- Öffentliche Registrierungsseite akzeptiert jetzt `SUPABASE_SECRET_KEY` und weiterhin den alten `SUPABASE_SERVICE_ROLE_KEY` als Fallback.
- Einladungslinks verwenden bevorzugt die tatsächlich aufgerufene HUJA-Domain statt blind nur `NEXT_PUBLIC_SITE_URL` zu verwenden.
- Bestehende Login-, Rollen- und Spielerportal-Logik bleibt erhalten.

## Live Moments
- Im mobilen LiveCenter gibt es eine neue Schnellaktion `Video`.
- Arten: `Elfmeter` und `Besonderer Live-Moment`.
- Kurze Videos bis 35 MB können direkt vom Handy hochgeladen werden.
- Upload geht direkt zu Supabase Storage (`live-moments`) und nicht über eine Next.js Server Action.
- Das Video erscheint direkt beim Ticker-Ereignis und kann dort mit Play abgespielt werden.
- Beim Rückgängig-Machen des letzten Video-Ereignisses wird die Storage-Datei ebenfalls entfernt.

## Supabase
Vor dem Deploy ausführen:

`sql/VERSION-20.7.0-HUJA-INVITATIONS-LIVE-MOMENTS.sql`

## Deployment

```bash
npm run build
git add -A
git commit -m "HUJA v20.7.0 - Invitations & Live Moments"
git push origin main
```
