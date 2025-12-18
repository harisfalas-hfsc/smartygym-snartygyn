# Content Creation Formatting Philosophy - Master Standard

## CRITICAL: This is the definitive formatting standard for ALL content

Based on user's "Lower Push - Upper Pull Synthesis" and "Bodyweight Force" workouts as gold standard templates.

## Core Principles

1. **Start Immediately** - Content begins on the FIRST line. NO empty paragraphs at the start.
2. **Bullet Lists for Exercises** - All exercises use `<ul>` bullet lists, NOT numbered lists or `<br>` separators.
3. **Clear Section Separation** - Empty paragraph `<p class="tiptap-paragraph"></p>` between major sections.

## Structure: Three Sections

Every workout MUST have exactly three sections in main_workout:
1. **Warm Up** (with duration in title)
2. **Main Workout** (with duration if applicable)
3. **Cool Down** (with duration if applicable)

## Exact Formatting Rules

### Section Titles
- **Bold + Underlined** with duration in the title
- Format: `<p class="tiptap-paragraph"><strong><u>Warm Up 15'</u></strong></p>`
- Variations: `<strong><u>Main Workout 40'</u></strong>`, `<strong><u>Cool Down:</u></strong> 5'`

### Exercise Lists (CRITICAL - USE BULLET LISTS)
- ALL exercises use bullet lists: `<ul class="tiptap-bullet-list">`
- Each exercise is a list item: `<li class="tiptap-list-item"><p class="tiptap-paragraph">Exercise details</p></li>`
- NO numbered lists, NO `<br>` separators between exercises

### Correct Exercise List Example:
```html
<ul class="tiptap-bullet-list">
<li class="tiptap-list-item"><p class="tiptap-paragraph">Run 5 minutes</p></li>
<li class="tiptap-list-item"><p class="tiptap-paragraph">Jumping Rope 5 Minutes</p></li>
<li class="tiptap-list-item"><p class="tiptap-paragraph">Hip Circles - Arm Circles 5 minutes</p></li>
</ul>
```

### Circuit/Round Headers
- Use bullet point with **bold only** (no underline): `<strong>8 Rounds of:</strong>`
- Format: `<li class="tiptap-list-item"><p class="tiptap-paragraph"><strong>8 Rounds of:</strong></p></li>`

### Circuit Exercise Sets
- After round header, use plain paragraph with dash separators
- Format: `<p class="tiptap-paragraph">12 Goblet Squats - 12 Upright Row - 24 Jump Squats</p>`

### Section Separators
- ONE empty paragraph between sections: `<p class="tiptap-paragraph"></p>`
- Empty paragraph AFTER each section's exercise list
- Empty paragraph BEFORE starting a new section title

## Complete Workout Example (Gold Standard)

```html
<p class="tiptap-paragraph"><strong><u>Warm Up 15'</u></strong></p>
<ul class="tiptap-bullet-list">
<li class="tiptap-list-item"><p class="tiptap-paragraph">Run 5 minutes</p></li>
<li class="tiptap-list-item"><p class="tiptap-paragraph">Jumping Rope 5 Minutes</p></li>
<li class="tiptap-list-item"><p class="tiptap-paragraph">Hip Circles - Arm Circles 5 minutes</p></li>
</ul>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph"><strong><u>Main Workout</u></strong></p>
<p class="tiptap-paragraph"></p>
<ul class="tiptap-bullet-list">
<li class="tiptap-list-item"><p class="tiptap-paragraph"><strong>8 Rounds of:</strong></p></li>
</ul>
<p class="tiptap-paragraph">12 Goblet Squats - 12 Upright Row - 24 Jump Squats</p>
<p class="tiptap-paragraph"></p>
<ul class="tiptap-bullet-list">
<li class="tiptap-list-item"><p class="tiptap-paragraph"><strong>8 Rounds of:</strong></p></li>
</ul>
<p class="tiptap-paragraph">12 Weighted Lunges (6 each) - 12 Bend Over Row (6 each) - 24 Jumping Lunges (Alternate)</p>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph"><strong><u>Cool Down:</u></strong></p>
<ul class="tiptap-bullet-list">
<li class="tiptap-list-item"><p class="tiptap-paragraph">Foam Rolling & Stretching</p></li>
</ul>
<p class="tiptap-paragraph"></p>
```

## AMRAP/Time-Based Example

```html
<p class="tiptap-paragraph"><strong><u>Warm Up 15'</u></strong></p>
<ul class="tiptap-bullet-list">
<li class="tiptap-list-item"><p class="tiptap-paragraph">Run 5 minutes</p></li>
<li class="tiptap-list-item"><p class="tiptap-paragraph">Jumping Rope 5 Minutes</p></li>
<li class="tiptap-list-item"><p class="tiptap-paragraph">Hip Circles - Arm Circles 5 minutes</p></li>
</ul>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph"><strong><u>Main Workout 40'</u></strong></p>
<ul class="tiptap-bullet-list">
<li class="tiptap-list-item"><p class="tiptap-paragraph">5' Air Squats (As Many Reps As Possible)</p></li>
<li class="tiptap-list-item"><p class="tiptap-paragraph">5' TRX Row (As Many Reps As Possible)</p></li>
<li class="tiptap-list-item"><p class="tiptap-paragraph">5' Push Ups (As Many Reps As Possible)</p></li>
<li class="tiptap-list-item"><p class="tiptap-paragraph">5' Reverse Lunges - Alternate (As Many Reps As Possible)</p></li>
<li class="tiptap-list-item"><p class="tiptap-paragraph">5' Dips (As Many Reps As Possible)</p></li>
<li class="tiptap-list-item"><p class="tiptap-paragraph">5' Sit Ups (As Many Reps As Possible)</p></li>
</ul>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph"><strong><u>Cool Down</u></strong> 5'</p>
<ul class="tiptap-bullet-list">
<li class="tiptap-list-item"><p class="tiptap-paragraph">Foam Rolling</p></li>
</ul>
<p class="tiptap-paragraph"></p>
```

## Instructions Field Format

- Plain paragraphs with `class="tiptap-paragraph"`
- Clear, direct guidance
- Example:
```html
<p class="tiptap-paragraph">Complete each exercise for 5 minutes, performing as many quality reps as possible. Rest exactly 2 minutes between exercises. Move to the next exercise even if you feel you could continue. The goal is consistent effort and strong technique from start to finish.</p>
```

## Tips Field Format

- Separate plain paragraphs OR single paragraph with `<br>` line breaks
- Coaching wisdom, not instructions
- Example with paragraphs:
```html
<p class="tiptap-paragraph">Pace yourself early. Five minutes is longer than it sounds.</p>
<p class="tiptap-paragraph">Prioritize perfect form over speed. Bad reps do not count.</p>
<p class="tiptap-paragraph">Shake out and breathe during rest, do not sit and switch off.</p>
<p class="tiptap-paragraph">If form breaks, slow down or reduce range of motion and continue.</p>
```
- Example with line breaks:
```html
<p class="tiptap-paragraph">Choose a load you can control for all rounds.<br>Land softly on all jumping movements to protect your joints.<br>Keep your core tight during squats, rows, and lunges.<br>If fatigue is high, slow the tempo but keep moving.</p>
```

## What This Applies To
- All Workouts of the Day (WODs)
- All regular workouts
- All training programs
- All AI-generated content

## Absolute Rules
- NEVER start content with empty paragraphs
- ALWAYS use bullet lists (`<ul>`) for exercises, NOT numbered lists or `<br>` separators
- ALWAYS use `class="tiptap-paragraph"` on every `<p>` tag
- ALWAYS use `class="tiptap-bullet-list"` on every `<ul>` tag
- ALWAYS use `class="tiptap-list-item"` on every `<li>` tag
- ALWAYS have three sections: Warm Up, Main Workout, Cool Down
- ALWAYS put duration in section title (e.g., "Warm Up 15'")
- ALWAYS use bold+underlined for section titles
- ALWAYS use bold-only for circuit/round headers
- ALWAYS use empty paragraph between sections
