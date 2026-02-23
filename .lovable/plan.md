

# Fix: Remove Duplicate Back Buttons From All Pages

## Problem
7 pages have an **inline back button** at the top of the page content, which duplicates the **global fixed back button** (`FixedBackButton` in `App.tsx`) that stays visible while scrolling. This creates two back buttons on desktop.

## Pages Affected

| Page | File | Lines to Remove |
|------|------|----------------|
| Why SmartyGym | `src/pages/HumanPerformance.tsx` | Lines 57-67 (inline back button block) |
| Why Invest in SmartyGym | `src/pages/WhyInvestInSmartyGym.tsx` | Lines 197-207 (inline back button block) |
| Corporate Wellness | `src/pages/CorporateWellness.tsx` | Lines 189-199 (inline back button block) |
| Premium Benefits | `src/pages/PremiumBenefits.tsx` | Lines 170-180 (inline back button block) |
| Take a Tour | `src/pages/TakeATour.tsx` | Lines 85-95 (inline back button block) |
| Coach CV | `src/pages/CoachCV.tsx` | Lines 33-36 (inline back button block) |
| Smarty Plans | `src/pages/SmartyPlans.tsx` | Lines 315-319 (inline back button block) |

## Changes Per File

For each of the 7 files:
1. **Remove** the `{canGoBack && (<Button>...</Button>)}` block
2. **Remove** the `useShowBackButton` import (line varies per file)
3. **Remove** the `const { canGoBack, goBack } = useShowBackButton();` line
4. **Remove** the `ArrowLeft` icon import if it was only used for the back button

The global `FixedBackButton` component (already rendered in `App.tsx`) handles all back navigation on desktop. Mobile users use native gestures. No other back button is needed.

## What Is NOT Changed
- `src/components/FixedBackButton.tsx` -- remains as-is (the one we keep)
- `src/components/AccessGate.tsx` -- uses `goBack` inside action buttons, not as a duplicate back button
- `src/pages/NotFound.tsx` -- uses its own "Go Back" button contextually, not a duplicate

## Technical Details
- Frontend-only changes
- No edge functions touched
- No database changes
- 7 files modified, removing ~10 lines each

