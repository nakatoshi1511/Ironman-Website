import { getArticleBySlug } from "./news-data.js";

const articleRoot = document.querySelector("[data-article-slug]");
const article = articleRoot ? getArticleBySlug(articleRoot.dataset.articleSlug) : null;

const allowedRichTags = new Set(["p", "br", "h2", "h3", "strong", "em", "u", "ul", "ol", "li", "a"]);
const safeLinkProtocols = new Set(["http:", "https:", "mailto:"]);

function normalizeHref(href) {
  const normalizedHref = (href || "").trim();
  if (!normalizedHref) return "";

  const schemeMatch = normalizedHref.match(/^([a-zA-Z][a-zA-Z\d+.-]*:)(.*)$/);
  if (!schemeMatch) return normalizedHref;

  return `${schemeMatch[1].toLowerCase()}${schemeMatch[2]}`;
}

function isSafeHref(href) {
  const normalizedHref = normalizeHref(href);
  if (!normalizedHref) return false;
  if (normalizedHref.startsWith("#")) return true;
  if (normalizedHref.startsWith("//")) return false;
  if (normalizedHref.startsWith("/") || normalizedHref.startsWith("./") || normalizedHref.startsWith("../")) return true;
  const schemeMatch = normalizedHref.match(/^([a-zA-Z][a-zA-Z\d+.-]*):/);
  if (!schemeMatch) return true;
  return safeLinkProtocols.has(`${schemeMatch[1].toLowerCase()}:`);
}

function sanitizeRichNode(node, documentRef) {
  const nodeConstants = documentRef.defaultView || window;

  if (node.nodeType === nodeConstants.Node.TEXT_NODE) {
    return documentRef.createTextNode(node.textContent || "");
  }

  if (node.nodeType !== nodeConstants.Node.ELEMENT_NODE) {
    return documentRef.createTextNode("");
  }

  const tagName = node.tagName.toLowerCase();

  if (!allowedRichTags.has(tagName)) {
    return documentRef.createDocumentFragment();
  }

  const clean = documentRef.createElement(tagName);

  if (tagName === "a") {
    const href = normalizeHref(node.getAttribute("href") || "");
    if (isSafeHref(href)) {
      clean.setAttribute("href", href);
      if (/^https?:/.test(href)) {
        clean.setAttribute("target", "_blank");
        clean.setAttribute("rel", "noopener noreferrer");
      }
    }
  }

  Array.from(node.childNodes).forEach((child) => clean.append(sanitizeRichNode(child, documentRef)));
  return clean;
}

function sanitizeRichHtml(html, documentRef = document) {
  const template = documentRef.createElement("template");
  template.innerHTML = html || "";

  const fragment = documentRef.createDocumentFragment();
  Array.from(template.content.childNodes).forEach((child) => fragment.append(sanitizeRichNode(child, documentRef)));
  return fragment;
}

function createRichContent(block, documentRef = document) {
  const wrapper = documentRef.createElement("div");
  wrapper.className = "article-rich-text";
  wrapper.append(sanitizeRichHtml(block.html || "", documentRef));
  return wrapper;
}

function createParagraph(block) {
  const paragraph = document.createElement("p");
  paragraph.textContent = block.text;
  if (block.type === "lead") paragraph.className = "article-lead";
  return paragraph;
}

function setArticleTitle(element, title) {
  const [primary, ...rest] = title.split(" - ");
  if (rest.length === 0) {
    element.textContent = title;
    return;
  }

  const primaryLine = document.createElement("span");
  primaryLine.textContent = primary;

  const secondaryLine = document.createElement("span");
  secondaryLine.textContent = `- ${rest.join(" - ")}`;

  element.replaceChildren(primaryLine, secondaryLine);
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
  if (title) setArticleTitle(title, article.title);
  if (teaser) teaser.textContent = article.teaser;

  articleRoot.replaceChildren(
    ...article.blocks.map((block) => {
      if (block.type === "media") return createMedia(article, block);
      if (block.type === "rich") return createRichContent(block);
      return createParagraph(block);
    }),
  );

  const backLink = document.createElement("a");
  backLink.className = "article-back-link";
  backLink.href = "newsfeed.html";
  backLink.textContent = "Zurück zum Newsfeed";
  articleRoot.append(backLink);

  setupLightbox();
}

export { createRichContent, sanitizeRichHtml };
