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
  const normalizeStart = rendererSource.indexOf("function normalizeHref(href) {");
  assert.ok(normalizeStart >= 0, "expected normalizeHref to be present in the renderer source");
  const normalizeEnd = findFunctionEnd(rendererSource, normalizeStart);

  const safeHrefStart = rendererSource.indexOf("function isSafeHref(href) {");
  assert.ok(safeHrefStart >= 0, "expected isSafeHref to be present in the renderer source");
  const safeHrefEnd = findFunctionEnd(rendererSource, safeHrefStart);

  const context = {
    safeLinkProtocols: new Set(["http:", "https:", "mailto:"]),
  };

  const functionSource = `${rendererSource.slice(normalizeStart, normalizeEnd + 1)}\n${rendererSource.slice(safeHrefStart, safeHrefEnd + 1)}\nthis.isSafeHref = isSafeHref;`;
  vm.runInNewContext(functionSource, context);
  return context.isSafeHref;
}

const NODE_TYPES = {
  ELEMENT_NODE: 1,
  TEXT_NODE: 3,
  DOCUMENT_FRAGMENT_NODE: 11,
};

class FakeNode {
  constructor(nodeType) {
    this.nodeType = nodeType;
    this.parentNode = null;
    this.childNodes = [];
  }

  append(...nodes) {
    nodes.forEach((node) => {
      if (node == null) return;
      if (node.nodeType === NODE_TYPES.DOCUMENT_FRAGMENT_NODE) {
        node.childNodes.slice().forEach((child) => this.append(child));
        return;
      }

      if (node.parentNode) {
        const siblings = node.parentNode.childNodes;
        const index = siblings.indexOf(node);
        if (index >= 0) siblings.splice(index, 1);
      }

      node.parentNode = this;
      this.childNodes.push(node);
    });
  }
}

class FakeTextNode extends FakeNode {
  constructor(text) {
    super(NODE_TYPES.TEXT_NODE);
    this.textContent = text;
  }
}

class FakeDocumentFragment extends FakeNode {
  constructor() {
    super(NODE_TYPES.DOCUMENT_FRAGMENT_NODE);
  }
}

class FakeElement extends FakeNode {
  constructor(tagName) {
    super(NODE_TYPES.ELEMENT_NODE);
    this.tagName = tagName.toUpperCase();
    this.attributes = new Map();
  }

  set className(value) {
    this.setAttribute("class", value);
  }

  get className() {
    return this.getAttribute("class") || "";
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  getAttribute(name) {
    return this.attributes.has(name) ? this.attributes.get(name) : null;
  }

  removeAttribute(name) {
    this.attributes.delete(name);
  }

  set innerHTML(html) {
    this.childNodes = [];
    parseHtml(html, this);
  }
}

class FakeTemplateElement extends FakeElement {
  constructor() {
    super("template");
    this.content = new FakeDocumentFragment();
  }

  set innerHTML(html) {
    this.content.childNodes = [];
    parseHtml(html, this.content);
  }
}

class FakeDocument {
  constructor() {
    this.defaultView = { Node: NODE_TYPES };
  }

  createElement(tagName) {
    if (tagName === "template") return new FakeTemplateElement();
    return new FakeElement(tagName);
  }

  createTextNode(text) {
    return new FakeTextNode(text);
  }

  createDocumentFragment() {
    return new FakeDocumentFragment();
  }

  querySelector() {
    return null;
  }
}

function parseHtml(html, root) {
  const stack = [root];
  const tokenPattern = /<!--[\s\S]*?-->|<\/?[a-zA-Z][^>]*>|[^<]+|</g;
  let match;

  while ((match = tokenPattern.exec(html || ""))) {
    const token = match[0];
    const current = stack[stack.length - 1];

    if (token.startsWith("<!--")) continue;

    if (token[0] !== "<") {
      current.append(new FakeTextNode(token));
      continue;
    }

    if (token === "<") {
      current.append(new FakeTextNode(token));
      continue;
    }

    if (token.startsWith("</")) {
      const closingTag = token.slice(2, -1).trim().toLowerCase();
      while (stack.length > 1) {
        const node = stack.pop();
        if (node.tagName.toLowerCase() === closingTag) break;
      }
      continue;
    }

    const openMatch = token.match(/^<([a-zA-Z][\w:-]*)([\s\S]*?)(\/?)>$/);
    if (!openMatch) {
      current.append(new FakeTextNode(token));
      continue;
    }

    const [, tagName, rawAttributes, selfClosingMarker] = openMatch;
    const element = new FakeElement(tagName);
    parseAttributes(rawAttributes, element);
    current.append(element);

    const selfClosing = selfClosingMarker === "/" || tagName.toLowerCase() === "br";
    if (!selfClosing) stack.push(element);
  }
}

function parseAttributes(rawAttributes, element) {
  const attributePattern = /([^\s=/>]+)(?:\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let match;
  while ((match = attributePattern.exec(rawAttributes || ""))) {
    const [, name, , doubleQuoted, singleQuoted, unquoted] = match;
    const value = doubleQuoted ?? singleQuoted ?? unquoted ?? "";
    element.setAttribute(name, value);
  }
}

function serializeNode(node) {
  if (node.nodeType === NODE_TYPES.TEXT_NODE) return escapeHtml(node.textContent);

  const children = node.childNodes.map(serializeNode).join("");
  if (node.nodeType === NODE_TYPES.DOCUMENT_FRAGMENT_NODE) return children;

  const attributes = Array.from(node.attributes.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([name, value]) => ` ${name}="${escapeAttribute(value)}"`)
    .join("");

  return `<${node.tagName.toLowerCase()}${attributes}>${children}</${node.tagName.toLowerCase()}>`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/"/g, "&quot;");
}

async function loadRendererExports() {
  const stubbedSource = rendererSource.replace(
    'import { getArticleBySlug } from "./news-data.js?v=article-04-2";',
    "const getArticleBySlug = () => null;",
  );

  const bootstrapDocument = new FakeDocument();
  const previousDocument = global.document;
  const previousWindow = global.window;

  global.document = bootstrapDocument;
  global.window = bootstrapDocument.defaultView;

  try {
    return await import(`data:text/javascript;base64,${Buffer.from(stubbedSource).toString("base64")}`);
  } finally {
    global.document = previousDocument;
    global.window = previousWindow;
  }
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
  assert.match(rendererSource, /const href = normalizeHref\(node\.getAttribute\("href"\) \|\| ""\)/);
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

test("article renderer keeps legacy block dispatch branches in place", () => {
  assert.match(rendererSource, /if \(block\.type === "media"\) return createMedia\(article, block\)/);
  assert.match(rendererSource, /if \(block\.type === "rich"\) return createRichContent\(block\)/);
  assert.match(rendererSource, /return createParagraph\(block\)/);
});

test("sanitizeRichHtml removes unsafe markup and preserves allowed article structure at runtime", async () => {
  const { sanitizeRichHtml } = await loadRendererExports();
  const fakeDocument = new FakeDocument();

  const fragment = sanitizeRichHtml(
    [
      '<h2 onclick="evil()">Update</h2>',
      '<p>Start <strong onclick="evil()">strong</strong> and <a href="  newsfeed.html  " onclick="evil()">internal</a>.</p>',
      '<ul><li>One</li><li><script>alert(1)</script><a href="//example.com">proto-relative</a></li></ul>',
      '<p><a href="javascript:alert(1)">js</a> <a href="data:text/html,x">data</a> <a href="HTTPS://example.com" onclick="evil()">external</a></p>',
    ].join(""),
    fakeDocument,
  );

  assert.doesNotMatch(serializeNode(fragment), /<script/i);
  assert.equal(serializeNode(fragment).includes("alert(1)"), false);
  assert.equal(
    serializeNode(fragment),
    '<h2>Update</h2><p>Start <strong>strong</strong> and <a href="newsfeed.html">internal</a>.</p><ul><li>One</li><li><a>proto-relative</a></li></ul><p><a>js</a> <a>data</a> <a href="https://example.com" rel="noopener noreferrer" target="_blank">external</a></p>',
  );
});

test("createRichContent wraps sanitized rich content in the renderer container at runtime", async () => {
  const { createRichContent } = await loadRendererExports();
  const fakeDocument = new FakeDocument();

  const richContent = createRichContent(
    {
      type: "rich",
      html: '<p onclick="evil()">Lead <a href="https://example.com" onclick="evil()">story</a></p>',
    },
    fakeDocument,
  );

  assert.equal(
    serializeNode(richContent),
    '<div class="article-rich-text"><p>Lead <a href="https://example.com" rel="noopener noreferrer" target="_blank">story</a></p></div>',
  );
});
