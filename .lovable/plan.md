
# Mobile Community Page Carousel Enhancement

## Overview
Improve the mobile user experience on the Community page by making the carousel swipeable nature visually obvious. Currently, all 4 slides (Leaderboard, Ratings, Comments, Testimonials) take full width with no visual hint that more content exists. Users cannot intuit they should swipe.

## Current State Analysis
- **File**: `src/pages/Community.tsx` (lines 646-922)
- **Current carousel setup**: Uses Embla carousel with `CarouselItem` at full width (`basis-full` default)
- **Visual indicator**: Only dot indicators at the bottom - not visible until scrolling
- **Problem**: Cards fill the entire viewport width, giving no hint of adjacent cards

## Solution: Peek Effect + Enhanced Visual Cues

### 1. Partial Card Visibility ("Peek" Effect)
Change the carousel item width from `basis-full` (100%) to approximately `basis-[88%]` or `basis-[90%]`, which will:
- Show the current card centered
- Reveal a small portion (~5-6%) of the previous and next cards on each side
- Immediately communicate "there's more to see"

This pattern is already successfully used elsewhere in the codebase:
- `WorkoutFlow.tsx`: `basis-[80%]`
- `TrainingProgramFlow.tsx`: `basis-[80%]`
- `Tools.tsx`: `basis-[85%]`
- `Index.tsx` hero carousel: `basis-[75%]`

### 2. Carousel Container Adjustments
- Add left/right padding to the carousel container so peeking cards are visible at edges
- Adjust `CarouselContent` negative margin from `-ml-4` to something smaller (or custom for this use case)
- Add `px-4` or similar padding to the wrapper to create space for peek visibility

### 3. Visual Polish
- Keep the existing dot indicators (they work well once users understand the carousel)
- Optionally add a subtle "swipe" hint on first view (can be a simple animated arrow or text that fades after a few seconds)

---

## Technical Implementation

### File to Modify
`src/pages/Community.tsx`

### Changes Required

**Step 1: Update CarouselItem basis width**
```tsx
// Current:
<CarouselItem>

// Change to:
<CarouselItem className="basis-[88%]">
```

Apply to all 4 CarouselItems:
- Slide 1: Leaderboard (line ~651)
- Slide 2: Ratings (line ~725)
- Slide 3: Comments (line ~804)
- Slide 4: Testimonials (line ~901)

**Step 2: Add container padding for peek visibility**
```tsx
// Current:
<div className="md:hidden mb-6">
  <Carousel setApi={setCarouselApi} className="w-full">
    <CarouselContent>

// Change to:
<div className="md:hidden mb-6 px-4">
  <Carousel setApi={setCarouselApi} className="w-full">
    <CarouselContent className="-ml-2">
```

The `-ml-2` counteracts the default `-ml-4` for tighter spacing, and `px-4` on the wrapper provides edge visibility.

**Step 3: Add gap adjustment to CarouselItems**
```tsx
<CarouselItem className="pl-2 basis-[88%]">
```

The `pl-2` creates consistent spacing between cards (matching the `-ml-2` on CarouselContent).

---

## Visual Result

```text
Before (current):
+---------------------------+
|                           |
|     [Leaderboard Card]    |  <- Full width, no hint of other cards
|                           |
+---------------------------+
         ●  ○  ○  ○

After (with peek effect):
+---------------------------+
|   |                   |   |
| ← | [Leaderboard Card]| → |  <- Partial cards visible on sides
|   |                   |   |
+---------------------------+
         ●  ○  ○  ○
```

---

## Mobile Optimization Verification
Per project guidelines, all changes will be verified across mobile states:

- **Width 320px** (iPhone SE): Cards still fit, ~10% visible on sides
- **Width 375px** (iPhone 13 mini): Good balance of main card and peek
- **Width 390px** (iPhone 14): Optimal display
- **Width 414px** (iPhone Plus models): Slightly more peek visible

The `basis-[88%]` value ensures:
- Main card has ~88% of container width (readable content)
- ~6% visible on each side (clear swipe affordance)
- Cards remain touch-friendly (min 44px tap targets preserved)

---

## Summary of Changes

| Location | Current | After |
|----------|---------|-------|
| Container div | `className="md:hidden mb-6"` | `className="md:hidden mb-6 px-4"` |
| CarouselContent | (default) | `className="-ml-2"` |
| All 4 CarouselItems | (no custom class) | `className="pl-2 basis-[88%]"` |

This maintains full mobile optimization while clearly signaling swipeable content through partial card visibility.
