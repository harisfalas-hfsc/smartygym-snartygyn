

# Add "Discover The Smarty Method" Link to About Page (Mobile)

## What Will Change

A small "Discover The Smarty Method" link will be added directly below the "About SmartyGym" heading on the mobile view of the About page. It will use the exact same styling as the existing link in the homepage hero section.

## Technical Details

**File: `src/pages/About.tsx`**

Below the `<h1>About SmartyGym</h1>` heading (line 107), add a mobile-only link:

```tsx
<Link to="/the-smarty-method" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline md:hidden">
  <BookOpen className="w-4 h-4" />
  Discover The Smarty Method
  <ChevronRight className="w-4 h-4" />
</Link>
```

- Uses `md:hidden` so it only appears on mobile (hidden on desktop)
- Identical styling to the homepage hero link: `text-sm font-semibold text-primary hover:underline` with `BookOpen` and `ChevronRight` icons
- Imports `Link` from `react-router-dom` and `BookOpen`, `ChevronRight` from `lucide-react` (adding to existing imports)

