import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../mockups/styles.css", import.meta.url), "utf8");
const html = readFileSync(new URL("../mockups/landingpage-flow.html", import.meta.url), "utf8");

const normalizedHtml = html.replace(/\s+/g, " ");
const heroCopy =
  "Begleitet mich auf meinem Weg zur Erfüllung meines langersehnten Traums - zur IRONMAN-Weltmeisterschaft auf Hawaii. Hier gebe ich euch Einblicke in mein Training, die Vorbereitung, die Reise und die besonderen Momente bis zum Start in Kona";

const requiredSnippets = [
  heroCopy,
  ".kona-countdown-head span,\n.kona-countdown-head time {\n  font-size: 0.75rem;",
  ".partner-actions .button",
  "color: var(--lava);",
  "radial-gradient(ellipse at 19% 8%, rgba(231, 91, 50, 0.22), transparent 30%)",
  "linear-gradient(90deg, rgba(15, 79, 93, 0.28), transparent 58%)",
  "#2f3435",
];

for (const snippet of requiredSnippets) {
  if (!css.includes(snippet) && !normalizedHtml.includes(snippet)) {
    throw new Error(`Missing expected landing page update: ${snippet}`);
  }
}

const buttonRule = css.match(/\.partner-actions \.button \{[\s\S]*?\n\}/)?.[0] ?? "";

if (!buttonRule.includes("background:")) {
  throw new Error("Partner buttons must define a unified background.");
}

console.log("Landing page comment updates are present.");
