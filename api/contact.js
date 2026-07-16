const RESEND_ENDPOINT = "https://api.resend.com/emails";
const MAX_BODY_BYTES = 12000;
const DEFAULT_TIMEOUT_MS = 8000;
const FIELD_LIMITS = {
  name: 120,
  email: 180,
  message: 4000,
};

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
  const key = Object.keys(headers).find(
    (candidate) => candidate.toLowerCase() === name.toLowerCase(),
  );
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
  if (typeof value !== "string") {
    return null;
  }

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
    if (
      (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) ||
      bodySize(request.body) > MAX_BODY_BYTES
    ) {
      return json(response, 413, { ok: false, error: "PAYLOAD_TOO_LARGE" });
    }

    const body = normalizeBody(request.body);
    if (!body) {
      return json(response, 400, { ok: false, error: "INVALID_JSON" });
    }

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
        logger.error("contact_mail_failed", {
          status: Number(result.status) || null,
        });
        return json(response, 502, { ok: false, error: "MAIL_SEND_FAILED" });
      }

      return json(response, 200, { ok: true });
    } catch (error) {
      logger.error("contact_mail_request_failed", {
        name: error?.name || "Error",
      });
      return json(response, 502, { ok: false, error: "MAIL_SEND_FAILED" });
    } finally {
      clearTimeout(timeout);
    }
  };
}

module.exports = createContactHandler();
module.exports.createContactHandler = createContactHandler;
