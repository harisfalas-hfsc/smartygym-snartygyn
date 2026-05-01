UPDATE admin_workouts
SET main_workout = REPLACE(
  main_workout,
  '<p class="tiptap-paragraph">Rest 90 seconds</p><p class="tiptap-paragraph">Rest 90 seconds</p><p class="tiptap-paragraph">Rest 90 seconds</p><p class="tiptap-paragraph">Rest 90 seconds</p><p class="tiptap-paragraph">Rest 60 seconds</p><p class="tiptap-paragraph">Rest 60 seconds</p>',
  '<p class="tiptap-paragraph"><em>Rest 90 seconds between heavy sets (4-set exercises) and 60 seconds between supplemental sets (3-set exercises).</em></p>'
)
WHERE id = 'WOD-S-B-1770503406959';

UPDATE admin_workouts
SET main_workout = REPLACE(
  main_workout,
  '<p class="tiptap-paragraph">Rest 60 seconds</p><p class="tiptap-paragraph">Rest 60 seconds</p><p class="tiptap-paragraph">Rest 60 seconds</p><p class="tiptap-paragraph"><strong>Tabata 4:</strong> box jump down with one leg stabilization (20-24 inch box) (20 sec max reps, 10 sec rest x 8 rounds)</p>',
  '<p class="tiptap-paragraph"><em>Rest 60 seconds between Tabata blocks (each block is 4 minutes: 20s work / 10s rest x 8 rounds).</em></p>'
)
WHERE id = 'WOD-CA-E-1770417008968';