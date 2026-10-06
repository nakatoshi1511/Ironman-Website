const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const ignore = require("ignore");

const projectRoot = path.join(__dirname, "..");
const slug = "fazit-nach-10-wochen-vorbereitung";

async function loadNewsData() {
  const source = fs.readFileSync(path.join(projectRoot, "mockups", "news-data.js"), "utf8");
  return import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
}

test("Artikel 13 follows Artikel 14 with the supplied metadata, copy, and image order", async () => {
  const { getArticleBySlug, newsArticles } = await loadNewsData();
  const article = getArticleBySlug(slug);

  assert.ok(article);
  assert.equal(newsArticles[1].slug, slug);
  assert.equal(article.url, `/news/${slug}`);
  assert.equal(article.title, "Fazit nach 10 Wochen Vorbereitung");
  assert.equal(article.teaser, "Die Arbeit ist getan, jetzt nur noch konzentriert bleiben");
  assert.equal(article.category, "Training");
  assert.equal(article.dateLabel, "28.09.2026");
  assert.equal(article.dateTime, "2026-09-28");
  assert.equal(article.imageAlt, "");
  assert.equal(article.mediaCaption, "Leistungsdiagnostik in Köln");
  assert.equal(article.cardImagePosition, "50% 38%");
  assert.deepEqual(article.blocks.map((block) => block.type), [
    "paragraph",
    "media",
    "paragraph",
    "paragraph",
    "media",
    "media",
    "paragraph",
    "rich",
    "paragraph",
    "media",
    "media",
    "paragraph",
    "media",
    "media",
    "paragraph",
    "media",
  ]);
  assert.deepEqual(
    article.blocks.filter((block) => block.type === "media").map((block) => block.caption),
    [
      "Der Erkältung nochmal von der Schippe gesprungen",
      "Die Veranstaltung “Sterne des Sports”",
      "Interview",
      "Diagnostik Rad",
      "Diagnostik Lauf",
      "Lauftraining",
      "Schwimmtraining in bester Gesellschaft",
      "Meine Trainingsstunden der letzten Wochen",
    ],
  );
  assert.match(article.blocks[7].html, /https:\/\/www\.kurvenkreis\.de\/blog\/2026\/august\/ironman\//);
});

test("Artikel 13 keeps originals private and ships responsive quality-checked derivatives", () => {
  const folder = path.join(projectRoot, "Bilder Landingpage", "Newsfeed", "Artikel 13");
  const rules = ignore().add(fs.readFileSync(path.join(projectRoot, ".vercelignore"), "utf8"));
  const originals = [
    "Newsfeed 10 Wochen Fazit.docx",
    "Bild 1 Erkältung.HEIC",
    "Bild 2 LD.HEIC",
    "Bild 3 LD.HEIC",
    "Bild 4 Sterne.JPG",
    "Bild 5 Sterne .JPG",
    "Bild 6 Lauf.HEIC",
    "Bild 7 Schwimmen.HEIC",
    "Bild 8 Daten.jpg",
  ];
  const derivatives = new Map([
    ["erkaeltung-web.jpg", 700_000],
    ["erkaeltung-web-720.jpg", 200_000],
    ["leistungsdiagnostik-rad-web.jpg", 700_000],
    ["leistungsdiagnostik-rad-web-720.jpg", 200_000],
    ["leistungsdiagnostik-lauf-web.jpg", 700_000],
    ["leistungsdiagnostik-lauf-web-720.jpg", 200_000],
    ["sterne-des-sports-gruppe-web.jpg", 700_000],
    ["sterne-des-sports-gruppe-web-720.jpg", 200_000],
    ["sterne-des-sports-interview-web.jpg", 700_000],
    ["sterne-des-sports-interview-web-720.jpg", 200_000],
    ["lauftraining-web.jpg", 700_000],
    ["lauftraining-web-720.jpg", 200_000],
    ["schwimmtraining-web.jpg", 700_000],
    ["schwimmtraining-web-720.jpg", 200_000],
    ["trainingsstunden-web.jpg", 200_000],
    ["trainingsstunden-web-720.jpg", 100_000],
  ]);

  for (const filename of originals) {
    assert.ok(fs.existsSync(path.join(folder, filename)), `${filename} must remain as a source file`);
    const relativePath = path.posix.join("Bilder Landingpage/Newsfeed/Artikel 13", filename);
    assert.equal(rules.test(relativePath).ignored, true, `${filename} must stay private`);
  }
  for (const [filename, limit] of derivatives) {
    const filePath = path.join(folder, filename);
    assert.ok(fs.existsSync(filePath), `${filename} must exist`);
    assert.ok(fs.statSync(filePath).size <= limit, `${filename} exceeds its quality budget`);
    const relativePath = path.posix.join("Bilder Landingpage/Newsfeed/Artikel 13", filename);
    assert.equal(rules.test(relativePath).ignored, false, `${filename} must be deployable`);
  }
});

test("Artikel 13 exposes the clean route and current article bundle", () => {
  const html = fs.readFileSync(path.join(projectRoot, "mockups", `newsfeed-${slug}.html`), "utf8");

  assert.match(html, new RegExp(`data-article-slug="${slug}"`));
  assert.match(html, new RegExp(`https://www\\.roadtohawaii\\.de/news/${slug}`));
  assert.match(html, /article-render\.js\?v=article-20/);
});
