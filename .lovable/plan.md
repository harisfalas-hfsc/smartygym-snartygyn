
# Hero Section Audience Icons Enhancement

## Overview
Enhance the "Who is SmartyGym For?" section in the desktop hero card by making icons 50% larger and adding informative hover tooltips with descriptions for each audience segment.

## Current State
- Icons are `w-4 h-4` (16px)
- No hover descriptions
- Section located in `src/pages/Index.tsx` (lines 920-951)

## Changes

### 1. Increase Icon Size by 50%
- Change icon size from `w-4 h-4` to `w-6 h-6` (24px)
- This provides a 50% increase in size for better visibility

### 2. Add Hover Tooltips with Descriptions
Wrap each audience item in the existing Tooltip component (already imported in Index.tsx) with customized descriptions:

| Audience | Description |
|----------|-------------|
| **Busy Adults** | Perfect for professionals juggling work and life. Get effective workouts that fit your schedule—no commute, no waiting for equipment. Train when you have time, not when the gym is open. |
| **Parents** | Train at home while kids nap or play nearby. No babysitter needed, no guilt about "me time." Quick, focused sessions that work around your family's schedule. |
| **Beginners** | Start your fitness journey with confidence. Clear instructions, proper form guidance, and progressive programs designed to build your foundation safely. |
| **Intermediate** | Break through plateaus with structured periodization. Challenge yourself with varied programming that keeps you progressing without the guesswork. |
| **Travelers** | Stay consistent no matter where you are. Hotel room, Airbnb, or park—these workouts adapt to any space with minimal or no equipment needed. |
| **Gym-Goers** | Enhance your gym routine with expert programming. Follow structured plans that maximize your gym time and ensure balanced, progressive training. |

### 3. Tooltip Styling
The existing tooltip has a primary-colored gradient background which ensures visibility regardless of the changing hero background images. The tooltips will:
- Appear on hover with a smooth animation
- Have a light/consistent background for readability
- Show immediately (quick open delay)
- Be positioned above the icon to avoid overlapping

---

## Technical Details

### File to Modify
`src/pages/Index.tsx`

### Implementation Approach
1. Create an `audienceData` array with icon, label, color, and description for each segment
2. Replace the current 6 hardcoded `<div>` blocks with a `.map()` over the array
3. Wrap each item in `<Tooltip>` → `<TooltipTrigger>` → `<TooltipContent>` structure
4. Update icon classes from `w-4 h-4` to `w-6 h-6`
5. Add max-width to tooltip content for proper paragraph formatting
6. Add cursor-pointer to indicate interactivity

### Code Structure Example
```tsx
const audienceData = [
  {
    icon: Users,
    label: "Busy Adults",
    color: "text-blue-500",
    description: "Perfect for professionals juggling work and life..."
  },
  // ... other segments
];

{audienceData.map((audience) => (
  <Tooltip key={audience.label}>
    <TooltipTrigger asChild>
      <div className="flex flex-col items-center gap-1 cursor-pointer">
        <audience.icon className={`w-6 h-6 ${audience.color}`} />
        <span className="text-xs font-medium">{audience.label}</span>
      </div>
    </TooltipTrigger>
    <TooltipContent className="max-w-xs text-center">
      {audience.description}
    </TooltipContent>
  </Tooltip>
))}
```

---

## Visual Result
- Icons will be 50% larger (16px → 24px)
- Hovering over any audience icon immediately shows a tooltip with helpful description
- Tooltip has a consistent primary-colored background that stays visible over changing hero images
- Clean, non-intrusive presentation that adds value without clutter
