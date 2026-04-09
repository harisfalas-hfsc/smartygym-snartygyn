

# Replace Hamburger Menu Icon with Circle Menu Icon

## What Changes
Replace the current plain three-line SVG hamburger icon with a **circle menu** icon — three horizontal lines enclosed in a circle. This gives it more visual weight and makes it feel like a tappable button.

## Technical Details

**File:** `src/components/Navigation.tsx` (lines 262-267)

Replace the current custom SVG with a circle + three lines SVG:
- Add a `<circle>` element (cx=12, cy=12, r=10) around the existing three lines
- Shorten the lines slightly (x1=7, x2=17) so they sit nicely inside the circle
- Adjust line positions (y: 8, 12, 16) to be well-spaced within the circle
- Keep the same button sizing and classes

The result: a clean circular outline containing three menu lines, clearly communicating "tap to open menu" while looking more polished than the bare hamburger.

