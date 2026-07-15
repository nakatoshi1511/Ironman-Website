const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const pagePath = path.join(__dirname, "..", "mockups", "landingpage-flow.html");
const stylesPath = path.join(__dirname, "..", "mockups", "styles.css");

const milestones = [
  "Ironman Lanzarote â€“ Qualifikation fÃ¼r Hawaii",
  "Mittelmosel Triathlon",
  "Leistungsdiagnostik (September)",
  "Finaler Vorbereitungswettkampf (August)",
];

test("roadmap milestones are embedded in the route illustration in the approved order", () => {
  const html = fs.readFileSync(pagePath, "utf8");

  assert.match(html, /<div class="roadmap-scene" aria-label="Roadmap von B&uuml;chel bis Hawaii">/);
  assert.match(html, /<ol class="roadmap-credentials" aria-label="Roadmap Meilensteine">/);
  assert.doesNotMatch(html, /class="roadmap-milestones"/);

  let previousIndex = -1;
  for (const milestone of milestones) {
    const index = html.indexOf(milestone);
    assert.ok(index > previousIndex, `${milestone} should appear once in approved route order`);
    previousIndex = index;
  }

  assert.match(
    html,
    /<img\b[^>]*class="roadmap-route-art"[^>]*src="\.\.\/RoadmapV2\.png"[^>]*alt="Illustration vom Start in B&uuml;chel &uuml;ber Schwimmen, Radfahren und Laufen bis zum Ziel in Hawaii"[^>]*\/>/,
  );
});
