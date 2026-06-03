## Goal

Restrict the Community **Leaderboard** (which exposes real names) to users who can actually compete in it, while keeping comments and ratings fully accessible.

## Access matrix (Community page)

| Section | Guest | Free subscriber (no purchase) | Subscriber with standalone purchase | Premium |
|---|---|---|---|---|
| Comments | ✅ read & (signed-in) post | ✅ | ✅ | ✅ |
| Ratings (top-rated workouts/programs) | ✅ | ✅ | ✅ | ✅ |
| **Leaderboard** | 🔒 locked card | 🔒 locked card | ✅ | ✅ |

Rationale:
- Comments + ratings are content discovery — same tier as blog / exercise library (everyone).
- Leaderboard publishes real display names and is a competition. Only users who can earn entries (premium, or subscribers who unlocked interactions via a standalone purchase) should see it.

## Implementation

1. **`src/pages/Community.tsx`**
   - Compute `canViewLeaderboard` from `useAccessControl`:
     - `userTier === "premium"` → true
     - `userTier === "subscriber"` AND `purchasedContent.size > 0` → true
     - otherwise → false
   - When false, replace the Leaderboard card body (desktop column + mobile carousel slot) with a locked-state card:
     - Lock icon + title "Leaderboard"
     - Copy: "The leaderboard is reserved for premium members and customers with purchased workouts or programs."
     - Primary CTA → `/premiumbenefits` ("View Premium Plans")
     - Secondary CTA (guests only) → `/auth` ("Log In / Sign Up")
   - Skip the `get_*_leaderboard` RPC calls when `canViewLeaderboard` is false (saves a round-trip + avoids leaking names via devtools).
   - Keep the same card height ref logic so mobile carousel heights still match.

2. **No DB / RLS changes needed.**
   The leaderboard RPCs only return aggregated counts + display name; gating is purely UX. We do NOT revoke the EXECUTE grants from the previous migration — ratings still need them, and aggregate counts are not sensitive on their own. The display-name exposure is what we're hiding behind the UI gate.

3. **No changes to comments or ratings** — they stay public as you specified.

## Files touched

- `src/pages/Community.tsx` (only)

## Out of scope

- Changing what content a standalone purchase unlocks (already correct: full interactions on the purchased item).
- Touching the `workout_interactions` / `program_interactions` RLS — server-side rules already restrict writes to the owning user.
