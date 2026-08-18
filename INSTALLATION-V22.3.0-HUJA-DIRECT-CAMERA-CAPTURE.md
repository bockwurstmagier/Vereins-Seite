# HUJA v22.3.0 – Direct Camera Capture

- Live-Steuerung: neuer Button „Direkt mit Kamera aufnehmen“.
- Auf unterstützten Smartphones öffnet sich direkt die rückseitige Kamera (`capture=environment`).
- Alternativ bleibt „Vorhandenes Video auswählen“ vollständig erhalten.
- Nach der Aufnahme nutzt HUJA exakt den bestehenden Ablauf: Vorschau → Upload zu Supabase Storage → Live-Moment → Match Story.
- Bestehendes 35-MB-Limit bleibt unverändert.
- Kein neuer Storage-Bucket und keine Supabase-SQL notwendig.
- Battery-/Performance-Hotfix v22.2.1 bleibt enthalten.
- Login/Auth/Rollen unverändert.

Hinweis: Die konkrete Kamera-Oberfläche wird vom Betriebssystem/Browser bereitgestellt. iOS/Android können sich optisch leicht unterscheiden.
