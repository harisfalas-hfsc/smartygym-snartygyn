# Fix: homepage should be `/`, not `/home`

## Why this is happening
Both `/` and `/home` render the same Index page, but the **logo in the top navigation links to `/home`**. So whenever you click the logo, the URL becomes `smartygym.com/home` even though the page looks identical to `smartygym.com/`. A couple of other small spots also point to `/home`.

## What I'll change

1. **Navigation logo** (`src/components/Navigation.tsx`)
   - Change the logo `<Link to="/home">` to `<Link to="/">`.

2. **Landing router "go to homepage" link** (`src/pages/LandingRouter.tsx`)
   - Change `<Link to="/home">` to `<Link to="/">`.

3. **Keep `/home` working as a redirect** (`src/App.tsx`)
   - Replace `<Route path="/home" element={<Index />} />` with a redirect to `/` so any old bookmark, email link, or external link still lands on the homepage — but the URL bar cleans up to `smartygym.com`.

4. **No changes needed** to:
   - `MobileBottomNav.tsx` — only checks the pathname for highlight state, doesn't navigate to `/home`.
   - `FreeTrialPopup.tsx` — only uses `/home` in a path-matching list; the redirect plus keeping it in the list keeps behavior identical.

## Result
- Clicking the logo → URL stays `smartygym.com/`.
- Anyone who visits `smartygym.com/home` → instantly redirected to `smartygym.com/`.
- No content, design, or SEO changes. No backend changes.
