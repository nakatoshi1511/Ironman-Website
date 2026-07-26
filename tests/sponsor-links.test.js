const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const pagePath = path.join(__dirname, "..", "mockups", "landingpage-flow.html");
const stylesPath = path.join(__dirname, "..", "mockups", "styles.css");

const expectedSponsors = [
  ["Autohaus Schaden und Subaru", "https://www.subaru-eifel-mosel.de"],
  ["KMBS", "https://kmbs-gmbh.de"],
  ["Berenz", "https://berenz-burggraf-stb.de"],
  ["Bortolot", "https://bortolot.de"],
  ["EMH Coaching", "https://www.emh-coaching.de"],
  ["Ollis Radladen", "https://www.ollis-radladen.de"],
  ["Powerhouse", "https://www.powerhouse-maifeld-gym.com"],
  ["Schnorbach", "https://zimmerei-schnorbach.de"],
  ["KFZ Meisterbetrieb Eisfeld", "https://www.kfz-eisfeld.de/"],
  ["Ortsgemeinde Büchel", "https://www.buechel.de/"],
  ["Gerade deshalb. Cochem-Zell", "https://www.kurvenkreis.de/"],
  ["Timo Bertram Energieberatung", "http://www.timo-bertram.de/index.html"],
];

function sponsorLinkPattern(name, href) {
  return new RegExp(
    `<a\\b[^>]*class="[^"]*sponsor-logo-card[^"]*"[^>]*href="${href}"[^>]*target="_blank"[^>]*rel="noopener noreferrer"[^>]*aria-label="${name} Website öffnen"[\\s\\S]*?<img\\b[^>]*alt="${name}"`,
  );
}

test("sponsor logos link to partner websites", () => {
  const html = fs.readFileSync(pagePath, "utf8");

  for (const [name, href] of expectedSponsors) {
    assert.match(html, sponsorLinkPattern(name, href), `${name} should link to ${href}`);
  }
});

test("sponsor tier labels include compact category icons", () => {
  const html = fs.readFileSync(pagePath, "utf8");

  assert.match(
    html,
    /<p class="sponsor-tier-label">\s*<img\s+class="sponsor-tier-icon"\s+src="\.\.\/Bilder%20Landingpage\/Logos\/Exklusivpartner\.jpeg"\s+alt=""\s+aria-hidden="true"\s*\/>\s*<span>Exklusivpartner<\/span>\s*<\/p>/,
  );
  assert.match(
    html,
    /<p class="sponsor-tier-label">\s*<img\s+class="sponsor-tier-icon"\s+src="\.\.\/Bilder%20Landingpage\/Logos\/Partner\.jpeg"\s+alt=""\s+aria-hidden="true"\s*\/>\s*<span>Partner<\/span>\s*<\/p>/,
  );
  assert.match(
    html,
    /<p class="sponsor-tier-label">\s*<img\s+class="sponsor-tier-icon"\s+src="\.\.\/Bilder%20Landingpage\/Logos\/Unterstuetzer\.jpeg"\s+alt=""\s+aria-hidden="true"\s*\/>\s*<span>Unterstützer<\/span>\s*<\/p>/,
  );
});

test("supporter tier includes all four logos", () => {
  const html = fs.readFileSync(pagePath, "utf8");

  const supporterLogos = [
    ["Eisfeld.png", "KFZ Meisterbetrieb Eisfeld"],
    ["Buechel.png", "Ortsgemeinde Büchel"],
    ["CochemZell.png", "Gerade deshalb. Cochem-Zell"],
    ["Timo%20Bertram.jpg", "Timo Bertram Energieberatung"],
  ];

  for (const [filename, alt] of supporterLogos) {
    assert.match(
      html,
      new RegExp(`Unterstuetzer/${filename}"\\s+alt="${alt}"`),
      `${filename} should appear in the supporter tier`,
    );
  }

  assert.match(
    html,
    /<section class="sponsor-tier sponsor-tier-supporters"[\s\S]*?<div class="sponsor-roster">/,
    "supporters should use the same roster layout as partners",
  );
});

test("sponsor tier layout keeps labels readable and logo cards balanced", () => {
  const css = fs.readFileSync(stylesPath, "utf8");

  assert.match(
    css,
    /\.sponsor-tier\s*\{[\s\S]*?grid-template-columns:\s*minmax\(220px,\s*0\.32fr\)\s+minmax\(0,\s*1fr\);/,
  );
  assert.doesNotMatch(
    css,
    /\.sponsor-tier-exclusive\s+\.sponsor-tier-logos\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1\.35fr\)\s+minmax\(0,\s*0\.85fr\);/,
  );
  assert.match(
    css,
    /\.sponsor-tier-exclusive\s+\.sponsor-tier-logos\s*\{[\s\S]*?grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\);/,
  );
  assert.doesNotMatch(
    css,
    /\.sponsor-tier-supporters\s+\.sponsor-tier-logos\s*\{[\s\S]*?grid-template-columns:\s*1fr;/,
  );
});
