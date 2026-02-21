

# WOD Library Selection Mode

## Overview

Add a "Library Mode" toggle in the WOD admin panel. When ON, the daily automated system stops generating new workouts and instead picks existing workouts from the library based on the same periodization rules. The selected workouts appear in the Workout of the Day section AND remain visible in their categories. No archiving, no unarchiving, no new Stripe products, no cloning.

## How It Works

**Generate Mode (current, default -- no changes):**
- AI creates 2 new workouts daily, new Stripe products, new images
- At midnight: archived (unflagged, serial number assigned, joins library)

**Library Mode (new):**
- System reads today's periodization (category, difficulty, equipment)
- Finds 1 Bodyweight + 1 Equipment workout from the library that match
- Sets `is_workout_of_day = true` and `generated_for_date = today` on them
- The workouts ALSO remain visible in their category pages (no hiding)
- At midnight: simply clears `is_workout_of_day` and `generated_for_date` back to their original values -- no serial number changes, no archiving
- Anyone who previously purchased the workout can still see it -- nothing changes for them
- Zero AI credits consumed

## Database Changes

### 1. Add `wod_mode` to config table

```sql
ALTER TABLE wod_auto_generation_config 
ADD COLUMN wod_mode text NOT NULL DEFAULT 'generate';
```

Default is `'generate'` -- current behavior, nothing changes until you toggle.

### 2. Add `wod_source` to admin_workouts

```sql
ALTER TABLE admin_workouts 
ADD COLUMN wod_source text DEFAULT NULL;
```

- `NULL` = normal library workout or AI-generated WOD (all existing data)
- `'library'` = this workout was selected from the library for today's WOD

This lets the archive function know: if `wod_source = 'library'`, just clear the WOD flags without touching serial numbers or doing any archiving logic.

### 3. Create cooldown tracking table

```sql
CREATE TABLE wod_selection_cooldown (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_workout_id text NOT NULL,
  selected_for_date date NOT NULL,
  category text NOT NULL,
  difficulty text,
  equipment text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(source_workout_id, selected_for_date)
);
```

With RLS: admin read access, service role full access.

## Key Frontend Fix: Category Pages

Currently `WorkoutDetail.tsx` line 197 excludes all workouts where `is_workout_of_day = true` from category galleries. In Library Mode, the workout must appear in BOTH the WOD section AND its category page.

The fix: only exclude workouts where `is_workout_of_day = true` AND `wod_source` is NOT `'library'`.

```typescript
// Before:
const isNotActiveWOD = workout.is_workout_of_day !== true;

// After:
const isNotActiveWOD = workout.is_workout_of_day !== true || workout.wod_source === 'library';
```

This means:
- AI-generated WODs: hidden from category pages (current behavior, unchanged)
- Library-selected WODs: visible in BOTH the WOD section AND their category page

## Archive Function Update

The `archive-old-wods` function (runs at midnight) needs one check:

```text
For each workout with is_workout_of_day = true:
  IF wod_source = 'library':
    - Just clear: is_workout_of_day = false, generated_for_date = null, wod_source = null
    - Do NOT assign new serial number (it already has one)
    - Do NOT touch anything else
  ELSE (normal AI-generated WOD):
    - Current behavior: unflag, assign serial number, clear generated_for_date
```

## New Edge Function: select-wod-from-library

### Logic

```text
1. Read periodization for today --> category, difficulty, difficulty_stars

2. Query admin_workouts WHERE:
   - category = today's category
   - difficulty = today's difficulty
   - equipment = 'BODYWEIGHT'
   - is_workout_of_day = false (not currently serving as WOD)
   - id NOT IN cooldown (last 60 days)

3. Pick one. If all are in cooldown, pick the oldest-used one.

4. Repeat for equipment = 'EQUIPMENT'
   (For RECOVERY days: pick one VARIOUS workout)

5. UPDATE the selected workouts:
   - is_workout_of_day = true
   - generated_for_date = today
   - wod_source = 'library'

6. Insert cooldown records

7. Call send-wod-notifications

8. Log to wod_generation_runs with trigger_source = 'library-selection'
```

No new rows. No new Stripe products. The workouts keep their existing IDs, names, images, serial numbers, and Stripe links.

## Orchestrator Update

Small addition to `wod-generation-orchestrator`:

```text
1. Read wod_auto_generation_config.wod_mode
2. If mode = 'select': call select-wod-from-library (no retries needed -- it's a simple DB query)
3. If mode = 'generate': call generate-workout-of-day (current flow, unchanged)
4. Verification stays the same (checks if WODs with is_workout_of_day=true exist for the date)
```

## Admin UI Changes

### WODManager.tsx -- Toggle in Header

A toggle switch near existing buttons:
- Label: **"Library Mode"**
- Subtitle: "Pick from existing workouts (no AI credits)"
- Green badge when ON, default badge when OFF
- Reads/writes `wod_mode` in `wod_auto_generation_config`

### WODAutoGenConfigDialog.tsx -- Mode in Settings

Same toggle also in the settings dialog with explanation:
- Generate Mode: "AI creates brand new workouts daily (uses AI credits)"
- Library Mode: "System picks from existing library based on periodization (zero AI credits)"

## Files Summary

| File | Action | Change |
|------|--------|--------|
| Database migration | ADD | `wod_mode` column, `wod_source` column, `wod_selection_cooldown` table |
| `supabase/functions/select-wod-from-library/index.ts` | CREATE | New function: flags existing workouts as WOD |
| `supabase/functions/wod-generation-orchestrator/index.ts` | MODIFY | Check `wod_mode`, route to correct function |
| `supabase/functions/archive-old-wods/index.ts` | MODIFY | Skip archiving for library-selected WODs (just clear flags) |
| `supabase/config.toml` | MODIFY | Add `select-wod-from-library` entry |
| `src/components/admin/WODManager.tsx` | MODIFY | Add Library Mode toggle |
| `src/components/admin/WODAutoGenConfigDialog.tsx` | MODIFY | Add mode toggle in settings |
| `src/pages/WorkoutDetail.tsx` | MODIFY | Allow library-selected WODs to remain visible in category pages |

## What Stays Exactly the Same

- The 84-day periodization cycle -- completely untouched
- `generate-workout-of-day` function -- zero changes
- Notification system -- both modes trigger the same `send-wod-notifications`
- Health checks and tomorrow readiness -- they check if WODs exist regardless of how they got there
- WOD schedule preview calendar -- same periodization data
- All existing Stripe products -- no new products created
- All existing workouts in the library -- no rows created or deleted
- Standalone purchases -- users who bought a workout keep access, nothing changes

