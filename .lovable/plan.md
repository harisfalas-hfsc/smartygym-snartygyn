
# Homepage Hero Section Redesign (Desktop Only)

## Overview

This plan redesigns the `HeroThreeColumns` component to replace the current three text columns (Explore, Who is SmartyGym For, Why SmartyGym) with a modern 4-card layout matching the existing Workout of the Day card styling. **All changes apply to desktop view only** - mobile layout remains completely unchanged.

## Current vs New Layout (Desktop Only)

```text
CURRENT DESKTOP LAYOUT:
┌────────────┬────────────┬────────────┬────────────┐
│  Explore   │ Who Is For │ Why Smarty │  WOD Card  │
│  (6 links) │ (6 items)  │ (4 items)  │  (banner)  │
└────────────┴────────────┴────────────┴────────────┘

NEW DESKTOP LAYOUT:
┌──────────┬──────────┬──────────┬──────────┐
│  Smarty  │ Exercise │   Blog   │   WOD    │
│  Tools   │ Library  │  & News  │  Banner  │
│  (card)  │  (card)  │  (card)  │  (card)  │
└──────────┴──────────┴──────────┴──────────┘

BELOW "100% Human. 0% AI." section:
┌─────────────────────────────────────────────────────┐
│    "Who is SmartyGym For?" - 6 audience badges      │
│  [Busy Adults] [Parents] [Beginners] [Intermediate] │
│  [Travelers] [Gym-Goers]                            │
└─────────────────────────────────────────────────────┘
```

## Mobile View: No Changes

The mobile view in `Index.tsx` (lines 459-677) uses a completely separate layout with:
- Carousel for navigation cards
- Separate "What We Stand For" card
- Different WOD display

**This mobile code will remain completely untouched.**

## Design Specifications

### Card Dimensions
All 4 cards will use identical sizing based on the current WOD card:
- Height: 220px
- Width: Calculated to fit 4 cards evenly with gaps
- Cards will be perfectly aligned in a single row

### Card Design Pattern
Each promotional card will match the WOD card structure:
1. **Header bar** with icon + title (gradient background)
2. **Image section** (130px height, object-cover)
3. **Content section** with title + brief description
4. **CTA link** with hover animation and arrow icon

### Card-Specific Details

| Card | Border Color | Header Icon | Image | CTA Text |
|------|-------------|-------------|-------|----------|
| Smarty Tools | orange-500 | Calculator | Static fitness tools image | Explore Tools |
| Exercise Library | emerald-500 | Video | Static exercise demo image | Browse Library |
| Blog & News | red-500 | FileText | Static blog/reading image | Read Articles |
| WOD | green-500 | Dumbbell | Dynamic from database | View Today's WOD |

### "Who is SmartyGym For" Section
- Small card/section positioned below the "100% Human. 0% AI." card
- Displays 6 audience types as inline badges with icons:
  - Busy Adults (Users icon, blue)
  - Parents (Heart icon, pink)
  - Beginners (GraduationCap icon, emerald)
  - Intermediate Lifters (Target icon, orange)
  - Travelers (Plane icon, cyan)
  - Gym-Goers (Dumbbell icon, purple)

## Technical Implementation

### Files to Modify

1. **`src/components/HeroThreeColumns.tsx`**
   - Complete redesign of the component
   - Remove the three text-based columns (Explore, Who Is For, Why)
   - Create a reusable `FeatureCard` sub-component
   - Implement 4-card horizontal grid layout
   - Keep WOD card logic intact (database query, rotation, etc.)
   - Add three static cards for Tools, Library, Blog
   - Use Unsplash images for static cards

2. **`src/pages/Index.tsx`**
   - Add "Who is SmartyGym For" badge section below the "100% Human. 0% AI." card
   - Uses existing icons and color scheme from the removed column
   - Simple horizontal badge layout

### Component Structure

```text
HeroThreeColumns (renamed internally to HeroFeatureCards)
├── FeatureCard (reusable component)
│   ├── Header (icon + title with gradient)
│   ├── Image (static or dynamic)
│   ├── Content (description text)
│   └── CTA (link + chevron icon)
│
├── Tools Card (static image)
├── Library Card (static image)
├── Blog Card (static image)
└── WOD Card (dynamic, existing logic preserved)
```

### Static Images

High-quality Unsplash images representing:
- **Tools**: Fitness equipment/calculator theme
- **Library**: Exercise demonstration/gym theme
- **Blog**: Reading/learning/education theme

## Summary of Changes

| What | Action |
|------|--------|
| "Explore" column | DELETE - replaced by three cards |
| "Who is SmartyGym For" column | DELETE - moved to badge section |
| "Why SmartyGym" column | DELETE - links moved elsewhere or removed |
| WOD Card | KEEP - unchanged in logic, resized to match |
| Smarty Tools card | ADD - new static card |
| Exercise Library card | ADD - new static card |
| Blog & News card | ADD - new static card |
| Audience badges | ADD - new section below Human/AI card |
| Mobile view | UNCHANGED - completely untouched |
