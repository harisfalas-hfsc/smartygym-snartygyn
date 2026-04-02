

# Extend Check-In Windows: 07:00–10:00 and 19:00–22:00

## Change
Update the morning window from 07:00–09:00 → 07:00–10:00 and the night window from 19:00–21:00 → 19:00–22:00.

## File: `src/hooks/useCheckInWindow.ts`

All changes in one file — update 4 locations:

1. **Default state** (lines 20, 22): `morningWindowEnd: '10:00'`, `nightWindowEnd: '22:00'`
2. **Time window checks** (line 112): Change `isInTimeWindow(hour, minute, 7, 0, 9, 0)` → `(7, 0, 10, 0)` and `(19, 0, 21, 0)` → `(19, 0, 22, 0)`
3. **calculateNextWindow** (lines 80, 82): Change `morningEnd = 9 * 60` → `10 * 60` and `nightEnd = 21 * 60` → `22 * 60`
4. **setWindowStatus** (lines 120, 122): Update the hardcoded strings to `'10:00'` and `'22:00'`

No other changes. No database migration needed.

