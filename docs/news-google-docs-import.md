# Google Docs News Import

Google Docs is the drafting surface for new Road-to-Hawaii news articles. It is not a CMS and does not sync automatically with the website.

## Recommended Document Shape

- Document title: article headline
- `Kategorie`: newsfeed category
- `Datum`: visible date, for example `13.07.2026`
- `Teaser`: short newsfeed teaser
- `Artikel`: full article content

Inside the article section, use normal Google Docs formatting:

- headings for sections
- paragraphs for body text
- bold, italic, and underline for emphasis
- bullet or numbered lists
- links
- image placeholder lines such as `Bild: trainingsauftakt-toskana-01.jpg`
- caption lines only when the user has explicitly supplied the caption, such as `Bildunterschrift: David beim Training in der Toskana`

## Import Rule

Codex converts the Google Doc into `mockups/news-data.js`. Rich article sections use `{ type: "rich", html: "..." }` blocks with only the supported tags from the renderer.

## Supported Rich Text

Supported tags are `p`, `br`, `h2`, `h3`, `strong`, `em`, `u`, `ul`, `ol`, `li`, and `a`.

Images remain normal `media` blocks so the existing lightbox behavior keeps working.

## Content Fidelity Rule

Do not infer, invent, or add article content. This includes captions, alt text, teasers, headings, image choices, and factual details. Import only content explicitly supplied or approved by the user; leave missing fields empty or ask for them before publishing.

## Spelling-Only Review

Before importing a new or changed article, review it once for spelling errors only. Replace only unambiguous misspellings with their correct spelling. Do not add or remove words, sentences, or paragraphs, and do not change grammar, punctuation, sentence structure, style, wording, or meaning.
