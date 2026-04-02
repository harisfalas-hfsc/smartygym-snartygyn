

# Add Tabata Equipment Constraint to WOD Generation

## The Problem
Standing Calf Raise Machine appeared in a Tabata workout. Machines require setup (adjusting pins, seats, loading plates) which is incompatible with Tabata's 20s work / 10s rest format — there's literally no time to set up or transition.

## The Fix
Add an explicit **Tabata Equipment Rule** to the WOD generation prompt in `supabase/functions/generate-workout-of-day/index.ts`. This is a permanent rule that will apply to all future generations.

### What gets added
A new constraint block near the FORMAT DEFINITIONS section (after line 848) and in the equipment rules sections:

**Rule text to inject into the prompt:**
```
TABATA EQUIPMENT CONSTRAINT (CRITICAL):
When format is TABATA (or any section uses Tabata timing):
• ALLOWED: Dumbbells, kettlebells, barbells (pre-loaded), medicine balls, 
  battle ropes, resistance bands, jump ropes, plyo boxes, bodyweight exercises
  — anything you can grab instantly with ZERO setup time
• FORBIDDEN: ANY machine-based exercise (cable machines, leg press, smith machine, 
  seated/standing calf raise machine, lat pulldown machine, chest press machine, 
  leg extension, leg curl, hack squat, any pin-loaded or plate-loaded machine)
• REASON: Tabata demands instant transitions (10 seconds rest). Machines require 
  setup, adjustment, and travel time that breaks the protocol entirely.
• This applies to ALL Tabata sections including Tabata finishers in MIX format workouts.
```

### Where it gets added
Two locations in the generation prompt:
1. **After the Tabata format definition** (line ~848) — so the AI sees the constraint immediately when reading about Tabata
2. **In the Challenge category equipment rules** (line ~1457-1461) — since Challenge workouts can also use Tabata format

### File changed
- `supabase/functions/generate-workout-of-day/index.ts` — add Tabata equipment constraint in 2 prompt locations

No database migration needed. No UI changes. This is purely a prompt improvement that prevents inappropriate exercise selection in all future Tabata workouts.

