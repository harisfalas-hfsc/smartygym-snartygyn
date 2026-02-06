

## Fix: Workout Duration Calculation -- All 193 Workouts + Future Generation

### The Problem

The `getDuration()` function in the WOD generator calculates duration based ONLY on the main workout format (e.g., TABATA = 20 min for intermediate). But every workout has 5 mandatory sections:

```text
Pulse Drive Fusion (currently says "20 min"):
  Soft Tissue Preparation:  5 min
  Activation:              10 min
  Main Workout (Tabata):   24 min
  Finisher (For Time):    ~10 min
  Cool Down:               10 min
  ─────────────────────────────
  ACTUAL TOTAL:           ~59 min    <-- stored as "20 min" 
```

The `getDuration` function returns values like 15, 20, 30 which represent ONLY the main workout portion, ignoring 35+ minutes of overhead from the other 4 sections.

This affects **162 workouts** that use the 5-section structure (excludes micro-workouts, recovery, and some older Pilates workouts with different structures).

---

### The Solution (3 Parts)

#### Part 1: Batch Fix All Existing Workouts (New Edge Function)

Create `supabase/functions/audit-workout-durations/index.ts` that:
- Reads all workouts with the 5-section structure
- Parses each workout's HTML to extract section durations from headers (regex matching patterns like `5'`, `10'`, `24'`, `(8-minute AMRAP)`, `(For Time)`)
- Sums all found section durations into a total
- For "For Time" sections without explicit duration, estimates ~10-12 min based on exercise count
- Updates the `duration` field with the calculated total (e.g., `"55 min"` or `"Various"`)
- Returns a detailed report showing old vs new duration for every workout

Duration parsing logic (applied to section titles in HTML):
```text
"Soft Tissue Preparation 5'"           → 5
"Activation 10'"                       → 10
"Main Workout: Tabata Engine (24')"    → 24
"Finisher: Burn Out (8-minute AMRAP)"  → 8
"Finisher: Power Burn (For Time)"      → estimate ~12
"Cool Down 10'"                        → 10
```

#### Part 2: Fix Future Generation Logic

Update `supabase/functions/generate-workout-of-day/index.ts`:

**a) Update `getDuration()` to return realistic TOTAL workout times:**

Current values (main workout only -- WRONG):
```text
TABATA:      [15, 20, 30]    ← a 20-min Tabata workout is actually ~55 min total
EMOM:        [15, 20, 30]
CIRCUIT:     [20, 30, 45]
AMRAP:       [15, 25, 45]
REPS & SETS: [45, 50, 60]   ← these were closer to correct by coincidence
```

New values (total including all 5 sections):
```text
TABATA:      [40, 50, 60]
EMOM:        [40, 50, 60]
CIRCUIT:     [45, 55, 70]
AMRAP:       [40, 50, 65]
REPS & SETS: [50, 60, 75]
MIX:         [45, 55, 70]
FOR TIME:    Various (unchanged)
```

**b) Add post-generation duration calculation:**

After the AI generates content, a new function `calculateActualDuration()` will parse the generated HTML, extract all section durations from headers, sum them, and override the `duration` field. This ensures the stored duration always matches the actual content -- even if the AI writes slightly different section times than expected.

**c) Add TOTAL DURATION RULE to the AI prompt:**

```text
TOTAL DURATION RULE (CRITICAL - NON-NEGOTIABLE):
The workout duration represents the TOTAL time for ALL 5 sections combined:
  Soft Tissue (5 min) + Activation (10-15 min) + Main Workout + Finisher + Cool Down (10 min)

The duration you are given (e.g., "50 min") is the TARGET TOTAL for all sections.
Design your section durations so they ADD UP to the target total.

EXAMPLE for 50 min total target:
  5' (soft tissue) + 10' (activation) + 17' (main) + 8' (finisher) + 10' (cool down) = 50 min

NEVER design a 20-minute main workout + 15-minute activation + 10-minute finisher 
and then label the workout as "20 minutes." That is basic math failure.

For "For Time" finishers: Do not write a minute count in the title, but internally
estimate the completion time (typically 8-15 min) and include it in your total calculation.
```

#### Part 3: Update Duration Filter Options

The current filter options are: 15, 20, 30, 45, 60, Various.

After the fix, most workouts will realistically be 40-75 minutes. Update the filter to:
```text
Old: 15 min | 20 min | 30 min | 45 min | 60 min | Various
New: 30 min | 45 min | 50 min | 60 min | 75 min | Various
```

The "Various" option already catches any non-standard duration in the existing code, so workouts with durations like "55 min" that don't match a filter option will appear under "Various."

---

### Files to Modify

1. **NEW:** `supabase/functions/audit-workout-durations/index.ts` -- One-time batch fix for all existing workouts
2. **EDIT:** `supabase/functions/generate-workout-of-day/index.ts` -- Fix getDuration(), add post-generation calculation, add prompt rules
3. **EDIT:** `src/pages/WorkoutDetail.tsx` -- Update duration filter dropdown options

### Execution Order

1. Update the generation edge function first (getDuration + prompt rules + post-generation calculation)
2. Create and deploy the audit edge function
3. Run the audit to fix all 162 existing workouts
4. Update the frontend filter to match new realistic duration values
5. Verify the Pulse Drive Fusion workout shows correct duration

