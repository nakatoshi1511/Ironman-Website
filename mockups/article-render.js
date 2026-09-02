import { getArticleBySlug } from "./news-data.js?v=article-09-1";

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
  secondaryLine.textContent = rest.join(" - ");

  element.replaceChildren(primaryLine, secondaryLine);
}

function addLightboxMetadata(button, block) {
  if (!block.lightboxGroup || !Array.isArray(block.lightboxImages)) return;
  button.dataset.lightboxGroup = block.lightboxGroup;
  button.dataset.lightboxImages = JSON.stringify(block.lightboxImages);
}

function createMedia(articleData, block, documentRef = document) {
  const imageSrc = block.image || articleData.image;
  const imageSrcset = block.imageSrcset || articleData.imageSrcset;
  const imageSizes = block.imageSizes || articleData.imageSizes;
  const imageAlt = block.imageAlt || articleData.imageAlt;
  const captionText = block.caption || articleData.mediaCaption;
  const figure = documentRef.createElement("figure");
  figure.className = "article-media article-media-inline";

  const button = documentRef.createElement("button");
  button.className = "article-image-button";
  button.type = "button";
  button.dataset.lightboxSrc = imageSrc;
  button.dataset.lightboxAlt = imageAlt;
  addLightboxMetadata(button, block);

  const image = documentRef.createElement("img");
  image.src = imageSrc;
  if (imageSrcset) image.srcset = imageSrcset;
  if (imageSizes) image.sizes = imageSizes;
  image.alt = imageAlt;

  const label = documentRef.createElement("span");
  label.textContent = "Bild vergrößern";

  button.append(image, label);
  figure.append(button);

  if (captionText) {
    const caption = documentRef.createElement("figcaption");
    caption.textContent = captionText;
    figure.append(caption);
  }

  return figure;
}

function createGallery(block, documentRef = document) {
  const gallery = documentRef.createElement("div");
  gallery.className = `article-media-gallery${block.variant === "collection" ? " article-media-gallery-collection" : ""}`;

  (block.images || []).forEach((entry) => {
    const imageData = typeof entry === "string" ? { image: entry } : entry;
    const imageSrc = imageData.image;
    const button = documentRef.createElement("button");
    button.className = "article-gallery-thumb";
    button.type = "button";
    button.dataset.lightboxSrc = imageSrc;
    button.dataset.lightboxAlt = imageData.imageAlt || "";
    addLightboxMetadata(button, block);

    const image = documentRef.createElement("img");
    image.src = imageSrc;
    if (imageData.imageSrcset) image.srcset = imageData.imageSrcset;
    if (imageData.imageSizes) image.sizes = imageData.imageSizes;
    image.alt = imageData.imageAlt || "";

    button.append(image);

    if (block.variant !== "collection") {
      gallery.append(button);
      return;
    }

    const figure = documentRef.createElement("figure");
    figure.className = "article-gallery-item";
    figure.append(button);

    if (imageData.caption) {
      const caption = documentRef.createElement("figcaption");
      caption.textContent = imageData.caption;
      figure.append(caption);
    }

    gallery.append(figure);
  });

  return gallery;
}

function closeLightbox(lightbox, lightboxImage) {
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("lightbox-open");
  lightboxImage.removeAttribute("src");
  lightboxImage.alt = "";
}

function getLightboxState(button) {
  const images = JSON.parse(button.dataset.lightboxImages || "[]");
  const index = images.indexOf(button.dataset.lightboxSrc);
  return {
    images: index >= 0 ? images : [button.dataset.lightboxSrc],
    index: index >= 0 ? index : 0,
    isGrouped: index >= 0 && images.length > 1,
  };
}

function getCyclicIndex(index, change, length) {
  return (index + change + length) % length;
}

function setupLightbox() {
  const lightbox = document.querySelector(".image-lightbox");
  if (!lightbox) return;

  const lightboxImage = lightbox.querySelector("img");
  const previousButton = lightbox.querySelector(".image-lightbox-previous");
  const nextButton = lightbox.querySelector(".image-lightbox-next");
  const count = lightbox.querySelector("[data-lightbox-count]");
  const closeButtons = lightbox.querySelectorAll(".image-lightbox-backdrop, .image-lightbox-close");
  const imageButtons = document.querySelectorAll("[data-lightbox-src]");
  let activeImages = [];
  let activeIndex = 0;
  let activeAlt = "";

  function showActiveImage() {
    const isGrouped = activeImages.length > 1;
    lightboxImage.src = activeImages[activeIndex];
    lightboxImage.alt = activeAlt;
    if (previousButton) previousButton.hidden = !isGrouped;
    if (nextButton) nextButton.hidden = !isGrouped;
    if (count) {
      count.hidden = !isGrouped;
      count.textContent = isGrouped ? `${activeIndex + 1} / ${activeImages.length}` : "";
    }
  }

  imageButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const state = getLightboxState(button);
      activeImages = state.images;
      activeIndex = state.index;
      activeAlt = button.dataset.lightboxAlt || "";
      showActiveImage();
      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("lightbox-open");
    });
  });

  if (previousButton) {
    previousButton.addEventListener("click", () => {
      activeIndex = getCyclicIndex(activeIndex, -1, activeImages.length);
      showActiveImage();
    });
  }
  if (nextButton) {
    nextButton.addEventListener("click", () => {
      activeIndex = getCyclicIndex(activeIndex, 1, activeImages.length);
      showActiveImage();
    });
  }
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
      if (block.type === "gallery") return createGallery(block);
      return createParagraph(block);
    }),
  );

  const backLink = document.createElement("a");
  backLink.className = "article-back-link";
  backLink.href = "/news";
  backLink.textContent = "Zurück zum Newsfeed";
  articleRoot.append(backLink);

  setupLightbox();
}

export { createGallery, createMedia, createRichContent, getCyclicIndex, getLightboxState, sanitizeRichHtml };
