# Google Docs News Import - Design

## Ziel

Der bestehende News-Artikel-Editor soll nicht die Hauptoberflaeche fuer neue Artikel bleiben. Stattdessen schreibt der User Artikel in Google Docs vor und gibt Codex danach den Google-Docs-Link oder einen Export. Codex uebernimmt den Inhalt in die statische Website, erstellt oder aktualisiert Kachel und Detailseite und prueft Desktop und Mobile.

Der Workflow bleibt bewusst schlank: Google Docs ist nur Entwurf und Redaktionsflaeche. Die Website synchronisiert nicht automatisch mit Google Docs.

## User-Workflow

1. Der User schreibt den Artikel in Google Docs.
2. Er nutzt normale Google-Docs-Formatierung:
   - Titel
   - Lead / kurzer Einstieg
   - Zwischenueberschriften
   - normale Absaetze
   - fett, kursiv, unterstrichen
   - Aufzaehlungen und nummerierte Listen
   - Links
   - Bildhinweise oder eingebettete Bilder
3. Der User gibt Codex den Google-Docs-Link oder einen Export.
4. Codex konvertiert den Artikel in das Website-Format.
5. Codex legt den Artikel in `mockups/news-data.js` an, erstellt bei Bedarf die passende Detailseite und prueft Newsfeed und Artikelansicht.

## Google-Docs-Vorlage

Die Vorlage soll fuer den User einfach bleiben:

- Dokumenttitel = Artikelueberschrift
- erster kurzer Absatz oder Abschnitt `Teaser` = Newsfeed-Teaser
- Abschnitt `Kategorie` = Newsfeed-Kategorie
- Abschnitt `Datum` = sichtbares Artikeldatum
- Abschnitt `Artikel` = eigentlicher Detailseiteninhalt
- Bildzeilen koennen als Platzhalter notiert werden, zum Beispiel:
  `Bild: trainingsauftakt-toskana-01.jpg`
  `Bildunterschrift: David beim Training in der Toskana`

Wenn der User Bilder im Google Doc selbst platziert, nutzt Codex diese Platzierung als redaktionelle Orientierung. Die finalen Bilddateien werden im Projektordner unter `Bilder Landingpage/Newsfeed/Artikel XX/` abgelegt und im Artikel verlinkt.

## Technisches Design

Die Website soll kontrollierten Rich Text fuer Artikel unterstuetzen.

### Datenmodell

`mockups/news-data.js` bleibt die zentrale Datenquelle. Artikel erhalten weiter die bestehenden Felder:

- `slug`
- `url`
- `title`
- `teaser`
- `category`
- `dateLabel`
- `dateTime`
- `image`
- `imageAlt`
- `mediaCaption`
- `blocks`

Die `blocks` duerfen kuenftig neben reinem Text auch kontrolliertes HTML enthalten:

```js
{
  type: "rich",
  html: "<h2>Zwischenueberschrift</h2><p>Text mit <strong>Fettung</strong>.</p>"
}
```

Bestehende `lead`, `paragraph` und `media`-Bloecke bleiben kompatibel.

### Rendering

`mockups/article-render.js` rendert Rich-Text-Bloecke mit einer Allowlist. Erlaubt sind:

- `p`
- `br`
- `h2`
- `h3`
- `strong`
- `em`
- `u`
- `ul`
- `ol`
- `li`
- `a`

Links werden auf sichere Attribute normalisiert. Nicht erlaubte Tags oder Attribute werden entfernt, bevor der Inhalt in die Seite eingefuegt wird.

### Styling

`mockups/styles.css` bekommt Artikel-Stile fuer:

- Zwischenueberschriften
- Listen
- Links im Artikeltext
- betonte Textstellen
- saubere Abstaende zwischen Rich-Text-Elementen

Die Typografie soll zum bestehenden Newsfeed-Stil passen und nicht wie ein extern eingefuegtes Google Doc wirken.

## Import-Ablauf fuer Codex

Codex kann je nach bereitgestelltem Material einen dieser Wege nutzen:

1. Google-Docs-Link lesen, Inhalt strukturieren und in Website-Bloecke uebertragen.
2. Google Doc als `.docx` oder HTML exportieren lassen und daraus HTML/strukturierte Bloecke erzeugen.
3. Bei komplizierten Formatierungen den Google-Docs-Inhalt redaktionell nachbauen und dem User die sichtbare Abweichung nennen.

Codex prueft nach dem Einbau:

- Newsfeed-Kachel sichtbar und korrekt sortiert
- Detailseite laedt den richtigen Artikel
- Desktop-Ansicht
- Mobile-Ansicht
- Ueberschriftenumbrueche
- Absatzlaengen
- Listenabstaende
- Bildpositionen und Lightbox

## Bewusst nicht enthalten

Dieser Entwurf enthaelt nicht:

- automatische Live-Synchronisierung aus Google Docs
- Login- oder Adminbereich
- CMS
- direkte Veroeffentlichung durch den User ohne Codex
- Speicherung aus dem bestehenden Artikel-Editor

Diese Punkte koennen spaeter ergaenzt werden, falls der redaktionelle Aufwand deutlich steigt.

## Akzeptanzkriterien

- Ein Artikel aus Google Docs kann mit Ueberschriften, Listen, Fett/Kursiv/Unterstrichen und Links in der Website erscheinen.
- Bestehende Artikel funktionieren unveraendert weiter.
- Unsichere oder unerwuenschte HTML-Elemente werden nicht in die Seite gerendert.
- Der Workflow bleibt fuer den User: schreiben in Google Docs, Link/Export an Codex geben, Codex baut ein.
- Nach Einbau eines Artikels werden Newsfeed und Detailseite auf Desktop und Mobile geprueft.
