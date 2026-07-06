import { newsArticles } from "./news-data.js";

const form = document.querySelector("[data-editor-form]");
const blocksRoot = document.querySelector("[data-editor-blocks]");
const previewRoot = document.querySelector("[data-editor-preview]");
const output = document.querySelector("[data-editor-output]");
const copyButton = document.querySelector("[data-copy-output]");
const state = structuredClone(newsArticles[0]);

function field(name) {
  return form.elements[name];
}

function syncFieldsFromState() {
  field("title").value = state.title;
  field("slug").value = state.slug;
  field("category").value = state.category;
  field("dateLabel").value = state.dateLabel;
  field("dateTime").value = state.dateTime;
  field("url").value = state.url;
  field("teaser").value = state.teaser;
}

function syncStateFromFields() {
  state.title = field("title").value.trim();
  state.slug = field("slug").value.trim();
  state.category = field("category").value.trim();
  state.dateLabel = field("dateLabel").value.trim();
  state.dateTime = field("dateTime").value;
  state.url = field("url").value.trim();
  state.teaser = field("teaser").value.trim();
}

function labelForBlock(type) {
  if (type === "lead") return "Lead-Absatz";
  if (type === "media") return "Bild";
  return "Absatz";
}

function createBlockEditor(block, index) {
  const item = document.createElement("section");
  item.className = "editor-block";

  const head = document.createElement("div");
  head.className = "editor-block-head";

  const title = document.createElement("strong");
  title.textContent = `${index + 1}. ${labelForBlock(block.type)}`;

  const actions = document.createElement("div");
  actions.className = "editor-block-actions";

  [
    ["up", "Hoch"],
    ["down", "Runter"],
    ["remove", "L&ouml;schen"],
  ].forEach(([action, label]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.blockAction = action;
    button.dataset.blockIndex = String(index);
    button.innerHTML = label;
    actions.append(button);
  });

  head.append(title, actions);
  item.append(head);

  if (block.type === "media") {
    item.append(
      createInput(index, "image", "Bildpfad", block.image || state.image || ""),
      createInput(index, "imageAlt", "Alt-Text", block.imageAlt || state.imageAlt || ""),
      createTextarea(index, "caption", "Bildunterschrift", block.caption || block.mediaCaption || state.mediaCaption || "", 2),
    );
  } else {
    item.append(createTextarea(index, "text", "Text", block.text || "", block.type === "lead" ? 4 : 6));
  }

  return item;
}

function createInput(index, key, label, value) {
  const wrapper = document.createElement("label");
  wrapper.innerHTML = `<span>${label}</span>`;
  const input = document.createElement("input");
  input.type = "text";
  input.value = value;
  input.dataset.blockIndex = String(index);
  input.dataset.blockKey = key;
  wrapper.append(input);
  return wrapper;
}

function createTextarea(index, key, label, value, rows) {
  const wrapper = document.createElement("label");
  wrapper.innerHTML = `<span>${label}</span>`;
  const textarea = document.createElement("textarea");
  textarea.rows = rows;
  textarea.value = value;
  textarea.dataset.blockIndex = String(index);
  textarea.dataset.blockKey = key;
  wrapper.append(textarea);
  return wrapper;
}

function renderBlockEditors() {
  blocksRoot.replaceChildren(...state.blocks.map(createBlockEditor));
}

function createPreviewParagraph(block) {
  const paragraph = document.createElement("p");
  paragraph.textContent = block.text || "";
  if (block.type === "lead") paragraph.className = "article-lead";
  return paragraph;
}

function createPreviewMedia(block) {
  const figure = document.createElement("figure");
  figure.className = "article-media article-media-inline";

  const image = document.createElement("img");
  image.src = block.image || state.image;
  image.alt = block.imageAlt || state.imageAlt;

  const caption = document.createElement("figcaption");
  caption.textContent = block.caption || state.mediaCaption || "";

  figure.append(image, caption);
  return figure;
}

function renderPreview() {
  previewRoot.replaceChildren(
    ...state.blocks.map((block) => (block.type === "media" ? createPreviewMedia(block) : createPreviewParagraph(block))),
  );
}

function exportArticle() {
  const article = structuredClone(state);
  article.image = article.image || "";
  article.imageAlt = article.imageAlt || "";
  article.mediaCaption = article.mediaCaption || "";
  article.blocks = article.blocks.map((block) => {
    if (block.type !== "media") return { type: block.type, text: block.text || "" };
    const mediaBlock = { type: "media" };
    if (block.image) mediaBlock.image = block.image;
    if (block.imageAlt) mediaBlock.imageAlt = block.imageAlt;
    if (block.caption) mediaBlock.caption = block.caption;
    return mediaBlock;
  });
  return JSON.stringify(article, null, 2);
}

function renderAll() {
  syncStateFromFields();
  renderBlockEditors();
  renderPreview();
  output.value = exportArticle();
}

function updateAfterBlockInput(target) {
  const index = Number(target.dataset.blockIndex);
  const key = target.dataset.blockKey;
  if (!Number.isInteger(index) || !key || !state.blocks[index]) return;
  state.blocks[index][key] = target.value;
  renderPreview();
  output.value = exportArticle();
}

form.addEventListener("input", (event) => {
  if (event.target.matches("[data-block-key]")) {
    updateAfterBlockInput(event.target);
    return;
  }
  syncStateFromFields();
  renderPreview();
  output.value = exportArticle();
});

document.querySelectorAll("[data-add-block]").forEach((button) => {
  button.addEventListener("click", () => {
    const type = button.dataset.addBlock;
    state.blocks.push(type === "media" ? { type } : { type, text: "" });
    renderAll();
  });
});

blocksRoot.addEventListener("click", (event) => {
  const button = event.target.closest("[data-block-action]");
  if (!button) return;

  const index = Number(button.dataset.blockIndex);
  const action = button.dataset.blockAction;
  if (!Number.isInteger(index)) return;

  if (action === "remove") state.blocks.splice(index, 1);
  if (action === "up" && index > 0) [state.blocks[index - 1], state.blocks[index]] = [state.blocks[index], state.blocks[index - 1]];
  if (action === "down" && index < state.blocks.length - 1) {
    [state.blocks[index], state.blocks[index + 1]] = [state.blocks[index + 1], state.blocks[index]];
  }

  renderAll();
});

copyButton.addEventListener("click", async () => {
  await navigator.clipboard.writeText(output.value);
  copyButton.textContent = "Kopiert";
  window.setTimeout(() => {
    copyButton.textContent = "Export kopieren";
  }, 1200);
});

syncFieldsFromState();
renderBlockEditors();
renderPreview();
output.value = exportArticle();
