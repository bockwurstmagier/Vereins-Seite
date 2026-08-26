# HUJA v23.3.0 – Fan Preview & Stadium Sounds

## Stadium Sounds
- Anpfiff: 1 Schiedsrichter-Pfiff
- Halbzeit: 2 Pfiffe
- 2. Halbzeit: 1 Pfiff
- Abpfiff: 3 Pfiffe
- Wird nur abgespielt, wenn der Fan Live-Sound aktiviert hat.
- Eigener Pfeifen-Sound im Adminbereich hochladbar.
- Ohne Upload verwendet HUJA einen eingebauten WebAudio-Pfiff.
- Upload nutzt den vorhandenen `match-sounds` Storage-Bucket.

## Test-Labor
- Neue Fan-Handy-Vorschau mit Spielstand, Minute, Phase und letzten Ereignissen.
- Phasenbuttons testen gleichzeitig Overlay + Pfeifenmuster.
- Alles bleibt isoliert und verschickt keine echten Pushs.

Keine neue SQL erforderlich.
