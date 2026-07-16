const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.join(__dirname, "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");

test("contact page uses an invisible honeypot and external script", () => {
  const html = read("mockups/impressum.html");
  const css = read("mockups/styles.css");

  assert.match(html, /name="company_website"/);
  assert.match(html, /class="contact-honeypot"[^>]*aria-hidden="true"/);
  assert.match(html, /href="styles\.css\?v=legal-6"/);
  assert.match(html, /<script src="contact-form\.js\?v=contact-1" defer><\/script>/);
  assert.doesNotMatch(html, /const contactForm =/);
  assert.match(
    css,
    /\.contact-honeypot\s*\{[^}]*position:\s*absolute;[^}]*left:\s*-10000px;/s,
  );
});

test("contact browser script sends the honeypot with the JSON payload", () => {
  const script = read("mockups/contact-form.js");

  assert.match(
    script,
    /company_website:\s*String\(formData\.get\("company_website"\)/,
  );
  assert.match(script, /fetch\("\/api\/contact"/);
  assert.match(script, /"Content-Type":\s*"application\/json"/);
});

test("privacy notice documents Resend and the current revision date", () => {
  const privacy = read("mockups/datenschutz.html");

  assert.match(privacy, /E-Mail-Dienst Resend/);
  assert.match(privacy, /https:\/\/resend\.com\/legal\/privacy-policy/);
  assert.match(privacy, /Stand: 16\.07\.2026/);
  assert.match(privacy, /href="styles\.css\?v=legal-6"/);
});

test("Vercel deployment includes the external contact script", () => {
  assert.match(read(".vercelignore"), /!mockups\/contact-form\.js/);
});
