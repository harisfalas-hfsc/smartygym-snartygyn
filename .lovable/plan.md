

## Fix: Logo Navigation + Remove Duplicate Back Buttons

### Problem 1: Logo not navigating to homepage from dashboard
The `Link to="/"` was correctly added to the logo, but there is an **infinite render loop** in `CheckInModalManager.tsx` (visible in console logs: "Maximum update depth exceeded"). This happens because the `useEffect` on lines 74-82 calls `onBannerStateChange` which is not memoized by the parent (`UserDashboard`), causing a new function reference on every render, which re-triggers the effect endlessly. This infinite loop can block React from processing the `Link` navigation properly.

**Fix**: Wrap the `onBannerStateChange` callback in `UserDashboard.tsx` with `useCallback` so it has a stable reference, breaking the infinite loop. This will allow the logo `Link` to navigate correctly from the dashboard.

### Problem 2: Two back buttons on every page
The global `FixedBackButton` component was added in `App.tsx` to show a persistent, fixed back button on every page (except homepage). However, **24 individual pages** still have their own inline back buttons using `useShowBackButton`. This creates two overlapping back buttons.

**Fix**: Remove all inline back buttons from every page that has one, since the global `FixedBackButton` already handles this everywhere.

### Pages with inline back buttons to clean up (all 24 files)

Each page needs its inline back button JSX removed, and if `useShowBackButton`/`ArrowLeft` imports become unused, those imports should also be cleaned up:

1. `UserDashboard.tsx` - Button at line 774
2. `Community.tsx` - Button at line 670
3. `WorkoutFlow.tsx` - Button at line 265
4. `TrainingProgramFlow.tsx` - Button at line 211
5. `DailySmartyRitual.tsx` - Button at line 155
6. `CalculatorHistory.tsx` - Button at line 549
7. `SmartyCorporate.tsx` - Button at line 170
8. `SmartyPlans.tsx` - Button at line 315
9. `PremiumBenefits.tsx` - Button at line 170
10. `PremiumComparison.tsx` - Button at line 171
11. `CoachCV.tsx` - Button at line 33
12. `PaymentSuccess.tsx` - Button at line 95
13. `NewsletterThankYou.tsx` - Button at line 23
14. `CorporateWellness.tsx` - Button at line 189
15. `HumanPerformance.tsx` - back button section
16. `WhyInvestInSmartyGym.tsx` - back button section
17. `TakeATour.tsx` - back button section
18. `ExerciseLibrary.tsx` - uses hook but need to check for button
19. `JoinPremium.tsx` - uses hook, need to check for button
20. `Shop.tsx` - uses hook, need to check for button
21. `OneRMCalculator.tsx` - uses hook, need to check for button
22. `BMRCalculator.tsx` - uses hook, need to check for button
23. `MacroTrackingCalculator.tsx` - uses hook, need to check for button (shared with caloriecalculator route)
24. `Tools.tsx` - uses hook, need to check for button

### Files to modify

- `src/components/checkins/CheckInModalManager.tsx` or `src/pages/UserDashboard.tsx` -- fix infinite loop by memoizing `onBannerStateChange` with `useCallback`
- All 24 page files listed above -- remove inline back button JSX and unused imports

### What stays
- `src/components/FixedBackButton.tsx` -- the global fixed back button (no changes needed)
- `src/hooks/useShowBackButton.ts` -- keep the hook file since `FixedBackButton` uses it
- `src/contexts/NavigationHistoryContext.tsx` -- keeps working as-is

