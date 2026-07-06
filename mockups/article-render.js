import { getArticleBySlug } from "./news-data.js";

const articleRoot = document.querySelector("[data-article-slug]");
const article = articleRoot ? getArticleBySlug(articleRoot.dataset.articleSlug) : null;

function createParagraph(block) {
  const paragraph = document.createElement("p");
  paragraph.textContent = block.text;
  if (block.type === "lead") paragraph.className = "article-lead";
  return paragraph;
}

function createMedia(articleData, block) {
  const imageSrc = block.image || articleData.image;
  const imageAlt = block.imageAlt || articleData.imageAlt;
  const captionText = block.caption || articleData.mediaCaption;
  const figure = document.createElement("figure");
  figure.className = "article-media article-media-inline";

  const button = document.createElement("button");
  button.className = "article-image-button";
  button.type = "button";
  button.dataset.lightboxSrc = imageSrc;
  button.dataset.lightboxAlt = imageAlt;

  const image = document.createElement("img");
  image.src = imageSrc;
  image.alt = imageAlt;

  const label = document.createElement("span");
  label.textContent = "Bild vergrößern";

  const caption = document.createElement("figcaption");
  caption.textContent = captionText;

  button.append(image, label);
  figure.append(button, caption);

  return figure;
}

function closeLightbox(lightbox, lightboxImage) {
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("lightbox-open");
  lightboxImage.removeAttribute("src");
  lightboxImage.alt = "";
}

function setupLightbox() {
  const lightbox = document.querySelector(".image-lightbox");
  if (!lightbox) return;

  const lightboxImage = lightbox.querySelector("img");
  const closeButtons = lightbox.querySelectorAll("button");
  const imageButtons = document.querySelectorAll("[data-lightbox-src]");

  imageButtons.forEach((button) => {
    button.addEventListener("click", () => {
      lightboxImage.src = button.dataset.lightboxSrc;
      lightboxImage.alt = button.dataset.lightboxAlt || "";
      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("lightbox-open");
    });
  });

  closeButtons.forEach((button) => button.addEventListener("click", () => closeLightbox(lightbox, lightboxImage)));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && lightbox.getAttribute("aria-hidden") === "false") {
      closeLightbox(lightbox, lightboxImage);
    }
  });
}

if (articleRoot && article) {
  document.title = article.title;

  const meta = document.querySelector("[data-article-meta]");
  const title = document.querySelector("[data-article-title]");
  const teaser = document.querySelector("[data-article-teaser]");

  if (meta) meta.textContent = `${article.category} · ${article.dateLabel}`;
  if (title) title.textContent = article.title;
  if (teaser) teaser.textContent = article.teaser;

  articleRoot.replaceChildren(
    ...article.blocks.map((block) => (block.type === "media" ? createMedia(article, block) : createParagraph(block))),
  );

  const backLink = document.createElement("a");
  backLink.className = "article-back-link";
  backLink.href = "newsfeed.html";
  backLink.textContent = "Zurück zum Newsfeed";
  articleRoot.append(backLink);

  setupLightbox();
}
