## Audit: Standalone-Purchase Subscribers vs. Premium Members

I audited every layer where access is decided: `AccessControlContext`, `AccessGate`, `lib/access-control.ts`, the workout/program detail pages, the interaction widgets (rate/favorite/complete), and `UserDashboard` (Workouts, Programs, Purchases, LogBook, Account tabs).

### 1. What works correctly today

**Content access for purchased items**
- `IndividualWorkout` / `IndividualTrainingProgram` compute `hasAccess = userTier === "premium" || hasPurchased(id, type) || !is_premium`. A subscriber who bought a premium workout/program sees the full content (warm‑up, main, cool‑down, reader mode). ✅
- `AccessGate` (used as a wrapper) also calls `hasPurchased(...)` before showing the upsell card, so purchased premium content is unlocked. ✅

**Interactions on purchased items (favorite / complete / rate / schedule)**
- `WorkoutInteractions` and `ProgramInteractions` call `canInteract("workout"|"program", id)`. In `AccessControlContext.canInteract`, the purchase check (`purchasedContent.has("workout:" + id)`) runs **before** the subscriber fall‑through, so subscribers who purchased the item can rate / favorite / complete it. ✅

**Purchases tab**
- The "My Purchases" tab (`activeTab === "purchases"`) is **not** gated by `isPremium`. Subscribers can see every purchase, click "View Content" and land on the unlocked detail page. Deleted/archived content is shown with a disabled state. ✅

**Premium users**
- Premium users get `userTier === "premium"`, which unlocks every gate (`AccessGate`, `canAccessContent`, `canInteract`). Purchase buttons are hidden everywhere (`userTier !== "premium" && !hasPurchased(...)`). The "My Purchases" empty state correctly says "you have full access to everything as a premium member." ✅
- `PurchaseButton` and the edge function `create-individual-purchase-checkout` both reject premium-user purchase attempts (per `docs/access_rules.md`). ✅

---

### 2. Gaps found (subscribers with standalone purchases)

These are the real problems: a subscriber who paid for one or more workouts/programs is treated as a **second-class user** in the dashboard, even though their purchased items deserve first-class tracking.

**Gap A — "Workouts" tab is fully premium-gated** (`UserDashboard.tsx` line 1187)
```
{!isPremium ? <Crown upsell card> : <Favorites/Completed/Viewed/Rated stats + lists>}
```
A subscriber who completed and rated a workout they **purchased** sees only the upsell. Their own activity for paid content is invisible.

**Gap B — "Programs" tab is fully premium-gated** (line 1315)
Same pattern. A subscriber who bought a training program cannot see their progress, favorites, or completion status for it.

**Gap C — "My LogBook" tab is fully premium-gated** (line 1547)
The whole logbook (workout activity stats, calendar, charts, MyRecordsReport) is hidden behind `!isPremium`. A purchased subscriber has no place to review the activity history of the content they paid for.

**Gap D — Check-in / banner system is `isPremium`-only** (lines 763, 766)
Minor — purchased subscribers don't get check-in banners. Probably intended (check-ins are a premium feature) but worth confirming.

**Gap E — `canAccessContent("workout"|"program", id)` always returns true for subscribers** (`AccessControlContext.tsx` line 260-266)
This is a **soft** issue: the function returns `true` for any subscriber on workout/program types, relying on `AccessGate` to do the real `is_premium` DB check at the page level. It works because every detail page is wrapped by `AccessGate`, but it means anything that uses `canAccessContent` directly without `AccessGate` would be over-permissive. Worth a code comment / tightening.

**Gap F — `canInteract` purchase key vs. content-type label**
`WorkoutInteractions` passes `contentType = isFreeContent ? "free-workout" : "workout"`. For free content the purchase lookup key becomes `"free-workout:<id>"`, which can never match (purchases are stored as `"workout"`). It happens to work because subscribers are allowed to interact with `"free-workout"` anyway, but the lookup is dead code for free content and should be normalized.

---

### 3. Recommended fix (scope of this plan)

Restrict the premium gate on the dashboard so it only blocks **users who have nothing to track**, and let subscribers with active purchases use the same UI for their purchased content.

Concrete changes (UI/presentation only, no business‑rule changes):

1. **`UserDashboard.tsx` — "Workouts" tab**
   - Change the gate from `!isPremium` to `!isPremium && validPurchases.filter(p => p.content_type === "workout").length === 0`.
   - When a subscriber-with-purchases enters, scope the lists (`favoriteWorkouts`, `completedWorkouts`, `viewedWorkouts`, `ratedWorkouts`) to only IDs that appear in their `purchases` set, so they don't see a hint of premium content they didn't buy.
   - Show a soft banner above the stats: "Showing activity for your purchased workouts. Upgrade to Premium to unlock all workouts."

2. **`UserDashboard.tsx` — "Programs" tab**
   - Same pattern with `content_type === "program"`. Filter `programInteractions` to purchased program IDs only.

3. **`UserDashboard.tsx` — "My LogBook" tab**
   - Same pattern: allow access if `isPremium || validPurchases.length > 0`.
   - Inside the logbook, scope workout/program rows to purchased IDs for non-premium users; keep MeasurementDialog / MyRecordsReport (these are user-owned data, not content gating, so they're safe to show to any logged-in user).
   - Keep the upsell banner visible for non-premium users so the upgrade path is still obvious.

4. **`AccessControlContext.tsx` — `canInteract` cleanup**
   - Normalize `contentType` for the purchase lookup: always use `"workout"` / `"program"` for the key, regardless of the free/paid label. Prevents the dead-code lookup in (F) and removes a subtle source of bugs if interaction widgets ever drop `AccessGate`.

5. **`AccessControlContext.tsx` — `canAccessContent` comment / hardening**
   - Add an explicit code comment that `"workout"` / `"program"` results MUST be re-checked by `AccessGate` against `is_premium`, OR move the DB check into `AccessGate` exclusively (the current behavior). No runtime change required if every detail page is wrapped — they are today.

6. **No backend changes** — RLS / `user_has_purchased_content` / `user_has_active_premium_access` already model this correctly. The bug is purely in the dashboard's UI gates.

### 4. Out of scope (explicitly not changing)

- Premium-only features that purchased subscribers should NOT get: Check-ins, Smarty Ritual, Daily WOD generation, Goals, full library access. These remain `isPremium`-only.
- `PurchaseButton` / `create-individual-purchase-checkout` premium-rejection logic — already correct.
- Stripe rename rules and product IDs — out of scope per existing memory.

### 5. Verification checklist after fix

- Subscriber with 1 purchased workout: sees that workout in Workouts tab favorites/completed/rated lists, can rate it (already works), can view it (already works), and it appears in LogBook calendar.
- Subscriber with 1 purchased program: same for Programs tab + LogBook.
- Subscriber with 0 purchases: still sees the upgrade card in Workouts / Programs / LogBook tabs (no regression).
- Premium user: sees everything (no regression).
- Guest: still redirected by `ProtectedRoute` (no regression).
