Reality confirmed:

- Today, 2026-05-24 Cyprus date, is Day 13 of the 84-day cycle: MOBILITY & STABILITY, Advanced, 5-6 stars.
- Tomorrow, 2026-05-25, is Day 14: CHALLENGE, Intermediate, 3-4 stars.
- The public calendar is correct. The earlier “Challenge today” statement was wrong.

Root cause found:

- The library picker correctly knows Mobility & Stability should have 2 WODs: BODYWEIGHT + EQUIPMENT.
- Today currently has only 1 active WOD: BODYWEIGHT, “Align Flow Restore”.
- The bug is in `select-wod-from-library`: if it finds any WOD already active for the date, it skips the entire selection.
- So when the watchdog sees the missing Equipment slot and calls the picker, the picker says “a WOD already exists” and exits instead of filling only the missing Equipment slot.
- The Health System Audit is mostly correct about the missing slot, but it still contains old “generation / pre-built / Generate New WOD” wording from the previous AI-generation system, which makes the message confusing.

Implementation plan:

1. Fix `select-wod-from-library` to be slot-aware
   - Do not skip the whole day when one WOD already exists.
   - For Recovery days: require 1 slot only.
   - For all other days: check BODYWEIGHT and EQUIPMENT separately.
   - If BODYWEIGHT exists but EQUIPMENT is missing, select only EQUIPMENT.
   - If EQUIPMENT exists but BODYWEIGHT is missing, select only BODYWEIGHT.
   - If both exist, skip safely.
   - Keep the existing safeguards: visible only, premium only, not free, has image, has Stripe product/price, passes WOD publish contract.

2. Fix `watchdog-wod-check`
   - Import/use the same 84-day periodization logic.
   - Treat only RECOVERY as 1 WOD.
   - Treat Mobility & Stability, Strength, Pilates, Cardio, Metabolic, Calorie Burning, and Challenge as 2-slot days.
   - Report the expected category/difficulty in the watchdog response so it is clear what day it is checking.

3. Clean Health System Audit logic and wording
   - Rename “WOD Auto-Generation Config” / “Workout of Day Generation” wording to “Library WOD Selection”.
   - Remove old admin instructions like “Generate New WOD” and “Pre-Generate manually”.
   - Replace with correct library-mode instructions: “Run WOD Watchdog / Repick from Library”.
   - Make the audit message explicit:
     - Today: Day 13 / Mobility & Stability / Advanced / expected 2 slots.
     - Found: BODYWEIGHT only.
     - Missing: EQUIPMENT.
   - Keep tomorrow checks, but describe them as tomorrow library picks/preview, not AI pre-built generation.

4. Repair today’s missing WOD after code is fixed
   - Trigger the library picker/watchdog for today.
   - Confirm today has exactly 2 WODs:
     - 1 BODYWEIGHT Mobility & Stability Advanced.
     - 1 EQUIPMENT Mobility & Stability Advanced.
   - Confirm both have image + Stripe product + Stripe price.

5. Validate the fix
   - Query today’s active WODs.
   - Query tomorrow’s WODs separately to confirm Challenge belongs to tomorrow, not today.
   - Run/check the Health System Audit output to confirm it no longer reports confusing old generation/pre-built messages.