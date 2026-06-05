## Problem

Every blog article page (`/blog/...`) is rendered inside a narrow `max-w-4xl` (≈896px) container. The rest of the site — Blog index, Tools, workout galleries, training program galleries — uses the standard wide container `max-w-6xl md:max-w-[1500px]` (per the Desktop Container Width Standard memory). That mismatch is why:

- The article card looks visibly smaller/narrower than every other card on the site.
- The hero image is forced into a smaller frame instead of filling a full-width card.
- The article reads as a tall, narrow column → much more vertical scrolling than necessary.

## Fix

In `src/pages/ArticleDetail.tsx`, replace the two narrow wrappers with the standard widened container used everywhere else on desktop. Mobile stays untouched (per the Desktop Container Width Standard).

Specifically:
1. Outer wrapper `<div className="container mx-auto px-4 max-w-4xl">` → `container mx-auto max-w-6xl md:max-w-[1500px] px-4 md:px-6`
2. `<article className="container mx-auto px-4 max-w-4xl">` → same standard widths
3. Keep the inner `<A4Container>` around the article HTML body so the *reading text itself* stays at a comfortable line length (the A4 container already caps text width for readability). This means:
   - The **card** (background, padding, hero image, title, share buttons) fills the full standard width like every other card on the site.
   - The **article body text** still wraps at A4 width inside that card, so we don't create 1500px-wide lines of prose that are hard to read.
4. The hero image (`article.image_url`) already uses `w-full h-auto` — it will automatically fill the new wider card, matching how images render on workout/program pages.

## Out of scope

- No changes to mobile layout (already correct).
- No changes to typography, colors, schema, SEO, or article content rendering.
- No changes to Reader Mode dialog.
- No changes to other pages.

## Files touched

- `src/pages/ArticleDetail.tsx` (only — two className edits)

## Result

Blog article pages will visually match the width of Blog index, Tools, workout pages, and training program pages. The hero image fills the full card width. The card looks like part of the same design system. Body text stays at A4 width for readability, so the page won't feel emptier — it just stops feeling artificially narrow.
