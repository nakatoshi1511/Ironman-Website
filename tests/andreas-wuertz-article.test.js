const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const ignore = require("ignore");

const projectRoot = path.join(__dirname, "..");
const slug = "mein-trainer-andreas-wuertz-emh-coaching-als-partner-auf-dem-weg-nach-hawaii";

async function loadNewsData() {
  const source = fs.readFileSync(path.join(projectRoot, "mockups", "news-data.js"), "utf8");
  return import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
}

test("Andreas Würtz keeps the supplied metadata and copy", async () => {
  const { getArticleBySlug, newsArticles } = await loadNewsData();
  const article = getArticleBySlug(slug);

  assert.ok(article);
  assert.equal(newsArticles[3].slug, slug);
  assert.equal(article.url, `/news/${slug}`);
  assert.equal(article.title, "Mein Trainer Andreas Würtz (EMH-Coaching) als Partner auf dem Weg nach Hawaii");
  assert.equal(article.titleVariant, "compact");
  assert.equal(article.teaser, "Bei Andreas steht der Mensch im Vordergrund");
  assert.equal(article.category, "Partner");
  assert.equal(article.dateLabel, "08.09.2026");
  assert.equal(article.dateTime, "2026-09-08");
  assert.equal(article.imageAlt, "Andreas und ich nach dem Ironman Frankfurt 2025");
  assert.equal(article.cardImagePosition, "50% 34%");
  assert.match(article.imageSrcset, /andreas-david-ironman-frankfurt-web-720\.jpg 720w/);
  assert.deepEqual(article.blocks.map((block) => block.type), [
    "paragraph",
    "paragraph",
    "media",
    "paragraph",
    "paragraph",
    "media",
    "paragraph",
    "media",
    "paragraph",
    "rich",
    "media",
  ]);
  assert.deepEqual(
    article.blocks.filter((block) => block.type === "media").map((block) => block.caption),
    [
      "Andreas und ich zufrieden nach dem Ironman Frankfurt 2025",
      "Besprechung vor dem Wettkampf",
      "Unterstützung im Wettkampf",
      "Trainingsplanung an meinem Lieblingsort",
    ],
  );
  assert.match(article.blocks[9].html, /https:\/\/www\.emh-coaching\.de/);
});

test("Artikel 10 keeps source files private and ships responsive web derivatives", () => {
  const folder = path.join(projectRoot, "Bilder Landingpage", "Newsfeed", "Artikel 10");
  const rules = ignore().add(fs.readFileSync(path.join(projectRoot, ".vercelignore"), "utf8"));
  const originals = ["Newsfeed Andreas Würtz.docx", "Bild 1.JPG", "Bild 2.jpg", "Bild 3.JPG", "Bild 4.HEIC"];
  const largeLimits = new Map([
    ["andreas-david-ironman-frankfurt-web.jpg", 350_000],
    ["besprechung-vor-wettkampf-web.jpg", 250_000],
    ["unterstuetzung-im-wettkampf-web.jpg", 900_000],
    ["trainingsplanung-schwimmbad-web.jpg", 700_000],
  ]);
  const mobileLimits = new Map([
    ["andreas-david-ironman-frankfurt-web-720.jpg", 200_000],
    ["besprechung-vor-wettkampf-web-720.jpg", 200_000],
    ["unterstuetzung-im-wettkampf-web-720.jpg", 250_000],
    ["trainingsplanung-schwimmbad-web-720.jpg", 200_000],
  ]);

  for (const filename of originals) {
    assert.ok(fs.existsSync(path.join(folder, filename)), `${filename} must remain as a source file`);
    const relativePath = path.posix.join("Bilder Landingpage/Newsfeed/Artikel 10", filename);
    assert.equal(rules.test(relativePath).ignored, true, `${filename} must stay private`);
  }
  for (const [filename, limit] of [...largeLimits, ...mobileLimits]) {
    const filePath = path.join(folder, filename);
    assert.ok(fs.existsSync(filePath), `${filename} must exist`);
    assert.ok(fs.statSync(filePath).size <= limit, `${filename} exceeds its quality budget`);
    const relativePath = path.posix.join("Bilder Landingpage/Newsfeed/Artikel 10", filename);
    assert.equal(rules.test(relativePath).ignored, false, `${filename} must be deployable`);
  }
});

test("Andreas Würtz detail page uses the clean route and current article bundle", () => {
  const html = fs.readFileSync(path.join(projectRoot, "mockups", `newsfeed-${slug}.html`), "utf8");

  assert.match(html, new RegExp(`data-article-slug="${slug}"`));
  assert.match(html, /<body class="[^"]*article-title-compact[^"]*">/);
  assert.match(html, /article-title-extra-compact/);
  assert.match(html, /article-render\.js\?v=article-19/);
  assert.match(html, new RegExp(`https://www\\.roadtohawaii\\.de/news/${slug}`));
});
