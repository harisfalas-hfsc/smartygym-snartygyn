# Content Creation Formatting Philosophy - Master Standard

## CRITICAL: This is the definitive formatting standard for ALL content

Based on user's "Functional Foundations" program as the reference template.

## Core Principles

1. **Start Immediately** - Content begins on the FIRST line. NO empty paragraphs at the start. User sees content instantly.

2. **Compact & Readable** - User grasps structure in 2-3 seconds without scrolling through whitespace.

3. **Clear Visual Hierarchy** - Week → Day → Exercises with breathing room between SECTIONS, not between items.

## Exact Formatting Rules

### All Paragraph Tags
- **MUST** have `class="tiptap-paragraph"` on every `<p>` tag
- Example: `<p class="tiptap-paragraph">content</p>`

### Week Titles
- **Bold + Underlined**
- ONE empty paragraph AFTER the title
- Example: `<p class="tiptap-paragraph"><strong><u>Week 1: Foundation Phase</u></strong></p>` then `<p class="tiptap-paragraph"></p>`

### Day Titles  
- **Bold + Underlined**
- ONE empty paragraph AFTER the title before exercises
- Example: `<p class="tiptap-paragraph"><strong><u>Day 1 - Movement Mastery:</u></strong></p>` then `<p class="tiptap-paragraph"></p>`

### Exercise Lists - CRITICAL FORMAT
- **ALL exercises for a day go in ONE single `<p>` tag**
- Start with `<br>` before first exercise
- Separate each exercise with `<br>`
- Exercise names are **NOT bold** - plain numbered text
- Format: `1. Exercise Name: description – sets × reps (notes)`
- Use **colon** after exercise name, **em-dash** for description separator

### Correct Exercise Block Example:
```html
<p class="tiptap-paragraph"><br>1. Goblet Squat: 3 × 10 – focus on depth and control<br>2. Romanian Deadlift: 3 × 10 – slight knee bend, hinge at hips<br>3. Walking Lunges: 3 × 8 each leg<br>4. Plank Hold: 3 × 30 seconds</p>
```

### Between Days
- ONE empty paragraph after the exercise block
- Then the next day title appears

### Section Titles (Description, Overview, etc.)
- Bold + Underlined
- ONE empty paragraph after

## Complete Day Example (Correct Format)
```html
<p class="tiptap-paragraph"><strong><u>Week 1: Foundation Phase</u></strong></p>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph"><strong><u>Day 1 - Movement Mastery:</u></strong></p>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph"><br>1. Goblet Squat: 3 × 10 – focus on depth<br>2. Romanian Deadlift: 3 × 10 – hinge at hips<br>3. Walking Lunges: 3 × 8 each leg<br>4. Plank Hold: 3 × 30 seconds</p>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph"><strong><u>Day 2 - Upper Body Focus:</u></strong></p>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph"><br>1. Push-Ups: 3 × 12<br>2. Dumbbell Rows: 3 × 10 each arm<br>3. Shoulder Press: 3 × 10</p>
<p class="tiptap-paragraph"></p>
```

## What This Applies To
- All training programs
- All workouts (regular and WODs)
- All AI-generated content
- Any content with structured sections

## Absolute Rules
- NEVER start content with empty paragraphs
- NEVER put exercises in separate `<p>` tags - ALL in ONE `<p>` per day
- NEVER bold exercise names - only numbered plain text
- ALWAYS use colon after exercise name
- ALWAYS use `class="tiptap-paragraph"` on every `<p>` tag
- ALWAYS start exercise block with `<br>`
- ALWAYS put ONE empty `<p>` after section/day titles
- ALWAYS put ONE empty `<p>` after exercise blocks
- Content must be immediately visible and scannable
