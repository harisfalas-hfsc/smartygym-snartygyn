You are right. No library mode. I will not use library selection for this fix.

Clear final answer:
- Yes, I can fix the admin button.
- The button must generate the WOD itself, using the WOD generation engine, not library mode.
- The current button is wrong because it still calls the old fragile path directly.

What I found in the code

1. The admin button currently calls `generate-workout-of-day` directly.
- File: `src/components/admin/WODManager.tsx`
- It sends only `{ targetDate }`.
- It does not send `slot`.
- It does not use the newer orchestrator flow.
- It waits synchronously for the full result.

That means the manual button is still trying to create BODYWEIGHT + EQUIPMENT together in one old-style call. If one succeeds and the other fails, the system rolls back the partial result. That is exactly what happened: EQUIPMENT was created, BODYWEIGHT was missing, then the partial WOD was hidden.

2. I also found a serious bug in the orchestrator.
- File: `supabase/functions/wod-generation-orchestrator/index.ts`
- The orchestrator accepts `targetDate`, but its internal `callGenerateWod()` does not pass that `targetDate` down to `generate-workout-of-day`.
- So an orchestrator run can think it is generating/verifying tomorrow, while the generator itself may still generate today.

That must be fixed. This is not library mode. This is a date-forwarding bug.

3. The 1,000-workout question
There are two different things:
- Generating a new WOD with the generation engine: a larger library can make exercise/content constraints and uniqueness checks heavier.
- Selecting from library: a larger library can make selection easier.

You rejected library mode, so the relevant answer is: the generation engine must not depend on doing everything in one giant fragile call. The button needs to use the same split-slot generation contract as the cron system, but hidden behind one admin click.

What I will implement

1. Fix target date forwarding in the orchestrator
- Update `callGenerateWod()` so it accepts `targetDate`.
- Include `targetDate` in the body sent to `generate-workout-of-day`.
- This protects tomorrow pre-generation and manual future generation.

2. Fix the admin button to use the orchestrator / split-slot generation, not the old direct full generation
- Replace the direct call to `generate-workout-of-day` from the admin button.
- For normal days, one click will trigger:
  - BODYWEIGHT generation for the selected date
  - EQUIPMENT generation for the selected date
- For recovery days, one click will trigger the required recovery slot only.
- This is still generation, not library mode.

3. Keep it one-click for you
- You will not need to click BODYWEIGHT and EQUIPMENT separately.
- The button will do the split internally.
- The UI can say something like: “Generating BODYWEIGHT + EQUIPMENT WODs...”

4. Stop false success / false hanging
- The button will verify the database after generation.
- It will show success only when the required WODs exist for the selected Cyprus date and are active.
- If one slot fails, the message will say exactly which one failed.

5. Make the archive checkbox sane
- If no active WOD exists, the archive option will not confuse the flow.
- It can be disabled or treated as irrelevant.
- If active WODs exist, it remains available.

6. Do not change the WOD mode setting
- I will not enable library mode.
- I will not route this through `select-wod-from-library`.
- If you ever want library mode, you can switch it yourself. This fix does not touch that.

Expected result

After this fix, pressing “Generate Missing WOD” should:
- generate today’s WODs through the generation engine,
- publish them immediately for today,
- not wait for midnight,
- not use library mode,
- and not fail just because the old all-in-one call produced only one of the two slots.

Implementation files
- `supabase/functions/wod-generation-orchestrator/index.ts`
- `src/components/admin/WODManager.tsx`
- possibly `src/components/admin/GenerateWODDialog.tsx` for clearer button text and archive-checkbox behavior

I will keep the change focused on fixing the button and the date-forwarding bug.