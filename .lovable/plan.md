

# Add "Add to Native Calendar" Follow-Up After Scheduling

## What Happens

After a user presses "Schedule" in the scheduling dialog, instead of just closing, a second dialog appears asking: **"Would you like to add this to your calendar app?"** If they press Yes, the browser triggers a `.ics` file download (the universal calendar format supported by Google Calendar, Apple Calendar, Outlook, Samsung Calendar, and every other calendar app on every device).

The `.ics` file will contain:
- Event title: the workout/program name
- Date and time: exactly as scheduled
- Reminder/alarm: matching the reminder setting chosen
- Description: any notes entered + a direct link to the workout/program
- URL: a working, tested link back to the specific workout or program page

If the user presses "No thanks", the dialog simply closes.

## How the Link Will Work

The link in the calendar event will use the published site URL (`https://smartygym.lovable.app`) combined with the correct route:
- Workouts: `https://smartygym.lovable.app/workout/{type}/{id}`
- Programs: `https://smartygym.lovable.app/trainingprogram/{type}/{id}`

This ensures the link always works and does not lead to a 404.

## Technical Changes

### 1. Update `ScheduleWorkoutDialog` props to include content route type

The dialog currently receives `contentId` but not the URL type segment (e.g., "strength", "cardio"). Both `WorkoutInteractions` and `ProgramInteractions` already have this value (`workoutType` / `programType`). A new `contentRouteType` prop will be added to pass it through.

### 2. Create `AddToCalendarDialog` component

A new component (`src/components/AddToCalendarDialog.tsx`) that:
- Shows after successful scheduling
- Displays the scheduled details (name, date, time)
- Has two buttons: "Add to Calendar" and "No Thanks"
- "Add to Calendar" generates and downloads an `.ics` file with all the event details
- The `.ics` format is universally supported -- on mobile, it opens the native calendar app picker; on desktop, it opens the default calendar application

### 3. Create `.ics` file generator utility

A utility function (`src/utils/calendarExport.ts`) that builds a valid iCalendar (.ics) file string with:
- `VEVENT` block with `DTSTART`, `DTEND` (1 hour default duration), `SUMMARY`, `DESCRIPTION`, `URL`, `VALARM` (reminder)
- Proper date/time formatting in iCalendar format
- The working URL to the workout/program page

### 4. Update `WorkoutInteractions.tsx` and `ProgramInteractions.tsx`

Pass the new `contentRouteType` prop to `ScheduleWorkoutDialog`:
- In `WorkoutInteractions`: pass `workoutType`
- In `ProgramInteractions`: pass `programType`

## Files Modified

| File | Change |
|------|--------|
| `src/utils/calendarExport.ts` | **New** -- `.ics` file generation utility |
| `src/components/AddToCalendarDialog.tsx` | **New** -- follow-up dialog component |
| `src/components/ScheduleWorkoutDialog.tsx` | Add `contentRouteType` prop, show `AddToCalendarDialog` after successful save instead of immediately closing |
| `src/components/WorkoutInteractions.tsx` | Pass `contentRouteType={workoutType}` to ScheduleWorkoutDialog |
| `src/components/ProgramInteractions.tsx` | Pass `contentRouteType={programType}` to ScheduleWorkoutDialog |

No database changes. No edge functions. Frontend-only.
