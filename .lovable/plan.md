
# Move "Everywhere, Anywhere" Card and Update About Page Features

## Overview
Three changes: (1) Remove the "Everywhere, Anywhere" card from the homepage and add it as the last card on the About page, (2) add a "Workout of the Day" reference as the first item in the feature list on the About page, and (3) double the height of the "About SmartyGym" navigation link on the homepage.

---

## Changes

### 1. Remove "Everywhere, Anywhere" from Homepage
**File:** `src/pages/Index.tsx`
- Delete lines 739-759 (the `{/* Mobile Only: Everywhere, Anywhere */}` section with the Card containing the title, description, tagline, and "Discover The Smarty Method" link).

### 2. Add "Everywhere, Anywhere" as Last Card on About Page
**File:** `src/pages/About.tsx`
- Insert a new card just before the CTA section (before line 423), replicating the same content:
  - Title: "Everywhere - Anywhere" in primary color
  - Description about traveling, busy life, gym backup
  - Tagline: "Wherever you are, your gym comes with you, right in your pocket."
  - "Discover The Smarty Method" link
- This card will be visible on both mobile and desktop (no responsive hiding).

### 3. Add "Workout of the Day" as First Feature Reference
**File:** `src/pages/About.tsx`
- **Desktop card** (line 130-155): Add a new row before "Expert-Crafted Workouts":
  ```
  <Flame icon> Workout of the Day
  ```
  Using a `Flame` icon (or `Zap`) in a distinctive color (e.g., `text-red-500`).

- **Mobile card** (line 187-211): Add the same as a clickable link navigating to `/workout` (the WOD section), placed first in the list.

### 4. Double the Height of "About SmartyGym" Link on Homepage
**File:** `src/pages/Index.tsx`
- Change the About SmartyGym navigation link (line 706) padding from `py-1.5` to `py-3` to double its vertical size, making it stand out more prominently among the other navigation links.

---

## Technical Summary

| File | Change |
|------|--------|
| `src/pages/Index.tsx` | Remove "Everywhere, Anywhere" card (lines 739-759); increase About SmartyGym link height (`py-1.5` to `py-3`) |
| `src/pages/About.tsx` | Add "Workout of the Day" as first feature in both desktop and mobile lists; add "Everywhere, Anywhere" card before CTA |

New import needed in About.tsx: `Flame` (or `Zap`) from lucide-react. No new dependencies.
