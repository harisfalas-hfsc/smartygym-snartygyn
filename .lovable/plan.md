

# Fix Hero Background Image Readability

## Problem
The 3 rotating hero images have inconsistent contrast. The outdoor park image works well — its tones allow white text and UI elements to remain readable. The gym and home images are brighter/busier, making content hard to see.

## Approach
Two complementary changes to make all three images behave like the park image:

### 1. Apply CSS brightness/contrast filters to the problematic images
Instead of replacing the images (which would lose the gym/home/outdoor storytelling), darken the gym and home images via CSS so they match the park image's tone. Each image gets its own filter tuning:

- **Park couple** — no change (reference standard)
- **Gym group** — `brightness(0.6)` to darken the busy, bright gym environment
- **Home couple** — `brightness(0.65)` to tone down the indoor lighting

This is done in `HeroBackgroundImages.tsx` by adding per-image filter classes.

### 2. Slightly increase overlay opacity as a safety net
Bump `bg-background/65` → `bg-background/70` in `Index.tsx` (line 766) for a small additional readability boost across all images without making it feel too opaque.

## Files Changed
- `src/components/HeroBackgroundImages.tsx` — add per-image brightness filters
- `src/pages/Index.tsx` — adjust overlay opacity from 65 to 70

