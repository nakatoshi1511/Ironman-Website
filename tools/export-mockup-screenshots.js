const fs = require("node:fs/promises");
const path = require("node:path");
const { spawn } = require("node:child_process");

const projectRoot = path.resolve(__dirname, "..");
const outDir = path.join(projectRoot, "mockup-screenshots");
const url = process.env.MOCKUP_URL || "http://127.0.0.1:4173/mockups/";
const port = Number(process.env.CHROME_DEBUG_PORT || 9224);
const profile = path.join(outDir, "_chrome-profile");
const chromeCandidates = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
].filter(Boolean);

const files = [
  "variante-1-sponsor-editorial.png",
  "variante-2-kona-performance.png",
  "variante-3-regional-precision.png",
  "variante-4-image-first-minimal.png",
];

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function findBrowser() {
  for (const candidate of chromeCandidates) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      // Try the next common install location.
    }
  }
  throw new Error("Chrome or Edge executable not found. Set CHROME_PATH to the browser executable.");
}

async function waitForJson(endpoint, tries = 80) {
  let lastError;
  for (let i = 0; i < tries; i += 1) {
    try {
      const res = await fetch(endpoint);
      if (res.ok) return await res.json();
      lastError = new Error(`HTTP ${res.status}`);
    } catch (error) {
      lastError = error;
    }
    await wait(100);
  }
  throw lastError;
}

async function main() {
  const chromePath = await findBrowser();
  await fs.mkdir(outDir, { recursive: true });
  await fs.rm(profile, { recursive: true, force: true });

  const chrome = spawn(
    chromePath,
    [
      "--headless=new",
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profile}`,
      "--hide-scrollbars",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      "--window-size=1920,1600",
      url,
    ],
    { stdio: "ignore" },
  );

  try {
    await waitForJson(`http://127.0.0.1:${port}/json/version`);
    const pages = await waitForJson(`http://127.0.0.1:${port}/json/list`);
    const page =
      pages.find((target) => target.type === "page" && (target.url === url || target.url.includes("/mockups/"))) ||
      pages.find((target) => target.type === "page");

    if (!page) throw new Error("No Chrome page target found.");

    const ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.addEventListener("open", resolve, { once: true });
      ws.addEventListener("error", reject, { once: true });
    });

    let id = 0;
    let loaded = false;
    const pending = new Map();

    ws.addEventListener("message", (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === "Page.loadEventFired") loaded = true;
      if (msg.id && pending.has(msg.id)) {
        const { resolve, reject } = pending.get(msg.id);
        pending.delete(msg.id);
        msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
      }
    });

    function cdp(method, params = {}) {
      return new Promise((resolve, reject) => {
        const callId = ++id;
        pending.set(callId, { resolve, reject });
        ws.send(JSON.stringify({ id: callId, method, params }));
      });
    }

    await cdp("Page.enable");
    await cdp("Runtime.enable");
    await cdp("Emulation.setDeviceMetricsOverride", {
      width: 1920,
      height: 1600,
      deviceScaleFactor: 2,
      mobile: false,
    });
    await cdp("Page.navigate", { url });

    for (let i = 0; i < 100 && !loaded; i += 1) await wait(100);

    await cdp("Runtime.evaluate", {
      expression: "document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()",
      awaitPromise: true,
    });
    await wait(600);

    const rectsResult = await cdp("Runtime.evaluate", {
      returnByValue: true,
      expression: `Array.from(document.querySelectorAll(".mockup")).map((el, index) => {
        const r = el.getBoundingClientRect();
        return {
          index: index + 1,
          title: el.querySelector(".mockup-label strong")?.textContent.trim(),
          x: Math.round(r.left + window.scrollX),
          y: Math.round(r.top + window.scrollY),
          width: Math.round(r.width),
          height: Math.round(r.height)
        };
      })`,
    });

    const rects = rectsResult.result.value;
    if (!Array.isArray(rects) || rects.length === 0) {
      throw new Error('No ".mockup" sections found on the page.');
    }

    for (const rect of rects) {
      const fileName = files[rect.index - 1] || `variante-${rect.index}.png`;
      const result = await cdp("Page.captureScreenshot", {
        format: "png",
        fromSurface: true,
        captureBeyondViewport: true,
        clip: {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          scale: 2,
        },
      });
      await fs.writeFile(path.join(outDir, fileName), Buffer.from(result.data, "base64"));
      console.log(`${fileName} ${rect.width * 2}x${rect.height * 2} ${rect.title}`);
    }

    await fs.writeFile(
      path.join(outDir, "_export-meta.json"),
      JSON.stringify({ url, deviceScaleFactor: 2, rects }, null, 2),
    );

    ws.close();
  } finally {
    chrome.kill();
    await wait(300);
    await fs.rm(profile, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
