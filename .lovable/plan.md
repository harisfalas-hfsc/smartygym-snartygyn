## Problem

When you click the "i" button on an exercise (e.g. inside Velocity Compass Blitz), the popup shows only the GIF — you can't see the description, secondary muscles, or step‑by‑step instructions, and you can't scroll. This affects every exercise, not just one workout.

## Root cause

The popup uses a Radix `ScrollArea` set to `max-h-[70vh]` with no defined parent height. Radix's scroll viewport requires an actual height to enable scrolling — with only a `max-height` it collapses, so the GIF (which fills the full square width of the dialog) pushes the description and instructions outside the visible 90vh window with no way to scroll down to them.

On your laptop (672px tall viewport) the GIF alone consumes the entire visible area, hiding everything below it.

## Fix

Rebuild the popup so the header is fixed and the body scrolls reliably:

1. Make `DialogContent` a vertical flex container with `max-h-[90vh]`.
2. Replace the broken `ScrollArea` with a plain `div` using `overflow-y-auto` + `flex-1 min-h-0` — this is the standard, reliable pattern for scrollable dialog bodies and works the same on desktop, tablet, and mobile.
3. Move padding so the header has a subtle divider and the scrollable body has its own padding.
4. Reset the scroll position to top whenever a new exercise is opened (already done, just retargeted to the new container).

No content, copy, GIFs, badges, or styling change — only the scroll container is fixed. The description, secondary muscles, and numbered instructions will now be visible and scrollable on every exercise.

## File touched

- `src/components/ExerciseDetailModal.tsx` — swap Radix `ScrollArea` for a flex‑based `overflow-y-auto` body, drop the unused `ScrollArea` import.

## Verification

After the fix, opening the "i" button on any exercise (Velocity Compass Blitz or any other) will show: GIF → tags → Description → Secondary Muscles → Instructions, with smooth scrolling on phone, tablet, and desktop.
