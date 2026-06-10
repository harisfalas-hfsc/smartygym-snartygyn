
# Why the app feels slow

The root cause is the current service worker. Both `public/sw.js` and `public/service-worker.js` are "kill-switch" cleanup workers — on every visit they:

1. Delete **every** cache in the browser.
2. Unregister themselves.
3. Force a navigation reload.

The result: nothing is ever cached. Every page open re-downloads the JavaScript bundle, the fonts, and the images from the network. That's exactly what you describe — 4–5 s on first open of Workouts / Programs / Payments, slightly faster the second time only because the browser memory cache survives within the same session, and zero offline capability. The APK is just a WebView pointing at the same site, so it inherits the same problem.

Routes are already code-split with `React.lazy`, so the fix is purely the caching layer.

# Plan

## 1. Replace the kill-switch SW with a real PWA service worker

- Add `vite-plugin-pwa` (using `generateSW` + Workbox) to `vite.config.ts`.
- Output filename stays `/sw.js` so already-installed browsers/APKs adopt the new worker on the next visit instead of staying stuck on the cleanup loop.
- Delete `public/sw.js` and `public/service-worker.js` (the kill-switch files) once the new SW is wired up — Workbox generates them.
- Strategies:
  - **HTML navigations** → `NetworkFirst` (so a new publish still appears immediately; falls back to cache when offline).
  - **Hashed JS / CSS / fonts under `/assets/*`** → `CacheFirst` with long expiration. Filenames change on every deploy so this is safe.
  - **Images (Supabase storage + same-origin)** → `StaleWhileRevalidate`, capped entries.
  - **Supabase REST/Edge API calls** → `NetworkFirst` with a short timeout so offline still returns the last response.
  - Exclude `/~oauth`, `/payment-success`, and any Stripe redirect URLs from precache/navigation fallback.

## 2. Guarded registration (Lovable-preview safe)

- Single registration wrapper, imported once from `src/main.tsx`.
- Refuses to register when:
  - not `import.meta.env.PROD`
  - running inside an iframe
  - hostname is `id-preview--*`, `*.lovableproject.com`, `*.lovable.app`, `*.beta.lovable.dev`
  - URL has `?sw=off` (manual kill switch)
- In those refused contexts, it actively unregisters any existing `/sw.js` so the editor preview is never controlled by a worker.
- Capacitor/APK already passes these checks → SW will register there and give you offline + instant reloads.

## 3. Faster data layer

- Set sensible defaults on the existing `QueryClient` in `src/App.tsx`:
  - `staleTime: 5 * 60 * 1000` (5 min) so re-opening Workouts/Programs reuses the cached list instead of refetching.
  - `gcTime: 30 * 60 * 1000`.
  - `refetchOnWindowFocus: false`.
- This alone removes most of the "spinner appears every time I navigate back" feeling.

## 4. Prefetch on hover/tap for heavy routes

- In the workout/program cards, prefetch the route module + its first data query on `onPointerEnter` / `onTouchStart`. By the time the user releases the tap, the chunk is already in cache.

## 5. APK note

The APK is a WebView of the published site. Once steps 1–3 ship and you reinstall (or just relaunch) the APK once online, the SW takes over and subsequent opens load from cache — including offline. The "log in once and it works offline" promise will actually hold from that point on.

# Files touched (technical)

- `vite.config.ts` — add `VitePWA({ registerType: "autoUpdate", filename: "sw.js", strategies: "generateSW", workbox: { … } })`.
- `public/sw.js`, `public/service-worker.js` — delete (Workbox emits the new `/sw.js`).
- `src/main.tsx` — replace the unconditional `clearServiceWorkersAndCaches` with the guarded registration wrapper. Keep the existing iframe/preview/native unregister behavior.
- `src/App.tsx` — add `defaultOptions` to `QueryClient`.
- `src/components/workouts/*Card.tsx`, `src/components/programs/*Card.tsx` — add hover/touch prefetch (small change, no UI change).
- `public/manifest.webmanifest` — verify it still matches (no install behavior change for already-installed apps).

# What you will see after this ships

- First visit: same speed as today (one network download).
- Every visit after that: pages open instantly from cache, including the APK.
- New publishes still go live immediately (HTML is NetworkFirst; hashed JS filenames change per deploy).
- Logging in once online → app keeps working offline afterwards, as originally promised.
- No change to the editor preview behavior (SW stays disabled there).
