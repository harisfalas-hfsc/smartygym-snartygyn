

# Redesign Homepage Hero Carousel Cards (Mobile Only) to Match Blog Card Style

## What Changes
On mobile only, the hero carousel cards will switch from the current "full-bleed image with overlay text" layout to a stacked layout matching the blog article cards: **image on top, content section below** on a card background.

## Current vs New Layout

```text
CURRENT (mobile):                NEW (mobile):
┌──────────────┐                ┌──────────────┐
│  ░░IMAGE░░░░ │                │  ░░IMAGE░░░░ │
│  ░░░░░░░░░░░ │                │  ░░░░░░░░░░░ │
│  ░░░░░░░░░░░ │                │  ░░░░░░░░░░░ │
│──────────────│                ├──────────────┤
│  Title  [ic] │                │  Title  [ic] │
│  Description │                │  Description │
│   Explore >  │                │   Explore >  │
└──────────────┘                └──────────────┘
  (text overlays image)           (text on card bg)

DESKTOP: No change — keeps current overlay style.
```

## File Changed: `src/components/HeroThreeColumns.tsx`

### Mobile card structure
- Use responsive classes to switch between layouts at the `md:` breakpoint
- Mobile: card becomes a vertical flex column — image section takes ~55% height, content section below with `bg-card` background
- Remove the absolute positioning and gradient overlay on mobile
- Keep the icon circle, title, description, and "Explore >" CTA in the content area
- Match blog card styling: rounded corners, border, clean separation between image and text

### Desktop preservation
- Desktop (`md:` and up) keeps the current overlay layout with gradient, absolute positioning, and 32% basis — no changes

### Card sizing
- Mobile: `basis-[75%]` for the peek/carousel effect (consistent with other mobile carousels), taller card (~220px) to accommodate stacked layout
- Desktop: stays `basis-[32%]` and `h-[180px]`

