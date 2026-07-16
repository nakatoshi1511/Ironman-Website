# Contact Form Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Das Kontaktformular erhält strikte Request-Validierung, einen unsichtbaren Honeypot, einen Resend-Timeout, nicht cachebare Antworten, datensparsame Fehlerlogs, vollständige Fehlerpfadtests und eine aktualisierte Datenschutzbeschreibung.

**Architecture:** `api/contact.js` bleibt eine kleine injizierbare Vercel Function und kapselt Request-Prüfung sowie Resend-Aufruf. Die Browserlogik wandert aus dem Inline-Skript nach `mockups/contact-form.js`; HTML, CSS, Datenschutz und Deployment-Allowlist werden gemeinsam durch einen Seitentest abgesichert. Plattformmaßnahmen wie WAF Rate Limiting und Resend-Key-Konfiguration bleiben ein separates Folgepaket.

**Tech Stack:** Node.js CommonJS, `node:test`, statisches HTML/CSS/JavaScript, Vercel Functions, Resend REST API.

## Global Constraints

- Gesamter JSON-Body: maximal 12.000 Bytes.
- Name: maximal 120 Zeichen; E-Mail-Adresse: maximal 180 Zeichen; Nachricht: maximal 4.000 Zeichen.
- Erlaubter Content-Type: `application/json`, optional mit Parametern wie `charset=utf-8`.
- Produktions-Timeout für Resend: 8.000 Millisekunden.
- Honeypot-Feldname: `company_website`; ein nicht leerer String antwortet erfolgreich, versendet aber keine E-Mail.
- Logs dürfen weder Name, E-Mail, Nachricht, Request-Body, Empfängeradresse noch API-Key enthalten.
- Kein CAPTCHA, kein Origin-Check, keine Idempotency-Key-Logik und keine Dashboard-Konfiguration.
- Kein Push, Preview-Deployment oder Production-Deployment.
- Sichtbares Formularverhalten und Layout bleiben unverändert.

---

## Dateistruktur

- Modify: `api/contact.js` — Request-Grenzen, Feldvalidierung, Honeypot, Timeout, Header und sichere Logs.
- Modify: `tests/contact.test.js` — API-Erfolgs- und Fehlerpfade.
- Create: `mockups/contact-form.js` — ausgelagerte Browserlogik.
- Modify: `mockups/impressum.html` — Honeypot, Maximalwerte und externe Script-Referenz.
- Modify: `mockups/styles.css` — Honeypot ohne sichtbaren Layoutplatz.
- Modify: `mockups/datenschutz.html` — tatsächlicher Resend-Datenfluss und Aktualisierungsdatum.
- Create: `tests/contact-form-page.test.js` — HTML/CSS/JS/Datenschutz-Vertrag.
- Modify: `.vercelignore` — `mockups/contact-form.js` freigeben.
- Modify: `PROJECT_CONTEXT.md` — gehärteten Formularstand und offene Plattformmaßnahmen dokumentieren.

### Task 1: API testgetrieben härten

**Files:**
- Modify: `tests/contact.test.js`
- Modify: `api/contact.js`

**Interfaces:**
- Consumes: `createContactHandler({ env, fetch, timeoutMs, logger })`.
- Produces: Vercel-Handler mit JSON-only, 12.000-Byte-Grenze, streng validierten Feldern, Honeypot, AbortSignal und sicheren Standardheadern.

- [ ] **Step 1: Test-Request und Logger-Helfer erweitern**

Replace `createRequest` in `tests/contact.test.js` and add `createMockLogger`:

```js
function createRequest({
  method = "POST",
  body = {},
  headers = { "content-type": "application/json" },
} = {}) {
  return { method, body, headers };
}

function createMockLogger() {
  const entries = [];
  return {
    entries,
    error(event, details) {
      entries.push({ event, details });
    },
  };
}
```

- [ ] **Step 2: Failing API-Tests ergänzen**

Append these tests to `tests/contact.test.js`:

```js
test("adds non-cacheable JSON security headers", async () => {
  const handler = createContactHandler();
  const response = createMockResponse();
  await handler(createRequest({ method: "GET" }), response);
  assert.equal(response.headers["Cache-Control"], "no-store");
  assert.equal(response.headers["X-Content-Type-Options"], "nosniff");
  assert.equal(response.headers["Content-Type"], "application/json; charset=utf-8");
});

test("rejects unsupported content types", async () => {
  const handler = createContactHandler();
  const response = createMockResponse();
  await handler(createRequest({ headers: { "content-type": "text/plain" } }), response);
  assert.equal(response.statusCode, 415);
  assert.equal(JSON.parse(response.body).error, "UNSUPPORTED_MEDIA_TYPE");
});

test("accepts JSON content type with charset", async () => {
  const handler = createContactHandler();
  const response = createMockResponse();
  await handler(createRequest({ headers: { "Content-Type": "application/json; charset=utf-8" } }), response);
  assert.notEqual(response.statusCode, 415);
});

test("rejects oversized requests from content-length and measured body size", async () => {
  for (const request of [
    createRequest({ headers: { "content-type": "application/json", "content-length": "12001" } }),
    createRequest({ body: JSON.stringify({ message: "x".repeat(12001) }) }),
  ]) {
    const handler = createContactHandler();
    const response = createMockResponse();
    await handler(request, response);
    assert.equal(response.statusCode, 413);
    assert.equal(JSON.parse(response.body).error, "PAYLOAD_TOO_LARGE");
  }
});

test("distinguishes invalid JSON from field validation", async () => {
  const handler = createContactHandler();
  const response = createMockResponse();
  await handler(createRequest({ body: "{" }), response);
  assert.equal(response.statusCode, 400);
  assert.equal(JSON.parse(response.body).error, "INVALID_JSON");
});

test("rejects non-string and overlong fields", async () => {
  for (const body of [
    { name: ["David"], email: "david@example.com", message: "Hallo" },
    { name: "x".repeat(121), email: "david@example.com", message: "Hallo" },
    { name: "David", email: "x".repeat(181), message: "Hallo" },
    { name: "David", email: "not-an-email", message: "Hallo" },
    { name: "David", email: "david@example.com", message: "x".repeat(4001) },
  ]) {
    const handler = createContactHandler();
    const response = createMockResponse();
    await handler(createRequest({ body }), response);
    assert.equal(response.statusCode, 400);
    assert.equal(JSON.parse(response.body).error, "VALIDATION_ERROR");
  }
});

test("silently accepts honeypot submissions without sending mail", async () => {
  let sends = 0;
  const handler = createContactHandler({
    env: { RESEND_API_KEY: "re_test", CONTACT_FROM_EMAIL: "kontakt@example.com" },
    fetch: async () => { sends += 1; return { ok: true }; },
  });
  const response = createMockResponse();
  await handler(createRequest({ body: { company_website: "https://spam.test" } }), response);
  assert.equal(response.statusCode, 200);
  assert.deepEqual(JSON.parse(response.body), { ok: true });
  assert.equal(sends, 0);
});

test("reports missing mail configuration", async () => {
  const handler = createContactHandler({ env: {} });
  const response = createMockResponse();
  await handler(createRequest({ body: { name: "David", email: "david@example.com", message: "Hallo" } }), response);
  assert.equal(response.statusCode, 500);
  assert.equal(JSON.parse(response.body).error, "MAIL_NOT_CONFIGURED");
});

test("logs only status metadata for Resend failures", async () => {
  const logger = createMockLogger();
  const handler = createContactHandler({
    env: { RESEND_API_KEY: "re_test", CONTACT_FROM_EMAIL: "kontakt@example.com" },
    fetch: async () => ({ ok: false, status: 429 }),
    logger,
  });
  const response = createMockResponse();
  await handler(createRequest({ body: { name: "Max", email: "max@example.com", message: "Privat" } }), response);
  assert.equal(response.statusCode, 502);
  assert.deepEqual(logger.entries, [{ event: "contact_mail_failed", details: { status: 429 } }]);
  assert.doesNotMatch(JSON.stringify(logger.entries), /Max|max@example|Privat|re_test/);
});

test("handles network failures without logging personal data", async () => {
  const logger = createMockLogger();
  const handler = createContactHandler({
    env: { RESEND_API_KEY: "re_test", CONTACT_FROM_EMAIL: "kontakt@example.com" },
    fetch: async () => { throw new TypeError("network failed"); },
    logger,
  });
  const response = createMockResponse();
  await handler(createRequest({ body: { name: "Max", email: "max@example.com", message: "Privat" } }), response);
  assert.equal(response.statusCode, 502);
  assert.deepEqual(logger.entries, [{ event: "contact_mail_request_failed", details: { name: "TypeError" } }]);
});

test("aborts a hanging Resend request after the configured timeout", async () => {
  const logger = createMockLogger();
  let receivedSignal;
  const handler = createContactHandler({
    env: { RESEND_API_KEY: "re_test", CONTACT_FROM_EMAIL: "kontakt@example.com" },
    timeoutMs: 5,
    logger,
    fetch: async (_url, options) => {
      receivedSignal = options.signal;
      return new Promise((_resolve, reject) => {
        options.signal.addEventListener("abort", () => {
          const error = new Error("aborted");
          error.name = "AbortError";
          reject(error);
        }, { once: true });
      });
    },
  });
  const response = createMockResponse();
  await handler(createRequest({ body: { name: "Max", email: "max@example.com", message: "Hallo" } }), response);
  assert.equal(receivedSignal.aborted, true);
  assert.equal(response.statusCode, 502);
  assert.deepEqual(logger.entries, [{ event: "contact_mail_request_failed", details: { name: "AbortError" } }]);
});
```

- [ ] **Step 3: API-Test RED bestätigen**

Run:

```powershell
node --test tests/contact.test.js
```

Expected: neue Tests schlagen wegen fehlender Header, Content-Type-/Größenprüfung, Honeypot, Logging und Timeout fehl; die drei vorhandenen Tests bleiben aussagekräftig.

- [ ] **Step 4: `api/contact.js` vollständig härten**

Replace `api/contact.js` with:

```js
const RESEND_ENDPOINT = "https://api.resend.com/emails";
const MAX_BODY_BYTES = 12000;
const DEFAULT_TIMEOUT_MS = 8000;
const FIELD_LIMITS = { name: 120, email: 180, message: 4000 };

function json(response, statusCode, payload) {
  response.status(statusCode);
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("X-Content-Type-Options", "nosniff");
  return response.json(payload);
}

function getHeader(request, name) {
  if (request.headers && typeof request.headers.get === "function") {
    return request.headers.get(name) || "";
  }
  const headers = request.headers || {};
  const key = Object.keys(headers).find((candidate) => candidate.toLowerCase() === name.toLowerCase());
  return key ? String(headers[key]) : "";
}

function bodySize(body) {
  try {
    const serialized = typeof body === "string" ? body : JSON.stringify(body || {});
    return Buffer.byteLength(serialized, "utf8");
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}

function normalizeBody(body) {
  if (typeof body === "string") {
    try {
      const parsed = JSON.parse(body);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }
  return body && typeof body === "object" && !Array.isArray(body) ? body : null;
}

function normalizeField(value, maxLength) {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized && normalized.length <= maxLength ? normalized : null;
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function createContactHandler(options = {}) {
  const env = options.env || process.env;
  const sendFetch = options.fetch || globalThis.fetch;
  const logger = options.logger || console;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  return async function contactHandler(request, response) {
    if (request.method !== "POST") {
      response.setHeader("Allow", "POST");
      return json(response, 405, { ok: false, error: "METHOD_NOT_ALLOWED" });
    }

    const contentType = getHeader(request, "content-type");
    if (!/^application\/json(?:\s*;|$)/i.test(contentType)) {
      return json(response, 415, { ok: false, error: "UNSUPPORTED_MEDIA_TYPE" });
    }

    const declaredLength = Number(getHeader(request, "content-length"));
    if ((Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) || bodySize(request.body) > MAX_BODY_BYTES) {
      return json(response, 413, { ok: false, error: "PAYLOAD_TOO_LARGE" });
    }

    const body = normalizeBody(request.body);
    if (!body) return json(response, 400, { ok: false, error: "INVALID_JSON" });

    if (typeof body.company_website === "string" && body.company_website.trim()) {
      return json(response, 200, { ok: true });
    }

    const name = normalizeField(body.name, FIELD_LIMITS.name);
    const email = normalizeField(body.email, FIELD_LIMITS.email);
    const message = normalizeField(body.message, FIELD_LIMITS.message);
    if (!name || !email || !isEmail(email) || !message) {
      return json(response, 400, { ok: false, error: "VALIDATION_ERROR" });
    }

    if (!env.RESEND_API_KEY || !env.CONTACT_FROM_EMAIL) {
      return json(response, 500, { ok: false, error: "MAIL_NOT_CONFIGURED" });
    }

    const to = env.CONTACT_TO_EMAIL || "david91simon@gmail.com";
    const text = [
      "Neue Anfrage ueber road-to-hawaii.de",
      "",
      `Name: ${name}`,
      `E-Mail: ${email}`,
      "",
      "Nachricht:",
      message,
    ].join("\n");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const result = await sendFetch(RESEND_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: env.CONTACT_FROM_EMAIL,
          to,
          reply_to: email,
          subject: "Anfrage Road to Hawaii",
          text,
        }),
        signal: controller.signal,
      });

      if (!result.ok) {
        logger.error("contact_mail_failed", { status: Number(result.status) || null });
        return json(response, 502, { ok: false, error: "MAIL_SEND_FAILED" });
      }
      return json(response, 200, { ok: true });
    } catch (error) {
      logger.error("contact_mail_request_failed", { name: error?.name || "Error" });
      return json(response, 502, { ok: false, error: "MAIL_SEND_FAILED" });
    } finally {
      clearTimeout(timeout);
    }
  };
}

module.exports = createContactHandler();
module.exports.createContactHandler = createContactHandler;
```

- [ ] **Step 5: API-Test GREEN und Gesamtsuite prüfen**

Run:

```powershell
node --test tests/contact.test.js
node --test
```

Expected: sämtliche Kontakt- und Bestandstests bestehen.

- [ ] **Step 6: API-Härtung committen**

```powershell
git add -- api/contact.js tests/contact.test.js
git commit -m "feat: harden contact form API"
```

### Task 2: Honeypot, externe Browserlogik und Datenschutz

**Files:**
- Create: `tests/contact-form-page.test.js`
- Create: `mockups/contact-form.js`
- Modify: `mockups/impressum.html`
- Modify: `mockups/styles.css`
- Modify: `mockups/datenschutz.html`
- Modify: `.vercelignore`

**Interfaces:**
- Consumes: `POST /api/contact` aus Task 1 und Feldname `company_website`.
- Produces: CSP-freundliches externes Formularskript, unsichtbaren Honeypot und dokumentierten Resend-Datenfluss.

- [ ] **Step 1: Failing Seitentest erstellen**

Create `tests/contact-form-page.test.js`:

```js
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
  assert.match(html, /<script src="contact-form\.js\?v=contact-1" defer><\/script>/);
  assert.doesNotMatch(html, /const contactForm =/);
  assert.match(css, /\.contact-honeypot\s*\{[^}]*position:\s*absolute;[^}]*left:\s*-10000px;/s);
});

test("contact browser script sends the honeypot with the JSON payload", () => {
  const script = read("mockups/contact-form.js");
  assert.match(script, /company_website:\s*String\(formData\.get\("company_website"\)/);
  assert.match(script, /fetch\("\/api\/contact"/);
  assert.match(script, /"Content-Type":\s*"application\/json"/);
});

test("privacy notice documents Resend and the current revision date", () => {
  const privacy = read("mockups/datenschutz.html");
  assert.match(privacy, /E-Mail-Dienst Resend/);
  assert.match(privacy, /https:\/\/resend\.com\/legal\/privacy-policy/);
  assert.match(privacy, /Stand: 16\.07\.2026/);
});

test("Vercel deployment includes the external contact script", () => {
  assert.match(read(".vercelignore"), /!mockups\/contact-form\.js/);
});
```

- [ ] **Step 2: Seitentest RED bestätigen**

Run:

```powershell
node --test tests/contact-form-page.test.js tests/vercel-deployment-boundary.test.js
```

Expected: Seitentest schlägt wegen fehlendem Honeypot, Skript, Resend-Text und Allowlist-Eintrag fehl.

- [ ] **Step 3: Externes Browser-Skript erstellen**

Move the former inline behavior to `mockups/contact-form.js` and include `company_website` in `payload`:

```js
const contactForm = document.querySelector("[data-contact-form]");

if (contactForm) {
  const status = contactForm.querySelector("[data-form-status]");
  const submitButton = contactForm.querySelector("button[type='submit']");

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(contactForm);
    const payload = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      message: String(formData.get("message") || "").trim(),
      company_website: String(formData.get("company_website") || "").trim(),
    };

    if (status) {
      status.textContent = "Anfrage wird gesendet ...";
      status.dataset.state = "pending";
    }
    if (submitButton) submitButton.disabled = true;

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("request failed");
      contactForm.reset();
      if (status) {
        status.textContent = "Vielen Dank. Die Anfrage wurde gesendet.";
        status.dataset.state = "success";
      }
    } catch {
      if (status) {
        status.textContent = "Die Anfrage konnte nicht gesendet werden. Bitte nutzen Sie alternativ die oben angegebene E-Mail-Adresse.";
        status.dataset.state = "error";
      }
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
}
```

- [ ] **Step 4: HTML, CSS, Datenschutz und Allowlist anpassen**

In `mockups/impressum.html` add matching `maxlength` attributes, add this field before the button, remove the inline script, and add the external script before `</body>`:

```html
<label class="contact-honeypot" aria-hidden="true">
  <span>Website</span>
  <input name="company_website" type="text" tabindex="-1" autocomplete="off" />
</label>
<script src="contact-form.js?v=contact-1" defer></script>
```

Use `maxlength="120"` for name, `maxlength="180"` for email, and `maxlength="4000"` for message.

Add to `mockups/styles.css` directly after `.legal-contact-form label`:

```css
.legal-contact-form .contact-honeypot {
  position: absolute;
  left: -10000px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}
```

Add this paragraph to section 5 of `mockups/datenschutz.html`:

```html
<p>
  F&uuml;r den technischen Versand von Formularnachrichten nutzen wir den
  E-Mail-Dienst Resend. Die im Formular eingegebenen Daten werden hierzu an
  Resend &uuml;bermittelt und dort f&uuml;r den E-Mail-Versand verarbeitet.
  Weitere Informationen finden Sie unter:
  <a href="https://resend.com/legal/privacy-policy" rel="noreferrer" target="_blank">
    https://resend.com/legal/privacy-policy
  </a>
</p>
```

Change the revision text to `Stand: 16.07.2026.` and add `!mockups/contact-form.js` beside the other allowed runtime scripts in `.vercelignore`.

- [ ] **Step 5: Seitentest und Gesamtsuite GREEN prüfen**

Run:

```powershell
node --test tests/contact-form-page.test.js tests/vercel-deployment-boundary.test.js
node --test
```

Expected: neue Seitentests, Deployment-Grenze und vollständige Suite bestehen.

- [ ] **Step 6: Browser- und Datenschutzänderungen committen**

```powershell
git add -- mockups/contact-form.js mockups/impressum.html mockups/styles.css mockups/datenschutz.html .vercelignore tests/contact-form-page.test.js
git commit -m "feat: add contact form bot protection"
```

### Task 3: Projektkontext und Abschlussprüfung

**Files:**
- Modify: `PROJECT_CONTEXT.md`

**Interfaces:**
- Consumes: gehärtetes API und Frontend aus Task 1 und 2.
- Produces: aktuellen Betriebs- und Folgearbeitskontext.

- [ ] **Step 1: Kontaktformular-Abschnitt aktualisieren**

Add these bullets to `## Kontaktformular` in `PROJECT_CONTEXT.md`:

```markdown
- API akzeptiert ausschließlich JSON bis 12.000 Bytes und setzt `Cache-Control: no-store`.
- Feldgrenzen: Name 120, E-Mail 180, Nachricht 4.000 Zeichen.
- Ein unsichtbares Feld `company_website` dient als Honeypot; Treffer lösen keinen Resend-Aufruf aus.
- Resend-Aufrufe werden nach 8 Sekunden abgebrochen; Fehlerlogs enthalten keine Formulardaten.
- Browserlogik: `mockups/contact-form.js`.
- Offen als Plattformschritt: Vercel Rate Limiting für `POST /api/contact`, Resend-Schlüssel mit `sending_access` und Prüfung der Absenderdomain.
```

- [ ] **Step 2: Dokumentation prüfen und committen**

Run:

```powershell
git diff --check
git diff -- PROJECT_CONTEXT.md
```

Then:

```powershell
git add -- PROJECT_CONTEXT.md
git commit -m "docs: document contact form security"
```

- [ ] **Step 3: Syntax und vollständige Tests frisch ausführen**

Run:

```powershell
node --check api/contact.js
node --check mockups/contact-form.js
node --test
```

Expected: Syntaxprüfungen ohne Fehler; gesamte Suite mit 0 Fehlschlägen.

- [ ] **Step 4: Sichtbare In-App-Browser-Prüfung durchführen**

Open only in the visible in-app browser:

```text
http://127.0.0.1:4173/mockups/impressum.html
```

Verify desktop and 390px mobile:

- genau drei sichtbare Eingabefelder
- kein sichtbarer Honeypot und kein zusätzlicher Abstand
- Button und Statusbereich unverändert
- keine Browser-Konsolefehler beim Laden

- [ ] **Step 5: Abschlussstatus prüfen**

Run:

```powershell
git status --short --branch
git diff --check main...HEAD
git log --oneline --decorate main..HEAD
```

Expected: sauberer Branch `codex/contact-form-hardening`; kein Push und kein Deployment.
