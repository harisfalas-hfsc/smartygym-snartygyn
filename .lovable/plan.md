## Problem

On mobile, opening the hamburger menu from the homepage and scrolling **up** inside the panel triggers the browser's pull-to-refresh — the whole page reloads. Cause: the scrollable menu panel does not isolate its scroll chain, so when the user reaches the top of the menu and keeps dragging, the gesture bubbles to the document and the browser interprets it as pull-to-refresh.

## Solution

Single-line CSS fix in `src/components/Navigation.tsx` on the **mobile** `SheetContent` (line 387). Add `overscroll-contain` (CSS `overscroll-behavior: contain`) so the scroll gesture stays inside the menu panel and never propagates to the document.

### Change

```tsx
<SheetContent
  side="left"
  hideClose
  className="left-4 top-6 bottom-6 h-auto w-[calc(100vw-2rem)] max-w-none overflow-y-auto overscroll-contain rounded-2xl border-2 border-primary/40 p-4 shadow-xl"
>
```

Also add `overscroll-contain` to the desktop `SheetContent` (line 299) for the same reason — harmless on desktop, protects tablet/landscape.

No other files touched. No logic changes. No layout changes.

## Verification

1. Mobile viewport 390×844, homepage `/`.
2. Tap hamburger → menu opens.
3. Scroll content to the middle, then drag **down** to scroll up — page must NOT refresh, only the menu scrolls.
4. At the very top of the menu, keep dragging down — no pull-to-refresh indicator, no reload.
5. Close menu, confirm homepage scroll still works normally.
