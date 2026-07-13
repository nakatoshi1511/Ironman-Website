# News Article Thumbnail Galleries Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add compact, clickable thumbnail galleries below the specified Article 02 images without changing the main images or adding captions or alt text.

**Architecture:** Extend the article block model with a `gallery` block containing ordered image URLs. `article-render.js` renders each gallery as thumbnail buttons carrying the existing `data-lightbox-src` contract, so the current lightbox works without a second interaction system. CSS owns only the responsive gallery layout; `news-data.js` owns the exact image mapping.

**Tech Stack:** Static HTML, ES modules, CSS, Node.js built-in test runner, in-app browser.

## Global Constraints

- No captions, alt text, or other article content may be inferred or added without explicit user approval.
- `14.jpeg` remains only the Newsfeed card image.
- Gallery thumbnails open the existing lightbox and do not replace the main image.
- Verify desktop and 390px mobile layouts have no horizontal page overflow.

---

### Task 1: Add gallery block rendering with a failing runtime test

**Files:**
- Create: `tests/news-gallery.test.js`
- Modify: `mockups/article-render.js`

**Interfaces:**
- Consumes: `{ type: "gallery", images: string[] }` article blocks.
- Produces: `createGallery(block, documentRef)` returning a `.article-media-gallery` element with one `.article-gallery-thumb` button per source image.
- Reuses: the existing `setupLightbox()` listener for every button with `data-lightbox-src`.

- [ ] **Step 1: Write the failing test**

Create `tests/news-gallery.test.js`. Reuse the minimal fake-DOM pattern in `tests/news-rich-text.test.js`, adding `dataset`, `src`, `alt`, and `type` properties to `FakeElement`. Load `article-render.js` through a `data:` module import after replacing its `news-data.js` import with a stub. The test must expect the new export and the exact button/image structure:

```js
test("createGallery renders ordered thumbnail buttons for the existing lightbox", async () => {
  const { createGallery } = await loadRendererExports();
  const gallery = createGallery(
    { type: "gallery", images: ["01.jpeg", "03.jpeg", "04.jpeg"] },
    new FakeDocument(),
  );

  assert.equal(gallery.className, "article-media-gallery");
  assert.equal(gallery.childNodes.length, 3);
  assert.deepEqual(
    gallery.childNodes.map((button) => ({
      className: button.className,
      type: button.type,
      lightboxSrc: button.dataset.lightboxSrc,
      lightboxAlt: button.dataset.lightboxAlt,
      imageSrc: button.childNodes[0].src,
      imageAlt: button.childNodes[0].alt,
    })),
    [
      { className: "article-gallery-thumb", type: "button", lightboxSrc: "01.jpeg", lightboxAlt: "", imageSrc: "01.jpeg", imageAlt: "" },
      { className: "article-gallery-thumb", type: "button", lightboxSrc: "03.jpeg", lightboxAlt: "", imageSrc: "03.jpeg", imageAlt: "" },
      { className: "article-gallery-thumb", type: "button", lightboxSrc: "04.jpeg", lightboxAlt: "", imageSrc: "04.jpeg", imageAlt: "" },
    ],
  );
});
```

- [ ] **Step 2: Run the new test and confirm it fails for the missing export**

Run: `npm test -- tests/news-gallery.test.js`

Expected: FAIL because `createGallery` is not exported.

- [ ] **Step 3: Implement the smallest gallery renderer**

In `mockups/article-render.js`, add this function next to `createMedia` and export it with the current renderer helpers:

```js
function createGallery(block, documentRef = document) {
  const gallery = documentRef.createElement("div");
  gallery.className = "article-media-gallery";

  (block.images || []).forEach((imageSrc) => {
    const button = documentRef.createElement("button");
    button.className = "article-gallery-thumb";
    button.type = "button";
    button.dataset.lightboxSrc = imageSrc;
    button.dataset.lightboxAlt = "";

    const image = documentRef.createElement("img");
    image.src = imageSrc;
    image.alt = "";

    button.append(image);
    gallery.append(button);
  });

  return gallery;
}
```

Add this dispatch branch before the generic paragraph fallback:

```js
if (block.type === "gallery") return createGallery(block);
```

Change the export statement to:

```js
export { createGallery, createRichContent, sanitizeRichHtml };
```

- [ ] **Step 4: Run the focused and full tests**

Run: `npm test -- tests/news-gallery.test.js`

Expected: PASS with the gallery test confirming source order and empty alt values.

Run: `npm test`

Expected: PASS with all existing tests and the new gallery test.

- [ ] **Step 5: Commit the test-first renderer change**

```bash
git add tests/news-gallery.test.js mockups/article-render.js
git commit -m "feat: add article gallery blocks"
```

### Task 2: Map Article 02 galleries and style them responsively

**Files:**
- Modify: `mockups/news-data.js`
- Modify: `mockups/styles.css`
- Modify: `mockups/newsfeed-trainingsauftakt-in-der-toskana.html`
- Test: `tests/news-gallery.test.js`

**Interfaces:**
- Consumes: `gallery` blocks provided by Task 1.
- Produces: two ordered thumbnail groups in the Toskana article.
- Reuses: the `.article-media-gallery` and `.article-gallery-thumb` classes from Task 1.

- [ ] **Step 1: Extend the failing test with the exact Article 02 mapping**

Add this source-level data test to `tests/news-gallery.test.js`:

```js
test("Toskana article maps the approved main images and thumbnail groups", () => {
  const data = fs.readFileSync(path.join(__dirname, "..", "mockups", "news-data.js"), "utf8");
  const articleStart = data.indexOf('slug: "trainingsauftakt-in-der-toskana"');
  const articleEnd = data.indexOf('\n  {', articleStart + 1);
  const article = data.slice(articleStart, articleEnd);

  assert.match(article, /image: "\.\.\/Bilder%20Landingpage\/Newsfeed\/Artikel%2002\/02\.jpeg"/);
  assert.match(article, /images: \["\.\.\/Bilder%20Landingpage\/Newsfeed\/Artikel%2002\/01\.jpeg", "\.\.\/Bilder%20Landingpage\/Newsfeed\/Artikel%2002\/03\.jpeg", "\.\.\/Bilder%20Landingpage\/Newsfeed\/Artikel%2002\/04\.jpeg"\]/);
  assert.match(article, /image: "\.\.\/Bilder%20Landingpage\/Newsfeed\/Artikel%2002\/11\.jpeg"/);
  assert.match(article, /image: "\.\.\/Bilder%20Landingpage\/Newsfeed\/Artikel%2002\/15\.jpeg"/);
  assert.match(article, /images: \["\.\.\/Bilder%20Landingpage\/Newsfeed\/Artikel%2002\/10\.jpeg", "\.\.\/Bilder%20Landingpage\/Newsfeed\/Artikel%2002\/12\.jpeg", "\.\.\/Bilder%20Landingpage\/Newsfeed\/Artikel%2002\/13\.jpeg"\]/);
  assert.match(article, /image: "\.\.\/Bilder%20Landingpage\/Newsfeed\/Artikel%2002\/14\.jpeg"/);
});
```

- [ ] **Step 2: Run the mapping test and confirm it fails**

Run: `npm test -- tests/news-gallery.test.js`

Expected: FAIL because the `gallery` blocks and `11.jpeg` main-image block are not in the article data yet.

- [ ] **Step 3: Update Article 02 image blocks without adding content**

In `mockups/news-data.js`:

1. Keep `02.jpeg` as the first main media block, then insert:

```js
{ type: "gallery", images: ["../Bilder%20Landingpage/Newsfeed/Artikel%2002/01.jpeg", "../Bilder%20Landingpage/Newsfeed/Artikel%2002/03.jpeg", "../Bilder%20Landingpage/Newsfeed/Artikel%2002/04.jpeg"] },
```

2. Insert this main media block directly after the first paragraph in the Toskana section:

```js
{ type: "media", image: "../Bilder%20Landingpage/Newsfeed/Artikel%2002/11.jpeg" },
```

3. Keep the existing `15.jpeg` main media block in place and insert immediately after it:

```js
{ type: "gallery", images: ["../Bilder%20Landingpage/Newsfeed/Artikel%2002/10.jpeg", "../Bilder%20Landingpage/Newsfeed/Artikel%2002/12.jpeg", "../Bilder%20Landingpage/Newsfeed/Artikel%2002/13.jpeg"] },
```

4. Keep `14.jpeg` only in the article-level `image` field for the Newsfeed card.

5. Do not add `caption`, `mediaCaption`, `imageAlt`, or thumbnail labels to these new blocks.

- [ ] **Step 4: Add focused responsive gallery styling**

Append these rules near `.article-media-inline` in `mockups/styles.css`:

```css
.article-media-gallery {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  width: min(100%, 380px);
  margin: -30px auto clamp(26px, 5vw, 48px);
}

.article-gallery-thumb {
  min-width: 0;
  padding: 0;
  overflow: hidden;
  border: 1px solid rgba(34, 48, 65, 0.18);
  border-radius: 8px;
  background: transparent;
  cursor: zoom-in;
}

.article-gallery-thumb img {
  aspect-ratio: 1;
  width: 100%;
  display: block;
  object-fit: cover;
}

.article-gallery-thumb:focus-visible {
  outline: 3px solid var(--lava);
  outline-offset: 2px;
}

@media (max-width: 560px) {
  .article-media-gallery {
    gap: 8px;
    width: min(100%, 320px);
    margin-top: -20px;
  }
}
```

Update the Toskana detail page's `article-render.js` query string from `article-6` to `article-7` so the browser fetches the updated module.

- [ ] **Step 5: Run the mapping and full test suites**

Run: `npm test -- tests/news-gallery.test.js`

Expected: PASS with the approved image mapping and gallery-rendering checks.

Run: `npm test`

Expected: PASS with all tests.

- [ ] **Step 6: Verify in the in-app browser**

Open `http://127.0.0.1:4173/mockups/newsfeed-trainingsauftakt-in-der-toskana.html` and confirm:

1. Desktop at 1280px: main image 02 has thumbnails 01/03/04 below it; main image 11 follows the first Toskana paragraph; main image 15 has thumbnails 10/12/13 below it.
2. Click one thumbnail from each gallery and confirm the current lightbox opens with that image.
3. Mobile at 390px: both thumbnail rows remain three columns, are visible, and the page has no horizontal overflow.
4. `14.jpeg` remains only on the Newsfeed card.

- [ ] **Step 7: Commit the data, styles, and cache-version change**

```bash
git add mockups/news-data.js mockups/styles.css mockups/newsfeed-trainingsauftakt-in-der-toskana.html tests/news-gallery.test.js
git commit -m "feat: add Toskana image galleries"
```
