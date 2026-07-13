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
    'import { getArticleBySlug } from "./news-data.js";',
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
});
