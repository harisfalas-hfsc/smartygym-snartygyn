

# Mobile About Page: Clickable Features + Restructured "Your Gym Comes With You" Card

## Changes (Mobile view only)

### 1. Make feature list items clickable links

Each item in the first card ("Your Gym Re-imagined") becomes a tappable link navigating to the correct page:

| Feature | Route |
|---|---|
| Expert-Crafted Workouts | `/workout` |
| Structured Training Programs | `/trainingprogram` |
| Exercise Library | `/exerciselibrary` |
| Smarty Tools | `/tools` |
| Articles | `/blog` |
| LogBook | `/userdashboard?tab=logbook` |

Each row will use `onClick={() => navigate(route)}` with a `cursor-pointer` style and a subtle hover/active effect so users know they are tappable.

### 2. Restructure the second mobile card

The current "Your Gym Comes With You" card (lines 215-235) with its long paragraph will be **replaced**. Its content will be moved **inside the "Who is SmartyGym For?" section** (lines 351-395).

**New mobile "Who is SmartyGym For?" section** will contain:
1. The title "Who Is SmartyGym For"
2. The six audience items (Busy adults, Parents, Beginners, etc.) -- same as now
3. Below that, the new text:
   - *"We are not here to replace your gym. We are here to back you up when life gets in the way."*
   - *"Wherever you are, your gym comes with you."*

The old second card is deleted entirely.

---

## Technical Details

### File: `src/pages/About.tsx`

1. **Mobile card 1 (lines 183-206)**: Wrap each feature `<span>` in a clickable element with `onClick={() => navigate('/route')}` and add `cursor-pointer` + `text-primary hover:underline` styling.

2. **Mobile card 2 (lines 215-235)**: Delete this entire card.

3. **Mobile "Who is SmartyGym For?" section (lines 351-395)**: After the six audience items, add the two lines of text:
   - "We are not here to replace your gym. We are here to back you up when life gets in the way."
   - "Wherever you are, your gym comes with you." (in primary/bold)

Desktop remains unchanged.
