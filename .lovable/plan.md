

## Fix: AI Workout Generation Quality -- Finisher Logic, Bullet Rules, and Exercise Clarity

### The Problem (Using "Pulse Drive Fusion" as the Bad Example)

The finisher section of today's WOD has multiple quality failures:

```text
Finisher: Metabolic Melt (8')
  * For Time:                                    <-- NOT an exercise, should NOT have a bullet
  * 500m Row sprint                              <-- Vague: rowing machine? sprinting outside?
  * 20 Thrusters (light dumbbell/kettlebell)     <-- Each arm? Total? Only 2 exercises?
  * Focus on completing as fast as possible...   <-- Instruction, NOT an exercise, no bullet
```

**Issue 1 - Bullets used for non-exercises**: "For Time:" is a format label, not an exercise. "Focus on completing as fast as possible" is an instruction, not an exercise. Both got bullet points, making the finisher look like 4 exercises when there are only 2.

**Issue 2 - "For Time" with a fixed 8-minute duration is contradictory**: "For Time" means complete the work as fast as you can and record your time. Prescribing "8 minutes" defeats the purpose -- someone could finish in 3 minutes or 12 minutes. The AI is calculating section durations mathematically to fill the total workout time rather than thinking like a coach.

**Issue 3 - Vague exercise descriptions**: "500m Row sprint" -- is this a rowing machine or sprinting outside? "20 Thrusters (light dumbbell/kettlebell)" -- each arm? Total? What weight range?

**Issue 4 - Insufficient finisher volume**: Only 2 exercises for a finisher is weak. A finisher should have enough work to create a meaningful training stimulus.

**Issue 5 - Instructions mixed into workout content**: "Focus on completing as fast as possible" belongs in the instructions field, not inside the workout content as a bullet point.

---

### The Solution: Update the AI Prompt in the Edge Function

All changes are in one file: `supabase/functions/generate-workout-of-day/index.ts`

The following new rules will be added to the AI prompt:

#### Rule 1: Bullet Points are ONLY for Exercises

Add an explicit, hard rule in the formatting section:

```text
BULLET POINT RULE (ABSOLUTE - NON-NEGOTIABLE):
- Bullet points (<li>) are EXCLUSIVELY for exercises and exercise sets
- NEVER use bullets for: format labels ("For Time:", "AMRAP 10 min:"), 
  instructions ("Focus on form"), rest periods as standalone items, 
  coaching cues, or any non-exercise text
- If it's not something a person physically DOES, it does NOT get a bullet
- Format labels go in the SECTION TITLE (e.g., "Finisher: Power Burn (For Time)")
- Instructions go in the "instructions" field, NOT inside main_workout content
```

#### Rule 2: "For Time" Finishers Must NOT Have Fixed Durations

Update the finisher section (lines 762-770) to add:

```text
FINISHER DURATION RULES (CRITICAL):
- "For Time" finishers: Do NOT prescribe a fixed duration in the section title.
  "For Time" means the athlete completes the work as fast as possible and records their time.
  Writing "Finisher (8')" with "For Time" is contradictory and unprofessional.
  Correct: "Finisher: Power Burn (For Time)" -- no minutes in title
- AMRAP finishers: DO prescribe a time cap (e.g., "Finisher: Burn Out (8-minute AMRAP)")
- Circuit/Tabata finishers: Prescribe rounds, not arbitrary minute totals
- The finisher duration must emerge from the work prescribed, not be artificially set
  to fill remaining time in the workout
```

#### Rule 3: Minimum Finisher Volume

Add minimum exercise requirements:

```text
FINISHER MINIMUM VOLUME (MANDATORY):
- Every finisher must include at least 3-5 distinct exercises or exercise rounds
- A finisher with only 2 exercises (e.g., "500m row + 20 thrusters") is UNACCEPTABLE
  -- it lacks training substance and looks unprofessional
- For Time finishers: 3-5 exercises, potentially repeated in rounds
- AMRAP finishers: 3-4 exercises per round
- Tabata finishers: 4 exercises minimum (each gets 8 rounds of 20/10)
- The finisher must deliver real training value, not filler
```

#### Rule 4: Exercise Description Clarity

Add explicit clarity requirements:

```text
EXERCISE DESCRIPTION CLARITY (MANDATORY):
- Every exercise must specify the EQUIPMENT explicitly:
  WRONG: "500m Row sprint" (row what? rowing machine? sprint where?)
  CORRECT: "500m Rowing Machine" or "500m on Rower"
- Unilateral exercises MUST specify "each side/arm/leg" or "total":
  WRONG: "20 Thrusters (light dumbbell)"
  CORRECT: "20 Dumbbell Thrusters (10 each arm, light weight)" or "20 Barbell Thrusters (light load)"
- Weight guidance must be specific:
  WRONG: "light dumbbell/kettlebell"
  CORRECT: "moderate dumbbell (8-12kg)" or "light kettlebell (8-12kg)"
- Machine exercises: Always name the specific machine
- Free weight exercises: Always name the specific implement (barbell, dumbbell, kettlebell)
- "Sprint" is ONLY for running. On a rowing machine, it's "max effort" or "fast pace"
```

#### Rule 5: No Instructions Inside Workout Content

```text
CONTENT SEPARATION RULE (CRITICAL):
- The "main_workout" field contains ONLY: section titles + exercise lists
- Coaching cues like "Focus on completing as fast as possible with good form" belong 
  in the "instructions" field, NOT as bullet points inside main_workout
- Rest period guidance (e.g., "Rest 60 seconds between rounds") can appear as a 
  plain text line between exercise blocks, but NEVER as a bullet point
```

#### Finisher Gold Standard Examples (added to prompt)

```text
FINISHER EXAMPLES (GOOD vs BAD):

BAD FINISHER (never do this):
  * For Time:
  * 500m Row sprint  
  * 20 Thrusters (light dumbbell/kettlebell)
  * Focus on completing as fast as possible
Problems: bullets on non-exercises, only 2 exercises, vague equipment, 
instructions mixed in, "For Time" with fixed 8-minute duration

GOOD FINISHER - For Time:
Title: "Finisher: Metabolic Surge (For Time)"
  * 500m Rowing Machine (max effort pace)
  * 20 Dumbbell Thrusters (moderate weight, 8-12kg each hand)
  * 30 Box Jumps (20-inch box)
  * 20 Kettlebell Swings (16-20kg)
  * 400m Run or 500m Rowing Machine

GOOD FINISHER - AMRAP:
Title: "Finisher: Final Push (6-minute AMRAP)"
  * 10 Burpees
  * 15 Kettlebell Swings (moderate weight)
  * 20 Air Squats
  * 200m Run

GOOD FINISHER - Tabata:
Title: "Finisher: Tabata Burn (4 min)"
  * Round 1-2: Battle Rope Slams (20 sec work / 10 sec rest)
  * Round 3-4: Burpees (20 sec work / 10 sec rest)
  * Round 5-6: Mountain Climbers (20 sec work / 10 sec rest)
  * Round 7-8: Squat Jumps (20 sec work / 10 sec rest)
```

---

### Technical Implementation

**File to modify:** `supabase/functions/generate-workout-of-day/index.ts`

**Location 1** (around lines 762-796): Update the Finisher section rules to add duration logic, minimum volume, and the "no fixed time with For Time" rule.

**Location 2** (around lines 1456-1527): Update the HTML formatting rules to add the explicit "bullets ONLY for exercises" rule, exercise clarity requirements, and content separation rule.

**Location 3** (around lines 1500-1505): Update the finisher example in the gold standard template to show a proper finisher with 3+ exercises, no format-label bullets, and clear equipment names.

### What Will NOT Change
- The 5-section structure (Soft Tissue, Activation, Main Workout, Finisher, Cool Down)
- Category-specific exercise logic
- Format selection logic
- Periodization cycle
- Any existing category philosophy

