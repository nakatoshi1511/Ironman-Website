import { newsArticles } from "./news-data.js";

const categories = ["Alle", "Training", "Wettkampf", "Partner", "Road to Hawaii"];
const fallbackImage = "../Bilder%20Landingpage/Hero/final-variants/hero-final-H-no-bars-clean-filter-warm-sunrise.jpg";

const designArticles = [
  ...newsArticles,
  {
    slug: "mock-training",
    url: "news-editor.html",
    title: "Trainingsblock: Hitze, Umfang und Kona-Rhythmus",
    teaser: "Design-Dummy f&uuml;r Trainingsupdates mit kurzen, regelm&auml;&szlig;igen Einblicken in Davids Vorbereitung.",
    category: "Training",
    dateLabel: "02.07.2026",
    dateTime: "2026-07-02",
    image: fallbackImage,
    imageAlt: "Triathlon Training als Platzhalterbild",
  },
  {
    slug: "mock-wettkampf",
    url: "news-editor.html",
    title: "Rennbericht: Formtest vor dem gro&szlig;en Ziel",
    teaser: "Design-Dummy f&uuml;r Wettk&auml;mpfe, Ergebnisse und Rennerfahrungen auf dem Weg zur Weltmeisterschaft.",
    category: "Wettkampf",
    dateLabel: "28.06.2026",
    dateTime: "2026-06-28",
    image: fallbackImage,
    imageAlt: "Triathlon Wettkampf als Platzhalterbild",
  },
  {
    slug: "mock-partner",
    url: "news-editor.html",
    title: "Partnerstory: Sichtbarkeit mit echter Geschichte",
    teaser: "Design-Dummy f&uuml;r Sponsorenbeitr&auml;ge, regionale Partner und gemeinsame Aktivierungen.",
    category: "Partner",
    dateLabel: "18.06.2026",
    dateTime: "2026-06-18",
    image: fallbackImage,
    imageAlt: "Partnerstory als Platzhalterbild",
  },
];

const variantButtons = document.querySelectorAll("[data-variant-target]");
const variants = document.querySelectorAll("[data-variant]");
const cardStyleButtons = document.querySelectorAll("[data-card-style-target]");
const journalLayout = document.querySelector("[data-card-list='sponsor-journal']");
const activeFilters = new Map();
const requestedCardStyle = new URLSearchParams(window.location.search).get("cardStyle");

function textFromHtml(value) {
  const template = document.createElement("template");
  template.innerHTML = value;
  return template.content.textContent || "";
}

function filteredArticles(variant) {
  const activeCategory = activeFilters.get(variant) || "Alle";
  const visibleArticles =
    activeCategory === "Alle" ? designArticles : designArticles.filter((article) => article.category === activeCategory);

  return [...visibleArticles].sort((articleA, articleB) => {
    const dateA = Date.parse(articleA.dateTime || articleA.dateLabel || "");
    const dateB = Date.parse(articleB.dateTime || articleB.dateLabel || "");
    return (Number.isNaN(dateB) ? 0 : dateB) - (Number.isNaN(dateA) ? 0 : dateA);
  });
}

function createFilter(groupName) {
  const root = document.querySelector(`[data-filter-group="${groupName}"]`);
  if (!root) return;

  root.replaceChildren(
    ...categories.map((category) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = category;
      button.dataset.category = category;
      if (category === "Alle") button.classList.add("is-active");
      button.addEventListener("click", () => {
        activeFilters.set(groupName, category);
        root.querySelectorAll("button").forEach((item) => item.classList.toggle("is-active", item === button));
        renderVariant(groupName);
      });
      return button;
    }),
  );
}

function createCard(article, variant, index) {
  const card = document.createElement("article");
  card.className = `${variant === "race-control" ? "race-card" : variant === "sponsor-journal" ? "journal-card" : "editorial-card"}`;

  const link = document.createElement("a");
  link.href = article.url;
  link.setAttribute("aria-label", `Artikel &ouml;ffnen: ${article.title}`);

  const image = document.createElement("img");
  image.src = article.image;
  image.alt = article.imageAlt;

  const content = document.createElement("div");
  content.className = variant === "sponsor-journal" ? "journal-card-content" : "editorial-card-content";

  const meta = document.createElement("span");
  meta.className = "mock-card-meta";
  meta.textContent = `${article.category} / ${article.dateLabel}`;

  const title = document.createElement("h3");
  title.textContent = textFromHtml(article.title);

  const teaser = document.createElement("p");
  teaser.textContent = textFromHtml(article.teaser);

  content.append(meta, title, teaser);
  link.append(image, content);

  if (variant === "race-control") {
    const status = document.createElement("span");
    status.className = "race-status";
    status.textContent = index === 0 ? "Neu" : article.category;
    link.append(status);
  }

  card.append(link);
  return card;
}

function renderVariant(variant) {
  const root = document.querySelector(`[data-card-list="${variant}"]`);
  if (!root) return;

  const articles = filteredArticles(variant);
  if (!articles.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "F&uuml;r diese Kategorie gibt es noch keine Artikel.";
    root.replaceChildren(empty);
    return;
  }

  root.replaceChildren(...articles.map((article, index) => createCard(article, variant, index)));
}

variantButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.variantTarget;
    variantButtons.forEach((item) => item.classList.toggle("is-active", item === button));
    variants.forEach((variant) => variant.classList.toggle("is-active", variant.dataset.variant === target));
  });
});

cardStyleButtons.forEach((button) => {
  if (requestedCardStyle && button.dataset.cardStyleTarget === requestedCardStyle && journalLayout) {
    cardStyleButtons.forEach((item) => item.classList.toggle("is-active", item === button));
    journalLayout.dataset.cardStyle = requestedCardStyle;
  }

  button.addEventListener("click", () => {
    if (!journalLayout) return;
    cardStyleButtons.forEach((item) => item.classList.toggle("is-active", item === button));
    journalLayout.dataset.cardStyle = button.dataset.cardStyleTarget;
  });
});

["editorial", "race-control", "sponsor-journal"].forEach((variant) => {
  activeFilters.set(variant, "Alle");
  createFilter(variant);
  renderVariant(variant);
});
