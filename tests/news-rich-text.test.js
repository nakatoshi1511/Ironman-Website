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

test("article renderer routes rich html through the sanitizer instead of assigning block html directly", () => {
  assert.match(rendererSource, /wrapper\.append\(sanitizeRichHtml\(block\.html \|\| "", documentRef\)\)/);
  assert.doesNotMatch(rendererSource, /(?:innerHTML|outerHTML)\s*=\s*block\.html/);
  assert.doesNotMatch(rendererSource, /(?:append|replaceChildren)\(\s*block\.html/);
});

test("article renderer sanitizer keeps only allow-listed link protocols and explicit anchor attributes", () => {
  ["http:", "https:", "mailto:"].forEach((protocol) => {
    assert.match(rendererSource, new RegExp(`"${protocol}"`));
  });

  assert.match(rendererSource, /if \(tagName === "a"\)/);
  assert.match(rendererSource, /const href = node\.getAttribute\("href"\) \|\| ""/);
  assert.match(rendererSource, /if \(isSafeHref\(href\)\)/);
  assert.match(rendererSource, /clean\.setAttribute\("href", href\)/);
  assert.match(rendererSource, /clean\.setAttribute\("target", "_blank"\)/);
  assert.match(rendererSource, /clean\.setAttribute\("rel", "noopener noreferrer"\)/);
  assert.doesNotMatch(rendererSource, /Array\.from\(node\.attributes\)/);
});
