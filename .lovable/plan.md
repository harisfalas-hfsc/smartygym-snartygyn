Plain-language diagnosis:

The bug is real. The generator treated “body weight” in the exercise database as “allowed for BODYWEIGHT WOD”. That is too loose. Some database exercises are labelled body weight because the person’s body provides resistance, but they still need specialist apparatus, benches, bars, dip stations, pull-up cages, GHD-style support, etc. `glute-ham raise` is exactly that case: it is labelled `body weight`, so the current filter allowed it, but it is not appropriate for a no-equipment/home/travel bodyweight WOD.

Plan:

1. Fix tomorrow’s BODYWEIGHT Strength WOD content
   - Replace `glute-ham raise` with a true no-specialist-equipment hamstring/glute option from the existing exercise library.
   - Keep the workout’s category, focus, date, format, visibility, pricing, image, and payment links intact.
   - Use a non-HFSC-safe targeted update only for tomorrow’s `BODYWEIGHT` WOD.

2. Add a strict “home bodyweight” filter to WOD generation
   - For `BODYWEIGHT` WODs, do not rely only on `equipment = body weight`.
   - Exclude bodyweight exercises whose name clearly requires apparatus or specialist setup, including terms like bench, pull-up, chin-up, dip, bar, cage, straps, box, chair, staircase, cable machine, hyperextension, glute-ham raise, inverse leg curl with bench/support, and similar support-dependent items.
   - Keep these excluded exercises available for EQUIPMENT workouts if appropriate; this guardrail applies only to BODYWEIGHT WOD generation.

3. Add a final pre-insert validator
   - Before a BODYWEIGHT WOD can be saved/published, scan all `{{exercise:ID:Name}}` tokens in the generated workout.
   - If any token points to a home-unfriendly bodyweight exercise, reject the generated variant and retry instead of publishing bad content.
   - This prevents the same failure even if the AI picks an exercise that slipped into the prompt or post-processing.

4. Update the generation prompt wording
   - Make “BODYWEIGHT” explicitly mean “no specialist equipment, no bench, no pull-up bar, no dip station, no gym apparatus; suitable for home/hotel/travel.”
   - Remove/override conflicting wording that says all workouts must use gym-based equipment when the current variant is BODYWEIGHT.

5. Validate after implementation
   - Re-check tomorrow’s WOD in the database and confirm `glute-ham raise` is gone.
   - Run the generator/validator path in a safe targeted way for BODYWEIGHT logic.
   - Confirm the BODYWEIGHT exercise reference list no longer exposes specialist-apparatus exercises to the generator.

What this fixes:

- Tomorrow’s visible mistake.
- The root cause: database “body weight” is not the same as “no equipment at home”.
- The missing safety gate: bad BODYWEIGHT exercises should be rejected before users ever see them.