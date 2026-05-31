Here is what is actually happening:

- The health warning is checking `admin_workouts` for tomorrow with `is_workout_of_day = true` and `generated_for_date = tomorrow`.
- Right now, the live database has today's WODs published, but zero published WODs for tomorrow.
- The admin panel area you are seeing is almost certainly `Tomorrow's WOD Preview`. That preview has two workouts selected for tomorrow, but they are still `pending` and not published as tomorrow's active WODs.
- So both signals are looking at different states:
  - Health audit: published/rollover-ready WODs = zero, so warning is technically correct.
  - Admin preview: selected-but-not-approved workouts = two, so visually it looks ready, but it is not rollover-ready.

The real bug is not the database. The bug is the workflow/UI language and consistency: the admin panel makes “picked for tomorrow” look like “ready for tomorrow”, while the health audit only counts “approved and published for tomorrow”.

Plan to make this permanent and stop the confusion:

1. Update the health audit tomorrow check
   - If preview rows exist but are not approved/published, report: `Tomorrow WODs are picked but not approved` instead of `library picker failed`.
   - Only say `library picker failed` when there is no preview selection and no published WOD.
   - Include exact counts: picked preview slots, approved status, published WOD slots.

2. Update the watchdog warning logic
   - Stop repeatedly logging the same false “manual content fix required” message when preview rows already exist.
   - Mark that state as “pending admin approval”, not “library picker failed”.

3. Update `Tomorrow's WOD Preview` UI
   - Add a clear status line:
     - `Picked only — not live yet` when status is pending.
     - `Published for rollover` only after `Approve & publish` succeeds.
   - Make the button language clearer: `Approve & publish tomorrow's WODs`.

4. Optional immediate data cleanup during implementation
   - Close the existing open health events for `2026-06-01` as superseded if preview slots exist, so the admin panel stops showing stale open warnings.

After this, the system will distinguish three states consistently:

```text
No preview, no published WODs  -> real picker problem
Preview picked, not approved   -> admin approval pending
Published WODs exist           -> tomorrow is ready
```

No workout generation changes, no periodization changes, no deletion of content.