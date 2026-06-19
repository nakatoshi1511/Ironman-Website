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
