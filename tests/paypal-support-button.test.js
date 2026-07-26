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
