I found the exact problem: the generator currently accepts sections that have exercise reps but no complete workout structure. The existing quality gate only checks that a finisher contains words like “For Time”, which is too weak. It also computes duration before final normalization/validation, so a bad “For Time” section can still become a fake estimated duration.

Plan:

1. Repair the affected pre-built WODs now
- Update “Loaded Engine Session” so the For Time finisher has a real prescription, e.g. clear rounds/time cap/rest guidance, not a single token list.
- Update “Engine Tempo Circuit” so the Main Workout has explicit rounds and the displayed duration reflects Main + Finisher from the actual prescription.
- Also repair the two other currently flagged WODs I found:
  - “Loaded Conditioning Session” has the same unstructured For Time finisher issue.
  - “Velocity Burst Ascend” has an AMRAP section missing a clear time cap.
- Keep changes non-destructive: update content only, preserve workout IDs, dates, visibility, images, and access metadata.

2. Add a real protocol-structure gate
- Extend the shared protocol validator so each protocol must prove its structure:
  - For Time/Circuit: must declare rounds, ladder/chipper structure, or a time cap.
  - EMOM: must declare either total minutes or Minute labels plus repeat rounds = total minutes.
  - AMRAP: must declare a time cap.
  - Tabata: must declare 20s/10s x 8 rounds or enough explicit Tabata blocks to calculate duration.
  - Reps & Sets: every exercise line must include sets x reps/reps and rest where needed.
- Make these checks blocking for WOD generation, not just logged warnings.

3. Fix duration calculation so it cannot reward bad structure
- Calculate duration after cleanup/normalization, not before.
- Treat under-specified For Time/Circuit as invalid instead of guessing one round.
- Keep “Various” only for valid For Time workouts where the work is clearly prescribed but completion speed varies.
- Ensure Tabata duration uses the rule: each Tabata exercise/block = 4 minutes.

4. Harden the AI prompt against these exact failures
- Add explicit “never publish” rules:
  - Never write “For Time” with only a list of exercises and no rounds/cap/chipper volume.
  - Never write “Circuit” without rounds.
  - Never write “AMRAP” without a time cap.
  - Never write “EMOM” without total minutes.
  - Never write “Tabata” without 20/10 x 8 logic.
- Add concrete examples of acceptable Main Workout and Finisher structures.

5. Add an audit/repair path for existing content
- Update the existing workout repair/audit logic to flag the same missing-structure problems across the workout library.
- Add a focused scan query/report so we can identify all similar issues before making content edits.
- Repair WODs first; library-wide repair can be handled in a controlled second pass to avoid accidental changes to paid content.

6. Validate before finishing
- Run targeted checks against the four flagged WODs after repair.
- Run edge-function tests or targeted validator checks to confirm malformed examples now fail.
- Confirm the database scan returns zero active WODs with missing protocol structure.