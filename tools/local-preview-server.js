const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");

const publicRoutes = {
  "/": "mockups/landingpage-flow.html",
  "/news": "mockups/newsfeed.html",
  "/news/autohaus-schaden-subaru-als-exklusivpartner-auf-dem-weg-nach-hawaii":
    "mockups/newsfeed-autohaus-schaden-subaru-als-exklusivpartner-auf-dem-weg-nach-hawaii.html",
  "/news/zimmerei-schnorbach-als-partner-auf-dem-weg-nach-hawaii":
    "mockups/newsfeed-zimmerei-schnorbach-als-partner-auf-dem-weg-nach-hawaii.html",
  "/news/ein-erstes-fazit-nach-vier-wochen-konzentrierter-vorbereitung":
    "mockups/newsfeed-ein-erstes-fazit-nach-vier-wochen-konzentrierter-vorbereitung.html",
  "/news/powerhouse-maifeld-gym-als-partner-auf-dem-weg-nach-hawaii":
    "mockups/newsfeed-powerhouse-maifeld-gym-als-partner-auf-dem-weg-nach-hawaii.html",
  "/news/eisdiele-bortolot-als-partner-auf-dem-weg-nach-hawaii":
    "mockups/newsfeed-eisdiele-bortolot-als-partner-auf-dem-weg-nach-hawaii.html",
  "/news/17-stunden-zum-ruhm": "mockups/newsfeed-17-stunden-zum-ruhm.html",
  "/news/trainingsauftakt-in-der-toskana": "mockups/newsfeed-trainingsauftakt-in-der-toskana.html",
  "/news/zu-gast-im-podcast-moselmomente": "mockups/newsfeed-zu-gast-im-podcast-moselmomente.html",
  "/impressum": "mockups/impressum.html",
  "/datenschutz": "mockups/datenschutz.html",
};

const contentTypes = {
  ".avif": "image/avif",
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function resolveFilePath(projectRoot, pathname) {
  let decodedPathname;

  try {
    decodedPathname = decodeURIComponent(pathname);
  } catch {
    return null;
  }

  const relativePath = publicRoutes[decodedPathname] ?? decodedPathname.replace(/^\/+/, "");
  const filePath = path.resolve(projectRoot, relativePath);

  if (filePath !== projectRoot && !filePath.startsWith(`${projectRoot}${path.sep}`)) {
    return null;
  }

  return filePath;
}

function localizeLandingNavigation(filePath, content) {
  if (path.basename(filePath) !== "landingpage-flow.html") {
    return content;
  }

  return content.replace(/href="#(profil|erfolge|partner|social-sponsoren)"/g, 'href="/#$1"');
}

function sendFile(response, filePath, method) {
  fs.stat(filePath, (statError, stats) => {
    if (statError) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    if (stats.isDirectory()) {
      sendFile(response, path.join(filePath, "index.html"), method);
      return;
    }

    if (!stats.isFile()) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    const contentType = contentTypes[path.extname(filePath).toLowerCase()] ?? "application/octet-stream";

    if (contentType === "text/html; charset=utf-8") {
      fs.readFile(filePath, "utf8", (readError, content) => {
        if (readError) {
          response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
          response.end("Unable to read file");
          return;
        }

        const localContent = localizeLandingNavigation(filePath, content);
        response.writeHead(200, {
          "Content-Length": Buffer.byteLength(localContent),
          "Content-Type": contentType,
        });

        if (method === "HEAD") {
          response.end();
          return;
        }

        response.end(localContent);
      });
      return;
    }

    response.writeHead(200, {
      "Content-Length": stats.size,
      "Content-Type": contentType,
    });

    if (method === "HEAD") {
      response.end();
      return;
    }

    fs.createReadStream(filePath).pipe(response);
  });
}

function createPreviewServer(projectRoot = process.cwd()) {
  const root = path.resolve(projectRoot);

  return http.createServer((request, response) => {
    if (request.method !== "GET" && request.method !== "HEAD") {
      response.writeHead(405, { Allow: "GET, HEAD", "Content-Type": "text/plain; charset=utf-8" });
      response.end("Method not allowed");
      return;
    }

    const pathname = new URL(request.url, "http://127.0.0.1").pathname;
    const filePath = resolveFilePath(root, pathname);

    if (!filePath) {
      response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Invalid path");
      return;
    }

    sendFile(response, filePath, request.method);
  });
}

if (require.main === module) {
  const server = createPreviewServer();
  server.listen(4173, "127.0.0.1", () => {
    console.log("Local preview server listening on http://127.0.0.1:4173");
  });
}

module.exports = { createPreviewServer, publicRoutes };
