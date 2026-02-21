
# Fix: Prevent Accidental WOD Notifications from Library Selection

## What Went Wrong

During testing, the `select-wod-from-library` function was called directly. It selected workouts and then unconditionally triggered `send-wod-notifications`, which emailed all 42 users. The toggle button itself is safe (it only saves a database setting), but the edge function has no safeguards against being called outside the normal scheduled flow.

## Fixes Required

### 1. Add notification guard to `select-wod-from-library`

The function currently always calls `send-wod-notifications` at the end (line 208-221). This needs a guard:

- Only trigger notifications if the `targetDate` equals today's Cyprus date (not a future/past date)
- Accept an optional `skipNotifications` parameter so manual/test calls can explicitly skip emails
- Add a log message when notifications are skipped and why

### 2. Add date-aware deduplication to `send-wod-notifications`

The `send-wod-notifications` function checks if it already sent a notification "today" but doesn't verify that the WODs it found are actually for today. Add a check: if the WODs' `generated_for_date` does not match today's Cyprus date, skip sending.

### 3. No changes to the toggle button

The `WODManager.tsx` toggle only writes `wod_mode` to the database. It does NOT call any generation or selection function. This is correct and needs no changes.

## Technical Details

### File: `supabase/functions/select-wod-from-library/index.ts`

**Change**: Wrap the notification call (lines 207-221) with a date guard:

```text
Before calling send-wod-notifications:
  IF targetDate !== getCyprusDateStr():
    Log "Skipping notifications - selection is for a different date"
    Do NOT call send-wod-notifications
  ELSE IF body contains skipNotifications = true:
    Log "Skipping notifications - explicitly requested"
    Do NOT call send-wod-notifications  
  ELSE:
    Call send-wod-notifications (current behavior)
```

### File: `supabase/functions/send-wod-notifications/index.ts`

**Change**: After finding today's WODs (line ~86), add a verification that `generated_for_date` matches today's Cyprus date string. If no WODs match today specifically, return early with "No WODs for today."

## Files Summary

| File | Action | Change |
|------|--------|--------|
| `supabase/functions/select-wod-from-library/index.ts` | MODIFY | Add date guard + skipNotifications parameter before calling notifications |
| `supabase/functions/send-wod-notifications/index.ts` | MODIFY | Add date verification for WODs before sending |

## What This Prevents

- Testing or manual function calls will not send emails to all users
- Future-date selections will not trigger notifications
- The orchestrator's scheduled run (which always uses today's date) continues working normally
- The toggle button remains safe -- it only saves a database setting
