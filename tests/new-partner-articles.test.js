const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const projectRoot = path.join(__dirname, "..");

async function loadNewsData() {
  const source = fs.readFileSync(path.join(projectRoot, "mockups", "news-data.js"), "utf8");
  return import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
}

test("the two new partner articles expose the supplied metadata, copy, links, and responsive images", async () => {
  const { getArticleBySlug, newsArticles } = await loadNewsData();
  const autohausSlug = "autohaus-schaden-subaru-als-exklusivpartner-auf-dem-weg-nach-hawaii";
  const zimmereiSlug = "zimmerei-schnorbach-als-partner-auf-dem-weg-nach-hawaii";
  const autohaus = getArticleBySlug(autohausSlug);
  const zimmerei = getArticleBySlug(zimmereiSlug);

  assert.equal(newsArticles[1].slug, autohausSlug, "Artikel 08 must follow the new lead card");
  assert.equal(newsArticles[2].slug, zimmereiSlug, "Artikel 07 must follow as a compact card");

  assert.ok(autohaus);
  assert.equal(autohaus.url, `/news/${autohausSlug}`);
  assert.equal(autohaus.title, "Das Autohaus Schaden Subaru als Exklusivpartner auf dem Weg nach Hawaii");
  assert.equal(autohaus.titleVariant, "compact");
  assert.equal(autohaus.teaser, "“Do your Dō“ - Gehe deinen eigenen Weg");
  assert.equal(autohaus.category, "Partner");
  assert.equal(autohaus.dateLabel, "22.08.2026");
  assert.equal(autohaus.dateTime, "2026-08-22");
  assert.equal(autohaus.imageAlt, "Bild im Autohaus Schaden");
  assert.match(autohaus.imageSrcset, /autohaus-schaden-team-web-720\.jpg 720w/);
  assert.deepEqual(autohaus.blocks.map((block) => block.type), [
    "paragraph",
    "paragraph",
    "media",
    "paragraph",
    "paragraph",
    "rich",
  ]);
  assert.equal(
    autohaus.blocks[2].caption,
    "Vielen Dank an Kirsten, Frank und das gesamte Team vom Autohaus Schaden",
  );
  assert.match(autohaus.blocks[5].html, /https:\/\/www\.subaru-eifel-mosel\.de\//);

  assert.ok(zimmerei);
  assert.equal(zimmerei.url, `/news/${zimmereiSlug}`);
  assert.equal(zimmerei.title, "Die Zimmerei Schnorbach als Partner auf dem Weg nach Hawaii");
  assert.equal(zimmerei.titleVariant, "compact");
  assert.equal(zimmerei.teaser, "Eine Radtour durch den Hunsrück");
  assert.equal(zimmerei.category, "Partner");
  assert.equal(zimmerei.dateLabel, "22.08.2026");
  assert.equal(zimmerei.dateTime, "2026-08-22");
  assert.equal(zimmerei.imageAlt, "David und Johannes vor dem Schnorbach Bus");
  assert.match(zimmerei.imageSrcset, /zimmerei-david-johannes-web-720\.jpg 720w/);
  assert.deepEqual(zimmerei.blocks.map((block) => block.type), [
    "paragraph",
    "media",
    "paragraph",
    "media",
    "paragraph",
    "rich",
    "media",
  ]);
  assert.deepEqual(
    zimmerei.blocks.filter((block) => block.type === "media").map((block) => block.caption),
    [
      "Zu Besuch bei der Zimmerei Schnorbach in Lieg",
      "Feierabendrunde durch den Hunsrück",
      "Über den Radweg bei Kastellaun",
    ],
  );
  assert.match(zimmerei.blocks[5].html, /https:\/\/zimmerei-schnorbach\.de\//);
});

test("the two new partner articles keep originals private and use quality-checked derivatives", () => {
  const checks = [
    {
      folder: "Artikel 07",
      originals: ["f8a873d9-2cdb-47e2-aa2c-97cbdea8304b.jpeg", "IMG_9902.jpeg", "IMG_9904.jpeg"],
      large: new Map([
        ["zimmerei-david-johannes-web.jpg", 700_000],
        ["zimmerei-radtour-selfie-web.jpg", 700_000],
        ["zimmerei-radweg-kastellaun-web.jpg", 800_000],
      ]),
      mobile: [
        "zimmerei-david-johannes-web-720.jpg",
        "zimmerei-radtour-selfie-web-720.jpg",
        "zimmerei-radweg-kastellaun-web-720.jpg",
      ],
    },
    {
      folder: "Artikel 08",
      originals: ["4f92b546-8d09-4556-bf1e-97542ecc24d5.jpeg"],
      large: new Map([["autohaus-schaden-team-web.jpg", 700_000]]),
      mobile: ["autohaus-schaden-team-web-720.jpg"],
    },
  ];

  for (const check of checks) {
    const folder = path.join(projectRoot, "Bilder Landingpage", "Newsfeed", check.folder);
    for (const filename of check.originals) {
      assert.ok(fs.statSync(path.join(folder, filename)).size > 2_000_000);
    }
    for (const [filename, limit] of check.large) {
      assert.ok(fs.statSync(path.join(folder, filename)).size <= limit, `${filename} exceeds its quality budget`);
    }
    for (const filename of check.mobile) {
      assert.ok(fs.statSync(path.join(folder, filename)).size <= 200_000, `${filename} exceeds its mobile budget`);
    }
  }
});

test("the two new article pages use compact titles and the current article bundle", () => {
  const pages = [
    "mockups/newsfeed-autohaus-schaden-subaru-als-exklusivpartner-auf-dem-weg-nach-hawaii.html",
    "mockups/newsfeed-zimmerei-schnorbach-als-partner-auf-dem-weg-nach-hawaii.html",
  ];

  for (const page of pages) {
    const html = fs.readFileSync(path.join(projectRoot, page), "utf8");
    assert.match(html, /<body class="[^"]*article-title-compact[^"]*">/);
    assert.match(html, /article-render\.js\?v=article-17/);
  }
});

test("the compact lead card keeps long partner names intact on narrow screens", () => {
  const styles = fs.readFileSync(path.join(projectRoot, "mockups", "styles.css"), "utf8");
  const newsfeed = fs.readFileSync(path.join(projectRoot, "mockups", "newsfeed.html"), "utf8");

  assert.match(
    styles,
    /@media \(max-width:\s*560px\)[\s\S]*?\.feed-grid \.news-card-large\.news-card-title-compact h2\s*\{[^}]*font-size:\s*clamp\(1\.1rem, 5\.25vw, 1\.32rem\);[^}]*overflow-wrap:\s*normal;[^}]*word-break:\s*normal;[^}]*hyphens:\s*none;/,
  );
  assert.match(newsfeed, /styles\.css\?v=news-headlines-2/);
});

test("the extra-long Autohaus detail title gets its own compact mobile scale", () => {
  const styles = fs.readFileSync(path.join(projectRoot, "mockups", "styles.css"), "utf8");
  const autohausPage = fs.readFileSync(
    path.join(
      projectRoot,
      "mockups",
      "newsfeed-autohaus-schaden-subaru-als-exklusivpartner-auf-dem-weg-nach-hawaii.html",
    ),
    "utf8",
  );

  assert.match(autohausPage, /article-title-extra-compact/);
  assert.match(autohausPage, /styles\.css\?v=article-partner-1/);
  assert.match(
    styles,
    /@media \(max-width:\s*880px\)[\s\S]*?\.article-page\.article-title-extra-compact \.article-hero h1\s*\{[^}]*font-size:\s*clamp\(1\.72rem, 7\.7vw, 2rem\);[^}]*line-height:\s*0\.96;/,
  );
});
