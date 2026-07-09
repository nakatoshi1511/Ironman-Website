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
- caption lines such as `Bildunterschrift: David beim Training in der Toskana`

## Import Rule

Codex converts the Google Doc into `mockups/news-data.js`. Rich article sections use `{ type: "rich", html: "..." }` blocks with only the supported tags from the renderer.

## Supported Rich Text

Supported tags are `p`, `br`, `h2`, `h3`, `strong`, `em`, `u`, `ul`, `ol`, `li`, and `a`.

Images remain normal `media` blocks so the existing lightbox behavior keeps working.
