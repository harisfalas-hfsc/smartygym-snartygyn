

# WOD System Audit: AI Mode vs Library Mode -- Full Report

## System Overview

The Workout of the Day (WOD) system has two modes, toggled via the admin panel's "Library Mode" switch. The toggle writes `wod_mode = "select"` or `wod_mode = "generate"` to the `wod_auto_generation_config` table. The daily orchestrator (`wod-generation-orchestrator`) reads this value and routes accordingly.

---

## Mode 1: AI Generation Mode (`wod_mode = "generate"`)

### Flow
```text
Cron (00:30 UTC) --> wod-generation-orchestrator
  --> reads wod_mode = "generate"
  --> calls generate-workout-of-day
    --> 84-day periodization determines: category, difficulty, format
    --> Fetches exercise library WITH difficulty tags
    --> Builds 2 AI prompts (BODYWEIGHT + EQUIPMENT) or 1 (RECOVERY)
    --> AI generates workout content
    --> 4-layer exercise enforcement pipeline
    --> Creates new rows in admin_workouts
    --> Creates Stripe products
    --> Sends notifications
```

### Difficulty-Aware Exercise Selection (NEW -- deployed)
- Line 650: `difficultyLevelName` extracted from periodization
- Lines 652-655: Two separate exercise libraries built -- bodyweight-only and full library -- both filtered by difficulty
- The AI prompt (line 716) explicitly states: `Difficulty: ${selectedDifficulty.name} (${selectedDifficulty.stars} stars out of 6)`
- The reference list header (lines 874-900 of `exercise-matching.ts`) injects mandatory constraint rules:
  - Beginner: ONLY `[beginner]` exercises
  - Intermediate: `[beginner]` or `[intermediate]`, NO `[advanced]`
  - Advanced: All allowed, prioritize `[intermediate]` and `[advanced]`
- Every exercise in the reference list includes a difficulty tag: `[ID:0043] Barbell Full Squat (barbell) [intermediate]`

### Verdict: WORKING CORRECTLY
The AI sees exercise difficulty levels and has mandatory instructions to respect them.

---

## Mode 2: Library Selection Mode (`wod_mode = "select"`)

### Flow
```text
Cron (00:30 UTC) --> wod-generation-orchestrator
  --> reads wod_mode = "select"
  --> calls select-wod-from-library
    --> 84-day periodization determines: category, difficulty, strengthFocus
    --> Queries admin_workouts matching category + difficulty_stars range + equipment
    --> Applies 60-day cooldown filter
    --> Flags selected workouts as WOD (non-destructive)
    --> Sends notifications (only for today's date)
```

### How Library Mode Selects Workouts

| Step | Filter | Code Location |
|------|--------|---------------|
| 1 | Category must match periodization | Line 294: `.eq("category", category)` |
| 2 | Workout must NOT already be a WOD | Line 295: `.eq("is_workout_of_day", false)` |
| 3 | Workout must be visible | Line 296: `.eq("is_visible", true)` |
| 4 | Equipment filter (BODYWEIGHT or EQUIPMENT) | Line 300: `.eq("equipment", equipment)` |
| 5 | Difficulty stars range filter | Lines 304-305: `.gte("difficulty_stars", min).lte("difficulty_stars", max)` |
| 6 | 60-day cooldown exclusion | Line 354: candidates filtered against cooldownIds |
| 7 | Strength focus preference (optional) | Lines 362-370: narrows pool if focus match exists |

### Fallback Logic
- If NO candidates match category + difficulty + equipment: tries without difficulty filter (lines 316-337)
- If ALL candidates are in cooldown: picks the one used longest ago (lines 373-388)
- Random selection from remaining pool (line 392)

### Non-Destructive Architecture
- Library mode does NOT clone or duplicate workouts
- It sets 3 flags on the existing row: `is_workout_of_day = true`, `generated_for_date = today`, `wod_source = "library"`
- The archive process (`archive-old-wods`) recognizes `wod_source = "library"` and simply clears the flags instead of archiving -- the workout returns to its original category gallery

### Recovery Days
- Library mode picks 1 workout from RECOVERY category with no equipment filter (any equipment type)
- Normal days: 1 BODYWEIGHT + 1 EQUIPMENT

### Notifications
- Notifications are sent ONLY when `targetDate === todayCyprus` AND `skipNotifications !== true`

---

## Potential Concerns and Edge Cases

### 1. Library Mode Difficulty Fallback (LOW RISK)
If there are no workouts matching the required difficulty stars range for a given category + equipment combo, the system falls back to ANY difficulty in that category. This means on a Beginner day, if no beginner BODYWEIGHT CARDIO workouts exist, it could pick an Advanced one. This is by design to prevent empty WOD days, but it's worth noting.

### 2. Exercises Within Library-Selected Workouts Are NOT Re-Validated
Library mode selects entire pre-existing workouts. It does NOT scan the exercises inside those workouts for difficulty appropriateness. If a workout was created before the difficulty-aware system was deployed and contains advanced exercises despite being labeled "Beginner", library mode will still select it. This is only relevant for workouts created before the recent fix.

### 3. Inventory Gaps (KNOWN ISSUE)
Per existing documentation, the library does not yet have sufficient volume across all categories to sustain the 84-day cycle with 60-day cooldown. Full sufficiency was estimated for March 9, 2026 (12 days from now). Until then, library mode may hit fallbacks more frequently.

### 4. Switching Modes Mid-Day
If you switch from AI mode to Library mode (or vice versa) after today's WODs have already been generated, nothing happens -- both modes check for existing WODs first and skip if they already exist for today.

---

## Summary Table

| Feature | AI Mode | Library Mode |
|---------|---------|-------------|
| Exercise difficulty respected | YES (prompt-level + reference tags) | YES (difficulty_stars range filter on workouts) |
| Equipment filter (BW vs EQ) | YES (separate exercise libraries) | YES (query filter) |
| Category from 84-day cycle | YES | YES |
| Format variety | YES (rotation system) | N/A (uses existing workout's format) |
| Cooldown prevention | N/A (always new) | YES (60-day cooldown table) |
| Creates new content | YES | NO (flags existing) |
| Uses AI credits | YES | NO |
| Notifications | YES | YES (same-day only) |
| Archive behavior | Serial number assigned | Flags cleared, workout returns to gallery |

---

## Conclusion

Both modes are architecturally sound and respect the periodization cycle. The recently deployed difficulty-aware exercise selection ensures that AI-generated workouts will no longer include exercises above the intended difficulty level. Library mode selects workouts by their overall difficulty rating (stars), which inherently contains appropriately-leveled exercises if those workouts were created correctly.

The main risk is pre-existing workouts in the library that were created before the difficulty enforcement was added -- those could still contain mismatched exercises. A one-time audit of existing library workouts would mitigate this.

