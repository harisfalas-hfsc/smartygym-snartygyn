
Goal (non-negotiable formatting rules)
- For every workout (existing + future WODs + future prompted workouts) and training program sessions:
  1) 4 sections: 🔥 Warm Up, 💪 Main Workout, ⚡ Finisher, 🧘 Cool Down
  2) Every exercise line is a bullet (ul/li with TipTap classes)
  3) No blank line after a section title (title → first bullet immediately)
  4) Exactly ONE blank line between sections (and only between sections)
  5) No extra spacing between bullet items
  6) Single icon only (no duplicates)
  7) Double quotes for HTML attributes

Why it’s broken right now (confirmed from your DB)
- The Iron Will / “Ultimate Crucible” workout (id: CH-003) currently has an empty paragraph immediately after section titles, e.g.
  <p>🔥 …</p><p></p><ul>…</ul>
  That “<p></p>” is exactly the unwanted extra space between the header and the first exercise.
- Some workouts also have “exercise text” sitting outside bullet lists (plain <p> lines), which creates inconsistent spacing and forces scrolling.
- The current repair function only converts paragraphs to bullet lists if the workout contains NO <ul>/<li> at all, so mixed-content workouts remain partially broken.
- The current audit function does not detect spacing problems (blank after header, missing separator between sections, multiple separators).

What I will change (implementation design)
A) Backend repair: rewrite the formatter to a strict “Gold Standard v3” normalizer
- File: supabase/functions/repair-content-formatting/index.ts
- Add a deterministic normalization pipeline that:
  1) Canonicalizes empty paragraphs:
     - Normalize all empty paragraphs to exactly: <p class="tiptap-paragraph"></p>
     - Remove leading/trailing empty paragraphs.
  2) Fixes header markup:
     - Remove accidental whitespace like <strong> <u> → <strong><u>
     - De-duplicate icons (keep exactly one icon per header).
  3) Enforces “no blank after section title”:
     - Remove any empty paragraph immediately following a section header:
       header + empty p + ul  → header + ul
       header + empty p + p   → header + p (but p will be bulletized next)
  4) Enforces “exactly one blank line between sections”:
     - For any transition where the next block is a section header (🔥/💪/⚡/🧘):
       ensure there is exactly one <p class="tiptap-paragraph"></p> right before it (except the first header).
     - Remove extra separators (2+ becomes exactly 1).
  5) Bulletizes all exercise lines (even in mixed-content workouts):
     - Convert stray exercise paragraphs between section headers into <li class="tiptap-list-item"><p class="tiptap-paragraph">…</p></li>
     - If a paragraph contains multiple exercises separated by “ - ” (common in your data), split into multiple bullets when safe:
       Example: “20 Mountain Climbers - 15 Air Squats - 10 Push-ups” → 3 bullet items
     - Merge into the nearest section list if one exists; otherwise create a new <ul class="tiptap-bullet-list">.
  6) List normalization:
     - Ensure every <ul> has class tiptap-bullet-list and every <li> has tiptap-list-item.
     - Ensure paragraphs inside list items are class tiptap-paragraph.
  7) Output shape alignment:
     - Update the function response fields to match what the Admin “ContentFormattingAudit” UI expects (iconsAdded/sectionsAdded/listsNormalized/quotesFixed), while still tracking spacing fixes internally.
- Add “dryRun” and “targetId” support:
  - dryRun=true returns before/after preview + stats without writing to DB (so we can validate on Iron Will first with zero risk).
  - targetId lets us repair only CH-003 first, then batch repair all.

B) Backend audit: extend audit to detect spacing/structure violations
- File: supabase/functions/audit-content-formatting/index.ts
- Add checks for:
  - “Blank after section title” (header immediately followed by empty paragraph)
  - “Missing separator between sections” (header follows content without the single empty paragraph)
  - “Multiple separators between sections” (2+ empty paragraphs between icon headers)
  - “Exercise paragraphs outside bullet lists”
- This gives you a truthful report that matches what you see on screen.

C) Frontend rendering safety (so visuals always match your template)
Even with perfect HTML, Tailwind Typography (“prose”) can add margins. We will hard-lock workout spacing only inside workout display.
- File: src/index.css
  - Add high-specificity overrides that beat the typography plugin:
    - .workout-content .prose p { margin: 0 !important; }
    - .workout-content .prose ul { margin: 0 !important; }
    - .workout-content .prose li { margin: 0 !important; }
    - .workout-content p.tiptap-paragraph:empty { height: 0.75rem !important; min-height: 0.75rem !important; }
  - This guarantees:
    - zero spacing between bullets
    - one consistent “section gap” only from the empty paragraph separator
- File: src/components/WorkoutDisplay.tsx
  - Replace the current join("…<p></p>…") with a helper that ensures exactly one separator between different DB fields without ever creating double separators:
    - Trim trailing empty <p> from the previous block
    - Trim leading empty <p> from the next block
    - Insert exactly one <p class="tiptap-paragraph"></p> between blocks
  - This prevents “double blank lines” when content is split across warm_up/main_workout/finisher/cool_down columns.

D) Training programs (existing + future)
1) Existing programs: normalize “weekly_schedule” and “program_structure” fields to the same bullet/spacing rules (no random paragraph gaps, bulletize exercise lines).
- Extend repair-content-formatting to also process admin_training_programs fields.
2) Future program generation:
- File: supabase/functions/generate-training-program/index.ts
- Update the program output template so each session/day uses the same 4-section icon structure and bullet rules you require (and the same separator rules).
  - Day header stays, but inside each day the workout body uses the same 🔥/💪/⚡/🧘 sections and bullet lists.

Execution steps (exact sequence)
1) Safety backup (test environment)
- Create a backup table for content (schema change + insert copy) so we can restore if needed.
  - Backup admin_workouts.main_workout and key program fields before re-repairing.

2) Fix Iron Will first (zero-risk validation)
- Run repair-content-formatting with:
  - targetId="CH-003"
  - dryRun=true → verify the produced HTML removes:
    - the blank line after section headers
    - any non-bulleted exercise paragraphs
    - preserves exactly one blank line between sections
- Then run targetId="CH-003" with dryRun=false to write.

3) Batch repair all workouts
- Run in batches (50 at a time) until complete.
- Re-run the enhanced audit to confirm:
  - 0 “blank after title”
  - 0 “missing section separator”
  - 0 “extra separators”
  - 0 “exercise outside bullet lists”

4) Repair training programs
- Apply the same repair rules to program fields (weekly_schedule/program_structure).
- Re-run audit.

5) Ensure future content is locked to the standard
- WOD generation: confirm the template already produces bullets + one separator between sections + no blank after headers; keep it enforced.
- Training program generation: update output format to the same standard.
- Any other AI workout creation paths: scan and align prompts if they output workout HTML.

Verification (mandatory before I say “done”)
- Visual checks with screenshots:
  - CH-003 (Iron Will / Ultimate Crucible): header immediately followed by bullets; exactly one section gap; no bullet gaps.
  - A “Crucible …” WOD example: confirm section gaps exist (Warm Up → Main → Finisher → Cool Down).
  - 3 random workouts across categories.
  - Mobile + desktop + dark mode.
- Data checks:
  - Confirm repaired HTML does not contain:
    - <p class="tiptap-paragraph"></p> directly after a section header
    - multiple consecutive empty paragraphs
    - exercise paragraphs outside <ul>/<li> blocks (unless they’re intentionally non-exercise notes; in your current requirement, we will bulletize them too).

What this will immediately fix for your two example failure modes
- “Unnecessary spaces between Warm Up title and first exercise”: removed at the source by deleting the empty <p></p> after headers (and CSS margin overrides as a backstop).
- “No spaces between sections”: enforced by inserting exactly one canonical empty paragraph between icon headers everywhere, even when missing today.

Scope note (to meet your instruction “fix all existing” without inventing content)
- This repair normalizes formatting and structure from the content that already exists.
- If any workout truly lacks a section entirely (no finisher content at all), the repair will NOT fabricate exercises. Instead it will:
  - either preserve the missing section and flag it in the audit as missing,
  - or (if you want strict 4-section presence regardless) insert an empty section header with an empty bullet list as a placeholder.
  In your current database audit, missingSections is already 0, so this should not be a blocker for workouts; it’s mainly a safeguard.

Files I will modify in implementation mode
- supabase/functions/repair-content-formatting/index.ts
- supabase/functions/audit-content-formatting/index.ts
- src/index.css
- src/components/WorkoutDisplay.tsx
- supabase/functions/generate-training-program/index.ts (for future program consistency)

Rollout expectation
- Iron Will fix will be visible immediately after the single-target repair runs.
- Full library repair will be done in batches to avoid timeouts and to keep the process observable and verifiable.
