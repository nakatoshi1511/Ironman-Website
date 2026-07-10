import { getArticleBySlug } from "./news-data.js";

const article = getArticleBySlug("17-stunden-zum-ruhm");
const templateButtons = document.querySelectorAll("[data-template-target]");
const templateRoots = document.querySelectorAll("[data-template]");

function textFromHtml(value) {
  const template = document.createElement("template");
  template.innerHTML = value || "";
  return template.content.textContent || "";
}

function splitTitle(title) {
  const [primary, ...rest] = textFromHtml(title).split(" - ");
  return {
    primary,
    secondary: rest.length ? rest.join(" - ") : "",
  };
}

function createElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

function createMeta(className = "template-meta") {
  return createElement("p", className, `${article.category} / ${article.dateLabel}`);
}

function createImage(className) {
  const figure = createElement("figure", className);
  const image = document.createElement("img");
  image.src = article.image;
  image.alt = article.imageAlt;
  const caption = createElement("figcaption", "", article.mediaCaption);
  figure.append(image, caption);
  return figure;
}

function createArticleBlock(block, index, templateName) {
  if (block.type === "media") return createImage(`${templateName}-media template-inline-media`);

  const paragraph = createElement("p", block.type === "lead" ? `${templateName}-lead template-lead` : "");
  paragraph.textContent = block.text || "";
  if (index === 0) paragraph.dataset.firstBlock = "true";
  return paragraph;
}

function createContent(templateName) {
  const content = createElement("div", `${templateName}-content template-content`);
  content.append(...article.blocks.map((block, index) => createArticleBlock(block, index, templateName)));
  const back = createElement("a", "template-back-link", "Zurueck zum Newsfeed");
  back.href = "newsfeed.html";
  content.append(back);
  return content;
}

function renderClassic(root) {
  const title = splitTitle(article.title);
  const wrap = createElement("article", "template-article classic-template");
  const hero = createElement("header", "classic-hero");
  hero.append(
    createMeta(),
    createElement("h2", "", title.primary),
    createElement("p", "classic-subtitle", title.secondary),
    createElement("p", "classic-teaser", textFromHtml(article.teaser)),
  );
  wrap.append(hero, createContent("classic"));
  root.replaceChildren(wrap);
}

function renderCover(root) {
  const title = splitTitle(article.title);
  const wrap = createElement("article", "template-article cover-template");
  const hero = createElement("header", "cover-hero");
  const text = createElement("div", "cover-copy");
  text.append(
    createMeta(),
    createElement("h2", "", title.primary),
    createElement("p", "cover-subtitle", title.secondary),
    createElement("p", "cover-teaser", textFromHtml(article.teaser)),
  );
  hero.append(text, createImage("cover-image"));
  wrap.append(hero, createContent("cover"));
  root.replaceChildren(wrap);
}

function renderLogbook(root) {
  const title = splitTitle(article.title);
  const wrap = createElement("article", "template-article logbook-template");
  const hero = createElement("header", "logbook-hero");
  const route = createElement("div", "logbook-route");
  [
    ["Impuls", "2016"],
    ["Distanz", "226 km"],
    ["Ziel", "Hawaii"],
  ].forEach(([label, value]) => {
    const item = createElement("span", "");
    item.append(createElement("b", "", label), document.createTextNode(value));
    route.append(item);
  });
  hero.append(createMeta(), createElement("h2", "", title.primary), createElement("p", "", `${title.secondary}. ${textFromHtml(article.teaser)}`), route);
  wrap.append(hero, createContent("logbook"));
  root.replaceChildren(wrap);
}

function renderNotes(root) {
  const title = splitTitle(article.title);
  const wrap = createElement("article", "template-article notes-template");
  const hero = createElement("header", "notes-hero");
  const label = createElement("div", "notes-label");
  label.append(createMeta(), createElement("span", "", "Blognotiz"));
  hero.append(label, createElement("h2", "", title.primary), createElement("p", "notes-subtitle", title.secondary), createElement("p", "notes-teaser", textFromHtml(article.teaser)));
  const body = createElement("div", "notes-body");
  body.append(createImage("notes-image"), createContent("notes"));
  wrap.append(hero, body);
  root.replaceChildren(wrap);
}

function renderAll() {
  if (!article) return;
  renderClassic(document.querySelector("[data-template='classic']"));
  renderCover(document.querySelector("[data-template='cover']"));
  renderLogbook(document.querySelector("[data-template='logbook']"));
  renderNotes(document.querySelector("[data-template='notes']"));
}

templateButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.templateTarget;
    templateButtons.forEach((item) => item.classList.toggle("is-active", item === button));
    templateRoots.forEach((root) => root.classList.toggle("is-active", root.dataset.template === target));
  });
});

renderAll();
