# Project Cleanup Design

## Goal

Prepare the project for a controlled production rollout by separating clearly non-production artifacts from the tracked repository without changing the live website, rewriting Git history, or prematurely removing ambiguous source material.

## Approved approach

Use a conservative first cleanup round. Create a local archive named `_local-archive/` in the project root and ignore the entire directory in Git. The archive remains available on the current computer but is no longer included in future commits or Vercel deployments.

This first round moves only files and directories that are clearly not required by the active website, API, tests, project documentation, or development tooling.

## First-round archive contents

Move these existing directories into `_local-archive/` while preserving each directory as a distinct subtree:

- `tmp/` to `_local-archive/tmp/`
- `outputs/` to `_local-archive/outputs/`
- `archive/` to `_local-archive/archive/`
- `mockup-screenshots/` to `_local-archive/mockup-screenshots/`

Move these root-level drafts into `_local-archive/root-drafts/`:

- `.codex-roadmap-view.html`
- `triathlon-diagonal-mockup.svg`
- `triathlon-diagonal-mockup-v2.svg`
- `triathlon-swim-bike-run-v2.png`
- `triathlon-swim-bike-run-v2-filtered.png`

Move the non-production invoice into a path that preserves its origin:

- `Bilder Landingpage/Newsfeed/Artikel 01/Invoice-MGYKFH-00003.pdf`
- Destination: `_local-archive/source-documents/Bilder Landingpage/Newsfeed/Artikel 01/Invoice-MGYKFH-00003.pdf`

The invoice does not require removal from existing Git history.

## Files retained in Git

Keep the following categories tracked in this round:

- active website pages, styles, scripts, and assets
- `api/`, `tests/`, `tools/`, and `docs/`
- `PROJECT_CONTEXT.md`, `AGENTS.md`, `.env.example`, `package.json`, and `index.html`
- `RoadmapV2.png`, because the active landing page and roadmap test reference it
- the active sponsor PDF
- raw photos, unused Hero variants, DOCX and ZIP source files, and old design pages that require a separate second-round review

Keeping development files tracked is intentional. Git inclusion and production deployment inclusion will be treated as separate concerns during the later security review.

## Safety procedure

1. Confirm the working tree before moving files and preserve unrelated user changes.
2. Re-check references to every first-round candidate.
3. Add `_local-archive/` to `.gitignore`.
4. Resolve and verify every source and destination path before moving directories or binary files.
5. Move one candidate group at a time so each resulting Git deletion is attributable.
6. Confirm that `_local-archive/` is ignored and that Git reports only the intended removals and `.gitignore` change.
7. Run the complete Node test suite.
8. Check the active page asset references after the move. If an active dependency was misclassified, restore it from the local archive before continuing.

No Git-history rewrite, force-push, deployment, dependency installation, or unrelated cleanup is part of this phase.

## Local archive limitations

Because `_local-archive/` is ignored, its contents are not backed up by Git and will not be available on another computer after cloning the repository. The user is responsible for a separate backup if any archived source material must be retained long term.

## Follow-up phases

After the conservative cleanup is complete and verified, handle these as separate reviewed phases:

1. Evaluate the ambiguous raw assets, Hero variants, source documents, and old mockup pages.
2. Review deployment boundaries and security measures, including which tracked files Vercel can serve.
3. Perform a code review covering correctness, security, privacy, maintainability, accessibility, and deployment readiness.

