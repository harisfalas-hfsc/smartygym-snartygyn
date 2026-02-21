

# Fix: REPS & SETS Workouts Missing Exercise Prescriptions

## The Problem

"Upper Body Pillar" (and 27 other REPS & SETS workouts) list exercises with NO sets, reps, rest periods, or tempo. For example, the Main Workout just says "Push-up" with no indication of what to do -- no "4 x 10", no rest period, nothing. This makes the workout completely unusable.

The Equipment version ("Iron Grip Builder") got it right: "4 sets x 8-10 reps barbell bench press (3-1-1-0 tempo)". The Bodyweight version did not.

**Scale of the problem**: 28 out of 85 REPS & SETS workouts have this defect.

## Root Cause

The generation prompt has a gold standard HTML template showing an EMOM example but does NOT include a REPS & SETS HTML template. The AI knows the theory (line 726: "4 sets x 8 reps with defined rest") but sometimes fails to apply it in the actual HTML output because there is no concrete REPS & SETS template to copy.

## Two-Part Fix

### Part 1: Fix the Generation Prompt (Prevent Future Issues)

**File**: `supabase/functions/generate-workout-of-day/index.ts`

Add a dedicated REPS & SETS gold standard HTML template right after the existing EMOM template (around line 1730). This will show the AI exactly how exercises must be formatted:

```text
GOLD STANDARD REPS & SETS TEMPLATE (FOR STRENGTH / MOBILITY & STABILITY):
<p class="tiptap-paragraph">💪 <strong><u>Main Workout (REPS & SETS 20')</u></strong></p>
<ul class="tiptap-bullet-list">
<li class="tiptap-list-item"><p class="tiptap-paragraph">Push-up - 4 sets x 10 reps (3-1-1-0 tempo)</p></li>
<li class="tiptap-list-item"><p class="tiptap-paragraph">Inverted Row - 4 sets x 8-10 reps (controlled tempo)</p></li>
<li class="tiptap-list-item"><p class="tiptap-paragraph">Bench Dip - 3 sets x 12 reps</p></li>
</ul>
<p class="tiptap-paragraph">Rest 90-120 seconds between sets for compound movements, 60-90 seconds for isolation.</p>
```

Add a validation rule: "REPS & SETS FORMAT MANDATORY RULE: Every exercise line MUST include sets x reps (e.g., '4 sets x 10 reps' or '3 x 12'). An exercise listed without prescription (e.g., just 'Push-up') is INVALID and UNPROFESSIONAL."

### Part 2: Fix Existing 28 Broken Workouts (Batch Repair)

Create a one-time repair edge function (`repair-reps-sets-workouts`) that:

1. Queries all REPS & SETS workouts where the Main Workout section lacks prescription patterns (no "sets x", "x reps", etc.)
2. For each broken workout, sends the existing content to the AI with instructions to ONLY add the missing sets/reps/tempo/rest prescriptions -- keeping all exercises, structure, and formatting intact
3. Updates the database with the corrected content
4. Logs every change for audit

This approach avoids manually editing 28 workouts one by one.

## Technical Details

### File Changes

| File | Action | Purpose |
|------|--------|---------|
| `supabase/functions/generate-workout-of-day/index.ts` | MODIFY | Add REPS & SETS HTML template + validation rule to prompt |
| `supabase/functions/repair-reps-sets-workouts/index.ts` | CREATE | One-time batch repair of 28 broken workouts |

### Repair Function Logic

```text
1. Query admin_workouts WHERE format = 'REPS & SETS'
2. For each workout, check if main_workout contains prescription patterns
3. If missing, send to AI: "Here is the workout HTML. Add sets x reps prescriptions 
   to every exercise. Keep all structure, exercises, and formatting identical. 
   Use difficulty_stars to determine appropriate rep schemes."
4. Validate the AI output still matches the original structure
5. Update the database
6. Return a report: which workouts were fixed, what was changed
```

### Difficulty-Based Prescription Rules (Used by Repair)

- 1-2 stars (Beginner): 3 sets x 10-12 reps, moderate tempo
- 3-4 stars (Intermediate): 4 sets x 8-10 reps, controlled tempo (3-1-1-0)
- 5-6 stars (Advanced): 4-5 sets x 5-8 reps, heavy/strict tempo

### What This Prevents Going Forward

- The explicit HTML template means the AI has a concrete example to follow for REPS & SETS formatting
- The validation rule explicitly states that listing an exercise without prescription is invalid
- Both the Bodyweight and Equipment variants will see the same template
