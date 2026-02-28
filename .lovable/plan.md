
Goal: stop these random missing-section failures without bloating the code, and fix today’s broken WOD immediately after deployment.

1) Why this happened (clear root cause)
- The broken workout is real in the database:
  - `WOD-S-B-1772231407202` (“Foundation Builder Core”) has only `💪 Main Workout` + `⚡ Finisher` in `main_workout`.
  - It is missing `🧽 Soft Tissue`, `🔥 Activation`, and `🧘 Cool Down`.
- The same generation run created a complete equipment WOD, which confirms this is intermittent model output drift (non-deterministic behavior), not a deterministic parser failure.
- Current code has no mandatory “section completeness gate” before saving.
  - `generate-workout-of-day` normalizes HTML spacing, but does not enforce required section presence.
  - Orchestrator currently checks only “do we have BODYWEIGHT/EQUIPMENT rows,” not “are those rows structurally complete.”
- Prompt contradictions increase failure probability:
  - “5 sections mandatory” appears, but elsewhere finisher is optional / challenge shows 4 sections / fallback template is 4-section style.
  - Conflicting instructions + very long prompt makes occasional section drops more likely.

2) Lean fix strategy (no code bloat, mostly tightening + deleting conflicting text)
- I will not add a big “repair engine.”
- I will add one small shared validator and wire it into existing flow.
- I will remove contradictory prompt blocks (net reduction in prompt complexity).

3) Implementation steps (exact)
A. Add shared section validator (small utility)
- New shared helper with one responsibility:
  - For non-recovery WODs: require all 5 icons `🧽 🔥 💪 ⚡ 🧘`
  - For recovery: require `🧽 🔥 💪 🧘` (no finisher required)
- Returns `{ isComplete, missingSections[] }`.

B. Enforce validator inside `generate-workout-of-day` BEFORE expensive side effects
- After AI output is parsed (and after normalization), validate `main_workout`.
- If invalid: treat that equipment generation as failed immediately (before image/Stripe insert path), so malformed content is never published as active WOD.

C. Make `retryMissing` actually recover malformed existing WODs
- In the “existing WODs for date” check:
  - consider a workout “existing” only if it passes section validator.
- If `retryMissing=true` and an existing row for that equipment is incomplete:
  - archive that broken WOD record (`is_workout_of_day=false`, `generated_for_date=null`) so it won’t block regeneration.
  - regenerate only the missing/incomplete equipment variant.

D. Strengthen orchestrator verification
- Update orchestrator verification so success requires:
  - expected equipment types present, and
  - each required WOD is structurally complete by validator.
- This prevents false “success” states where a malformed WOD slips through.

E. Prompt cleanup (reduce noise/contradictions, preserve your coaching system)
- Keep your existing logic/style/formatting standards.
- Remove contradictory blocks (finisher optionality + conflicting 4-section examples for non-recovery).
- Ensure fallback/minimal template aligns with the same required structure as main rules.
- This is simplification, not expansion.

4) Fixing the current broken workout (today) — included
After code changes are in:
- I will trigger regeneration with retry mode for today’s date.
- The broken bodyweight row will be archived and replaced by a complete one.
- Result target for today:
  - exactly one active BODYWEIGHT WOD (complete sections)
  - exactly one active EQUIPMENT WOD (complete sections)

5) What will NOT change (to avoid new mess)
- No UI layout/design changes.
- No changes to your visual “Gold Standard” rendering behavior.
- No changes to business logic for pricing/access tiers.
- No broad refactors.
- No large new prompt blocks.

6) Verification checklist (strict)
- Query today’s active WODs and confirm each has required section icons.
- Confirm no duplicate active BODYWEIGHT/EQUIPMENT WODs for today.
- Confirm generated content still passes existing HTML normalizer/validator.
- Quick recent-history audit to ensure no new malformed WOD was introduced by the fix.

Files to update
- `supabase/functions/_shared/` (small section validator helper)
- `supabase/functions/generate-workout-of-day/index.ts`
- `supabase/functions/wod-generation-orchestrator/index.ts`
- (Prompt cleanup within the same generator file; mostly removals/alignments)

Expected outcome
- The random “missing warm-up/activation/cool-down” publish bug is blocked at source.
- Today’s broken workout gets replaced with a complete version.
- Prompt becomes cleaner (less contradictory), so reliability improves without turning code into a bigger mess.
