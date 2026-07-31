# Bortolot Desktop Headlines Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce only the Bortolot headline size in the featured Newsfeed card and article hero on desktop while preserving the existing mobile typography.

**Architecture:** A semantic `titleVariant: "compact"` value in the Bortolot article data drives a reusable modifier class in the Newsfeed renderer. The static detail page declares the matching modifier on its body, and a single desktop-only CSS media query owns both compact typography rules.

**Tech Stack:** Static HTML/CSS, ES modules, Node.js `node:test`, visible in-app browser.

## Global Constraints

- Apply the compact treatment only to the Bortolot article.
- Apply it only at viewport widths of `881px` and above.
- Keep the supplied title text, uppercase treatment, condensed typeface, card proportions, image sizing, article content, navigation, and all mobile typography unchanged.
- Featured Newsfeed title: `clamp(2.1rem, 3.3vw, 3.5rem)` and `line-height: 0.98`.
- Detail-page hero title: `clamp(2.6rem, 4.5vw, 4.8rem)` and `line-height: 0.96`.
- Verify both affected pages in the visible in-app browser at desktop, `390px`, and `360px`.
- Do not push.

---

### Task 1: Add the compact desktop headline variant

**Files:**
- Modify: `tests/bortolot-article.test.js`
- Modify: `mockups/news-data.js`
- Modify: `mockups/newsfeed-render.js`
- Modify: `mockups/newsfeed.html`
- Modify: `mockups/newsfeed-eisdiele-bortolot-als-partner-auf-dem-weg-nach-hawaii.html`
- Modify: `mockups/styles.css`

**Interfaces:**
- Consumes: Bortolot article object returned by `getArticleBySlug(slug: string)`.
- Produces: Optional article field `titleVariant: "compact"` and rendered class `news-card-title-compact`.

- [x] **Step 1: Write the failing regression test**

Append this test to `tests/bortolot-article.test.js`:

```js
test("Bortolot uses compact headlines only at the desktop breakpoint", async () => {
  const { getArticleBySlug } = await loadNewsData();
  const article = getArticleBySlug("eisdiele-bortolot-als-partner-auf-dem-weg-nach-hawaii");
  const renderer = fs.readFileSync(path.join(projectRoot, "mockups", "newsfeed-render.js"), "utf8");
  const detailPage = fs.readFileSync(
    path.join(
      projectRoot,
      "mockups",
      "newsfeed-eisdiele-bortolot-als-partner-auf-dem-weg-nach-hawaii.html",
    ),
    "utf8",
  );
  const newsfeedPage = fs.readFileSync(path.join(projectRoot, "mockups", "newsfeed.html"), "utf8");
  const css = fs.readFileSync(path.join(projectRoot, "mockups", "styles.css"), "utf8");

  assert.equal(article.titleVariant, "compact");
  assert.match(renderer, /article\.titleVariant === "compact"/);
  assert.match(renderer, /news-card-title-compact/);
  assert.match(detailPage, /<body class="[^"]*article-title-compact[^"]*">/);
  assert.match(detailPage, /styles\.css\?v=bortolot-title-1/);
  assert.match(newsfeedPage, /styles\.css\?v=bortolot-title-1/);
  assert.match(newsfeedPage, /newsfeed-render\.js\?v=news-6/);
  assert.match(renderer, /news-data\.js\?v=article-04-3/);

  assert.match(
    css,
    /@media \(min-width: 881px\) \{\s*\.feed-grid \.news-card-large\.news-card-title-compact h2\s*\{[^}]*font-size: clamp\(2\.1rem, 3\.3vw, 3\.5rem\);[^}]*line-height: 0\.98;[^}]*\}\s*\.article-page\.article-title-compact \.article-hero h1\s*\{[^}]*font-size: clamp\(2\.6rem, 4\.5vw, 4\.8rem\);[^}]*line-height: 0\.96;[^}]*\}\s*\}/s,
  );
});
```

- [x] **Step 2: Run the focused test and verify the missing variant fails**

Run:

```powershell
node --test tests/bortolot-article.test.js
```

Expected: FAIL because `article.titleVariant` is currently `undefined`.

- [x] **Step 3: Add the semantic variant and renderer modifier**

In the Bortolot object in `mockups/news-data.js`, add:

```js
titleVariant: "compact",
```

After the existing `card.className` assignment in `createNewsCard()` in `mockups/newsfeed-render.js`, add:

```js
if (article.titleVariant === "compact") {
  card.classList.add("news-card-title-compact");
}
```

Change the import at the top of that file to:

```js
import { newsArticles } from "./news-data.js?v=article-04-3";
```

- [x] **Step 4: Add the detail modifier and cache busters**

In the Bortolot detail page, change the body class to:

```html
<body class="flow-page newsfeed-page article-page article-title-compact">
```

Change its stylesheet URL to:

```html
<link rel="stylesheet" href="styles.css?v=bortolot-title-1" />
```

In `mockups/newsfeed.html`, use:

```html
<link rel="stylesheet" href="styles.css?v=bortolot-title-1" />
<script type="module" src="newsfeed-render.js?v=news-6"></script>
```

- [x] **Step 5: Add the desktop-only compact typography**

Add this block after the base Newsfeed/article headline rules and before the existing maximum-width media queries in `mockups/styles.css`:

```css
@media (min-width: 881px) {
  .feed-grid .news-card-large.news-card-title-compact h2 {
    font-size: clamp(2.1rem, 3.3vw, 3.5rem);
    line-height: 0.98;
  }

  .article-page.article-title-compact .article-hero h1 {
    font-size: clamp(2.6rem, 4.5vw, 4.8rem);
    line-height: 0.96;
  }
}
```

- [x] **Step 6: Run the focused regression test**

Run:

```powershell
node --test tests/bortolot-article.test.js
```

Expected: both Bortolot tests PASS.

---

### Task 2: Verify desktop balance and unchanged mobile layouts

**Files:**
- Verify: `mockups/newsfeed.html`
- Verify: `mockups/newsfeed-eisdiele-bortolot-als-partner-auf-dem-weg-nach-hawaii.html`
- Verify: `mockups/styles.css`
- Verify: `mockups/newsfeed-render.js`
- Verify: `mockups/news-data.js`
- Verify: `tests/bortolot-article.test.js`
- Modify: `docs/superpowers/plans/2026-07-30-bortolot-desktop-headlines.md`

**Interfaces:**
- Consumes: Compact headline variant from Task 1.
- Produces: A verified local commit with desktop-only Bortolot typography.

- [x] **Step 1: Run the complete automated suite**

Run:

```powershell
npm test
```

Expected: all tests PASS with zero failures.

- [x] **Step 2: Verify the Newsfeed in the visible in-app browser**

Reload `http://127.0.0.1:4173/news` and verify:

- At a wide desktop viewport, the Bortolot title is visibly smaller and its copy column is approximately the same height as the visible image.
- The image dimensions and card grid dimensions are unchanged.
- At `390px` and `360px`, the existing mobile title size remains active and there is no horizontal overflow.

- [x] **Step 3: Verify the detail page in the visible in-app browser**

Reload `http://127.0.0.1:4173/news/eisdiele-bortolot-als-partner-auf-dem-weg-nach-hawaii` and verify:

- At a wide desktop viewport, the hero title is visibly smaller and wraps calmly.
- At `390px` and `360px`, the existing mobile headline presentation remains active.
- The article body, image, links, navigation, and footer still render correctly.
- Browser warnings and errors remain empty.

- [x] **Step 4: Review the final diff**

Run:

```powershell
git diff --check
git status --short --branch
git diff --stat
git diff
```

Confirm that only the approved headline variant, cache busters, regression test, and this plan changed.

- [x] **Step 5: Mark completed plan steps and create one local commit**

Change every completed checkbox in this plan from `[ ]` to `[x]`, then run:

```powershell
git add -- `
  "docs/superpowers/plans/2026-07-30-bortolot-desktop-headlines.md" `
  "tests/bortolot-article.test.js" `
  "mockups/news-data.js" `
  "mockups/newsfeed-render.js" `
  "mockups/newsfeed.html" `
  "mockups/newsfeed-eisdiele-bortolot-als-partner-auf-dem-weg-nach-hawaii.html" `
  "mockups/styles.css"
git diff --cached --check
git diff --cached --stat
git commit -m "Reduce Bortolot desktop headline sizes"
```

Expected: one successful local implementation commit; do not push.
