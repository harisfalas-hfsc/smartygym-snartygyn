
## Root cause

Today's WODs are correctly generated, visible, with image + Stripe, and the rollover/archive crons all succeeded overnight. The user-visible "the WODs aren't published" symptom is a **date-label bug** in `src/components/WODPeriodizationCalendar.tsx`, not a content/cron bug.

The component does:

```ts
const todayStr = formatInTimeZone(now, "Europe/Athens", "yyyy-MM-dd"); // ✅ correct: "2026-05-07"
const today = new Date(todayStr + "T00:00:00Z");                       // ❌ UTC midnight
const yesterday = subDays(today, 1);
const tomorrow  = addDays(today, 1);
const yesterdayStr = format(yesterday, "yyyy-MM-dd");                  // local-TZ format
const tomorrowStr  = format(tomorrow,  "yyyy-MM-dd");
…
const fullDate = format(new Date(dateStr), "EEEE, MMMM d");            // local-TZ format
```

`format()` uses the browser/system local timezone, so `2026-05-07T00:00:00Z` becomes `2026-05-06` for any visitor west of UTC, and `tomorrow` collapses onto today. That is why the strip currently reads "Today Wed May 6 / Tomorrow Wed May 6" while the actual Cyprus date is Thu May 7. The WOD cards underneath load via `useTodayWods` which uses `formatInTimeZone` directly, so they show the right workouts — but the broken header makes them look like stale Wednesday content.

## Fix

Make the calendar consistently timezone-aware (Europe/Athens), the same TZ the backend uses to set `generated_for_date`.

### `src/components/WODPeriodizationCalendar.tsx`
1. Build `today/yesterday/tomorrow` strictly as `yyyy-MM-dd` strings derived from `formatInTimeZone(... 'Europe/Athens' ...)` — never round-trip through `new Date(... + "T00:00:00Z")`.
2. For the human label (`"Wednesday, May 7"`), parse the `yyyy-MM-dd` as a local-noon date (`new Date(dateStr + "T12:00:00")`) so `format(..., "EEEE, MMMM d")` can never drift across a day boundary regardless of viewer TZ.
3. Use `subDays`/`addDays` on the Cyprus-anchored noon date, then re-emit with `format(..., "yyyy-MM-dd")` — safe because we're nowhere near a midnight boundary.

### Verification (after switch to default mode)
- Re-fetch `https://smartygym.com/workout/wod` and confirm the strip shows `Yesterday Wed May 6 / Today Thu May 7 / Tomorrow Fri May 8` and the cards underneath stay the same Pilates pair.
- Spot-check the strip against Cyprus local date with `select (now() at time zone 'Europe/Nicosia')::date`.
- No backend/cron changes — those are healthy and don't need to be touched.

## Files touched
- `src/components/WODPeriodizationCalendar.tsx` (date math + label formatting only)

## Out of scope (intentionally)
- WOD generation/orchestrator code, archive job, watchdog, periodization tables — all confirmed healthy in the last 3 cron runs and don't need edits.
