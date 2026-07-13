# Grouped Lightbox Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add cyclic previous/next navigation to explicitly defined article image groups without mixing images from separate article sections.

**Architecture:** Article data explicitly assigns a `lightboxGroup` and `lightboxImages` list to the two grouped main-image blocks. The renderer copies that metadata to both the group main image and its thumbnails, while the existing lightbox derives the active group and index only from those attributes. The document lightbox gains accessible previous/next controls and a count; singleton images keep the current close-only behavior.

**Tech Stack:** Static HTML, browser-native ES modules, CSS, Node.js `node:test`.

## Global Constraints

- Group `mittelmosel` is exactly `02.jpeg`, `01.jpeg`, `03.jpeg`, `04.jpeg`, in that order.
- Group `toskana` is exactly `15.jpeg`, `10.jpeg`, `12.jpeg`, `13.jpeg`, in that order.
- `11.jpeg` remains a singleton; `14.jpeg` remains card-only.
- Do not infer or add captions, alt text, editorial labels, or additional image assignments.
- Existing Escape, backdrop, and close-button behavior remains available.
- Previous/next controls and the `1 / 4` count appear only for grouped images; navigation wraps cyclically at each end.
- Verify desktop and 390 px mobile in the visible in-app browser; reset the viewport before finalizing the browser tab.

---

### Task 1: Declare image groups and render their metadata

**Files:**
- Modify: `mockups/news-data.js:33-76`
- Modify: `mockups/article-render.js:103-154`
- Modify: `tests/news-gallery.test.js:60-104`

**Interfaces:**
- Consumes: article block fields `lightboxGroup?: string` and `lightboxImages?: string[]`.
- Produces: each grouped image button has `data-lightbox-group` and `data-lightbox-images` (a JSON string); singleton image buttons omit both attributes.
- Produces: `createMedia(articleData, block, documentRef = document)` and `createGallery(block, documentRef = document)` so renderer tests can pass a fake document.

- [ ] **Step 1: Write the failing renderer and data test**

  Extend `FakeElement` with `removeAttribute(name)` and add this test after the existing gallery test:

  ```js
  test("grouped media and thumbnails expose only their explicit lightbox group", async () => {
    const { createGallery, createMedia } = await loadRendererExports();
    const images = ["02.jpeg", "01.jpeg", "03.jpeg", "04.jpeg"];
    const documentRef = new FakeDocument();
    const main = createMedia({}, { type: "media", image: images[0], lightboxGroup: "mittelmosel", lightboxImages: images }, documentRef);
    const gallery = createGallery({ type: "gallery", images: images.slice(1), lightboxGroup: "mittelmosel", lightboxImages: images }, documentRef);
    const singleton = createMedia({}, { type: "media", image: "11.jpeg" }, documentRef);

    assert.deepEqual(
      [main.childNodes[0], ...gallery.childNodes].map((button) => ({
        source: button.dataset.lightboxSrc,
        group: button.dataset.lightboxGroup,
        images: button.dataset.lightboxImages,
      })),
      images.map((source) => ({ source, group: "mittelmosel", images: JSON.stringify(images) })),
    );
    assert.equal(singleton.childNodes[0].dataset.lightboxGroup, undefined);
    assert.equal(singleton.childNodes[0].dataset.lightboxImages, undefined);
  });
  ```

  Extend the existing Toskana mapping test with explicit group assertions:

  ```js
  assert.match(article, /lightboxGroup: "mittelmosel"/);
  assert.match(article, /lightboxImages: \["\.\.\/Bilder%20Landingpage\/Newsfeed\/Artikel%2002\/02\.jpeg", "\.\.\/Bilder%20Landingpage\/Newsfeed\/Artikel%2002\/01\.jpeg", "\.\.\/Bilder%20Landingpage\/Newsfeed\/Artikel%2002\/03\.jpeg", "\.\.\/Bilder%20Landingpage\/Newsfeed\/Artikel%2002\/04\.jpeg"\]/);
  assert.match(article, /lightboxGroup: "toskana"/);
  assert.match(article, /lightboxImages: \["\.\.\/Bilder%20Landingpage\/Newsfeed\/Artikel%2002\/15\.jpeg", "\.\.\/Bilder%20Landingpage\/Newsfeed\/Artikel%2002\/10\.jpeg", "\.\.\/Bilder%20Landingpage\/Newsfeed\/Artikel%2002\/12\.jpeg", "\.\.\/Bilder%20Landingpage\/Newsfeed\/Artikel%2002\/13\.jpeg"\]/);
  ```

- [ ] **Step 2: Run the focused test to verify it fails**

  Run: `node --test tests/news-gallery.test.js`

  Expected: FAIL because `createMedia` does not accept the fake document and no `data-lightbox-group` or `data-lightbox-images` values are created.

- [ ] **Step 3: Add only the approved group data and renderer attributes**

  In the `02.jpeg` media block and the following gallery block in `mockups/news-data.js`, add the same fields:

  ```js
  lightboxGroup: "mittelmosel",
  lightboxImages: [
    "../Bilder%20Landingpage/Newsfeed/Artikel%2002/02.jpeg",
    "../Bilder%20Landingpage/Newsfeed/Artikel%2002/01.jpeg",
    "../Bilder%20Landingpage/Newsfeed/Artikel%2002/03.jpeg",
    "../Bilder%20Landingpage/Newsfeed/Artikel%2002/04.jpeg",
  ],
  ```

  In the `15.jpeg` media block and its following gallery block, add:

  ```js
  lightboxGroup: "toskana",
  lightboxImages: [
    "../Bilder%20Landingpage/Newsfeed/Artikel%2002/15.jpeg",
    "../Bilder%20Landingpage/Newsfeed/Artikel%2002/10.jpeg",
    "../Bilder%20Landingpage/Newsfeed/Artikel%2002/12.jpeg",
    "../Bilder%20Landingpage/Newsfeed/Artikel%2002/13.jpeg",
  ],
  ```

  Replace the renderer functions with these complete versions:

  ```js
  function addLightboxMetadata(button, block) {
    if (!block.lightboxGroup || !Array.isArray(block.lightboxImages)) return;
    button.dataset.lightboxGroup = block.lightboxGroup;
    button.dataset.lightboxImages = JSON.stringify(block.lightboxImages);
  }

  function createMedia(articleData, block, documentRef = document) {
    const imageSrc = block.image || articleData.image;
    const imageAlt = block.imageAlt || articleData.imageAlt;
    const captionText = block.caption || articleData.mediaCaption;
    const figure = documentRef.createElement("figure");
    figure.className = "article-media article-media-inline";

    const button = documentRef.createElement("button");
    button.className = "article-image-button";
    button.type = "button";
    button.dataset.lightboxSrc = imageSrc;
    button.dataset.lightboxAlt = imageAlt;
    addLightboxMetadata(button, block);

    const image = documentRef.createElement("img");
    image.src = imageSrc;
    image.alt = imageAlt;

    const label = documentRef.createElement("span");
    label.textContent = "Bild vergrößern";
    button.append(image, label);
    figure.append(button);

    if (captionText) {
      const caption = documentRef.createElement("figcaption");
      caption.textContent = captionText;
      figure.append(caption);
    }

    return figure;
  }

  function createGallery(block, documentRef = document) {
    const gallery = documentRef.createElement("div");
    gallery.className = "article-media-gallery";

    (block.images || []).forEach((imageSrc) => {
      const button = documentRef.createElement("button");
      button.className = "article-gallery-thumb";
      button.type = "button";
      button.dataset.lightboxSrc = imageSrc;
      button.dataset.lightboxAlt = "";
      addLightboxMetadata(button, block);

      const image = documentRef.createElement("img");
      image.src = imageSrc;
      image.alt = "";
      button.append(image);
      gallery.append(button);
    });

    return gallery;
  }
  ```

- [ ] **Step 4: Run focused and full automated tests**

  Run: `node --test tests/news-gallery.test.js`

  Expected: PASS with the gallery mapping and metadata tests green.

  Run: `npm test`

  Expected: all tests PASS.

- [ ] **Step 5: Commit the data and renderer boundary**

  ```bash
  git add mockups/news-data.js mockups/article-render.js tests/news-gallery.test.js
  git commit -m "feat: group article images for lightbox navigation"
  ```

### Task 2: Add cyclic lightbox controls and responsive presentation

**Files:**
- Modify: `mockups/newsfeed-trainingsauftakt-in-der-toskana.html:41-47`
- Modify: `mockups/article-render.js:157-186`
- Modify: `mockups/styles.css:3030-3085`
- Modify: `tests/news-gallery.test.js:1-110`

**Interfaces:**
- Consumes: `data-lightbox-src`, optional `data-lightbox-group`, and optional JSON `data-lightbox-images` from Task 1.
- Produces: `getLightboxState(button)` returning `{ images, index, isGrouped }` and `getCyclicIndex(index, change, length)` returning a valid group index.
- Produces: `.image-lightbox-previous`, `.image-lightbox-next`, and `[data-lightbox-count]` controls in the article detail HTML.

- [ ] **Step 1: Write failing tests for group resolution and cyclic positions**

  Add two pure helper tests:

  ```js
  test("group lightbox state starts at the selected source and excludes other article images", async () => {
    const { getLightboxState } = await loadRendererExports();
    const state = getLightboxState({
      dataset: {
        lightboxSrc: "03.jpeg",
        lightboxGroup: "mittelmosel",
        lightboxImages: JSON.stringify(["02.jpeg", "01.jpeg", "03.jpeg", "04.jpeg"]),
      },
    });

    assert.deepEqual(state, {
      images: ["02.jpeg", "01.jpeg", "03.jpeg", "04.jpeg"],
      index: 2,
      isGrouped: true,
    });
  });

  test("lightbox navigation wraps only inside its active group", async () => {
    const { getCyclicIndex } = await loadRendererExports();
    assert.equal(getCyclicIndex(0, -1, 4), 3);
    assert.equal(getCyclicIndex(3, 1, 4), 0);
    assert.equal(getCyclicIndex(2, 1, 4), 3);
  });
  ```

- [ ] **Step 2: Run the focused test to verify it fails**

  Run: `node --test tests/news-gallery.test.js`

  Expected: FAIL because the two helpers are not exported.

- [ ] **Step 3: Add the controls and minimal lightbox state implementation**

  Insert the following controls inside `.image-lightbox-panel`, before the existing close button:

  ```html
  <button class="image-lightbox-previous" type="button" aria-label="Vorheriges Bild">←</button>
  <button class="image-lightbox-next" type="button" aria-label="Nächstes Bild">→</button>
  <span class="image-lightbox-count" data-lightbox-count aria-live="polite"></span>
  ```

  Add pure helpers in `mockups/article-render.js`:

  ```js
  function getLightboxState(button) {
    const images = JSON.parse(button.dataset.lightboxImages || "[]");
    const index = images.indexOf(button.dataset.lightboxSrc);
    return {
      images: index >= 0 ? images : [button.dataset.lightboxSrc],
      index: index >= 0 ? index : 0,
      isGrouped: index >= 0 && images.length > 1,
    };
  }

  function getCyclicIndex(index, change, length) {
    return (index + change + length) % length;
  }
  ```

  Replace `setupLightbox` with this implementation, keeping `closeLightbox` unchanged:

  ```js
  function setupLightbox() {
    const lightbox = document.querySelector(".image-lightbox");
    if (!lightbox) return;

    const lightboxImage = lightbox.querySelector("img");
    const previousButton = lightbox.querySelector(".image-lightbox-previous");
    const nextButton = lightbox.querySelector(".image-lightbox-next");
    const count = lightbox.querySelector("[data-lightbox-count]");
    const closeButtons = lightbox.querySelectorAll(".image-lightbox-backdrop, .image-lightbox-close");
    const imageButtons = document.querySelectorAll("[data-lightbox-src]");
    let activeImages = [];
    let activeIndex = 0;
    let activeAlt = "";

    function showActiveImage() {
      const isGrouped = activeImages.length > 1;
      lightboxImage.src = activeImages[activeIndex];
      lightboxImage.alt = activeAlt;
      previousButton.hidden = !isGrouped;
      nextButton.hidden = !isGrouped;
      count.hidden = !isGrouped;
      count.textContent = isGrouped ? `${activeIndex + 1} / ${activeImages.length}` : "";
    }

    imageButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const state = getLightboxState(button);
        activeImages = state.images;
        activeIndex = state.index;
        activeAlt = button.dataset.lightboxAlt || "";
        showActiveImage();
        lightbox.setAttribute("aria-hidden", "false");
        document.body.classList.add("lightbox-open");
      });
    });

    previousButton.addEventListener("click", () => {
      activeIndex = getCyclicIndex(activeIndex, -1, activeImages.length);
      showActiveImage();
    });
    nextButton.addEventListener("click", () => {
      activeIndex = getCyclicIndex(activeIndex, 1, activeImages.length);
      showActiveImage();
    });
    closeButtons.forEach((button) => button.addEventListener("click", () => closeLightbox(lightbox, lightboxImage)));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && lightbox.getAttribute("aria-hidden") === "false") {
        closeLightbox(lightbox, lightboxImage);
      }
    });
  }
  ```

  Export the two helpers:

  ```js
  export { createGallery, createRichContent, getCyclicIndex, getLightboxState, sanitizeRichHtml };
  ```

  Add CSS that keeps controls inside the image panel and visible on dark overlay:

  ```css
  .image-lightbox-previous,
  .image-lightbox-next {
    position: absolute;
    top: 50%;
    z-index: 2;
    width: 44px;
    height: 44px;
    transform: translateY(-50%);
    border: 1px solid rgba(248, 244, 234, 0.35);
    border-radius: 50%;
    background: rgba(13, 17, 17, 0.82);
    color: #f8f4ea;
    cursor: pointer;
    font-size: 1.5rem;
  }

  .image-lightbox-previous { left: 12px; }
  .image-lightbox-next { right: 12px; }

  .image-lightbox-count {
    position: absolute;
    z-index: 2;
    right: 12px;
    bottom: 12px;
    padding: 6px 10px;
    border-radius: 4px;
    background: rgba(13, 17, 17, 0.82);
    color: #f8f4ea;
    font-size: 0.72rem;
    font-weight: 900;
    letter-spacing: 0.07em;
  }

  .image-lightbox-previous:focus-visible,
  .image-lightbox-next:focus-visible,
  .image-lightbox-close:focus-visible {
    outline: 3px solid var(--lava);
    outline-offset: 2px;
  }

  @media (max-width: 560px) {
    .image-lightbox-previous,
    .image-lightbox-next {
      width: 38px;
      height: 38px;
    }
  }
  ```

- [ ] **Step 4: Run automated verification**

  Run: `node --test tests/news-gallery.test.js`

  Expected: PASS with group resolution and cyclic navigation tests green.

  Run: `npm test`

  Expected: all tests PASS.

  Run: `git diff --check`

  Expected: no output.

- [ ] **Step 5: Verify in the visible in-app browser**

  Open or claim `http://127.0.0.1:4174/mockups/newsfeed-trainingsauftakt-in-der-toskana.html`, reload it, and verify:

  1. At 1280 px, opening `02.jpeg` shows `1 / 4`; clicking next changes to `01.jpeg`, and previous from `02.jpeg` wraps to `04.jpeg`.
  2. Opening `03.jpeg` begins at `3 / 4`, confirming the thumbnail opens its own position.
  3. Opening `15.jpeg` shows only the ordered set `15`, `10`, `12`, `13`; `11.jpeg` shows no arrows and no count.
  4. Close with Escape and the close control; the existing backdrop close still works.
  5. At 390 px, controls remain inside the viewport and no horizontal overflow occurs.

  Reset the viewport override and finalize the browser session with the verified article preview kept as the deliverable tab.

- [ ] **Step 6: Commit the lightbox controls and tests**

  ```bash
  git add mockups/article-render.js mockups/newsfeed-trainingsauftakt-in-der-toskana.html mockups/styles.css tests/news-gallery.test.js
  git commit -m "feat: navigate grouped lightbox images"
  ```
