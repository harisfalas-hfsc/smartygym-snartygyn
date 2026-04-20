
User wants the same job done as before, but for **Beginner** level instead of Intermediate. Same 12 workouts: 6 categories × 2 variants (1 Bodyweight + 1 Equipment).

The orchestrator `generate-free-category-workouts` already exists and is idempotent. I just need to extend it to accept a `difficulty` parameter (or add a beginner mode) and run it once.

## Plan

### Scope
12 free **Beginner** workouts (`difficulty = "Beginner"`, `difficulty_stars = 2`):

| Category | Bodyweight | Equipment |
|---|---|---|
| Strength | ✓ | ✓ |
| Calorie Burning | ✓ | ✓ |
| Metabolic | ✓ | ✓ |
| Challenges | ✓ | ✓ |
| Cardio | ✓ | ✓ |
| Mobility & Stability | ✓ | ✓ |

### Approach
1. Update existing `generate-free-category-workouts` orchestrator to accept `{ difficulty: "Beginner" | "Intermediate", difficulty_stars: number }` in the request body (defaults preserve current Intermediate behavior).
2. Idempotency check extended: skip only if a free workout exists for that **(category, equipment, difficulty)** triple — so beginner runs don't collide with the existing intermediate ones.
3. Locked params per workout:
   - `difficulty: "Beginner"`, `difficulty_stars: 2`
   - `equipment: "BODYWEIGHT"` or `"EQUIPMENT"`
   - `is_workout_of_day: false`, `is_visible: true`, `price: 0`, `stripe_product_id: null`
   - Difficulty-aware exercise selection (per `mem://content-creation/difficulty-aware-exercise-selection`) — beginner-appropriate movements only, lower volume, simpler progressions
4. Reuses all existing infrastructure (zero changes):
   - WOD generation core + library-first `{{exercise:ID:Name}}` markup (eye icons)
   - 5-section validator + density validator
   - Auto-image trigger (unique AI image per workout)
   - Format enforcement trigger
   - Naming uniqueness DB constraint
5. Sequential execution with per-workout retry. Returns success/failure summary.
6. Deploy → invoke once with `{ difficulty: "Beginner", difficulty_stars: 2 }` → verify all 12 rows via SQL.

### Coaching adjustments for Beginner
- Strength: lighter loads, fewer sets (3×8–10 instead of 4×6), longer rest, foundational lifts only
- Calorie Burning / Metabolic / Cardio: lower-intensity intervals, longer rest ratios, scaled work duration
- Challenges: shorter total volume, beginner-friendly movement pool
- Mobility & Stability: gentler ranges, longer holds, breath-led tempo

### Safety
- Non-destructive (inserts only)
- No Stripe touched (free)
- Idempotent: re-runs are safe
- Sequential to avoid rate limits + naming collisions

### Deliverable
12 free **Beginner** workouts live in the library, 2 per category (1 BW + 1 Equipment), each with unique AI image, eye-iconed library exercises, identical formatting to the WOD. Final report with workout names per slot.
