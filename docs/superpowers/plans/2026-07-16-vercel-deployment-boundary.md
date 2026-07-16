# Vercel Deployment Boundary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Vercel soll nur die produktive Website, ihre Laufzeitdateien, freigegebene Web-Assets und das Kontakt-API erhalten, während zukünftige Newsartikel, Newsbilder und Sponsorenlogos über feste Konventionen ohne einzelne Konfigurationsänderungen ergänzt werden können.

**Architecture:** Eine regelbasierte `.vercelignore` sperrt zunächst den gesamten Projekt-Root und erlaubt anschließend nur definierte Laufzeitbereiche. Ein Node-Test wertet dieselben Gitignore-Muster mit `git check-ignore` aus, prüft synthetische zukünftige Inhalte sowie alle lokalen Referenzen der aktiven Seiten und Newsdaten. Da lokal keine Vercel-CLI installiert ist, bleibt die tatsächliche Vercel-Dateiauswahl dem später ausdrücklich freizugebenden Preview-Schritt vorbehalten.

**Tech Stack:** Vercel `.vercelignore`, statisches HTML/CSS/ES-Module, Node.js `node:test`, Git.

## Global Constraints

- Standardmäßig darf keine neue Repository-Datei veröffentlicht werden.
- Zukünftige Artikelseiten verwenden `mockups/newsfeed-<slug>.html`.
- Newsbilder liegen unter `Bilder Landingpage/Newsfeed/` und Sponsorenlogos unter `Bilder Landingpage/Logos/`.
- In den erweiterbaren Asset-Bereichen sind nur `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif` und `.svg` unabhängig von der Groß-/Kleinschreibung freigegeben.
- DOCX-, ZIP-, sonstige PDF- und andere Quelldateien bleiben gesperrt.
- Nur `Dokumente/Partner- und Unterstuetzerkonzept_Road to Hawaii_David Simon.pdf` wird als PDF veröffentlicht.
- Bestehende öffentliche URLs und das sichtbare Website-Design ändern sich nicht.
- Kein Push, Preview-Deployment oder Production-Deployment gehört zu diesem Plan.
- Keine Projektabhängigkeit und keine Vercel-CLI werden installiert.

---

## Dateistruktur

- Create: `.vercelignore` — alleinige Vercel-Freigabe- und Sperrkonfiguration.
- Create: `tests/vercel-deployment-boundary.test.js` — prüft die Regelwirkung, Zukunftskonventionen und aktive lokale Referenzen.
- Modify: `PROJECT_CONTEXT.md` — dokumentiert die Veröffentlichungsgrenze und die Ablageregeln für neue Inhalte.

### Task 1: Testgetriebene Vercel-Freigabegrenze

**Files:**
- Create: `tests/vercel-deployment-boundary.test.js`
- Create: `.vercelignore`

**Interfaces:**
- Consumes: Gitignore-kompatible Regeln aus `.vercelignore`; aktive Seiten und `mockups/news-data.js`.
- Produces: `isDeploymentIgnored(relativePath): boolean` nur innerhalb des Tests sowie eine geprüfte Vercel-Dateigrenze.

- [ ] **Step 1: Failing Test für die Veröffentlichungsgrenze schreiben**

Create `tests/vercel-deployment-boundary.test.js`:

```js
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const test = require("node:test");

const projectRoot = path.join(__dirname, "..");
const vercelIgnorePath = path.join(projectRoot, ".vercelignore");

const productionPages = [
  "index.html",
  "mockups/landingpage-flow.html",
  "mockups/newsfeed.html",
  "mockups/newsfeed-17-stunden-zum-ruhm.html",
  "mockups/newsfeed-trainingsauftakt-in-der-toskana.html",
  "mockups/impressum.html",
  "mockups/datenschutz.html",
];

function read(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
}

function isDeploymentIgnored(relativePath) {
  assert.ok(fs.existsSync(vercelIgnorePath), ".vercelignore must exist");

  const excludesFile = vercelIgnorePath.replace(/\\/g, "/");
  const result = spawnSync(
    "git",
    [
      "-c",
      `core.excludesFile=${excludesFile}`,
      "check-ignore",
      "--no-index",
      "--quiet",
      "--",
      relativePath.replace(/\\/g, "/"),
    ],
    { cwd: projectRoot, encoding: "utf8" },
  );

  assert.ok(
    result.status === 0 || result.status === 1,
    `git check-ignore failed for ${relativePath}: ${result.stderr}`,
  );
  return result.status === 0;
}

function assertPublished(relativePath) {
  assert.equal(
    isDeploymentIgnored(relativePath),
    false,
    `${relativePath} must be included in the Vercel deployment`,
  );
}

function assertPrivate(relativePath) {
  assert.equal(
    isDeploymentIgnored(relativePath),
    true,
    `${relativePath} must be excluded from the Vercel deployment`,
  );
}

function toProjectPath(sourceFile, reference) {
  const withoutQuery = reference.split(/[?#]/, 1)[0].trim();
  if (
    !withoutQuery ||
    withoutQuery.startsWith("#") ||
    /^(?:https?:|mailto:|tel:|data:)/i.test(withoutQuery)
  ) {
    return null;
  }

  const decoded = decodeURIComponent(withoutQuery);
  const absolute = path.resolve(projectRoot, path.dirname(sourceFile), decoded);
  const relative = path.relative(projectRoot, absolute);
  assert.ok(!relative.startsWith(".."), `${reference} escapes the project root`);
  return relative.replace(/\\/g, "/");
}

function localHtmlReferences(sourceFile) {
  const html = read(sourceFile);
  const references = [];
  const attributePattern = /\b(?:href|src|srcset)=["']([^"']*)["']/gi;

  for (const match of html.matchAll(attributePattern)) {
    const relativePath = toProjectPath(sourceFile, match[1]);
    if (relativePath) references.push(relativePath);
  }

  return references;
}

test("publishes only the approved runtime surface", () => {
  const requiredRuntimeFiles = [
    ".vercelignore",
    ...productionPages,
    "mockups/styles.css",
    "mockups/news-data.js",
    "mockups/newsfeed-render.js",
    "mockups/article-render.js",
    "api/contact.js",
    "RoadmapV2.png",
    "Dokumente/Partner- und Unterstuetzerkonzept_Road to Hawaii_David Simon.pdf",
  ];

  for (const relativePath of requiredRuntimeFiles) assertPublished(relativePath);

  const privateFiles = [
    "PROJECT_CONTEXT.md",
    "package.json",
    ".env.example",
    "tests/contact.test.js",
    "tools/export-mockup-screenshots.js",
    "docs/news-google-docs-import.md",
    "mockups/index.html",
    "mockups/newsfeed-design-mockups.html",
    "mockups/countdown-designs.html",
    "mockups/sponsor-section-mockups.html",
    "Bilder Landingpage/Newsfeed/Artikel 02/Toskana.docx",
    "Dokumente/Bilder/WhatsApp Unknown 2026-07-01 at 11.38.35.zip",
    "Bilder Landingpage/IMG_0935.JPG",
  ];

  for (const relativePath of privateFiles) assertPrivate(relativePath);
});

test("accepts future articles and web images without exposing source files", () => {
  const futureRuntimeFiles = [
    "mockups/newsfeed-neuer-artikel.html",
    "Bilder Landingpage/Newsfeed/Artikel 03/neues-bild.webp",
    "Bilder Landingpage/Logos/Partner/Neuer Sponsor.svg",
  ];
  const futurePrivateFiles = [
    "Bilder Landingpage/Newsfeed/Artikel 03/entwurf.docx",
    "Bilder Landingpage/Newsfeed/Artikel 03/anlage.pdf",
    "Bilder Landingpage/Logos/Partner/notizen.txt",
  ];

  for (const relativePath of futureRuntimeFiles) assertPublished(relativePath);
  for (const relativePath of futurePrivateFiles) assertPrivate(relativePath);
});

test("keeps every active local page reference deployable", () => {
  for (const page of productionPages) {
    for (const reference of localHtmlReferences(page)) {
      assert.ok(fs.existsSync(path.join(projectRoot, reference)), `${page} references missing ${reference}`);
      assertPublished(reference);
    }
  }
});

test("keeps every news article page and image deployable", () => {
  const newsData = read("mockups/news-data.js");
  const articleUrls = [...newsData.matchAll(/\burl:\s*["']([^"']+)["']/g)].map(
    (match) => `mockups/${match[1]}`,
  );
  const newsImages = [...newsData.matchAll(/["'](\.\.\/Bilder%20Landingpage\/[^"']+)["']/g)].map(
    (match) => decodeURIComponent(match[1]).replace(/^\.\.\//, ""),
  );

  for (const relativePath of new Set(articleUrls)) {
    assert.ok(fs.existsSync(path.join(projectRoot, relativePath)), `missing article ${relativePath}`);
    assertPublished(relativePath);
  }
  for (const relativePath of new Set(newsImages)) {
    assert.ok(fs.existsSync(path.join(projectRoot, relativePath)), `missing news image ${relativePath}`);
    assertPublished(relativePath);
  }
});
```

- [ ] **Step 2: Test ausführen und erwartetes RED bestätigen**

Run:

```powershell
node --test tests/vercel-deployment-boundary.test.js
```

Expected: FAIL mit `.vercelignore must exist`. Der Fehler entsteht ausschließlich durch die noch fehlende Deployment-Konfiguration.

- [ ] **Step 3: Minimale regelbasierte `.vercelignore` implementieren**

Create `.vercelignore`:

```gitignore
# Deny every root path unless it is explicitly part of the production runtime.
/*

!.vercelignore
!index.html
!RoadmapV2.png
!vercel.json

!/api/
api/*
!api/contact.js

!/mockups/
mockups/*
!mockups/landingpage-flow.html
!mockups/newsfeed.html
!mockups/newsfeed-*.html
!mockups/impressum.html
!mockups/datenschutz.html
!mockups/styles.css
!mockups/news-data.js
!mockups/newsfeed-render.js
!mockups/article-render.js
mockups/newsfeed-design-mockups.html

!/Bilder Landingpage/
Bilder Landingpage/*
!Bilder Landingpage/Profilbild.jpg
!Bilder Landingpage/Zieleinlauf.JPG

!Bilder Landingpage/Hero/
Bilder Landingpage/Hero/*
!Bilder Landingpage/Hero/final-variants/
Bilder Landingpage/Hero/final-variants/*
!Bilder Landingpage/Hero/final-variants/hero-final-H-no-bars-clean-filter-warm-sunrise.jpg
!Bilder Landingpage/Hero/mobile-hero/
Bilder Landingpage/Hero/mobile-hero/*
!Bilder Landingpage/Hero/mobile-hero/road-to-hawaii-mobile-hero.jpg

!Bilder Landingpage/Logos/
Bilder Landingpage/Logos/**
!Bilder Landingpage/Logos/**/
!Bilder Landingpage/Logos/*.[jJ][pP][gG]
!Bilder Landingpage/Logos/**/*.[jJ][pP][gG]
!Bilder Landingpage/Logos/*.[jJ][pP][eE][gG]
!Bilder Landingpage/Logos/**/*.[jJ][pP][eE][gG]
!Bilder Landingpage/Logos/*.[pP][nN][gG]
!Bilder Landingpage/Logos/**/*.[pP][nN][gG]
!Bilder Landingpage/Logos/*.[wW][eE][bB][pP]
!Bilder Landingpage/Logos/**/*.[wW][eE][bB][pP]
!Bilder Landingpage/Logos/*.[aA][vV][iI][fF]
!Bilder Landingpage/Logos/**/*.[aA][vV][iI][fF]
!Bilder Landingpage/Logos/*.[sS][vV][gG]
!Bilder Landingpage/Logos/**/*.[sS][vV][gG]

!Bilder Landingpage/Newsfeed/
Bilder Landingpage/Newsfeed/**
!Bilder Landingpage/Newsfeed/**/
!Bilder Landingpage/Newsfeed/*.[jJ][pP][gG]
!Bilder Landingpage/Newsfeed/**/*.[jJ][pP][gG]
!Bilder Landingpage/Newsfeed/*.[jJ][pP][eE][gG]
!Bilder Landingpage/Newsfeed/**/*.[jJ][pP][eE][gG]
!Bilder Landingpage/Newsfeed/*.[pP][nN][gG]
!Bilder Landingpage/Newsfeed/**/*.[pP][nN][gG]
!Bilder Landingpage/Newsfeed/*.[wW][eE][bB][pP]
!Bilder Landingpage/Newsfeed/**/*.[wW][eE][bB][pP]
!Bilder Landingpage/Newsfeed/*.[aA][vV][iI][fF]
!Bilder Landingpage/Newsfeed/**/*.[aA][vV][iI][fF]
!Bilder Landingpage/Newsfeed/*.[sS][vV][gG]
!Bilder Landingpage/Newsfeed/**/*.[sS][vV][gG]

!/Dokumente/
Dokumente/*
!Dokumente/Partner- und Unterstuetzerkonzept_Road to Hawaii_David Simon.pdf
```

- [ ] **Step 4: Gezielten Test ausführen und GREEN bestätigen**

Run:

```powershell
node --test tests/vercel-deployment-boundary.test.js
```

Expected: 4 tests, 4 passed, 0 failed.

- [ ] **Step 5: Gesamte Test-Suite ausführen**

Run:

```powershell
node --test
```

Expected: alle bisherigen 27 Tests plus 4 neue Tests bestehen.

- [ ] **Step 6: Konfiguration und Test committen**

```powershell
git add -- .vercelignore tests/vercel-deployment-boundary.test.js
git commit -m "test: enforce vercel deployment boundary"
```

### Task 2: Zukunftskonventionen im Projektkontext dokumentieren

**Files:**
- Modify: `PROJECT_CONTEXT.md`

**Interfaces:**
- Consumes: die in Task 1 implementierte `.vercelignore`.
- Produces: verbindliche Pflegehinweise für zukünftige Artikel, Newsbilder und Sponsorenlogos.

- [ ] **Step 1: Abschnitt zur Deployment-Grenze ergänzen**

Add directly before `## GitHub und Vercel Deployment` in `PROJECT_CONTEXT.md`:

```markdown
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
```

- [ ] **Step 2: Dokumentationsdiff prüfen**

Run:

```powershell
git diff --check
git diff -- PROJECT_CONTEXT.md
```

Expected: nur der neue Abschnitt, keine Whitespace-Fehler und keine Änderung an bestehenden Projektregeln.

- [ ] **Step 3: Dokumentation committen**

```powershell
git add -- PROJECT_CONTEXT.md
git commit -m "docs: document production content conventions"
```

### Task 3: Automatisierte Grenze und lokale Laufzeit verifizieren

**Files:**
- Verify only; no tracked file changes expected.

**Interfaces:**
- Consumes: `.vercelignore` und alle aktiven Website-Dateien.
- Produces: Prüfnachweise für die Gitignore-kompatible Regelwirkung, die Node-Suite und lokale HTTP-Erreichbarkeit.

- [ ] **Step 1: JavaScript-Syntax und vollständige Tests prüfen**

Run:

```powershell
node --check api/contact.js
node --check mockups/news-data.js
node --check mockups/newsfeed-render.js
node --check mockups/article-render.js
node --test
```

Expected: alle Syntaxprüfungen ohne Ausgabe/Fehler; 31 Tests, 31 passed, 0 failed.

- [ ] **Step 2: Lokalen Server auf Port 4173 sicherstellen**

Run:

```powershell
if (-not (Get-NetTCPConnection -LocalPort 4173 -State Listen -ErrorAction SilentlyContinue)) {
  Start-Process -FilePath "C:\Users\radem\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" -ArgumentList "-m", "http.server", "4173", "--bind", "127.0.0.1" -WorkingDirectory "C:\Users\radem\Documents\Road to Hawaii" -WindowStyle Hidden
}
```

- [ ] **Step 3: Alle aktiven Seiten per HTTP prüfen**

Run:

```powershell
$paths = @(
  "/index.html",
  "/mockups/landingpage-flow.html",
  "/mockups/newsfeed.html",
  "/mockups/newsfeed-17-stunden-zum-ruhm.html",
  "/mockups/newsfeed-trainingsauftakt-in-der-toskana.html",
  "/mockups/impressum.html",
  "/mockups/datenschutz.html"
)
foreach ($path in $paths) {
  $response = Invoke-WebRequest -UseBasicParsing -Uri ("http://127.0.0.1:4173" + $path)
  if ($response.StatusCode -ne 200) { throw "$path returned $($response.StatusCode)" }
}
```

Expected: jede Seite liefert HTTP 200. Eine visuelle Browserprüfung ist nicht erforderlich, da keine sichtbaren Website-Dateien verändert wurden.

- [ ] **Step 4: Abschlussstatus prüfen**

Run:

```powershell
git status --short --branch
git log -4 --oneline --decorate
```

Expected: sauberer Branch `codex/security-hardening` mit dem Spec-, Plan-, Boundary- und Dokumentationscommit; kein Push und kein Deployment.
