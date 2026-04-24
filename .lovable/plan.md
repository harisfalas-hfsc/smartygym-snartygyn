## Goal

Show the landing page once per browser tab session, regardless of login status. After the visitor uses it (or navigates away), they go straight to `/home` for any reload or in-tab navigation. Closing the tab and opening a new one to `smartygym.com` shows the landing page again.

## Behavior Rules

| Scenario | Result |
|---|---|
| New tab → opens `smartygym.com/` (any user: visitor, free, premium, logged in/out) | **Show landing page** |
| Already saw landing page in this tab → reload `/` | Redirect to `/home` |
| Already saw landing page → type `smartygym.com/` again in same tab | Redirect to `/home` |
| Close tab, open new tab → `smartygym.com/` | **Show landing page again** |
| Direct deep links (e.g. `/workout`, `/home`) | Unaffected — never forced to landing |

## Technical Implementation

**Storage choice:** Use `sessionStorage` (NOT `localStorage`).
- `sessionStorage` is scoped to the browser tab. It's cleared when the tab closes — exactly matching the requested behavior.
- Works identically on desktop, mobile, and tablet.
- Independent of authentication state (visitors and logged-in users behave the same).

**Key:** `smarty_landing_seen` = `"1"`

**Logic in `src/pages/LandingRouter.tsx`:**
1. On mount, read `sessionStorage.getItem('smarty_landing_seen')`.
2. If present → `<Navigate to="/home" replace />` immediately.
3. If absent → set it to `"1"` and render the landing UI.

This means the very first hit to `/` in a new tab shows the landing page once; every subsequent visit to `/` in that same tab redirects to `/home`. Closing the tab clears `sessionStorage`, so the next new tab sees the landing page again.

**No routing changes** in `App.tsx` — `/` still maps to `LandingRouter`. All other routes are untouched.

## Files to Edit

- `src/pages/LandingRouter.tsx` — add the sessionStorage check + redirect at the top of the component.

## Edge Cases Handled

- **Multiple tabs simultaneously**: each tab has its own `sessionStorage`, so each tab's first visit to `/` shows the landing page. Correct per the request ("whenever I land").
- **In-tab navigation away and back**: once seen in the tab, redirects to `/home`. Correct.
- **Hard refresh on `/`**: still in same tab → redirects to `/home`. Correct.
- **Logged-in vs logged-out**: identical behavior — auth state is never checked. Correct per request.
