const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const pagePath = path.join(__dirname, "..", "mockups", "landingpage-flow.html");
const stylesPath = path.join(__dirname, "..", "mockups", "styles.css");

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

test("partner actions include the secure PayPal support link and all three disciplines", () => {
  const html = read(pagePath);
  const paypalLink = html.match(
    /<a\s+class="button primary paypal-support-button"\s+href="https:\/\/www\.paypal\.com\/pool\/9rcUXMFriT\?sr=accr"\s+target="_blank"\s+rel="noopener noreferrer"\s*>([\s\S]*?)<\/a>/,
  );

  assert.ok(paypalLink, "PayPal support link must use the approved destination and security attributes");
  assert.match(paypalLink[1], /<span class="paypal-triathlon-icon" aria-hidden="true">/);
  assert.match(paypalLink[1], /<svg\s+class="paypal-discipline paypal-discipline-swim"/);
  assert.match(paypalLink[1], /<svg\s+class="paypal-discipline paypal-discipline-bike"/);
  assert.match(paypalLink[1], /<svg\s+class="paypal-discipline paypal-discipline-run"/);
  assert.match(paypalLink[1], /Mit PayPal unterstützen/);
});

test("PayPal support button keeps the approved desktop and mobile layout", () => {
  const css = read(stylesPath);

  assert.match(
    css,
    /\.partner-actions\s*\{[\s\S]*?display:\s*grid;[\s\S]*?grid-template-columns:\s*max-content max-content;/,
  );
  assert.match(
    css,
    /\.paypal-support-button\s*\{[\s\S]*?grid-column:\s*1\s*\/\s*-1;[\s\S]*?justify-self:\s*start;[\s\S]*?gap:\s*10px;/,
  );
  assert.match(
    css,
    /@media \(max-width:\s*560px\)[\s\S]*?\.partner-actions\s*\{[\s\S]*?grid-template-columns:\s*1fr;[\s\S]*?\}[\s\S]*?\.paypal-support-button\s*\{[\s\S]*?grid-column:\s*1;[\s\S]*?justify-self:\s*stretch;/,
  );
});

test("PayPal triathlon animation cycles for six seconds and respects reduced motion", () => {
  const css = read(stylesPath);

  assert.match(css, /\.paypal-discipline-swim\s*\{[\s\S]*?animation:\s*paypalDisciplineShow 6s linear 0s infinite;/);
  assert.match(css, /\.paypal-discipline-bike\s*\{[\s\S]*?animation:\s*paypalDisciplineShow 6s linear 2s infinite;/);
  assert.match(css, /\.paypal-discipline-run\s*\{[\s\S]*?animation:\s*paypalDisciplineShow 6s linear 4s infinite;/);
  assert.match(
    css,
    /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.paypal-triathlon-icon \*[\s\S]*?animation:\s*none !important;[\s\S]*?\.paypal-discipline-swim\s*\{[\s\S]*?opacity:\s*1;/,
  );
});
