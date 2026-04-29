select
  count(*) as todays_wod_count,
  bool_or(equipment = 'BODYWEIGHT') as has_bodyweight_wod,
  bool_or(equipment = 'EQUIPMENT') as has_equipment_wod,
  bool_or(equipment = 'VARIOUS') as has_recovery_wod
from public.get_visible_workout_metadata(null)
where is_workout_of_day = true
  and generated_for_date = (now() at time zone 'Europe/Nicosia')::date;