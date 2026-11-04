# HUJA Performance-Prüfung – 25.09.2026

## Öffentlicher Ausgangsstand

Geprüft wurde https://spvgg-middelich-resse.eu/ vor Veröffentlichung der hier erstellten Änderungen. Messung am 25.09.2026 um 20:44 UTC, drei aufeinanderfolgende HTTP-Abrufe aus der Arbeitsumgebung. Kein Login, keine Datenbankzugangsdaten, keine Veröffentlichung.

| Messung | Antwort-Header eingetroffen | HTML vollständig gelesen |
| --- | ---: | ---: |
| 1 | 953 ms | 974 ms |
| 2 | 475 ms | 485 ms |
| 3 | 578 ms | 584 ms |

Alle Abrufe lieferten HTTP 200. Das HTML wurde mit Brotli komprimiert ausgeliefert; nach Dekomprimierung etwa 138 KB. Die zwölf im HTML referenzierten Next.js-Skriptdateien umfassten zusammen etwa 805 KB nach Dekomprimierung und wurden ebenfalls mit Brotli ausgeliefert. Diese Zahlen sind ausdrücklich nicht die komprimierten Übertragungsgrößen.

Im ausgelieferten HTML waren 25 Bilder enthalten, davon drei mit `loading="lazy"`. Nachträglich durch externe Widgets erzeugte Bilder und Laufzeitanfragen sind darin nicht erfasst. Die Seite nutzt `private, no-cache, no-store`; bei dynamischen Live- und nutzerbezogenen Inhalten ist dies kein pauschal zu entfernender Fehler.

Diese Messungen sind keine Browser-/Handy-Benchmarks und keine Core-Web-Vitals-Werte. Sie enthalten keine LCP-/INP-/CLS-Messung und beweisen keinen konkreten Geschwindigkeitsgewinn durch den Patch. Wiederholte Abrufe können von warmen Verbindungen und Hosting-Zuständen profitieren.

## Befunde und Änderungen

1. Mehrere Startseitenmodule fragen dieselben Spiel-/Vereinsdaten ab. Die Datenlader verwenden nun `React.cache` innerhalb eines Server-Renderdurchlaufs. Ein instrumentierter Unit-Test mit simulierter React-Anfragegrenze benötigt für zweimal Liga plus einmal Pokal zusammen eine Spiel- und eine Logoabfrage; eine neue Anfrage löst frische Abfragen aus. Eine Messung tatsächlicher produktiver Datenbankabfragen wurde nicht durchgeführt.
2. Startseiten-Rendering wartete vorab auf Pokal und Highlights; auch weitere Module konnten die Ausgabe blockieren. Die Module erhalten einzelne Suspense-Grenzen. Ob Hostinger die Ausgabe unmittelbar streamt oder teilweise puffert, muss nach Veröffentlichung gemessen werden.
3. Das Menü beobachtete den gesamten Unterbaum der Startseite. Jetzt werden nur unmittelbare Abschnittskinder überwacht und identische Menülisten nicht erneut gesetzt. Nachgeladene Abschnitte und leere Suspense-Platzhalter werden berücksichtigt.
4. Mannschaftsdaten wurden vollständig geladen, obwohl nur sechs Spieler sichtbar sind. Die Startseitenabfrage begrenzt nun bereits serverseitig auf sechs; andere Aufrufer bleiben unbegrenzt.
5. Untere Bilder starteten überwiegend ohne Lazy Loading. News/Galerie/Team/Sponsoren laden jetzt verzögert. Wappen erhalten passende `sizes`-Angaben.
6. Die Sponsorenanimation lief permanent. Jetzt pausiert sie außerhalb des sichtbaren Bereichs/im Hintergrund; Bewegungseinstellungen werden beachtet.

Die bereits vorhandenen mobilen Einschränkungen für Rauch-, Licht- und Blur-Animationen bleiben bestehen. Externe Fußball.de-Skripte bleiben hinter ihrer vorhandenen Einwilligung. Kein aggressives langfristiges Caching von Live-Ergebnissen oder Auth-Daten eingeführt.

## Verifikation und mögliche nächste Schritte

36 automatisierte Tests bestanden; TypeScript erfolgreich; Produktionsbuild mit Platzhalter-Supabase-Werten erfolgreich. Keine produktive Datenbank verwendet. Nach Deployment dieselbe URL mit realem Handy und Browser-Netzwerkmessung vergleichen; insbesondere LCP, INP und Layoutverschiebungen messen. Erst dann sind belastbare Aussagen wie „x Prozent schneller“ möglich.

Falls große Galerien weiter bremsen, wäre als nächster Schritt eine gezielte Abfrage von Album-Covern und Medienanzahlen sinnvoll. Aktuell lädt die bestehende Galerie dafür alle öffentlichen Medien der fünf Vorschaualben; dies wurde wegen des höheren Änderungsumfangs nicht nebenbei umgebaut.
