
Goal
- Make every exercise clearly separated with bullet points across:
  - Existing workouts (including “Iron Will Endurance Test”)
  - Existing training programs
  - All future AI-generated Workouts of the Day (WODs)
  - All future AI-generated workouts and training programs
- Ensure all workout sections show with icons:
  - 🔥 Warm-Up (and 🔥 Activation / Soft Tissue Prep when present)
  - 💪 Main Workout
  - ⚡ Finisher
  - 🧘 Cool-Down
- Ensure consistency so you never have to randomly check hundreds of items again.

What I found (from the database + frontend rendering)
1) “Iron Will Endurance Test” currently has:
   - 💪 title line already present
   - Lists are stored as plain HTML <ul><li>…</li></ul> (no TipTap classes)
   - warm_up / activation / finisher / cool_down columns are NULL, and the workout content itself does NOT include Warm-Up/Finisher/Cool-Down sections.
2) Your current CSS bullet fix only targets TipTap lists:
   - It styles .tiptap-bullet-list / .tiptap-list-item
   - But many workouts (like Iron Will) have <ul><li> WITHOUT those classes
   - Tailwind’s base reset removes list markers unless we explicitly restore them, so these “plain <ul>” lists appear as text with no bullets.
3) The “missing warm-up/cool-down” problem is data/formatting:
   - Many workouts are stored as “main_workout-only” content and rely on section headers inside that HTML.
   - If a workout was created without Warm-Up/Finisher/Cool-Down sections, the UI will not “invent” them (by design).

Non-negotiable outcomes (your orders)
A) Bullets must visibly show for every exercise item.
B) Warm-Up / Main Workout / Finisher / Cool-Down must exist and have icons for every workout (existing + future).
C) No manual checking: we’ll implement an audit + repair pipeline that proves “everything is fixed”.

Implementation approach (no guessing; this is a measurable audit → repair → audit loop)
Part 1 — Fix bullet rendering for ALL lists (not only TipTap lists)
- Update src/index.css so ANY <ul>/<ol> inside rendered workout/program content shows markers.
- Specifically target the content wrapper class you already use: .text-display
- Add styles for:
  - .text-display ul { list-style: disc; padding-left: …; }
  - .text-display ol { list-style: decimal; padding-left: …; }
  - .text-display li { display: list-item; margin: …; }
- Result: Iron Will’s existing <ul><li> will immediately show bullets, and so will any older content that doesn’t include TipTap classes.

Part 2 — Create a backend “Formatting Audit” function (so you never have to manually inspect again)
- Add a backend function (admin-only) that scans:
  - admin_workouts fields: main_workout, warm_up, activation, finisher, cool_down
  - admin_training_programs fields (at minimum): weekly_schedule, program_structure (and any other HTML content columns used for program display)
- It will compute and return:
  - Total scanned
  - Count missing each required section (Warm-Up, Main, Finisher, Cool-Down)
  - Count missing section icons
  - Count where exercises are not in bullet lists (detect patterns like <br>1. …, “• …”, or consecutive paragraphs that look like exercise lines)
  - A “top offenders” list (IDs + names) so we can confirm it includes Iron Will and any other broken ones.

Part 3 — Create a backend “Formatting Repair” function that fixes EVERYTHING in batches
Why a backend repair function (instead of one huge SQL regexp):
- SQL regexp is too fragile for the variety of HTML patterns you have.
- A repair function can:
  - Parse/normalize safely
  - Apply consistent transformations
  - Produce a detailed report of exactly what it changed

Repair rules for workouts
1) Ensure required section structure exists
   - If a workout is missing Warm-Up/Finisher/Cool-Down sections in its content:
     - We will inject the missing sections INTO the workout HTML (main_workout) using professional, consistent templates.
     - The existing “main” content (e.g., “For Time” + rounds) will be preserved under 💪 Main Workout.
   - For “Iron Will Endurance Test” specifically:
     - Wrap existing for-time + rounds under 💪 Main Workout
     - Add 🔥 Warm-Up (short, appropriate warm-up)
     - Add ⚡ Finisher (short, safe, challenge-appropriate finisher)
     - Add 🧘 Cool-Down (recovery-focused)
2) Ensure icons are present on every section header
   - Add/normalize:
     - 🔥 for Warm-Up / Activation / Soft Tissue Prep
     - 💪 for Main Workout
     - ⚡ for Finisher
     - 🧘 for Cool-Down
   - Handle all header HTML variants:
     - <strong><u>…</u></strong>, <strong>…</strong>, <b>…</b>, headings, etc.
3) Ensure every exercise is a bullet item
   - Convert these patterns into proper bullet lists:
     - Plain <ul><li> without TipTap classes → add TipTap classes + wrap li text in <p class="tiptap-paragraph">
     - “• Exercise” lines inside paragraphs → convert to <ul class="tiptap-bullet-list">…
     - Numbered “1. Exercise<br>2. Exercise…” → convert to bullet list items (numbers removed or preserved depending on pattern; default: preserve the exercise text, drop the numeric prefix)
     - Paragraph-per-exercise blocks where each line looks like an exercise → group into <ul> automatically
4) Normalize HTML attribute quoting + your formatting standards
   - Convert class='tiptap-paragraph' to class="tiptap-paragraph"
   - Ensure no leading empty paragraphs
   - Keep the existing “professional spacing rules” (blank paragraphs only between major sections, not between list items)

Repair rules for training programs
- Convert exercise listings that currently appear as:
  - inline “• …” or “1. …<br>2. …” inside <p>
  into:
  - <ul class="tiptap-bullet-list"><li class="tiptap-list-item"><p class="tiptap-paragraph">…</p></li></ul>
- Add section icons when program content contains those sections (Warm-Up/Main/Finisher/Cool-Down).
- For programs that don’t currently contain those sections at all, we will enforce the same “sectioned workout blocks” when the program includes “daily workouts” content that should be presented like workouts.

Batching + safety
- The repair function will run in batches (e.g., 25 items per call) to avoid timeouts.
- Each run returns:
  - how many rows updated
  - exactly which IDs were modified
  - what changes were applied (counts per fix type)
- We’ll run it repeatedly until the audit reports “0 missing”.

Part 4 — Lock it in for future AI generation (so this never reappears)
- Update the AI generation instructions in the WOD generator so it ALWAYS outputs:
  - All 4 sections with icons
  - Bullet lists using TipTap classes
  - Double quotes for HTML attributes (your standard)
- Remove/replace any “example JSON” in prompts that still shows single-quoted HTML attributes, because models copy the example formatting.

Verification (proof, not promises)
1) Run “Formatting Audit” before repair and store the numbers.
2) Run “Formatting Repair” in batches until completion.
3) Run “Formatting Audit” again and confirm:
   - 0 workouts missing Warm-Up/Main/Finisher/Cool-Down sections
   - 0 workouts missing icons
   - 0 workouts with non-bulleted exercise blocks
   - Same for training programs
4) Visual verification:
   - Open “Iron Will Endurance Test” and confirm:
     - Warm-Up section visible with 🔥
     - Main Workout visible with 💪
     - Finisher visible with ⚡
     - Cool-Down visible with 🧘
     - Bullets visible under each exercise list
   - Spot-check multiple random workouts and programs (light mode + dark mode; mobile + desktop).

Concrete files/components involved (what will change when you switch me back to implementation mode)
Frontend
- src/index.css
  - Add list-marker styling for .text-display ul/ol/li (covers all legacy HTML, not only TipTap classed lists)

Backend
- Add new backend functions:
  - supabase/functions/audit-content-formatting/index.ts
  - supabase/functions/repair-content-formatting/index.ts
- Update existing backend WOD generator prompt:
  - supabase/functions/generate-workout-of-day/index.ts
- Update whichever backend generator is actually used for AI training program creation in your admin flow (we will locate and update the correct one, not guess).

Why you saw “still nothing”
- The “Iron Will Endurance Test” already contains <ul><li> in the database, but it does not contain the TipTap list classes.
- Your current CSS fix only styles TipTap-classed lists, and Tailwind resets list markers by default.
- So older content using plain <ul> will still appear with no bullets until we add the general .text-display ul/ol list styling.

Immediate priority order (so you see results fast)
1) CSS fix for general <ul>/<ol> in .text-display → bullets start showing instantly across the site.
2) Repair function run on Iron Will first (single-item mode) → you immediately see Warm-Up/Finisher/Cool-Down appear with icons.
3) Full batch repair of all workouts/programs + audit proof that everything is compliant.
