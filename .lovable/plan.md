

# Fix: Brand Variant Contradiction + Image Search Visibility

## Problem 1: Are we helping competitors?

**Yes, there is a contradiction right now.** Your `robots.txt` (line 9) still says:
```
SmartyGym is NOT the same as "Smartgym" or "Smart Gym" (fitness equipment/machines)
```
This directly tells crawlers to SEPARATE you from those terms — the opposite of what we just implemented in all other files. We need to fix this so robots.txt aligns with the new offensive strategy.

**Fix:** Update the robots.txt brand clarification to say these are YOUR alternate names (for online fitness context), while still differentiating from hardware brands.

## Problem 2: Why images don't appear in search

Three concrete reasons:

### A. No dedicated image sitemap
Your sitemap includes `image:image` tags inside URL entries, which is correct but not aggressive enough. Google and Bing strongly prefer a **separate image sitemap** specifically listing all workout/program images with rich metadata. Right now your 260+ workout images and 25+ program images are buried inside the main sitemap.

### B. Listing pages only show 10 images in structured data
`WorkoutDetail.tsx` line 349: `filteredWorkouts.slice(0, 10)` — the ItemList schema only includes the first 10 workouts. Google sees 10 images max per category page. Same issue in training programs.

### C. Missing `ImageObject` structured data on listing pages
The ItemList schema uses `"image": workout.image_url` (a plain URL string). Google Image Search strongly prefers the full `ImageObject` format with `url`, `name`, `caption`, `width`, `height` — this gives images independent ranking signals.

### D. No brand variants in image alt text
Current alt text on workout cards: `"workout name - duration difficulty bodyweight format workout by Haris Falas Sports Scientist at SmartyGym.com"`. Missing SmartGym/Smart Gym/Smart-Gym variants.

## Implementation plan

### 1. Fix robots.txt contradiction (~5 lines changed)
Replace line 9's "is NOT the same as" with language that claims these as alternate names while differentiating from hardware.

### 2. Create dedicated image sitemap in `generate-sitemap` function
Add a second sitemap output: `image-sitemap.xml` that lists EVERY workout and program image as a primary entry with full `image:loc`, `image:title`, `image:caption`, `image:geo_location` tags. This is what Google Image Search indexes aggressively.

### 3. Remove the `.slice(0, 10)` limit in structured data
- `WorkoutDetail.tsx` line 349: show ALL workouts in ItemList (or at least 50)
- `TrainingProgramDetail.tsx`: same fix
- Use full `ImageObject` format instead of plain URL string

### 4. Add brand variants to image alt text
Update `WorkoutDetail.tsx` line 600 and `WODCategory.tsx` line 109 to include "SmartGym Smart Gym" in alt text.

### 5. Add image sitemap reference to robots.txt
Add `Sitemap: https://smartygym.com/image-sitemap.xml` alongside the existing sitemap reference.

### 6. Update weekly SEO refresh to include image metadata
Ensure `refresh-seo-metadata` generates `image_alt_text` with brand variants for all content.

## Files to modify
1. `public/robots.txt` — fix brand contradiction, add image sitemap reference
2. `supabase/functions/generate-sitemap/index.ts` — add dedicated image sitemap generation endpoint
3. `src/pages/WorkoutDetail.tsx` — remove slice(10), full ImageObject schema, brand variant alt text
4. `src/pages/TrainingProgramDetail.tsx` — same fixes
5. `src/pages/WODCategory.tsx` — brand variant alt text
6. `src/components/WorkoutOfTheDay.tsx` — brand variant alt text

## What stays untouched
- No workout generation, Stripe, auth, or core functionality changes
- No sitemap structure changes for non-image URLs
- All existing SEO metadata preserved

