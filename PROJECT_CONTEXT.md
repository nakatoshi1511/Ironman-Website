# Road to Hawaii - Projektkontext

Diese Datei fasst den aktuellen Stand des Projekts zusammen und soll in neuen Chats zuerst gelesen werden.

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
   - Zielzeit im Code: `2026-10-10T07:00:00+02:00`
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
- statische Mockup-Seite
- Hero mit Navigation zurück zu den Homepage-Sektionen
- Kategorie-Chips:
  - Alle
  - Training
  - Wettkampf
  - Partner
  - Presse
- mehrere Beispielbeiträge mit vorhandenen Bildern

Spätere Ausbaustufe:
- dynamischer Newsfeed
- Admin-Panel
- Smartphone-taugliches Einpflegen von Beiträgen
- Beitragfelder:
  - Titel
  - Text
  - Bild
  - Kategorie
  - Datum
  - optional Link

## Wichtige Dateien

Mockups:
- `mockups/index.html`
- `mockups/styles.css`
- `mockups/landingpage-flow.html`
- `mockups/newsfeed.html`

Assets:
- Hero-Bild: `Bilder Landingpage/HeroV1.jpg`
- weiteres Bildmaterial: `Bilder Landingpage/`
- Roadmap-Bild: `Dokumente/Bilder/Roadmap-transparent.png`
- zusätzlich vorhanden: `RoadmapV2.png`

Screenshot-Export:
- Skript: `tools/export-mockup-screenshots.js`
- Doku: `docs/mockup-screenshot-export.md`
- Export-Ziel: `mockup-screenshots/`

Aktuelle Prüfbilder:
- `mockup-screenshots/landingpage-flow-desktop.png`
- `mockup-screenshots/landingpage-flow-mobile.png`
- `mockup-screenshots/newsfeed-desktop.png`
- `mockup-screenshots/newsfeed-mobile.png`
- `mockup-screenshots/structure-check.json`

## Lokaler Server

Mockups wurden zuletzt über diesen Server geprüft:

```powershell
& "C:\Users\radem\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" -m http.server 4173 --bind 127.0.0.1
```

Aktuelle URLs:
- Homepage: `http://127.0.0.1:4173/mockups/landingpage-flow.html`
- Newsfeed: `http://127.0.0.1:4173/mockups/newsfeed.html`
- Variantenübersicht: `http://127.0.0.1:4173/mockups/`

Vor Arbeiten immer prüfen, ob der Server/Port noch aktiv ist.

## Browser-, Mobile- und Layout-Workflow

Learnings aus der aktuellen Iteration:

- Der In-App-Browser soll für visuelle Änderungen aktiv genutzt werden.
- Vor visuellen Arbeiten immer die aktuelle lokale URL öffnen:
  `http://127.0.0.1:4173/mockups/landingpage-flow.html`
- Wenn der lokale Server nicht läuft, wieder mit Python auf Port `4173` starten.
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
3. Desktop-Zustand als Referenz ansehen.
4. Mobile-Zustand bei `390px` ansehen.
5. Gewünschte Änderung nur im passenden Bereich umsetzen:
   - Desktop-Regeln außerhalb der Media Query
   - Mobile-Regeln in `@media (max-width: 720px)` oder `@media (max-width: 560px)`
6. Browser-Verifikation machen:
   - Desktop: breite Ansicht, z. B. `1280px`
   - Mobile: `390px`, bei engen Stellen auch `360px`
7. Bei Bildwechseln im Browser `currentSrc` prüfen, nicht nur den HTML-Pfad.
8. Vor Commit `git status --short --branch` und `git diff --stat` prüfen.
9. Nur bewusst gewünschte Dateien committen.

## GitHub und Vercel Deployment

Das Projekt ist auf GitHub und Vercel veröffentlicht.

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

Typischer Update-Flow:

```powershell
git status --short --branch
git add <geänderte-dateien>
git commit -m "<kurze beschreibung>"
git push
```

Nach dem Push im Vercel Dashboard oder unter der Live-URL prüfen, ob das automatische Deployment durchgelaufen ist.

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

Wenn an diesem Projekt weitergearbeitet wird:

1. Diese Datei zuerst lesen.
2. `mockups/landingpage-flow.html` und `mockups/newsfeed.html` prüfen.
3. Bei visuellen Änderungen Browser oder Headless-Screenshots verwenden.
4. Nach relevanten Layoutänderungen Desktop und Mobile kurz prüfen.
5. Unrelated Dateien nicht löschen oder zurücksetzen.
6. Der User möchte iterativ brainstormen und mocken, bevor final implementiert wird.

Guter Startprompt für einen neuen Chat:

```text
Bitte lies zuerst PROJECT_CONTEXT.md. Wir arbeiten an der Road-to-Hawaii Landingpage im Ordner C:\Users\radem\Documents\Road to Hawaii. Aktueller Stand: mockups/landingpage-flow.html ist die Homepage, mockups/newsfeed.html ist die separate Newsfeed-Seite.
```
