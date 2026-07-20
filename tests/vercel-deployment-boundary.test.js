const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const ignore = require("ignore");

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
const canonicalBaseUrl = "https://www.roadtohawaii.de";
const indexablePages = [
  "mockups/landingpage-flow.html",
  "mockups/newsfeed.html",
  "mockups/newsfeed-17-stunden-zum-ruhm.html",
  "mockups/newsfeed-trainingsauftakt-in-der-toskana.html",
];
const publicPathByPage = {
  "mockups/landingpage-flow.html": "/",
  "mockups/newsfeed.html": "/news",
  "mockups/newsfeed-17-stunden-zum-ruhm.html": "/news/17-stunden-zum-ruhm",
  "mockups/newsfeed-trainingsauftakt-in-der-toskana.html": "/news/trainingsauftakt-in-der-toskana",
};

function read(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
}

function isDeploymentIgnored(relativePath) {
  assert.ok(fs.existsSync(vercelIgnorePath), ".vercelignore must exist");
  const rules = ignore().add(read(".vercelignore"));
  return rules.test(relativePath.replace(/\\/g, "/")).ignored;
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

function parentDirectories(relativePath) {
  const directories = [];
  let current = path.posix.dirname(relativePath.replace(/\\/g, "/"));

  while (current && current !== ".") {
    directories.unshift(current);
    current = path.posix.dirname(current);
  }

  return directories;
}

function toProjectPath(sourceFile, reference) {
  const withoutQuery = reference.split(/[?#]/, 1)[0].trim();
  if (
    !withoutQuery ||
    withoutQuery.startsWith("/") ||
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
    "vercel.json",
    "robots.txt",
    "sitemap.xml",
    ...productionPages,
    "mockups/styles.css",
    "mockups/landingpage-flow.js",
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

test("publishes www.roadtohawaii.de canonical and social URLs for indexable pages", () => {
  for (const page of indexablePages) {
    const html = read(page);
    const pageUrl = `${canonicalBaseUrl}${publicPathByPage[page]}`;

    assert.match(html, new RegExp(`<link\\s+rel="canonical"\\s+href="${pageUrl}"\\s*/>`));
    assert.match(html, new RegExp(`<meta\\s+property="og:url"\\s+content="${pageUrl}"\\s*/>`));
    assert.match(html, new RegExp(`<meta\\s+property="og:image"\\s+content="${canonicalBaseUrl}/`));
  }
});

test("publishes a crawlable sitemap for www.roadtohawaii.de", () => {
  const robots = read("robots.txt");
  const sitemap = read("sitemap.xml");

  assert.match(robots, /Sitemap: https:\/\/www\.roadtohawaii\.de\/sitemap\.xml/);
  for (const page of indexablePages) {
    assert.match(sitemap, new RegExp(`<loc>${canonicalBaseUrl}${publicPathByPage[page]}</loc>`));
  }
  assert.doesNotMatch(sitemap, /impressum\.html|datenschutz\.html/);
});

test("serves clean public URLs and redirects legacy mockup pages", () => {
  const config = JSON.parse(read("vercel.json"));
  const expectedLegacyRedirects = [
    { src: "/index\\.html", headers: { Location: "/" }, status: 308 },
    { src: "/mockups/landingpage-flow\\.html", headers: { Location: "/" }, status: 308 },
    { src: "/mockups/newsfeed\\.html", headers: { Location: "/news" }, status: 308 },
    { src: "/mockups/newsfeed-17-stunden-zum-ruhm\\.html", headers: { Location: "/news/17-stunden-zum-ruhm" }, status: 308 },
    { src: "/mockups/newsfeed-trainingsauftakt-in-der-toskana\\.html", headers: { Location: "/news/trainingsauftakt-in-der-toskana" }, status: 308 },
    { src: "/mockups/impressum\\.html", headers: { Location: "/impressum" }, status: 308 },
    { src: "/mockups/datenschutz\\.html", headers: { Location: "/datenschutz" }, status: 308 },
  ];
  const expectedRewrites = [
    { src: "/", dest: "/mockups/landingpage-flow.html" },
    { src: "/news", dest: "/mockups/newsfeed.html" },
    { src: "/news/17-stunden-zum-ruhm", dest: "/mockups/newsfeed-17-stunden-zum-ruhm.html" },
    { src: "/news/trainingsauftakt-in-der-toskana", dest: "/mockups/newsfeed-trainingsauftakt-in-der-toskana.html" },
    { src: "/impressum", dest: "/mockups/impressum.html" },
    { src: "/datenschutz", dest: "/mockups/datenschutz.html" },
  ];

  assert.equal(config.routes?.[0]?.src, "/(.*)");
  assert.equal(config.routes?.[0]?.continue, true);
  assert.deepEqual(config.routes?.slice(1, 8), expectedLegacyRedirects);
  assert.deepEqual(config.routes?.slice(8, 14), expectedRewrites);
  assert.deepEqual(config.routes?.at(-1), { handle: "filesystem" });

  for (const page of productionPages.filter((page) => page.startsWith("mockups/"))) {
    assert.match(read(page), /<base href="\/mockups\/" \/>/);
  }

  assert.doesNotMatch(read("index.html"), /http-equiv="refresh"/i);
  assert.match(read("mockups/news-data.js"), /url: "\/news\/17-stunden-zum-ruhm"/);
  assert.match(read("mockups/news-data.js"), /url: "\/news\/trainingsauftakt-in-der-toskana"/);
});

test("applies strict security headers to every deployed route", () => {
  const config = JSON.parse(read("vercel.json"));
  const globalHeaders = config.routes?.find(
    (rule) => rule.src === "/(.*)" && rule.continue === true,
  );

  assert.ok(globalHeaders, "vercel.json must define a global header route");

  const headers = new Map(
    Object.entries(globalHeaders.headers).map(([key, value]) => [key.toLowerCase(), value]),
  );

  assert.equal(headers.get("x-content-type-options"), "nosniff");
  assert.equal(headers.get("referrer-policy"), "strict-origin-when-cross-origin");
  assert.equal(headers.get("permissions-policy"), "camera=(), geolocation=(), microphone=()");
  assert.equal(headers.get("x-frame-options"), "DENY");
  assert.match(headers.get("content-security-policy"), /default-src 'self'/);
  assert.match(headers.get("content-security-policy"), /frame-ancestors 'none'/);
  assert.doesNotMatch(headers.get("content-security-policy"), /unsafe-inline/);
});

test("keeps the landingpage executable under the strict content security policy", () => {
  const landingpage = read("mockups/landingpage-flow.html");

  assert.doesNotMatch(landingpage, /<script(?![^>]*\bsrc=)[^>]*>/i);
  assert.match(landingpage, /<script\s+src="landingpage-flow\.js\?v=landing-1"\s+defer><\/script>/i);
});

test("gives every public page a unique search description", () => {
  const descriptions = productionPages.map((page) => {
    const html = read(page);
    const match = html.match(/<meta\s+name="description"\s+content="([^"]+)"\s*\/>/i);

    assert.ok(match, `${page} must define a meta description`);
    assert.ok(match[1].trim().length >= 70, `${page} needs a useful meta description`);
    return match[1];
  });

  assert.equal(new Set(descriptions).size, descriptions.length);
});

test("keeps every runtime parent directory traversable by Vercel", () => {
  const runtimeFiles = [
    "api/contact.js",
    "mockups/landingpage-flow.html",
    "Bilder Landingpage/Hero/final-variants/hero-final-H-no-bars-clean-filter-warm-sunrise.jpg",
    "Bilder Landingpage/Logos/Partner/Neuer Sponsor.svg",
    "Bilder Landingpage/Newsfeed/Artikel 03/neues-bild.webp",
    "Dokumente/Partner- und Unterstuetzerkonzept_Road to Hawaii_David Simon.pdf",
  ];

  for (const relativePath of runtimeFiles) {
    for (const directory of parentDirectories(relativePath)) {
      assertPublished(directory);
    }
  }
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
  const articleUrls = [...newsData.matchAll(/\burl:\s*["']([^"']+)["']/g)].map((match) => {
    assert.match(match[1], /^\/news\/[a-z0-9-]+$/);
    return `mockups/newsfeed-${match[1].split("/").at(-1)}.html`;
  });
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
