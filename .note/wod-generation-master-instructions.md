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

## Workout Structure with Finisher (MANDATORY)

Every workout MUST include four sequential parts inside the workout content:

### 1. WARM-UP
Standard preparation phase

### 2. MAIN WORKOUT
The core training block that defines the workout's FORMAT label

### 3. FINISHER
A complementary workout block that completes the session

### 4. COOL DOWN
Recovery and stretching phase

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

## Category-Specific Rules

### CATEGORY 1: STRENGTH
**Goal**: Build muscle, increase force production, improve functional strength
**Intensity**: Controlled tempo, structured sets, progressive overload
**Format**: REPS & SETS ONLY (for BOTH bodyweight and equipment)

**Equipment Allowed**: Goblet squats, Kettlebell deadlifts, Romanian deadlifts, Front squats, Bench press variations, Dumbbell row, Bent-over row, Push press, Landmine press, Split squats, Hip hinges, Weighted carries

**Bodyweight Allowed**: Push-up variations, Slow tempo squats, Pistol squat regressions, Glute bridges/hip thrusts, Plank variations, Pull-ups, Dips, Isometrics, Slow tempo lunges, Handstand progressions

**FORBIDDEN**: High knees, Skipping, Burpees, Mountain climbers, Jumping jacks, Sprints, Any cardio-based exercise, EMOM/Tabata/AMRAP formats

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
