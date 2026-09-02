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
  assert.equal(article.category, "Partner");
  assert.equal(article.dateLabel, "31.07.2026");
  assert.equal(article.dateTime, "2026-07-31");
  assert.equal(article.image, "../Bilder%20Landingpage/Newsfeed/Artikel%2004/Bild-web.jpg");
  assert.equal(
    article.imageSrcset,
    "../Bilder%20Landingpage/Newsfeed/Artikel%2004/Bild-web-720.jpg 720w, ../Bilder%20Landingpage/Newsfeed/Artikel%2004/Bild-web.jpg 1600w",
  );
  assert.equal(
    article.imageSizes,
    "(max-width: 560px) calc(100vw - 28px), (max-width: 880px) calc(100vw - 48px), (max-width: 1280px) 46vw, 600px",
  );
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
    image: "../Bilder%20Landingpage/Newsfeed/Artikel%2004/Bild-web.jpg",
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

  const sourceSize = fs.statSync(
    path.join(projectRoot, "Bilder Landingpage", "Newsfeed", "Artikel 04", "Bild.jpeg"),
  ).size;
  const largeWebSize = fs.statSync(
    path.join(projectRoot, "Bilder Landingpage", "Newsfeed", "Artikel 04", "Bild-web.jpg"),
  ).size;
  const mobileWebSize = fs.statSync(
    path.join(projectRoot, "Bilder Landingpage", "Newsfeed", "Artikel 04", "Bild-web-720.jpg"),
  ).size;
  assert.ok(sourceSize > 5_000_000, "the retained editorial source must remain untouched");
  assert.ok(largeWebSize <= 700_000, "the large web derivative must stay below 700 kB");
  assert.ok(mobileWebSize <= 200_000, "the mobile web derivative must stay below 200 kB");
});

test("article rich text wraps long external links inside narrow content columns", () => {
  const styles = fs.readFileSync(path.join(projectRoot, "mockups", "styles.css"), "utf8");

  assert.match(
    styles,
    /\.article-rich-text a\s*\{[^}]*overflow-wrap:\s*anywhere;[^}]*\}/,
  );
});

test("Newsfeed keeps compact tile headlines within the approved hierarchy", async () => {
  const { getArticleBySlug } = await loadNewsData();
  const article = getArticleBySlug("eisdiele-bortolot-als-partner-auf-dem-weg-nach-hawaii");
  const renderer = fs.readFileSync(path.join(projectRoot, "mockups", "newsfeed-render.js"), "utf8");
  const articleRenderer = fs.readFileSync(path.join(projectRoot, "mockups", "article-render.js"), "utf8");
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
  const projectContext = fs.readFileSync(path.join(projectRoot, "PROJECT_CONTEXT.md"), "utf8");

  assert.equal(article.titleVariant, "compact");
  assert.match(renderer, /article\.titleVariant === "compact"/);
  assert.match(renderer, /news-card-title-compact/);
  assert.match(detailPage, /<body class="[^"]*article-title-compact[^"]*">/);
  assert.match(detailPage, /styles\.css\?v=bortolot-title-2/);
  assert.match(newsfeedPage, /styles\.css\?v=news-headlines-2/);
  assert.match(newsfeedPage, /newsfeed-render\.js\?v=news-14/);
  assert.match(detailPage, /article-render\.js\?v=article-17/);
  assert.match(renderer, /news-data\.js\?v=article-09-1/);
  assert.match(articleRenderer, /news-data\.js\?v=article-09-1/);
  assert.match(renderer, /image\.srcset = article\.imageSrcset/);
  assert.match(renderer, /image\.sizes = article\.imageSizes/);
  assert.match(articleRenderer, /image\.srcset = imageSrcset/);
  assert.match(articleRenderer, /image\.sizes = imageSizes/);
  assert.match(newsfeedPage, /family=IBM\+Plex\+Sans:wght@400;500;600/);
  assert.match(
    css,
    /\.feed-grid \.news-card p\s*\{[^}]*font-family:\s*"IBM Plex Sans",\s*sans-serif;[^}]*font-size:\s*clamp\(0\.98rem,\s*1\.45vw,\s*1\.08rem\);[^}]*font-weight:\s*500;[^}]*line-height:\s*1\.48;[^}]*letter-spacing:\s*-0\.005em;/s,
  );

  assert.match(
    css,
    /@media \(min-width: 881px\) \{\s*\.feed-grid \.news-card:not\(\.news-card-large\)\.news-card-title-compact h2\s*\{[^}]*font-size: 1\.25rem;[^}]*line-height: 1\.05;[^}]*overflow-wrap: normal;[^}]*word-break: normal;[^}]*hyphens: none;[^}]*\}\s*\.feed-grid \.news-card-large\.news-card-title-compact h2\s*\{[^}]*font-size: clamp\(2\.2rem, 3vw, 2\.8rem\);[^}]*line-height: 1;[^}]*overflow-wrap: normal;[^}]*word-break: normal;[^}]*hyphens: none;[^}]*\}\s*\.article-page\.article-title-compact \.article-hero h1\s*\{[^}]*font-size: clamp\(2\.6rem, 4\.5vw, 4\.8rem\);[^}]*line-height: 0\.96;[^}]*\}\s*\}/s,
  );
  assert.match(
    css,
    /@media \(max-width: 880px\) \{\s*\.article-page\.article-title-compact \.article-hero h1\s*\{[^}]*font-size: clamp\(2\.15rem, 10vw, 2\.55rem\);[^}]*line-height: 0\.95;[^}]*\}/s,
  );
  assert.match(
    css,
    /@media \(max-width: 560px\) \{[\s\S]*\.feed-grid \.news-card:not\(\.news-card-large\)\.news-card-title-compact h2\s*\{[^}]*font-size: 1rem;[^}]*line-height: 1\.05;[^}]*max-width: none;[^}]*overflow-wrap: normal;[^}]*word-break: normal;[^}]*hyphens: none;[^}]*\}/,
  );
  assert.match(
    css,
    /@media \(max-width: 560px\) \{[\s\S]*\.feed-grid \.news-card-large h2\s*\{[^}]*font-size: clamp\(1\.16rem, 5\.7vw, 1\.4rem\);[^}]*line-height: 1\.02;[^}]*max-width: none;[^}]*word-break: break-word;[^}]*\}/,
  );
  assert.match(projectContext, /bisher neueste Artikel nach seinem Wechsel in eine kleine Kachel/);
  assert.match(projectContext, /kleinen Kacheln dürfen weder auf Desktop noch bei `390px` oder `360px` mehr als drei Zeilen/);
  assert.match(projectContext, /breite Hauptkachel besitzt eine eigene Titeltypografie/);
});
