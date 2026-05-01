-- Foundation Pulse Press: 2 stacked Rest 60 lines after the finisher bullet list
UPDATE admin_workouts
SET main_workout = REPLACE(
  main_workout,
  '</ul><p class="tiptap-paragraph">Rest 60 seconds</p><p class="tiptap-paragraph">Rest 60 seconds</p><p class="tiptap-paragraph"></p><p class="tiptap-paragraph">🧘',
  '</ul><p class="tiptap-paragraph"><em>Rest 60 seconds between finisher sets.</em></p><p class="tiptap-paragraph"></p><p class="tiptap-paragraph">🧘'
)
WHERE id = 'WOD-S-B-1770503406959';

-- Glute Core Anchor: 2 duplicate Rest 60 lines at the start of the rest block
-- Keep the meaningful "Rest 90 seconds, then repeat A1-A3..." line.
UPDATE admin_workouts
SET main_workout = REPLACE(
  main_workout,
  '</ul><p class="tiptap-paragraph">Rest 60 seconds</p><p class="tiptap-paragraph">Rest 60 seconds</p><p class="tiptap-paragraph">Rest 90 seconds, then repeat A1-A3 for a total of 3 rounds.</p>',
  '</ul><p class="tiptap-paragraph"><em>Rest 60 seconds between exercises.</em></p><p class="tiptap-paragraph">Rest 90 seconds, then repeat A1-A3 for a total of 3 rounds.</p>'
)
WHERE id = 'WOD-S-E-1770762603515';

-- Tempo Sprint: 2 duplicate Rest 60 lines between Tabata 2 and Tabata 3
UPDATE admin_workouts
SET main_workout = REPLACE(
  main_workout,
  '<p class="tiptap-paragraph">Rest 60 seconds</p><p class="tiptap-paragraph">Rest 60 seconds</p><p class="tiptap-paragraph"><strong>Tabata 3:',
  '<p class="tiptap-paragraph"><em>Rest 60 seconds between Tabata blocks.</em></p><p class="tiptap-paragraph"><strong>Tabata 3:'
)
WHERE id = 'WOD-CH-1764738011704';