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

  const [home, mockupOverview, news, article] = await Promise.all([
    request(server, "/"),
    request(server, "/mockups/"),
    request(server, "/news"),
    request(server, "/news/17-stunden-zum-ruhm"),
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
});
