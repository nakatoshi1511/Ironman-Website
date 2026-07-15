const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const pagePath = path.join(__dirname, "..", "mockups", "landingpage-flow.html");

const milestones = [
  "Ironman Lanzarote – Qualifikation für Hawaii",
  "Mittelmosel Triathlon",
  "Leistungsdiagnostik (September)",
  "Finaler Vorbereitungswettkampf (August)",
];

test("roadmap milestones are embedded in the route illustration in the approved order", () => {
  const html = fs.readFileSync(pagePath, "utf8");

  assert.match(html, /<link rel="stylesheet" href="styles\.css\?v=flow-59" \/>/);
  assert.match(html, /<div class="roadmap-scene" aria-label="Roadmap von B&uuml;chel bis Hawaii">/);
  assert.match(html, /<ol class="roadmap-credentials" aria-label="Roadmap Meilensteine">/);
  assert.doesNotMatch(html, /class="roadmap-milestones"/);

  let previousIndex = -1;
  for (const milestone of milestones) {
    const index = html.indexOf(milestone);
    assert.ok(index >= 0, `${milestone} should appear in the roadmap`);
    assert.equal(index, html.lastIndexOf(milestone), `${milestone} should appear only once`);
    assert.ok(index > previousIndex, `${milestone} should appear in approved route order`);
    previousIndex = index;
  }

  assert.match(
    html,
    /<img\b[^>]*class="roadmap-route-art"[^>]*src="\.\.\/RoadmapV2\.png"[^>]*alt="Illustration vom Start in B&uuml;chel &uuml;ber Schwimmen, Radfahren und Laufen bis zum Ziel in Hawaii"[^>]*\/>/,
  );
});

test("roadmap scene keeps credentials and artwork on one responsive canvas", () => {
  const stylesPath = path.join(__dirname, "..", "mockups", "styles.css");
  const css = fs.readFileSync(stylesPath, "utf8");

  assert.match(css, /\.roadmap-scene\s*\{[\s\S]*?overflow-x:\s*auto;/);
  assert.match(css, /\.roadmap-scene-content\s*\{[\s\S]*?position:\s*relative;[\s\S]*?min-width:\s*940px;/);
  assert.match(css, /\.roadmap-credentials\s*\{[\s\S]*?position:\s*absolute;/);
  assert.match(css, /\.roadmap-credential::before\s*\{[\s\S]*?background:\s*var\(--roadmap-line\);/);
  assert.match(css, /\.roadmap-credential::after\s*\{[\s\S]*?background:\s*var\(--lava\);/);
  assert.match(css, /@media \(max-width:\s*560px\)\s*\{[\s\S]*?\.roadmap-scene-content\s*\{[\s\S]*?min-width:\s*780px;/);
});
