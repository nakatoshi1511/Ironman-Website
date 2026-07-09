# Google Docs News Import Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow Google-Docs-authored news articles to be imported as controlled rich text while keeping the static newsfeed architecture.

**Architecture:** Keep `mockups/news-data.js` as the article source of truth and extend only the detail-page renderer to support rich HTML blocks. The Google Doc is an editorial draft, not a synced CMS source; Codex converts the draft into allowed article data when adding each article.

**Tech Stack:** Static HTML/CSS/ES modules, browser DOM APIs, Node `node:test`, local Python static server, In-App Browser verification.

## Global Constraints

- Google Docs is only the draft surface; there is no live sync, CMS, login, or admin workflow.
- Existing `lead`, `paragraph`, and `media` blocks must keep rendering unchanged.
- Rich text is limited to `p`, `br`, `h2`, `h3`, `strong`, `em`, `u`, `ul`, `ol`, `li`, and `a`.
- Links must be normalized so only safe `http:`, `https:`, `mailto:`, relative, and hash URLs render as links.
- Every new or changed article still needs desktop and mobile review.

---

## File Structure

- Modify `mockups/article-render.js`: add rich-block rendering, sanitize imported HTML, keep old block rendering compatible.
- Modify `mockups/styles.css`: add article styles for rich headings, lists, links, underline, and spacing.
- Modify `mockups/news-data.js`: add a small sample rich block to an existing article or the next imported article during implementation verification.
- Create `tests/news-rich-text.test.js`: static regression tests for allowed tags, blocked tags, safe links, and existing block compatibility.
- Optionally update `PROJECT_CONTEXT.md`: document that Google Docs is now the preferred article drafting workflow.

---

### Task 1: Add Rich-Text Sanitization And Rendering

**Files:**
- Modify: `mockups/article-render.js`
- Test: `tests/news-rich-text.test.js`

**Interfaces:**
- Consumes: article blocks with `{ type: "rich", html: string }`
- Produces: exported functions `sanitizeRichHtml(html, documentRef)` and `createRichContent(block, documentRef)` for testable rendering

- [ ] **Step 1: Write the failing test**

Create `tests/news-rich-text.test.js` with source-level checks that describe the behavior before implementation:

```js
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const rendererSource = fs.readFileSync(path.join(__dirname, "..", "mockups", "article-render.js"), "utf8");

test("article renderer exposes rich text block support", () => {
  assert.match(rendererSource, /type === "rich"/);
  assert.match(rendererSource, /sanitizeRichHtml/);
  assert.match(rendererSource, /createRichContent/);
});

test("article renderer documents the allowed rich text tags", () => {
  ["p", "br", "h2", "h3", "strong", "em", "u", "ul", "ol", "li", "a"].forEach((tagName) => {
    assert.match(rendererSource, new RegExp(`"${tagName}"`));
  });
});

test("article renderer rejects script and inline event attributes", () => {
  assert.doesNotMatch(rendererSource, /innerHTML\\s*=\\s*block\\.html/);
  assert.match(rendererSource, /removeAttribute/);
  assert.match(rendererSource, /on/i);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`

Expected: FAIL in `news-rich-text.test.js` because rich rendering functions do not exist yet.

- [ ] **Step 3: Implement the minimal renderer changes**

In `mockups/article-render.js`, add these helpers above the existing rendering functions:

```js
const allowedRichTags = new Set(["p", "br", "h2", "h3", "strong", "em", "u", "ul", "ol", "li", "a"]);
const safeLinkProtocols = new Set(["http:", "https:", "mailto:"]);

function isSafeHref(href) {
  if (!href) return false;
  if (href.startsWith("#") || href.startsWith("/") || href.startsWith("./") || href.startsWith("../")) return true;

  try {
    return safeLinkProtocols.has(new URL(href).protocol);
  } catch {
    return false;
  }
}

function sanitizeRichNode(node, documentRef) {
  if (node.nodeType === Node.TEXT_NODE) return documentRef.createTextNode(node.textContent || "");
  if (node.nodeType !== Node.ELEMENT_NODE) return documentRef.createTextNode("");

  const tagName = node.tagName.toLowerCase();
  const fragment = documentRef.createDocumentFragment();

  if (!allowedRichTags.has(tagName)) {
    node.childNodes.forEach((child) => fragment.append(sanitizeRichNode(child, documentRef)));
    return fragment;
  }

  const clean = documentRef.createElement(tagName);

  if (tagName === "a") {
    const href = node.getAttribute("href") || "";
    if (isSafeHref(href)) {
      clean.setAttribute("href", href);
      if (/^https?:/i.test(href)) {
        clean.setAttribute("target", "_blank");
        clean.setAttribute("rel", "noopener noreferrer");
      }
    }
  }

  node.childNodes.forEach((child) => clean.append(sanitizeRichNode(child, documentRef)));
  return clean;
}

function sanitizeRichHtml(html, documentRef = document) {
  const template = documentRef.createElement("template");
  template.innerHTML = html || "";

  const fragment = documentRef.createDocumentFragment();
  template.content.childNodes.forEach((child) => fragment.append(sanitizeRichNode(child, documentRef)));
  return fragment;
}

function createRichContent(block, documentRef = document) {
  const wrapper = documentRef.createElement("div");
  wrapper.className = "article-rich-text";
  wrapper.append(sanitizeRichHtml(block.html || "", documentRef));
  return wrapper;
}
```

Update the article body replacement to branch on rich blocks:

```js
articleRoot.replaceChildren(
  ...article.blocks.map((block) => {
    if (block.type === "media") return createMedia(article, block);
    if (block.type === "rich") return createRichContent(block);
    return createParagraph(block);
  }),
);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`

Expected: PASS for existing tests and `news-rich-text.test.js`.

- [ ] **Step 5: Commit**

```bash
git add mockups/article-render.js tests/news-rich-text.test.js
git commit -m "feat: render sanitized rich news article blocks"
```

---

### Task 2: Style Rich Article Content

**Files:**
- Modify: `mockups/styles.css`
- Test: In-App Browser desktop and mobile article page

**Interfaces:**
- Consumes: `.article-rich-text` wrappers from Task 1
- Produces: readable article typography for headings, lists, links, and inline emphasis

- [ ] **Step 1: Add a temporary rich block for visual verification**

In `mockups/news-data.js`, add this block after the first article lead for local verification:

```js
{
  type: "rich",
  html: '<h2>Test-Zwischenueberschrift</h2><p>Ein Absatz mit <strong>fetter Stelle</strong>, <em>Kursivtext</em>, <u>Unterstreichung</u> und <a href="https://example.com">Link</a>.</p><ul><li>Erster Listenpunkt</li><li>Zweiter Listenpunkt</li></ul>',
},
```

- [ ] **Step 2: Add CSS styles**

Append focused article styles near the existing `.article-body` rules in `mockups/styles.css`:

```css
.article-rich-text {
  display: grid;
  gap: 18px;
}

.article-rich-text h2,
.article-rich-text h3 {
  margin: 16px 0 0;
  font-family: "Barlow Condensed", sans-serif;
  line-height: 1.05;
  color: #172026;
}

.article-rich-text h2 {
  font-size: clamp(2rem, 4vw, 3rem);
}

.article-rich-text h3 {
  font-size: clamp(1.55rem, 3vw, 2.15rem);
}

.article-rich-text p,
.article-rich-text li {
  margin: 0;
  font-size: 1.04rem;
  line-height: 1.78;
  color: #303a3f;
}

.article-rich-text ul,
.article-rich-text ol {
  display: grid;
  gap: 10px;
  margin: 0;
  padding-left: 1.25rem;
}

.article-rich-text a {
  color: #b64a24;
  font-weight: 800;
  text-decoration: underline;
  text-underline-offset: 0.18em;
}

.article-rich-text strong {
  font-weight: 800;
}
```

- [ ] **Step 3: Verify desktop**

Run server if needed:

```powershell
& "C:\Users\radem\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" -m http.server 4173 --bind 127.0.0.1
```

Open in the In-App Browser:

`http://127.0.0.1:4173/mockups/newsfeed-17-stunden-zum-ruhm.html`

Expected: rich heading, paragraph, link, and list match the article design and do not overlap.

- [ ] **Step 4: Verify mobile**

Set browser viewport to `390px` if available, reload the same article, and inspect:

Expected: heading wraps cleanly, list indentation fits, link does not overflow, body text remains readable.

- [ ] **Step 5: Commit**

```bash
git add mockups/styles.css mockups/news-data.js
git commit -m "style: support rich news article typography"
```

---

### Task 3: Document The Google Docs Import Convention

**Files:**
- Modify: `PROJECT_CONTEXT.md`
- Create: `docs/news-google-docs-import.md`

**Interfaces:**
- Consumes: approved design in `docs/superpowers/specs/2026-07-09-google-docs-news-import-design.md`
- Produces: user-facing article drafting convention and future-agent instructions

- [ ] **Step 1: Create the workflow document**

Create `docs/news-google-docs-import.md`:

```md
# Google Docs News Import

Google Docs is the drafting surface for new Road-to-Hawaii news articles. It is not a CMS and does not sync automatically with the website.

## Recommended Document Shape

- Document title: article headline
- `Kategorie`: newsfeed category
- `Datum`: visible date, for example `13.07.2026`
- `Teaser`: short newsfeed teaser
- `Artikel`: full article content

Inside the article section, use normal Google Docs formatting:

- headings for sections
- paragraphs for body text
- bold, italic, and underline for emphasis
- bullet or numbered lists
- links
- image placeholder lines such as `Bild: trainingsauftakt-toskana-01.jpg`
- caption lines such as `Bildunterschrift: David beim Training in der Toskana`

## Import Rule

Codex converts the Google Doc into `mockups/news-data.js`. Rich article sections use `{ type: "rich", html: "..." }` blocks with only the supported tags from the renderer.

## Supported Rich Text

Supported tags are `p`, `br`, `h2`, `h3`, `strong`, `em`, `u`, `ul`, `ol`, `li`, and `a`.

Images remain normal `media` blocks so the existing lightbox behavior keeps working.
```

- [ ] **Step 2: Update project context**

Add a short note under the Newsfeed section in `PROJECT_CONTEXT.md`:

```md
Google-Docs-Import:
- Bevorzugter Workflow fuer neue Artikel: Der User schreibt in Google Docs vor und gibt Codex den Link oder Export.
- Google Docs ist nur Entwurf, keine automatische Synchronisierung und kein CMS.
- Detailartikel duerfen kontrollierte Rich-Text-Bloecke verwenden: `rich` mit erlaubtem HTML.
- Bilder bleiben als `media`-Bloecke im Projektordner `Bilder Landingpage/Newsfeed/Artikel XX/`.
```

- [ ] **Step 3: Run documentation checks**

Run:

```powershell
rg -n "Google Docs|rich|Newsfeed" PROJECT_CONTEXT.md docs/news-google-docs-import.md
```

Expected: both files mention the workflow and no line contains open-work markers.

- [ ] **Step 4: Commit**

```bash
git add PROJECT_CONTEXT.md docs/news-google-docs-import.md
git commit -m "docs: document google docs article import"
```

---

### Task 4: Convert The Next Google Doc Article

**Files:**
- Modify: `mockups/news-data.js`
- Create: `mockups/newsfeed-<slug>.html`
- Add assets under: `Bilder Landingpage/Newsfeed/Artikel XX/`
- Test: Newsfeed and article desktop/mobile

**Interfaces:**
- Consumes: Google Docs article draft from the user
- Produces: published static article data, card, detail page, and asset references

- [ ] **Step 1: Extract article metadata**

From the Google Doc, map:

```js
{
  slug: "derived-from-title",
  url: "newsfeed-derived-from-title.html",
  title: "Google Docs document title",
  teaser: "Teaser section text",
  category: "Kategorie section text",
  dateLabel: "Datum section text",
  dateTime: "YYYY-MM-DD",
  image: "../Bilder%20Landingpage/Newsfeed/Artikel%20XX/main-image.jpg",
  imageAlt: "short image description",
  mediaCaption: "caption text",
  blocks: []
}
```

- [ ] **Step 2: Convert content**

Use these block rules:

```js
// Short opening text:
{ type: "lead", text: "..." }

// Rich formatted text:
{ type: "rich", html: "<h2>...</h2><p>...</p><ul><li>...</li></ul>" }

// Images:
{ type: "media", image: "../Bilder%20Landingpage/Newsfeed/Artikel%20XX/file.jpg", imageAlt: "...", caption: "..." }
```

- [ ] **Step 3: Create detail page**

Copy the structure of `mockups/newsfeed-17-stunden-zum-ruhm.html`, update:

```html
<p class="article-meta" data-article-meta>Kategorie · Datum</p>
<h1 data-article-title>Artikel-Überschrift</h1>
<p data-article-teaser>Teaser</p>
<article class="article-body" data-article-slug="derived-from-title"></article>
```

- [ ] **Step 4: Run automated tests**

Run:

```powershell
npm test
```

Expected: all tests pass.

- [ ] **Step 5: Verify in browser**

Open:

```text
http://127.0.0.1:4173/mockups/newsfeed.html
http://127.0.0.1:4173/mockups/newsfeed-derived-from-title.html
```

Expected: the article card appears in the right date order; detail page has formatted headings/lists/links; images open in the lightbox.

- [ ] **Step 6: Commit**

```bash
git add mockups/news-data.js mockups/newsfeed-derived-from-title.html "Bilder Landingpage/Newsfeed/Artikel XX"
git commit -m "feat: add google docs news article"
```

---

## Self-Review

- Spec coverage: Google Docs as draft only, controlled rich text, existing block compatibility, image handling, desktop/mobile checks, and no CMS/live sync are covered.
- Placeholder scan: no open-work markers are present.
- Type consistency: rich block shape is consistently `{ type: "rich", html: string }`; existing block shapes remain unchanged.
