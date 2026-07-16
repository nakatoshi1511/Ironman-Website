const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const pagePath = path.join(__dirname, "..", "mockups", "landingpage-flow.html");

const milestones = [
  "Ironman Lanzarote",
  "Mittelmosel Triathlon",
  "Finaler Vorbereitungs&shy;wettkampf",
  "Leistungs&shy;diagnostik",
  "IRONMAN Hawaii",
];

function cssRule(css, selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = css.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`));

  assert.ok(match, `${selector} should have a CSS rule`);
  return match[1];
}

test("roadmap milestones are connected to the route illustration in the approved order", () => {
  const html = fs.readFileSync(pagePath, "utf8");

  assert.match(html, /<link rel="stylesheet" href="styles\.css\?v=flow-66" \/>/);
  assert.match(html, /<div class="roadmap-scene" aria-label="Roadmap von B&uuml;chel bis Hawaii">/);
  assert.match(html, /<div class="roadmap-route-stage">/);
  assert.match(html, /<ol class="roadmap-credentials" aria-label="Roadmap Meilensteine">/);
  assert.doesNotMatch(html, /class="roadmap-milestones"/);
  assert.equal((html.match(/class="roadmap-credential roadmap-credential-/g) || []).length, 5);

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
  assert.ok(html.indexOf('class="roadmap-route-art"') < html.indexOf('<ol class="roadmap-credentials"'));
});

test("roadmap scene connects staggered credentials directly to the route", () => {
  const stylesPath = path.join(__dirname, "..", "mockups", "styles.css");
  const css = fs.readFileSync(stylesPath, "utf8");
  const scene = cssRule(css, ".roadmap-scene");
  const content = cssRule(css, ".roadmap-scene-content");
  const stage = cssRule(css, ".roadmap-route-stage");
  const routeArt = cssRule(css, ".roadmap-route-art");
  const credentials = cssRule(css, ".roadmap-credentials");
  const credential = cssRule(css, ".roadmap-credential");
  const card = cssRule(css, ".roadmap-credential-card");
  const heading = cssRule(css, ".roadmap-credential-card h3");
  const meta = cssRule(css, ".roadmap-credential-meta");

  assert.match(scene, /overflow-x:\s*auto;/);
  assert.match(scene, /background:\s*#fdf8f2;/);
  assert.match(content, /position:\s*relative;/);
  assert.match(content, /min-width:\s*940px;/);
  assert.match(content, /--roadmap-stage-lift:\s*clamp\(176px,\s*20vw,\s*256px\);/);
  assert.match(stage, /position:\s*relative;/);
  assert.match(stage, /margin-top:\s*calc\(-1\s*\*\s*var\(--roadmap-stage-lift\)\);/);
  assert.match(routeArt, /transform:\s*translateY\(-3%\);/);
  assert.match(credentials, /position:\s*absolute;/);
  assert.match(credentials, /top:\s*67%;/);
  assert.match(credentials, /display:\s*grid;/);
  assert.match(credentials, /grid-template-columns:\s*1\.18fr\s+0\.95fr\s+1\.08fr\s+1\.18fr\s+0\.9fr;/);
  assert.match(credential, /position:\s*relative;/);
  assert.match(credential, /min-width:\s*0;/);
  assert.match(credential, /padding-top:\s*var\(--roadmap-drop\);/);
  assert.match(css, /\.roadmap-credential-lanzarote\s*\{[\s\S]*?--roadmap-drop:\s*74px;/);
  assert.match(css, /\.roadmap-credential-mittelmosel\s*\{[\s\S]*?--roadmap-drop:\s*38px;/);
  assert.match(css, /\.roadmap-credential-vorbereitung\s*\{[\s\S]*?--roadmap-drop:\s*84px;/);
  assert.match(css, /\.roadmap-credential-diagnostik\s*\{[\s\S]*?--roadmap-drop:\s*48px;/);
  assert.match(css, /\.roadmap-credential-hawaii\s*\{[\s\S]*?--roadmap-drop:\s*64px;/);
  assert.match(css, /\.roadmap-credential::before\s*\{[\s\S]*?background:\s*var\(--roadmap-line\);/);
  assert.match(css, /\.roadmap-credential::before\s*\{[\s\S]*?height:\s*var\(--roadmap-drop\);/);
  assert.match(css, /\.roadmap-credential::after\s*\{[\s\S]*?background:\s*var\(--lava\);/);
  assert.match(card, /height:\s*108px;/);
  assert.match(card, /box-sizing:\s*border-box;/);
  assert.match(heading, /font-size:\s*clamp\(0\.86rem,\s*1\.15vw,\s*1\.05rem\);/);
  assert.match(heading, /text-wrap:\s*balance;/);
  assert.match(meta, /display:\s*block;/);
  assert.match(css, /@media \(max-width:\s*560px\)\s*\{[\s\S]*?\.roadmap-scene-content\s*\{[\s\S]*?min-width:\s*900px;/);
  assert.match(css, /@media \(max-width:\s*560px\)\s*\{[\s\S]*?\.roadmap-scene-content\s*\{[\s\S]*?--roadmap-stage-lift:\s*204px;/);
});
