## Why the page is cut off

On the homepage, the "constellation" of circles uses a **fixed-size desktop stage of 1300×650 pixels** with each bubble placed at hard-coded pixel coordinates (e.g. one bubble starts at `left: 1130px`, size `170px` = right edge at 1300px).

The outer container is `max-width: 1300px` but inside, nothing scales — bubbles are positioned in absolute pixels. So whenever the viewport is narrower than 1300 px (which is exactly what happens on a phone in landscape, even with "Desktop site" enabled in Chrome — typical width 800–900 px), the right-side bubbles (Workouts, Library, Community) sit outside the visible area and you cannot scroll horizontally to reach them.

The mobile/tablet layouts already adapt correctly. The problem is only the desktop layout viewed on a small screen.

## Fix

Make the desktop constellation **uniformly shrink** to fit the available width, instead of being clipped.

### Change in `src/components/home/HeroDestinationConstellation.tsx` (desktop branch only)

1. Measure the container width with a `ref` + `ResizeObserver`.
2. Compute `scale = min(1, containerWidth / 1300)`.
3. Wrap the existing 1300×650 absolutely-positioned stage in an outer wrapper:
   - Outer wrapper height = `650 * scale` (so layout below the constellation stays correct).
   - Inner stage keeps its fixed `1300 × 650` size and absolute coordinates, but gets `transform: scale(var(--scale)); transform-origin: top left;`.
4. Nothing else changes — bubble sizes, positions, popovers, connection SVG all scale together as one piece.

This keeps the design pixel-perfect on full desktop (≥1300 px) and gracefully shrinks it on:
- phone in landscape with "Desktop site" forced (~800–900 px),
- small laptops / split-screen windows,
- the `/` route in any narrow desktop viewport.

### Out of scope

- No changes to mobile portrait layout.
- No changes to the tablet circular layout.
- No changes to colors, copy, bubble sizes on real desktop, or any other page.

### Technical notes

- Use a single `useState` for measured width and a `ResizeObserver` on the wrapper element (fall back to `window.resize` if RO is unavailable).
- Apply scale via inline style on the inner `<div>` that currently has `width: 100%; maxWidth: 1300px; height: 650px`. That div becomes `width: 1300px; height: 650px; transform: scale(...); transform-origin: top left;` and is wrapped by a new outer div with `width: 100%; height: ${650*scale}px; overflow: hidden`.
- Guard against SSR / first paint by defaulting scale to `1` until the first measurement.
