
User wants 12 free intermediate workouts (2 per category × 6 categories: Strength, Calorie Burning, Metabolic, Challenges, Cardio, Mobility & Stability), one bodyweight + one equipment per category. Same quality/formatting as WOD: 5-section format, library-first {{exercise:ID:Name}} markup with eye icons, density validation, unique AI image, no Stripe (free).

## Plan

### Categories & variants (12 total)
| Category | Bodyweight | Equipment |
|---|---|---|
| Strength | ✓ | ✓ |
| Calorie Burning | ✓ | ✓ |
| Metabolic | ✓ | ✓ |
| Challenges | ✓ | ✓ |
| Cardio | ✓ | ✓ |
| Mobility & Stability | ✓ | ✓ |

All: `difficulty = Intermediate`, `difficulty_stars = 3`, format per category enforcement trigger (Strength/Mobility = REPS & SETS, others flexible).

### Approach
Create one-shot orchestrator edge function `generate-free-category-workouts` that:
1. Loops sequentially through the 12 (category, equipment) pairs
2. For each, calls the same WOD generation core logic with locked params:
   - `difficulty: "Intermediate"`, `difficulty_stars: 3`
   - `equipment: "BODYWEIGHT"` or `"EQUIPMENT"`
   - `is_workout_of_day: false`, `is_visible: true`, `price: 0`, `stripe_product_id: null`
   - Category-specific coaching logic (existing system)
3. Runs library-first exercise selection + 5-section validator + density validator + uniqueness check
4. Inserts row → existing `trigger_auto_generate_workout_image` trigger fires → unique image per workout
5. Retries failed generations (per WOD reliability standard)
6. Returns summary: 12/12 success or list of failures

### Reused infrastructure (no changes)
- WOD generation core (same prompts, same library-first enforcement, same validators)
- `_shared/section-validator.ts` (5-section + density)
- Auto-image trigger (`trigger_auto_generate_workout_image`)
- Format enforcement trigger (`enforce_workout_format_rules`)
- Naming uniqueness DB constraint
- `admin_workouts` table

### One-shot execution
After deploy, I call the orchestrator once via `supabase--curl_edge_functions`. Then verify with a SQL query that all 12 rows exist with images, correct flags, and proper exercise markup.

### Safety
- Non-destructive (inserts only)
- No Stripe touched
- Sequential (avoids rate limits + naming collisions)
- Per-workout retry on validation failure
- Orchestrator is idempotent: skips if a free workout already exists for that (category, equipment, intermediate) combo to prevent duplicates on re-runs

### Deliverable
12 free intermediate workouts live in the library, 2 per category (1 bodyweight + 1 equipment), each with unique AI image, eye-iconed library exercises, and identical formatting to the WOD.
