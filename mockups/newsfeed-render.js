import { newsArticles } from "./news-data.js";

const feedGrid = document.querySelector("[data-news-feed]");
const feedFilter = document.querySelector("[data-news-filter]");
const categories = ["Alle", "Training", "Wettkampf", "Partner", "Road to Hawaii"];
const placeholderImage = "../Bilder%20Landingpage/Hero/final-variants/hero-final-H-no-bars-clean-filter-warm-sunrise.jpg";

// Temporary layout placeholders. Remove this block after the Newsfeed design check.
const placeholderArticles = [
  {
    slug: "placeholder-training-01",
    url: "#",
    title: "Platzhalter: Trainingslager im Kona-Rhythmus",
    teaser: "Ein kurzer Dummy-Teaser fuer Trainingsumfaenge, Hitzeanpassung und den Alltag zwischen Beruf und Vorbereitung.",
    category: "Training",
    dateLabel: "04.07.2026",
    dateTime: "2026-07-04",
    image: placeholderImage,
    imageAlt: "Triathlon Training Platzhalter",
  },
  {
    slug: "placeholder-training-02",
    url: "#",
    title: "Platzhalter: Lange Einheit, klare Zahlen",
    teaser: "Dummy-Inhalt fuer einen Trainingsbericht mit Radkilometern, Laufumfang und einem kurzen Ausblick auf die naechste Woche.",
    category: "Training",
    dateLabel: "22.06.2026",
    dateTime: "2026-06-22",
    image: placeholderImage,
    imageAlt: "Triathlon Training Platzhalter",
  },
  {
    slug: "placeholder-wettkampf-01",
    url: "#",
    title: "Platzhalter: Formtest unter Rennbedingungen",
    teaser: "Ein Beispiel fuer einen Wettkampfartikel mit Ergebnis, Belastung und den wichtigsten Learnings fuer Hawaii.",
    category: "Wettkampf",
    dateLabel: "30.06.2026",
    dateTime: "2026-06-30",
    image: placeholderImage,
    imageAlt: "Triathlon Wettkampf Platzhalter",
  },
  {
    slug: "placeholder-wettkampf-02",
    url: "#",
    title: "Platzhalter: Der naechste Start im Kalender",
    teaser: "Dummy-Text fuer eine Vorschau auf ein Rennen, inklusive Zielsetzung und Einordnung in die Vorbereitung.",
    category: "Wettkampf",
    dateLabel: "12.06.2026",
    dateTime: "2026-06-12",
    image: placeholderImage,
    imageAlt: "Triathlon Wettkampf Platzhalter",
  },
  {
    slug: "placeholder-partner-01",
    url: "#",
    title: "Platzhalter: Neuer regionaler Partner",
    teaser: "Beispieltext fuer eine Partnerstory mit regionaler Verbindung, gemeinsamer Sichtbarkeit und authentischem Sponsoring.",
    category: "Partner",
    dateLabel: "27.06.2026",
    dateTime: "2026-06-27",
    image: placeholderImage,
    imageAlt: "Partner Platzhalter",
  },
  {
    slug: "placeholder-partner-02",
    url: "#",
    title: "Platzhalter: Sichtbarkeit auf dem Weg nach Hawaii",
    teaser: "Dummy-Beitrag fuer eine Sponsorenaktivierung, die zeigt, wie Unternehmen die Reise kommunikativ begleiten koennen.",
    category: "Partner",
    dateLabel: "08.06.2026",
    dateTime: "2026-06-08",
    image: placeholderImage,
    imageAlt: "Partner Platzhalter",
  },
  {
    slug: "placeholder-road-01",
    url: "#",
    title: "Platzhalter: Noch 100 Tage bis Hawaii",
    teaser: "Ein Beispiel fuer ein Road-to-Hawaii-Update mit Meilenstein, Stimmung und Blick auf die kommenden Trainingswochen.",
    category: "Road to Hawaii",
    dateLabel: "03.07.2026",
    dateTime: "2026-07-03",
    image: placeholderImage,
    imageAlt: "Road to Hawaii Platzhalter",
  },
  {
    slug: "placeholder-road-02",
    url: "#",
    title: "Platzhalter: Was dieser Start bedeutet",
    teaser: "Dummy-Artikel fuer eine persoenliche Einordnung, warum die Qualifikation fuer Hawaii sportlich und emotional besonders ist.",
    category: "Road to Hawaii",
    dateLabel: "15.06.2026",
    dateTime: "2026-06-15",
    image: placeholderImage,
    imageAlt: "Road to Hawaii Platzhalter",
  },
];

const feedArticles = [...newsArticles, ...placeholderArticles];
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

  const link = document.createElement("a");
  link.href = article.url;
  link.setAttribute("aria-label", `Artikel oeffnen: ${article.title}`);

  const image = document.createElement("img");
  image.src = article.image;
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
