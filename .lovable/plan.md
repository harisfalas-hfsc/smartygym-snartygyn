Root cause found

The failure is not the deleted notification cron and not library mode.

For the failed Equipment WOD for 2026-05-18, the logs show two concrete blockers:

1. The exercise-linking repair layer corrupts valid prescriptions.
   - The AI produced lines like `15-20 kettlebell swing` and `500m run on treadmill`.
   - The final sweep matched those to library exercises, but replaced the whole phrase with only `{{exercise:ID:Name}}`.
   - Result: `15-20 kettlebell swing` became `{{exercise:0549:kettlebell swing}} (moderate weight)`.
   - Then the protocol validator correctly rejected it because the exercise token had no reps, time, distance, calories, or sets before it.

2. The prompt and validator currently contradict each other.
   - The hard rules say prescriptions/modifiers must come before the exercise token.
   - But the gold-standard examples still show many modifiers after the token, such as `{{exercise:...}} (10 reps)` and `{{exercise:...}} (moderate weight)`.
   - The AI follows the examples, then the validator rejects the result.

3. The duration target and quality gate also contradict each other.
   - For a 4-star Calorie Burning AMRAP, the generator target can be `25 min`.
   - The quality gate requires at least `28 min`.
   - So a workout can follow the requested duration and still be rejected.

Plan to fix it

1. Stop the linker from destroying prescriptions
   - Patch `supabase/functions/_shared/exercise-matching.ts`.
   - Preserve numeric/time/distance prefixes when linking plain text exercises.
   - Example expected result:
     - Before: `15-20 kettlebell swing`
     - After: `15-20 {{exercise:0549:kettlebell swing}}`
   - Also preserve distance/time prefixes:
     - Before: `500m run on treadmill`
     - After: `500m {{exercise:0685:run}} on treadmill`

2. Stop stripping already-valid exercise tokens unnecessarily
   - Patch `processContentSectionAware` so it does not remove valid `{{exercise:ID:Name}}` markup from whole sections and then re-match everything again.
   - Only repair list items or text fragments that are genuinely missing exercise tokens.
   - This reduces the chance of the repair layer damaging already-good AI output.

3. Fix the WOD prompt examples so they match the validator
   - Patch `supabase/functions/generate-workout-of-day/index.ts`.
   - Rewrite all gold-standard examples so the prescription always comes before the exercise token.
   - Remove examples that place reps/time/weight after `}}`.
   - Remove contradictory header examples like `Finisher (8-minute AMRAP)` and use clean headers like `Finisher (AMRAP)` with the time cap in plain text or instructions.

4. Align duration generation with the quality gate
   - Patch the WOD duration selection logic so generated target durations never fall below the hard quality minimum.
   - For intermediate non-recovery WODs, target at least ~30 minutes Main+Finisher instead of 25 when the gate requires 28.
   - For advanced non-Tabata WODs, target at least the gate minimum.

5. Add regression tests for this exact failure
   - Add Deno tests for the shared WOD repair logic.
   - Test that `15-20 kettlebell swing` becomes `15-20 {{exercise:...}}`, not `{{exercise:...}}`.
   - Test that `500m run on treadmill` keeps `500m` before the token.
   - Test that a Calorie Burning EMOM/AMRAP sample passes protocol validation and quality gate after repair.

6. Validate with the live WOD generator
   - Deploy the changed backend functions.
   - Run `generate-workout-of-day` for BODYWEIGHT and EQUIPMENT against the failed target date with generation mode still enabled.
   - Confirm two active WOD rows exist for the date, with valid sections, valid exercise prescriptions, and no library-mode fallback.

What I will not do

- I will not switch cron to library mode.
- I will not enable automatic library fallback.
- I will not delete paid content.
- I will not change your admin-panel WOD mode choice.

Expected result

The bottleneck is fixed inside the current AI-generation pipeline: the AI can still generate WODs, but the repair layer will stop corrupting prescriptions, the prompt will stop teaching invalid formatting, and the duration gate will stop rejecting workouts that were asked to be too short.