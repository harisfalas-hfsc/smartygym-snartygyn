## About Smarty Gym page — two small fixes

### 1. Smarty Tools section — add Workout Timer

In Section 6 ("Smarty Tools"), the "What's Inside" grid currently lists 5 tools but is missing the Workout Timer (which is actually the first/most-used tool).

Add a 6th entry to the grid (between 1RM Calculator and the rest, as the first item) using the existing `Timer` icon (already imported) and a blue accent color, matching the visual style of the other rows:

- Workout Timer
- 1RM Calculator
- BMR Calculator
- Macro Tracking Calculator
- Calorie Counter
- Rounds Tracker

No other changes to that section.

### 2. Plans section — make Gold and Platinum cards clickable

Currently the two plan cards are static and the user has to scroll down to extra buttons ("View All Plans" / "Start Your Plan") to subscribe.

Change to:

- Wrap each plan card (Gold and Platinum) in a clickable container with hover state (cursor-pointer, subtle lift/shadow on hover, focus ring for accessibility).
- On click:
  - If the user is **already premium** (`userTier === "premium"` from `useAccessControl`) → navigate to `/userdashboard` (same destination as the "Already Premium" flow).
  - If the user is **not logged in** → navigate to `/auth` with intent to subscribe.
  - Otherwise → call the existing `create-checkout` edge function with the matching `STRIPE_PRICE_IDS.gold` or `STRIPE_PRICE_IDS.platinum` (same pattern used in `src/pages/SmartyPlans.tsx` and `JoinPremium.tsx`) and redirect to the returned Stripe checkout URL.
- Show a small loading state on the clicked card while the checkout session is being created.
- Add a hint line ("Click to subscribe" or "✓ Your plan" for premium users) so the affordance is clear.
- Remove the redundant "View All Plans" and "Start Your Plan" buttons from the "Want to Try Before You Subscribe?" block. Keep "Browse Workouts" and "Browse Programs" since those serve a different purpose (standalone purchases).

### Technical notes

- File touched: `src/pages/AboutSmartyGym.tsx` only.
- Reuse: `STRIPE_PRICE_IDS` from `@/config/pricing`, `supabase.functions.invoke('create-checkout', ...)`, `useAccessControl`, `useNavigate`, `useToast`.
- No backend, schema, or pricing changes. No changes to any other page.
- Scope is global (any visitor to /about benefits automatically — no per-page rollout needed).
