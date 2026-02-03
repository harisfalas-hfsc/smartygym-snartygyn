
# Persistent Fixed Back Button - Implementation Plan

## Goal
Add a persistent, fixed back button that stays visible while scrolling on ALL pages (public website and admin backoffice), without changing the existing navigation logic.

---

## Current State
- Back buttons are inline within page content - they scroll away with the page
- Each page implements its own back button (40+ pages use `useShowBackButton`)
- Navigation logic is centralized in `useShowBackButton` hook (works correctly)
- Header is already fixed at top (`z-50`)

---

## Solution: Create a Global Fixed Back Button Component

### Architecture
```text
┌─────────────────────────────────────────────────────────────┐
│  Header (fixed top-0 z-50)                                   │
└─────────────────────────────────────────────────────────────┘
┌──────────────┐
│ ← Back       │  ← NEW: FixedBackButton (fixed, left side)
│ (fixed)      │     Positioned below header, always visible
└──────────────┘
┌─────────────────────────────────────────────────────────────┐
│  Page Content (scrollable)                                   │
│    - Remove inline back buttons from individual pages        │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Steps

### Step 1: Create `FixedBackButton` Component
Create a new component: `src/components/FixedBackButton.tsx`

**Design:**
- Uses existing `useShowBackButton()` hook (no logic change)
- Fixed position: `fixed left-4` below the header
- Semi-transparent background with backdrop blur (matches hfsc.eu style)
- Z-index below header but above content (`z-40`)
- Hidden on homepage (`/`) where back navigation doesn't make sense
- Responsive sizing (smaller on mobile)

**Style matching hfsc.eu:**
```css
/* Pill-shaped button, semi-transparent */
position: fixed;
left: 1rem;
top: calc(var(--app-header-h) + 0.5rem);
z-index: 40;
background: rgba(background, 0.8);
backdrop-filter: blur(8px);
border: 1px solid primary/50;
border-radius: 9999px;
```

### Step 2: Add to App Layout
Add `FixedBackButton` in `src/App.tsx` inside `AppContent`, positioned after `<Navigation />`.

This ensures:
- Single source of truth for back button
- Appears on ALL pages automatically
- Works in both public site and admin backoffice

### Step 3: Remove Inline Back Buttons from Pages
Remove the redundant inline back buttons from all pages that currently have them:

| File | Change |
|------|--------|
| `src/pages/IndividualWorkout.tsx` | Remove back button JSX |
| `src/pages/WorkoutDetail.tsx` | Remove back button JSX |
| `src/pages/TrainingProgramDetail.tsx` | Remove back button JSX |
| `src/pages/IndividualTrainingProgram.tsx` | Remove back button JSX |
| `src/pages/Blog.tsx` | Remove back button JSX |
| `src/pages/FAQ.tsx` | Remove back button JSX |
| `src/pages/Contact.tsx` | Remove back button JSX |
| `src/pages/TermsOfService.tsx` | Remove back button JSX |
| `src/pages/PrivacyPolicy.tsx` | Remove back button JSX |
| `src/pages/Disclaimer.tsx` | Remove back button JSX |
| `src/pages/CoachProfile.tsx` | Remove back button JSX |
| `src/pages/About.tsx` | Remove back button JSX |
| `src/pages/Auth.tsx` | Remove back button JSX |
| `src/pages/ArticleDetail.tsx` | Remove back button JSX |
| `src/pages/AdminBackoffice.tsx` | Remove back button JSX |
| `src/components/ContentNotFound.tsx` | Remove back button JSX |
| ... (and any other pages with inline back buttons) |

### Step 4: Homepage Exception
The `FixedBackButton` component will automatically hide on the homepage (`/`) since going "back" from home doesn't make sense.

---

## Technical Details

### FixedBackButton Component Structure
```tsx
// src/components/FixedBackButton.tsx
const FixedBackButton = () => {
  const location = useLocation();
  const { goBack } = useShowBackButton();
  
  // Hide on homepage
  if (location.pathname === '/') return null;
  
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={goBack}
      className="fixed left-4 z-40 gap-2 
        bg-background/80 backdrop-blur-md 
        border border-primary/30 
        rounded-full shadow-lg
        hover:bg-background/90"
      style={{ top: 'calc(var(--app-header-h, 100px) + 0.5rem)' }}
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="text-xs sm:text-sm">Back</span>
    </Button>
  );
};
```

### App.tsx Integration
```tsx
// In AppContent, after <Navigation />
<Navigation />
<FixedBackButton />
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/FixedBackButton.tsx` | **CREATE** - New fixed back button component |
| `src/App.tsx` | **MODIFY** - Add FixedBackButton after Navigation |
| 20+ page files | **MODIFY** - Remove inline back button code |

---

## What Stays the Same
- `useShowBackButton` hook logic (unchanged)
- `NavigationHistoryContext` (unchanged)
- Back navigation behavior (goes to previous page or home)
- Mobile/desktop responsiveness
- Dark/light mode support

---

## Expected Outcome
1. **Persistent visibility**: Back button stays fixed while scrolling on ALL pages
2. **Consistent placement**: Always in same position (below header, left side)
3. **Same behavior**: Navigation logic unchanged (previous page or home)
4. **Universal coverage**: Works on public pages, workout pages, admin backoffice - everywhere
5. **Clean code**: Single component instead of 40+ inline implementations
