# Artikel 04 Bortolot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Den gelieferten Bortolot-Beitrag als neue erste Newsfeed-Kachel und vollständig erreichbare Detailseite integrieren.

**Architecture:** Der bestehende statische News-Aufbau bleibt unverändert: `news-data.js` liefert die Artikeldaten, `newsfeed-render.js` rendert die sortierte Kachel und `article-render.js` rendert dieselben Blocks auf einer statischen Detailseite. Saubere lokale und produktive Routen, Sitemap, Deployment-Grenze und bestehende Regressionstests werden gemeinsam erweitert.

**Tech Stack:** Statisches HTML/CSS, ES-Module im Browser, Node.js `node:test`, lokaler Node-Preview-Server, Vercel-Routen.

## Global Constraints

- Titel: `Die traditionsreiche Eisdiele Bortolot als Partner auf dem Weg nach Hawaii`
- Kategorie: `Road to Hawaii`
- Datum: `31.07.2026`
- Teaser: `Ein wenig olympischer Geist kann nicht schaden`
- Slug und Route: `eisdiele-bortolot-als-partner-auf-dem-weg-nach-hawaii`
- Bild: `Bilder Landingpage/Newsfeed/Artikel 04/Bild.jpeg`
- Bild-Alttext: `Stefano Bortolot und David`
- Bildunterschrift: `Mit der olympischen Fackel in der Hand`
- `31..07.2026` wird zu `31.07.2026` korrigiert.
- `Gelateria Fratelli Bortolot 1869` wird zu `Gelateria Fratelli Bortolot 1896` korrigiert.
- Alle übrigen gelieferten Inhalte bleiben unverändert; es werden keine neuen Aussagen oder Zwischenüberschriften erfunden.
- Das Bild erscheint nach dem ersten Absatz und öffnet die vorhandene Einzelbild-Lightbox.
- Die DOCX-Quelldatei darf in Git erhalten bleiben, muss aber durch die bestehende Vercel-Allowlist vom Deployment ausgeschlossen bleiben.
- Website-Änderungen werden erst nach vollständigem `npm test`, Desktop-/Mobile-Prüfung und Diff-Prüfung committed; es erfolgt kein Push.

---

### Task 1: Artikeldaten testgetrieben ergänzen

**Files:**
- Create: `tests/bortolot-article.test.js`
- Modify: `mockups/news-data.js`
- Modify: `mockups/newsfeed-render.js`
- Modify: `mockups/article-render.js`
- Modify: `mockups/newsfeed.html`
- Modify: `tests/news-gallery.test.js`
- Modify: `tests/news-rich-text.test.js`

**Interfaces:**
- Consumes: `getArticleBySlug(slug: string)` aus `mockups/news-data.js`.
- Produces: Artikelobjekt mit `slug`, `url`, `title`, `teaser`, `category`, `dateLabel`, `dateTime`, `image`, `imageAlt` und `blocks`.

- [x] **Step 1: Write the failing article-data test**

Create `tests/bortolot-article.test.js` with:

```js
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const projectRoot = path.join(__dirname, "..");

async function loadNewsData() {
  const source = fs.readFileSync(path.join(projectRoot, "mockups", "news-data.js"), "utf8");
  return import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
}

test("Bortolot article exposes the approved metadata, copy, image, and links", async () => {
  const { getArticleBySlug } = await loadNewsData();
  const article = getArticleBySlug("eisdiele-bortolot-als-partner-auf-dem-weg-nach-hawaii");

  assert.ok(article, "Bortolot article must be available through the news data API");
  assert.equal(article.url, "/news/eisdiele-bortolot-als-partner-auf-dem-weg-nach-hawaii");
  assert.equal(article.title, "Die traditionsreiche Eisdiele Bortolot als Partner auf dem Weg nach Hawaii");
  assert.equal(article.teaser, "Ein wenig olympischer Geist kann nicht schaden");
  assert.equal(article.category, "Road to Hawaii");
  assert.equal(article.dateLabel, "31.07.2026");
  assert.equal(article.dateTime, "2026-07-31");
  assert.equal(article.image, "../Bilder%20Landingpage/Newsfeed/Artikel%2004/Bild.jpeg");
  assert.equal(article.imageAlt, "Stefano Bortolot und David");
  assert.deepEqual(article.blocks.map((block) => block.type), [
    "paragraph",
    "media",
    "paragraph",
    "paragraph",
    "paragraph",
    "rich",
  ]);
  assert.equal(
    article.blocks[0].text,
    "Als ersten Partner auf meiner Road to Hawaii darf ich die Eisdiele meines Vertrauens, die Gelateria Fratelli Bortolot 1896, vorstellen.",
  );
  assert.deepEqual(article.blocks[1], {
    type: "media",
    image: "../Bilder%20Landingpage/Newsfeed/Artikel%2004/Bild.jpeg",
    imageAlt: "Stefano Bortolot und David",
    caption: "Mit der olympischen Fackel in der Hand",
  });
  assert.match(article.blocks[4].text, /Danke Stefano und dem gesamten Team Bortolot für euren Support!/);
  assert.match(article.blocks[5].html, /https:\/\/bortolot\.de\//);
  assert.match(article.blocks[5].html, /https:\/\/www\.wochenspiegellive\.de\/kreis-cochem-zell\/artikel\/die-bortolots-gehoeren-zu-cochem-wie-die-reichsburg-und-die-mosel/);
  assert.doesNotMatch(JSON.stringify(article), /31\.\.07\.2026|Bortolot 1869/);
});
```

- [x] **Step 2: Run the focused test and verify the missing article fails**

Run:

```powershell
node --test tests/bortolot-article.test.js
```

Expected: FAIL at `assert.ok(article)` because the slug does not exist yet.

- [x] **Step 3: Add the approved article object at the beginning of `newsArticles`**

Insert this object before the existing Podcast article in `mockups/news-data.js`:

```js
{
  slug: "eisdiele-bortolot-als-partner-auf-dem-weg-nach-hawaii",
  url: "/news/eisdiele-bortolot-als-partner-auf-dem-weg-nach-hawaii",
  title: "Die traditionsreiche Eisdiele Bortolot als Partner auf dem Weg nach Hawaii",
  teaser: "Ein wenig olympischer Geist kann nicht schaden",
  category: "Road to Hawaii",
  dateLabel: "31.07.2026",
  dateTime: "2026-07-31",
  image: "../Bilder%20Landingpage/Newsfeed/Artikel%2004/Bild.jpeg",
  imageAlt: "Stefano Bortolot und David",
  blocks: [
    {
      type: "paragraph",
      text: "Als ersten Partner auf meiner Road to Hawaii darf ich die Eisdiele meines Vertrauens, die Gelateria Fratelli Bortolot 1896, vorstellen.",
    },
    {
      type: "media",
      image: "../Bilder%20Landingpage/Newsfeed/Artikel%2004/Bild.jpeg",
      imageAlt: "Stefano Bortolot und David",
      caption: "Mit der olympischen Fackel in der Hand",
    },
    {
      type: "paragraph",
      text: "Erst vor wenigen Wochen feierte die traditionsreiche Eismacherfamilie ihr 130-jähriges Jubiläum 🎉",
    },
    {
      type: "paragraph",
      text: "Die Leidenschaft von Stefano Bortolot gilt nicht nur dem Speiseeis, sondern auch dem Sport. Er durfte bei den olympischen Winterspielen 2026 die Fackel tragen und war sofort Feuer und Flamme, als ich ihm vom Ironman Hawaii erzählt habe.",
    },
    {
      type: "paragraph",
      text: "Mit dieser echten Olympiafackel in den Händen und so viel olympischem Geist im Rücken ziehe ich voller Motivation weiter Richtung Kona. Danke Stefano und dem gesamten Team Bortolot für euren Support!",
    },
    {
      type: "rich",
      html: '<p>Hier findet ihr weitere Informationen:</p><ul><li><a href="https://bortolot.de/">https://bortolot.de/</a></li><li><a href="https://www.wochenspiegellive.de/kreis-cochem-zell/artikel/die-bortolots-gehoeren-zu-cochem-wie-die-reichsburg-und-die-mosel">https://www.wochenspiegellive.de/kreis-cochem-zell/artikel/die-bortolots-gehoeren-zu-cochem-wie-die-reichsburg-und-die-mosel</a></li></ul>',
    },
  ],
},
```

- [x] **Step 4: Update cache-buster contracts**

Apply these exact version changes:

```js
// mockups/newsfeed-render.js
import { newsArticles } from "./news-data.js?v=article-04-1";

// mockups/article-render.js
import { getArticleBySlug } from "./news-data.js?v=article-04-2";
```

```html
<!-- mockups/newsfeed.html -->
<script type="module" src="newsfeed-render.js?v=news-5"></script>
```

Update the exact replacement string in `tests/news-gallery.test.js` to:

```js
'import { getArticleBySlug } from "./news-data.js?v=article-04-2";'
```

Apply the same exact replacement-string update in `tests/news-rich-text.test.js`.

- [x] **Step 5: Run focused article and renderer tests**

Run:

```powershell
node --test tests/bortolot-article.test.js tests/news-gallery.test.js
```

Expected: all tests PASS.

---

### Task 2: Detailseite, saubere Routen und Veröffentlichungssicherheit ergänzen

**Files:**
- Create: `mockups/newsfeed-eisdiele-bortolot-als-partner-auf-dem-weg-nach-hawaii.html`
- Modify: `tools/local-preview-server.js`
- Modify: `tests/local-preview-server.test.js`
- Modify: `vercel.json`
- Modify: `sitemap.xml`
- Modify: `tests/navigation-links.test.js`
- Modify: `tests/vercel-deployment-boundary.test.js`

**Interfaces:**
- Consumes: Slug `eisdiele-bortolot-als-partner-auf-dem-weg-nach-hawaii` und Artikeldaten aus Task 1.
- Produces: Öffentliche Route `/news/eisdiele-bortolot-als-partner-auf-dem-weg-nach-hawaii` sowie statische Detailseite mit `data-article-slug`.

- [x] **Step 1: Extend route and page expectations before implementation**

In `tests/navigation-links.test.js`, add the new page to `navigationPages` and this mapping:

```js
"mockups/newsfeed-eisdiele-bortolot-als-partner-auf-dem-weg-nach-hawaii.html": [
  "/#profil",
  "/#erfolge",
  "/#partner",
  "/#social-sponsoren",
  "/news",
],
```

In `tests/local-preview-server.test.js`, request the new route alongside the existing article requests and assert:

```js
assert.equal(bortolotArticle.statusCode, 200);
assert.match(
  bortolotArticle.body,
  /data-article-slug="eisdiele-bortolot-als-partner-auf-dem-weg-nach-hawaii"/,
);
assert.match(bortolotArticle.body, /Die traditionsreiche Eisdiele Bortolot/);
assert.doesNotMatch(bortolotArticle.body, /data-article-teaser/);
```

In `tests/vercel-deployment-boundary.test.js`:

- Add the new HTML page to `productionPages` and `indexablePages`.
- Add this entry to `publicPathByPage`:

```js
"mockups/newsfeed-eisdiele-bortolot-als-partner-auf-dem-weg-nach-hawaii.html":
  "/news/eisdiele-bortolot-als-partner-auf-dem-weg-nach-hawaii",
```

- Add the exact legacy redirect:

```js
{
  src: "/mockups/newsfeed-eisdiele-bortolot-als-partner-auf-dem-weg-nach-hawaii\\.html",
  headers: { Location: "/news/eisdiele-bortolot-als-partner-auf-dem-weg-nach-hawaii" },
  status: 308,
},
```

- Add the exact rewrite:

```js
{
  src: "/news/eisdiele-bortolot-als-partner-auf-dem-weg-nach-hawaii",
  dest: "/mockups/newsfeed-eisdiele-bortolot-als-partner-auf-dem-weg-nach-hawaii.html",
},
```

- Change the expected Vercel route slices to `slice(1, 12)` for redirects and `slice(12, 20)` for rewrites.
- Add an assertion for the new URL in `mockups/news-data.js`.

- [x] **Step 2: Run route tests and verify they fail**

Run:

```powershell
node --test tests/navigation-links.test.js tests/local-preview-server.test.js tests/vercel-deployment-boundary.test.js
```

Expected: FAIL because the new HTML page and clean routes do not exist.

- [x] **Step 3: Create the static detail page**

Create `mockups/newsfeed-eisdiele-bortolot-als-partner-auf-dem-weg-nach-hawaii.html` using the existing Podcast page structure with:

```html
<title>Die traditionsreiche Eisdiele Bortolot als Partner auf dem Weg nach Hawaii</title>
<meta
  name="description"
  content="Als ersten Partner auf meiner Road to Hawaii darf ich die Eisdiele meines Vertrauens, die Gelateria Fratelli Bortolot 1896, vorstellen."
/>
<link
  rel="canonical"
  href="https://www.roadtohawaii.de/news/eisdiele-bortolot-als-partner-auf-dem-weg-nach-hawaii"
/>
<meta property="og:type" content="article" />
<meta property="og:locale" content="de_DE" />
<meta
  property="og:title"
  content="Die traditionsreiche Eisdiele Bortolot als Partner auf dem Weg nach Hawaii"
/>
<meta
  property="og:description"
  content="Als ersten Partner auf meiner Road to Hawaii darf ich die Eisdiele meines Vertrauens, die Gelateria Fratelli Bortolot 1896, vorstellen."
/>
<meta
  property="og:url"
  content="https://www.roadtohawaii.de/news/eisdiele-bortolot-als-partner-auf-dem-weg-nach-hawaii"
/>
<meta
  property="og:image"
  content="https://www.roadtohawaii.de/Bilder%20Landingpage/Newsfeed/Artikel%2004/Bild.jpeg"
/>
<meta property="og:image:alt" content="Stefano Bortolot und David" />
```

The visible article contract must be:

```html
<p class="article-meta" data-article-meta>Road to Hawaii · 31.07.2026</p>
<h1 data-article-title>Die traditionsreiche Eisdiele Bortolot als Partner auf dem Weg nach Hawaii</h1>
<article
  class="article-body"
  data-article-slug="eisdiele-bortolot-als-partner-auf-dem-weg-nach-hawaii"
></article>
<script type="module" src="article-render.js?v=article-10"></script>
```

Reuse the full current lightbox markup from the Podcast article, including previous/next/count controls kept `hidden`.

- [x] **Step 4: Add local and production routes**

Add to `tools/local-preview-server.js`:

```js
"/news/eisdiele-bortolot-als-partner-auf-dem-weg-nach-hawaii":
  "mockups/newsfeed-eisdiele-bortolot-als-partner-auf-dem-weg-nach-hawaii.html",
```

Add the same legacy redirect and rewrite from Step 1 to `vercel.json`, keeping redirects before rewrites and the final `{ "handle": "filesystem" }` unchanged.

Add to `sitemap.xml`:

```xml
<url>
  <loc>https://www.roadtohawaii.de/news/eisdiele-bortolot-als-partner-auf-dem-weg-nach-hawaii</loc>
</url>
```

- [x] **Step 5: Run route and publication tests**

Run:

```powershell
node --test tests/navigation-links.test.js tests/local-preview-server.test.js tests/vercel-deployment-boundary.test.js
```

Expected: all tests PASS, including deployable image and sitemap coverage; the DOCX remains excluded by `.vercelignore`.

---

### Task 3: Vollständige Funktions-, Browser- und Diff-Prüfung

**Files:**
- Modify: `mockups/styles.css`
- Modify: `mockups/newsfeed-eisdiele-bortolot-als-partner-auf-dem-weg-nach-hawaii.html`
- Modify: `tests/bortolot-article.test.js`
- Verify: `mockups/news-data.js`
- Verify: `mockups/newsfeed.html`
- Verify: `mockups/newsfeed-eisdiele-bortolot-als-partner-auf-dem-weg-nach-hawaii.html`
- Verify: `Bilder Landingpage/Newsfeed/Artikel 04/Bild.jpeg`
- Verify: `Bilder Landingpage/Newsfeed/Artikel 04/Kopie von Newsfeed Beitrag Vorlage.docx`
- Verify: all modified tests, routes, sitemap, and plan/spec files

**Interfaces:**
- Consumes: Complete implementation from Tasks 1 and 2.
- Produces: Verified local website change ready for one local commit; no push.

- [x] **Step 1: Run the complete automated suite**

Run:

```powershell
npm test
```

Expected: all tests PASS with zero failures.

- [x] **Step 2: Verify the Newsfeed on desktop in the visible In-App Browser**

Open `http://127.0.0.1:4173/news`, reload to clear the module cache, and verify:

- The Bortolot article is the first large card.
- Card metadata is `Road to Hawaii / 31.07.2026`.
- The title and teaser match exactly.
- `Bild.jpeg` loads successfully and shows Stefano Bortolot and David.
- Clicking the card opens the clean Bortolot route.
- No new console errors appear.

- [x] **Step 3: Verify the detail page on desktop**

At the clean article route, verify:

- `[data-article-slug]` contains four paragraph blocks, one media block, and one rich link block.
- The first paragraph precedes the media block.
- The image caption is `Mit der olympischen Fackel in der Hand`.
- The image opens and closes in the existing Lightbox.
- Both external links have the exact supplied destinations and open in a new tab.
- The back link returns to `/news`.
- The footer appears after the rendered article body.

- [x] **Step 4: Verify responsive layouts**

Use the In-App Browser viewport capability:

- At `390px`, verify navigation remains one line, the long title wraps cleanly, article text and image fit without horizontal overflow.
- At `360px`, repeat the title/navigation/overflow check.
- If a supplied URL exceeds the article width, add `overflow-wrap: anywhere` plus `word-break: break-word` to `.article-rich-text a`, add a focused CSS regression assertion to `tests/bortolot-article.test.js`, and repeat the responsive checks.
- Reset to a wide desktop viewport (for example `1280px`) before finishing.

- [x] **Step 5: Review the complete repository diff**

Run:

```powershell
git diff --check
git status --short --branch
git diff --stat
git diff
```

Confirm:

- The unrelated `mockups/nav-newsfeed-design-mockups.*` files remain untouched and untracked.
- No production file outside the article, route, sitemap, cache-buster, or relevant test scope changed.
- The delivered `Bild.jpeg` is included.
- The DOCX is included as the retained editorial source but remains excluded from Vercel deployment.

- [x] **Step 6: Create one local verified implementation commit**

Stage only the intended article files, source assets, routes, sitemap, render-version changes, tests, and this plan:

```powershell
git add -- `
  "Bilder Landingpage/Newsfeed/Artikel 04/Bild.jpeg" `
  "Bilder Landingpage/Newsfeed/Artikel 04/Kopie von Newsfeed Beitrag Vorlage.docx" `
  "docs/superpowers/plans/2026-07-30-artikel-04-bortolot.md" `
  "mockups/news-data.js" `
  "mockups/newsfeed-render.js" `
  "mockups/article-render.js" `
  "mockups/newsfeed.html" `
  "mockups/newsfeed-eisdiele-bortolot-als-partner-auf-dem-weg-nach-hawaii.html" `
  "tools/local-preview-server.js" `
  "vercel.json" `
  "sitemap.xml" `
  "tests/bortolot-article.test.js" `
  "tests/news-gallery.test.js" `
  "tests/navigation-links.test.js" `
  "tests/local-preview-server.test.js" `
  "tests/vercel-deployment-boundary.test.js"
git diff --cached --check
git diff --cached --stat
git commit -m "Add Bortolot partner news article"
```

Expected: one successful local commit containing only the verified implementation; do not push.
