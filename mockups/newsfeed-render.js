import { newsArticles } from "./news-data.js";

const feedGrid = document.querySelector("[data-news-feed]");

function createNewsCard(article, index) {
  const card = document.createElement("article");
  card.className = `news-card${index === 0 ? " news-card-large" : ""}`;

  const link = document.createElement("a");
  link.href = article.url;
  link.setAttribute("aria-label", `Artikel öffnen: ${article.title}`);

  const image = document.createElement("img");
  image.src = article.image;
  image.alt = article.imageAlt;

  const content = document.createElement("div");

  const meta = document.createElement("span");
  meta.className = "news-card-meta";
  meta.textContent = `${article.category} · ${article.dateLabel}`;

  const title = document.createElement("h2");
  title.textContent = article.title;

  const teaser = document.createElement("p");
  teaser.textContent = article.teaser;

  content.append(meta, title, teaser);
  link.append(image, content);
  card.append(link);

  return card;
}

if (feedGrid) {
  feedGrid.replaceChildren(...newsArticles.map(createNewsCard));
}
