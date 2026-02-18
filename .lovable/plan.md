
# Add Dark/Light Mode Toggle to Navigation

## What will change
A theme toggle button (sun/moon icon) will be added to the navigation bar, positioned to the **left of the notification bell icon** in the right-side actions area.

## Details
- The existing `ThemeToggle` component will be imported into `src/components/Navigation.tsx`
- It will be placed inside the right-side `div` (line ~441), right before the bell notification button (line ~455)
- The toggle will be visible on both mobile and desktop views
- No changes to the `ThemeToggle` component itself -- it already handles switching between dark and light mode
- The `DeviceThemeDefault` component will continue to default new sessions to dark mode; the toggle simply lets users switch during their session

## Technical steps

1. **Edit `src/components/Navigation.tsx`**:
   - Add import: `import { ThemeToggle } from "@/components/ThemeToggle";`
   - Insert `<ThemeToggle />` in the right-side actions area, just before the notification bell button (around line 454), so it appears to the left of the bell icon
