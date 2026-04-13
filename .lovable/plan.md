

## Problem

On a real tablet in portrait mode (768-820px wide), the mobile carousel cards are 75% of screen width (~576px) but only 220px tall, creating an overly wide/stretched appearance. Same issue with WOD images at h-28 (112px) and h-36 (144px) — too short for the wider tablet screen.

## Solution

Add a tablet-specific intermediate size using a custom Tailwind breakpoint (`sm:` at 640px, which covers tablets in portrait). This increases card heights and adjusts proportions without touching mobile phone or desktop layouts.

### Changes

**1. `src/pages/Index.tsx` — Hero carousel cards (line 620)**
- Change `h-[220px]` to `h-[220px] sm:h-[280px]`
- This gives tablet portrait cards more height while keeping phone cards at 220px

**2. `src/pages/Index.tsx` — WOD images (lines 689, 714)**
- Single WOD: change `h-36` to `h-36 sm:h-48`
- Two WODs: change `h-28` to `h-28 sm:h-40`
- Taller images prevent the stretched look on wider tablet screens

**3. `src/pages/Index.tsx` — Carousel basis (line 619)**
- Change `basis-[75%]` to `basis-[75%] sm:basis-[60%]`
- Narrower cards on tablet = better proportions, still shows peek of adjacent cards

### What stays unchanged
- Phone view (< 640px): identical to current
- Desktop view (1024px+): identical to current
- No changes to any other pages or components

Three targeted CSS class additions in one file.

