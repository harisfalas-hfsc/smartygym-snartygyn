
Issue recap (validated, not assumed)
- Your complaint is correct: “Center Balance Flow” is still broken.
- I checked the database directly and found at least two records named “Center Balance Flow,” including:
  - `WOD-PIL-E-1770849008078` (still malformed)
  - `WOD-PIL-E-1771713008848` (partially inconsistent)
- In `WOD-PIL-E-1770849008078` I found broken HTML like:
  - malformed `<li ... "hamstring stretch/li>`
  - mixed non-exercise text inside exercise bullets
  - malformed cool-down structure that can render as empty bullets and merged rows.
- Global scope is still not clean:
  - 19 workouts with malformed `<li>` patterns
  - 44 workouts with multi-exercise content inside one bullet row
  - 3 training programs with multi-exercise-in-one-row issues

Do I know what the issue is?
- Yes.

Why previous “fixed all” runs did not truly fix all
1) The admin repair flow still calls `repair-content-formatting`, not the newer bulk consistency function.
2) That repair path is regex-fragile against malformed HTML (broken tags bypass intended split/orphan cleanup).
3) Program repair is not consistently included in admin flow.
4) Audit criteria miss critical corruption signatures (so it can report success while broken bullets remain).

What I will implement after approval
1) Build a strict sanitizer-first repair pass (server-side) before matching
- Parse/repair malformed list markup before exercise relinking.
- Normalize broken `<li>/<p>` structures into valid list nodes.
- Then apply split + orphan cleanup + one-exercise-per-bullet enforcement.

2) Enforce hard rule: one linked exercise per bullet
- For each `<li>`:
  - If it contains multiple `{{exercise:...}}` entries → split into separate `<li>` rows.
  - If it contains non-exercise instruction text in an exercise list → move to paragraph, not bullet.
  - If it contains an exercise not in library → substitute closest valid library equivalent (per your existing rule).

3) Replace/upgrade the bulk repair execution path
- Use one robust function to process all workout HTML fields and all program HTML fields.
- Run full pagination until exhaustion (no partial “batch done” claims).
- Process target-first (Center Balance Flow IDs) then full library.

4) Make the audit truthful
- Add hard checks for:
  - malformed `<li>` syntax
  - multi-exercise rows per `<li>`
  - orphan/empty bullets
  - invalid `{{exercise:id:name}}` references
- Audit must fail if any of these remain.

5) Verification gates before claiming done
- Database proof queries must return zero for:
  - malformed list-item patterns
  - multi-exercise-in-one-li patterns
  - orphan empty bullet patterns
- Spot-check required:
  - both Center Balance Flow IDs
  - current Pilates WOD
  - random sample of repaired workouts and programs
- Only after passing all gates will I report complete.

Execution order (fastest recovery path)
1) Fix both Center Balance Flow records immediately.
2) Run full workout repair to completion.
3) Run full training-program repair to completion.
4) Run strict post-repair audit.
5) Re-check the exact workout route(s) you’re viewing and provide direct before/after proof.

Success criteria
- No empty bullets.
- No “three exercises in one row.”
- Every exercise bullet has exactly one View button.
- All workouts + training programs pass the strict audit.
