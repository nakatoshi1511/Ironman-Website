const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const ignore = require("ignore");

const root = path.join(__dirname, "..");
const slug = "das-traditionsreiche-familienunternehmen-wajos-als-exklusivpartner-auf-dem-weg-nach-hawaii";

test("Artikel 14 preserves the supplied Wajos copy and approved image placement", async () => {
  const source = fs.readFileSync(path.join(root, "mockups/news-data.js"), "utf8");
  const { newsArticles } = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
  const article = newsArticles[0];
  assert.equal(article.slug, slug);
  assert.equal(article.title, "Das traditionsreiche Familienunternehmen Wajos als Exklusivpartner auf dem Weg nach Hawaii");
  assert.equal(article.teaser, "Das Leben mit guten Zutaten ein bisschen leckerer machen");
  assert.equal(article.category, "Partner");
  assert.equal(article.dateTime, "2026-10-01");
  assert.deepEqual(article.blocks.slice(0, 4).map(block => block.text), [
    "Ich freue mich sehr, mit Wajos einen weiteren Partner aus der Region an meiner Seite zu haben.",
    "Als traditionsreiches Familienunternehmen mit tiefen Wurzeln an der Mosel engagiert sich Wajos für die Region und unterstützt mit mir nun auch einen Sportler aus der Region auf seinem Weg zur IRONMAN Weltmeisterschaft nach Hawaii.",
    "Bei meinen hohen Trainingsumfängen muss ich täglich ordentlich essen.",
    "Genau hier bringen die Produkte von Wajos mit wenig Aufwand Abwechslung und Geschmack in meine Gerichte. So wird aus einem einfachen Trainingsessen schnell etwas, auf das man sich wieder freut.",
  ]);
  assert.equal(article.blocks[4].html, '<p>Schaut gerne mal vorbei: <a href="https://www.wajos.de">https://www.wajos.de</a></p>');
  assert.equal(article.blocks[5].text, "Vielen Dank an Wajos für die Unterstützung auf meinem Weg nach Hawaii!");
  assert.equal(article.blocks[6].image, article.image);
  assert.equal(article.blocks[6].caption, "Ulf Schwichtenberg und David vor der Firmenzentrale in Dohr");
  assert.equal(article.blocks.length, 7);
  assert.equal(article.imageAlt, "");
  assert.equal(article.mediaCaption, "");
});

test("Artikel 14 publishes the clean route and responsive images while excluding originals", () => {
  const rules = ignore().add(fs.readFileSync(path.join(root, ".vercelignore"), "utf8"));
  const folder = "Bilder Landingpage/Newsfeed/Artikel 14/";
  assert.ok(rules.ignores(folder + "IMG_1249.jpeg"));
  assert.ok(rules.ignores(folder + "Newsfeed Wajos.docx"));
  for (const filename of ["wajos-web.webp", "wajos-web-720.webp"]) {
    assert.ok(!rules.ignores(folder + filename));
    assert.ok(fs.statSync(path.join(root, folder, filename)).size > 0);
  }
  const config = JSON.parse(fs.readFileSync(path.join(root, "vercel.json"), "utf8"));
  assert.ok(config.routes.some(route => route.src === `/news/${slug}` && route.dest === `/mockups/newsfeed-${slug}.html`));
  const page = fs.readFileSync(path.join(root, `mockups/newsfeed-${slug}.html`), "utf8");
  assert.ok(page.includes(`data-article-slug="${slug}"`));
  assert.ok(fs.readFileSync(path.join(root, "sitemap.xml"), "utf8").includes(`/news/${slug}</loc>`));
});
