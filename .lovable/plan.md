I triggered the same WOD generation path manually and watched the logs.

What failed:
- The scheduled cron jobs did run.
- The manual triggers also ran.
- The AI generated workout text, but every attempt was rejected before database insert.
- Exact blocking error: `Stray text glued to an exercise token (no whitespace between }}` and following text)`.
- Because nothing was inserted, final verification found zero WODs.

There is also a second structural bug from the recent split:
- When a cron asks for only BODYWEIGHT or only EQUIPMENT, `generate-workout-of-day` still performs final verification as if both slots must already exist.
- That means a single-slot cron can fail/rollback even when it should only be responsible for its own slot.

Plan I am confident in:

1. Fix the protocol sanitizer so safe token spacing is auto-repaired before validation
- In `supabase/functions/_shared/protocol-sanitizer.ts`, add a normalization step that inserts a space after every exercise token when text is glued directly after `}}`.
- Example repair:
  - before: `{{exercise:id:name}}2 sets...`
  - after: `{{exercise:id:name}} 2 sets...`
- Keep dangerous/ambiguous protocol checks, but do not reject an otherwise usable workout for a simple missing space.

2. Make single-slot generation verify only its own responsibility
- In `supabase/functions/generate-workout-of-day/index.ts`, change final verification logic:
  - BODYWEIGHT slot requires BODYWEIGHT only.
  - EQUIPMENT slot requires EQUIPMENT only.
  - VARIOUS slot requires VARIOUS only.
  - no explicit slot still requires the full day set.
- This prevents the BODYWEIGHT cron from failing because EQUIPMENT has not run yet, and prevents EQUIPMENT from rolling back BODYWEIGHT.

3. Make orchestrator verification match split cron behavior
- In `supabase/functions/wod-generation-orchestrator/index.ts`, when a specific slot is requested:
  - verify only that requested slot after generation.
  - full-day verification remains for backup/watchdog/no-slot checks.
- This keeps the split schedule correct while preserving the all-slots safety net later.

4. Add targeted logs for the exact generated slot outcome
- Add clear logs showing:
  - requested slot
  - slots found after generation
  - whether final verification is slot-scoped or full-day
- This makes tomorrow’s failure/success immediately visible without guessing.

5. Deploy and immediately re-test manually
- Deploy only the affected WOD functions/shared code.
- Trigger BODYWEIGHT manually and confirm it inserts one WOD.
- Trigger EQUIPMENT manually and confirm it inserts the second WOD.
- Confirm today’s database has both WODs visible.
- Confirm missing Stripe/image assets are allowed initially and the Buy button remains protected until `stripe_price_id` exists.

Expected result after approval:
- The missing-space formatting issue will no longer kill generation.
- The two split cron jobs will no longer fight the old “both must exist immediately” rule.
- Today’s WODs can be regenerated manually after the fix, and tomorrow’s cron should follow the same corrected path.