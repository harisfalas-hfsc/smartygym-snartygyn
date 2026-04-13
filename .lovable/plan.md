

## Problem

Tablet portrait (768-820px width) triggers Tailwind's `md:` breakpoint (768px), causing desktop styles to appear. This affects all pages: homepage carousel, WOD cards, About page missing links, and general layout inconsistency.

The root cause is that `md:` is the dividing line between mobile and desktop layouts across the entire codebase, and tablets in portrait land exactly at that boundary.

## Solution

Change the `md` breakpoint from 768px to 1024px globally. This single change makes all tablet portrait views use mobile styles, and tablet landscape (1024px+) continues showing desktop styles.

### What changes

**1. tailwind.config.ts** --- Override `md` screen to 1024px

This is the core fix. Every `md:hidden`, `hidden md:block`, `md:grid-cols-X`, etc. across all 96 files will now activate at 1024px instead of 768px. No individual file changes needed for the breakpoint logic.

**2. src/hooks/use-mobile.tsx** --- Update `MOBILE_BREAKPOINT` to 1024

Keeps the JS hook in sync with the CSS breakpoint.

### What this fixes automatically
- Homepage carousel: cards stay at mobile sizing (75% basis, 220px height) on tablet portrait instead of the stretched desktop layout (32% basis, 180px height)
- WOD cards: same fix, mobile proportions maintained
- About page: the `md:hidden` mobile cards (with "Why We Are the Best", "Discover the Smarty Method", "Why invest in SmartyGym" links) will now show on tablet portrait
- All other pages: consistent mobile layout on tablet portrait

### Side effect and mitigation
Pages using `md:grid-cols-2 lg:grid-cols-3` patterns (mostly admin dashboards) will lose the 2-column intermediate layout at 768-1023px. This is acceptable because that range IS tablet portrait, which should show mobile (1-column) layout per the user's request.

### What stays unchanged
- Mobile view (below 768px): no change
- Desktop view (1024px+): no change, `md:` and `lg:` both activate at 1024px
- Tablet landscape: continues showing desktop layout

### Technical detail
Two files modified total. No database changes.

