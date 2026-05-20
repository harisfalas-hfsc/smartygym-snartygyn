## Problem

When a logged-out (or non-premium) visitor completes the Smarty Coach flow and presses **Start Workout**, the app navigates to the workout URL, but the auth gate sends them to `/auth` and after login dumps them on `/`. Their whole conversation is lost and they have to start over. Same thing happens if they enter the flow from the floating **Smarty Coach** button.

## Solution (single, simple pattern)

Use the destination URL itself as the "memory". The Smarty Coach already ends with `navigate(getWorkoutUrl(...))`. We just need every auth/paywall gate to **come back to that URL after login**. No need to persist quiz answers — the user is taken straight to the recommended workout/program page, where the paywall (if any) is already shown.

### 1. `/auth` honors a `redirect` query param

`src/pages/Auth.tsx`
- Read `searchParams.get("redirect")`. Default to `/`.
- After successful login / signup / Google / Apple, replace `navigate("/")` with `navigate(safeRedirect)`.
- `safeRedirect` = the param only if it starts with `/` and not `//` (prevents open redirect). Otherwise `/`.
- Pass the same redirect through `emailRedirectTo` and OAuth `redirectTo` as `${origin}/?redirect=<encoded>` — the homepage already has the auth listener, but simpler: keep OAuth `redirectTo` = `${origin}/auth?redirect=<encoded>` so the same logic on /auth fires.

### 2. Gates send users to `/auth?redirect=<currentPath>`

- `src/components/ProtectedRoute.tsx` — change `<Navigate to="/auth" replace />` to include `?redirect=${encodeURIComponent(location.pathname + location.search)}`.
- `src/components/AccessGate.tsx` (both `navigate("/auth")` calls) — same pattern.

### 3. Smarty Coach unchanged, but recommendation works for everyone

`SmartyCoachModal.handleSelectSuggestion` already calls `navigate(getWorkoutUrl(...))`. With (1) + (2) in place:

- **Logged-out user** → workout page → ProtectedRoute redirects to `/auth?redirect=/workout/...` → after login they land on the exact recommended workout.
- **Logged-in free user without premium access** → workout page renders normally; the existing `AccessGate` / `SubscriptionGate` / `PurchaseButton` on that page handles the upsell (subscribe or buy standalone). No extra work needed.
- **Premium user** → workout opens directly. Already works.

### 4. Same fix automatically covers the floating Smarty Coach button

The button opens the same `SmartyCoachModal`, which ends with the same `navigate(...)`. Once (1)+(2) are in place, the button-driven flow gets the same continuity.

## Files touched

- `src/pages/Auth.tsx` — read & honor `redirect` param in all 4 success paths (email login, signup-verified, Google, Apple).
- `src/components/ProtectedRoute.tsx` — append `?redirect=` when bouncing to `/auth`.
- `src/components/AccessGate.tsx` — append `?redirect=` on both signup CTA buttons.

## Out of scope (intentionally)

- Persisting the quiz answers across login. The recommendation is already shown and acted on before the redirect; re-running the quiz post-login isn't needed because the user already chose a specific workout.
- Backend, Stripe, or schema changes.
- Any visual redesign of the modal or gates.

## Technical notes

- `safeRedirect` guard: `redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/'`.
- For OAuth, set `redirectTo: ${origin}/auth?redirect=<encoded>` so the same `/auth` logic runs after the provider round-trip.
- `AvatarSetupDialog` completion path: also forward to `safeRedirect` instead of hard-coded `/`.
