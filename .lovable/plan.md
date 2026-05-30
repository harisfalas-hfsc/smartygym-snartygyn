## 1. Why today's date is wrong

In `src/pages/DailySmartyRitual.tsx`, the Reader Mode title is built from `ritual.ritual_date`:

```ts
title={`Daily Smarty Ritual - ${new Date(ritual.ritual_date).toLocaleDateString(...)}`}
```

But `ritual.ritual_date` comes from the **library row** (`daily_smarty_rituals.ritual_date`) — i.e. the date that ritual was originally created (Feb 18). It is **not** the date the ritual was assigned to today.

Today's actual assignment date lives on `daily_ritual_assignments.ritual_date`, which is correctly set by `assign-daily-ritual` to the Cyprus "today".

**Fix:** read the assignment's `ritual_date` (or just use today's Cyprus date — same value) and pass that to ReaderModeDialog / share / metadata. The library row's stale `ritual_date` should never be shown to users.

## 2. How tomorrow's date will behave

The rotation system is already correct on this point:

- `assign-daily-ritual` runs nightly + on top-up, inserts one row in `daily_ritual_assignments` keyed by `ritual_date = <Cyprus today + N>`.
- The reader page filters `.eq("ritual_date", todayCyprus)` → always finds the row for the real current day.
- The assignment row has the right date; only the **displayed label** was wrong because it read the library row's date.

Once fix (1) is applied, today's page will say today's real date, tomorrow's page will say tomorrow's real date, and so on — automatically, with no further changes needed.

## 3. Rebrand "Day N" → "Ritual N"

Library rituals currently expose `day_number` (1–180). We keep the column (it drives ordering and the cycle math) but relabel it everywhere in the UI as **"Ritual N"**.

Touch points (label only — no DB schema change, no logic change):

- `src/pages/DailySmartyRitual.tsx` — any "Day X" badge/label.
- `src/components/admin/RitualsManager.tsx` — table column header + cell ("Day" → "Ritual #", values "Day 94" → "Ritual 94").
- `src/components/admin/RitualSchedulePreview.tsx` — `Badge` shows `Day {ritual.day_number}` → `Ritual {ritual.day_number}`.
- `src/components/admin/RitualViewDialog.tsx` — any "Day X" header.
- `src/components/admin/RitualEditDialog.tsx` — form label/heading for the number field.
- `src/components/admin/RitualSwapDialog.tsx` — search results showing "Day X".
- `src/components/ritual/RitualShareDialog.tsx` — share text/title.
- Any tooltip / placeholder using "Day".

The `day_number` field name in code and DB stays as-is to avoid breaking the rotation logic, the cycle accounting in `assign-daily-ritual`, and the existing 180-row ordering. Only the user-facing string changes.

## 4. Risk

- **Date fix:** zero risk. One-line change reading from a field we already have.
- **Rebrand:** zero functional risk — pure string/label change. Rotation, cycle counter ("Cycle N"), swap/re-roll, notifications, and emails all keep working because none of them depend on the literal word "Day".
- No migration. No edge function changes. No notification copy changes (notifications don't say "Day N").

## 5. Files to change

```text
src/pages/DailySmartyRitual.tsx          # use assignment date, not library date
src/components/admin/RitualsManager.tsx
src/components/admin/RitualSchedulePreview.tsx
src/components/admin/RitualViewDialog.tsx
src/components/admin/RitualEditDialog.tsx
src/components/admin/RitualSwapDialog.tsx
src/components/ritual/RitualShareDialog.tsx
```

After implementing, I'll verify on `/daily-ritual` that the header shows today's real Cyprus date and the badge reads "Ritual 94" instead of "Day 94".
