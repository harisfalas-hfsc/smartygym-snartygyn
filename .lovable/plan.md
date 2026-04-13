

## Fix: Theme Toggle Button Background Flash

### Problem

The ThemeToggle uses a Radix `AvatarFallback` component to wrap the Sun/Moon icons. Radix `AvatarFallback` has a **built-in rendering delay** (~600ms) — it intentionally waits before appearing, to give `AvatarImage` time to load first. Since there is no `AvatarImage` here, the fallback eventually renders, but on every re-render (theme change), it resets this delay cycle. This causes the brief background flash you see — the fallback disappears momentarily, then reappears with its `bg-muted` default before `bg-transparent` takes effect.

Additionally, `next-themes` returns `theme` as `undefined` on the initial client render (to avoid hydration mismatch), which can cause the wrong icon to briefly appear until the theme value resolves.

### Fix

Remove the unnecessary `Avatar`/`AvatarFallback` wrapper entirely. Replace it with a simple `div` that has the same visual styling (circular, bordered, sized). This eliminates the Radix delay mechanism and the background flash.

Also switch from `theme` to `resolvedTheme` for reliable icon display without requiring a refresh.

### Code Change — `src/components/ThemeToggle.tsx`

```tsx
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

export const ThemeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="relative h-11 w-11 rounded-full"
      aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-primary">
        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};
```

Single file change. No other files affected. Visual appearance stays identical (same size, border, icon transitions).

