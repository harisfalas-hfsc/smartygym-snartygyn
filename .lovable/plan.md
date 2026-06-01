## Goal

On every workout page and every training program page, replace the **1RM** tool button in the in-page Tools toolbar with a **Rounds Counter** that opens a floating, semi-transparent, minimizable popup — behaving exactly like the existing Workout Timer popup (same size, same transparency, same minimize/close behavior, scrolls-through-friendly).

## Scope confirmation

- **One change covers all pages.** The Tools toolbar on every workout & program page is rendered by a single shared component (`WorkoutToolsMobile` → used by `WorkoutToolsCards`). Editing it once propagates everywhere — no per-page edits.
- Timer popup behavior stays untouched. Exercise Library button stays untouched.
- The full-page `/tools/rounds-tracker` route stays untouched.

## What changes

1. **New component `src/components/RoundsCounterPopup.tsx`**
   - Mirrors `WorkoutTimerPopup` structure exactly (same wrapper sizes, `bg-background/50 backdrop-blur-sm border-2 border-primary/50` transparency, same minimized chip at `bottom-20`, same Maximize/Minimize/Close buttons).
   - Functional core ported from `RoundsTracker.tsx` but trimmed to fit the compact popup:
     - Mode toggle: **Rounds** / **Rounds + Reps**
     - Compact target inputs (Rounds, and Reps when in rounds+reps mode)
     - Big tap button (smaller height than full page) to count
     - Buttons: Undo, Reset, +Round
     - Direction toggle (Down/Up) in Rounds mode
   - Drops the full-page-only extras: screen-lock/fullscreen, sound/haptic toggles, wake-lock. (Popup is meant to coexist with the workout content, not take over the screen.)
   - Minimized chip shows: current count + target, mode label, Maximize, Close.

2. **Edit `src/components/WorkoutToolsMobile.tsx`**
   - Remove the **1RM** button and the `OneRMCalculatorPopup` import/state.
   - Add a **Rounds** button (icon: `ListOrdered` or `Repeat` from lucide) that opens the new `RoundsCounterPopup`.
   - Keep Timer and Exercise Library exactly as they are.
   - Order in toolbar: **Timer · Rounds · Exercise Library**.

3. **No changes** to:
   - `WorkoutTimerPopup.tsx` (used as the visual/behavioral reference only)
   - `OneRMCalculatorPopup.tsx` file itself (left in place; just no longer surfaced in the in-page toolbar — preserves the standalone `/tools/1rm-calculator` page and any other entry points)
   - `RoundsTracker.tsx` full page
   - Routing, SEO, sitemap, business logic

## Technical notes

- Popup container styling copied 1:1 from `WorkoutTimerPopup` so size/transparency/positioning match: `fixed inset-x-0 bottom-16 mx-auto max-w-sm` for expanded, `fixed bottom-20 left-1/2 -translate-x-1/2` rounded pill for minimized.
- State (mode, targets, counts) lives inside the popup component; resets on close.
- No DB, no edge function, no auth changes.
- Uses existing design tokens only (`primary`, `muted`, `background`, `border`) — no hardcoded colors.

## Files touched

- **Created:** `src/components/RoundsCounterPopup.tsx`
- **Edited:** `src/components/WorkoutToolsMobile.tsx`

That's it — two files, and it applies everywhere the toolbar appears.