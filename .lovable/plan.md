## What changes

Replace the desktop constellation (circles + connecting lines + Haris Falas center bubble) with **7 image tiles absolutely-positioned to match your sketch exactly** — uneven, asymmetric, with the precise gaps you drew. Same hero frame size (1300×700), nothing around it moves.

Desktop only. Tablet and mobile layouts stay untouched. Haris Falas card is removed from this layout.

## Exact placement (read straight from your sketch)

Stage = 1300 × 700 px. Coordinates measured from the top-left of the stage to mirror the sketch proportions and the visible gaps from the header.

```text
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ┌─────────┐                                ┌──────────┐         │  ← right column
│  │         │       ┌─────────┐              │ PROGRAMS │         │    starts
│  │   WOD   │       │         │              └──────────┘         │    near top
│  │ (square)│       │WORKOUTS │                                   │
│  │         │       │ (tall   │              ┌──────────┐         │
│  │         │       │  rect)  │              │          │         │
│  └─────────┘       │         │              │  TOOLS   │         │
│                    │         │              │ (taller) │         │
│  ┌─────────┐       └─────────┘              │          │         │
│  │  BLOG   │       ┌──────────────┐         └──────────┘         │
│  │ (small) │       │EXERCISE LIB. │         ┌──────────┐         │
│  └─────────┘       │  (wide rect) │         │COMMUNITY │         │
│                    └──────────────┘         └──────────┘         │
└──────────────────────────────────────────────────────────────────┘
```

Per-tile coordinates `{ top, left, width, height }` in stage px:

| Tile             | top | left | width | height |
|------------------|-----|------|-------|--------|
| WOD (square)     |  20 |   40 |  300  |  340   |
| Blog (small)     | 470 |   55 |  270  |  150   |
| Workouts (tall)  | 110 |  430 |  300  |  400   |
| Exercise Library | 540 |  410 |  340  |  150   |
| Programs (wide)  |  30 |  960 |  300  |  170   |
| Tools (taller)   | 250 |  970 |  290  |  260   |
| Community (small)| 540 |  980 |  280  |  130   |

These intentionally reproduce the sketch's unevenness:
- WOD sits flush near the top-left, big square.
- Workouts is **pushed down and centered**, taller than WOD.
- Programs sits **near the top-right** (slightly higher than Workouts), wide.
- Tools is the tallest right-column tile, in the middle.
- Blog, Exercise Library, Community line up near the bottom but at different baselines (Blog highest, Exercise Library/Community lower) — exactly like the sketch.
- Visible gap between the header and the top of WOD/Programs ≈ 20–30 px, matching the sketch's small breathing room under the title row.

## Visual treatment

- Each tile: `rounded-2xl overflow-hidden` with full-bleed image background, soft `ring-1 ring-border/40` and a `shadow-lg`. **No hard border on the image itself** so the photo isn't cropped/framed harshly.
- Bottom dark-to-transparent gradient + label in foreground white-on-image style. Small icon chip (background/95, primary ring) in the corner.
- Featured WOD tile keeps the **Today pill** + pulsing primary ring + cycling between today's bodyweight/equipment images.
- Hover: scale 1.03, primary ring intensifies, shadow lifts. Subtle 6s float with staggered delays so the grid still breathes.
- Light & dark mode: only semantic tokens (`--primary`, `--border`, `--background`, `--foreground`). No hard-coded hex.

## Technical details

File: `src/components/home/HeroDestinationConstellation.tsx`

1. Add `BENTO_LAYOUT` map (the table above).
2. Add a `BentoTile` component — same image-cycle, Today pill, icon-chip, label, hover/float behavior as `Bubble`, but `rounded-2xl` and arbitrary `width × height`.
3. In the desktop branch (`<div className="hidden md:block">`), keep the same 1300×700 stage and the `desktopScale` shrink-to-fit logic. Replace the SVG connection lines, the absolutely-positioned `Bubble`s, and the center `COACH` `Bubble` with absolutely-positioned `BentoTile`s using `BENTO_LAYOUT`.
4. Tablet branch and mobile branch are not touched.
5. `COACH`, `CONNECTIONS`, and `centers` become unused in the desktop branch — leave the constants in place (cheap) so nothing else breaks.

## Verification

- Open the homepage at desktop ≥ 1300 px and confirm the 7 tiles match the sketch positions and the visible gaps from the header / between tiles.
- Confirm the surrounding hero (100% Human / 0% AI card, headline, CTAs) hasn't moved a pixel — the stage is still 1300×700.
- Toggle light/dark and confirm legibility.
- Resize to ~1100 px to confirm `desktopScale` shrinks the whole bento proportionally without overflow.
- Confirm tablet (≤1024 px landscape) and mobile views are visually identical to before.
- Confirm WOD tile cycles today's images and shows the Today pill when WODs are live.
