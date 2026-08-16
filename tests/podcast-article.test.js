const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const projectRoot = path.join(__dirname, "..");

async function loadNewsData() {
  const source = fs.readFileSync(path.join(projectRoot, "mockups", "news-data.js"), "utf8");
  return import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
}

test("Podcast article exposes the supplied metadata and text formatting", async () => {
  const { getArticleBySlug } = await loadNewsData();
  const article = getArticleBySlug("zu-gast-im-podcast-moselmomente");

  assert.ok(article, "Podcast article must be available through the news data API");
  assert.equal(article.url, "/news/zu-gast-im-podcast-moselmomente");
  assert.equal(article.title, "Zu Gast im Podcast MoselMomente");
  assert.equal(article.teaser, "Was haben Golf und Triathlon eigentlich gemeinsam?");
  assert.equal(article.category, "Partner");
  assert.equal(article.dateLabel, "28.07.2026");
  assert.equal(article.dateTime, "2026-07-28");

  const richBlocks = article.blocks.filter((block) => block.type === "rich").map((block) => block.html);
  assert.deepEqual(richBlocks, [
    "<p><strong>Was haben Golf und Triathlon eigentlich gemeinsam?</strong></p>",
    "<p>Mehr, als man auf den ersten Blick vielleicht vermuten würde – genau darüber durfte ich bei einer neuen Folge von <strong>„MoselMomente – Der Podcast aus dem Ferienland Cochem“</strong> sprechen.</p>",
    '<p><strong>Hört gerne in die neue Folge von „<a href="https://www.youtube.com/watch?v=RkCXUnSEOec&amp;list=PL4KFC1FsSWgFgMHp725bSDHlXkC-1HqNW&amp;index=1">MoselMomente</a>“ rein – es lohnt sich!</strong></p>',
  ]);
});

test("Podcast call to action links MoselMomente to the supplied YouTube episode", async () => {
  const { getArticleBySlug } = await loadNewsData();
  const article = getArticleBySlug("zu-gast-im-podcast-moselmomente");
  const callToAction = article.blocks.at(-1);

  assert.equal(callToAction.type, "rich");
  assert.match(
    callToAction.html,
    /„<a href="https:\/\/www\.youtube\.com\/watch\?v=RkCXUnSEOec&amp;list=PL4KFC1FsSWgFgMHp725bSDHlXkC-1HqNW&amp;index=1">MoselMomente<\/a>“/,
  );
});

test("Podcast article uses the three supplied images in their assigned roles", async () => {
  const { getArticleBySlug } = await loadNewsData();
  const article = getArticleBySlug("zu-gast-im-podcast-moselmomente");

  assert.ok(article, "Podcast article must be available through the news data API");
  assert.equal(
    article.image,
    "../Bilder%20Landingpage/Newsfeed/Artikel%2003/cf887347-697b-4c82-a1dd-7d31b23d9bb0.jpeg",
  );
  assert.equal(article.imageAlt, "Jannik und ich mit Rad und Golfausrüstung");
  assert.equal(article.cardImagePosition, "center 22%");
  assert.equal(article.mediaCaption, undefined);

  const renderer = fs.readFileSync(path.join(projectRoot, "mockups", "newsfeed-render.js"), "utf8");
  assert.match(renderer, /image\.style\.objectPosition = article\.cardImagePosition/);

  assert.deepEqual(
    article.blocks.filter((block) => block.type === "media"),
    [
      {
        type: "media",
        image: "../Bilder%20Landingpage/Newsfeed/Artikel%2003/70f4deba-a0e5-495a-9be9-fa630fed775b.jpeg",
        imageAlt: "Während der Podcast Aufnahme",
        caption: "Podcastaufnahme mit Blick über das Ferienland Cochem",
      },
      {
        type: "media",
        image: "../Bilder%20Landingpage/Newsfeed/Artikel%2003/2eb6f5bd-49df-4c79-beca-55860f0cdbfe.jpeg",
        imageAlt: "Jannik und ich beim Golfen",
        caption: "Meine ersten Versuche als Golfer",
      },
    ],
  );
});
