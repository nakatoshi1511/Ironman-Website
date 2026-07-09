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
});

test("sponsor tier layout keeps labels readable and exclusive cards equal", () => {
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
    /\.sponsor-tier-exclusive\s+\.sponsor-tier-logos\s*\{[\s\S]*?grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\);/,
  );
});
