const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const ignore = require("ignore");

const projectRoot = path.join(__dirname, "..");
const koelnSlug = "schnellster-amateur-ueber-die-mitteldistanz-beim-koeln-triathlon";
const steuerbueroSlug = "steuerbuero-berenz-und-burggraf-als-partner-auf-dem-weg-nach-hawaii";

async function loadNewsData() {
  const source = fs.readFileSync(path.join(projectRoot, "mockups", "news-data.js"), "utf8");
  return import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
}

test("Artikel 12 and 11 lead the feed with the supplied metadata and content order", async () => {
  const { getArticleBySlug, newsArticles } = await loadNewsData();
  const koeln = getArticleBySlug(koelnSlug);
  const steuerbuero = getArticleBySlug(steuerbueroSlug);

  assert.equal(newsArticles[1].slug, koelnSlug);
  assert.equal(newsArticles[2].slug, steuerbueroSlug);

  assert.equal(koeln.title, "Schnellster Amateur über die Mitteldistanz beim Köln Triathlon");
  assert.equal(koeln.teaser, "Die Form stimmt");
  assert.equal(koeln.category, "Wettkampf");
  assert.equal(koeln.dateLabel, "12.09.2026");
  assert.equal(koeln.dateTime, "2026-09-12");
  assert.equal(koeln.imageAlt, "");
  assert.equal(koeln.mediaCaption, "Zieleinlauf");
  assert.deepEqual(koeln.blocks.map((block) => block.type), [
    "paragraph",
    "media",
    "paragraph",
    "media",
    "paragraph",
    "media",
    "paragraph",
    "media",
    "paragraph",
    "media",
  ]);
  assert.deepEqual(
    koeln.blocks.filter((block) => block.type === "media").map((block) => block.caption),
    [
      "Zieleinlauf",
      "Die Laufstrecke führte am Kölner Dom vorbei",
      "Radfahren überwiegend in Aero-Position",
      "Die Unterstützung vor Ort",
      "Danke an das Subaru Autohaus Schaden",
    ],
  );

  assert.equal(steuerbuero.title, "Das Steuerbüro Berenz und Burggraf als Partner auf dem Weg nach Hawaii");
  assert.equal(steuerbuero.teaser, "");
  assert.equal(steuerbuero.category, "Partner");
  assert.equal(steuerbuero.dateLabel, "12.09.2026");
  assert.equal(steuerbuero.dateTime, "2026-09-12");
  assert.equal(steuerbuero.imageAlt, "");
  assert.deepEqual(steuerbuero.blocks.map((block) => block.type), ["paragraph", "paragraph", "rich", "media"]);
  assert.match(steuerbuero.blocks[2].html, /https:\/\/berenz-burggraf-stb\.de/);
});

test("Artikel 11 and 12 keep source files private and publish responsive derivatives", () => {
  const rules = ignore().add(fs.readFileSync(path.join(projectRoot, ".vercelignore"), "utf8"));
  const checks = [
    {
      folder: "Artikel 11",
      originals: ["Steeuerbürop Berenz und Burggraf.docx", "IMG_0691.jpeg"],
      derivatives: new Map([
        ["berenz-burggraf-partner-web.jpg", 900_000],
        ["berenz-burggraf-partner-web-720.jpg", 200_000],
      ]),
    },
    {
      folder: "Artikel 12",
      originals: [
        "Newsfeed Triathlon Köln.docx",
        "Köln Bild 1.JPG",
        "Köln Bild 2.JPG",
        "Köln Bild 3.JPG",
        "Köln Bild 4.JPG",
        "Köln Bild 5.HEIC",
      ],
      derivatives: new Map([
        ["koeln-zieleinlauf-web.jpg", 700_000],
        ["koeln-zieleinlauf-web-720.jpg", 200_000],
        ["koeln-dom-lauf-web.jpg", 700_000],
        ["koeln-dom-lauf-web-720.jpg", 200_000],
        ["koeln-radfahren-aero-web.jpg", 700_000],
        ["koeln-radfahren-aero-web-720.jpg", 200_000],
        ["koeln-unterstuetzung-web.jpg", 700_000],
        ["koeln-unterstuetzung-web-720.jpg", 200_000],
        ["koeln-autohaus-schaden-danke-web.jpg", 800_000],
        ["koeln-autohaus-schaden-danke-web-720.jpg", 200_000],
      ]),
    },
  ];

  for (const check of checks) {
    const folder = path.join(projectRoot, "Bilder Landingpage", "Newsfeed", check.folder);
    for (const filename of check.originals) {
      const filePath = path.join(folder, filename);
      const relativePath = path.posix.join("Bilder Landingpage/Newsfeed", check.folder, filename);
      assert.ok(fs.existsSync(filePath), `${filename} must remain available as a source file`);
      assert.equal(rules.test(relativePath).ignored, true, `${filename} must stay private`);
    }
    for (const [filename, limit] of check.derivatives) {
      const filePath = path.join(folder, filename);
      const relativePath = path.posix.join("Bilder Landingpage/Newsfeed", check.folder, filename);
      assert.ok(fs.existsSync(filePath), `${filename} must exist`);
      assert.ok(fs.statSync(filePath).size <= limit, `${filename} exceeds its quality budget`);
      assert.equal(rules.test(relativePath).ignored, false, `${filename} must be deployable`);
    }
  }
});

test("Artikel 11 and 12 expose clean detail pages and the current article bundle", () => {
  for (const slug of [koelnSlug, steuerbueroSlug]) {
    const html = fs.readFileSync(path.join(projectRoot, "mockups", `newsfeed-${slug}.html`), "utf8");
    assert.match(html, new RegExp(`data-article-slug="${slug}"`));
    assert.match(html, new RegExp(`https://www\\.roadtohawaii\\.de/news/${slug}`));
    assert.match(html, /article-render\.js\?v=article-19/);
  }
});
