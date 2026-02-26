

# WOD Announcement Modal: Recovery Day Handling and Wording Fix

## Overview
Update the WOD announcement modal to detect recovery days and display appropriate messaging, plus fix the misleading "location" wording for all other days.

## Changes

### File: `src/components/announcements/WODAnnouncementModal.tsx`

**1. Detect recovery day from fetched WODs**
After the query returns, check if the WODs indicate a recovery day. Recovery days have only one workout and the category is "RECOVERY". Add a derived variable:

```tsx
const isRecoveryDay = wods?.length === 1 && wods[0]?.category?.toUpperCase() === "RECOVERY";
```

**2. Conditional title and subtitle**

- **Recovery day:**
  - Title: "Fresh Recovery Workout Just Dropped!"
  - Subtitle: "Today is recovery day. Take care of your body with a guided recovery session designed by **SmartyGym**."

- **Normal days (all other categories):**
  - Title: "Fresh Workouts Just Dropped!" (unchanged)
  - Subtitle: "Every day, **SmartyGym** delivers **TWO** fresh workouts -- pick one based on your mood, convenience, or training preference!"

**3. Conditional CTA button text**

- Recovery day: "View Today's Workout" (singular)
- Normal days: "View All Today's Workouts" (unchanged)

**4. Recovery day card layout**

On recovery days, render the single workout card in a single-column centered layout instead of the 2-column grid, since there is only one card.

---

## Technical Summary

| Change | Detail |
|--------|--------|
| File | `src/components/announcements/WODAnnouncementModal.tsx` |
| New variable | `isRecoveryDay` derived from query data |
| Title | Conditional based on `isRecoveryDay` |
| Subtitle | Recovery: recovery-specific message; Normal: "mood, convenience, or training preference" instead of "location" |
| CTA text | "View Today's Workout" (recovery) vs "View All Today's Workouts" (normal) |
| Card grid | Single centered card for recovery, 2-col grid for normal |

No new files or dependencies needed.

