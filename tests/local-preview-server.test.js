const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const ignore = require("ignore");
const path = require("node:path");
const test = require("node:test");

const projectRoot = path.join(__dirname, "..");
const serverPath = path.join(projectRoot, "tools", "local-preview-server.js");

function request(server, pathname) {
  const address = server.address();

  return new Promise((resolve, reject) => {
    const request = http.get(
      { host: "127.0.0.1", port: address.port, path: pathname },
      (response) => {
        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => {
          resolve({ statusCode: response.statusCode, body: Buffer.concat(chunks).toString("utf8") });
        });
      },
    );

    request.on("error", reject);
  });
}

test("local preview resolves clean public routes without changing production HTML", async (t) => {
  assert.ok(fs.existsSync(serverPath), "tools/local-preview-server.js must provide local route rewrites");
  assert.equal(
    ignore().add(fs.readFileSync(path.join(projectRoot, ".vercelignore"), "utf8")).test("tools/local-preview-server.js").ignored,
    true,
    "the local preview server must remain outside the Vercel deployment",
  );

  const { createPreviewServer } = require(serverPath);
  const server = createPreviewServer(projectRoot);
  t.after(() => server.close());

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));

  const [
    home,
    mockupOverview,
    news,
    article,
    podcastArticle,
    bortolotArticle,
    powerhouseArticle,
    trainingFazitArticle,
    ollisRadladenArticle,
    autohausArticle,
    zimmereiArticle,
  ] = await Promise.all([
    request(server, "/"),
    request(server, "/mockups/"),
    request(server, "/news"),
    request(server, "/news/17-stunden-zum-ruhm"),
    request(server, "/news/zu-gast-im-podcast-moselmomente"),
    request(server, "/news/eisdiele-bortolot-als-partner-auf-dem-weg-nach-hawaii"),
    request(server, "/news/powerhouse-maifeld-gym-als-partner-auf-dem-weg-nach-hawaii"),
    request(server, "/news/ein-erstes-fazit-nach-vier-wochen-konzentrierter-vorbereitung"),
    request(server, "/news/ollis-radladen-als-partner-auf-dem-weg-nach-hawaii"),
    request(server, "/news/autohaus-schaden-subaru-als-exklusivpartner-auf-dem-weg-nach-hawaii"),
    request(server, "/news/zimmerei-schnorbach-als-partner-auf-dem-weg-nach-hawaii"),
  ]);

  assert.equal(home.statusCode, 200);
  assert.match(home.body, /Road to Hawaii/);
  assert.match(home.body, /<a href="\/#profil">Profil<\/a>/);
  assert.equal(mockupOverview.statusCode, 200);
  assert.match(mockupOverview.body, /Road to Hawaii - Hero Mockups/);
  assert.equal(news.statusCode, 200);
  assert.match(news.body, /<h1>Newsfeed<\/h1>/);
  assert.equal(article.statusCode, 200);
  assert.match(article.body, /17 Stunden zum Ruhm/);
  assert.match(article.body, /data-article-teaser/);
  assert.equal(podcastArticle.statusCode, 200);
  assert.match(podcastArticle.body, /data-article-slug="zu-gast-im-podcast-moselmomente"/);
  assert.match(podcastArticle.body, /Zu Gast im Podcast MoselMomente/);
  assert.doesNotMatch(podcastArticle.body, /data-article-teaser/);
  assert.equal(bortolotArticle.statusCode, 200);
  assert.match(
    bortolotArticle.body,
    /data-article-slug="eisdiele-bortolot-als-partner-auf-dem-weg-nach-hawaii"/,
  );
  assert.match(bortolotArticle.body, /Die traditionsreiche Eisdiele Bortolot/);
  assert.doesNotMatch(bortolotArticle.body, /data-article-teaser/);
  assert.equal(powerhouseArticle.statusCode, 200);
  assert.match(
    powerhouseArticle.body,
    /data-article-slug="powerhouse-maifeld-gym-als-partner-auf-dem-weg-nach-hawaii"/,
  );
  assert.match(powerhouseArticle.body, /Das Powerhouse Maifeld Gym als Partner/);
  assert.doesNotMatch(powerhouseArticle.body, /data-article-teaser/);
  assert.equal(trainingFazitArticle.statusCode, 200);
  assert.match(
    trainingFazitArticle.body,
    /data-article-slug="ein-erstes-fazit-nach-vier-wochen-konzentrierter-vorbereitung"/,
  );
  assert.match(trainingFazitArticle.body, /Ein erstes Fazit nach vier Wochen/);
  assert.doesNotMatch(trainingFazitArticle.body, /data-article-teaser/);
  assert.equal(ollisRadladenArticle.statusCode, 200);
  assert.match(
    ollisRadladenArticle.body,
    /data-article-slug="ollis-radladen-als-partner-auf-dem-weg-nach-hawaii"/,
  );
  assert.match(ollisRadladenArticle.body, /Ollis Radladen als Partner/);
  assert.doesNotMatch(ollisRadladenArticle.body, /data-article-teaser/);
  assert.equal(autohausArticle.statusCode, 200);
  assert.match(
    autohausArticle.body,
    /data-article-slug="autohaus-schaden-subaru-als-exklusivpartner-auf-dem-weg-nach-hawaii"/,
  );
  assert.match(autohausArticle.body, /Das Autohaus Schaden Subaru als Exklusivpartner/);
  assert.doesNotMatch(autohausArticle.body, /data-article-teaser/);
  assert.equal(zimmereiArticle.statusCode, 200);
  assert.match(
    zimmereiArticle.body,
    /data-article-slug="zimmerei-schnorbach-als-partner-auf-dem-weg-nach-hawaii"/,
  );
  assert.match(zimmereiArticle.body, /Die Zimmerei Schnorbach als Partner/);
  assert.doesNotMatch(zimmereiArticle.body, /data-article-teaser/);
});
