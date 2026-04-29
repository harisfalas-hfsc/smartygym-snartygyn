Yes — your understanding is correct.

`Focus` should mean one thing only in this system:

```text
Focus = the Strength training pattern required by the 84-day periodization plan.
```

It is not the same as:
- equipment: BODYWEIGHT / EQUIPMENT
- difficulty: Beginner / Intermediate / Advanced
- format: CIRCUIT / AMRAP / FOR TIME / TABATA / REPS & SETS / EMOM / MIX
- duration
- category
- content

For SmartyGym, `focus` should be used only for `STRENGTH` workouts.

Other categories should not use this Strength focus system:
- Calorie Burning: no Strength focus tag
- Metabolic: no Strength focus tag
- Cardio: no Strength focus tag
- Mobility & Stability: no Strength focus tag
- Challenge: no Strength focus tag
- Pilates: no Strength focus tag
- Recovery: no Strength focus tag
- Micro-Workouts: should not be part of this Strength focus system going forward

Reason: a Tabata, Cardio, Challenge, Mobility, Pilates, or Recovery workout can have a training emphasis in its content, but it is not part of the Strength split rotation. We should not mix those ideas into the same `focus` field, because that would create confusion later.

The six allowed Strength-only focus values are:

```text
LOWER BODY
UPPER BODY
FULL BODY
LOW PUSH & UPPER PULL
LOW PULL & UPPER PUSH
CORE & GLUTES
```

These match the existing 84-day Strength periodization cycle.

Revised plan

1. Treat `focus` as Strength-only metadata
- `focus` will be meaningful only when `category = 'STRENGTH'`.
- For all non-Strength workout categories, the admin form will not show a Strength Focus field.
- Non-Strength categories will not be required to have focus.
- Non-Strength categories will not be tagged with lower body, upper body, push, pull, etc.

2. Tag only existing Strength workouts
- Review the current 72 visible library Strength workouts.
- Assign one of the six official Strength focus labels to each clear Strength workout.
- Classification will be based on the workout name, description, workout content, and linked exercises.
- This is metadata-only: only the `focus` column changes for Strength workouts.

3. Do not modify other workout categories
- I will not tag Calorie Burning, Metabolic, Cardio, Mobility & Stability, Challenge, Pilates, Recovery, or Micro-Workouts as part of this work.
- I will not create a fake/general focus for them.
- I will not add Strength focus choices to their admin creation flow.

4. Future admin creation/editing rule
- In the admin workout editor:
  - if category is `STRENGTH`, show a required `Strength Focus` dropdown.
  - if category is not `STRENGTH`, hide the field.
  - if category is `STRENGTH`, saving is blocked unless the selected focus is one of the six approved labels.
  - if a workout is changed from Strength to another category, the Strength focus should be cleared or ignored so it does not contaminate other categories.

5. Keep existing filters separate
- Equipment remains equipment.
- Difficulty remains difficulty.
- Format remains format.
- Duration remains duration.
- Category remains category.
- Focus is only the Strength split/pattern.

6. Keep Stripe completely separate
- No Stripe product changes.
- No Stripe price changes.
- No checkout changes.
- No paid/free access changes.
- No standalone purchase changes.

7. Keep WOD logic safe
- This does not switch the WOD system to library-selection yet.
- It only prepares the Strength library so library-selection can later pick the correct Strength focus.
- After tagging, I will produce a Strength coverage matrix by:
  - focus
  - difficulty
  - equipment

Example:

```text
Strength Focus                 Beginner BW/EQ   Intermediate BW/EQ   Advanced BW/EQ
LOWER BODY                     count/count      count/count          count/count
UPPER BODY                     count/count      count/count          count/count
FULL BODY                      count/count      count/count          count/count
LOW PUSH & UPPER PULL          count/count      count/count          count/count
LOW PULL & UPPER PUSH          count/count      count/count          count/count
CORE & GLUTES                  count/count      count/count          count/count
```

8. Safety limits
I will not touch:
- workout content HTML
- exercise links
- images
- visibility
- premium flags
- WOD flags
- generated dates
- Stripe IDs
- prices
- user access
- routes
- homepage/WOD card logic

Technical implementation details

- Use the existing `admin_workouts.focus` column.
- Do not add a new database column unless a later separate cleanup proves it is necessary.
- Add a centralized constant for Strength focus options so the admin UI and future logic use the same exact labels.
- Update the admin workout editor only enough to enforce Strength-only focus selection.
- Make display logic careful: show Strength focus only for Strength workouts; for other categories, continue showing format/category information instead of pretending they have a focus.

Final rule going forward

```text
Only STRENGTH workouts use focus.
All other categories do not use Strength focus.
```

This prevents the future misunderstanding you are worried about.