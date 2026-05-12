# Fix today's broken WOD + close the holes that let it through

## Constraint (acknowledged)
**Do NOT rename any workout.** Names are linked to Stripe `stripe_product_id` / `stripe_price_id` on the same record. Renaming desyncs the Stripe catalog. Only `warm_up`, `main_workout`, `finisher`, `cool_down`, `instructions`, and `duration` will ever be touched.

## Part 1 — Fix today's "Cadence Drive Motion" (WOD-CA-B-1778481004025)

Rewrite the stored content in place (non-destructive: previous version logged to `workout_repair_log`):

1. **Move Soft Tissue Prep + Activation 15' out of `main_workout` into the `warm_up` column.** `main_workout` keeps only the Main circuit + Finisher.
2. **Reformat Activation 15'** so Dynamic Mobility, Core Activation, and Movement Prep are each their own labelled bullet list — not loose `<p>` paragraphs.
3. **Link every exercise consistently** using the existing library:
   - Bird Dog, Glute Bridge, Jumping Jacks, High Knees, Butt Kicks → use the same library IDs already used in the Main Workout (`jumping-jacks`, `high-knees-cardio`, `3013` for glute bridge, etc.)
   - Cool Down stretches (hamstring, butterfly, lying quad) → link to library stretch IDs
4. **Fix the Diaphragmatic Breathing line.** Remove `{{exercise:3679:sit-up with arms on chest}}` — a sit-up is not a breathing drill. Replace with plain coaching text describing the breathing pattern (no fake token).
5. **Split the glued Soft Tissue line** `Foam roll glutes, {{exercise:1346:kneeling lat stretch}}` into two separate bullets.
6. **Recalculate `duration`** from actual section math (≈52 min) and overwrite the stored value.
7. **Name stays exactly as is.** Stripe IDs untouched.

## Part 2 — Plug the generator holes so this stops happening

Add the missing enforcement layers in `supabase/functions/_shared/protocol-sanitizer.ts` and the WOD generator:

**A. Section-placement validator (new check)**
- Reject any generation where `warm_up` is empty AND `main_workout` contains 🧽 or 🔥 emojis (warm-up markers in wrong column). Force regeneration or auto-move into `warm_up`.

**B. Activation sub-block formatter**
- Detect "Dynamic Mobility:", "Core Activation:", "Movement Prep:" labels.
- Each must live in its own `<ul class="tiptap-bullet-list">` with `<li>` items. Loose `<p>` siblings get auto-wrapped or rejected.

**C. Extend bare-exercise detector to Activation + Cool Down**
- Today's `validateProtocolBlocks` only inspects Main Workout and Finisher.
- Same check now runs on Activation and Cool Down: any plain-text exercise name that exists in the library must be auto-linked to `{{exercise:ID:Name}}`, or the workout is rejected.

**D. Stimulus mismatch guard (new)**
- If a token sits inside a paragraph mentioning "breathing", "diaphragmatic", "meditation", or "static stretch hold", and the linked exercise's `category` is `strength` / `core` / `cardio` / `plyometric`, reject. Prevents the breathing→sit-up bug.

**E. Soft Tissue glued-text rule (already in standard, now enforced in sanitizer)**
- Comma-separated lines mixing bare text + a token auto-split into two bullets.

**F. Duration recompute pass**
- After all section fixes, recompute `duration` from section math (sum of warm-up minutes + main work+rest + finisher work+rest + cool-down minutes) and overwrite the field. Never trust the model's `duration`.

## Part 3 — Sweep recent WODs for the same defects

Run `repair-workout-content` across the last 30 days of WODs (and any program weeks generated in the same window) using the new validators from Part 2. For every record:

- Log original + fixed content to `workout_repair_log`.
- Touch only content fields. Never touch `name`, `stripe_product_id`, `stripe_price_id`, `price`, `is_premium`, `is_visible`.

Report back: how many records were inspected, how many had each defect, what was rewritten.

## Order of operations

1. Fix today's WOD (Part 1) and verify in DB + live preview.
2. Add the four new validators (Part 2 A–D) + recompute pass (F) to the shared sanitizer.
3. Run the 30-day sweep (Part 3).
4. Send you a short report with the counts.

## What I need from you before starting

- Confirm: rewrite today's WOD content in place, name untouched.
- Confirm: add the four new validators + duration recompute to the sanitizer.
- Confirm: run the 30-day repair sweep with names/Stripe fields locked.

Nothing changes until you say go.
