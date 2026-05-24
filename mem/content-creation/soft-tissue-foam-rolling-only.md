---
name: Soft Tissue Foam Rolling Only
description: 🧽 Soft Tissue Preparation section is foam-rolling ONLY, never stretches or library exercises
type: feature
---
The 🧽 Soft Tissue Preparation section in every workout/program must contain
ONLY foam-rolling, lacrosse-ball, tennis-ball, trigger-point release, self-massage,
or myofascial release cues, written in plain text.

Hard rules:
- NEVER use `{{exercise:ID:Name}}` markup in this section.
- NEVER list stretches (hamstring stretch, runner's stretch, cobra, cat-cow), mobility drills
  (circles, swings, hydrants, world's greatest stretch), or any library movement.
- Each line MUST start with one of: `Foam roll`, `Foam-roll`, `Lacrosse ball`,
  `Tennis ball`, `Trigger point`, `Self-massage`, `Myofascial release`.
- Dynamic stretches/mobility belong in 🔥 Activation. Static stretches belong in 🧘 Cool Down.

Enforcement layers:
1. Generator prompts (`generate-category-difficulty-batch`, `generate-strength-focus-batch`,
   `generate-free-category-workouts`, `generate-training-program`) explicitly forbid the
   bad patterns and enumerate allowed line starters.
2. `_shared/section-validator.ts → validateSoftTissueBlock()` rejects saves where the block
   contains exercise markup, lacks any valid keyword, or contains forbidden stretch/mobility words.
3. Edge function `repair-soft-tissue-sections` audits & repairs all visible workouts on demand
   from the admin Content Formatting card (cyan "🧽 Repair Soft Tissue Sections" button).
   Cues are selected by focus/equipment (lower-body / upper-body / full-body).