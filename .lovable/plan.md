

## Fix All Existing Durations + Smart Duration Distribution for AI Generation

### Part 1: Fix All 185 Existing Workout Durations

The audit function code is already correct (sums Main + Finisher only). We need to:

1. **Redeploy** the `audit-workout-durations` edge function to ensure the live version matches the code
2. **Run a dry-run** first to preview all changes across 185 workouts
3. **Apply the changes** to update all durations in the database
4. **Normalize format strings** -- 6 Pilates workouts use "X minutes" instead of "X min" (the audit will fix these automatically since it writes "X min" format)

After the fix, the current distribution (all stored as total routine time: 25-75 min range) will shift down to the Main + Finisher only range (~10-50 min), correctly populating the short-duration filter categories (15 min, 20 min) that were previously empty.

---

### Part 2: Fix Admin Panel Duration Format Inconsistency

**Problem found:** When you manually create a workout in the admin panel, the duration dropdown stores values like `"15 MINUTES"`, `"20 MINUTES"`, etc. But the AI-generated workouts store `"15 min"`, `"30 min"`, etc. The filters use regex to extract numbers, so they work -- but the format inconsistency is messy and could cause edge cases.

**Fix in `src/components/admin/WorkoutEditDialog.tsx`:**

Change `DURATION_OPTIONS` from:
```
"15 MINUTES", "20 MINUTES", "25 MINUTES", "30 MINUTES", 
"35 MINUTES", "40 MINUTES", "45 MINUTES", "50 MINUTES", "VARIOUS"
```

To match the AI format exactly:
```
"15 min", "20 min", "25 min", "30 min", 
"35 min", "40 min", "45 min", "50 min", "Various"
```

This ensures all manually created workouts use the same format as AI-generated ones.

---

### Part 3: Verify All Filters Work Correctly

The duration filters are already updated to the new range (15, 20, 30, 40, 50, Various) in all locations:

| Location | Current State | Action Needed |
|---|---|---|
| `WorkoutDetail.tsx` (visitor page) | 15, 20, 30, 40, 50, Various | Already correct |
| `WorkoutsManager.tsx` (admin panel) | 15, 20, 30, 40, 50, Various | Already correct |
| `WorkoutFilters.tsx` (general) | 15, 20, 30, 40, 50, Various | Already correct |
| `SmartlySuggestModal.tsx` | 15, 20, 30, 45 | Already correct |
| `WorkoutEditDialog.tsx` (admin create) | 15-50 range + Various | Fix format only (Part 2) |

The filter range-matching logic (`filterNum - 5` to `filterNum + 4`) is already in place and works correctly:
- "15 min" filter matches workouts with duration 10-19 min
- "20 min" filter matches workouts with duration 15-24 min
- "30 min" filter matches workouts with duration 25-34 min
- "40 min" filter matches workouts with duration 35-44 min
- "50 min" filter matches workouts with duration 45-54 min

This means a workout with duration "35 min" will appear under both "30 min" and "40 min" filters -- providing good overlap and coverage.

---

### Part 4: Smart Duration Distribution Awareness for AI Generation

This is the new feature. Before generating each day's workout, the AI will query the current duration distribution from the database and use it to make smarter decisions about which durations to target.

**Where:** `supabase/functions/generate-workout-of-day/index.ts`

**Step 1: Query the distribution** (add after the periodization context fetch, around line 530)

Before generating, query the database for:
```sql
SELECT category, duration, COUNT(*) as count 
FROM admin_workouts 
WHERE category = [today's category] 
AND is_workout_of_day IS NOT NULL
GROUP BY category, duration
```

This produces a snapshot like:
```
STRENGTH: 15 min (0), 20 min (2), 30 min (5), 40 min (8), 50 min (3)
```

**Step 2: Calculate gaps and inject into the AI prompt**

From the distribution, identify which duration brackets are underrepresented for the current category and difficulty level. Format this as a prompt injection:

```
DURATION DISTRIBUTION AWARENESS:
Current ${category} workouts in your library:
  15 min: 0 workouts (UNDERREPRESENTED - consider targeting this duration)
  20 min: 2 workouts
  30 min: 5 workouts
  40 min: 8 workouts (well represented)
  50 min: 3 workouts

The platform needs VARIETY. If a duration bracket has fewer workouts, 
you are ENCOURAGED (not forced) to target it -- but ONLY if it makes 
sense for the current difficulty level and category.

Remember: Short duration + Advanced = maximum intensity.
Long duration + Beginner = gentle but complete.
Never sacrifice workout quality just to fill a gap.
```

**Step 3: Optionally adjust the `getDuration()` base estimate**

The `getDuration()` function currently returns fixed values per format and difficulty. We can add light randomization weighted toward underrepresented durations:

- If the distribution shows "15 min" is underrepresented for this category, and the difficulty allows it (beginner or intermediate short sessions are valid), occasionally return 15 min instead of the default
- This is a suggestion to the AI, not a hard override -- the `calculateActualDuration()` post-parser will still compute the real value from the generated HTML

**Key constraints:**
- The AI must NEVER sacrifice quality to fill a gap
- The distribution guidance is a "nudge," not a mandate
- The combined RPE rules still apply -- a short advanced workout must be brutal, a long beginner workout must still deliver value
- The AI prompt already includes the DURATION-RPE-DIFFICULTY relationship rules, so this adds distribution context on top

---

### Part 5: Summary of All Changes

| File | What Changes | Why |
|---|---|---|
| `audit-workout-durations/index.ts` | Redeploy (no code changes) | Ensure live version uses Main+Finisher logic |
| `generate-workout-of-day/index.ts` | Add DB query for duration distribution + inject into prompt | Smart gap-filling over time |
| `WorkoutEditDialog.tsx` | Fix DURATION_OPTIONS format from "X MINUTES" to "X min" | Consistent format with AI-generated workouts |

### What Will NOT Change

- The 5-section workout structure
- HTML formatting, icons, spacing rules
- Category-specific exercise rules, RPE balancing logic
- The filter range-matching logic (already works correctly)
- Filter options in visitor pages and admin panel (already updated to 15-50 range)
- Equipment governance, format rules
- How duration is displayed to users on workout cards

