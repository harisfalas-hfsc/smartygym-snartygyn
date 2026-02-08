

## Fix Workout Scheduling Calendar

### Problems Found

1. **Calendar not clickable inside the dialog** — The calendar component is missing a required `pointer-events-auto` class, which causes it to not respond properly to clicks when rendered inside a Dialog/Popover. This is why the "today" date appears persistently selected and clicking other dates feels broken.

2. **"Today" looks the same as "selected"** — The calendar styles today's date with a background highlight that looks almost identical to the selected date highlight. When you open the calendar, today is always visually prominent, making it confusing to tell which date you've actually picked.

3. **Past dates** — The code already prevents selecting past dates (they appear grayed out), but this will be verified and kept intact.

### What Will Change

**File 1: `src/components/ui/calendar.tsx`**
- Add `pointer-events-auto` to the Calendar's root className so it works correctly inside dialogs and popovers
- Adjust the `day_today` style to be subtler (e.g., just an underline or a light ring instead of a full background fill) so today is distinguishable from the selected date

**File 2: `src/components/ScheduleWorkoutDialog.tsx`**
- No logic changes needed — the date disabling and selection already work correctly in code
- The fix in the Calendar component will resolve the interaction and visual issues

### Visual Before/After

**Before:** Today has a colored background, selected date has a colored background -- they look the same, and clicks may not register properly inside the dialog.

**After:** Today has a subtle indicator (small underline or dotted ring), the selected date has a clear colored background, and all clicks work reliably.

### Technical Details

**Calendar component change (calendar.tsx, line 14):**
- Change `className={cn("p-3", className)}` to `className={cn("p-3 pointer-events-auto", className)}`

**Today style change (calendar.tsx, line 36):**
- Change `day_today: "bg-accent text-accent-foreground"` to a subtler style like `day_today: "text-accent-foreground font-bold underline underline-offset-4"` so today is marked but not confused with the selected date

Both changes are small, targeted, and only affect the calendar's appearance and interactivity. No other files or features are impacted.
