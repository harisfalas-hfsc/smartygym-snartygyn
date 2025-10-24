# Workout Image Standard & Checklist

## ⚠️ CRITICAL RULE: ONE UNIQUE IMAGE PER WORKOUT

**Every single workout MUST have its own unique, distinctive image. NO EXCEPTIONS.**

---

## Standard Process for Adding New Workouts

### ✅ BEFORE Adding Workouts - MANDATORY CHECKLIST

1. **COUNT THE WORKOUTS**
   - How many workouts are you adding? (e.g., 14 workouts)
   
2. **GENERATE UNIQUE IMAGES FIRST**
   - Generate **ONE unique image for EACH workout**
   - Use descriptive prompts based on:
     - Workout name
     - Exercise type (e.g., barbell squat, kettlebell swing, bodyweight movement)
     - Difficulty level
     - Equipment used
     - Training atmosphere
   
3. **NAME IMAGES CLEARLY**
   - Use descriptive filenames: `[workout-name]-workout.jpg`
   - Example: `iron-core-strength-workout.jpg`
   - Example: `bodyweight-fat-melt-workout.jpg`
   - Example: `hfsc-grinder-challenge-workout.jpg`

4. **VERIFY NO DUPLICATES**
   - Before proceeding, confirm each image variable name is UNIQUE
   - Check both `WorkoutDetail.tsx` and `IndividualWorkout.tsx`

---

## Image Generation Guidelines

### Use High-Quality Model for Workouts
```javascript
model: "flux.dev"  // Always use for workout images
width: 1536
height: 1024
```

### Prompt Template
```
Professional fitness photography: [WORKOUT NAME]. [SPECIFIC EXERCISE/MOVEMENT] with [EQUIPMENT], [DIFFICULTY LEVEL] athlete, [ATMOSPHERE/LIGHTING], [UNIQUE CHARACTERISTICS]. Photorealistic, high contrast. 16:9 aspect ratio.
```

### Example Prompts:
```
✅ GOOD - Unique & Specific:
"Professional fitness photography: Iron Core Strength workout. Advanced athlete performing heavy barbell back squat in premium gym, dramatic lighting, intense focus, compound lift setup with barbell, dumbbells, kettlebells visible. Photorealistic, high contrast, powerful stance. 16:9 aspect ratio."

"Professional fitness photography: Bodyweight Fat Melt HIIT workout. Athletic person performing explosive jump squats in bright modern gym, bodyweight only, high-energy HIIT session, dynamic jumping movement, motivational atmosphere. 16:9 aspect ratio."

❌ BAD - Generic:
"Person working out in gym"
"Fitness training"
```

---

## Implementation Checklist

### Step 1: Generate All Images
- [ ] Count total workouts to be added
- [ ] Generate unique image for each workout
- [ ] Save with descriptive names
- [ ] Verify all images are different

### Step 2: Import Images in Both Files
- [ ] Add imports to `src/pages/WorkoutDetail.tsx`
- [ ] Add imports to `src/pages/IndividualWorkout.tsx`
- [ ] Use descriptive variable names (e.g., `ironCoreStrengthImg`, not `workout1Img`)

### Step 3: Update Workout Data
- [ ] Update `WorkoutDetail.tsx` workout array with correct `imageUrl`
- [ ] Update `IndividualWorkout.tsx` workout data with correct `imageUrl`

### Step 4: Verify
- [ ] Check NO workout uses the same image as another
- [ ] Test in browser that all images load correctly
- [ ] Confirm images match their workout descriptions

---

## Common Mistakes to AVOID

### ❌ DON'T DO THIS:
```javascript
// Using same image for multiple workouts
{ id: "wc003", imageUrl: cardioBlastImg }
{ id: "wc004", imageUrl: cardioBlastImg }  // ❌ DUPLICATE!

// Using generic variable names
import workout1Img from "@/assets/workout-1.jpg"  // ❌ NOT DESCRIPTIVE

// Reusing existing images
imageUrl: gravityGrindImg  // ❌ Already used by another workout
```

### ✅ DO THIS INSTEAD:
```javascript
// Each workout has its own image
{ id: "wc003", imageUrl: cardioPowerIntervalsImg }
{ id: "wc004", imageUrl: bodyweightEnduroFlowImg }

// Descriptive variable names
import cardioPowerIntervalsImg from "@/assets/cardio-power-intervals-workout.jpg"

// Generate new unique image
imageUrl: bodyweightFatMeltImg  // ✅ UNIQUE IMAGE
```

---

## Quick Reference: Recently Added Premium Workouts

| Workout ID | Workout Name | Image File | Status |
|-----------|-------------|-----------|--------|
| ws001 | Iron Core Strength | iron-core-strength-workout.jpg | ✅ Unique |
| ws002 | Bodyweight Foundation Strength | bodyweight-foundation-workout.jpg | ✅ Unique |
| wc001 | Calorie Crusher Circuit | calorie-crusher-circuit-workout.jpg | ✅ Unique |
| wc002 | Bodyweight Fat Melt | bodyweight-fat-melt-workout.jpg | ✅ Unique |
| wc003 | Cardio Power Intervals | cardio-power-intervals-workout.jpg | ✅ Unique |
| wc004 | Bodyweight Enduro Flow | bodyweight-enduro-flow-workout.jpg | ✅ Unique |
| wm001 | Metabolic Destroyer | metabolic-destroyer-workout.jpg | ✅ Unique |
| wm002 | Metabolic Body Blast | metabolic-body-blast-workout.jpg | ✅ Unique |
| wmob001 | Mobility Reset | mobility-reset-workout.jpg | ✅ Unique |
| wmob002 | Bodyweight Stability Flow | bodyweight-stability-flow-workout.jpg | ✅ Unique |
| wp001 | Power Surge | power-surge-advanced-workout.jpg | ✅ Unique |
| wp002 | Explosive Body Control | explosive-body-control-workout.jpg | ✅ Unique |
| wch001 | HFSC Challenge 1: The Grinder | hfsc-grinder-challenge-workout.jpg | ✅ Unique |
| wch002 | HFSC Challenge 2: Bodyweight Inferno | hfsc-bodyweight-inferno-workout.jpg | ✅ Unique |

---

## Final Verification Script

Before completing ANY workout additions, run this mental checklist:

1. ✅ Did I generate a NEW unique image for EVERY workout?
2. ✅ Are ALL image filenames descriptive and unique?
3. ✅ Did I import ALL new images in BOTH files?
4. ✅ Did I use the correct unique image variable for each workout?
5. ✅ Did I verify NO images are duplicated?

**If ANY answer is NO, STOP and fix it immediately.**

---

## Remember

> **"One workout = One unique image. Always. No exceptions."**

This standard exists to:
- Prevent user frustration
- Avoid wasting credits on repeated fixes
- Maintain professional quality
- Ensure easy workout identification

---

## MANDATORY ENFORCEMENT RULES (UPDATED 2025-10-24)

1. **Workout images MUST end with "-workout.jpg"**
2. **Training program images MUST end with "-program.jpg"**
3. **ZERO shared images between workouts and programs**
4. **ZERO duplicate images within same category**
5. **Pre-audit checklist MANDATORY before ANY additions**

---

*Last Updated: 2025-10-24*
*Total Premium Workouts: 14 (All Unique)*
*Total Training Programs: 12 (All Unique)*
*Status: ✅ FULLY COMPLIANT*
