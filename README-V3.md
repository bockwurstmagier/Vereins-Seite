# Vereinsmanager v3.0

Neu: installierbare PWA, Offline-Grundfunktion, Vereinskalender, Kontakt-/Probetraining-/Sponsorformulare, Admin-Anfragen, Statistiken, Mediencenter und Social-Media-Text-Assistent.

## Installation
1. `.env.local` aus der vorherigen Version übernehmen.
2. In Supabase `sql/VERSION-3.0.sql` ausführen.
3. `npm install`
4. `npm run build`
5. `npm run dev`

Der Text-Assistent arbeitet lokal mit Vorlagen und benötigt keinen externen API-Schlüssel. Eine echte generative KI-Anbindung kann später ergänzt werden.
