const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const projectRoot = path.join(__dirname, "..");
const navigationPages = [
  "mockups/landingpage-flow.html",
  "mockups/newsfeed.html",
  "mockups/newsfeed-eisdiele-bortolot-als-partner-auf-dem-weg-nach-hawaii.html",
  "mockups/newsfeed-17-stunden-zum-ruhm.html",
  "mockups/newsfeed-trainingsauftakt-in-der-toskana.html",
  "mockups/newsfeed-zu-gast-im-podcast-moselmomente.html",
];
const expectedNavigationTargets = {
  "mockups/landingpage-flow.html": ["#profil", "#erfolge", "#partner", "#social-sponsoren", "/news"],
  "mockups/newsfeed.html": ["/#profil", "/#erfolge", "/#partner", "/#social-sponsoren", "/news"],
  "mockups/newsfeed-eisdiele-bortolot-als-partner-auf-dem-weg-nach-hawaii.html": [
    "/#profil",
    "/#erfolge",
    "/#partner",
    "/#social-sponsoren",
    "/news",
  ],
  "mockups/newsfeed-17-stunden-zum-ruhm.html": ["/#profil", "/#erfolge", "/#partner", "/#social-sponsoren", "/news"],
  "mockups/newsfeed-trainingsauftakt-in-der-toskana.html": ["/#profil", "/#erfolge", "/#partner", "/#social-sponsoren", "/news"],
  "mockups/newsfeed-zu-gast-im-podcast-moselmomente.html": ["/#profil", "/#erfolge", "/#partner", "/#social-sponsoren", "/news"],
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

function extractMainNavigation(html) {
  const navigation = html.match(
    /<nav\s+class="site-nav"[^>]*aria-label="Hauptnavigation"[^>]*>([\s\S]*?)<\/nav>/i,
  );

  assert.ok(navigation, "page must contain the main site navigation");
  return navigation[1];
}

test("main navigation keeps the clean public routes used by the live website", () => {
  for (const page of navigationPages) {
    const targets = extractMainNavigationTargets(read(page));

    assert.deepEqual(targets, expectedNavigationTargets[page], `${page} has incorrect navigation targets`);
  }
});

test("every primary navigation presents Newsfeed as the editorial Journal tab", () => {
  const editorialNewsLink =
    /<a\s+href="\/news"\s+class="site-nav-news"[^>]*>\s*<span\s+class="site-nav-news-kicker"\s+aria-hidden="true">Journal<\/span>\s*<span\s+class="site-nav-news-title">Newsfeed<\/span>\s*<\/a>/i;

  for (const page of navigationPages) {
    assert.match(extractMainNavigation(read(page)), editorialNewsLink, `${page} is missing the editorial Newsfeed tab`);
  }
});

test("editorial Newsfeed tab keeps the approved compact desktop and mobile dimensions", () => {
  const styles = read("mockups/styles.css");

  assert.match(
    styles,
    /\.site-nav-links \.site-nav-news\s*\{[\s\S]*?min-height:\s*34px;[\s\S]*?padding:\s*3px 12px;[\s\S]*?border-radius:\s*4px;[\s\S]*?box-shadow:\s*inset 0 2px 0 var\(--lava\),\s*0 6px 18px rgba\(8, 12, 12, 0\.16\);[\s\S]*?\}/,
    "desktop Newsfeed tab must match the approved Editorial Tab treatment",
  );
  assert.match(
    styles,
    /@media \(max-width:\s*880px\)[\s\S]*?\.site-nav-links \.site-nav-news\s*\{[\s\S]*?min-height:\s*27px;[\s\S]*?padding:\s*2px 6px;[\s\S]*?\}/,
    "mobile Newsfeed tab must stay compact inside the single-line navigation",
  );
});
