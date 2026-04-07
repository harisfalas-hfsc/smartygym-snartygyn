

# Limit Mobile Description Cards to 2 Lines

## Problem
The dynamic description card shown below the carousel icons on mobile (for both Workouts and Training Programs) can grow tall with long descriptions. You want these capped at 2 lines.

## Changes

### `src/pages/WorkoutFlow.tsx` (line ~429)
Add `line-clamp-2` to the description paragraph in the mobile dynamic description card:
```
// From:
<p className="text-sm text-muted-foreground transition-opacity duration-300">

// To:
<p className="text-sm text-muted-foreground transition-opacity duration-300 line-clamp-2">
```

### `src/pages/TrainingProgramFlow.tsx` (line ~339)
Same change — add `line-clamp-2`:
```
// From:
<p className="text-sm text-muted-foreground transition-opacity duration-300">

// To:
<p className="text-sm text-muted-foreground transition-opacity duration-300 line-clamp-2">
```

Two files, one class added to each. No other changes needed — `line-clamp-2` is built into Tailwind and handles the overflow with ellipsis automatically.

