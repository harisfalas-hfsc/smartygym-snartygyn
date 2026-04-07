

# Fix Equipment Exercises in Micro Workouts + Enforce Bodyweight-Only Rule

## Problem
10 exercises across 7 micro workouts use equipment (cables, kettlebells, stability balls, bands, leverage machines, rope, dumbbells) — these should all be bodyweight-only since micro workouts are meant to be done anywhere (sofa, office, house) in 5 minutes with zero equipment.

### Affected Workouts & Exercises

| Workout | Exercise | Equipment |
|---------|----------|-----------|
| Core Crusher | peroneals stretch (1388) | rope |
| Desk Breaker | chest stretch with exercise ball (1272) | stability ball |
| Jump Starter | cable palm rotational row (1319) | cable |
| Squat Storm | deep push up (1274) | dumbbell |
| Squat Storm | kettlebell swing (0549) ×2 | kettlebell |
| Squat Storm | band squat (1004) | band |
| Stairway Sprint | lever overhand triceps dip (0591) | leverage machine |
| Wall Warrior | kettlebell swing (0549) ×2 | kettlebell |

## The Fix

### Step 1: Replace all equipment exercises with bodyweight alternatives
Run a script that updates each micro workout's `main_workout` HTML, swapping the equipment-based exercise markup tags for suitable bodyweight equivalents targeting the same muscle group.

Replacement map (same body part / target):
- **peroneals stretch** (rope, lower legs) → bodyweight calf/ankle stretch
- **chest stretch with exercise ball** (stability ball, chest) → bodyweight chest stretch (e.g., doorway or standing chest stretch)
- **cable palm rotational row** (cable, back) → bodyweight standing row or superman
- **deep push up** (dumbbell, chest) → regular push-up or diamond push-up
- **kettlebell swing** (kettlebell, upper legs) → squat jump or broad jump
- **band squat** (band, upper legs) → bodyweight squat variation
- **lever overhand triceps dip** (leverage machine, upper arms) → bodyweight triceps dip (on chair/bench — already acceptable for micro workouts which allow chairs/stairs)

Each replacement will use a real exercise from the library with `equipment = 'body weight'` and matching `body_part`.

### Step 2: Add enforcement rule to WOD generation prompt
The `generate-workout-of-day` edge function currently excludes micro workouts from its generation cycle ("DOES NOT APPLY TO: MICRO-WORKOUTS"). However, for future-proofing, add a clear rule in the admin workout creation logic:

In `src/components/admin/WorkoutEditDialog.tsx`, the `MICRO_WORKOUT_RULES` constant already enforces `equipment: 'BODYWEIGHT'` at the workout level. But the individual exercises inside aren't validated.

Add a validation check in the bulk format repair function and the workout save flow that flags any exercise inside a MICRO-WORKOUTS category workout that has `equipment != 'body weight'`.

### Files Changed
- **Database**: Direct updates to `admin_workouts` rows MW-003 through MW-010 (replacing exercise markup)
- `supabase/functions/bulk-format-consistency-repair/index.ts` — add micro-workout equipment validation mode
- `src/components/admin/WorkoutEditDialog.tsx` — add save-time warning if micro workout contains non-bodyweight exercises

