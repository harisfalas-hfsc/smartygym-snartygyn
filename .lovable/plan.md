## Hero WOD card — remove "Today" badge + guarantee header/content legibility on any image

Scope: `src/components/home/HeroDestinationConstellation.tsx`, desktop bento `BentoTile` only. No content, data, layout-size, or mobile changes.

### 1. Remove the "Today" badge (desktop WOD card)

- Delete the small "Today" pill currently rendered in the WOD header band (the `showLivePill` span inside the featured header).
- Keep `showLivePill` logic untouched elsewhere; just stop rendering the chip on the desktop bento WOD tile.
- The header band keeps the "Workout of the Day" title + today's date — no replacement badge.

### 2. Make "Workout of the Day" + date readable on ANY background image

Problem: WOD images vary (bright Pilates/Recovery whites vs dark Strength shots). A translucent gradient alone fails over white backgrounds. Fix with a layered, image-independent treatment so the header is always legible without looking heavy on dark images either.

**Header band (top of WOD card):**
- Replace the current `bg-gradient-to-b from-black/75 …` with a solid-dark, blurred header bar that does not depend on the image:
  - `bg-black/55 backdrop-blur-md` plus a thin `border-b border-white/10`
  - Fades out into the image below via a short secondary gradient strip (`from-black/40 to-transparent`, ~24px tall) so the transition looks intentional, not a hard band
- Title uses `text-white` with a true text outline (paint-order stroke) so it survives both bright and dark images:
  - `[paint-order:stroke] [-webkit-text-stroke:1px_rgba(0,0,0,0.55)] drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]`
  - Keep `font-extrabold uppercase tracking-wide text-xl md:text-2xl`
- Date line: `text-white/90` with the same drop-shadow (smaller, no stroke needed because of the blurred bar behind it)

**Bottom content area (workout name + meta on the WOD tile):**
- Strengthen the bottom scrim to be image-independent:
  - Increase the bottom gradient on the featured tile from `from-black/65` to `from-black/80 via-black/40 to-transparent` and bump its min-height (e.g. apply on the bottom ~55% only via `bg-gradient-to-t … h-[60%] bottom-0` wrapper) so bright Pilates/Recovery images still yield WCAG-legible text without darkening the whole picture.
  - Add the same text-stroke + drop-shadow utility class to the workout name and description so they stay readable if the scrim is briefly defeated by a near-white image edge.

**Why this works for white/bright images:**
- The header bar is a real semi-opaque dark layer (`bg-black/55`) with `backdrop-blur-md`, so it renders as a frosted dark band regardless of the underlying pixel color — no reliance on the image being dark.
- The text stroke + drop shadow give the glyphs their own contrast, so even on a pure-white frame the white fill reads against the dark 1px outline.
- Non-WOD tiles are unchanged (their images are static/curated).

### 3. Out of scope
- Mobile constellation, layout sizes, data, business logic, generated image prompts.
- Non-WOD tiles' overlays.

### Technical notes
- Edits localized to the featured-tile header `<div>` and the bottom gradient `<div>` inside `BentoTile`.
- Use Tailwind arbitrary-value utilities for `-webkit-text-stroke` and `paint-order` (no config changes).
- Uses existing semantic colors; `text-white` is acceptable here because the layer sits over arbitrary photography (the legibility scrim, not theme color).
