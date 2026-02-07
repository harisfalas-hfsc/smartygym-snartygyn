

## Redefine Duration: Main + Finisher Only, Smarter AI, Better Filters

### The Core Problem

Currently, the `duration` field stored in the database represents the **total routine time** (Soft Tissue 5' + Activation 10-15' + Main Workout + Finisher + Cool Down 10' = everything). This means:
- The shortest possible workout is already ~30 minutes even with a tiny main workout
- Filters like "20 min" or "30 min" never match meaningful short workouts
- Customers looking for quick sessions see nothing, or see misleading durations

### The New Rule

**Duration = Main Workout + Finisher ONLY.** The warm-up (Soft Tissue + Activation) and Cool Down are constants that exist in every routine. Customers care about "how long is the actual work?" -- not the total routine time including foam rolling and stretching.

---

### Change 1: Redefine `getDuration()` function

**File:** `supabase/functions/generate-workout-of-day/index.ts`, lines 407-427

The `getDuration()` function currently returns total routine time (50-75 min). It needs to return **Main + Finisher time only**.

**Current values (total time):**
```
REPS & SETS: [50, 60, 75]
CIRCUIT:     [45, 55, 70]
TABATA:      [40, 50, 60]
AMRAP:       [40, 50, 65]
EMOM:        [40, 50, 60]
```

**New values (Main + Finisher only, subtracting ~25 min of warm-up/cool-down):**
```
REPS & SETS: [25, 35, 50]    (Beginner / Intermediate / Advanced)
CIRCUIT:     [20, 30, 45]
TABATA:      [15, 25, 35]
AMRAP:       [15, 25, 40]
EMOM:        [15, 25, 35]
FOR TIME:    "Various"       (unchanged -- depends on the athlete)
MIX:         [20, 30, 45]
```

These are starting estimates. The post-generation parser will override with the actual calculated sum from the HTML.

---

### Change 2: Redefine `calculateActualDuration()` post-generation parser

**File:** `supabase/functions/generate-workout-of-day/index.ts`, lines 1992-2068

Currently this function sums ALL 5 sections. It needs to sum **only Main Workout + Finisher** sections.

**How it will work:**
- Parse the HTML for section headers as before
- Identify which sections are Main Workout (icon 💪) and Finisher (icon ⚡) 
- Sum ONLY those two sections
- Ignore Soft Tissue, Activation, and Cool Down durations
- For "For Time" finishers (no duration in header), set the workout duration to "Various"
- Sanity check: result should be between 10 and 60 minutes (not 120 as before)
- Rounding to nearest 5 minutes for clean display

---

### Change 3: Update the AI prompt -- Duration and Finisher Philosophy

**File:** `supabase/functions/generate-workout-of-day/index.ts`

**a) Replace the TOTAL DURATION RULE (lines 1636-1652)** with a new DURATION PHILOSOPHY block:

```
DURATION RULE (CRITICAL - NEW DEFINITION):

The "duration" of a workout refers to the MAIN WORKOUT + FINISHER time ONLY.
Soft Tissue (5'), Activation (10-15'), and Cool Down (10') are CONSTANT overhead 
that every routine includes -- they are NOT part of the advertised duration.

When you see "Target Duration: 30 min", that means:
  Main Workout + Finisher = 30 minutes
  The full routine will be ~55 minutes (25' overhead + 30' work)

This is like a restaurant menu showing "cooking time" not "total visit time."
Customers want to know how long the ACTUAL TRAINING is.

YOUR TARGET MAIN+FINISHER DURATION: ${duration}

DURATION-RPE-DIFFICULTY RELATIONSHIP (THINK LIKE AN EXPERT COACH):

Short duration + Advanced difficulty = MAXIMUM intensity (RPE ceiling)
  A 15-minute advanced workout must be absolutely brutal. Every second counts.

Long duration + Advanced difficulty = High but NOT maximum intensity (RPE 1-2 below ceiling)
  A 50-minute advanced session sustains high effort but allows pacing.

Short duration + Beginner difficulty = Still meaningful stimulus
  A 15-minute beginner workout must still deliver real training value. 
  Not filler. Not "just stretching." Real work at appropriate intensity.

Long duration + Beginner difficulty = Gentle but complete programming
  More exercises, more rest, more technique focus. Low RPE but full session.

VARIETY IS ESSENTIAL:
  Your platform serves thousands of customers with different schedules.
  Some want 15-minute sessions. Some want 50-minute sessions.
  Generate VARIETY in duration across days. Not every workout should be 30 minutes.
  Short workouts are just as valuable as long ones when designed properly.

INTERNAL TOTAL ROUTINE AWARENESS:
  While the advertised duration is Main + Finisher only, you must still ensure
  the TOTAL routine (all 5 sections) does not exceed 90 minutes.
  A typical total routine: 25' overhead + Main + Finisher = total.
```

**b) Add FINISHER OPTIONALITY RULE** (new block after the RPE section, around line 828):

```
FINISHER OPTIONALITY RULE (INTELLIGENT DECISION-MAKING):

The finisher is NOT always mandatory. Think like an experienced head coach:

WHEN TO SKIP THE FINISHER:
- Beginner workouts (1-2 stars) with short target duration (15-20 min):
  If the main workout delivers complete stimulus, no finisher needed.
- Challenge category where the main workout IS the entire challenge
  (e.g., "Complete 100 burpees + 1km run" -- adding a finisher is absurd)
- When the main workout RPE is 9+ and the target duration is short:
  The athlete is already destroyed. A finisher adds nothing.
- When the combined RPE would exceed the difficulty bracket ceiling

WHEN TO ALWAYS INCLUDE THE FINISHER:
- Intermediate and Advanced workouts with target duration >= 30 min
- Strength workouts (the finisher provides volume completion at lighter load)
- When the main workout alone doesn't reach the target duration

THE GOLDEN RULE:
If the main workout is FULL ENOUGH to deliver the required stimulus for the 
category, difficulty, and duration -- you MAY skip the finisher.
But this is a COACHING DECISION, not a default. Most workouts WILL have finishers.
The finisher is a tool, not a checkbox.

WHEN THERE IS NO FINISHER:
- The workout still has 4 sections: Soft Tissue, Activation, Main Workout, Cool Down
- The duration = Main Workout time only
- The ⚡ Finisher section is simply omitted from the HTML
```

**c) Update the "Various" duration logic:**

Currently `FOR TIME` format always returns "Various". This should be expanded:
- If the main workout is "For Time" format AND the finisher is also time-dependent, use "Various"
- Challenge workouts that are user-pace-dependent should also use "Various"
- The AI prompt should explain that "Various" means "depends on the athlete's pace"

---

### Change 4: Update Duration Filter Options

The new duration range (Main + Finisher only) will produce workouts in the 15-50 minute range instead of 40-75. The filter options need to match.

**Files to update:**

**a) `src/pages/WorkoutDetail.tsx`** (line 38 and lines 460-468):
```
Type:    "all" | "15" | "20" | "30" | "40" | "50" | "various"
Options: All Durations, 15 min, 20 min, 30 min, 40 min, 50 min, Various
```

**b) `src/components/admin/WorkoutsManager.tsx`** (lines 619-626):
```
Same filter options: 15, 20, 30, 40, 50, Various
```

**c) `src/components/WorkoutFilters.tsx`** (line 26):
```
const durations = ["All", "15", "20", "30", "40", "50", "Various"];
```

**d) `src/components/smartly-suggest/SmartlySuggestModal.tsx`** (lines 62-67):
```
{ label: "15 min", value: 15 },
{ label: "20 min", value: 20 },
{ label: "30 min", value: 30 },
{ label: "45 min", value: 45 },
```

**e) `src/components/admin/WorkoutEditDialog.tsx`** (lines 49-60):
```
"15 MINUTES", "20 MINUTES", "25 MINUTES", "30 MINUTES", 
"35 MINUTES", "40 MINUTES", "45 MINUTES", "50 MINUTES", "VARIOUS"
```

The range-matching filter logic (rangeMin = filterNum - 5, rangeMax = filterNum + 4) remains the same -- it already works correctly.

---

### Change 5: Update the `calculateActualDuration` to sum Main + Finisher only

**File:** `supabase/functions/generate-workout-of-day/index.ts`, lines 1992-2068

The parser currently collects ALL section durations. The change:
- Still parse all headers (needed for internal validation)
- But only SUM the durations from 💪 (Main Workout) and ⚡ (Finisher) headers
- If the finisher is "For Time" with no duration, set the workout duration to "Various"
- Sanity check range: 10-60 minutes (instead of current 10-120)

---

### Summary of All File Changes

| File | What Changes | Why |
|---|---|---|
| `generate-workout-of-day/index.ts` (getDuration) | New base durations for Main+Finisher only | Duration definition change |
| `generate-workout-of-day/index.ts` (calculateActualDuration) | Sum only Main+Finisher sections | Duration definition change |
| `generate-workout-of-day/index.ts` (AI prompt) | New DURATION RULE, FINISHER OPTIONALITY, Duration-RPE relationship | AI coaching intelligence |
| `WorkoutDetail.tsx` | New filter options (15-50 instead of 30-75) | Match new duration range |
| `WorkoutsManager.tsx` | New filter options | Match new duration range |
| `WorkoutFilters.tsx` | New durations array | Match new duration range |
| `SmartlySuggestModal.tsx` | New duration options | Match new duration range |
| `WorkoutEditDialog.tsx` | New DURATION_OPTIONS | Match new duration range |

### What Will NOT Change

- The 5-section structure (all workouts still have Soft Tissue, Activation, Main, optional Finisher, Cool Down)
- HTML formatting, icons, spacing rules
- Category-specific exercise rules, RPE balancing logic, equipment governance
- The filter range-matching logic (already works: filterNum +/- 5)
- How duration is displayed to users on workout cards and detail pages
- Database schema (the `duration` column stays as-is, just stores different values going forward)
- Existing workouts in the database (they keep their current durations -- only NEW generated workouts use the new logic)

