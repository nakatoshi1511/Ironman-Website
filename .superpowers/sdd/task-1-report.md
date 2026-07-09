# Task 1 Report

Implemented rich-text rendering support for news article blocks in `mockups/article-render.js`.

## What changed

- Added `sanitizeRichHtml(html, documentRef)` and `createRichContent(block, documentRef)` as named exports.
- Added allowed rich-text tag handling for `p`, `br`, `h2`, `h3`, `strong`, `em`, `u`, `ul`, `ol`, `li`, and `a`.
- Added safe `href` filtering for anchors, including protocol allow-listing and target/rel behavior for external links.
- Updated article rendering to branch on `block.type === "rich"` without breaking the existing browser-side import side effect.
- Added source-level coverage in `tests/news-rich-text.test.js`.

## Verification

- `npm test`

## Notes

- I kept the changes scoped to the requested files.
- No additional concerns after the test run.
