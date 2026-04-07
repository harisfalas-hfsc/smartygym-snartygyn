

# Redesign Free Trial & Exit Intent Popups to Bright/Clean Style

## Problem
The Free Trial and Exit Intent popups use a dark cinematic style (dark background image + heavy black overlay + white text) that clashes with the bright, clean aesthetic now used across the rest of the mobile UI.

## What Changes
Redesign both popups to match the stacked "blog card" style: bright image on top, clean `bg-card` content section below, theme-aware colors that look great in both light and dark mode.

## Components to Update

### 1. `src/components/growth/FreeTrialPopup.tsx`
- Remove the full-bleed dark background image + gradient overlay approach
- New layout: stacked card with a bright, energetic hero image on top (~45% height) and a clean `bg-card` content section below
- Content section uses `text-foreground` for headings, `text-muted-foreground` for body text, and the existing `Crown` icon + CTA button
- Border uses `border-primary/40` to match other cards
- Generate a new bright hero image for the free trial theme (e.g., bright gym, energetic atmosphere)

### 2. `src/components/growth/ExitIntentPopup.tsx`
- Same redesign approach as Free Trial
- Stacked layout: bright image top, clean content below
- Generate a bright hero image for the "complimentary workout" theme
- Keep the Haris Falas link and "No credit card needed" badge, just restyle to use semantic theme colors

### 3. Generate 2 new bright images
- `src/assets/popup-free-trial-bright.jpg` — Bright, sunlit gym/fitness scene
- `src/assets/popup-exit-intent-bright.jpg` — Bright, welcoming workout scene

## Design Details
- Card: `rounded-2xl overflow-hidden bg-card border-2 border-primary/40`
- Image section: `h-[200px]` with `object-cover`, no overlay
- Content section: padded, centered text, semantic colors throughout
- CTA button: keeps existing primary styling
- "No thanks" dismiss link: `text-muted-foreground` instead of `text-white/50`
- Checkmarks/badges: keep `text-emerald-500` accents

## What Stays the Same
- All other popups (WOD, Ritual, PAR-Q, Promo Banner, Social Proof) are already theme-adaptive — no changes needed
- Popup logic, timing, and behavior unchanged
- CTA actions and navigation unchanged

