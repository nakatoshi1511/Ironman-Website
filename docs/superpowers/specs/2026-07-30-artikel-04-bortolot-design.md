# Artikel 04: Gelateria Fratelli Bortolot

## Ziel

Der Inhalt aus `Bilder Landingpage/Newsfeed/Artikel 04/Kopie von Newsfeed Beitrag Vorlage.docx` wird als vierter Newsbeitrag veröffentlicht. Der Beitrag stellt die Gelateria Fratelli Bortolot 1896 als Partner auf Davids Weg nach Hawaii vor.

## Redaktionelle Grundlage

- Titel: `Die traditionsreiche Eisdiele Bortolot als Partner auf dem Weg nach Hawaii`
- Kategorie: `Road to Hawaii`
- Datum: `31.07.2026`
- Teaser: `Ein wenig olympischer Geist kann nicht schaden`
- Bild: `Bilder Landingpage/Newsfeed/Artikel 04/Bild.jpeg`
- Bild-Alttext: `Stefano Bortolot und David`
- Bildunterschrift: `Mit der olympischen Fackel in der Hand`

Das in der DOCX als `31..07.2026` geschriebene Datum wird entsprechend der Bestätigung des Users zu `31.07.2026` korrigiert. Die im Fließtext als `Gelateria Fratelli Bortolot 1869` geschriebene Jahreszahl wird nach Bestätigung des Users zu `1896` korrigiert; dies entspricht auch dem Schriftzug im gelieferten Bild und dem erwähnten 130-jährigen Jubiläum im Jahr 2026. Alle übrigen Inhalte werden ohne erfundene Ergänzungen übernommen.

## Darstellung

Der Artikel folgt dem bestehenden Newsartikel-Muster:

1. Der neue Beitrag erscheint aufgrund seines Datums als erste und große Kachel im Newsfeed.
2. Die Detailseite zeigt Titel, Kategorie und Datum im vorhandenen Artikel-Hero.
3. Der erste gelieferte Absatz eröffnet den Artikel.
4. Das gelieferte Foto wird danach einmal als anklickbares Artikelbild mit Lightbox und Bildunterschrift eingebettet.
5. Die drei weiteren gelieferten Absätze folgen unverändert.
6. Der gelieferte Hinweis `Hier findet ihr weitere Informationen:` und die beiden gelieferten URLs bilden den Abschluss.
7. Der vorhandene Link zurück zum Newsfeed bleibt erhalten.

Es werden keine neuen Layout-Komponenten, Zwischenüberschriften oder zusätzlichen Aussagen eingeführt.

## Technische Integration

- Der Artikel wird als neuer Eintrag am Anfang von `mockups/news-data.js` ergänzt.
- Eine neue statische Detailseite nach dem Muster der vorhandenen Artikelseiten wird angelegt.
- Für die Detailseite wird eine saubere `/news/<slug>`-Route in `vercel.json` ergänzt.
- Die Newsfeed- und Artikel-Importversionen werden als Cache-Buster aktualisiert, damit die neuen Daten im Browser sicher geladen werden.
- Betroffene Navigations- und Deployment-Grenztests werden um die neue Detailseite und Route erweitert.
- Die drei bestehenden Artikel bleiben in Inhalt und Darstellung unverändert.

## Prüfung

- Relevante automatisierte Tests und anschließend der vollständige Lauf mit `npm test`.
- Newsfeed und neue Detailseite im sichtbaren In-App-Browser.
- Desktop-Prüfung bei breiter Ansicht.
- Mobile-Prüfung bei `390px` sowie wegen des langen Titels zusätzlich bei `360px`.
- Kontrolle von Titelumbrüchen, Textfluss, Bildposition, Bildabruf, Lightbox, externen Links, Zurück-Link und Browserkonsole.
- Vor einem späteren Commit der Website-Änderungen: vollständiger Diff-, Status- und Referenzcheck gemäß `PROJECT_CONTEXT.md`.
