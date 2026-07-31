# Bortolot Desktop Headline Design

## Goal

Reduce the visual weight of the long Bortolot headline in the featured Newsfeed card and the article hero on desktop. The existing mobile presentation and all other articles must remain unchanged.

## Scope

- Apply the compact treatment only to the Bortolot article.
- Apply it only at viewport widths of `881px` and above, matching the existing featured-card desktop breakpoint.
- Keep the uppercase condensed typeface and the supplied title text unchanged.
- Do not change card proportions, image sizing, article content, navigation, or mobile typography.

## Implementation Design

The Bortolot article data receives a semantic `titleVariant: "compact"` flag. The Newsfeed renderer translates that flag into a modifier class on the generated card, avoiding a hard-coded slug check in rendering logic.

The static Bortolot detail page receives the matching compact-title modifier class on its `<body>`. A desktop-only media query then applies:

- Featured Newsfeed title: `clamp(2.1rem, 3.3vw, 3.5rem)` with a slightly more open `0.98` line height.
- Detail-page hero title: `clamp(2.6rem, 4.5vw, 4.8rem)` with a `0.96` line height.

The existing mobile rules remain authoritative below `881px`.

## Verification

- Add focused regression assertions for the article variant, renderer modifier, desktop-only breakpoint, and both compact font-size values.
- Run the focused regression test, then the complete `npm test` suite.
- In the visible in-app browser, inspect the Newsfeed and detail page at a wide desktop viewport.
- Confirm that the featured card text and image have balanced heights and the detail headline wraps more calmly.
- Recheck at `390px` and `360px` to prove the mobile typography is unchanged and no horizontal overflow was introduced.
- Check browser warnings and errors, then review the final diff before committing.
