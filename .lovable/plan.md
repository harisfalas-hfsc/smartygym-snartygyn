

# Desktop Hero Carousel Implementation

## Summary

Replace the current 4-column grid layout in the desktop hero section with a carousel that matches the mobile design. The carousel will display **2 cards centered** with partial visibility of adjacent cards on the sides, plus navigation arrows.

---

## Current vs. New Design

| Aspect | Current Desktop | New Desktop |
|--------|-----------------|-------------|
| Layout | 4-column grid (static) | Carousel (2 cards visible + peek) |
| Cards shown | All 4 at once | 2 centered + partial view of neighbors |
| Navigation | None | Left/Right arrows |
| Card design | Images with headers | Icons + text (matching mobile) |
| Cards | WOD, Tools, Library, Blog | WOD, Workouts, Programs, Ritual, Tools, Blog, Library |

---

## Cards to Display (Same as Mobile)

The carousel will include these 7 cards in order (matching the mobile `heroCards` array):

1. **Workout of the Day** - Icon: Dumbbell, Route: /workout/wod
2. **Smarty Workouts** - Icon: Dumbbell, Route: /workout
3. **Smarty Programs** - Icon: Calendar, Route: /trainingprogram
4. **Smarty Ritual** - Icon: Sparkles, Route: /daily-ritual
5. **Smarty Tools** - Icon: Calculator, Route: /tools
6. **Blog & Insights** - Icon: FileText, Route: /blog
7. **Exercise Library** - Icon: Video, Route: /exerciselibrary

---

## Technical Implementation

### File Changes

**1. Update `src/components/HeroThreeColumns.tsx`**

Transform from a 4-column grid to a carousel component:

- Import `Carousel`, `CarouselContent`, `CarouselItem`, `CarouselNext`, `CarouselPrevious` from the existing carousel component
- Replace the grid layout with a carousel
- Use `basis-[42%]` for each carousel item to show 2 cards (~84% total) with partial peek of adjacent cards
- Display navigation arrows on the left and right sides
- Remove image-based cards in favor of icon-based cards matching mobile design
- Remove unused image imports

### Card Design (Matching Mobile)

Each card will have:
- Icon in a circular primary/10 background (larger than mobile for desktop)
- Title text (larger font for desktop)
- Description text (larger for readability)
- ChevronRight indicator
- Border styling with primary/40 default, primary on hover
- Height: approximately 180px for desktop readability

### Carousel Configuration

```text
Options:
- align: "center" (centers the active group)
- loop: true (infinite scrolling)
- slidesToScroll: 1 (scroll one card at a time)

Item sizing:
- basis-[42%] shows roughly 2 cards with ~8% peek on each side
```

---

## Visual Layout

```text
Desktop Hero Carousel:
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  [<]  ▌ Card 6 ▌  │  Card 1  │  Card 2  │  ▌ Card 3 ▌  [>]  │
│       (partial)     (full)     (full)      (partial)        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
         ●   ○   ○   ○   ○   ○   ○  (navigation dots)
```

---

## Technical Details

### Changes to `src/components/HeroThreeColumns.tsx`

1. **Remove unused imports**: Delete image imports (heroToolsImage, heroLibraryImage, heroBlogImage)

2. **Remove FeatureCard component**: No longer needed since we're using the mobile-style card layout

3. **Add carousel-specific state**:
   - `carouselApi` for controlling the carousel
   - `currentSlide` for tracking active slide (optional for dots)

4. **Define cards array** with all 7 cards:
   ```
   - Workout of the Day (special handling for dynamic WOD data)
   - Smarty Workouts
   - Smarty Programs  
   - Smarty Ritual
   - Smarty Tools
   - Blog & Insights
   - Exercise Library
   ```

5. **Carousel structure**:
   - Container with padding for arrow space
   - CarouselContent with centered alignment
   - CarouselItem with `basis-[42%]` for 2-card view with peek
   - Card component matching mobile style (icon, title, description, chevron)
   - Navigation arrows positioned outside the cards
   - Optional: Navigation dots below

### WOD Card Handling

The "Workout of the Day" card will remain special:
- Shows dynamic WOD info when available (name, category, difficulty)
- Falls back to "Being Prepared" message when no WOD exists
- Uses the existing WOD query already in the component

---

## What Stays the Same

- Mobile view is **completely unchanged** (this only affects desktop)
- The existing `heroCards` array in Index.tsx defines the card content
- WOD fetching logic remains in HeroThreeColumns

---

## Benefits

1. **Consistency** - Desktop and mobile use the same card design language
2. **More content** - Shows 7 service cards instead of 4
3. **Better UX** - Carousel provides intuitive navigation
4. **Cleaner design** - Icon-based cards without images look more modern
5. **Peek effect** - Shows users there's more content to discover

