const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const projectRoot = path.join(__dirname, "..");
const slug = "ollis-radladen-als-partner-auf-dem-weg-nach-hawaii";

async function loadNewsData() {
  const source = fs.readFileSync(path.join(projectRoot, "mockups", "news-data.js"), "utf8");
  return import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
}

test("Ollis Radladen is the new lead article with the supplied copy and image placement", async () => {
  const { getArticleBySlug, newsArticles } = await loadNewsData();
  const article = getArticleBySlug(slug);

  assert.ok(article);
  assert.equal(newsArticles[0].slug, slug);
  assert.equal(article.url, `/news/${slug}`);
  assert.equal(article.title, "Ollis Radladen als Partner auf dem dem Weg nach Hawaii");
  assert.equal(article.titleVariant, "compact");
  assert.equal(article.teaser, "Ollis Radladen, klein aber fein!");
  assert.equal(article.category, "Partner");
  assert.equal(article.dateLabel, "27.08.2026");
  assert.equal(article.dateTime, "2026-08-27");
  assert.equal(article.imageAlt, "Olli und ich vor dem Radladen");
  assert.match(article.imageSrcset, /olli-david-vor-radladen-web-720\.jpg 720w/);
  assert.deepEqual(article.blocks.map((block) => block.type), [
    "paragraph",
    "paragraph",
    "media",
    "paragraph",
    "rich",
    "media",
    "paragraph",
    "rich",
    "paragraph",
    "gallery",
  ]);

  const inlineImages = article.blocks.filter((block) => block.type === "media");
  assert.equal(inlineImages.length, 2);
  assert.deepEqual(
    inlineImages.map((block) => block.caption),
    ["Olli’s Radladen, klein aber fein!", "Ein Bikefitting ist die beste Investition"],
  );

  const gallery = article.blocks.at(-1);
  assert.equal(gallery.variant, "collection");
  assert.equal(gallery.lightboxGroup, "ollis-radladen-sammlung");
  assert.equal(gallery.images.length, 4);
  assert.deepEqual(gallery.lightboxImages, gallery.images.map((image) => image.image));
  assert.deepEqual(
    gallery.images.map((image) => image.caption),
    [
      "Olli bei der Feineinstellung meiner Schaltung",
      "Wieder was gelernt: Ich wusste nicht, dass Scheiben und Bremsbeläge eingebremst werden sollten.",
      "Eine große Auswahl an E-Bikes und normalen Fahrrädern",
      "Sogar Reiseräder sind im Sortiment vorhanden",
    ],
  );
  assert.match(article.blocks[7].html, /http:\/\/www\.ollis-radladen\.de/);
  assert.match(article.blocks[7].html, /http:\/\/www\.ferienhaeuser-brieden\.de/);
});

test("Artikel 09 keeps originals private and ships responsive quality-checked derivatives", () => {
  const folder = path.join(projectRoot, "Bilder Landingpage", "Newsfeed", "Artikel 09");
  const originals = [
    "IMG_0122.jpeg",
    "IMG_0140.jpeg",
    "IMG_0145.jpeg",
    "IMG_0154.jpeg",
    "IMG_0158.jpeg",
    "IMG_0167.jpeg",
  ];
  const large = [
    "ollis-radladen-bikefitting-web.jpg",
    "olli-feineinstellung-schaltung-web.jpg",
    "olli-scheibenbremsen-einbremsen-web.jpg",
    "ollis-radladen-fahrrad-auswahl-web.jpg",
    "olli-david-vor-radladen-web.jpg",
    "velotraum-reiseraeder-web.jpg",
  ];

  for (const filename of originals) {
    assert.ok(fs.statSync(path.join(folder, filename)).size > 3_000_000);
  }
  for (const filename of large) {
    assert.ok(fs.statSync(path.join(folder, filename)).size <= 900_000, `${filename} exceeds its quality budget`);
    const mobile = filename.replace(/\.jpg$/, "-720.jpg");
    assert.ok(fs.statSync(path.join(folder, mobile)).size <= 200_000, `${mobile} exceeds its mobile budget`);
  }
});

test("Ollis Radladen detail page uses the clean route, compact title, and current article bundle", () => {
  const html = fs.readFileSync(
    path.join(projectRoot, "mockups", `newsfeed-${slug}.html`),
    "utf8",
  );

  assert.match(html, new RegExp(`data-article-slug="${slug}"`));
  assert.match(html, /<body class="[^"]*article-title-compact[^"]*">/);
  assert.match(html, /article-render\.js\?v=article-17/);
  assert.match(html, new RegExp(`https://www\\.roadtohawaii\\.de/news/${slug}`));
});
