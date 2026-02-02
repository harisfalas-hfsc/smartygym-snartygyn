

# Hero Section Redesign - Desktop Grid Layout

## Overview

This plan redesigns the desktop hero section from a carousel-based layout to a **3-row × 2-column grid layout** as shown in your sketch. The new layout will feature six distinct cards arranged in a fixed grid, replacing the current sliding carousel.

---

## Proposed Layout

```text
+---------------------------+----------------------------------+
| ROW 1                                                        |
+---------------------------+----------------------------------+
| Workout of the Day (WOD)  | Your Gym Re-imagined,            |
| [Image card with overlay] | Anywhere, Anytime                |
|                           | [Text card with Join Now button] |
+---------------------------+----------------------------------+
| ROW 2                                                        |
+---------------------------+----------------------------------+
| 100% Human. 0% AI.        | Smarty Workouts                  |
| [Text card with icons]    | [Image card with overlay]        |
+---------------------------+----------------------------------+
| ROW 3                                                        |
+---------------------------+----------------------------------+
| Blog & Insights           | The SmartyGym Promise            |
| [Image card with overlay] | [Text card]                      |
+---------------------------+----------------------------------+
```

---

## Card Details

### Row 1
1. **Workout of the Day (Left)** - Image-based card with:
   - Full-bleed hero image (`hero-wod.jpg`)
   - Dark gradient overlay
   - Dynamic WOD info (category, difficulty, duration)
   - Click navigates to `/workout/wod`

2. **Your Gym Re-imagined (Right)** - Text-based card with:
   - Current "Your Gym Anywhere" content
   - "Join Now" button (top-right, for non-premium users)
   - Gradient background

### Row 2
3. **100% Human. 0% AI. (Left)** - Text-based card with:
   - UserCheck/Ban/Brain icon trio
   - Current messaging about human-designed workouts
   - "Transform Your Fitness" button (non-premium)
   - Three feature boxes (Real Expertise, Personal Touch, Not a Robot)

4. **Smarty Workouts (Right)** - Image-based card with:
   - Full-bleed hero image (`hero-workouts.jpg`)
   - Dark gradient overlay
   - Dumbbell icon in circular container
   - Click navigates to `/workout`

### Row 3
5. **Blog & Insights (Left)** - Image-based card with:
   - Full-bleed hero image (`hero-blog.jpg`)
   - Dark gradient overlay
   - FileText icon in circular container
   - Click navigates to `/blog`

6. **The SmartyGym Promise (Right)** - Text-based card with:
   - Current promise messaging
   - Gradient background
   - Centered text layout

---

## Technical Implementation

### File Changes

**File:** `src/pages/Index.tsx`

1. **Replace HeroThreeColumns usage** with new inline 3×2 grid
2. **Move existing cards** into the grid structure:
   - "Your Gym Anywhere" card (already exists at lines 677-714)
   - "100% Human" section (already exists at lines 721-794)
   - "SmartyGym Promise" (currently outside hero at lines 898-913)
3. **Add new image-based cards** for WOD, Workouts, and Blog using the same visual style as `HeroThreeColumns.tsx`:
   - Full-bleed images with `bg-gradient-to-t from-black/90` overlay
   - Circular icon containers
   - Hover effects (`hover:scale-[1.08]`, `hover:shadow-2xl`)
4. **Remove** the `<HeroThreeColumns />` component from the desktop hero section
5. **Reorganize layout** using CSS Grid:
   ```
   grid grid-cols-2 gap-4
   ```

### Component Structure

```text
<div className="grid grid-cols-2 gap-4">
  {/* Row 1 */}
  <WODCard />           {/* Image card - navigates to /workout/wod */}
  <YourGymAnywhereCard />  {/* Text card - existing content */}
  
  {/* Row 2 */}
  <HumanNotAICard />       {/* Text card - existing content (condensed) */}
  <SmartyWorkoutsCard />   {/* Image card - navigates to /workout */}
  
  {/* Row 3 */}
  <BlogInsightsCard />     {/* Image card - navigates to /blog */}
  <SmartyGymPromiseCard /> {/* Text card - existing content (moved up) */}
</div>
```

### Visual Consistency

- **Image cards** will use the same styling as the current carousel cards:
  - Height: ~220px to match carousel card height
  - Border: `border-2 border-primary/40 rounded-xl`
  - Hover: `hover:border-primary hover:shadow-2xl hover:scale-[1.02]` (slightly reduced scale for grid)
  - Icon container: `w-10 h-10 rounded-full bg-background/90`
  - Gradient: `bg-gradient-to-t from-black/90 via-black/50 to-transparent`

- **Text cards** will maintain current styling:
  - Gradient backgrounds
  - Primary color accents
  - Consistent padding and typography

### Mobile Impact

- No changes to mobile layout
- The grid will only apply to desktop view (already controlled by existing responsive logic)
- Mobile will continue to use its current carousel/card structure

---

## Files Modified

| File | Changes |
|------|---------|
| `src/pages/Index.tsx` | Replace carousel with 3×2 grid, reorganize existing cards, add 3 new image-based cards |

---

## What Stays the Same

- All existing content text remains unchanged
- Mobile layout is unaffected
- All navigation routes stay the same
- Existing images (`hero-wod.jpg`, `hero-workouts.jpg`, `hero-blog.jpg`) are reused
- "Join Now" and "Transform Your Fitness" buttons remain for non-premium users

---

## Expected Result

The desktop hero section will transform from a horizontal sliding carousel to a clean, scannable 3-row grid where users can see all six key sections at a glance without needing to scroll through a carousel.

