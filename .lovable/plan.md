# Generate New WOD, Schedule button, and universal popup fix

## Part 1 — What the two buttons actually do

### "Generate New WOD" button
This button does NOT generate tomorrow's WOD by itself. It opens a dialog where YOU choose what happens. Inside the dialog you pick:

1. **Target date** — either:
   - **Generate for Today (Cyprus)** — creates the WOD for today's Cyprus date, OR
   - **Pre-Generate for Future Date** — pick any date in the next 7 days. The cron will then skip that date.

2. **Archive existing WODs first** (checkbox, ON by default) — when ON, the two current WODs are first moved to their proper category galleries (Strength, Endurance, etc.) before the new ones are created.

What happens when you confirm:
- If "Archive first" is ON → today's two current WODs are archived to their categories (NOT deleted).
- Two brand-new WODs are generated (BODYWEIGHT + EQUIPMENT variants) for the chosen date.
- Category and difficulty come from the 84-day periodization cycle for THAT date (so today's button gives today's category; a future date gives that future date's category — they are usually different).
- Stripe products are created at €3.99 for each variant.
- A unique workout image is generated for each.
- If the target date is today → user notifications are sent. If future → no notifications, and the cron will skip that day to avoid duplicates.

So pressing it for "today" with archive ON = the two existing WODs go to their category galleries, and two fresh WODs replace them on the homepage with the same coaching reasoning, Stripe pricing, image pipeline, and periodization category for today.

### "Schedule" button
This opens the **WOD Auto-Generation Configuration** dialog. It does NOT schedule a single workout — it controls the daily cron jobs that automatically generate the next day's WODs every night. From it you can:
- Enable/disable auto-generation
- Adjust the daily generation time (currently 21:05 / 21:25 UTC for the split bodyweight/equipment jobs)
- Adjust archive and notification timing
- Switch between AI Generation and Library Mode

This is the dialog that currently overflows your screen.

## Part 2 — The popup overflow bug (universal fix)

### Root cause
The base `DialogContent` in `src/components/ui/dialog.tsx` has no `max-height` and no internal scroll. When a dialog's content is taller than the viewport (Schedule dialog, ScheduleTemplate dialog, and others), the top and bottom — including the action buttons — get pushed off-screen with no way to scroll. A few dialogs (like `GenerateWODDialog`) work around it individually with `max-h-[85vh] flex flex-col overflow-hidden`, but most do not.

### Fix
Make the base `DialogContent` safe by default, so every popup in the project behaves consistently.

Update `src/components/ui/dialog.tsx` `DialogContent` className to:
- Cap height: `max-h-[calc(100dvh-2rem)]` (uses dynamic viewport height — works on mobile with browser chrome).
- Make it a column flex container: `flex flex-col`.
- Scroll the body: add `overflow-y-auto` so any overflowing content scrolls inside the dialog instead of off the page.
- Keep the existing width/centering classes intact.

This is a one-file change that fixes Schedule, ScheduleTemplate, and every other dialog in the app at once. Dialogs that already have their own `max-h-[85vh]` keep working (the more specific class still wins).

### Verify after change
- Open Admin → Content → WOD → **Schedule** at 910×628 viewport: dialog fits, body scrolls, Save/Cancel buttons visible.
- Open Admin → **Schedule Template** dialog: same behaviour.
- Open `ScheduleWorkoutDialog` (user-side schedule workout): still fits and scrolls.
- Open `GenerateWODDialog`: unchanged (already had its own cap).

## Files to change
- `src/components/ui/dialog.tsx` — add `max-h-[calc(100dvh-2rem)] flex flex-col overflow-y-auto` to `DialogContent`.

No database, no edge function, no behavioural change to Generate New WOD or Schedule logic — only the popup sizing is fixed.
