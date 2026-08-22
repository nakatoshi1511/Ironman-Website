const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const projectRoot = path.join(__dirname, "..");

async function loadNewsData() {
  const source = fs.readFileSync(path.join(projectRoot, "mockups", "news-data.js"), "utf8");
  return import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
}

test("training recap exposes the supplied metadata, copy, responsive images, and captions", async () => {
  const { getArticleBySlug, newsArticles } = await loadNewsData();
  const slug = "ein-erstes-fazit-nach-vier-wochen-konzentrierter-vorbereitung";
  const article = getArticleBySlug(slug);

  assert.ok(article, "training recap must be available through the news data API");
  assert.equal(newsArticles[2].slug, slug, "the training recap must follow the two newer partner articles");
  assert.equal(article.url, `/news/${slug}`);
  assert.equal(article.title, "Ein erstes Fazit nach vier Wochen konzentrierter Vorbereitung");
  assert.equal(article.titleVariant, "compact");
  assert.equal(article.teaser, "Alles läuft nach Plan");
  assert.equal(article.category, "Training");
  assert.equal(article.dateLabel, "17.08.2026");
  assert.equal(article.dateTime, "2026-08-17");
  assert.equal(
    article.image,
    "../Bilder%20Landingpage/Newsfeed/Artikel%2006/training-fazit-schwimmen-web.jpg",
  );
  assert.equal(
    article.imageSrcset,
    "../Bilder%20Landingpage/Newsfeed/Artikel%2006/training-fazit-schwimmen-web-720.jpg 720w, ../Bilder%20Landingpage/Newsfeed/Artikel%2006/training-fazit-schwimmen-web.jpg 1600w",
  );
  assert.equal(article.imageAlt, "David beim Schwimmen unter Wasser");
  assert.deepEqual(article.blocks.map((block) => block.type), [
    "paragraph",
    "media",
    "paragraph",
    "paragraph",
    "paragraph",
    "paragraph",
    "paragraph",
    "paragraph",
    "media",
    "paragraph",
    "paragraph",
    "paragraph",
    "gallery",
  ]);
  assert.equal(
    article.blocks[0].text,
    "Am 20.07.2026 habe ich mit meiner konzentrierten 12-Wochen Vorbereitung auf die Ironman Weltmeisterschaft begonnen und ich kann nach dem ersten vierwöchigen Trainingsblock ein positives Fazit ziehen. ",
  );
  assert.equal(article.blocks[1].caption, "Trainingsplanung mit dem Trainer ");
  assert.equal(article.blocks[8].caption, "Das Schwimmtraining bleibt die größte Baustelle");
  assert.equal(article.blocks[12].variant, "collection");
  assert.equal(article.blocks[12].lightboxGroup, "training-fazit-sammlung");
  assert.deepEqual(
    article.blocks[12].images.map((image) => image.caption),
    [
      "Die Hitze ist diesen Sommer wirklich brutal",
      "Meistens gute Laune beim Radfahren",
      "Bahntraining",
      "Der Cop, der Hawaii bezwingen will",
    ],
  );
  assert.equal(
    article.blocks[12].images[2].imageSrcset,
    "../Bilder%20Landingpage/Newsfeed/Artikel%2006/bahntraining-web-720.jpg 720w, ../Bilder%20Landingpage/Newsfeed/Artikel%2006/bahntraining-web.jpg 1179w",
  );
});

test("training recap keeps originals out of delivery and uses quality-checked derivatives", () => {
  const articleFolder = path.join(projectRoot, "Bilder Landingpage", "Newsfeed", "Artikel 06");
  const originals = [
    "IMG_0640.jpeg",
    "IMG_8861.jpeg",
    "IMG_9443.jpeg",
    "IMG_9524.png",
    "IMG_9995.jpeg",
    "Wochenspiegel.jpeg",
  ];
  const largeLimits = new Map([
    ["training-fazit-schwimmen-web.jpg", 700_000],
    ["wochenspiegel-artikel-web.jpg", 1_300_000],
    ["laufen-hitze-web.jpg", 900_000],
    ["bahntraining-web.jpg", 700_000],
    ["radfahren-web.jpg", 700_000],
    ["trainingsplanung-trainer-web.jpg", 700_000],
  ]);
  const mobileLimits = new Map([
    ["training-fazit-schwimmen-web-720.jpg", 200_000],
    ["wochenspiegel-artikel-web-720.jpg", 250_000],
    ["laufen-hitze-web-720.jpg", 200_000],
    ["bahntraining-web-720.jpg", 200_000],
    ["radfahren-web-720.jpg", 200_000],
    ["trainingsplanung-trainer-web-720.jpg", 200_000],
  ]);

  for (const filename of originals) {
    assert.ok(fs.statSync(path.join(articleFolder, filename)).size > 2_000_000);
  }
  for (const [filename, limit] of largeLimits) {
    assert.ok(fs.statSync(path.join(articleFolder, filename)).size <= limit, `${filename} exceeds its quality budget`);
  }
  for (const [filename, limit] of mobileLimits) {
    assert.ok(fs.statSync(path.join(articleFolder, filename)).size <= limit, `${filename} exceeds its mobile budget`);
  }
});
