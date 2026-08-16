const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const rendererSource = fs.readFileSync(path.join(__dirname, "..", "mockups", "article-render.js"), "utf8");

class FakeElement {
  constructor(tagName) {
    this.tagName = tagName.toUpperCase();
    this.childNodes = [];
    this.dataset = {};
    this.src = "";
    this.alt = "";
    this.type = "";
    this._className = "";
  }

  set className(value) {
    this._className = value;
  }

  get className() {
    return this._className;
  }

  append(...nodes) {
    this.childNodes.push(...nodes);
  }

  removeAttribute(name) {
    delete this[name];
  }
}

class FakeDocument {
  createElement(tagName) {
    return new FakeElement(tagName);
  }

  querySelector() {
    return null;
  }
}

async function loadRendererExports() {
  const stubbedSource = rendererSource.replace(
    'import { getArticleBySlug } from "./news-data.js?v=article-05-2";',
    "const getArticleBySlug = () => null;",
  );

  const bootstrapDocument = new FakeDocument();
  const previousDocument = global.document;

  global.document = bootstrapDocument;

  try {
    return await import(`data:text/javascript;base64,${Buffer.from(stubbedSource).toString("base64")}`);
  } finally {
    global.document = previousDocument;
  }
}

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

test("renderer supports legacy article lightboxes without navigation controls", () => {
  const legacyArticle = fs.readFileSync(
    path.join(__dirname, "..", "mockups", "newsfeed-17-stunden-zum-ruhm.html"),
    "utf8",
  );

  assert.match(legacyArticle, /class="image-lightbox"/);
  assert.doesNotMatch(legacyArticle, /image-lightbox-(previous|next|count)/);
  assert.match(rendererSource, /if \(previousButton\) previousButton\.hidden = !isGrouped;/);
  assert.match(rendererSource, /if \(nextButton\) nextButton\.hidden = !isGrouped;/);
  assert.match(rendererSource, /if \(count\) \{\s+count\.hidden = !isGrouped;/);
  assert.match(rendererSource, /if \(previousButton\) \{/);
  assert.match(rendererSource, /if \(nextButton\) \{/);
});

test("Toskana lightbox controls start hidden until a grouped image opens", () => {
  const article = fs.readFileSync(
    path.join(__dirname, "..", "mockups", "newsfeed-trainingsauftakt-in-der-toskana.html"),
    "utf8",
  );

  assert.match(article, /class="image-lightbox-previous"[^>]* hidden/);
  assert.match(article, /class="image-lightbox-next"[^>]* hidden/);
  assert.match(article, /class="image-lightbox-count"[^>]* data-lightbox-count[^>]* hidden/);
  assert.match(article, /class="image-lightbox-previous"[^>]* hidden>←<\/button>/);
  assert.match(article, /class="image-lightbox-next"[^>]* hidden>→<\/button>/);
  assert.doesNotMatch(article, /Newsfeed\/UI\/news-lightbox-arrow/);
});

test("lightbox navigation uses thick CSS line arrows without a circular button treatment", () => {
  const styles = fs.readFileSync(path.join(__dirname, "..", "mockups", "styles.css"), "utf8");

  assert.match(styles, /\.image-lightbox-previous::before,\s*\.image-lightbox-next::before\s*\{[\s\S]*height: 3px;/);
  assert.match(styles, /\.image-lightbox-previous::after,\s*\.image-lightbox-next::after\s*\{[\s\S]*border-top: 3px solid currentColor;/);
});

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

test("createMedia uses its injected document for captions", async () => {
  const { createMedia } = await loadRendererExports();
  const documentRef = new FakeDocument();
  const media = createMedia({}, { type: "media", image: "01.jpeg", caption: "Caption" }, documentRef);

  assert.equal(media.childNodes[1].tagName, "FIGCAPTION");
  assert.equal(media.childNodes[1].textContent, "Caption");
});

test("Toskana article maps the approved main images and thumbnail groups", () => {
  const data = fs.readFileSync(path.join(__dirname, "..", "mockups", "news-data.js"), "utf8");
  const articleStart = data.indexOf('slug: "trainingsauftakt-in-der-toskana"');
  const articleEnd = data.indexOf("\n  {", articleStart + 1);
  const article = data.slice(articleStart, articleEnd);

  assert.match(article, /image: "\.\.\/Bilder%20Landingpage\/Newsfeed\/Artikel%2002\/02\.jpeg"/);
  assert.match(article, /images: \["\.\.\/Bilder%20Landingpage\/Newsfeed\/Artikel%2002\/01\.jpeg", "\.\.\/Bilder%20Landingpage\/Newsfeed\/Artikel%2002\/03\.jpeg", "\.\.\/Bilder%20Landingpage\/Newsfeed\/Artikel%2002\/04\.jpeg"\]/);
  assert.match(article, /image: "\.\.\/Bilder%20Landingpage\/Newsfeed\/Artikel%2002\/11\.jpeg"/);
  assert.match(article, /image: "\.\.\/Bilder%20Landingpage\/Newsfeed\/Artikel%2002\/15\.jpeg"/);
  assert.match(article, /images: \["\.\.\/Bilder%20Landingpage\/Newsfeed\/Artikel%2002\/10\.jpeg", "\.\.\/Bilder%20Landingpage\/Newsfeed\/Artikel%2002\/12\.jpeg", "\.\.\/Bilder%20Landingpage\/Newsfeed\/Artikel%2002\/13\.jpeg"\]/);
  assert.match(article, /image: "\.\.\/Bilder%20Landingpage\/Newsfeed\/Artikel%2002\/14\.jpeg"/);
  assert.match(article, /lightboxGroup: "mittelmosel"/);
  assert.match(article, /lightboxImages: \["\.\.\/Bilder%20Landingpage\/Newsfeed\/Artikel%2002\/02\.jpeg", "\.\.\/Bilder%20Landingpage\/Newsfeed\/Artikel%2002\/01\.jpeg", "\.\.\/Bilder%20Landingpage\/Newsfeed\/Artikel%2002\/03\.jpeg", "\.\.\/Bilder%20Landingpage\/Newsfeed\/Artikel%2002\/04\.jpeg"\]/);
  assert.match(article, /lightboxGroup: "toskana"/);
  assert.match(article, /lightboxImages: \["\.\.\/Bilder%20Landingpage\/Newsfeed\/Artikel%2002\/15\.jpeg", "\.\.\/Bilder%20Landingpage\/Newsfeed\/Artikel%2002\/10\.jpeg", "\.\.\/Bilder%20Landingpage\/Newsfeed\/Artikel%2002\/12\.jpeg", "\.\.\/Bilder%20Landingpage\/Newsfeed\/Artikel%2002\/13\.jpeg"\]/);
});

test("newsfeed design studies only render published article data", () => {
  const designMockups = fs.readFileSync(
    path.join(__dirname, "..", "mockups", "newsfeed-design-mockups.js"),
    "utf8",
  );
  const feedRenderer = fs.readFileSync(
    path.join(__dirname, "..", "mockups", "newsfeed-render.js"),
    "utf8",
  );

  assert.match(designMockups, /const designArticles = \[\.\.\.newsArticles\];/);
  assert.doesNotMatch(designMockups, /mock-training|mock-wettkampf|mock-partner|Design-Dummy/);
  assert.match(feedRenderer, /const feedArticles = \[\.\.\.newsArticles\];/);
  assert.doesNotMatch(feedRenderer, /placeholderArticles|Platzhalter:/);
});
