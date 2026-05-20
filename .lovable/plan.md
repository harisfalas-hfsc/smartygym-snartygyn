## Smarty Coach Welcome Popup — 4 fixes

### 1. Welcome popup already IS the Smarty Coach — verify behavior

The welcome popup (`SmartyCoachWelcomePopup`) already renders `SmartyCoachModal` with `initialPath="menu"`. Clicking **"Start a Workout"** triggers `handleMenuSelect('workout')` which switches into the full question flow (mood → energy → focus → duration → equipment → result). Same for **"Start a Program"** and **"Upgrade My Knowledge"**.

No code change needed here — the behavior the user wants already exists. I will simply confirm in the response that pressing any menu card from the welcome popup behaves identically to pressing the Smarty Coach floating button.

### 2. Remove all "we don't have…" phrasing — always frame results positively

Two files contain the negative lead-in lines. Replace them with confident, positive framing, and soften the per-criterion fallback lines so they never start with "No …" or "doesn't".

**`src/utils/smarty-coach/suggestionEngine.ts`** (line 158)
- Replace `"We don't have a workout matching every choice you made — this is the closest professional fit."`
- With `"This is the best-fit workout for your mood, energy and focus right now — hand-picked from the library."`
- Line 162: change `"No exact ${goalLabel} session was available — this ${cat} workout delivers similar training benefits."` → `"This ${cat} workout aligns with your ${goalLabel} focus and delivers the same training stimulus."`
- Line 167: change `"Difficulty is X — closest available to your energy level."` → `"Difficulty is X — well-suited to your current energy level."`
- Lines 172–173 (duration fallbacks): rephrase without "you have X" comparison wording — e.g. `"Runs ${itemDuration} minutes — leaves room for warm-up or cool-down."` / `"Runs ${itemDuration} minutes — easy to trim the last circuit if needed."`
- Line 179 (equipment fallback): change `"Normally uses equipment — most movements can be substituted with bodyweight versions."` → `"Every movement can be done bodyweight-only — fully adapted to your setup."`

**`src/utils/smarty-coach/programSuggestionEngine.ts`** (line 153)
- Replace `"We don't currently have a program that matches every choice you made — this is the closest professional fit available."`
- With `"This is the best-fit program for your goal, level and timeline — selected from the full library."`
- Line 158: change `"No ${goalLabel} program fits all your other criteria, so we picked a ${cat} program — it delivers similar training benefits and supports the same outcome."` → `"This ${cat} program supports your ${goalLabel} goal and delivers the same long-term outcome."`
- Line 164: change `"Difficulty is X — the closest level available; you can scale intensity…"` → `"Difficulty is X — appropriate for your level; intensity is easy to scale up or down."`
- Lines 171–173 (duration fallbacks): rephrase to drop "you asked for X" — e.g. `"This is a ${itemWeeks}-week program — repeat the cycle to extend it, or progress into a longer plan afterwards."` / `"This is a ${itemWeeks}-week program — gives you extra room for progressive overload."`
- Line 180 (equipment fallback): change to `"All movements can be substituted with bodyweight progressions — fully adapted to your setup."`

**Empty-result fallbacks** (when 0 content rows in DB)
- `src/components/smarty-coach/SmartyCoachModal.tsx` line 542: change `"No workouts available to suggest at the moment."` → `"We're refreshing the library right now — try the Workout of the Day or explore our programs in the meantime."`
- `src/components/smarty-coach/ProgramSuggestionFlow.tsx` line 188: same positive rephrasing for programs.
- `src/components/smarty-coach/KnowledgeSuggestionFlow.tsx` line 162: same for articles.

### 3. Add "I'm always available" footer to the modal

In `src/components/smarty-coach/SmartyCoachModal.tsx`, add a small footer band inside `DialogContent` (after the menu grid AND after the question/result content — i.e. once at the bottom of the dialog so it shows on every screen). Content:

> 💬 I'm always here for you — tap the **Smarty Coach** button anytime to get help.

Styling: muted background strip (`bg-muted/30 border-t border-border`), small text, centered, with a brain/sparkles icon. Visible in both menu mode and inside the flows. Mobile-safe (wraps, padded for safe area).

### 4. First-visit + first-login trigger — verify it fires on login

Current logic in `SmartyCoachWelcomePopup.tsx`:
- On mount: shows once per anonymous browser session OR once per signed-in session per user id (`sessionStorage`).
- On `SIGNED_IN` auth event: re-triggers IF the new uid differs from `lastUserIdRef`.

Issue the user hit: they were anonymous → popup shown → key `smarty-welcome-shown-anon` set → then signed in → `onAuthStateChange` fires `SIGNED_IN` with new uid → modal SHOULD re-open with the user-specific key. This already works in code, but to be safe I will:

- Confirm the `SIGNED_IN` branch always calls `tryShow(uid)` even if the user already saw the anon popup this session (it does — anon key is separate from user key).
- Add a small additional guard: clear `lastUserIdRef` on initial mount so the very first `SIGNED_IN` event (which fires shortly after page load when restoring a session) is treated as a transition and triggers the popup once per session per user — but only if the user hasn't seen it yet for that user id.
- Leave the permanent `NEVER_KEY` opt-out untouched (users who closed it forever stay opted out).

No DB or auth changes — purely client logic refinement.

### Files touched
- `src/utils/smarty-coach/suggestionEngine.ts` — positive rewording
- `src/utils/smarty-coach/programSuggestionEngine.ts` — positive rewording
- `src/components/smarty-coach/SmartyCoachModal.tsx` — empty-state copy + "always available" footer
- `src/components/smarty-coach/ProgramSuggestionFlow.tsx` — empty-state copy
- `src/components/smarty-coach/KnowledgeSuggestionFlow.tsx` — empty-state copy
- `src/components/smarty-coach/SmartyCoachWelcomePopup.tsx` — small SIGNED_IN trigger refinement

No backend, Stripe, or schema changes.
