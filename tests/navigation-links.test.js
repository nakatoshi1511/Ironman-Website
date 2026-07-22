const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const projectRoot = path.join(__dirname, "..");
const navigationPages = [
  "mockups/landingpage-flow.html",
  "mockups/newsfeed.html",
  "mockups/newsfeed-17-stunden-zum-ruhm.html",
  "mockups/newsfeed-trainingsauftakt-in-der-toskana.html",
];
const expectedNavigationTargets = {
  "mockups/landingpage-flow.html": ["#profil", "#erfolge", "#partner", "#social-sponsoren", "/news"],
  "mockups/newsfeed.html": ["/#profil", "/#erfolge", "/#partner", "/#social-sponsoren", "/news"],
  "mockups/newsfeed-17-stunden-zum-ruhm.html": ["/#profil", "/#erfolge", "/#partner", "/#social-sponsoren", "/news"],
  "mockups/newsfeed-trainingsauftakt-in-der-toskana.html": ["/#profil", "/#erfolge", "/#partner", "/#social-sponsoren", "/news"],
};

function read(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
}

function extractMainNavigationTargets(html) {
  const navigation = html.match(
    /<nav\s+class="site-nav"[^>]*aria-label="Hauptnavigation"[^>]*>([\s\S]*?)<\/nav>/i,
  );

  assert.ok(navigation, "page must contain the main site navigation");
  return [...navigation[1].matchAll(/<a\s+href="([^"]+)"/gi)].map((match) => match[1]);
}

test("main navigation keeps the clean public routes used by the live website", () => {
  for (const page of navigationPages) {
    const targets = extractMainNavigationTargets(read(page));

    assert.deepEqual(targets, expectedNavigationTargets[page], `${page} has incorrect navigation targets`);
  }
});
