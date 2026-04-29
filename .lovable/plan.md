Yes — I agree with you. For the Strength workout library page, replacing the Format filter with a Focus filter is the smarter and cleaner idea.

Reason:

```text
Strength page:
Equipment = Bodyweight / Equipment
Level = Beginner / Intermediate / Advanced
Duration = workout length
Focus = Strength split pattern
Format = almost always Reps & Sets, so it adds very little value
```

So on the Strength page, `Focus` is more useful than `Format` because it lets the user find the kind of strength workout they need: lower body, upper body, full body, push/pull, core & glutes, etc.

Important clarification:

```text
This should happen ONLY on the Strength workout page.
```

For all other workout category pages, the Format filter should remain exactly as it is, because for categories like Calorie Burning, Metabolic, Cardio, Challenge, and Micro-Workouts, format is still meaningful: Circuit, AMRAP, For Time, Tabata, EMOM, Mix, etc.

Planned change

1. Add a Strength Focus filter only for `/workout/strength`
- On the Strength workout category page, replace the current `Format` dropdown with `Focus`.
- The options will be:

```text
All Focuses
Lower Body
Upper Body
Full Body
Low Push & Upper Pull
Low Pull & Upper Push
Core & Glutes
```

2. Keep Format filter everywhere else
- Calorie Burning: keep Format
- Metabolic: keep Format
- Cardio: keep Format
- Mobility & Stability: keep Format
- Challenge: keep Format
- Pilates: keep Format
- Recovery: keep Format
- Micro-Workouts: keep Format

No Strength Focus filter will appear outside the Strength page.

3. Filtering behavior
- If the user is on Strength page and selects a Focus, the library will show only Strength workouts with that exact focus.
- Equipment, Level, Duration, Status, Access, Search, and Sort filters will continue to work together with Focus.
- Example: user can filter:

```text
Strength + Bodyweight + Intermediate + Lower Body
```

4. Safety boundaries
This is a front-end filtering change only. I will not touch:
- Stripe products
- prices
- checkout
- subscriptions
- workout content
- exercise links
- images
- visibility flags
- premium/free flags
- WOD publishing flags
- generated dates
- user access
- database schema

5. Future consistency
- The Focus options will use the existing centralized `STRENGTH_FOCUS_OPTIONS` constant already created.
- This prevents duplicate spellings or accidental new focus labels.
- Since the admin editor already requires Focus for Strength workouts, future Strength workouts will automatically be filterable by Focus.

Technical implementation details

- Update `src/pages/WorkoutDetail.tsx`.
- Add a separate `focusFilter` state for the Strength page.
- Update `clearAllFilters` and active-filter detection to include the Focus filter.
- In the filtering logic:
  - if `mappedCategory === 'STRENGTH'`, apply `focusFilter` against `workout.focus`.
  - if not Strength, ignore `focusFilter` completely.
- In the filter UI:
  - if `type === 'strength'`, show `Focus` dropdown instead of `Format`.
  - otherwise, keep the existing `Format` dropdown unchanged.

Final rule after this change

```text
Strength page uses Focus filter instead of Format filter.
All non-Strength pages keep Format filter.
Focus remains Strength-only.
```

This is a safe, logical improvement and it matches the metadata system we just created.