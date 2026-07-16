const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const projectRoot = path.join(__dirname, "..");

function read(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
}

test("local-only artifacts are routed into the ignored local archive", () => {
  const gitignore = read(".gitignore");
  const screenshotExporter = read("tools/export-mockup-screenshots.js");
  const trackerBuilder = read("tools/build-road-to-hawaii-tracker.mjs");

  assert.match(gitignore, /(?:^|\r?\n)_local-archive\/(?:\r?\n|$)/);
  assert.match(
    screenshotExporter,
    /path\.join\(projectRoot, "_local-archive", "mockup-screenshots"\)/,
  );
  assert.match(
    trackerBuilder,
    /const outputDir = "_local-archive\/outputs\/road_to_hawaii_tracker";/,
  );
});
