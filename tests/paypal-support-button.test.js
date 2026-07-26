const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const pagePath = path.join(__dirname, "..", "mockups", "landingpage-flow.html");
const stylesPath = path.join(__dirname, "..", "mockups", "styles.css");

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

test("partner actions include a secure text-only PayPal support link", () => {
  const html = read(pagePath);
  const paypalLink = html.match(
    /<a\s+class="button primary paypal-support-button"\s+href="https:\/\/www\.paypal\.com\/pool\/9rcUXMFriT\?sr=accr"\s+target="_blank"\s+rel="noopener noreferrer"\s*>([\s\S]*?)<\/a>/,
  );

  assert.ok(paypalLink, "PayPal support link must use the approved destination and security attributes");
  assert.match(paypalLink[1], /Mit PayPal unterst\u00fctzen/);
  assert.doesNotMatch(paypalLink[1], /paypal-triathlon-icon|paypal-discipline|<svg/);
});

test("PayPal support button keeps the approved desktop and mobile layout", () => {
  const css = read(stylesPath);

  assert.match(
    css,
    /\.partner-actions\s*\{[\s\S]*?display:\s*grid;[\s\S]*?grid-template-columns:\s*max-content max-content;/,
  );
  assert.match(
    css,
    /\.paypal-support-button\s*\{[\s\S]*?grid-column:\s*1\s*\/\s*-1;[\s\S]*?justify-self:\s*start;/,
  );
  assert.match(
    css,
    /@media \(max-width:\s*560px\)[\s\S]*?\.partner-actions\s*\{[\s\S]*?grid-template-columns:\s*1fr;[\s\S]*?\}[\s\S]*?\.paypal-support-button\s*\{[\s\S]*?grid-column:\s*1;[\s\S]*?justify-self:\s*stretch;/,
  );
});

test("PayPal support button does not ship animation or icon styles", () => {
  const html = read(pagePath);
  const css = read(stylesPath);

  assert.doesNotMatch(html, /paypal-triathlon-icon|paypal-discipline/);
  assert.doesNotMatch(
    css,
    /paypal-triathlon-icon|paypal-discipline|paypalDisciplineShow|paypalSpin|paypalKick|paypalLeg|paypalArm|paypalBob|paypalSlide/,
  );
});
