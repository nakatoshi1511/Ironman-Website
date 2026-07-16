const test = require("node:test");
const assert = require("node:assert/strict");

const { createContactHandler } = require("../api/contact");

function createMockResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: "",
    status(code) {
      this.statusCode = code;
      return this;
    },
    setHeader(name, value) {
      this.headers[name] = value;
    },
    json(payload) {
      this.body = JSON.stringify(payload);
      return this;
    },
  };
}

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

test("rejects non-POST requests", async () => {
  const handler = createContactHandler();
  const response = createMockResponse();

  await handler(createRequest({ method: "GET" }), response);

  assert.equal(response.statusCode, 405);
  assert.deepEqual(JSON.parse(response.body), {
    ok: false,
    error: "METHOD_NOT_ALLOWED",
  });
});

test("rejects missing form fields", async () => {
  const handler = createContactHandler();
  const response = createMockResponse();

  await handler(createRequest({ body: { name: "David", email: "", message: "" } }), response);

  assert.equal(response.statusCode, 400);
  assert.deepEqual(JSON.parse(response.body), {
    ok: false,
    error: "VALIDATION_ERROR",
  });
});

test("sends contact mail through Resend", async () => {
  const sent = [];
  const handler = createContactHandler({
    env: {
      RESEND_API_KEY: "re_test",
      CONTACT_FROM_EMAIL: "Road to Hawaii <kontakt@example.com>",
      CONTACT_TO_EMAIL: "david@example.com",
    },
    fetch: async (url, options) => {
      sent.push({ url, options });
      return { ok: true, json: async () => ({ id: "email_123" }) };
    },
  });
  const response = createMockResponse();

  await handler(
    createRequest({
      body: {
        name: "Max Muster",
        email: "max@example.com",
        message: "Ich moechte Sponsor werden.",
      },
    }),
    response,
  );

  assert.equal(response.statusCode, 200);
  assert.deepEqual(JSON.parse(response.body), { ok: true });
  assert.equal(sent.length, 1);
  assert.equal(sent[0].url, "https://api.resend.com/emails");
  assert.equal(sent[0].options.headers.Authorization, "Bearer re_test");

  const payload = JSON.parse(sent[0].options.body);
  assert.equal(payload.from, "Road to Hawaii <kontakt@example.com>");
  assert.equal(payload.to, "david@example.com");
  assert.equal(payload.reply_to, "max@example.com");
  assert.match(payload.text, /Max Muster/);
  assert.match(payload.text, /Ich moechte Sponsor werden\./);
});

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

  await handler(
    createRequest({ headers: { "Content-Type": "application/json; charset=utf-8" } }),
    response,
  );

  assert.notEqual(response.statusCode, 415);
});

test("rejects oversized requests from content-length and measured body size", async () => {
  const requests = [
    createRequest({
      headers: { "content-type": "application/json", "content-length": "12001" },
    }),
    createRequest({ body: JSON.stringify({ message: "x".repeat(12001) }) }),
  ];

  for (const request of requests) {
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

test("rejects non-string, invalid, and overlong fields", async () => {
  const bodies = [
    { name: ["David"], email: "david@example.com", message: "Hallo" },
    { name: "x".repeat(121), email: "david@example.com", message: "Hallo" },
    { name: "David", email: "x".repeat(181), message: "Hallo" },
    { name: "David", email: "not-an-email", message: "Hallo" },
    { name: "David", email: "david@example.com", message: "x".repeat(4001) },
  ];

  for (const body of bodies) {
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
    env: {
      RESEND_API_KEY: "re_test",
      CONTACT_FROM_EMAIL: "kontakt@example.com",
    },
    fetch: async () => {
      sends += 1;
      return { ok: true };
    },
  });
  const response = createMockResponse();

  await handler(
    createRequest({ body: { company_website: "https://spam.test" } }),
    response,
  );

  assert.equal(response.statusCode, 200);
  assert.deepEqual(JSON.parse(response.body), { ok: true });
  assert.equal(sends, 0);
});

test("reports missing mail configuration", async () => {
  const handler = createContactHandler({ env: {} });
  const response = createMockResponse();

  await handler(
    createRequest({
      body: { name: "David", email: "david@example.com", message: "Hallo" },
    }),
    response,
  );

  assert.equal(response.statusCode, 500);
  assert.equal(JSON.parse(response.body).error, "MAIL_NOT_CONFIGURED");
});

test("logs only status metadata for Resend failures", async () => {
  const logger = createMockLogger();
  const handler = createContactHandler({
    env: {
      RESEND_API_KEY: "re_test",
      CONTACT_FROM_EMAIL: "kontakt@example.com",
    },
    fetch: async () => ({ ok: false, status: 429 }),
    logger,
  });
  const response = createMockResponse();

  await handler(
    createRequest({
      body: { name: "Max", email: "max@example.com", message: "Privat" },
    }),
    response,
  );

  assert.equal(response.statusCode, 502);
  assert.deepEqual(logger.entries, [
    { event: "contact_mail_failed", details: { status: 429 } },
  ]);
  assert.doesNotMatch(JSON.stringify(logger.entries), /Max|max@example|Privat|re_test/);
});

test("handles network failures without logging personal data", async () => {
  const logger = createMockLogger();
  const handler = createContactHandler({
    env: {
      RESEND_API_KEY: "re_test",
      CONTACT_FROM_EMAIL: "kontakt@example.com",
    },
    fetch: async () => {
      throw new TypeError("network failed");
    },
    logger,
  });
  const response = createMockResponse();

  await handler(
    createRequest({
      body: { name: "Max", email: "max@example.com", message: "Privat" },
    }),
    response,
  );

  assert.equal(response.statusCode, 502);
  assert.deepEqual(logger.entries, [
    { event: "contact_mail_request_failed", details: { name: "TypeError" } },
  ]);
});

test("aborts a hanging Resend request after the configured timeout", async () => {
  const logger = createMockLogger();
  let receivedSignal;
  const handler = createContactHandler({
    env: {
      RESEND_API_KEY: "re_test",
      CONTACT_FROM_EMAIL: "kontakt@example.com",
    },
    timeoutMs: 5,
    logger,
    fetch: async (_url, options) => {
      receivedSignal = options.signal;
      return new Promise((_resolve, reject) => {
        options.signal.addEventListener(
          "abort",
          () => {
            const error = new Error("aborted");
            error.name = "AbortError";
            reject(error);
          },
          { once: true },
        );
      });
    },
  });
  const response = createMockResponse();

  await handler(
    createRequest({
      body: { name: "Max", email: "max@example.com", message: "Hallo" },
    }),
    response,
  );

  assert.equal(receivedSignal.aborted, true);
  assert.equal(response.statusCode, 502);
  assert.deepEqual(logger.entries, [
    { event: "contact_mail_request_failed", details: { name: "AbortError" } },
  ]);
});
