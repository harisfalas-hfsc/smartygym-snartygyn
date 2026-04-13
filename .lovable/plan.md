

## Findings

### 1. Blog Articles — Not Published (Expected)

The three articles were inserted as **drafts** (`is_published = false`, `published_at = NULL`). That's why they don't appear on the public blog page — the blog query filters for `is_published = true`.

**Fix:** Set `is_published = true` and `published_at = NOW()` for all three articles so they appear on the blog.

**Internal links verified — all valid:** `/trainingprogram`, `/workout`, `/1rmcalculator`, `/the-smarty-method`, `/coach-profile`, `/bmrcalculator`, `/caloriecounter`, `/macrocalculator`, `/blog`, `/daily-ritual`, `/disclaimer`.

**External links present:** PubMed, NEJM, WHO, The Lancet, ACSM, JSCR — these are real journal URLs embedded in the content.

### 2. Workout Counts — Verified Correct

- **Total visible workouts (excluding WOD): 318** — the page shows this number, which is accurate
- **1 active WOD** brings the total visible to 319
- **Category breakdown (all correct):**

```text
CALORIE BURNING      33
CARDIO               35
CHALLENGE            68
METABOLIC            35
MICRO-WORKOUTS       10
MOBILITY & STABILITY 35
PILATES              30
RECOVERY             11
STRENGTH             61
─────────────────────
TOTAL               318
```

The count logic in `WorkoutFlow.tsx` correctly excludes WOD workouts and maps categories to card IDs. The total and per-category badge numbers are accurate.

### What needs to be done

**Single database update** — publish the three blog articles by setting `is_published = true` and `published_at = now()` for:
- "Trendy Fitness: Scientific Look vs. Structured Training" (Fitness)
- "Diet Showdown: Keto, Carnivore, IF, Med, Paleo Analyzed" (Nutrition)
- "GLP-1s: Weight Loss Wonder or Risky Business?" (Wellness)

No code changes needed. No workout count fixes needed — everything is accurate.

