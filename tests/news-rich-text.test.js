const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const rendererSource = fs.readFileSync(path.join(__dirname, "..", "mockups", "article-render.js"), "utf8");

function findFunctionEnd(source, startIndex) {
  const openBraceIndex = source.indexOf("{", startIndex);
  assert.ok(openBraceIndex >= 0, "expected function body to start with an open brace");

  let depth = 0;
  for (let index = openBraceIndex; index < source.length; index += 1) {
    const character = source[index];
    if (character === "{") depth += 1;
    if (character === "}") depth -= 1;
    if (depth === 0) return index;
  }

  assert.fail("expected to find the end of the function body");
}

function loadIsSafeHref() {
  const start = rendererSource.indexOf("function isSafeHref(href) {");
  assert.ok(start >= 0, "expected isSafeHref to be present in the renderer source");
  const end = findFunctionEnd(rendererSource, start);

  const context = {
    safeLinkProtocols: new Set(["http:", "https:", "mailto:"]),
  };

  const functionSource = `${rendererSource.slice(start, end + 1)}\nthis.isSafeHref = isSafeHref;`;
  vm.runInNewContext(functionSource, context);
  return context.isSafeHref;
}

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

test("article renderer accepts safe hrefs and rejects unsafe ones", () => {
  const isSafeHref = loadIsSafeHref();

  [
    "#fragment",
    "/newsfeed.html",
    "newsfeed.html",
    "./newsfeed.html",
    "../newsfeed.html",
    "https://example.com/story",
    "http://example.com/story",
    "mailto:hello@example.com",
  ].forEach((href) => {
    assert.equal(isSafeHref(href), true, `expected ${href} to be safe`);
  });

  ["", "   ", "javascript:alert(1)", "data:text/html,alert(1)", "//example.com"].forEach((href) => {
    assert.equal(isSafeHref(href), false, `expected ${JSON.stringify(href)} to be unsafe`);
  });
});
