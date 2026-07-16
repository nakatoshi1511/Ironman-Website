# Conservative Project Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move clearly non-production artifacts into one ignored local archive without changing the live website or rewriting Git history.

**Architecture:** `_local-archive/` is the only local archive root. Generated screenshot and tracker tooling writes directly into that root, while tracked runtime code, tests, documentation, and ambiguous source assets remain in place. The cleanup uses exact-path moves, local integrity checks, the complete Node test suite, and HTTP checks against the local static server before committing deletions.

**Tech Stack:** Static HTML/CSS/JavaScript, Node.js test runner, PowerShell, Git, Python static HTTP server.

## Global Constraints

- Do not rewrite Git history or force-push.
- Do not deploy or push during this plan.
- Do not install dependencies or make global CLI changes.
- Preserve unrelated user changes and stage only named paths.
- Keep `api/`, `tests/`, `tools/`, `docs/`, active site files, active assets, raw photos, unused Hero variants, DOCX/ZIP sources, and old design pages tracked in this phase.
- Keep `RoadmapV2.png` and `Dokumente/Partner- und Unterstuetzerkonzept_Road to Hawaii_David Simon.pdf` in their current tracked locations.
- The ignored archive is local-only and is not a backup.
- No visual layout is changed; use the local HTTP checks in this plan and reserve in-app-browser desktop/mobile checks for later visual work.

---

### Task 1: Route local-only output into the ignored archive

**Files:**
- Create: `tests/project-cleanup.test.js`
- Modify: `.gitignore`
- Modify: `tools/export-mockup-screenshots.js`
- Modify: `tools/build-road-to-hawaii-tracker.mjs`
- Modify: `docs/mockup-screenshot-export.md`
- Modify: `PROJECT_CONTEXT.md`

**Interfaces:**
- Consumes: the existing screenshot exporter and tracker builder output-path constants.
- Produces: the ignored path `_local-archive/`, screenshot output at `_local-archive/mockup-screenshots/`, and tracker output at `_local-archive/outputs/road_to_hawaii_tracker/`.

- [ ] **Step 1: Write the failing archive-routing test**

Create `tests/project-cleanup.test.js` with:

```js
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
```

- [ ] **Step 2: Run the focused test and confirm the intended failure**

Run:

```powershell
node --test tests/project-cleanup.test.js
```

Expected: `FAIL` at the `_local-archive/` assertion because `.gitignore` does not contain that entry yet.

- [ ] **Step 3: Add the archive boundary and update generator paths**

Append this exact entry to `.gitignore`:

```gitignore
_local-archive/
```

Change the screenshot exporter constant in `tools/export-mockup-screenshots.js` to:

```js
const outDir = path.join(projectRoot, "_local-archive", "mockup-screenshots");
```

Change the tracker builder constant in `tools/build-road-to-hawaii-tracker.mjs` to:

```js
const outputDir = "_local-archive/outputs/road_to_hawaii_tracker";
```

- [ ] **Step 4: Update the tracked documentation to the new local paths**

In `docs/mockup-screenshot-export.md`, replace every output reference from `mockup-screenshots/` to `_local-archive/mockup-screenshots/`. The output example must become:

```text
_local-archive/mockup-screenshots/
```

The Chrome profile statement must become:

```markdown
- Chrome is launched headless with a temporary profile inside `_local-archive/mockup-screenshots/_chrome-profile`.
```

Add this note immediately below the introductory paragraph:

```markdown
> This exporter is retained for local archived comparison images. Current visual website verification must use the visible in-app browser as required by `PROJECT_CONTEXT.md`.
```

In `PROJECT_CONTEXT.md`, replace the `Screenshot-Export` and `Aktuelle Prüfbilder` blocks with:

```markdown
Screenshot-Export:
- Skript: `tools/export-mockup-screenshots.js`
- Doku: `docs/mockup-screenshot-export.md`
- Lokales, von Git ignoriertes Export-Ziel: `_local-archive/mockup-screenshots/`
- Das Exportskript bleibt nur für lokal archivierte Vergleichsbilder erhalten. Verbindliche visuelle Website-Prüfungen erfolgen ausschließlich im sichtbaren In-App-Browser.

Lokale Prüfbilder:
- bisherige Exporte liegen nur lokal unter `_local-archive/mockup-screenshots/`
- sie werden nicht mehr von Git oder Vercel erfasst
```

Add this block immediately after the local screenshot block:

```markdown
Lokales Archiv:
- Root: `_local-archive/`
- der gesamte Ordner wird durch `.gitignore` ausgeschlossen
- generierte Ausgaben, temporäre Dateien und klar nicht produktive Altdateien werden dort lokal aufbewahrt
- die Inhalte sind nicht durch Git gesichert und müssen bei langfristigem Bedarf separat gesichert werden
```

- [ ] **Step 5: Run the focused and complete test suites**

Run:

```powershell
node --test tests/project-cleanup.test.js
npm test
```

Expected: the focused test reports `1` passing test; the complete suite reports all tests passing and no failures.

- [ ] **Step 6: Verify the ignore rule and documentation references**

Run:

```powershell
git check-ignore -v --no-index '_local-archive/probe.txt'
rg -n 'mockup-screenshots/' PROJECT_CONTEXT.md docs/mockup-screenshot-export.md tools/export-mockup-screenshots.js
```

Expected: `git check-ignore` identifies the `_local-archive/` rule. Every search result points to `_local-archive/mockup-screenshots/`; no tracked documentation or tool points to root-level `mockup-screenshots/`.

- [ ] **Step 7: Commit the archive-routing boundary**

Run:

```powershell
git add -- '.gitignore' 'PROJECT_CONTEXT.md' 'docs/mockup-screenshot-export.md' 'tools/export-mockup-screenshots.js' 'tools/build-road-to-hawaii-tracker.mjs' 'tests/project-cleanup.test.js'
git diff --cached --check
git diff --cached --stat
git commit -m "chore: route local artifacts into ignored archive"
```

Expected: one commit containing only the six named paths, including the new test.

---

### Task 2: Move the approved first-round artifacts

**Files:**
- Move locally: `tmp/` to `_local-archive/tmp/`
- Remove from Git and retain locally: `outputs/` at `_local-archive/outputs/`
- Remove from Git and retain locally: `archive/` at `_local-archive/archive/`
- Remove from Git and retain locally: `mockup-screenshots/` at `_local-archive/mockup-screenshots/`
- Remove from Git and retain locally: five root drafts at `_local-archive/root-drafts/`
- Remove from Git and retain locally: `Bilder Landingpage/Newsfeed/Artikel 01/Invoice-MGYKFH-00003.pdf` at `_local-archive/source-documents/Bilder Landingpage/Newsfeed/Artikel 01/Invoice-MGYKFH-00003.pdf`

**Interfaces:**
- Consumes: the `_local-archive/` ignore boundary from Task 1.
- Produces: one verified local copy of every approved artifact and Git deletions for previously tracked artifacts.

- [ ] **Step 1: Confirm the working tree and exact source set**

Run:

```powershell
git status --short --branch
$sources = @(
  'tmp',
  'outputs',
  'archive',
  'mockup-screenshots',
  '.codex-roadmap-view.html',
  'triathlon-diagonal-mockup.svg',
  'triathlon-diagonal-mockup-v2.svg',
  'triathlon-swim-bike-run-v2.png',
  'triathlon-swim-bike-run-v2-filtered.png',
  'Bilder Landingpage/Newsfeed/Artikel 01/Invoice-MGYKFH-00003.pdf'
)
$missing = $sources | Where-Object { -not (Test-Path -LiteralPath $_) }
if ($missing) { throw "Missing cleanup source(s): $($missing -join ', ')" }
```

Expected: the branch is ahead only by the approved documentation and Task 1 commits, there are no unrelated changes, and the source check returns without an exception.

- [ ] **Step 2: Re-check runtime references before moving**

Run:

```powershell
rg -n -g 'mockups/**' -g 'api/**' -g 'tests/**' -e 'Invoice-MGYKFH-00003|triathlon-diagonal-mockup|triathlon-swim-bike-run-v2|\.codex-roadmap-view|archive/|outputs/|mockup-screenshots/' .
```

Expected: no references from active runtime files or tests. If any result appears, stop and reclassify that path before moving it.

- [ ] **Step 3: Validate all absolute move destinations**

Run:

```powershell
$projectRoot = (Resolve-Path -LiteralPath '.').Path
$archiveRoot = [IO.Path]::GetFullPath((Join-Path $projectRoot '_local-archive'))
$prefix = $archiveRoot.TrimEnd([IO.Path]::DirectorySeparatorChar) + [IO.Path]::DirectorySeparatorChar
$destinations = @(
  '_local-archive/tmp',
  '_local-archive/outputs',
  '_local-archive/archive',
  '_local-archive/mockup-screenshots',
  '_local-archive/root-drafts/.codex-roadmap-view.html',
  '_local-archive/root-drafts/triathlon-diagonal-mockup.svg',
  '_local-archive/root-drafts/triathlon-diagonal-mockup-v2.svg',
  '_local-archive/root-drafts/triathlon-swim-bike-run-v2.png',
  '_local-archive/root-drafts/triathlon-swim-bike-run-v2-filtered.png',
  '_local-archive/source-documents/Bilder Landingpage/Newsfeed/Artikel 01/Invoice-MGYKFH-00003.pdf'
)
foreach ($relative in $destinations) {
  $absolute = [IO.Path]::GetFullPath((Join-Path $projectRoot $relative))
  if (-not $absolute.StartsWith($prefix, [StringComparison]::OrdinalIgnoreCase)) {
    throw "Destination escapes local archive: $absolute"
  }
  if (Test-Path -LiteralPath $absolute) {
    throw "Destination already exists: $absolute"
  }
}
```

Expected: every destination is inside `_local-archive/`, no destination exists, and the validation returns without an exception.

- [ ] **Step 4: Record pre-move integrity values in the current PowerShell session**

Run:

```powershell
function Get-TreeFingerprint([string]$Path) {
  $item = Get-Item -LiteralPath $Path
  $files = if ($item.PSIsContainer) {
    Get-ChildItem -LiteralPath $Path -Recurse -File -Force | Sort-Object FullName
  } else {
    @($item)
  }
  [PSCustomObject]@{
    Count = @($files).Count
    Bytes = [int64](($files | Measure-Object -Property Length -Sum).Sum)
    Hashes = @($files | ForEach-Object { (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash })
  }
}
$sources = @(
  'tmp',
  'outputs',
  'archive',
  'mockup-screenshots',
  '.codex-roadmap-view.html',
  'triathlon-diagonal-mockup.svg',
  'triathlon-diagonal-mockup-v2.svg',
  'triathlon-swim-bike-run-v2.png',
  'triathlon-swim-bike-run-v2-filtered.png',
  'Bilder Landingpage/Newsfeed/Artikel 01/Invoice-MGYKFH-00003.pdf'
)
$before = @{}
foreach ($source in $sources) { $before[$source] = Get-TreeFingerprint $source }
```

Expected: `$before` contains ten entries with file counts, total bytes, and SHA-256 hashes.

- [ ] **Step 5: Create validated archive parents and move each exact source**

Run in the same PowerShell session as Steps 3 and 4:

```powershell
New-Item -ItemType Directory -Force -Path $archiveRoot | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $archiveRoot 'root-drafts') | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $archiveRoot 'source-documents/Bilder Landingpage/Newsfeed/Artikel 01') | Out-Null

Move-Item -LiteralPath (Join-Path $projectRoot 'tmp') -Destination (Join-Path $archiveRoot 'tmp')
Move-Item -LiteralPath (Join-Path $projectRoot 'outputs') -Destination (Join-Path $archiveRoot 'outputs')
Move-Item -LiteralPath (Join-Path $projectRoot 'archive') -Destination (Join-Path $archiveRoot 'archive')
Move-Item -LiteralPath (Join-Path $projectRoot 'mockup-screenshots') -Destination (Join-Path $archiveRoot 'mockup-screenshots')

$rootDrafts = @(
  '.codex-roadmap-view.html',
  'triathlon-diagonal-mockup.svg',
  'triathlon-diagonal-mockup-v2.svg',
  'triathlon-swim-bike-run-v2.png',
  'triathlon-swim-bike-run-v2-filtered.png'
)
foreach ($draft in $rootDrafts) {
  Move-Item -LiteralPath (Join-Path $projectRoot $draft) -Destination (Join-Path $archiveRoot "root-drafts/$draft")
}

$invoice = 'Bilder Landingpage/Newsfeed/Artikel 01/Invoice-MGYKFH-00003.pdf'
Move-Item -LiteralPath (Join-Path $projectRoot $invoice) -Destination (Join-Path $archiveRoot "source-documents/$invoice")
```

Expected: each source disappears from its original path and appears at its exact archive destination.

- [ ] **Step 6: Compare post-move integrity with the recorded values**

Run in the same PowerShell session:

```powershell
$moved = @{
  'tmp' = '_local-archive/tmp'
  'outputs' = '_local-archive/outputs'
  'archive' = '_local-archive/archive'
  'mockup-screenshots' = '_local-archive/mockup-screenshots'
  '.codex-roadmap-view.html' = '_local-archive/root-drafts/.codex-roadmap-view.html'
  'triathlon-diagonal-mockup.svg' = '_local-archive/root-drafts/triathlon-diagonal-mockup.svg'
  'triathlon-diagonal-mockup-v2.svg' = '_local-archive/root-drafts/triathlon-diagonal-mockup-v2.svg'
  'triathlon-swim-bike-run-v2.png' = '_local-archive/root-drafts/triathlon-swim-bike-run-v2.png'
  'triathlon-swim-bike-run-v2-filtered.png' = '_local-archive/root-drafts/triathlon-swim-bike-run-v2-filtered.png'
  'Bilder Landingpage/Newsfeed/Artikel 01/Invoice-MGYKFH-00003.pdf' = '_local-archive/source-documents/Bilder Landingpage/Newsfeed/Artikel 01/Invoice-MGYKFH-00003.pdf'
}
foreach ($source in $moved.Keys) {
  if (Test-Path -LiteralPath $source) { throw "Source still exists: $source" }
  $after = Get-TreeFingerprint $moved[$source]
  $expected = $before[$source]
  if ($after.Count -ne $expected.Count -or $after.Bytes -ne $expected.Bytes) {
    throw "Count or byte mismatch for $source"
  }
  if (Compare-Object $after.Hashes $expected.Hashes) {
    throw "SHA-256 mismatch for $source"
  }
}
```

Expected: no source remains, and all counts, byte totals, and hashes match.

- [ ] **Step 7: Verify Git visibility and the active-file boundary**

Run:

```powershell
git status --short --ignored
git check-ignore -v '_local-archive/source-documents/Bilder Landingpage/Newsfeed/Artikel 01/Invoice-MGYKFH-00003.pdf'
git ls-files '_local-archive/**'
Test-Path -LiteralPath 'RoadmapV2.png'
Test-Path -LiteralPath 'Dokumente/Partner- und Unterstuetzerkonzept_Road to Hawaii_David Simon.pdf'
```

Expected: Git shows deletions only for the approved tracked sources, `_local-archive/` is ignored, `git ls-files` returns no archive files, and both retained active files return `True`.

- [ ] **Step 8: Run the complete automated tests**

Run:

```powershell
npm test
```

Expected: all tests pass with zero failures.

- [ ] **Step 9: Check active pages and key assets through the local server**

Run:

```powershell
$projectRoot = (Resolve-Path -LiteralPath '.').Path
$listener = Get-NetTCPConnection -LocalPort 4173 -State Listen -ErrorAction SilentlyContinue
if (-not $listener) {
  $python = 'C:\Users\radem\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe'
  Start-Process -FilePath $python -ArgumentList '-m','http.server','4173','--bind','127.0.0.1' -WorkingDirectory $projectRoot -WindowStyle Hidden
  for ($attempt = 0; $attempt -lt 20; $attempt += 1) {
    if (Get-NetTCPConnection -LocalPort 4173 -State Listen -ErrorAction SilentlyContinue) { break }
    Start-Sleep -Milliseconds 250
  }
  if (-not (Get-NetTCPConnection -LocalPort 4173 -State Listen -ErrorAction SilentlyContinue)) {
    throw 'Local server did not start on port 4173'
  }
}

$urls = @(
  'http://127.0.0.1:4173/',
  'http://127.0.0.1:4173/mockups/landingpage-flow.html',
  'http://127.0.0.1:4173/mockups/newsfeed.html',
  'http://127.0.0.1:4173/mockups/newsfeed-17-stunden-zum-ruhm.html',
  'http://127.0.0.1:4173/mockups/newsfeed-trainingsauftakt-in-der-toskana.html',
  'http://127.0.0.1:4173/mockups/impressum.html',
  'http://127.0.0.1:4173/mockups/datenschutz.html',
  'http://127.0.0.1:4173/RoadmapV2.png',
  'http://127.0.0.1:4173/Bilder%20Landingpage/Hero/final-variants/hero-final-H-no-bars-clean-filter-warm-sunrise.jpg',
  'http://127.0.0.1:4173/Bilder%20Landingpage/Hero/mobile-hero/road-to-hawaii-mobile-hero.jpg',
  'http://127.0.0.1:4173/Dokumente/Partner-%20und%20Unterstuetzerkonzept_Road%20to%20Hawaii_David%20Simon.pdf'
)
foreach ($url in $urls) {
  $response = Invoke-WebRequest -Uri $url -UseBasicParsing
  if ($response.StatusCode -ne 200) { throw "HTTP $($response.StatusCode): $url" }
}
```

Expected: every URL returns HTTP `200`. No visible-browser check is required because the cleanup changes no runtime or layout file.

- [ ] **Step 10: Stage only approved deletions and commit**

Run:

```powershell
git add -u -- '.codex-roadmap-view.html' 'archive' 'outputs' 'mockup-screenshots' 'Bilder Landingpage/Newsfeed/Artikel 01/Invoice-MGYKFH-00003.pdf' 'triathlon-diagonal-mockup.svg' 'triathlon-diagonal-mockup-v2.svg' 'triathlon-swim-bike-run-v2.png' 'triathlon-swim-bike-run-v2-filtered.png'
git diff --cached --check
git diff --cached --name-status
git status --short --branch
git commit -m "chore: archive non-production project artifacts"
```

Expected: the staged diff contains only deletions for the approved tracked artifacts. `_local-archive/` and its files are absent from the commit, and `tmp/` is no longer shown because it is inside the ignored archive.

---

### Task 3: Final cleanup audit and handoff

**Files:**
- Inspect only: repository status, Git history, ignored archive, tests, and tracked top-level paths.

**Interfaces:**
- Consumes: the two cleanup commits from Tasks 1 and 2.
- Produces: a verified cleanup summary and an explicit decision point before security review.

- [ ] **Step 1: Confirm final repository and archive state**

Run:

```powershell
git status --short --branch
git log -4 --oneline --decorate
git -c core.quotepath=false ls-files | ForEach-Object { ($_ -split '/')[0] } | Group-Object | Sort-Object Name | Select-Object Count,Name | Format-Table -AutoSize
Get-ChildItem -LiteralPath '_local-archive' -Force | Select-Object Mode,Name | Format-Table -AutoSize
```

Expected: the working tree is clean, the local branch is ahead of `origin/main` only by the approved specification, plan, and cleanup commits, none of the archived top-level paths remain tracked, and the archive contains `tmp`, `outputs`, `archive`, `mockup-screenshots`, `root-drafts`, and `source-documents`.

- [ ] **Step 2: Re-run the complete suite as final evidence**

Run:

```powershell
npm test
```

Expected: all tests pass with zero failures.

- [ ] **Step 3: Stop before security changes or deployment**

Report:

```text
Conservative cleanup complete. No Git history was rewritten, nothing was pushed or deployed, and the ignored local archive is not backed up by Git. Ready to begin the separate deployment-security review when approved.
```

Do not push, deploy, start the security phase, or alter the second-round asset candidates without a new explicit user decision.
