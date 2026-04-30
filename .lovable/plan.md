
# Workout Integrity Fix + Future Prevention

## 1. The two errors you saw

**Cadence Blast (Bodyweight WOD)**
- "TABATA 24'" main block is fine arithmetically (6 exercises × 4 min) but per your new rule the number must be removed entirely.
- "TABATA 11'" finisher is mathematically impossible (Tabata = 4 min per exercise, so 3 exercises = 12 min, never 11).
- Two exercise lines have broken syntax: `{{exercise:0725:single arm push-up}}20 sec interval)` — stray text after the `}}` and an orphan closing parenthesis.

**Velocity Compass Blitz (Equipment WOD)**
- "Finisher (15-minute EMOM)" lists Minute 1, Minute 2, Minute 3 — and then a 4th bullet for chin-ups with no minute label and a confused "Complete 5 rounds" tail. The intent is a 5-minute pattern repeated 3× (= 15 min EMOM), but the structure was broken.

## 2. Library-wide audit results (371 visible workouts)

| Bug | Count | Description |
|-----|-------|-------------|
| Stray text after `{{exercise:...}}` token | 40 | e.g. `}}20 sec interval)`, `}} - 30 seconds`, `}}, and upper back...` |
| Stray orphan `)` after token | 2 | broken parenthesis pairs |
| Tabata header with embedded duration | 31 | `TABATA 24'`, `TABATA 11'`, `TABATA 5'`, `TABATA 8'` etc. — must all be removed |
| EMOM with explicit `Minute N:` labels | 23 | need verification that minute count = stated EMOM duration and no orphan trailing exercises |

## 3. Immediate fix — Today's two WODs

**Cadence Blast**
- Rename header `Main Workout (TABATA 24')` → `Main Workout (TABATA)`.
- Rename header `Finisher (TABATA 11')` → `Finisher (TABATA)`.
- Clean the two broken exercise lines (remove stray `20 sec interval)` text, since the Tabata protocol already defines the interval).
- Rewrite the Instructions field to explain Tabata clearly:
  > **Tabata protocol:** Each exercise = 8 rounds × (20 seconds work + 10 seconds rest) = 4 minutes per exercise. Move to the next exercise without extra rest. Push to maximum effort during the 20-second work intervals.

**Velocity Compass Blitz**
- Restructure the 15-minute EMOM finisher into a clean, repeating 5-minute pattern:
  - Minute 1: 15 battling ropes
  - Minute 2: 10 jack burpees
  - Minute 3: 20 jump ropes
  - Minute 4: 8 chin-ups
  - Minute 5: rest
  - Repeat 3 rounds = 15 minutes
- Update Instructions to explain EMOM:
  > **EMOM (Every Minute On the Minute):** At the start of each minute, perform the prescribed reps as fast as possible. Use the remainder of the minute as rest. The next minute starts on the clock regardless of how long you took.

## 4. Library-wide content cleanup (one-shot script)

Build a Deno-based admin edge function `repair-workout-content` that performs a controlled sweep over all 371 workouts:

1. **Strip Tabata duration**: regex replaces `TABATA\s*\d+'` → `TABATA` inside section headers. Same for `Tabata 24'` etc.
2. **Strip stray post-token text**: detects `}}<non-html-text>` and either:
   - removes pure noise like `}} - 30 seconds`, `}}20 sec interval)`,
   - keeps legitimate continuations like `}} (left side)` after manual review (script flags those for admin review instead of auto-deleting).
3. **EMOM coherence check**: counts `Minute N:` labels per EMOM block and compares with the stated minute count in the header. Mismatches are flagged in an admin report (not auto-fixed because the correct rep scheme is editorial).
4. **Auto-inject default Instructions** for any workout whose format is TABATA / EMOM / AMRAP / FOR TIME / CIRCUIT and whose `instructions` field doesn't already explain that protocol. Standard text comes from a shared `protocol-explanations.ts` module.
5. Writes a `workout_repair_log` row per workout listing: bugs found, auto-fixes applied, items flagged for human review.

Result: every existing workout gets cleaned, and you get one admin report listing the small subset (EMOM rep mismatches, ambiguous post-token text) that needs your eyes.

## 5. Future prevention — multi-layer guardrails

This is the part that matters most. We layer 4 independent guards so a bad workout cannot reach you again.

**Layer 1 — Prompt hardening** (`generate-workout-of-day`, `wod-generation-orchestrator`, manual workout generator)
- Add a `STRUCTURAL_RULES` block at the top of the system prompt:
  - Never write a number after TABATA / EMOM / AMRAP in the section header. The protocol explanation belongs in the Instructions field, not the content.
  - For EMOM: every minute from 1 to N must be labelled, in order, with no orphan exercises after the last minute. If a pattern repeats, write the pattern once and append "Repeat X rounds = N minutes".
  - Never write any text on the same line after `{{exercise:ID:Name}}`. Modifiers (reps, sides, weight) must be written before the token, not after.
- Add a worked example for each format showing correct vs. forbidden patterns.

**Layer 2 — Post-generation structural validator** (`_shared/section-validator.ts` extension)
- New `validateProtocolBlocks(html, format)` function runs after the existing density/section validators.
- Rejects (forces regeneration) if it detects:
  - `TABATA\s*\d+`, `EMOM\s*\d+'` style numbers inside headers,
  - `}}\S` or `}}[^<\s]` patterns (stray characters glued to a token),
  - EMOM block where labelled minutes ≠ stated duration,
  - Tabata block where exercise count × 4 ≠ implied total when a duration somehow survives.
- Same retry budget as existing reliability layer (per memory `wod-generation-reliability-and-integrity`).

**Layer 3 — Auto-Instructions injector**
- After successful generation, if the workout format is TABATA/EMOM/AMRAP/FOR TIME/CIRCUIT and the Instructions field doesn't already explain the protocol, prepend the canonical explanation from `protocol-explanations.ts`. This guarantees every protocol workout always teaches the user the format.

**Layer 4 — Pre-publish gate**
- The all-or-none publishing rule (per memory `wod-all-or-none-publishing`) gets a structural check added: if either WOD variant fails the new validator after retries, neither is published and you get a Slack/dashboard alert instead of broken content going live.

## Files to add / edit

- `supabase/functions/_shared/protocol-explanations.ts` (new)
- `supabase/functions/_shared/section-validator.ts` (extend with `validateProtocolBlocks`)
- `supabase/functions/generate-workout-of-day/index.ts` (prompt rules + validator hook + auto-instructions)
- `supabase/functions/wod-generation-orchestrator/index.ts` (gate + alert)
- `supabase/functions/repair-workout-content/index.ts` (new one-shot library cleaner)
- New table `workout_repair_log` (id, workout_id, bugs_found jsonb, fixes_applied jsonb, flagged_for_review jsonb, run_at)
- Direct SQL fix for the two WODs today

## Memory to save after approval

- `mem://content-creation/protocol-block-formatting-standard` — Never embed durations in TABATA/EMOM/AMRAP headers, never trail text after `}}`, every protocol workout must include Instructions that explain the protocol.
