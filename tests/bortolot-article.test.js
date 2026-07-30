const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const projectRoot = path.join(__dirname, "..");

async function loadNewsData() {
  const source = fs.readFileSync(path.join(projectRoot, "mockups", "news-data.js"), "utf8");
  return import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
}

test("Bortolot article exposes the approved metadata, copy, image, and links", async () => {
  const { getArticleBySlug } = await loadNewsData();
  const article = getArticleBySlug("eisdiele-bortolot-als-partner-auf-dem-weg-nach-hawaii");

  assert.ok(article, "Bortolot article must be available through the news data API");
  assert.equal(article.url, "/news/eisdiele-bortolot-als-partner-auf-dem-weg-nach-hawaii");
  assert.equal(article.title, "Die traditionsreiche Eisdiele Bortolot als Partner auf dem Weg nach Hawaii");
  assert.equal(article.teaser, "Ein wenig olympischer Geist kann nicht schaden");
  assert.equal(article.category, "Road to Hawaii");
  assert.equal(article.dateLabel, "31.07.2026");
  assert.equal(article.dateTime, "2026-07-31");
  assert.equal(article.image, "../Bilder%20Landingpage/Newsfeed/Artikel%2004/Bild.jpeg");
  assert.equal(article.imageAlt, "Stefano Bortolot und David");
  assert.deepEqual(article.blocks.map((block) => block.type), [
    "paragraph",
    "media",
    "paragraph",
    "paragraph",
    "paragraph",
    "rich",
  ]);
  assert.equal(
    article.blocks[0].text,
    "Als ersten Partner auf meiner Road to Hawaii darf ich die Eisdiele meines Vertrauens, die Gelateria Fratelli Bortolot 1896, vorstellen.",
  );
  assert.deepEqual(article.blocks[1], {
    type: "media",
    image: "../Bilder%20Landingpage/Newsfeed/Artikel%2004/Bild.jpeg",
    imageAlt: "Stefano Bortolot und David",
    caption: "Mit der olympischen Fackel in der Hand",
  });
  assert.match(article.blocks[4].text, /Danke Stefano und dem gesamten Team Bortolot für euren Support!/);
  assert.match(article.blocks[5].html, /https:\/\/bortolot\.de\//);
  assert.match(
    article.blocks[5].html,
    /https:\/\/www\.wochenspiegellive\.de\/kreis-cochem-zell\/artikel\/die-bortolots-gehoeren-zu-cochem-wie-die-reichsburg-und-die-mosel/,
  );
  assert.doesNotMatch(JSON.stringify(article), /31\.\.07\.2026|Bortolot 1869/);
});

test("article rich text wraps long external links inside narrow content columns", () => {
  const styles = fs.readFileSync(path.join(projectRoot, "mockups", "styles.css"), "utf8");

  assert.match(
    styles,
    /\.article-rich-text a\s*\{[^}]*overflow-wrap:\s*anywhere;[^}]*\}/,
  );
});

test("Bortolot uses compact headlines only at the desktop breakpoint", async () => {
  const { getArticleBySlug } = await loadNewsData();
  const article = getArticleBySlug("eisdiele-bortolot-als-partner-auf-dem-weg-nach-hawaii");
  const renderer = fs.readFileSync(path.join(projectRoot, "mockups", "newsfeed-render.js"), "utf8");
  const detailPage = fs.readFileSync(
    path.join(
      projectRoot,
      "mockups",
      "newsfeed-eisdiele-bortolot-als-partner-auf-dem-weg-nach-hawaii.html",
    ),
    "utf8",
  );
  const newsfeedPage = fs.readFileSync(path.join(projectRoot, "mockups", "newsfeed.html"), "utf8");
  const css = fs.readFileSync(path.join(projectRoot, "mockups", "styles.css"), "utf8");

  assert.equal(article.titleVariant, "compact");
  assert.match(renderer, /article\.titleVariant === "compact"/);
  assert.match(renderer, /news-card-title-compact/);
  assert.match(detailPage, /<body class="[^"]*article-title-compact[^"]*">/);
  assert.match(detailPage, /styles\.css\?v=bortolot-title-1/);
  assert.match(newsfeedPage, /styles\.css\?v=bortolot-title-1/);
  assert.match(newsfeedPage, /newsfeed-render\.js\?v=news-6/);
  assert.match(renderer, /news-data\.js\?v=article-04-3/);

  assert.match(
    css,
    /@media \(min-width: 881px\) \{\s*\.feed-grid \.news-card-large\.news-card-title-compact h2\s*\{[^}]*font-size: clamp\(2\.1rem, 3\.3vw, 3\.5rem\);[^}]*line-height: 0\.98;[^}]*\}\s*\.article-page\.article-title-compact \.article-hero h1\s*\{[^}]*font-size: clamp\(2\.6rem, 4\.5vw, 4\.8rem\);[^}]*line-height: 0\.96;[^}]*\}\s*\}/s,
  );
});
