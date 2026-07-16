# Agent Instructions

This repository uses `PROJECT_CONTEXT.md` as the living project context. Read it before starting project work.

## Session Start Command: `go`

When the user writes `go` as a standalone command in this project:

1. Read `PROJECT_CONTEXT.md` completely from the local project files **before any browser action**. Do not try to open this local Markdown file in the browser.
2. Treat the current project state and instructions in `PROJECT_CONTEXT.md` as authoritative.
3. Check whether the local server is running on port `4173`; if not, start it as described in `PROJECT_CONTEXT.md`.
4. Only after steps 1–3 succeed, open `http://127.0.0.1:4173/mockups/landingpage-flow.html` in the visible in-app browser.
5. For the browser portion of this startup flow, use only the in-app browser. If it is unavailable or broken, tell the user and ask how to continue; do not substitute another browser.
6. Do not interpret `go` as approval for installations, global CLI changes, plugin setup, or unrelated system changes.

## Ongoing Project Work

- Read `PROJECT_CONTEXT.md` first.
- Check `mockups/landingpage-flow.html`, `mockups/newsfeed.html`, and, for news work, `mockups/news-data.js` plus the affected article detail page.
- Verify visual changes in the in-app browser.
- After relevant layout changes, check both desktop and mobile.
- Do not delete, reset, or clean up unrelated files.
- The user wants iterative brainstorming and mockups before final implementation.
