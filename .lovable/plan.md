

# Fix Calendar Dialog + Add "Completed" Calendar Export

## Problems Being Fixed

1. **AddToCalendarDialog not appearing reliably** -- It currently lives inside `ScheduleWorkoutDialog`, causing Radix Dialog overlay conflicts. When one dialog animates closed while the other tries to open, the second dialog gets blocked.

2. **No calendar export when marking as completed** -- The user wants the same "Add to Calendar?" follow-up when marking a workout or program as completed.

## Solution

Move the `AddToCalendarDialog` state management out of `ScheduleWorkoutDialog` and into `WorkoutInteractions` and `ProgramInteractions`. This makes the calendar dialog fully independent. Then add the same trigger after "Mark as Completed" actions.

## About How Calendar Export Works

The `.ics` file is the universal calendar format. When opened:
- **On mobile (Android/iOS):** The device automatically shows a picker of installed calendar apps (Google Calendar, Samsung Calendar, Apple Calendar, Outlook, etc.)
- **On desktop:** The file opens in the default calendar application (Outlook, Apple Calendar, Google Calendar desktop app, etc.)

This is the same method used by every major website. There is no web browser API that can directly open a native calendar picker -- the `.ics` file IS how it's done.

## Changes

### 1. Remove AddToCalendarDialog from ScheduleWorkoutDialog

`ScheduleWorkoutDialog` will no longer manage or render the calendar follow-up dialog. Instead, it will accept a new callback prop `onScheduleSuccess` that passes the event details back to the parent. The parent decides what to do with them.

### 2. Update WorkoutInteractions

- Add `AddToCalendarDialog` state management directly in this component
- Wire it to trigger after successful scheduling (via `onScheduleSuccess` callback from ScheduleWorkoutDialog)
- Wire it to trigger after "Mark as Complete" is clicked -- with title "Completed: {workout name}", today's date, current time, and a working link
- Use a small delay (setTimeout) before showing the calendar dialog to ensure the previous dialog's close animation finishes

### 3. Update ProgramInteractions

Same changes as WorkoutInteractions:
- Add `AddToCalendarDialog` state management
- Trigger after scheduling success
- Trigger after "Complete" button click -- with title "Completed: {program name}", today's date, current time, and working link

### 4. The .ics content for "Completed" events

When marking as completed, the calendar event will contain:
- Title: "Completed: {workout/program name}"
- Date: today
- Time: current time
- Duration: 1 hour
- Description: "Workout completed! Open in SmartyGym: {working link}"
- URL: working link to the workout/program page
- No reminder (since it's a past/current event, not future)

## Files Modified

| File | Change |
|------|--------|
| `src/components/ScheduleWorkoutDialog.tsx` | Remove AddToCalendarDialog, add `onScheduleSuccess` callback prop instead of managing calendar dialog internally |
| `src/components/WorkoutInteractions.tsx` | Add AddToCalendarDialog, trigger after schedule and after completion |
| `src/components/ProgramInteractions.tsx` | Add AddToCalendarDialog, trigger after schedule and after completion |

No new files. No database changes. Frontend-only.

