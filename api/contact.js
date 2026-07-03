const RESEND_ENDPOINT = "https://api.resend.com/emails";

function json(response, statusCode, payload) {
  response.status(statusCode);
  response.setHeader("Content-Type", "application/json");
  return response.json(payload);
}

function normalizeBody(body) {
  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }

  return body && typeof body === "object" ? body : {};
}

function sanitize(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function createContactHandler(options = {}) {
  const env = options.env || process.env;
  const sendFetch = options.fetch || globalThis.fetch;

  return async function contactHandler(request, response) {
    if (request.method !== "POST") {
      response.setHeader("Allow", "POST");
      return json(response, 405, { ok: false, error: "METHOD_NOT_ALLOWED" });
    }

    const body = normalizeBody(request.body);
    const name = sanitize(body.name, 120);
    const email = sanitize(body.email, 180);
    const message = sanitize(body.message, 4000);

    if (!name || !isEmail(email) || !message) {
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
      });

      if (!result.ok) {
        return json(response, 502, { ok: false, error: "MAIL_SEND_FAILED" });
      }

      return json(response, 200, { ok: true });
    } catch {
      return json(response, 502, { ok: false, error: "MAIL_SEND_FAILED" });
    }
  };
}

module.exports = createContactHandler();
module.exports.createContactHandler = createContactHandler;
