## Goal

Add a very light bottom border to the mobile header so it visually matches the top border that separates the bottom navigation bar from the page content.

## Where

`src/components/Navigation.tsx` — the `<header>` element at line 291.

## What changes

- Append `border-b border-primary/20` to the header's existing `className`.
- This uses the same color/opacity as the bottom bar's `border-t border-primary/20`, creating visual consistency.

## Verification

- The header will show a subtle separating line in both light and dark modes.
- No other layout or styling is affected.