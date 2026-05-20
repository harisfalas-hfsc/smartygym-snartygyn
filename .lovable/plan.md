## Goal

Replace the current 3-Day Free Trial popup with a brand-new, visually rich **Smarty Coach Welcome Popup** that greets every visitor — logged-in or not, free, subscriber, or premium — the first time they land on the site (and once again after they log in). It should feel like the first thing your brand says to a person walking in.

---

## 1. Hide the Free Trial popup (no delete)

- In `src/App.tsx`, comment out the `<FreeTrialPopup />` mount (line 178) and add a short comment explaining it's intentionally disabled.
- Keep `src/components/growth/FreeTrialPopup.tsx` and its image asset fully intact so it can be re-enabled later with a one-line change.
- Memory will be updated: the active "first impression" popup is now the Smarty Coach Welcome, not the trial popup.

## 2. New component: `SmartyCoachWelcomePopup.tsx`

Location: `src/components/smarty-coach/SmartyCoachWelcomePopup.tsx`
Mounted globally in `src/App.tsx` (replacing the trial popup's slot).

### Trigger rules (one-time per session)
- Show on **first landing**, ~1.5 s after the page becomes interactive, on any route **except** the same blocked routes already used by the trial popup (`/auth`, `/admin`, `/checkout`, `/payment`, etc.).
- Show **again immediately** after a user logs in or signs up within the same session (detected via Supabase auth state change), so the welcome greets them as their new self.
- Audience: **everyone** — visitors, free users, subscribers, premium. No tier gating.
- Persistence keys in `sessionStorage`:
  - `smarty-welcome-shown-anon` — set after the visitor sees it.
  - `smarty-welcome-shown-user-{userId}` — set after a logged-in user sees it.
  This guarantees "one time per session, plus one time right after login" without ever nagging.
- A small "Don't show again" link sets a longer-lived `localStorage` flag for power users who want it gone.

### Visual design (bright, big, mobile-optimized)
- Built on top of shadcn `Dialog` like the existing Smarty Coach modal, but with a much richer look:
  - Wider container: `max-w-lg` on mobile (`w-[95vw]`), `max-w-2xl` on desktop.
  - Header band with a soft brand gradient (electric blue → deep navy, using existing tokens `--primary` and `--background`), a glowing 🧠 brain icon, and a friendly bounce-in animation.
  - Headline: **"Hi 👋 I'm your Smarty Coach"** (large display weight).
  - Subline: **"How can I help you today?"**
  - 5 large option cards in a single column on mobile, 2-column grid on desktop ≥ `md`. Each card has:
    - Colored circular icon badge (Lucide icon + brand accent).
    - Bold title with an emoji.
    - One-line description.
    - Subtle hover lift + arrow chevron.
- Strictly uses semantic design tokens (no hard-coded colors). Honors light and dark themes.
- Close (X) in the top-right, plus a "Maybe later" text button at the bottom.
- Re-uses the existing `Brain` icon for header continuity with the floating Smarty Coach button.

### The five options (in order)

| # | Title | Icon + emoji | Action |
|---|---|---|---|
| 1 | **Check the Workout of the Day** | `Flame` 🔥 | `navigate('/workout/wod')` |
| 2 | **Start a Workout** | `Activity` 💪 | Open the existing `SmartyCoachModal` pre-set to the `workout` path |
| 3 | **Start a Program** | `Target` 🎯 | Open the existing `SmartyCoachModal` pre-set to the `program` path |
| 4 | **Use a Tool** | `Wrench` 🛠️ | `navigate('/tools')` |
| 5 | **Upgrade My Knowledge** | `BookOpen` 📚 | Open the existing `SmartyCoachModal` pre-set to the `knowledge` path |
| 6 | **Learn More About Smarty Gym** | `Sparkles` ✨ | `navigate('/about-smartygym')` |

Selecting any option closes the welcome popup and either navigates or hands off to the existing Smarty Coach modal — so the brand experience continues seamlessly.

## 3. Rename "Make a Measurement" → "Use a Tool"

In `src/components/smarty-coach/SmartyCoachModal.tsx` (line ~283):
- Change the option label to **"Use a Tool"**.
- Change the description to **"Open Smarty Tools — track weight, body composition, calories, and more."**
- Swap the `Dumbbell` icon for `Wrench` so it visually matches a tool, not a workout.
- The route stays `/tools` (unchanged).

This keeps the floating Smarty Coach button and the new welcome popup consistent.

## 4. Smarty Coach modal handoff

To open the existing `SmartyCoachModal` already on a chosen path (workout / program / knowledge), I'll add a tiny enhancement:
- Add an optional `initialPath?: 'menu' | 'workout' | 'program' | 'knowledge'` prop to `SmartyCoachModal`.
- The internal `useEffect` that resets state on open will respect this prop (defaulting to `'menu'`, preserving current behavior everywhere else).
- The welcome popup renders a single shared `<SmartyCoachModal>` instance it controls, so handoff is instant and doesn't reload data.

## 5. Memory updates

- Update `mem://features/growth/free-trial-popup-standard` to note: popup is intentionally disabled in App.tsx; component preserved for future use.
- Update `mem://features/smarty-coach-system`: add the welcome popup as the first-impression entry point with trigger rules and option list, and record the "Use a Tool" rename.

---

## Technical details (for reference)

```text
src/
├── App.tsx                                    // comment out <FreeTrialPopup />, mount <SmartyCoachWelcomePopup />
├── components/
│   ├── growth/FreeTrialPopup.tsx              // unchanged (kept dormant)
│   └── smarty-coach/
│       ├── SmartyCoachWelcomePopup.tsx        // NEW
│       └── SmartyCoachModal.tsx               // + initialPath prop, rename label, swap icon
```

Session/login trigger logic uses `supabase.auth.onAuthStateChange` to detect `SIGNED_IN` events and re-trigger the popup once per session per user id. No new tables, no edge functions, no schema changes — purely frontend.

## Out of scope

- No changes to subscription, billing, or any paid flow.
- No structural layout changes elsewhere on the site.
- No new translations / copy beyond the popup itself.