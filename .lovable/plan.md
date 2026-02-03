

# Update Existing Workouts: 5-Section Structure with Preserved Formatting

## Confirmed 5-Section Icons

| Section | Icon | Title Format |
|---------|------|--------------|
| **Soft Tissue Preparation** | 🧽 | `🧽 <strong><u>Soft Tissue Preparation 5'</u></strong>` |
| **Activation** | 🔥 | `🔥 <strong><u>Activation 10'</u></strong>` |
| **Main Workout** | 💪 | `💪 <strong><u>Main Workout</u></strong>` (unchanged) |
| **Finisher** | ⚡ | `⚡ <strong><u>Finisher</u></strong>` (unchanged) |
| **Cool Down** | 🧘 | `🧘 <strong><u>Cool Down 5'</u></strong>` (unchanged) |

---

## Current Workout Format (What Exists Now)

Based on the database, current workouts look like this:

```html
<p class="tiptap-paragraph">🔥 <strong><u>Warm Up 5'</u></strong></p>
<ul class="tiptap-bullet-list">
<li class="tiptap-list-item"><p class="tiptap-paragraph">Jumping Jacks – 1 min</p></li>
...
</ul>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph">💪 <strong><u>Main Workout 25'</u></strong></p>
...
```

---

## What the Update Will Do

### Step 1: Prepend Soft Tissue Preparation
Add the new 🧽 section at the very beginning (before 🔥)

### Step 2: Rename "Warm Up" to "Activation"
Change `🔥 <strong><u>Warm Up` → `🔥 <strong><u>Activation`

---

## Formatting Rules - 100% Preserved

The update will follow these exact formatting rules:

| Rule | Current | After Update |
|------|---------|--------------|
| Section titles | Bold + Underlined | Bold + Underlined ✓ |
| Exercise lists | `<ul class="tiptap-bullet-list">` | Same ✓ |
| List items | `<li class="tiptap-list-item"><p class="tiptap-paragraph">` | Same ✓ |
| Section separator | `<p class="tiptap-paragraph"></p>` | Same ✓ |
| No empty paragraphs at start | ✓ | ✓ |
| Icon position | Before bold title | Before bold title ✓ |

---

## Example: Before vs After

### BEFORE (Current):
```html
<p class="tiptap-paragraph">🔥 <strong><u>Warm Up 5'</u></strong></p>
<ul class="tiptap-bullet-list">
<li class="tiptap-list-item"><p class="tiptap-paragraph">Jumping Jacks – 1 min</p></li>
<li class="tiptap-list-item"><p class="tiptap-paragraph">High Knees – 1 min</p></li>
...
</ul>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph">💪 <strong><u>Main Workout 25'</u></strong></p>
...
```

### AFTER (Updated):
```html
<p class="tiptap-paragraph">🧽 <strong><u>Soft Tissue Preparation 5'</u></strong></p>
<ul class="tiptap-bullet-list">
<li class="tiptap-list-item"><p class="tiptap-paragraph">Foam roll quadriceps (45 seconds per leg)</p></li>
<li class="tiptap-list-item"><p class="tiptap-paragraph">Foam roll hamstrings (45 seconds per leg)</p></li>
<li class="tiptap-list-item"><p class="tiptap-paragraph">Foam roll calves (30 seconds per leg)</p></li>
<li class="tiptap-list-item"><p class="tiptap-paragraph">Foam roll glutes (45 seconds per side)</p></li>
<li class="tiptap-list-item"><p class="tiptap-paragraph">Lacrosse ball foot massage (30 seconds per foot)</p></li>
</ul>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph">🔥 <strong><u>Activation 5'</u></strong></p>
<ul class="tiptap-bullet-list">
<li class="tiptap-list-item"><p class="tiptap-paragraph">Jumping Jacks – 1 min</p></li>
<li class="tiptap-list-item"><p class="tiptap-paragraph">High Knees – 1 min</p></li>
...
</ul>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph">💪 <strong><u>Main Workout 25'</u></strong></p>
...
```

---

## Formatting Guarantees

1. **No style destruction** - All CSS classes preserved exactly
2. **Same HTML structure** - Paragraph → Bullet List → Separator pattern maintained
3. **Icon consistency** - Each section keeps its designated icon
4. **Duration format** - `5'` format preserved for time values
5. **Bold + Underlined titles** - Format preserved with `<strong><u>` tags
6. **Empty paragraph separators** - One `<p class="tiptap-paragraph"></p>` between sections
7. **Bullet list format** - `tiptap-bullet-list` and `tiptap-list-item` classes maintained

---

## Soft Tissue Prep Variations by Category

To add variety (not always the same):

| Category | Focus Areas |
|----------|-------------|
| **STRENGTH** | Muscles being trained that day (varied per workout) |
| **CARDIO** | Legs, hips, posterior chain (running focus) |
| **METABOLIC** | Full body comprehensive |
| **CALORIE BURNING** | Full body, emphasis on high-use areas |
| **MOBILITY & STABILITY** | Gentle rolling, more trigger point work |
| **CHALLENGE** | Full body thorough prep |

---

## Technical Implementation

### File to Create
`supabase/functions/update-workout-structure/index.ts`

### Logic
1. Fetch all 156 workouts in 6 categories
2. For each workout:
   - Skip if already contains "🧽" (already updated)
   - Generate category-appropriate Soft Tissue Prep HTML
   - Find the "🔥" section and rename "Warm Up" to "Activation"
   - Prepend the Soft Tissue Prep section
   - Update the database
3. Log results

### Safety
- Check for existing 🧽 to prevent double-updates
- Dry-run mode available to preview changes
- All changes are additive (no content deleted)

---

## Summary

| Aspect | Guarantee |
|--------|-----------|
| Icons | 🧽 → 🔥 → 💪 → ⚡ → 🧘 |
| Formatting | 100% preserved (all classes, structure, styling) |
| Existing content | Untouched (only prepending + renaming) |
| Visual appearance | Same design, same structure, just new section added |

