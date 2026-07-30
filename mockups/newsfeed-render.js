import { newsArticles } from "./news-data.js?v=article-04-4";

const feedGrid = document.querySelector("[data-news-feed]");
const feedFilter = document.querySelector("[data-news-filter]");
const categories = ["Alle", "Training", "Wettkampf", "Partner", "Road to Hawaii"];
const feedArticles = [...newsArticles];
let activeCategory = "Alle";

function sortedArticles() {
  const visibleArticles =
    activeCategory === "Alle" ? feedArticles : feedArticles.filter((article) => article.category === activeCategory);

  return [...visibleArticles].sort((articleA, articleB) => {
    const dateA = Date.parse(articleA.dateTime || articleA.dateLabel || "");
    const dateB = Date.parse(articleB.dateTime || articleB.dateLabel || "");
    return (Number.isNaN(dateB) ? 0 : dateB) - (Number.isNaN(dateA) ? 0 : dateA);
  });
}

function createNewsCard(article, index) {
  const card = document.createElement("article");
  card.className = `news-card${index === 0 ? " news-card-large" : ""}`;
  if (article.titleVariant === "compact") {
    card.classList.add("news-card-title-compact");
  }

  const link = document.createElement("a");
  link.href = article.url;
  link.setAttribute("aria-label", `Artikel oeffnen: ${article.title}`);

  const image = document.createElement("img");
  image.src = article.image;
  if (article.imageSrcset) image.srcset = article.imageSrcset;
  if (article.imageSizes) image.sizes = article.imageSizes;
  image.alt = article.imageAlt;

  const content = document.createElement("div");

  const meta = document.createElement("span");
  meta.className = "news-card-meta";
  meta.textContent = `${article.category} / ${article.dateLabel}`;

  const title = document.createElement("h2");
  title.textContent = article.title;

  const teaser = document.createElement("p");
  teaser.textContent = article.teaser;

  content.append(meta, title, teaser);
  link.append(image, content);
  card.append(link);

  return card;
}

function renderFeed() {
  if (!feedGrid) return;

  const articles = sortedArticles();
  if (!articles.length) {
    const empty = document.createElement("p");
    empty.className = "feed-empty";
    empty.textContent = "Fuer diese Kategorie gibt es noch keine Artikel.";
    feedGrid.replaceChildren(empty);
    return;
  }

  feedGrid.replaceChildren(...articles.map(createNewsCard));
}

function createFilterButton(category) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = category;
  button.dataset.category = category;
  if (category === activeCategory) button.classList.add("is-active");

  button.addEventListener("click", () => {
    activeCategory = category;
    feedFilter.querySelectorAll("button").forEach((item) => item.classList.toggle("is-active", item === button));
    renderFeed();
  });

  return button;
}

if (feedFilter) {
  feedFilter.replaceChildren(...categories.map(createFilterButton));
}

renderFeed();
