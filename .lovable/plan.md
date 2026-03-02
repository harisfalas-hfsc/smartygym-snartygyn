
# Standardize Page Spacing Across All Smarty Tools

## The Problem

The spacing between the navigation header and page content is inconsistent across pages. The **1RM Calculator**, **BMR Calculator**, **Macro Calculator**, and **Workout Timer** pages have extra top padding compared to the **Calorie Counter** and **Tools** pages (and most other pages on the site).

**Root cause:** Those 4 pages use `p-4` on the outer wrapper and `py-4 sm:py-8` on the inner container, which adds extra top space. The Calorie Counter and most other pages use `container mx-auto px-4 pb-8` with no extra top padding.

## The Fix

Standardize the 4 inconsistent tool pages to match the pattern used by the Calorie Counter and the rest of the site:

```text
Before (inconsistent):
  <div class="min-h-screen bg-background p-4">
    <div class="max-w-2xl mx-auto py-4 sm:py-8">

After (consistent):
  <div class="min-h-screen bg-background">
    <div class="container mx-auto max-w-2xl px-4 pb-8">
```

## Files to Modify

1. **src/pages/OneRMCalculator.tsx** -- Change outer `p-4` to no top padding; change inner to `container mx-auto max-w-2xl px-4 pb-8`
2. **src/pages/BMRCalculator.tsx** -- Same change
3. **src/pages/MacroTrackingCalculator.tsx** -- Same change
4. **src/pages/WorkoutTimer.tsx** -- Same change

This will make the spacing between the logo/nav and page title consistent across all pages on the site, both mobile and desktop.
