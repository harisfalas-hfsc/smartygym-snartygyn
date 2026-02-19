

# Redesign "Your Gym Re-imagined" Card with Vertical Icon List

## What Changes

The first card on the About page ("Your Gym Re-imagined. Anywhere, Anytime.") will be updated to display the six features as a **vertical list with icons**, matching the style of the "Who is SmartyGym For?" section below it.

### Current Layout
The features (Expert-crafted workouts, Structured training programs, Exercise library, Smarty Tools, Articles, Logbook) are currently listed inline as bold text within a single paragraph.

### New Layout
Each feature gets its own row with a colored icon on the left and the feature name next to it, stacked vertically:

- Dumbbell icon -- Expert-Crafted Workouts
- Calendar icon -- Structured Training Programs
- Video icon -- Exercise Library
- Wrench icon -- Smarty Tools
- FileText icon -- Articles
- BookOpen icon -- LogBook

Below the list, a closing line:
**"Everything a complete gym must offer, built by real professionals, in your pocket at smartygym.com."**

This applies to **both** the desktop card and the mobile card (first of the two mobile cards).

---

## Technical Details

### File: `src/pages/About.tsx`

1. **Add imports** for `Wrench`, `Video`, `FileText`, `BookOpen`, `Calendar` from `lucide-react`

2. **Desktop card** (lines 117-144): Replace the inline paragraph listing features with a vertical list using `flex items-center gap-3` rows (same pattern as the "Who is SmartyGym For?" section at lines 305-340), followed by the closing tagline paragraph.

3. **Mobile card 1** (lines 149-161): Same change -- replace the inline paragraph with the vertical icon list and closing tagline.

The second paragraph (backup plan / "Your Gym Comes With You") remains unchanged on both desktop and mobile.

