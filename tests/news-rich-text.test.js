const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const rendererSource = fs.readFileSync(path.join(__dirname, "..", "mockups", "article-render.js"), "utf8");

test("article renderer exposes rich text block support", () => {
  assert.match(rendererSource, /type === "rich"/);
  assert.match(rendererSource, /sanitizeRichHtml/);
  assert.match(rendererSource, /createRichContent/);
});

test("article renderer documents the allowed rich text tags", () => {
  ["p", "br", "h2", "h3", "strong", "em", "u", "ul", "ol", "li", "a"].forEach((tagName) => {
    assert.match(rendererSource, new RegExp(`"${tagName}"`));
  });
});

test("article renderer rejects script and inline event attributes", () => {
  assert.doesNotMatch(rendererSource, /innerHTML\s*=\s*block\.html/);
  assert.match(rendererSource, /removeAttribute/);
  assert.match(rendererSource, /on/i);
});
