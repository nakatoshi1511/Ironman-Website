const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const test = require("node:test");

const projectRoot = path.join(__dirname, "..");
const vercelIgnorePath = path.join(projectRoot, ".vercelignore");

const productionPages = [
  "index.html",
  "mockups/landingpage-flow.html",
  "mockups/newsfeed.html",
  "mockups/newsfeed-17-stunden-zum-ruhm.html",
  "mockups/newsfeed-trainingsauftakt-in-der-toskana.html",
  "mockups/impressum.html",
  "mockups/datenschutz.html",
];

function read(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
}

function isDeploymentIgnored(relativePath) {
  assert.ok(fs.existsSync(vercelIgnorePath), ".vercelignore must exist");

  const excludesFile = vercelIgnorePath.replace(/\\/g, "/");
  const result = spawnSync(
    "git",
    [
      "-c",
      `core.excludesFile=${excludesFile}`,
      "check-ignore",
      "--no-index",
      "--quiet",
      "--",
      relativePath.replace(/\\/g, "/"),
    ],
    { cwd: projectRoot, encoding: "utf8" },
  );

  assert.ok(
    result.status === 0 || result.status === 1,
    `git check-ignore failed for ${relativePath}: ${result.stderr}`,
  );
  return result.status === 0;
}

function assertPublished(relativePath) {
  assert.equal(
    isDeploymentIgnored(relativePath),
    false,
    `${relativePath} must be included in the Vercel deployment`,
  );
}

function assertPrivate(relativePath) {
  assert.equal(
    isDeploymentIgnored(relativePath),
    true,
    `${relativePath} must be excluded from the Vercel deployment`,
  );
}

function toProjectPath(sourceFile, reference) {
  const withoutQuery = reference.split(/[?#]/, 1)[0].trim();
  if (
    !withoutQuery ||
    withoutQuery.startsWith("#") ||
    /^(?:https?:|mailto:|tel:|data:)/i.test(withoutQuery)
  ) {
    return null;
  }

  const decoded = decodeURIComponent(withoutQuery);
  const absolute = path.resolve(projectRoot, path.dirname(sourceFile), decoded);
  const relative = path.relative(projectRoot, absolute);
  assert.ok(!relative.startsWith(".."), `${reference} escapes the project root`);
  return relative.replace(/\\/g, "/");
}

function localHtmlReferences(sourceFile) {
  const html = read(sourceFile);
  const references = [];
  const attributePattern = /\b(?:href|src|srcset)=["']([^"']*)["']/gi;

  for (const match of html.matchAll(attributePattern)) {
    const relativePath = toProjectPath(sourceFile, match[1]);
    if (relativePath) references.push(relativePath);
  }

  return references;
}

test("publishes only the approved runtime surface", () => {
  const requiredRuntimeFiles = [
    ".vercelignore",
    ...productionPages,
    "mockups/styles.css",
    "mockups/news-data.js",
    "mockups/newsfeed-render.js",
    "mockups/article-render.js",
    "api/contact.js",
    "RoadmapV2.png",
    "Dokumente/Partner- und Unterstuetzerkonzept_Road to Hawaii_David Simon.pdf",
  ];

  for (const relativePath of requiredRuntimeFiles) assertPublished(relativePath);

  const privateFiles = [
    "PROJECT_CONTEXT.md",
    "package.json",
    ".env.example",
    "tests/contact.test.js",
    "tools/export-mockup-screenshots.js",
    "docs/news-google-docs-import.md",
    "mockups/index.html",
    "mockups/newsfeed-design-mockups.html",
    "mockups/countdown-designs.html",
    "mockups/sponsor-section-mockups.html",
    "Bilder Landingpage/Newsfeed/Artikel 02/Toskana.docx",
    "Dokumente/Bilder/WhatsApp Unknown 2026-07-01 at 11.38.35.zip",
    "Bilder Landingpage/IMG_0935.JPG",
  ];

  for (const relativePath of privateFiles) assertPrivate(relativePath);
});

test("accepts future articles and web images without exposing source files", () => {
  const futureRuntimeFiles = [
    "mockups/newsfeed-neuer-artikel.html",
    "Bilder Landingpage/Newsfeed/Artikel 03/neues-bild.webp",
    "Bilder Landingpage/Logos/Partner/Neuer Sponsor.svg",
  ];
  const futurePrivateFiles = [
    "Bilder Landingpage/Newsfeed/Artikel 03/entwurf.docx",
    "Bilder Landingpage/Newsfeed/Artikel 03/anlage.pdf",
    "Bilder Landingpage/Logos/Partner/notizen.txt",
  ];

  for (const relativePath of futureRuntimeFiles) assertPublished(relativePath);
  for (const relativePath of futurePrivateFiles) assertPrivate(relativePath);
});

test("keeps every active local page reference deployable", () => {
  for (const page of productionPages) {
    for (const reference of localHtmlReferences(page)) {
      assert.ok(
        fs.existsSync(path.join(projectRoot, reference)),
        `${page} references missing ${reference}`,
      );
      assertPublished(reference);
    }
  }
});

test("keeps every news article page and image deployable", () => {
  const newsData = read("mockups/news-data.js");
  const articleUrls = [...newsData.matchAll(/\burl:\s*["']([^"']+)["']/g)].map(
    (match) => `mockups/${match[1]}`,
  );
  const newsImages = [
    ...newsData.matchAll(/["'](\.\.\/Bilder%20Landingpage\/[^"']+)["']/g),
  ].map((match) => decodeURIComponent(match[1]).replace(/^\.\.\//, ""));

  for (const relativePath of new Set(articleUrls)) {
    assert.ok(
      fs.existsSync(path.join(projectRoot, relativePath)),
      `missing article ${relativePath}`,
    );
    assertPublished(relativePath);
  }
  for (const relativePath of new Set(newsImages)) {
    assert.ok(
      fs.existsSync(path.join(projectRoot, relativePath)),
      `missing news image ${relativePath}`,
    );
    assertPublished(relativePath);
  }
});
