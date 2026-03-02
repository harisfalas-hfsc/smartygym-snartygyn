

# Add "Home" Title to Homepage and Standardize Header-to-Title Spacing Globally

## What This Does

1. **Adds "Home" breadcrumb to the homepage** so it shows a page title like every other page
2. **Standardizes the spacing** between the navigation header and the page title/breadcrumbs across ALL pages -- one consistent gap everywhere, on both mobile and desktop

## How It Works

### Step 1: Add consistent top spacing to PageBreadcrumbs component

Instead of editing 43+ individual pages, we modify the shared `PageBreadcrumbs` component to include a top margin (`mt-4`). This gives every page using breadcrumbs the same one-line gap below the header. Currently it only has `mb-4 sm:mb-6` (bottom spacing).

**File:** `src/components/PageBreadcrumbs.tsx`
- Change: `mb-4 sm:mb-6` to `mt-4 mb-4 sm:mb-6`

### Step 2: Remove inconsistent top padding from all page containers

Many pages use `py-8` (which adds top AND bottom padding) on their content containers, while others use `pb-8` (bottom only). We standardize ALL pages to use `pb-8` (no top padding), so the only top spacing comes from the PageBreadcrumbs component.

**Pages using `py-8` that need changing to `pb-8`:**
- `src/pages/About.tsx` -- `px-4 py-8` to `px-4 pb-8`
- `src/pages/FAQ.tsx` -- `px-4 py-8` to `px-4 pb-8`
- `src/pages/CoachProfile.tsx` -- `px-4 py-8` to `px-4 pb-8`
- `src/pages/PrivacyPolicy.tsx` -- `px-4 py-8` to `px-4 pb-8`
- `src/pages/TermsOfService.tsx` -- `px-4 py-8` to `px-4 pb-8`
- `src/pages/Disclaimer.tsx` -- `px-4 py-8` to `px-4 pb-8`
- `src/pages/WorkoutDetail.tsx` -- `px-4 py-8` to `px-4 pb-8`
- `src/pages/TrainingProgramDetail.tsx` -- `px-4 py-8` to `px-4 pb-8`
- `src/pages/WODCategory.tsx` -- `px-4 py-8` to `px-4 pb-8`
- `src/pages/WODArchive.tsx` -- `px-4 py-8` to `px-4 pb-8`
- `src/pages/PremiumComparison.tsx` -- `py-8 px-4` to `pb-8 px-4`
- `src/pages/PaymentSuccess.tsx` -- `py-8 px-4` to `pb-8 px-4`
- `src/pages/PremiumBenefits.tsx` -- `p-4 py-8` to `p-4 pb-8`
- `src/pages/TheSmartyMethod.tsx` -- `px-4 py-8` to `px-4 pb-8`
- `src/pages/IndividualTrainingProgram.tsx` -- `px-4 py-8` to `px-4 pb-8`
- `src/pages/CalculatorHistory.tsx` -- `py-8 px-4` to `pb-8 px-4`
- `src/pages/AdminBackoffice.tsx` -- `py-4 sm:py-8` to `pb-4 sm:pb-8`
- `src/pages/AppSubmission.tsx` -- `px-4 py-8` to `px-4 pb-8`
- `src/pages/CorporateWellness.tsx` -- `p-4 pb-8` (already uses `p-4`, change to `px-4 pb-8`)
- `src/pages/WhyInvestInSmartyGym.tsx` -- same pattern
- `src/pages/HumanPerformance.tsx` -- check and fix similarly

### Step 3: Add "Home" breadcrumb to Index.tsx

Add `PageBreadcrumbs` to the homepage with a single item: `{ label: "Home" }`. This will display "Home" as the page title, matching all other pages.

**File:** `src/pages/Index.tsx`
- Import `PageBreadcrumbs`
- Add breadcrumb at the top of the content area, inside the main container, showing just "Home"

### Step 4: Handle special pages

Some pages like Auth, ResetPassword, and NotFound have unique layouts (centered cards, etc.) and don't use breadcrumbs. These will be left as-is since they are utility pages, not content pages.

## Result

- Every content page shows a breadcrumb/title with exactly one line of consistent spacing from the header
- The homepage shows "Home" as its page title
- Both mobile and desktop views are consistent
- The fix is centralized in the PageBreadcrumbs component, so any future pages automatically get the correct spacing

