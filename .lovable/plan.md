

# Fix Missing Spacing Before Finisher and Cool Down Sections

## Problem

The "Leg Day Power Builder" workout HTML in the database has no empty paragraph separator before the Finisher and Cool Down sections. The last "Rest..." paragraph runs directly into the next section header with no visual gap.

Specifically, the content goes:
```
...Rest 60 seconds between sets.</p><p ...>⚡ Finisher...</p>
```
instead of:
```
...Rest 60 seconds between sets.</p><p class="tiptap-paragraph"></p><p ...>⚡ Finisher...</p>
```

The same issue occurs before the Cool Down section.

## Fix Strategy (Two Parts)

### 1. Fix This Workout's Data (Immediate)

Update the database to insert an empty paragraph before the Finisher (`⚡`) and Cool Down (`🧘`) section headers.

### 2. Add Automatic Spacing Enforcement in the Normalizer (Permanent)

Update `src/utils/htmlNormalizer.ts` to automatically insert an empty paragraph **before** any section header (identified by section icons: `🧽`, `🔥`, `💪`, `⚡`, `🧘`) if one is not already present. This guarantees that every section always has visual separation, regardless of what the AI generates or what a manual edit produces.

This means:
- Every future workout processed through the normalizer will have consistent spacing
- Even if the AI forgets to add spacing, the normalizer catches it automatically
- Works for all workouts and any content that passes through `normalizeWorkoutHtml`

## Why This Keeps Happening

The normalizer currently has rules to remove extra spacing (collapse duplicates, strip blanks after headers) but has no rule to **ensure** spacing exists before section headers. It strips excess but never adds missing gaps. Adding an insertion rule closes this gap permanently.

## Technical Details

### File: `src/utils/htmlNormalizer.ts`
- Add a new step after the existing cleanup steps that inserts a canonical empty paragraph before any section icon header paragraph that does not already have one preceding it
- Regex pattern: for each section icon, find cases where a non-empty paragraph is immediately followed by a section header paragraph, and insert the separator

### Database: Direct content fix
- Run an UPDATE on workout `WOD-S-E-1771367407134` to add `<p class="tiptap-paragraph"></p>` before the Finisher and Cool Down headers
