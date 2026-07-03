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

function createRequest({ method = "POST", body = {} } = {}) {
  return { method, body };
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
