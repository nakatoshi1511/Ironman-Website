# News-Lightbox-Navigation

## Ziel

Die unpassenden Unicode-Pfeile in der Bild-Lightbox werden durch die bereitgestellten Grafikdateien ersetzt.

## Umfang

- Die bestehenden Buttons für „Vorheriges Bild“ und „Nächstes Bild“ bleiben erhalten.
- `news-lightbox-arrow-left.png` und `news-lightbox-arrow-right.png` aus `Bilder Landingpage/Newsfeed/UI/` werden als jeweilige Button-Grafik verwendet.
- Die vorhandenen zugänglichen Beschriftungen, die zyklische Navigation, der Bildzähler sowie die Anzeige nur für Bildgruppen bleiben unverändert.
- Die grafische Größe bleibt auf Desktop und Mobile innerhalb der bestehenden Button-Fläche gut bedienbar.

## Umsetzung

Die Anpassung beschränkt sich auf die Lightbox-Struktur der Artikel-Detailseite und deren CSS. `article-render.js` bleibt unverändert, weil die Bildnavigation bereits korrekt funktioniert.

## Prüfung

- Einen Artikel mit Bildgruppe auf Desktop öffnen und beide Richtungen testen.
- Dieselbe Lightbox bei 390 px Breite prüfen.
- Sicherstellen, dass die Buttons weiterhin per Tastatur erreichbar sind und ihre `aria-label`-Texte beibehalten.
