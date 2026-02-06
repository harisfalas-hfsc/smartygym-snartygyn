

## Fix: Duration Filters, Mobile Layout, and Dark Mode -- All Files

### What's Wrong (Nothing Was Fixed)

All 7 files still have the old, incorrect values. Here is exactly what needs to change:

---

### File 1: `src/pages/WorkoutDetail.tsx`

**a) Line 38 -- Update DurationFilter type:**
```
Old: type DurationFilter = "all" | "15" | "20" | "30" | "45" | "60" | "various";
New: type DurationFilter = "all" | "30" | "40" | "50" | "60" | "75" | "various";
```

**b) Lines 231-248 -- Replace duration filter logic with range matching:**
```typescript
// Duration filter
if (durationFilter !== "all") {
  const durationNumber = parseInt(workout.duration?.match(/\d+/)?.[0] || "0");
  const workoutDuration = workout.duration?.toLowerCase();
  const hasVariousText = workoutDuration?.includes("various") || workoutDuration?.includes("varies");
  
  if (durationFilter === "various") {
    // Show workouts with "various"/"varies" text or no parseable duration
    if (!hasVariousText && durationNumber > 0) return false;
  } else {
    if (hasVariousText) return false;
    const filterNum = parseInt(durationFilter);
    // Range matching: 30 = 25-34, 40 = 35-44, 50 = 45-54, 60 = 55-64, 75 = 65-79
    const rangeMin = filterNum - 5;
    const rangeMax = filterNum + (filterNum === 75 ? 4 : 4);
    if (durationNumber < rangeMin || durationNumber > rangeMax) return false;
  }
}
```

**c) Find where duration filter options are passed to CompactFilters and update them:**
Options should be: `All Durations, 30 min, 40 min, 50 min, 60 min, 75 min, Various`

---

### File 2: `src/components/admin/WorkoutsManager.tsx`

**a) Lines 105-122 -- Replace duration filter logic with range matching** (same logic as above)

**b) Lines 619-626 -- Replace duration select items:**
```
Old: 15, 20, 30, 45, 60, Various
New: 30, 40, 50, 60, 75, Various
```

---

### File 3: `src/components/admin/WorkoutEditDialog.tsx`

**Lines 49-56 -- Replace DURATION_OPTIONS with realistic values:**
```typescript
const DURATION_OPTIONS = [
  "30 MINUTES",
  "35 MINUTES",
  "40 MINUTES",
  "45 MINUTES",
  "50 MINUTES",
  "55 MINUTES",
  "60 MINUTES",
  "65 MINUTES",
  "70 MINUTES",
  "75 MINUTES",
  "VARIOUS"
];
```

---

### File 4: `src/components/WorkoutFilters.tsx`

**Line 26 -- Add "Various" back and update values:**
```typescript
Old: const durations = ["All", "30", "45", "50", "60", "75"];
New: const durations = ["All", "30", "40", "50", "60", "75", "Various"];
```

---

### File 5: `src/components/smartly-suggest/SmartlySuggestModal.tsx`

**Lines 62-67 -- Update durationOptions:**
```typescript
const durationOptions = [
  { label: "30 min", value: 30 },
  { label: "45 min", value: 45 },
  { label: "60 min", value: 60 },
  { label: "75 min", value: 75 },
];
```

---

### File 6: `src/components/CompactFilters.tsx`

**Line 30 -- Add `flex-wrap` so filters wrap on mobile instead of overflowing:**
```
Old: <div className="flex items-center gap-2">
New: <div className="flex flex-wrap items-center gap-2">
```

---

### File 7: `src/index.css`

**Line 76 -- Fix dark mode accent-foreground so selected dropdown items show white text (not black-on-blue):**
```
Old: --accent-foreground: 0 0% 15%;
New: --accent-foreground: 0 0% 100%;
```

---

### Summary

| File | What Changes | Why |
|---|---|---|
| WorkoutDetail.tsx | Duration type + filter logic + filter options | Public pages show wrong durations, exact matching fails |
| WorkoutsManager.tsx | Filter logic + select items | Admin shows wrong durations |
| WorkoutEditDialog.tsx | DURATION_OPTIONS | Admin create/edit form has wrong options |
| WorkoutFilters.tsx | Durations array | Standalone component needs consistency |
| SmartlySuggestModal.tsx | Duration options | AI suggest shows wrong time ranges |
| CompactFilters.tsx | Add flex-wrap | Filters overflow off-screen on mobile |
| index.css | accent-foreground dark mode | Black text on dark blue = unreadable |

### What Will NOT Change
- Database workout data (already fixed by the audit)
- Generation logic (already updated)
- Training program filters (use weeks, not minutes)
- Filter component structure or design pattern

