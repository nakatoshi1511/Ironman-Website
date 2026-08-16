# Road to Hawaii - Projektkontext

Diese Datei fasst den aktuellen Stand des Projekts zusammen und soll in neuen Chats zuerst gelesen werden.

## Live-Status und Production-Sicherheit

Die Website ist öffentlich live und wird von echten Besuchern genutzt. Der Branch `main` ist deshalb als Production-Branch zu behandeln: Ein Push kann automatisch ein öffentliches Vercel-Deployment auslösen.

Verbindliche Grundregeln:

- Keine ungetesteten oder nur teilweise geprüften Änderungen pushen.
- Änderungen klein und nachvollziehbar halten; keine sachfremden Dateien mitnehmen.
- Vor jedem Commit und insbesondere vor jedem Push alle für die Änderung relevanten automatisierten Tests ausführen. Als vollständiger lokaler Testlauf steht `npm test` zur Verfügung.
- Ein fehlgeschlagener Test, ein ungeklärter Browserfehler, eine kaputte Referenz oder eine unvollständige visuelle Prüfung blockiert den Push.
- Visuelle Änderungen vor dem Push im sichtbaren In-App-Browser mindestens auf Desktop und Mobile prüfen; bei Navigation oder engen Layouts zusätzlich `360px` testen.
- Bei Änderungen an mehreren Seiten jede betroffene Seite einzeln prüfen. Gemeinsame Navigation, Footer, Styles oder Rendering-Skripte außerdem auf allen davon abhängigen aktiven Seiten gegenprüfen.
- Vor dem Commit den vollständigen Diff, den Git-Status und die tatsächlich enthaltenen Dateien kontrollieren.
- Nach einem Push das Vercel-Deployment abwarten und anschließend einen Smoke-Test auf der öffentlichen Live-URL durchführen. Erst danach gilt die Veröffentlichung als abgeschlossen.
- Wenn eine notwendige Prüfung nicht zuverlässig möglich ist, nicht pushen, sondern den User transparent auf das verbleibende Risiko oder den Blocker hinweisen.

## Projektziel

Es entsteht eine Sponsoren-Landingpage für David Simon, einen Amateur-Triathleten aus Büchel, der sich für die IRONMAN Weltmeisterschaft Hawaii 2026 qualifiziert hat.

Hauptziel:
- potenzielle Sponsoren überzeugen
- Davids sportliche Leistung und Glaubwürdigkeit sichtbar machen
- Kontaktaufnahme und Sponsoring-Konzept erleichtern
- später News/Updates über eine eigene Newsfeed-Seite veröffentlichen

Zielgruppe:
- regionale Unternehmen
- lokale Betriebe und Mittelstand
- Sport-, Health- und Fitness-nahe Unternehmen
- Unterstützer, die regionale Sichtbarkeit und authentisches Storytelling suchen

Gewünschte Wirkung:
- seriös
- modern
- sportlich
- leistungsorientiert
- regional verwurzelt
- emotional, aber nicht kitschig
- hochwertig, aber nicht überinszeniert

## Inhaltliche Eckdaten

- Name: David Simon
- Alter im Konzept: 35
- Wohnort: Büchel
- Beruf: Polizeibeamter
- Verein: RSC Untermosel
- Bestzeit Langdistanz: 8:38 Stunden
- IRONMAN Frankfurt 2025: Vizeeuropameister Altersklasse M30
- IRONMAN Lanzarote 2026: Altersklassensieg
- Qualifikation für IRONMAN Weltmeisterschaft Hawaii
- Zielrennen: IRONMAN Weltmeisterschaft Hawaii am 10. Oktober 2026
- Socials: Instagram, Strava, Facebook
- Kontakt laut Konzept: `david91simon@gmail.com`

## Aktueller Seitenaufbau

Die aktuelle Homepage ist:

- `mockups/landingpage-flow.html`

Aktuelle Struktur:

1. Header/Hero
   - großes Hero-Bild
   - Headline `Road to Hawaii`
   - oben eine Navigationsleiste mit Sprunglinks
   - Links:
     - Profil
     - Erfolge
     - Partner werden
     - Roadmap
     - Socials & Sponsoren
     - Newsfeed

2. Davids Profil
   - Kurzprofil
   - Wohnort, Beruf, Verein, Alter als kompakte Fakten

3. Erfolge
   - 8:38 Langdistanz
   - M30 Vizeeuropameister Frankfurt 2025
   - Altersklassensieg IRONMAN Lanzarote 2026
   - Kona/Hawaii-Qualifikation

4. Partner werden
   - Nutzen und Sichtbarkeit für Sponsoren
   - Werte:
     - Disziplin
     - Ausdauer
     - Zielstrebigkeit
     - regionale Verbundenheit
     - authentisches Storytelling
   - Sponsoring-Konzept Download-Button als Platzhalter

5. Roadmap
   - Countdown bis zur IRONMAN WM
   - Aktuelle Zielzeit im Code: `2026-10-10T06:30:00-10:00`
   - Das entspricht dem 10. Oktober 2026 um 06:30 Uhr in Hawaii (HST) beziehungsweise 18:30 Uhr deutscher Sommerzeit (CEST).
   - Die Zielzeit ist vorläufig: Die konkrete Startzeit beziehungsweise Startwelle für Davids Altersklasse M35 ist von IRONMAN noch nicht veröffentlicht.
   - Die offizielle IRONMAN-Seite nennt aktuell `TUNE IN: 7 am HST`; das ist die angekündigte Übertragungszeit und keine bestätigte M35-Startzeit.
   - Sobald der Zeitplan oder Athlete Guide 2026 veröffentlicht wird, muss die Countdown-Zielzeit mit der tatsächlichen Startwelle abgeglichen werden.
   - Roadmap-Bild: `Dokumente/Bilder/Roadmap-transparent.png`
   - Mobile aktuell horizontal scrollbares Roadmap-Visual

6. Social Media & Sponsoren
   - Instagram, Strava, Facebook als Platzhalterlinks
   - Hauptpartner-Bereich
   - weitere Sponsorenlogos als Platzhalter

## Newsfeed

Der Newsfeed ist bewusst keine Sektion der Homepage mehr, sondern eine eigene Seite:

- `mockups/newsfeed.html`

Aktueller Stand:
- statische Seite, deren Kacheln per `mockups/newsfeed-render.js` aus `mockups/news-data.js` gerendert werden
- Hero mit Navigation zurück zu den Homepage-Sektionen
- drei echte Beiträge sind angelegt:
  - `17 Stunden zum Ruhm - Mythos Ironman Hawaii`
    - Detailseite: `mockups/newsfeed-17-stunden-zum-ruhm.html`
    - Bildmaterial: `Bilder Landingpage/Newsfeed/Artikel 01/`
  - `Trainingsauftakt in der Toskana`
    - Detailseite: `mockups/newsfeed-trainingsauftakt-in-der-toskana.html`
    - Bildmaterial: `Bilder Landingpage/Newsfeed/Artikel 02/`
  - `Zu Gast im Podcast MoselMomente`
    - Detailseite: `mockups/newsfeed-zu-gast-im-podcast-moselmomente.html`
    - Bildmaterial: `Bilder Landingpage/Newsfeed/Artikel 03/`
- Artikel werden blockbasiert aufgebaut:
  - `lead`
  - `paragraph`
  - `media`
  - `gallery`
- Bildblöcke können im Textfluss frei positioniert werden.
- Bilder werden im Artikel klein eingebettet und per Klick in einer Lightbox groß angezeigt.
- Für Bildgalerien werden Hauptbild und Vorschau-Block mit derselben `lightboxGroup` und derselben `lightboxImages`-Reihenfolge gepflegt. In der Lightbox ist nur diese explizite Gruppe zyklisch blätterbar; Einzelbilder bleiben ohne diese beiden Angaben.

Artikelpflege:
- Neue Artikel werden direkt in `mockups/news-data.js` und der passenden statischen Detailseite gepflegt.
- Artikel-Metadaten: `slug`, `url`, `title`, `teaser`, `category`, `dateLabel`, `dateTime`, `image`, `imageAlt` und bei Bedarf `mediaCaption`.
- Aktuelle Kategorien: `Training`, `Wettkampf`, `Partner` und `Road to Hawaii`.
- Der Textaufbau nutzt die oben genannten Blocktypen. `rich` ist für kontrollierte Rich-Text-Blöcke mit erlaubtem HTML verfügbar.
- Für jeden Artikel muss die Kachel im Newsfeed auf die passende Detailseite verweisen.

Verbindliche Bildoptimierung für neue News-Uploads:
- Hochauflösende Originalbilder bleiben als unveränderte Quelldateien erhalten, werden aber nicht direkt von Newsfeed oder Artikelseite ausgeliefert und über `.vercelignore` vom Deployment ausgeschlossen.
- Für Fotos werden standardmäßig zwei Web-Ableitungen erzeugt:
  - große Version mit maximal etwa `1600px` Breite für Desktop und Lightbox
  - mobile Version mit maximal etwa `720px` Breite
- Kleinere Originale werden nicht hochskaliert und bereits passend optimierte Bilder nicht unnötig erneut verlustbehaftet komprimiert.
- Zielgrößen sind ungefähr `300–700 KB` für die große Version und höchstens etwa `200 KB` für die mobile Version. Diese Werte sind Qualitätsziele, keine harten Grenzwerte: Sichtbare Artefakte, Detailverlust oder unnatürliche Farbverläufe dürfen nicht zugunsten einer kleineren Datei akzeptiert werden.
- Fotos werden bevorzugt als hochwertiges JPEG, WebP oder AVIF ausgegeben. Logos, Grafiken, Transparenzen und Bilder mit feiner Schrift werden formatgerecht behandelt und nicht pauschal wie Fotos komprimiert.
- Die Ableitungen werden mit `srcset` und `sizes` eingebunden. Mobil soll die kleine Version geladen werden; Desktop und Lightbox erhalten eine ausreichend große Version.
- Vor der Freigabe werden Original und große Webversion sichtbar verglichen. Gesichter, Schrift, feine Strukturen, Kontraste und Farbverläufe dürfen bei der vorgesehenen Darstellungsgröße keinen wahrnehmbaren Qualitätsverlust zeigen.
- Im sichtbaren In-App-Browser werden Desktop und Mobile geprüft. Dabei sind `currentSrc`, erfolgreicher Bildabruf, Seitenverhältnis, Schärfe und Lightbox-Darstellung zu kontrollieren.
- Falls die Zielgröße nur mit sichtbarem Qualitätsverlust erreichbar wäre, bleibt die Webdatei bewusst größer. Bildqualität hat Vorrang vor dem letzten eingesparten Kilobyte.

Google-Docs-Import:
- Bevorzugter Workflow für neue Artikel: Der User schreibt in Google Docs vor und gibt Codex den Link oder Export.
- Google Docs ist nur Entwurf, keine automatische Synchronisierung und kein CMS.
- Detailartikel dürfen kontrollierte Rich-Text-Blöcke verwenden: `rich` mit erlaubtem HTML.
- Bilder bleiben als `media`-Blöcke im Projektordner `Bilder Landingpage/Newsfeed/Artikel XX/`.
- Doku: `docs/news-google-docs-import.md`
- Verbindliche Inhaltsregel: Bei Artikelimporten keinerlei Inhalte selbst erfinden oder ergÃ¤nzen. Bildunterschriften, Alt-Texte, Teaser, ZwischenÃ¼berschriften, Bildauswahl und sonstige Angaben werden nur Ã¼bernommen, wenn sie vom User ausdrÃ¼cklich geliefert oder freigegeben wurden. Fehlen Angaben, bleiben sie leer oder werden vor dem EinfÃ¼gen abgefragt.
- Verbindliche Rechtschreibregel: Vor dem Einbau wird jeder neue oder geänderte Beitrag einmal ausschließlich auf Rechtschreibfehler geprüft. Es dürfen nur eindeutig falsche Schreibweisen durch die korrekte Schreibweise ersetzt werden. Wörter, Sätze oder Absätze dürfen weder hinzugefügt noch entfernt werden; Grammatik, Zeichensetzung, Satzbau, Stil, Wortwahl und Inhalt bleiben unverändert.

Learnings aus dem DOCX-Testimport:
- Nach Änderungen an `mockups/news-data.js` müssen die ES-Module im Browser frisch geladen werden. Der In-App-Browser kann alte Modulversionen hartnäckig behalten; deshalb bei Artikelimporten die Script-/Import-Versionierung bewusst aktualisieren oder mit eindeutigem Cache-Buster prüfen.
- Nicht nur schauen, ob die Detailseite geöffnet ist. Vor dem Zeigen an den User konkret verifizieren, dass der Artikelkörper gerendert wurde, z. B. Textlänge von `[data-article-slug]`, Anzahl der Lead-/Text-/Media-Blöcke und Position des Footers.
- Wenn die Seite nur Hero und Footer zeigt, ist sehr wahrscheinlich der Artikeldaten-Import nicht frisch geladen oder der Slug findet keinen Artikel.
- DOCX-Dateien enthalten nicht automatisch eingebettete Bilder. Beim Import immer prüfen, ob `word/media/` Dateien enthält; wenn nicht, Bildplatzhalter/Caption transparent benennen und nicht so tun, als sei das Bild importiert.
- Der User bevorzugt einen schlanken Workflow: Google Docs ist der freie Schreib- und Formatierungsentwurf; Codex importiert daraus kontrolliert in `news-data.js` und die statische Detailseite.

Spätere Ausbaustufe:
- mehrere Artikel-Detailseiten aus Templates erzeugen
- optional Kategorien/Filter im Newsfeed wieder aktivieren

## Kontaktformular

Das Kontaktformular im Impressum ist kein `mailto:`-Formular mehr.

Aktueller Stand:
- Formularseite: `mockups/impressum.html`
- API-Endpunkt: `api/contact.js`
- Versandweg: Vercel Function ruft die Resend REST API auf
- Browserlogik: `mockups/contact-form.js`
- Tests: `tests/contact.test.js` und `tests/contact-form-page.test.js`
- API akzeptiert ausschließlich JSON bis 12.000 Bytes und setzt `Cache-Control: no-store`.
- Feldgrenzen: Name 120, E-Mail 180, Nachricht 4.000 Zeichen.
- Ein unsichtbares Feld `company_website` dient als Honeypot; Treffer lösen keinen Resend-Aufruf aus.
- Resend-Aufrufe werden nach 8 Sekunden abgebrochen; Fehlerlogs enthalten keine Formulardaten.

BenÃ¶tigte Environment Variables in Vercel:
- `RESEND_API_KEY`
- `CONTACT_FROM_EMAIL`
- `CONTACT_TO_EMAIL` (optional, Default im Code: `david91simon@gmail.com`)

Fehlerüberwachung:
- In Vercel ist für `ironman-website` eine Fehleranomalie-Alarmregel für 5xx-Antworten eingerichtet. Sie benachrichtigt die Team-Owner per E-Mail, Inbox und Push.

Wichtig:
- `CONTACT_FROM_EMAIL` muss bei Resend als Absender zulÃ¤ssig sein, idealerweise Ã¼ber eine verifizierte Domain.
- Der lokale Vorschau-Server auf Port `4173` kann `/api/contact` nicht ausführen. Für einen echten lokalen Formular-Test muss Vercel Dev oder ein Deployment mit gesetzten Environment Variables genutzt werden.
- Die DatenschutzerklÃ¤rung wurde angepasst: Das Formular verarbeitet Name, E-Mail-Adresse und Nachricht serverseitig und leitet sie per E-Mail weiter.
- Die Datenschutzerklärung nennt jetzt außerdem den E-Mail-Dienst Resend und beschreibt die Weitergabe der Formulardaten für den Versand.
- Offen als Plattformschritt: Vercel Rate Limiting für `POST /api/contact`, Resend-Schlüssel mit `sending_access` und Prüfung der Absenderdomain.

## Wichtige Dateien

Mockups:
- `mockups/index.html`
- `mockups/styles.css`
- `mockups/landingpage-flow.html`
- `mockups/newsfeed.html`
- `mockups/newsfeed-17-stunden-zum-ruhm.html`
- `mockups/news-data.js`
- `mockups/newsfeed-render.js`
- `mockups/article-render.js`

Assets:
- Hero-Bild: `Bilder Landingpage/HeroV1.jpg`
- weiteres Bildmaterial: `Bilder Landingpage/`
- Newsfeed-Bilder: `Bilder Landingpage/Newsfeed/`
- Roadmap-Bild: `Dokumente/Bilder/Roadmap-transparent.png`
- zusätzlich vorhanden: `RoadmapV2.png`

Screenshot-Export:
- Skript: `tools/export-mockup-screenshots.js`
- Doku: `docs/mockup-screenshot-export.md`
- Lokales, von Git ignoriertes Export-Ziel: `_local-archive/mockup-screenshots/`
- Das Exportskript bleibt nur für lokal archivierte Vergleichsbilder erhalten. Verbindliche visuelle Website-Prüfungen erfolgen ausschließlich im sichtbaren In-App-Browser.

Lokale Prüfbilder:
- bisherige Exporte liegen nur lokal unter `_local-archive/mockup-screenshots/`
- sie werden nicht mehr von Git oder Vercel erfasst

Lokales Archiv:
- Root: `_local-archive/`
- der gesamte Ordner wird durch `.gitignore` ausgeschlossen
- generierte Ausgaben, temporäre Dateien und klar nicht produktive Altdateien werden dort lokal aufbewahrt
- die Inhalte sind nicht durch Git gesichert und müssen bei langfristigem Bedarf separat gesichert werden

## Lokaler Server

Der lokale Vorschau-Server bildet die sauberen Vercel-Routen (`/`, `/news`, Artikel- und Rechtsseiten) auf die statischen Projektdateien ab. Dadurch funktionieren die Production-Links auch lokal, ohne die veröffentlichten HTML-Dateien zu verändern.

Mockups werden über diesen Server geprüft:

```powershell
node tools/local-preview-server.js
```

Aktuelle URLs:
- Homepage: `http://127.0.0.1:4173/`
- Newsfeed: `http://127.0.0.1:4173/news`
- erster Artikel: `http://127.0.0.1:4173/news/17-stunden-zum-ruhm`
- Kompatible Mockup-URL für bestehende Startabläufe: `http://127.0.0.1:4173/mockups/landingpage-flow.html`
- Variantenübersicht: `http://127.0.0.1:4173/mockups/`

Vor Arbeiten immer prüfen, ob der Server/Port noch aktiv ist.

## Browser-, Mobile- und Layout-Workflow

Learnings aus der aktuellen Iteration:

- Neue verbindliche Regel: Für visuelle Website-Arbeiten darf nur noch der In-App-Browser genutzt werden. Wenn der In-App-Browser nicht verfügbar ist oder nicht funktioniert, nicht auf Headless-Screenshots, externe Browser oder andere Browser-Workarounds ausweichen, sondern den User explizit darauf hinweisen und fragen, wie fortgefahren werden soll.

- Der In-App-Browser soll für visuelle Änderungen aktiv genutzt werden.
- Vor visuellen Arbeiten immer die aktuelle lokale URL öffnen:
  `http://127.0.0.1:4173/mockups/landingpage-flow.html`
- Wenn der lokale Server nicht läuft, den lokalen Vorschau-Server mit `node tools/local-preview-server.js` auf Port `4173` starten.
- Für Mobile-Prüfungen ist `390px` eine gute Standardbreite.
- Zusätzlich kurz bei `360px` gegenprüfen, wenn Navigation, Headline oder enge Textbereiche betroffen sind.
- Für Desktop-Prüfungen eine breite Ansicht verwenden, z. B. `1280px`.
- In Chrome kann die Mobile-Breite über DevTools gesetzt werden:
  `F12` oder Rechtsklick `Untersuchen`, dann Device Toolbar mit `Ctrl + Shift + M`, Modus `Responsive`, Breite `390` eintragen.
- Bei paralleler Arbeit an Desktop und Mobile am besten zwei Ansichten offen halten:
  eine normale Desktop-Ansicht und eine DevTools-/Responsive-Ansicht mit `390px`.

Grundregel für CSS-Anpassungen:

- Desktop ist die Basis und bleibt außerhalb der Mobile-Media-Queries.
- Mobile-Anpassungen gehören in die vorhandenen Breakpoints, vor allem:
  - `@media (max-width: 720px)` für mobile Hauptanpassungen
  - `@media (max-width: 560px)` für sehr schmale Geräte
- Desktop nicht versehentlich verändern, wenn nur Mobile gemeint ist.
- Nach jeder relevanten Layout-Änderung mindestens Desktop und Mobile kurz prüfen.

Aktuelle Mobile-Hero-Entscheidungen:

- Desktop-Hero-Bild bleibt:
  `Bilder Landingpage/Hero/final-variants/hero-final-H-no-bars-clean-filter-warm-sunrise.jpg`
- Mobile-Hero-Bild ist:
  `Bilder Landingpage/Hero/mobile-hero/road-to-hawaii-mobile-hero.jpg`
- Das mobile Hero-Bild wird in `mockups/landingpage-flow.html` über eine `<source>` im `<picture>` gesetzt.
- Wichtig: Im `srcset` muss der Pfad mit Leerzeichen URL-encodiert werden:
  `../Bilder%20Landingpage/Hero/mobile-hero/road-to-hawaii-mobile-hero.jpg`
- Bei `390px` muss der Browser als `currentSrc` dieses Mobile-Bild laden.

Aktuelle Mobile-Header-Gestaltung:

- Desktop-Headline und Desktop-Untertext gefallen und sollen als Referenz erhalten bleiben.
- Mobile Headline soll kompakter sein und weiter oben sitzen.
- Mobile Untertext soll kleiner sein und unmittelbar über dem Countdown sitzen.
- Aktuelle Mobile-Zielwerte in `mockups/styles.css`:
  - `.flow-hero-content` bei Mobile: `padding: 86px 20px 150px`
  - `.flow-hero h1` bei Mobile: `font-size: clamp(3.4rem, 18vw, 5rem)`, `align-self: start`
  - `.flow-hero-copy > p` bei Mobile: `font-size: 0.88rem`, `line-height: 1.42`
  - bei sehr schmalen Screens wird `.flow-hero-content` nicht mehr mit `padding-top: 170px` nach unten gedrückt, sondern nutzt `padding-top: 76px`
- Verifizierter Stand bei `390px`:
  - Headline startet ungefähr bei `76px`
  - Untertext endet ungefähr `10px` über dem Countdown
  - Navigation bleibt einzeilig

Aktuelle Mobile-Navigation:

- Mobile Navigation soll nicht in zwei Zeilen umbrechen.
- In den Mobile-Regeln ist deshalb `flex-wrap: nowrap` gesetzt.
- Schrift und Innenabstände sind mobil reduziert, damit alle Links in eine Zeile passen.
- Nach Änderungen an Navigation immer bei `390px` und idealerweise `360px` prüfen.

Empfohlener Arbeitsablauf für zukünftige Website-Anpassungen:

1. `PROJECT_CONTEXT.md` lesen.
2. Server auf Port `4173` prüfen oder starten.
3. Betroffene Dateien, Seiten und Abhängigkeiten bestimmen; bei visuellen Arbeiten den aktuellen Desktop- und Mobile-Zustand als Referenz ansehen.
4. Gewünschte Änderung klein und nur im passenden Bereich umsetzen:
   - Desktop-Regeln außerhalb der Media Query
   - Mobile-Regeln in `@media (max-width: 720px)` oder `@media (max-width: 560px)`
5. Relevante automatisierte Tests ausführen; vor einem Push grundsätzlich `npm test` vollständig erfolgreich abschließen.
6. Im sichtbaren In-App-Browser jede betroffene Seite funktional und visuell verifizieren:
   - Desktop: breite Ansicht, z. B. `1280px`
   - Mobile: `390px`, bei engen Stellen auch `360px`
   - Navigation, Links, Buttons und geänderte Interaktionen tatsächlich benutzen
   - Browser-Konsole auf neue Fehler prüfen
7. Bei Bildwechseln im Browser `currentSrc` und den erfolgreichen Bildabruf prüfen, nicht nur den HTML-Pfad.
8. Vor Commit `git diff --check`, `git status --short --branch`, `git diff --stat` und den vollständigen relevanten Diff prüfen.
9. Nur bewusst gewünschte und vollständig geprüfte Dateien committen.
10. Unmittelbar vor dem Push sicherstellen, dass seit dem Testlauf keine weiteren Änderungen hinzugekommen sind und alle Prüfungen weiterhin grün sind.
11. Nach dem Push das erfolgreiche Vercel-Deployment kontrollieren und die betroffenen Abläufe auf `https://ironman-website.vercel.app` erneut als Smoke-Test prüfen.

Zusätzliche Regel für News-Artikel:

- Vor dem Einbau jeden Beitrag auf Rechtschreibfehler prüfen und ausschließlich eindeutige Rechtschreibfehler korrigieren. Nichts inhaltlich hinzufügen oder löschen; Grammatik, Zeichensetzung, Satzbau, Stil und Wortwahl nicht bearbeiten.
- Bei jedem neuen oder geänderten Artikel müssen Desktop- und Mobile-Ansicht geprüft werden.
- Nicht nur prüfen, ob Inhalt vorhanden ist, sondern bewusst auf Satzbau, Absatzlängen, Zeilenumbrüche, Überschriftenumbrüche und Bildpositionen achten.
- Besonders bei Artikel-Detailseiten darf die Überschrift nicht unruhig umbrechen; Trenner wie `-` sollen nicht unglücklich am Zeilenende hängen.
- Bilder im Artikel sollen im Textfluss bewusst platziert werden und auf Desktop sowie Mobile als eingebettete Medien funktionieren.

## Vercel-Veröffentlichungsgrenze

Die Datei `.vercelignore` arbeitet als Freigabeliste: Git darf weiterhin Projektunterlagen, Tests, Werkzeuge und Quelldateien enthalten, Vercel erhält aber nur die produktive Laufzeitoberfläche.

Regeln für neue Inhalte:

- neue Artikelseiten: `mockups/newsfeed-<slug>.html`
- neue Artikelbilder: `Bilder Landingpage/Newsfeed/Artikel XX/`
- neue Sponsorenlogos: passender Unterordner unter `Bilder Landingpage/Logos/`
- in den beiden erweiterbaren Bildbereichen werden nur Web-Bildformate veröffentlicht: JPG, JPEG, PNG, WebP, AVIF und SVG
- DOCX-, ZIP-, Arbeits- und Quelldateien bleiben auch innerhalb dieser Ordner vom Deployment ausgeschlossen
- nur das aktive Sponsoring-PDF ist ausdrücklich für das Deployment freigegeben

Der Test `tests/vercel-deployment-boundary.test.js` kontrolliert die Regeln und alle lokalen Referenzen der aktiven Seiten sowie der Newsdaten. Bei einer neuen Produktionskategorie muss zuerst die Sicherheitsgrenze bewusst erweitert und der Test angepasst werden.

Wichtig für die Vercel-Allowlist:
- Verzeichnisfreigaben werden ohne abschließenden Slash geschrieben, zum Beispiel `!mockups` statt `!/mockups/`. Vercel prüft Ordner während der rekursiven Traversierung ohne Slash und würde sie sonst vollständig überspringen.
- Der Deployment-Grenztest verwendet das npm-Paket `ignore`, also dieselbe Regel-Engine wie Vercel, und prüft zusätzlich alle übergeordneten Laufzeitordner.

## GitHub und Vercel Deployment

Das Projekt ist auf GitHub und Vercel veröffentlicht und öffentlich in Production. Echte Besucher greifen auf die Website zu; Stabilität und Fehlerfreiheit haben daher vor Veröffentlichung jeder Änderung Vorrang.

GitHub:
- Repository: `nakatoshi1511/Ironman-Website`
- URL: `https://github.com/nakatoshi1511/Ironman-Website`
- Branch: `main`
- Remote: `origin`

Vercel:
- Projektname: `ironman-website`
- Production URL: `https://ironman-website.vercel.app`
- Aktuelle Live-Startseite leitet weiter auf:
  `https://ironman-website.vercel.app/mockups/landingpage-flow.html`
- Vercel-Projekt ist mit dem GitHub-Repo `nakatoshi1511/Ironman-Website` verbunden.
- Vercel zeigte nach dem Verbinden: `Connected just now`.
- Zukünftige Pushes auf GitHub sollen automatisch neue Vercel-Deployments auslösen.

Wichtige Deployment-Details:
- Im Projekt-Root liegt `index.html`; diese leitet auf `mockups/landingpage-flow.html` weiter.
- Die lokale `.vercel/` Projektverknüpfung wird über `.gitignore` ignoriert und soll nicht committed werden.
- Der erste Production-Deploy wurde per `npx vercel --prod --yes --name ironman-website` erstellt.
- Beim direkten CLI-Deploy wurde der Alias `https://ironman-website.vercel.app` gesetzt.

Verbindlicher Update-Flow für die Live-Website:

```powershell
npm test
git diff --check
git status --short --branch
git diff --stat
git diff
git add <geänderte-dateien>
git commit -m "<kurze beschreibung>"
git push
```

`git push` darf erst ausgeführt werden, wenn die automatisierten Tests, die funktionale Prüfung und die erforderlichen Desktop-/Mobile-Prüfungen erfolgreich abgeschlossen sind. Nach dem Push im Vercel Dashboard prüfen, ob das automatische Deployment erfolgreich durchgelaufen ist, und anschließend die betroffenen Seiten und Abläufe unter der Live-URL testen.

## Designpräferenzen

- keine generische Landingpage
- keine reine Logowand
- keine zu cleanen Dashboard-Kästen
- keine starre Paket-/Preislogik
- keine übertriebene Hawaii-Tourismus-Ästhetik
- Bild und Story sollen führen
- Sponsoren sollen schnell Vertrauen aufbauen
- mobile Darstellung muss sauber sein
- iteratives Mocking ist gewünscht, bevor final implementiert wird

## Aktueller Git-Stand

Stand nach diesem Kontext-Update:
- Branch: `main`
- Remote: `origin`
- GitHub-Repo: `https://github.com/nakatoshi1511/Ironman-Website`
- Vercel-Live-URL: `https://ironman-website.vercel.app`
- alle aktuellen Mockups und Assets sollen auf `main` verfügbar sein

## Hinweise für neue Chats

### Session-Start-Kürzel `go`

Wenn der User zu Beginn einer neuen Session als alleinstehenden Befehl `go` schreibt, ist das als folgende Arbeitsanweisung zu verstehen:

1. `PROJECT_CONTEXT.md` vollständig lesen.
2. Prüfen, ob der lokale Server auf Port `4173` läuft; falls nicht, ihn wie unter **Lokaler Server** beschrieben starten.
3. Die aktuelle Homepage unter `http://127.0.0.1:4173/mockups/landingpage-flow.html` im sichtbaren In-App-Browser öffnen.
4. Für diesen Startvorgang ausschließlich den In-App-Browser verwenden und nicht auf einen anderen Browser ausweichen.

Wenn an diesem Projekt weitergearbeitet wird:

1. Diese Datei zuerst lesen.
2. `mockups/landingpage-flow.html`, `mockups/newsfeed.html` und bei News-Arbeiten `mockups/news-data.js` sowie die betroffene Detailseite prüfen.
3. Bei visuellen Änderungen ausschließlich den In-App-Browser verwenden. Falls der In-App-Browser nicht verfügbar ist oder nicht funktioniert, den User darauf hinweisen und fragen, wie fortgefahren werden soll.
4. Nach relevanten Layoutänderungen Desktop und Mobile kurz prüfen.
5. Unrelated Dateien nicht löschen oder zurücksetzen.
6. Der User möchte iterativ brainstormen und mocken, bevor final implementiert wird.
7. News-Artikel werden direkt in `mockups/news-data.js` und der jeweiligen statischen Detailseite gepflegt.
8. Die Website ist live: Vor jedem Push den vollständigen Production-Sicherheitsablauf aus diesem Dokument durchführen. Bei fehlgeschlagenen oder nicht möglichen Prüfungen nicht pushen.

Guter Startprompt für einen neuen Chat:

```text
Bitte lies zuerst PROJECT_CONTEXT.md. Wir arbeiten an der Road-to-Hawaii Landingpage im Ordner C:\Users\radem\Documents\Road to Hawaii. Aktueller Stand: mockups/landingpage-flow.html ist die Homepage, mockups/newsfeed.html ist die separate Newsfeed-Seite.
```
