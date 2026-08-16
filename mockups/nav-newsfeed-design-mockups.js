const nav = document.querySelector("[data-nav-variant]");
const caption = document.querySelector(".nav-study-caption");
const buttons = document.querySelectorAll("[data-nav-target]");

const variants = {
  "lava-cta": {
    number: "Variante 01",
    title: "Lava CTA",
    description: "Maximale Erkennbarkeit: Der Newsfeed wird zur einzigen klaren Aktion in der Navigation.",
    verdict: "Empfehlung: stärkste Lösung",
  },
  "signal-dot": {
    number: "Variante 02",
    title: "Signal Dot",
    description: "Ruhiger und leichter: Ein präziser Farbindikator markiert den Newsfeed, ohne die Navigation zu dominieren.",
    verdict: "Empfehlung: dezenteste Lösung",
  },
  "editorial-tab": {
    number: "Variante 03",
    title: "Editorial Tab",
    description: "Der Newsfeed wirkt wie ein eigenes Magazin innerhalb der Seite – hochwertig, redaktionell und klar getrennt.",
    verdict: "Empfehlung: charakterstärkste Lösung",
  },
  "kona-bracket": {
    number: "Variante 04",
    title: "Kona Bracket",
    description: "Eine sportliche Klammer trennt den Newsfeed sichtbar ab und bleibt näher an der heutigen Navigation.",
    verdict: "Empfehlung: ausgewogenste Lösung",
  },
};

function selectVariant(name) {
  const variant = variants[name];
  if (!nav || !caption || !variant) return;

  nav.dataset.navVariant = name;
  buttons.forEach((button) => {
    const isActive = button.dataset.navTarget === name;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  caption.querySelector(".nav-study-number").textContent = variant.number;
  caption.querySelector("h2").textContent = variant.title;
  caption.querySelector("h2 + p").textContent = variant.description;
  caption.querySelector(".nav-study-verdict").textContent = variant.verdict;
}

buttons.forEach((button) => {
  button.addEventListener("click", () => selectVariant(button.dataset.navTarget));
});

selectVariant("lava-cta");
