# PayPal Support Button Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a visually integrated PayPal support button with a looping swim-bike-run SVG animation to the “Partner werden” section.

**Architecture:** The feature is a semantic external link in `landingpage-flow.html` and a self-contained CSS/SVG animation in `styles.css`. A focused Node test treats the HTML and CSS as deployment contracts, while the existing full suite and visible in-app-browser checks protect the rest of the production site.

**Tech Stack:** Static HTML5, CSS Grid, inline SVG, CSS keyframes, Node.js built-in test runner.

## Global Constraints

- Work only in the `codex/paypal-support-button` feature worktree.
- Do not add JavaScript, external fonts, animation libraries, or new runtime files.
- Use the exact destination `https://www.paypal.com/pool/9rcUXMFriT?sr=accr`.
- Use the visible label `Mit PayPal unterstützen`.
- Open the destination in a new tab with `rel="noopener noreferrer"`.
- Keep the existing partner-button height, rectangular shape, colors, and typography.
- Show swim, bike, and run for about two seconds each in a six-second infinite cycle.
- Disable all animation for `prefers-reduced-motion: reduce` and leave the swimmer visible.
- Do not push. Prepare the Vercel Preview only when the user is present and explicitly continues.

---

### Task 1: Add the semantic PayPal action and SVG disciplines

**Files:**
- Create: `tests/paypal-support-button.test.js`
- Modify: `mockups/landingpage-flow.html:477-484`

**Interfaces:**
- Consumes: Existing `.partner-actions` container and `.button.primary` styling contract.
- Produces: `.paypal-support-button`, `.paypal-triathlon-icon`, `.paypal-discipline-swim`, `.paypal-discipline-bike`, and `.paypal-discipline-run` DOM hooks for Task 2.

- [ ] **Step 1: Write the failing HTML contract test**

```js
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const pagePath = path.join(__dirname, "..", "mockups", "landingpage-flow.html");
const stylesPath = path.join(__dirname, "..", "mockups", "styles.css");

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

test("partner actions include the secure PayPal support link and all three disciplines", () => {
  const html = read(pagePath);
  const paypalLink = html.match(
    /<a\s+class="button primary paypal-support-button"\s+href="https:\/\/www\.paypal\.com\/pool\/9rcUXMFriT\?sr=accr"\s+target="_blank"\s+rel="noopener noreferrer">([\s\S]*?)<\/a>/,
  );

  assert.ok(paypalLink, "PayPal support link must use the approved destination and security attributes");
  assert.match(paypalLink[1], /<span class="paypal-triathlon-icon" aria-hidden="true">/);
  assert.match(paypalLink[1], /<svg class="paypal-discipline paypal-discipline-swim"/);
  assert.match(paypalLink[1], /<svg class="paypal-discipline paypal-discipline-bike"/);
  assert.match(paypalLink[1], /<svg class="paypal-discipline paypal-discipline-run"/);
  assert.match(paypalLink[1], /Mit PayPal unterstützen/);
});
```

- [ ] **Step 2: Run the focused test and confirm the missing-link failure**

Run: `node --test tests/paypal-support-button.test.js`

Expected: FAIL with `PayPal support link must use the approved destination and security attributes`.

- [ ] **Step 3: Add the complete semantic link and SVG artwork**

Insert this link after the existing sponsoring-document link:

```html
<a
  class="button primary paypal-support-button"
  href="https://www.paypal.com/pool/9rcUXMFriT?sr=accr"
  target="_blank"
  rel="noopener noreferrer"
>
  <span class="paypal-triathlon-icon" aria-hidden="true">
    <svg class="paypal-discipline paypal-discipline-swim" viewBox="0 0 34 34" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
      <g class="paypal-swimmer">
        <circle cx="24.5" cy="17" r="2.2"></circle>
        <path d="M22.5 18 L10 20"></path>
        <g class="paypal-swimmer-kick-a"><path d="M10 20 L6 22 L2.5 21" stroke-width="1.8"></path></g>
        <g class="paypal-swimmer-kick-b"><path d="M10 20 L6 18 L2.5 18.5" stroke-width="1.8"></path></g>
        <g class="paypal-swimmer-arm"><path d="M22 18 L29.5 14" stroke-width="1.8"></path></g>
      </g>
      <g class="paypal-water" stroke-width="1.5" opacity=".5">
        <path d="M-2 22 q4 -2.2 8 0 t8 0 t8 0 t8 0 t8 0"></path>
        <path d="M-2 27 q4 -2.2 8 0 t8 0 t8 0 t8 0 t8 0"></path>
      </g>
    </svg>
    <svg class="paypal-discipline paypal-discipline-bike" viewBox="0 0 34 34" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
      <g stroke-width="1.5">
        <g class="paypal-bike-wheel paypal-bike-wheel-left"><circle cx="7.5" cy="26" r="5.2"></circle><path d="M7.5 20.8 L7.5 31.2" stroke-width="1" opacity=".5"></path></g>
        <g class="paypal-bike-wheel paypal-bike-wheel-right"><circle cx="25.5" cy="26" r="5.2"></circle><path d="M25.5 20.8 L25.5 31.2" stroke-width="1" opacity=".5"></path></g>
        <path d="M7.5 26 L16.5 26 M16.5 26 L13.5 18 M13.5 18 L21 17.5 M21 17.5 L25.5 26 M21 17.5 L16.5 26"></path>
        <path d="M21 17.5 L22.8 14.6"></path>
        <path d="M21.6 14.9 L25.4 14.2 q1.9 -.2 1.5 1.9"></path>
      </g>
      <circle cx="19" cy="10.5" r="2.5"></circle>
      <path d="M15 18.5 L18.5 13 L24.5 14.5"></path>
      <g class="paypal-bike-crank">
        <path d="M16.5 26 L18.3 27.8" stroke-width="1.5"></path>
        <path d="M14.5 19 L18.6 27.6"></path>
        <path d="M16.5 26 L14.7 24.2" stroke-width="1.5"></path>
      </g>
    </svg>
    <svg class="paypal-discipline paypal-discipline-run" viewBox="0 0 34 34" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
      <g class="paypal-runner">
        <circle cx="19.5" cy="8" r="2.5"></circle>
        <path d="M18.5 10.5 L15.5 19"></path>
        <g class="paypal-runner-leg-a"><path d="M15.5 19 L18.5 24 L16.5 29.5"></path></g>
        <g class="paypal-runner-leg-b"><path d="M15.5 19 L12 23.5 L13.5 29"></path></g>
        <g class="paypal-runner-arm-a"><path d="M17.5 12.5 L21 15.5 L19 18.5"></path></g>
        <g class="paypal-runner-arm-b"><path d="M17.5 12.5 L14 15 L15.5 18.5"></path></g>
      </g>
      <g class="paypal-track" stroke-width="1.4" opacity=".45"><path d="M-1 31.5 L3 31.5 M7 31.5 L11 31.5 M15 31.5 L19 31.5 M23 31.5 L27 31.5 M31 31.5 L35 31.5"></path></g>
    </svg>
  </span>
  Mit PayPal unterstützen
</a>
```

- [ ] **Step 4: Run the focused test and confirm the semantic contract passes**

Run: `node --test tests/paypal-support-button.test.js`

Expected: PASS for the secure-link and three-discipline test.

- [ ] **Step 5: Commit the semantic action**

```powershell
git add tests/paypal-support-button.test.js mockups/landingpage-flow.html
git commit -m "Add PayPal support action"
```

### Task 2: Integrate the layout and six-second animation

**Files:**
- Modify: `tests/paypal-support-button.test.js`
- Modify: `mockups/styles.css:1745-1780`
- Modify: `mockups/styles.css` inside `@media (max-width: 560px)`

**Interfaces:**
- Consumes: DOM hooks created by Task 1.
- Produces: Desktop two-row grid, mobile one-column actions, six-second discipline cycle, detailed figure motion, and reduced-motion fallback.

- [ ] **Step 1: Add failing CSS contract tests**

```js
test("PayPal support button keeps the approved desktop and mobile layout", () => {
  const css = read(stylesPath);

  assert.match(
    css,
    /\.partner-actions\s*\{[\s\S]*?display:\s*grid;[\s\S]*?grid-template-columns:\s*max-content max-content;/,
  );
  assert.match(
    css,
    /\.paypal-support-button\s*\{[\s\S]*?grid-column:\s*1\s*\/\s*-1;[\s\S]*?justify-self:\s*start;[\s\S]*?gap:\s*10px;/,
  );
  assert.match(
    css,
    /@media \(max-width:\s*560px\)[\s\S]*?\.partner-actions\s*\{[\s\S]*?grid-template-columns:\s*1fr;[\s\S]*?\}[\s\S]*?\.paypal-support-button\s*\{[\s\S]*?grid-column:\s*1;[\s\S]*?justify-self:\s*stretch;/,
  );
});

test("PayPal triathlon animation cycles for six seconds and respects reduced motion", () => {
  const css = read(stylesPath);

  assert.match(css, /\.paypal-discipline-swim\s*\{[\s\S]*?animation:\s*paypalDisciplineShow 6s linear 0s infinite;/);
  assert.match(css, /\.paypal-discipline-bike\s*\{[\s\S]*?animation:\s*paypalDisciplineShow 6s linear 2s infinite;/);
  assert.match(css, /\.paypal-discipline-run\s*\{[\s\S]*?animation:\s*paypalDisciplineShow 6s linear 4s infinite;/);
  assert.match(
    css,
    /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.paypal-triathlon-icon \*[\s\S]*?animation:\s*none !important;[\s\S]*?\.paypal-discipline-swim\s*\{[\s\S]*?opacity:\s*1;/,
  );
});
```

- [ ] **Step 2: Run the focused test and confirm the missing-style failures**

Run: `node --test tests/paypal-support-button.test.js`

Expected: FAIL because `.partner-actions` is still flex-based and the PayPal animation selectors do not exist.

- [ ] **Step 3: Implement the desktop/mobile layout and animation CSS**

Replace the flex layout of `.partner-actions` with the same declarations plus a two-column max-content grid. Then add the PayPal layout, animation bindings, and interaction styles:

```css
.partner-actions {
  min-width: 0;
  display: grid;
  grid-template-columns: max-content max-content;
  align-items: center;
  gap: 14px 18px;
  width: fit-content;
  margin-top: clamp(24px, 4vw, 42px);
  padding-top: 22px;
  border-top: 1px solid rgba(17, 20, 24, 0.16);
}

.paypal-support-button {
  grid-column: 1 / -1;
  justify-self: start;
  gap: 10px;
}

.paypal-support-button:focus-visible {
  outline: 2px solid var(--lava);
  outline-offset: 3px;
}

.partner-actions .paypal-triathlon-icon {
  position: relative;
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  overflow: hidden;
  color: inherit;
  font-size: inherit;
  letter-spacing: normal;
  text-transform: none;
}

.paypal-triathlon-icon {
  line-height: 1;
}

.paypal-discipline {
  position: absolute;
  inset: 0;
  width: 34px;
  height: 34px;
  opacity: 0;
}

.paypal-discipline-swim {
  animation: paypalDisciplineShow 6s linear 0s infinite;
}

.paypal-discipline-bike {
  animation: paypalDisciplineShow 6s linear 2s infinite;
}

.paypal-discipline-run {
  animation: paypalDisciplineShow 6s linear 4s infinite;
}

.paypal-triathlon-icon g {
  transform-box: view-box;
}

.paypal-swimmer,
.paypal-runner {
  animation: paypalBob 1.2s ease-in-out infinite;
}

.paypal-swimmer-kick-a {
  transform-origin: 10px 20px;
  animation: paypalKickA 0.5s ease-in-out infinite;
}

.paypal-swimmer-kick-b {
  transform-origin: 10px 20px;
  animation: paypalKickB 0.5s ease-in-out infinite;
}

.paypal-swimmer-arm {
  transform-origin: 22px 18px;
  animation: paypalSpin 1.2s linear infinite;
}

.paypal-water {
  animation: paypalSlide 1s linear infinite;
}

.paypal-bike-wheel-left {
  transform-origin: 7.5px 26px;
}

.paypal-bike-wheel-right {
  transform-origin: 25.5px 26px;
}

.paypal-bike-wheel,
.paypal-bike-crank {
  animation: paypalSpin 0.6s linear infinite;
}

.paypal-bike-crank {
  transform-origin: 16.5px 26px;
}

.paypal-runner {
  animation-duration: 0.5s;
}

.paypal-runner-leg-a {
  transform-origin: 15.5px 19px;
  animation: paypalLegA 0.5s ease-in-out infinite;
}

.paypal-runner-leg-b {
  transform-origin: 15.5px 19px;
  animation: paypalLegB 0.5s ease-in-out infinite;
}

.paypal-runner-arm-a {
  transform-origin: 17.5px 12.5px;
  animation: paypalArmA 0.5s ease-in-out infinite;
}

.paypal-runner-arm-b {
  transform-origin: 17.5px 12.5px;
  animation: paypalArmB 0.5s ease-in-out infinite;
}

.paypal-track {
  animation: paypalSlide 0.35s linear infinite;
}

@keyframes paypalDisciplineShow {
  0% { opacity: 0; transform: scale(0.8); }
  4%, 31% { opacity: 1; transform: scale(1); }
  33%, 100% { opacity: 0; transform: scale(1); }
}

@keyframes paypalSpin {
  to { transform: rotate(360deg); }
}

@keyframes paypalKickA {
  0%, 100% { transform: rotate(11deg); }
  50% { transform: rotate(-11deg); }
}

@keyframes paypalKickB {
  0%, 100% { transform: rotate(-11deg); }
  50% { transform: rotate(11deg); }
}

@keyframes paypalLegA {
  0%, 100% { transform: rotate(26deg); }
  50% { transform: rotate(-28deg); }
}

@keyframes paypalLegB {
  0%, 100% { transform: rotate(-28deg); }
  50% { transform: rotate(26deg); }
}

@keyframes paypalArmA {
  0%, 100% { transform: rotate(-26deg); }
  50% { transform: rotate(24deg); }
}

@keyframes paypalArmB {
  0%, 100% { transform: rotate(24deg); }
  50% { transform: rotate(-26deg); }
}

@keyframes paypalBob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-1.2px); }
}

@keyframes paypalSlide {
  to { transform: translateX(-8px); }
}

@media (prefers-reduced-motion: reduce) {
  .paypal-triathlon-icon *,
  .paypal-discipline {
    animation: none !important;
  }

  .paypal-discipline {
    opacity: 0;
    transform: none;
  }

  .paypal-discipline-swim {
    opacity: 1;
  }
}
```

Inside the existing `@media (max-width: 560px)` block, add:

```css
.partner-actions {
  grid-template-columns: 1fr;
}

.paypal-support-button {
  grid-column: 1;
  justify-self: stretch;
}
```

- [ ] **Step 4: Run the focused test and confirm all PayPal contracts pass**

Run: `node --test tests/paypal-support-button.test.js`

Expected: all tests in the file PASS.

- [ ] **Step 5: Commit the visual integration**

```powershell
git add tests/paypal-support-button.test.js mockups/styles.css
git commit -m "Animate PayPal support button"
```

### Task 3: Verify the finished feature without publishing

**Files:**
- Verify: `mockups/landingpage-flow.html`
- Verify: `mockups/styles.css`
- Verify: `tests/paypal-support-button.test.js`

**Interfaces:**
- Consumes: Finished button from Tasks 1 and 2.
- Produces: Evidence that the feature is ready for a later user-attended Vercel Preview.

- [ ] **Step 1: Run the focused and complete automated checks**

Run:

```powershell
node --test tests/paypal-support-button.test.js
npm test
git diff --check
```

Expected: all PayPal tests pass, all project tests pass, and `git diff --check` produces no errors.

- [ ] **Step 2: Start the feature-worktree preview server**

Run from the worktree:

```powershell
node tools/local-preview-server.js
```

Expected: the server listens on port `4173`. Stop any main-checkout preview server first if it owns that port; do not modify or delete its files.

- [ ] **Step 3: Verify desktop in the visible in-app browser**

Open `http://127.0.0.1:4173/mockups/landingpage-flow.html`, set the viewport to `1280px`, and inspect `#partner`.

Expected:

- the two existing actions remain on the first row,
- the PayPal action starts on the second row and aligns left,
- swim, bike, and run appear in order,
- the label stays stable,
- no console errors occur.

- [ ] **Step 4: Verify mobile at 390px and 360px**

Use the in-app-browser viewport capability at `390px`, then `360px`.

Expected:

- all three buttons occupy one full-width column,
- the PayPal label and icon are not clipped,
- there is no horizontal page overflow,
- the animation remains readable.

- [ ] **Step 5: Verify the safe link behavior without leaving the local preview**

Read the rendered link attributes and confirm the exact `href`, `_blank` target, and `noopener noreferrer` relationship. Do not navigate to PayPal during automated verification.

- [ ] **Step 6: Review the final repository state**

Run:

```powershell
git status --short --branch
git log -3 --oneline --decorate
```

Expected: only intentional commits exist on `codex/paypal-support-button`, the worktree is clean, and the branch has not been pushed.

- [ ] **Step 7: Stop before Vercel Preview and push**

Report the local verification evidence to the user. Wait for the user before creating the Vercel Preview, pushing the branch, or touching Production.
