

# Shorten Mobile Carousel Descriptions to Fit 2 Lines Without Truncation

## Problem
The `line-clamp-2` class truncates long descriptions with "..." ellipsis. Instead, each description should be rewritten to naturally fit within 2 lines on mobile (390px width, `text-sm` = 14px — roughly 70-80 characters max).

## Changes

### `src/pages/WorkoutFlow.tsx` — Rewrite `workoutDescriptions` (lines 114-125)
Shorten all 10 descriptions to ~80 characters max, and **remove `line-clamp-2`** from line 429:

| Category | Current | New |
|----------|---------|-----|
| wod | "Your daily dose of expertly programmed fitness. The Workout of the Day follows science-based periodization for optimal results and safety." | "Your daily dose of expertly programmed fitness, following science-based periodization." |
| strength | "Standalone single-session workouts designed to develop general strength. Using bodyweight or equipment, these sessions build foundational power and muscular endurance." | "Single-session workouts to build foundational strength, power, and muscular endurance." |
| calorie-burning | "High-intensity interval training formats designed to maximize calorie expenditure. Various workout structures keep you challenged while achieving your fat-burning goals." | "High-intensity sessions designed to maximize calorie burn and fat loss." |
| metabolic | "High-intensity interval training focused on boosting your metabolic rate. These sessions are designed to enhance how efficiently your body burns energy." | "High-intensity training focused on boosting your metabolic rate and energy burn." |
| cardio | "Workouts dedicated to improving cardiovascular endurance and aerobic capacity. Build a stronger heart and better stamina for everyday activities." | "Build cardiovascular endurance, a stronger heart, and better everyday stamina." |
| mobility | "Sessions focused on joint health, mobility, and stability. Improve how your joints move and stabilize during dynamic movements." | "Focused on joint health, mobility, and stability for better movement quality." |
| challenge | "Push beyond your comfort zone with gamification-style workouts. Challenge yourself to break personal boundaries and discover your true potential." | "Gamification-style workouts that push you beyond your comfort zone." |
| pilates | "Controlled movements focused on core strength, spinal alignment, and body awareness. Develop stability and flexibility through precise technique." | "Core strength, spinal alignment, and body awareness through precise movements." |
| recovery | "Active recovery and regeneration sessions designed to help your body repair and rebuild. Essential for long-term performance and injury prevention." | "Active recovery sessions to help your body repair, rebuild, and prevent injuries." |
| micro-workouts | "No time for a run or a trip to the gym? Exercise 'snacks' are the answer. All you need is some stairs, a chair, a wall or just your body and 5 minutes away from your desk or sofa!" | "Quick 5-minute bodyweight exercises you can do anywhere — desk, sofa, or on the go." |

### `src/pages/TrainingProgramFlow.tsx` — Rewrite `programDescriptions` (lines 88-95)
Shorten all 6 descriptions and **remove `line-clamp-2`** from line ~339:

| Category | New |
|----------|-----|
| cardio-endurance | "Multi-week plans to improve cardiovascular endurance, VO2 max, and aerobic capacity." |
| functional-strength | "Build the real-world strength you need for daily life, hobbies, and sports performance." |
| muscle-hypertrophy | "Strategic programs for muscle growth, metabolism, and long-term health." |
| weight-loss | "Combining calorie burning, metabolic training, and muscle building for sustainable results." |
| low-back-pain | "Targeted plans addressing low back pain from office work, daily stress, or physical jobs." |
| mobility-stability | "Improve joint mobility, stability, and movement quality for injury prevention." |

### Summary
- Rewrite 16 description strings across 2 files to fit naturally in 2 lines
- Remove `line-clamp-2` from both files so no ellipsis truncation occurs

