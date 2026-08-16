const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const projectRoot = path.join(__dirname, "..");

async function loadNewsData() {
  const source = fs.readFileSync(path.join(projectRoot, "mockups", "news-data.js"), "utf8");
  return import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
}

test("Powerhouse article exposes the supplied metadata, copy, images, captions, and link", async () => {
  const { getArticleBySlug } = await loadNewsData();
  const article = getArticleBySlug("powerhouse-maifeld-gym-als-partner-auf-dem-weg-nach-hawaii");

  assert.ok(article, "Powerhouse article must be available through the news data API");
  assert.equal(article.url, "/news/powerhouse-maifeld-gym-als-partner-auf-dem-weg-nach-hawaii");
  assert.equal(article.title, "Das Powerhouse Maifeld Gym als Partner auf dem Weg nach Hawaii");
  assert.equal(article.titleVariant, "compact");
  assert.equal(article.teaser, "Krafttraining macht auch für Triathleten Sinn");
  assert.equal(article.category, "Road to Hawaii");
  assert.equal(article.dateLabel, "15.08.2026");
  assert.equal(article.dateTime, "2026-08-15");
  assert.equal(
    article.image,
    "../Bilder%20Landingpage/Newsfeed/Artikel%2005/powerhouse-daniel-david-web.jpg",
  );
  assert.equal(
    article.imageSrcset,
    "../Bilder%20Landingpage/Newsfeed/Artikel%2005/powerhouse-daniel-david-web-720.jpg 720w, ../Bilder%20Landingpage/Newsfeed/Artikel%2005/powerhouse-daniel-david-web.jpg 1600w",
  );
  assert.equal(article.imageAlt, "Daniel Gietzen und David vor dem Powerhouse in Münstermaifeld");
  assert.deepEqual(article.blocks.map((block) => block.type), [
    "paragraph",
    "media",
    "paragraph",
    "paragraph",
    "media",
    "paragraph",
    "rich",
    "media",
  ]);
  assert.equal(
    article.blocks[0].text,
    "Als treuer Sponsor unseres Vereins RSC Untermosel darf ich das Powerhouse Maifeld Gym nun auch als Partner auf meiner road to Hawaii an Bord begrüßen.",
  );
  assert.equal(article.blocks[1].caption, "Ein starker Partner auf dem Weg nach Hawaii");
  assert.equal(article.blocks[4].imageAlt, "David macht Klimmzüge");
  assert.equal(article.blocks[4].caption, "Immerhin 11 Klimmzüge, ganz okay für einen Triathleten");
  assert.equal(
    article.blocks[4].imageSrcset,
    "../Bilder%20Landingpage/Newsfeed/Artikel%2005/powerhouse-klimmzuege-web-720.jpg 720w, ../Bilder%20Landingpage/Newsfeed/Artikel%2005/powerhouse-klimmzuege-web.jpg 1179w",
  );
  assert.match(article.blocks[6].html, /https:\/\/www\.powerhouse-maifeld-gym\.com\//);
  assert.equal(article.blocks[7].imageAlt, "Scheune");
  assert.equal(article.blocks[7].caption, "Mein Scheunen Gym");
  assert.equal(
    article.blocks[7].imageSrcset,
    "../Bilder%20Landingpage/Newsfeed/Artikel%2005/scheunen-gym-web-720.jpg 720w, ../Bilder%20Landingpage/Newsfeed/Artikel%2005/scheunen-gym-web.jpg 1600w",
  );
});

test("Powerhouse keeps originals out of delivery and uses quality-checked responsive derivatives", () => {
  const articleFolder = path.join(projectRoot, "Bilder Landingpage", "Newsfeed", "Artikel 05");
  const originals = ["IMG_9733.jpeg", "IMG_9737.jpeg", "IMG_9951.jpeg"];
  const largeDerivatives = [
    "powerhouse-daniel-david-web.jpg",
    "powerhouse-klimmzuege-web.jpg",
    "scheunen-gym-web.jpg",
  ];
  const mobileDerivatives = [
    "powerhouse-daniel-david-web-720.jpg",
    "powerhouse-klimmzuege-web-720.jpg",
    "scheunen-gym-web-720.jpg",
  ];

  for (const filename of originals) {
    assert.ok(fs.statSync(path.join(articleFolder, filename)).size > 500_000);
  }
  for (const filename of largeDerivatives) {
    assert.ok(fs.statSync(path.join(articleFolder, filename)).size <= 700_000, `${filename} must stay below 700 kB`);
  }
  for (const filename of mobileDerivatives) {
    assert.ok(fs.statSync(path.join(articleFolder, filename)).size <= 200_000, `${filename} must stay below 200 kB`);
  }
});
