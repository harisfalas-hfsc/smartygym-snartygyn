

## Problem

The desktop category cards on both Smarty Workouts and Smarty Programs pages use background images with a `bg-black/60` dark overlay. This creates very dark cards that clash with the light mode's white background. The mobile cards already have separate, brighter images that work well.

## Solution

Two-part approach to make cards look good in both light and dark mode:

### 1. Use the mobile card images for desktop too (both pages)

Instead of the current full-bleed background approach with dark overlay, switch the desktop cards to use the same **stacked blog-card layout** as mobile — image on top, content below. This eliminates the dark overlay entirely and uses the existing bright mobile images.

**WorkoutFlow.tsx (desktop grid, lines 332-434):**
- Replace the current full-background card design with a stacked layout: image section on top (~55% height) + content section below
- Use `categoryMobileImages` instead of `categoryBackgrounds` for the image source
- Remove the `bg-black/60` overlay entirely
- Text renders on the card background (`bg-card`), so it automatically adapts to light/dark mode
- Keep all existing hover effects, badges, and metadata

**TrainingProgramFlow.tsx (desktop grid, lines 268-350):**
- Same structural change: stacked layout with image on top, content below
- Use `programMobileImages` instead of `programBackgrounds`
- Remove the `bg-black/60` overlay
- Keep all existing hover effects, badges, and metadata

### 2. Card structure (both pages)

The new desktop card structure will be:
```text
┌──────────────────────┐
│   [Image - 55%]      │
│   (bright, no overlay)│
│   [Count Badge]       │
├──────────────────────┤
│   [Icon] Title        │
│   Description         │
│   Haris Falas credit  │
│   [Tags: Level, Equip]│
└──────────────────────┘
```

This matches the mobile approach already in use, ensures consistent branding, and looks great on both light and dark backgrounds since the content area uses the theme's card color.

### Files to modify
1. `src/pages/WorkoutFlow.tsx` — desktop grid section (lines 332-434)
2. `src/pages/TrainingProgramFlow.tsx` — desktop grid section (lines 268-350)

No new images needed. No database changes. No new components.

