# Unterstützer-Sponsorenzeile – Design

## Ziel

Der Bereich „Bisherige Sponsoren“ erhält direkt unter der bestehenden Partner-Zeile eine dritte Sponsorenstufe mit der Bezeichnung „Unterstützer“.

## Aufbau

- Die neue Zeile verwendet das vorhandene Markup- und Gestaltungsprinzip von `.sponsor-tier`.
- Die linke Beschriftung zeigt `Bilder Landingpage/Logos/Unterstützer.jpeg` und den Text „Unterstützer“.
- Die rechte Fläche enthält eine einzelne, über die gesamte verfügbare Breite laufende Sponsorenkarte.
- Die Sponsorenkarte zeigt `Bilder Landingpage/Logos/Unterstützer/Eisfeld.png` mit dem Alternativtext „KFZ Meisterbetrieb Eisfeld“.
- Die Karte verlinkt in einem neuen Tab auf `https://www.kfz-eisfeld.de/` und verwendet `rel="noopener noreferrer"`.
- Der zugängliche Linkname lautet „KFZ Meisterbetrieb Eisfeld Website öffnen“.

## Darstellung

- Farben, Rahmen, Abstände, Hover- und Fokuszustände bleiben identisch zu den vorhandenen Sponsorenkarten.
- Es werden keine leeren Rasterplätze erzeugt.
- Auf Desktop füllt die einzelne Karte die rechte Spalte der Zeile aus.
- Auf mobilen Ansichten stapeln sich Beschriftung und Logo wie bei den bestehenden Sponsorenstufen.
- Zusätzliche CSS-Regeln werden nur ergänzt, wenn sie für die vollbreite Einzelkarte oder eine saubere Logo-Skalierung erforderlich sind.

## Verifikation

- Desktop-Prüfung in einer breiten Ansicht, Zielbreite 1280 px.
- Mobile-Prüfung bei 390 px und kurze Gegenprüfung bei 360 px.
- Kontrolle, dass Bildpfade aufgelöst werden, die Karte genau einmal vorhanden ist und der Link auf `https://www.kfz-eisfeld.de/` zeigt.
- Kontrolle der sichtbaren Abstände, Rahmen und Logo-Skalierung im In-App-Browser.
