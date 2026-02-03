# WOD Generation Master Instructions

This document captures the complete merged workout generation instructions for the Workout of the Day (WOD) system.

## General Workflow

Every day the system creates 2 workouts:
1. **1 Bodyweight** workout
2. **1 Equipment** workout

Both workouts share the same:
- **Category** (ALWAYS identical)
- **Difficulty level** (ALWAYS identical)

Format and Duration can DIFFER between workouts:
- **Format** (can be different per workout, EXCEPT STRENGTH and MOBILITY & STABILITY which are always REPS & SETS for both)
- **Duration** (varies based on each workout's format)

## 7-Day Category Cycle

The categories follow a 7-day rotation:
1. Challenge
2. Strength (REPS & SETS only)
3. Cardio
4. Mobility & Stability (REPS & SETS only)
5. Strength (REPS & SETS only)
6. Metabolic
7. Calorie Burning

After 7 days, the cycle restarts.

## Critical Rules

- **Never mix categories** - each workout must strictly follow its category's training philosophy
- **Never add exercises that don't fit** the category's purpose
- **Always respect** training logic, intensity, and movement patterns
- **Category and Difficulty MUST match** between BODYWEIGHT and EQUIPMENT workouts
- **Format can differ** (except STRENGTH and MOBILITY & STABILITY = always REPS & SETS)

## Format Rules by Category

### Categories that MUST use REPS & SETS for BOTH workouts:
- **STRENGTH**: Both bodyweight and equipment workouts = REPS & SETS
- **MOBILITY & STABILITY**: Both bodyweight and equipment workouts = REPS & SETS

### Categories where format can VARY between workouts:
- **CARDIO**: CIRCUIT, EMOM, FOR TIME, AMRAP, TABATA (bodyweight might be TABATA, equipment might be CIRCUIT)
- **METABOLIC**: CIRCUIT, AMRAP, EMOM, FOR TIME, TABATA
- **CALORIE BURNING**: CIRCUIT, TABATA, AMRAP, FOR TIME, EMOM
- **CHALLENGE**: CIRCUIT, TABATA, AMRAP, EMOM, FOR TIME, MIX

## Difficulty Rotation Logic

The system uses 6 difficulty levels (1-6 stars):
- 1-2 stars: Beginner
- 3-4 stars: Intermediate
- 5-6 stars: Advanced

**Rotation Rule**: Prevent consecutive high-intensity (5-6 stars) workouts. After an advanced workout, the next must be 1-4 stars for recovery.

Example valid sequence: 1 star → 5 stars → 2 stars → 6 stars → 3 stars → 4 stars

## Duration Options (Expanded Range)

Available durations: **15 min, 20 min, 30 min, 45 min, 60 min, or Various**

### Duration Selection Guidelines:
- **15-20 min**: Express sessions - Tabata, short AMRAP, quick EMOM, mobility flows
- **30 min**: Standard balanced workout - most categories, moderate intensity
- **45 min**: Extended session - more exercises, additional warm-up/cool-down, strength with full rest
- **60 min**: Comprehensive workout - full programming with extended main section
- **Various**: Flexible timing - "Complete as fast as possible", "At your own pace", challenge-style, For Time workouts

### Duration-Format Matching:
- Tabata → 15-30 min
- Circuit/AMRAP → 20-45 min
- Reps & Sets (Strength) → 45-60 min
- Mobility & Stability → 20-45 min
- Challenge → Various or 30-45 min
- For Time → Various
- EMOM → 15-30 min

**Note**: Equipment workouts may have longer durations than bodyweight due to equipment setup and heavier loads.

## Format Definitions (Must Follow Exactly)

- **Tabata**: 20 seconds work, 10 seconds rest, 8 rounds per exercise
- **Circuit**: 4-6 exercises repeated 3-5 rounds with minimal rest between exercises
- **AMRAP**: As Many Rounds As Possible in a given time
- **For Time**: Complete all exercises as fast as possible (record time)
- **EMOM**: Every Minute On the Minute - perform set at start of each minute, rest remainder
- **Reps & Sets**: Classic strength format (e.g., 4 sets x 8 reps) with defined rest
- **Mix**: Combination of two or more formats

## Workout Structure (MANDATORY - 5 SECTIONS)

For categories: STRENGTH, CALORIE BURNING, METABOLIC, CARDIO, MOBILITY & STABILITY, CHALLENGE

Every workout MUST include five sequential parts:

### 1. 🧽 SOFT TISSUE PREPARATION (5 min)
- Foam rolling major muscle groups (30-45 sec per area)
- Trigger point release for feet and hips
- Exercises are examples - AI should vary

### 2. 🔥 ACTIVATION (10-15 min)
- Mobility drills, stability work, glute activation
- Dynamic warm-up, movement preparation
- Examples: Cat-Cow, Bird-Dog, Glute Bridge, High Knees, Walking Lunges, A-Skips
- NOT limited to these - AI adds variety

### 3. 💪 MAIN WORKOUT (Category-Specific)
- Follows existing category logic (Strength = strength, Cardio = cardio, etc.)
- All existing AI reasoning per category is PRESERVED
- Format determined by category rules

### 4. ⚡ FINISHER
- Related to the category theme
- DIFFERENT format/structure/intensity than main workout
- Complements the main workout

### 5. 🧘 COOL DOWN (10 min)
- Static stretching (8 min): Examples include quad, hamstring, calf, glute stretches
- Diaphragmatic breathing (2 min): ALWAYS include this
- Exercises are examples - AI can add more

**EXCLUDED FROM 5-SECTION STRUCTURE:**
- PILATES: Uses classical Pilates sequence
- RECOVERY: Uses existing gentle structure
- MICRO-WORKOUTS: Uses abbreviated 5-minute structure

### Finisher Rules by Category

**STRENGTH and MOBILITY & STABILITY:**
- Format: REPS & SETS ONLY (respecting category format rule)
- Load: Reduced compared to main workout
- Reps: Increased compared to main workout
- Purpose: Volume completion without heavy loading
- Example: If main workout uses 4x6 at heavy load, finisher uses 3x12 at lighter load

**CARDIO, METABOLIC, CALORIE BURNING, CHALLENGE:**
- Format: Any allowed format (Circuit, Tabata, EMOM, AMRAP, For Time, single exercise)
- Can differ from main workout format
- Purpose: Metabolic completion or targeted burn
- Example: Main workout is AMRAP, finisher can be Tabata or "100 burpees for time"

### FORMAT DETERMINATION RULE (CRITICAL)
The FORMAT label of the entire workout is determined ONLY by the Main Workout.
The Finisher format does NOT affect the workout's FORMAT classification.
Example: Main Workout = AMRAP, Finisher = Tabata → Workout FORMAT = AMRAP

## Cardio Category Enhancements

### Bodyweight Cardio - Running-Based Work
- **Sprints**: 50m, 100m, 200m distances (full effort)
- **Interval Running**: Alternating sprint/jog patterns
- **Shuttle Runs**: 10m-20m-10m agility patterns, touch lines
- **Tempo Runs**: 200m-400m sustained pace efforts
- **Plus existing**: High knees, burpees, mountain climbers, squat jumps, etc.

### Equipment Cardio - Cardio Machines
- **Treadmill**: Running, sprints, incline work
- **Rowing Machine**: Intervals (500m repeats), distance work, sprint rows
- **Elliptical**: Low-impact cardio intervals, steady state
- **Air Bike / Assault Bike**: High-intensity intervals, calorie targets
- **Spin Bike / Stationary Bike**: Sustained efforts, intervals
- **Ski Erg**: Sprint intervals, sustained efforts
- **Stair Climber**: Intervals, steady state

### Combination Allowed
Equipment cardio workouts CAN combine machines + floor exercises.
Example: 500m Row + 20 Kettlebell Swings + 400m Bike + 15 Box Jumps + 200m Run

## Category-Specific Rules

### CATEGORY 1: STRENGTH
**Goal**: Build muscle, increase force production, improve functional strength
**Intensity**: Controlled tempo, structured sets, progressive overload
**Format**: REPS & SETS ONLY (for BOTH bodyweight and equipment)

**Equipment Allowed**: Goblet squats, Kettlebell deadlifts, Romanian deadlifts, Front squats, Bench press variations, Dumbbell row, Bent-over row, Push press, Landmine press, Split squats, Hip hinges, Weighted carries

**Bodyweight Allowed**: Push-up variations, Slow tempo squats, Pistol squat regressions, Glute bridges/hip thrusts, Plank variations, Pull-ups, Dips, Isometrics, Slow tempo lunges, Handstand progressions

**FORBIDDEN**: High knees, Skipping, Burpees, Mountain climbers, Jumping jacks, Sprints, Any cardio-based exercise, EMOM/Tabata/AMRAP formats

═══════════════════════════════════════════════════════════════════════════════
## STRENGTH CATEGORY FOCUS BY CYCLE DAY (28-DAY PERIODIZATION)
═══════════════════════════════════════════════════════════════════════════════

Each STRENGTH day within the 28-day cycle has a **specific focus area**. The AI **MUST** generate workouts targeting ONLY the specified focus for that day.

| Day | Focus | Description |
|-----|-------|-------------|
| 2   | LOWER BODY | Quads, hamstrings, calves, glutes, adductors, abductors |
| 5   | UPPER BODY | Chest, back, shoulders, biceps, triceps |
| 12  | FULL BODY | Upper + Lower + Core combination |
| 15  | LOW PUSH & UPPER PULL | Lower pushing patterns + Upper pulling patterns |
| 20  | LOW PULL & UPPER PUSH | Lower pulling patterns + Upper pushing patterns |
| 23  | CORE & GLUTES | Core stability + Glute-focused exercises |

### Movement Pattern Definitions (EXAMPLES - Use Intelligent Pattern Recognition)

The AI should use ALL available exercises (gym equipment, free weights, cables, bands, machines, bodyweight) that fit the focus. The examples below are NOT exhaustive - use intelligent pattern recognition:

**LOWER BODY (Day 2)**: Any exercise targeting quads, hamstrings, calves, glutes, adductors, abductors
- Movement patterns: Squats (all variations), lunges (all variations), leg press, hip thrusts, step-ups, calf raises, leg curls, leg extensions, Bulgarian splits, pistol progressions
- Equipment examples: Back squat, front squat, goblet squat, hack squat, leg press, leg curl machine, leg extension machine, Smith machine squats
- Bodyweight examples: Bodyweight squats, lunges, pistol progressions, step-ups, glute bridges, wall sits, calf raises

**UPPER BODY (Day 5)**: Any exercise targeting chest, back, shoulders, biceps, triceps
- Movement patterns: Pressing (horizontal/vertical), pulling (horizontal/vertical), curls, extensions, flys, rows
- Equipment examples: Bench press (all variations), shoulder press, lat pulldown, cable rows, pec deck, bicep curls, tricep pushdowns
- Bodyweight examples: Push-ups (all variations), pull-ups, dips, inverted rows, pike push-ups, diamond push-ups

**FULL BODY (Day 12)**: Combination of upper body, lower body, and core exercises
- Include: Upper push + Upper pull + Lower push + Lower pull + Core
- Can use compound movements that hit multiple muscle groups
- Balance volume across body parts

**LOW PUSH & UPPER PULL (Day 15)**:
- **Lower Push**: Any lower body pushing pattern (squat patterns, lunges, leg press, hip thrusts, step-ups, Bulgarian splits)
- **Upper Pull**: Any upper body pulling pattern (rows, pull-ups, lat pulldowns, bicep curls, face pulls, rear delt work)
- Muscles targeted: Quads, glutes (push) + Back, biceps, rear delts (pull)

**LOW PULL & UPPER PUSH (Day 20)**:
- **Lower Pull**: Any lower body pulling pattern (deadlifts, Romanian deadlifts, sumo deadlifts, leg curls, hip hinges, glute-ham raises)
- **Upper Push**: Any upper body pushing pattern (bench press, shoulder press, push-ups, tricep extensions, dips, flys)
- Muscles targeted: Hamstrings, glutes (pull) + Chest, shoulders, triceps (push)

**CORE & GLUTES (Day 23)**: Core stability + Glute isolation focus
- **Core**: Anti-rotation (Pallof press), anti-extension (planks, dead bugs), anti-flexion (bird dogs), rotational work
- **Glutes**: Hip thrusts, glute bridges, banded work, cable pull-throughs, kickbacks, clamshells
- Focus on stability, activation, and mind-muscle connection

### CRITICAL STRENGTH FOCUS RULES:

1. **Use ALL available exercises** - gym equipment, free weights, cables, bands, machines, bodyweight - that fit the day's focus
2. The exercise examples are **NOT exhaustive** - use intelligent pattern recognition to identify exercises that match the movement pattern
3. **FORBIDDEN**: Using exercises from a DIFFERENT focus on the wrong day
   - Example: On LOWER BODY day (Day 2), NO chest presses, NO rows, NO shoulder work
   - Example: On UPPER BODY day (Day 5), NO squats, NO lunges, NO leg work
   - Example: On LOW PUSH & UPPER PULL day (Day 15), NO deadlifts (lower pull), NO bench press (upper push)
4. Both BODYWEIGHT and EQUIPMENT workouts must follow the same focus
5. Maintain variety across the 28-day cycle - different focus = different exercises each time

### CATEGORY 2: CARDIO
**Goal**: Improve heart rate capacity, aerobic and anaerobic conditioning
**Format**: Circuits, AMRAP, EMOM, Tabata, For Time (can differ between workouts)
**Intensity**: Minimal load, fast pace

**Allowed**: Jogging, Running, Jump rope, Treadmill runs, Rowing machine, Assault bike, High knees, Skipping, Jumping jacks, Burpees, Mountain climbers, Butt kicks, Lateral shuffles, Step-ups (fast), Shadow boxing, Bear crawls, Crab walks

**FORBIDDEN**: Heavy lifting, Slow tempo strength movements, Long rest periods

### CATEGORY 3: METABOLIC
**Goal**: High-intensity, full-body conditioning using strength tools and bodyweight
**Format**: Circuits, AMRAP, EMOM, Tabata, For Time (can differ between workouts)
**Key**: More power, more muscular demand than cardio

**Equipment Allowed**: Kettlebell swings, Battle ropes, Sandbags, Medicine ball slams, Box jumps, Kettlebell clean and press, Thrusters, Rowing intervals

**Bodyweight Allowed**: Burpees, Squat thrusts, Fast lunges, Skater jumps, Mountain climbers, Jump squats, Push-up complexes

**FORBIDDEN**: Slow strength tempo, Isometrics, Static planks, Mixed equipment (keep consistent)

### CATEGORY 4: CALORIE BURNING
**Goal**: High-effort, simple, non-technical exercises that maintain high output
**Format**: Circuit, AMRAP, Tabata, For Time (can differ between workouts)
**Key**: Always keep heart rate HIGH

**Equipment Allowed**: Kettlebell swings, Battle ropes, Rower, Bike, Slam ball, Light dumbbells

**Bodyweight Allowed**: Squat jumps, Burpees, High knees, Lunges, Mountain climbers, Step-ups, Frog hops, Jumping jacks, Tuck jumps

**FORBIDDEN**: Technical Olympic lifts, Slow strength sets, Heavy loading, Complicated sequences

### CATEGORY 5: MOBILITY & STABILITY
**Goal**: Increase joint mobility, core stability, flexibility, controlled movement
**Format**: REPS & SETS ONLY (for BOTH bodyweight and equipment)
**Intensity**: Low to moderate - quality over speed

**Allowed**: Cat-cow, Thoracic rotations, World's greatest stretch, 90/90 hip rotation, Dead bug, Bird dog, Glute bridges, Pallof press, Side planks, Copenhagen holds, Ankle/Shoulder/Hip CARs, Breathing protocols, Pigeon pose, Hip flexor stretches

**FORBIDDEN**: Burpees, Jumps, Running, Skipping, Anything explosive, Anything heavy

### CATEGORY 6: CHALLENGE
**Goal**: Tough session testing endurance, strength, or mental toughness
**Format**: EVERY FORMAT ALLOWED (can differ between workouts)
**Intensity**: VERY HIGH

**Examples**: 100 burpees challenge, 10-min AMRAP, Descending ladders, Bodyweight chippers, EMOM increasing reps, Kettlebell complexes, Rowing distance challenges, Weighted vest challenges

**Challenge Formats**: "Death by...", "100 Rep Challenge", "Descending Ladder", "EMOM + Tabata Combo", "For Time with Cap", "Pyramid", "Chipper"

**FORBIDDEN**: Mobility exercises, Slow technical lifts, Low-intensity movements

### CATEGORY 7: RECOVERY (NOT IN WOD ROTATION)
**Goal**: Active recovery, regeneration, restore and prepare the body for future training
**Format**: MIX ONLY (combination of different modalities)
**Intensity**: ALWAYS LOW - suitable for everyone
**Difficulty**: NOT APPLICABLE - Recovery is ONE workout type suitable for ALL levels (no Beginner/Intermediate/Advanced distinctions)

**EQUIPMENT NOTE**: Recovery workouts do NOT follow the "Equipment/No Equipment" distinction. 
Recovery sessions may use various tools (bicycle, treadmill, fit ball, foam roller, elliptical) but these are NOT traditional gym equipment requirements.

**PRIMARY FOCUS - STRETCHING & MOBILIZATION (ALWAYS FIRST)**:
- Stretching is the MAIN component of Recovery workouts (but not 100%)
- Every Recovery session should prioritize stretching and mobilization as the first/primary part
- Include: Static stretches, PNF stretching, passive stretches, muscle-specific stretching
- Decompression exercises: spine decompression, hip decompression, hanging variations

**Allowed (EXAMPLES - NOT LIMITED TO)**: 
- **Light Aerobic (examples, not limited to)**:
  - Walking, light jogging, indoor/outdoor cycling at very low intensity
  - Elliptical at low pace, swimming (easy laps), light rowing
  - Treadmill walking, outdoor walking, any similar low-intensity aerobic activity
- **Stretching (PRIMARY - always included)**:
  - Static stretches for all major muscle groups
  - PNF stretching, passive stretches
  - Muscle-specific stretching protocols
- **Mobility (always included)**: 
  - Cat-cow, CARs (Controlled Articular Rotations)
  - Scorpions, reverse scorpions, world's greatest stretch
  - Hip circles, hip openers, 90/90 stretches
- **Decompression**: 
  - Spine decompression, hanging, hip decompression exercises
- **Hip Work**: 
  - Hip circles, hip openers, pigeon pose, hip flexor stretches
- **Breathing**: 
  - Diaphragmatic breathing, box breathing, relaxation protocols
- **Light Stability**: 
  - Dead bugs, bird dogs, gentle core work
- **Self-Massage Concepts**: 
  - Foam rolling suggestions, trigger point guidance

**FORBIDDEN**: Burpees, Jumps, Sprints, Heavy weights, High-intensity anything, Time pressure, Competitive elements

**Philosophy**: 
- This is like a "Smarty Ritual" or "three phases in one" - combining gentle aerobic, stretching, and mobility in a regenerative flow
- Recovery workouts are NOT part of the 7-day WOD rotation cycle
- Exercises listed are EXAMPLES - similar low-intensity activities are allowed
- STRETCHING is the core/primary element of every Recovery session

## Exercise Variety Rule (Critical)

The exercise banks listed above are **EXAMPLES and GUIDELINES**, NOT strict limitations.

### ✅ YOU MAY:
- Use SIMILAR exercises that serve the same purpose
- Create VARIATIONS of listed exercises (e.g., close-grip push-ups, sumo deadlifts)
- Find alternatives that match the category's GOAL and INTENSITY
- Introduce variety to keep workouts fresh and engaging

### ❌ YOU MAY NOT:
- Use exercises from a DIFFERENT category's allowed list
- Violate the FORBIDDEN exercises list for each category
- Mix equipment types when consistency is required (especially Metabolic)
- Deviate from the category's training philosophy

**Goal**: Create VARIETY while respecting each category's PURPOSE, INTENSITY, and MOVEMENT PATTERNS.

## Naming Guidelines (Critical for Variety)

### AVOID OVERUSED WORDS - Do NOT start workout names with:
❌ Inferno, Blaze, Fire, Burn, Fury, Storm, Thunder, Power, Beast, Warrior, Elite, Ultimate, Extreme, Sprint

### MATCH NAMES TO CATEGORIES:
- **STRENGTH**: Iron, Foundation, Forge, Builder, Anchor, Pillar, Solid
- **CARDIO**: Pulse, Rush, Flow, Motion, Surge, Stride, Tempo
- **METABOLIC**: Engine, Drive, Catalyst, Ignite, Reactor, Fuel
- **CALORIE BURNING**: Torch, Melt, Shred, Scorch, Heat, Sweat
- **MOBILITY & STABILITY**: Balance, Flow, Restore, Align, Ground, Ease
- **CHALLENGE**: Gauntlet, Test, Summit, Peak, Crucible, Apex

### NAME REQUIREMENTS:
- Keep names 2-4 words
- Be creative and memorable
- Reflect the workout's purpose
- NEVER repeat names between BODYWEIGHT and EQUIPMENT workouts

## Bodyweight vs Equipment Logic

- **Bodyweight workouts**: Must rely ONLY on bodyweight exercises
- **Equipment workouts**: Can mix bodyweight with equipment tools but must feature equipment as the core

## Output Quality

All generated workouts must be:
- Safe
- Professional
- Based on functional training principles
- Suitable for adults
- Compatible with SmartyGym's identity
- Without unnecessary complexity

## Value-for-Money Standards (Critical)

Every workout must deliver SUBSTANTIAL training value. People PAY for these workouts.

### Minimum Volume Guidelines:
- **Beginner (1-2 stars)**: 100-150 total reps/movements minimum
- **Intermediate (3-4 stars)**: 150-250 total reps/movements
- **Advanced (5-6 stars)**: 200-350+ total reps/movements

### Format-Specific Requirements:
- **Circuit/AMRAP/EMOM**: Minimum 150-200+ total movements
- **TABATA**: 8 rounds = 4 minutes per exercise, include 3-5 exercises minimum
- **3 Rounds**: Each round MUST have meaningful volume (minimum 6 exercises OR high rep counts)
- **5 Rounds**: Can have slightly fewer exercises per round

### Examples:
❌ WEAK: "10 burpees, 20 squats, 10 push-ups x3 rounds" = 120 total reps = UNACCEPTABLE
✅ STRONG: "20 burpees, 40 KB swings, 60 box steps, 80 jumping jacks, 100 mountain climbers" = 300 total
✅ STRONG: "5 rounds of: 15 burpees, 20 squats, 15 push-ups, 20 lunges, 15 mountain climbers" = 425 total

## Periodization Context

The AI system receives context about:
- **Yesterday's workout**: Category, difficulty, equipment, format
- **Tomorrow's preview**: Expected category and difficulty

### Scaling Rules:
- After advanced (5-6 stars) → Next should be recovery-focused
- Two advanced days in a row → MUST hit different muscle groups
- Same category consecutive days → Emphasize DIFFERENT movement patterns
- Before intense day → Can include more recovery/mobility in warm-up

### Programming Principles:
1. Each workout must have PURPOSE within the weekly cycle
2. Loading → Recovery → Loading pattern (not random high-intensity every day)
3. Movement pattern variety across days (push/pull/squat/hinge/carry/core)
4. Progressive overload: Increase volume OR intensity, not always both
5. NEVER waste user's time - every minute should deliver training value
6. Workouts should feel COMPLETE - user should feel accomplished
