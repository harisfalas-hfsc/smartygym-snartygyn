## Goal

1. **Cleanup** the 2 orphan WODs polluting the DB and Stripe (one-time).
2. **Fix** the WOD generation flow so a failed attempt cannot leave behind a hidden DB row OR a Stripe product/price ever again.

---

## Part 1 — One-time cleanup

The two orphans confirmed in the DB:
- `Cadence Leap Circuit` → Stripe `prod_USUHshUBTX5OVl`
- `Torque Circuit Tabata` → Stripe `prod_USUKBf4oXIGfOJ`

Both have `is_visible: false` and `generated_for_date: null` — they are dead rows from the May 4 failed manual attempts, not part of any planned WOD.

Steps:
1. **Stripe side** — archive each product (sets `active: false`, also auto-archives attached prices). Use `stripe--stripe_api_execute` with `PostProductsId`, body `{ active: false }`. Stripe does not allow hard delete on products that have been used; archiving is the correct end state and removes them from product listings/checkout.
2. **DB side** — delete the two rows from `admin_workouts` where `id` matches the two orphans (via a migration). This is intentionally a hard delete, not archival, because they were never live and never sold — the non-destructive policy applies to **live/sold** content only.
3. Verify `SELECT … WHERE is_visible=false AND is_workout_of_day=true` returns 0 rows after.

---

## Part 2 — Fix the orchestrator: validate-then-stripe-then-publish

### Current (broken) order

```text
generate-workout-of-day per slot:
  build content → INSERT row (is_visible=TRUE, stripe IDs NULL)
                  ├─ fire-and-forget auto-generate-workout-image
                  └─ fire-and-forget wod-stripe-link  (creates Stripe product + price)

orchestrator:
  loops attempts, only checks "did rows exist?"
  no cross-slot pairing check before Stripe linking happens
  → if slot 2 fails, slot 1 is already visible AND its Stripe product is being created in the background
  → on retry/cleanup the row is flipped to is_visible=false but the Stripe product stays
```

This is exactly what produced the two orphans.

### New (correct) order

```text
generate-workout-of-day per slot:
  build content → INSERT row with is_visible=FALSE, stripe IDs NULL
                  (NO stripe-link kickoff here, NO image kickoff that depends on visibility)
  return slot result to orchestrator

orchestrator (after both slots return for the day):
  Step 1 — Pair validation
    • Required slots present? (BODYWEIGHT + EQUIPMENT, or just one on recovery days)
    • Both pass section/density/name validators
    • If ANY slot fails or is missing →
        DELETE both staged rows (hard delete, since is_visible=false and never linked)
        Mark run failed, send failure email, exit. Zero trace.

  Step 2 — Stripe linking (only after Step 1 passes)
    • For each staged row, call wod-stripe-link synchronously
    • If Stripe call fails on either slot →
        Roll back: archive any product already created in this run,
        DELETE both staged rows, mark run failed, exit.

  Step 3 — Publish flip (atomic-ish)
    • UPDATE both rows SET is_visible = TRUE in a single statement
      (WHERE id IN (slot1_id, slot2_id))
    • Kick off image generation (image absence is non-blocking, image
      can land later without affecting visibility)
    • Mark run success, send success email.
```

This enforces the existing rule in `mem://business-rules/wod-all-or-none-publishing` at the orchestrator level instead of trusting each slot individually.

### Code changes required

1. **`supabase/functions/generate-workout-of-day/index.ts`** (around line 2701–2759):
   - Change the INSERT to `is_visible: false`.
   - Remove the inline `wod-stripe-link` fire-and-forget call.
   - Remove the inline `auto-generate-workout-image` fire-and-forget call (move to Step 3).
   - Return the inserted `workoutId` and slot in the response so the orchestrator can act on it.

2. **`supabase/functions/wod-generation-orchestrator/index.ts`** (around line 644–710):
   - After all attempts succeed structurally, add the new 3-step finalize block:
     - `validateBothSlots(rows)` — already have validators in `_shared/wod-integrity.ts`; just call against both staged rows.
     - `linkStripeForBoth(rows)` — synchronous calls to `wod-stripe-link`, with rollback helper.
     - `publishBoth(rows)` — single UPDATE flipping `is_visible=true` for both ids, then fire image jobs.
   - Add `rollbackStagedRun(rows)` helper that:
     - For any row with a `stripe_product_id`, archive it via Stripe API (`active:false`).
     - Hard-DELETE both rows (safe: they are still `is_visible=false` and never reached customers).

3. **No schema migration needed.** All changes are in edge function logic. Existing columns (`is_visible`, `stripe_product_id`, `stripe_price_id`) carry the new state.

4. **Recovery-day case** (single slot): the same 3-step flow runs with one row instead of two. The "all or nothing" rule degenerates to "this one or nothing".

### What this guarantees

| Scenario | DB result | Stripe result |
|---|---|---|
| Both slots succeed | 2 rows visible | 2 products live |
| Slot 1 ok, Slot 2 fails generation | 0 rows | 0 products |
| Both ok, Stripe link fails on slot 2 | 0 rows | 0 products (slot 1 product archived in rollback) |
| Image generation later fails | 2 rows visible (image-less, retried by image cron) | 2 products live |

No "hidden orphan" state ever exists for more than the few seconds of the finalize block, and even within that window nothing is customer-visible.

### Out of scope (deliberately)

- Renaming/repurposing the existing `cleanup-wod-stripe-orphans` cron — it stays as a safety net for any pre-existing orphans, but with the new flow it should find nothing on healthy days.
- WODManager UI date/badge/grouping improvements — that was a separate proposal; not included here unless you want me to fold it in.
