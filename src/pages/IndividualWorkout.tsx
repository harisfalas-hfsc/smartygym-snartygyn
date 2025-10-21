import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { WorkoutDisplay } from "@/components/WorkoutDisplay";
import { PremiumContentGate } from "@/components/PremiumContentGate";
import { WorkoutInteractions } from "@/components/WorkoutInteractions";
import { ShareButtons } from "@/components/ShareButtons";

const IndividualWorkout = () => {
  const navigate = useNavigate();
  const { type, id } = useParams();
  const isFreeWorkout = id?.includes("-free") || id === "iron-core-003";

  // Workout images mapping - matches WorkoutDetail.tsx
  const workoutImages: { [key: string]: string } = {
    "strength-free": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=600&fit=crop",
    "iron-core-003": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop",
    "power-surge-005": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=600&fit=crop",
    "calorie-burning-free": "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&h=600&fit=crop",
    "fat-furnace-002": "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=800&h=600&fit=crop",
    "metabolic-free": "https://images.unsplash.com/photo-1483721310020-03333e577078?w=800&h=600&fit=crop",
    "metaboshock-004": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=600&fit=crop",
    "cardio-free": "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=800&h=600&fit=crop",
    "pulse-igniter-001": "https://images.unsplash.com/photo-1515524738708-327f6b0037a7?w=800&h=600&fit=crop",
    "mobility-free": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop",
    "flowforge-006": "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=800&h=600&fit=crop",
    "challenge-free": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=600&fit=crop",
  };

  // Sample workout names based on type and id
  const workoutNames: { [key: string]: { [key: string]: { name: string; difficulty: number; serial: string } } } = {
    cardio: {
      "cardio-free": { name: "Cardio Foundation", difficulty: 1, serial: "CD-FREE" },
      "pulse-igniter-001": { name: "Pulse Igniter", difficulty: 3, serial: "001" },
      "1": { name: "HIIT Foundation", difficulty: 1, serial: "CD-001" },
      "2": { name: "Cardio Blast Advanced", difficulty: 3, serial: "CD-002" },
    },
    strength: {
      "strength-free": { name: "Beginner Strength Basics", difficulty: 1, serial: "ST-FREE" },
      "iron-core-003": { name: "Iron Core", difficulty: 5, serial: "003" },
      "power-surge-005": { name: "Power Surge", difficulty: 4, serial: "005" },
      "1": { name: "Upper Body Power", difficulty: 2, serial: "ST-001" },
      "2": { name: "Full Body Strength", difficulty: 3, serial: "ST-002" },
    },
    "calorie-burning": {
      "calorie-burning-free": { name: "Fat Burn Starter", difficulty: 1, serial: "CB-FREE" },
      "fat-furnace-002": { name: "Fat Furnace", difficulty: 4, serial: "002" },
    },
    metabolic: {
      "metabolic-free": { name: "Metabolic Basics", difficulty: 1, serial: "MB-FREE" },
      "metaboshock-004": { name: "MetaboShock", difficulty: 4, serial: "004" },
      "1": { name: "Metabolic Circuit", difficulty: 2, serial: "MB-001" },
    },
    mobility: {
      "mobility-free": { name: "Flexibility Fundamentals", difficulty: 1, serial: "MO-FREE" },
      "flowforge-006": { name: "FlowForge", difficulty: 2, serial: "006" },
      "1": { name: "Flexibility Foundation", difficulty: 1, serial: "MB-001" },
      "2": { name: "Advanced Mobility Flow", difficulty: 3, serial: "MB-002" },
    },
    challenge: {
      "challenge-free": { name: "Challenge Starter", difficulty: 1, serial: "CH-FREE" },
      "1": { name: "Ultimate Challenge", difficulty: 5, serial: "CH-001" },
    },
  };

  const workoutInfo = workoutNames[type || "cardio"]?.[id || "1"] || { 
    name: "Workout Session", 
    difficulty: 2,
    serial: "WO-001"
  };

  // Sample exercises data - would come from database
  const exercises = [
    {
      name: "Jumping Jacks",
      video_id: "iSSAk4XCsRA",
      video_url: "https://www.youtube.com/watch?v=iSSAk4XCsRA"
    },
    {
      name: "Push-ups",
      video_id: "IODxDxX7oi4",
      video_url: "https://www.youtube.com/watch?v=IODxDxX7oi4"
    },
    {
      name: "Burpees",
      video_id: "JZQA08SlJnM",
      video_url: "https://www.youtube.com/watch?v=JZQA08SlJnM"
    }
  ];

  // Get specific workout details and descriptions based on workout ID
  const getWorkoutDescription = (workoutId: string) => {
    if (workoutId === "iron-core-003") {
      return `A strength-focused workout targeting major muscle groups. Builds raw power, muscular endurance, and structural integrity. Ideal for intermediate to advanced clients.

🏋️‍♂️ Format: Traditional Sets & Reps
Structure: 3 Sets per exercise
Rest Between Sets: 60–90s

Exercises:
• Barbell Deadlifts – 8 reps
• Dumbbell Bench Press – 10 reps
• Barbell Squats – 8 reps
• Dumbbell Shoulder Press – 10 reps
• Weighted Plank Hold – 30s

Warm-Up & Mobility: 10 mins
Main Strength Block: 40 mins
Cool-Down & Stretch: 10 mins

📋 Instructions
Warm up thoroughly. Use progressive overload. Maintain strict form.

⚠️ Tips
• Never compromise form for heavier weights.
• Use a spotter for bench press if needed.
• Engage glutes and core during squats and deadlifts.`;
    }
    
    return `This comprehensive workout is designed to help you achieve your fitness goals through a structured and progressive approach.`;
  };

  const planContent = getWorkoutDescription(id || "");

  // Get specific workout details based on workout ID
  const getWorkoutDetails = (workoutType: string, workoutId: string) => {
    // STRENGTH WORKOUTS
    if (workoutId === "strength-free") {
      return {
        exercises: [
          {
            name: "Push-Ups",
            sets: "3",
            reps: "10-12",
            rest: "60s",
            notes: "Keep your core tight and lower until chest nearly touches ground. Modify on knees if needed."
          },
          {
            name: "Bodyweight Squats",
            sets: "3",
            reps: "15-20",
            rest: "60s",
            notes: "Keep knees tracking over toes, chest up, and lower until thighs are parallel to ground."
          },
          {
            name: "Plank Hold",
            sets: "3",
            reps: "30-45s",
            rest: "45s",
            notes: "Maintain straight line from head to heels. Don't let hips sag or pike up."
          },
          {
            name: "Lunges (Alternating)",
            sets: "3",
            reps: "10 each leg",
            rest: "60s",
            notes: "Step forward and lower back knee toward ground. Keep front knee at 90 degrees."
          },
          {
            name: "Pike Push-Ups",
            sets: "3",
            reps: "8-10",
            rest: "60s",
            notes: "Start in downward dog position and perform push-ups. Great for shoulders."
          },
          {
            name: "Glute Bridges",
            sets: "3",
            reps: "15-20",
            rest: "45s",
            notes: "Squeeze glutes at the top and hold for 1 second. Keep core engaged."
          }
        ]
      };
    }
    
    if (workoutId === "1" && workoutType === "strength") {
      return {
        exercises: [
          {
            name: "Diamond Push-Ups",
            sets: "4",
            reps: "8-12",
            rest: "90s",
            notes: "Hands form diamond shape. Focuses on triceps. Modify on knees if needed."
          },
          {
            name: "Bulgarian Split Squats",
            sets: "4",
            reps: "10 each leg",
            rest: "90s",
            notes: "Back foot elevated on bench. Increases single-leg strength and stability."
          },
          {
            name: "Decline Push-Ups",
            sets: "3",
            reps: "12-15",
            rest: "60s",
            notes: "Feet elevated on bench or chair. Increases upper chest activation."
          },
          {
            name: "Jump Squats",
            sets: "3",
            reps: "12-15",
            rest: "90s",
            notes: "Explosive power exercise. Land softly with controlled descent."
          },
          {
            name: "Side Plank (each side)",
            sets: "3",
            reps: "30-45s",
            rest: "45s",
            notes: "Works obliques and lateral core stability. Keep hips elevated."
          },
          {
            name: "Single-Leg Glute Bridges",
            sets: "3",
            reps: "12 each leg",
            rest: "60s",
            notes: "Increases difficulty and hip stability. Squeeze glutes hard at top."
          }
        ]
      };
    }

    // CALORIE BURNING WORKOUTS
    if (workoutId === "calorie-burning-free") {
      return {
        exercises: [
          {
            name: "Jumping Jacks",
            sets: "4",
            reps: "30s",
            rest: "30s",
            notes: "Full body warm-up exercise. Keep steady rhythm and breathe consistently."
          },
          {
            name: "High Knees",
            sets: "4",
            reps: "30s",
            rest: "30s",
            notes: "Drive knees up to hip level. Pump arms vigorously for maximum calorie burn."
          },
          {
            name: "Butt Kicks",
            sets: "4",
            reps: "30s",
            rest: "30s",
            notes: "Kick heels to glutes. Maintains heart rate elevation."
          },
          {
            name: "Mountain Climbers",
            sets: "4",
            reps: "30s",
            rest: "30s",
            notes: "Drive knees to chest alternately. Keep core tight and hips level."
          },
          {
            name: "Burpees (Modified)",
            sets: "3",
            reps: "20s",
            rest: "40s",
            notes: "Step back instead of jump if needed. Full body exercise for maximum burn."
          },
          {
            name: "Skater Hops",
            sets: "3",
            reps: "30s",
            rest: "30s",
            notes: "Lateral jumps side to side. Great for leg power and cardio."
          }
        ]
      };
    }

    if (workoutId === "1" && workoutType === "calorie-burning") {
      return {
        exercises: [
          {
            name: "Burpees",
            sets: "5",
            reps: "30s",
            rest: "30s",
            notes: "Full burpee with jump. Maximum calorie expenditure exercise."
          },
          {
            name: "Jump Squats",
            sets: "5",
            reps: "30s",
            rest: "30s",
            notes: "Explosive squats. Land softly and immediately go into next rep."
          },
          {
            name: "High Knees Sprint",
            sets: "5",
            reps: "30s",
            rest: "30s",
            notes: "Maximum intensity. Drive knees as high as possible."
          },
          {
            name: "Plank Jacks",
            sets: "4",
            reps: "30s",
            rest: "30s",
            notes: "In plank position, jump feet out and in. Core + cardio combo."
          },
          {
            name: "Tuck Jumps",
            sets: "4",
            reps: "20s",
            rest: "40s",
            notes: "Jump and bring knees to chest. High intensity plyometric move."
          },
          {
            name: "Speed Skaters",
            sets: "4",
            reps: "30s",
            rest: "30s",
            notes: "Fast lateral bounds. Touch ground with opposite hand for balance."
          }
        ]
      };
    }

    // METABOLIC WORKOUTS
    if (workoutId === "metabolic-free") {
      return {
        exercises: [
          {
            name: "Circuit Round 1: Jump Rope (or imaginary)",
            sets: "3 rounds",
            reps: "45s",
            rest: "15s",
            notes: "Maintain steady pace. Can do imaginary jump rope if no rope available."
          },
          {
            name: "Circuit Round 1: Push-Ups",
            sets: "continue",
            reps: "45s",
            rest: "15s",
            notes: "As many as possible in 45s with good form."
          },
          {
            name: "Circuit Round 1: Squats",
            sets: "continue",
            reps: "45s",
            rest: "90s",
            notes: "Finish round with bodyweight squats. Rest 90s before next round."
          },
          {
            name: "Circuit Round 2: Mountain Climbers",
            sets: "3 rounds",
            reps: "45s",
            rest: "15s",
            notes: "Increase intensity from previous round if possible."
          },
          {
            name: "Circuit Round 2: Dips (on chair)",
            sets: "continue",
            reps: "45s",
            rest: "15s",
            notes: "Use sturdy chair or bench. Lower until elbows at 90 degrees."
          },
          {
            name: "Circuit Round 2: Lunges",
            sets: "continue",
            reps: "45s",
            rest: "90s",
            notes: "Alternating lunges. Complete 3 full rounds."
          }
        ]
      };
    }

    if (workoutId === "1" && workoutType === "metabolic") {
      return {
        exercises: [
          {
            name: "EMOM (Every Minute On the Minute) Block 1",
            sets: "10 minutes",
            reps: "10 Burpees at start of each minute",
            rest: "remainder of minute",
            notes: "Start burpees at 0:00, 1:00, 2:00, etc. Rest is what's left of each minute."
          },
          {
            name: "Rest",
            sets: "1",
            reps: "2 minutes",
            rest: "2 min",
            notes: "Active recovery - walk around, shake out muscles."
          },
          {
            name: "Tabata Block: Jump Squats",
            sets: "8 rounds",
            reps: "20s work / 10s rest",
            rest: "10s between",
            notes: "20 seconds max effort, 10 seconds rest. Repeat 8 times (4 minutes total)."
          },
          {
            name: "Rest",
            sets: "1",
            reps: "1 minute",
            rest: "1 min",
            notes: "Prepare for final block."
          },
          {
            name: "AMRAP (As Many Rounds As Possible) - 5 minutes",
            sets: "AMRAP",
            reps: "10 Push-ups + 15 Mountain Climbers + 20 High Knees",
            rest: "minimal",
            notes: "Complete as many full rounds as possible in 5 minutes."
          }
        ]
      };
    }

    // CARDIO WORKOUTS  
    if (workoutId === "cardio-free") {
      return {
        exercises: [
          {
            name: "Warm-Up Walk/Jog",
            sets: "1",
            reps: "5 minutes",
            rest: "0s",
            notes: "Start easy, gradually increase pace to get heart rate up."
          },
          {
            name: "Easy Pace Jog",
            sets: "1",
            reps: "10 minutes",
            rest: "0s",
            notes: "Maintain conversational pace. Should be able to talk in full sentences."
          },
          {
            name: "Interval Block: Moderate Pace",
            sets: "5",
            reps: "1 min",
            rest: "1 min walk",
            notes: "Slightly faster than easy pace. Alternate with 1 min walking recovery."
          },
          {
            name: "Cool Down",
            sets: "1",
            reps: "5 minutes",
            rest: "0s",
            notes: "Gradually decrease pace to walking. Focus on breathing."
          }
        ]
      };
    }

    if (workoutId === "pulse-igniter-001") {
      return {
        exercises: [
          {
            name: "Tabata Block 1: Jump Rope",
            sets: "8 rounds",
            reps: "20s work / 10s rest",
            rest: "1 min after block",
            notes: "Complete 8 rounds (4 mins total). Work: 20s max effort. Rest: 10s. Use timer app for precision."
          },
          {
            name: "Tabata Block 2: High Knees",
            sets: "8 rounds",
            reps: "20s work / 10s rest",
            rest: "1 min after block",
            notes: "Drive knees to hip level. Maintain intensity throughout all 8 rounds."
          },
          {
            name: "Tabata Block 3: Mountain Climbers",
            sets: "8 rounds",
            reps: "20s work / 10s rest",
            rest: "1 min after block",
            notes: "Keep core engaged and hips level. Fast alternating knee drives."
          },
          {
            name: "Tabata Block 4: Burpees",
            sets: "8 rounds",
            reps: "20s work / 10s rest",
            rest: "1 min after block",
            notes: "Full burpees with jump. Modify by stepping back if needed."
          },
          {
            name: "Tabata Block 5: Jumping Jacks",
            sets: "8 rounds",
            reps: "20s work / 10s rest",
            rest: "1 min after block",
            notes: "Keep steady rhythm. Focus on controlled landing."
          },
          {
            name: "Tabata Block 6: Skater Hops",
            sets: "8 rounds",
            reps: "20s work / 10s rest",
            rest: "Complete",
            notes: "Lateral jumps side to side. Land softly and avoid locking knees."
          }
        ]
      };
    }

    if (workoutId === "1" && workoutType === "cardio") {
      return {
        exercises: [
          {
            name: "Warm-Up",
            sets: "1",
            reps: "5 minutes",
            rest: "0s",
            notes: "Dynamic stretches and light jogging."
          },
          {
            name: "Steady State Run",
            sets: "1",
            reps: "15 minutes",
            rest: "0s",
            notes: "Maintain 65-75% max heart rate. Conversational pace."
          },
          {
            name: "Speed Intervals",
            sets: "6",
            reps: "90s hard / 90s easy",
            rest: "90s between",
            notes: "Push to 85% effort for 90s, recover at easy pace for 90s."
          },
          {
            name: "Recovery Jog",
            sets: "1",
            reps: "5 minutes",
            rest: "0s",
            notes: "Easy pace to bring heart rate down gradually."
          },
          {
            name: "Cool Down & Stretch",
            sets: "1",
            reps: "5 minutes",
            rest: "0s",
            notes: "Walk and static stretching for major muscle groups."
          }
        ]
      };
    }

    // CALORIE BURNING - FAT FURNACE
    if (workoutId === "fat-furnace-002") {
      return {
        exercises: [
          {
            name: "Warm-Up",
            sets: "1",
            reps: "5 minutes",
            rest: "0s",
            notes: "Dynamic movements to prepare body for high-intensity work."
          },
          {
            name: "AMRAP Round 1: Dumbbell Thrusters",
            sets: "AMRAP 30 mins",
            reps: "12 reps",
            rest: "minimal",
            notes: "Squat to overhead press. Use moderate weight. Part of continuous circuit."
          },
          {
            name: "AMRAP Round 1: Jump Squats",
            sets: "continue",
            reps: "15 reps",
            rest: "minimal",
            notes: "Explosive power. Land softly and immediately go into next rep."
          },
          {
            name: "AMRAP Round 1: Dumbbell Renegade Rows",
            sets: "continue",
            reps: "10 reps/side",
            rest: "minimal",
            notes: "In plank position with dumbbells. Row one side then the other. Keep hips stable."
          },
          {
            name: "AMRAP Round 1: Jump Lunges",
            sets: "continue",
            reps: "12 reps/leg",
            rest: "minimal",
            notes: "Switch legs mid-air. Focus on controlled landing."
          },
          {
            name: "AMRAP Round 1: Plank to Push-Up",
            sets: "continue",
            reps: "10 reps",
            rest: "as needed",
            notes: "From forearm plank to high plank. Complete as many full rounds as possible in 30 mins."
          },
          {
            name: "Challenge Finisher: 100 Jumping Jacks",
            sets: "1",
            reps: "100 total",
            rest: "as needed",
            notes: "Break into sets if needed. Complete all 100."
          },
          {
            name: "Challenge Finisher: 50 Mountain Climbers",
            sets: "1",
            reps: "50 total",
            rest: "as needed",
            notes: "Count each knee drive. Total of 50."
          },
          {
            name: "Challenge Finisher: 25 Burpees",
            sets: "1",
            reps: "25 total",
            rest: "Complete",
            notes: "Final push. Complete all 25 burpees to finish."
          },
          {
            name: "Cool Down",
            sets: "1",
            reps: "5 minutes",
            rest: "0s",
            notes: "Light stretching and breathing exercises."
          }
        ]
      };
    }

    // STRENGTH - IRON CORE
    if (workoutId === "iron-core-003") {
      return {
        exercises: [
          {
            name: "Warm-Up & Mobility",
            sets: "1",
            reps: "10 minutes",
            rest: "0s",
            notes: "Dynamic stretches, joint rotations, and activation exercises. Prepare for heavy loads."
          },
          {
            name: "Barbell Deadlifts",
            sets: "3",
            reps: "8 reps",
            rest: "60-90s",
            notes: "Keep bar close to body. Engage glutes and core. Maintain neutral spine throughout."
          },
          {
            name: "Dumbbell Bench Press",
            sets: "3",
            reps: "10 reps",
            rest: "60-90s",
            notes: "Control the weight. Lower until elbows at 90 degrees. Press up explosively."
          },
          {
            name: "Barbell Squats",
            sets: "3",
            reps: "8 reps",
            rest: "60-90s",
            notes: "Bar on upper back. Squat to parallel or below. Drive through heels."
          },
          {
            name: "Dumbbell Shoulder Press",
            sets: "3",
            reps: "10 reps",
            rest: "60-90s",
            notes: "Press overhead while keeping core tight. Control the descent."
          },
          {
            name: "Weighted Plank Hold",
            sets: "3",
            reps: "30s hold",
            rest: "60s",
            notes: "Place weight plate on back. Maintain straight line from head to heels."
          },
          {
            name: "Cool-Down & Stretch",
            sets: "1",
            reps: "10 minutes",
            rest: "0s",
            notes: "Static stretches for all major muscle groups worked. Focus on breathing."
          }
        ]
      };
    }

    // METABOLIC - METABOSHOCK
    if (workoutId === "metaboshock-004") {
      return {
        exercises: [
          {
            name: "Minute 1: Kettlebell Swings",
            sets: "Repeat 3x",
            reps: "20 reps",
            rest: "remainder of minute",
            notes: "Hip-driven movement. Power from hips, not arms. Complete reps then rest until next minute."
          },
          {
            name: "Minute 2: TRX Rows",
            sets: "Repeat 3x",
            reps: "15 reps",
            rest: "remainder of minute",
            notes: "Adjust straps for proper tension. Pull chest to handles. Control descent."
          },
          {
            name: "Minute 3: Jump Squats",
            sets: "Repeat 3x",
            reps: "20 reps",
            rest: "remainder of minute",
            notes: "Explosive jump from squat. Land softly with controlled descent."
          },
          {
            name: "Minute 4: TRX Push-Ups",
            sets: "Repeat 3x",
            reps: "15 reps",
            rest: "remainder of minute",
            notes: "Hands in TRX straps. Engage core for stability. Press up explosively."
          },
          {
            name: "Minute 5: Strategic Recovery",
            sets: "Repeat 3x",
            reps: "Full minute",
            rest: "60s",
            notes: "Complete rest. Breathe deeply. Prepare for next cycle. Total: 3 full cycles (15 mins)."
          }
        ]
      };
    }

    // STRENGTH - POWER SURGE
    if (workoutId === "power-surge-005") {
      return {
        exercises: [
          {
            name: "Warm-Up",
            sets: "1",
            reps: "5 minutes",
            rest: "0s",
            notes: "Dynamic movements and joint mobility. Prepare for explosive work."
          },
          {
            name: "Circuit Round 1: Medicine Ball Slams",
            sets: "5 rounds",
            reps: "15 reps",
            rest: "30s",
            notes: "Explosive overhead slam. Pick up and repeat. 30s work / 30s rest format."
          },
          {
            name: "Circuit Round 1: Band-Resisted Sprints",
            sets: "continue",
            reps: "20m x 3",
            rest: "30s",
            notes: "Attach band around waist. Sprint against resistance for 20m. Walk back. Repeat 3x."
          },
          {
            name: "Circuit Round 1: Wall Ball Throws",
            sets: "continue",
            reps: "12 reps",
            rest: "30s",
            notes: "Squat and explosively throw ball to wall target. Catch and repeat."
          },
          {
            name: "Circuit Round 1: Broad Jumps",
            sets: "continue",
            reps: "6 reps",
            rest: "30s",
            notes: "Maximum distance jump. Land softly. Reset and repeat."
          },
          {
            name: "Circuit Round 1: Plyo Push-Ups",
            sets: "continue",
            reps: "10 reps",
            rest: "30s then next round",
            notes: "Explosive push-up. Hands leave ground. Complete 5 full rounds of all exercises."
          },
          {
            name: "Cool Down",
            sets: "1",
            reps: "5 minutes",
            rest: "0s",
            notes: "Light movement and stretching."
          }
        ]
      };
    }

    // MOBILITY WORKOUTS
    if (workoutId === "mobility-free") {
      return {
        exercises: [
          {
            name: "Cat-Cow Stretch",
            sets: "3",
            reps: "10 reps",
            rest: "30s",
            notes: "On hands and knees. Alternate between arching and rounding spine slowly."
          },
          {
            name: "World's Greatest Stretch",
            sets: "3",
            reps: "5 each side",
            rest: "30s",
            notes: "Lunge position with twist. Opens hips, hamstrings, and thoracic spine."
          },
          {
            name: "Hip Circles",
            sets: "3",
            reps: "10 each direction",
            rest: "30s",
            notes: "Standing, make large circles with hips. Both clockwise and counter-clockwise."
          },
          {
            name: "Shoulder Dislocations (with band or towel)",
            sets: "3",
            reps: "10 reps",
            rest: "30s",
            notes: "Wide grip, pass over head and behind back. Improves shoulder mobility."
          },
          {
            name: "90/90 Hip Stretch",
            sets: "3",
            reps: "45s each side",
            rest: "30s",
            notes: "Seated position. One leg in front at 90°, one behind at 90°. Lean forward."
          },
          {
            name: "Child's Pose to Upward Dog",
            sets: "3",
            reps: "8 reps",
            rest: "30s",
            notes: "Flow between positions. Stretches spine, hips, and shoulders."
          }
        ]
      };
    }

    if (workoutId === "flowforge-006") {
      return {
        exercises: [
          {
            name: "Warm-Up & Breathwork",
            sets: "1",
            reps: "10 minutes",
            rest: "0s",
            notes: "Deep breathing exercises and light movement to prepare body and mind."
          },
          {
            name: "Round 1: Band Shoulder Dislocates",
            sets: "2 rounds",
            reps: "10 reps",
            rest: "minimal",
            notes: "Wide grip on band. Pass over head and behind back. Improves shoulder mobility."
          },
          {
            name: "Round 1: Fit Ball Hip Bridges",
            sets: "continue",
            reps: "12 reps",
            rest: "minimal",
            notes: "Feet on ball. Lift hips. Squeeze glutes at top. Control descent."
          },
          {
            name: "Round 1: Bird-Dog",
            sets: "continue",
            reps: "10 reps/side",
            rest: "minimal",
            notes: "On hands and knees. Extend opposite arm and leg. Hold 2s. Return. Switch."
          },
          {
            name: "Round 1: Deep Squat Hold",
            sets: "continue",
            reps: "45s hold",
            rest: "minimal",
            notes: "Bodyweight squat as deep as possible. Hold position. Focus on breathing."
          },
          {
            name: "Round 1: Side Plank with Reach",
            sets: "continue",
            reps: "30s/side",
            rest: "minimal",
            notes: "Hold side plank. Thread top arm under body then reach up. Repeat."
          },
          {
            name: "Round 1: Cat-Cow Flow",
            sets: "continue",
            reps: "60s",
            rest: "2 min then repeat",
            notes: "Slow alternating spinal flexion and extension. Complete 2 full rounds."
          },
          {
            name: "Stretch & Recovery",
            sets: "1",
            reps: "10 minutes",
            rest: "0s",
            notes: "Extended static stretches for all major muscle groups. Focus on breath and relaxation."
          }
        ]
      };
    }

    if (workoutId === "1" && workoutType === "mobility") {
      return {
        exercises: [
          {
            name: "Dynamic Warm-Up Flow",
            sets: "2",
            reps: "5 min",
            rest: "60s",
            notes: "Arm circles, leg swings, torso twists, neck rolls."
          },
          {
            name: "Deep Squat Hold",
            sets: "3",
            reps: "60s",
            rest: "45s",
            notes: "Sit in bottom of squat. Use hands for balance if needed. Opens hips and ankles."
          },
          {
            name: "Thoracic Bridge",
            sets: "3",
            reps: "10 reps",
            rest: "45s",
            notes: "On hands and feet, lift hips high. Excellent for spine extension."
          },
          {
            name: "Cossack Squats",
            sets: "3",
            reps: "8 each side",
            rest: "60s",
            notes: "Side-to-side shifting squats. Improves hip and adductor mobility."
          },
          {
            name: "Thread the Needle",
            sets: "3",
            reps: "10 each side",
            rest: "45s",
            notes: "On hands and knees, thread arm under body. Rotates thoracic spine."
          },
          {
            name: "Lizard Pose with Rotation",
            sets: "3",
            reps: "8 each side",
            rest: "45s",
            notes: "Low lunge with rotation. Opens hips and improves spinal mobility."
          }
        ]
      };
    }

    // CHALLENGE WORKOUTS
    if (workoutId === "challenge-free") {
      return {
        exercises: [
          {
            name: "100 Push-Up Challenge (can break into sets)",
            sets: "As needed",
            reps: "100 total",
            rest: "as needed",
            notes: "Break into manageable sets. Example: 10 sets of 10, or 5 sets of 20."
          },
          {
            name: "100 Squat Challenge",
            sets: "As needed",
            reps: "100 total",
            rest: "as needed",
            notes: "Bodyweight squats. Focus on full range of motion for all reps."
          },
          {
            name: "3-Minute Plank Hold (total cumulative time)",
            sets: "As needed",
            reps: "3 min total",
            rest: "as needed",
            notes: "Can break into multiple holds. Track total time to reach 3 minutes."
          },
          {
            name: "50 Burpee Challenge",
            sets: "As needed",
            reps: "50 total",
            rest: "minimal",
            notes: "Complete as fast as possible with good form. Time yourself!"
          }
        ]
      };
    }

    if (workoutId === "1" && workoutType === "challenge") {
      return {
        exercises: [
          {
            name: "The Spartan 300 Challenge",
            sets: "1",
            reps: "Complete all 300 reps",
            rest: "minimal",
            notes: "25 Pull-ups, 50 Deadlifts, 50 Push-ups, 50 Box Jumps, 50 Floor Wipers, 50 Kettlebell Clean & Press, 25 Pull-ups. Modify as needed."
          },
          {
            name: "Rest",
            sets: "1",
            reps: "5 minutes",
            rest: "5 min",
            notes: "You'll need it after that! Hydrate well."
          },
          {
            name: "Bonus Round: Max Effort",
            sets: "1",
            reps: "AMRAP - 5 minutes",
            rest: "minimal",
            notes: "5 Burpees + 10 Push-ups + 15 Squats. As many rounds as possible in 5 minutes."
          }
        ]
      };
    }
    
    // Default workout structure for other workouts not yet detailed
    return {
      exercises: [
        {
          name: "Exercise 1",
          sets: "3-4",
          reps: "10-12",
          rest: "60-90s",
          notes: "Detailed workout plan coming soon! This workout will have specific exercises, sets, reps, and rest periods."
        }
      ]
    };
  };

  const workoutDetails = getWorkoutDetails(type || "", id || "");

  const workoutImage = workoutImages[id || ""] || "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=600&fit=crop";

  // Get equipment info based on type
  const getEquipmentInfo = () => {
    if (type?.includes('strength') || id === 'iron-core-003' || id === 'power-surge-005') {
      return 'Dumbbells, Barbells, Equipment';
    }
    if (id === 'fat-furnace-002') {
      return 'Dumbbells, Mat';
    }
    if (id === 'metaboshock-004') {
      return 'Kettlebells, TRX, Mat';
    }
    if (id === 'pulse-igniter-001') {
      return 'Jump Rope, Mat';
    }
    if (id === 'flowforge-006') {
      return 'Fit Ball, Bands, Mat';
    }
    if (type?.includes('cardio') || type?.includes('mobility') || id?.includes('free')) {
      return 'None (Bodyweight)';
    }
    return 'Varies';
  };

  // Get duration info
  const getDurationInfo = () => {
    if (id === 'iron-core-003' || id === 'flowforge-006') return '60 minutes';
    if (id === 'fat-furnace-002') return '45 minutes';
    if (id === 'pulse-igniter-001' || id === 'power-surge-005') return '30 minutes';
    if (id?.includes('free')) return '20-25 minutes';
    if (id === 'metaboshock-004') return '15 minutes';
    return '30-45 minutes';
  };

  const content = (
    <>
      <ShareButtons 
        title={workoutInfo.name} 
        url={window.location.href}
      />

      <WorkoutInteractions
        workoutId={`${type}-${id}`}
        workoutType={type || 'cardio'}
        workoutName={workoutInfo.name}
      />
      
      <WorkoutDisplay
        exercises={exercises}
        planContent={planContent}
        title={workoutInfo.name}
        serial={workoutInfo.serial}
        difficulty={workoutInfo.difficulty}
        workoutDetails={workoutDetails}
        imageUrl={workoutImage}
        duration={getDurationInfo()}
        equipment={getEquipmentInfo()}
      />

      {/* Upsell Banner for Free Workouts */}
      {isFreeWorkout && (
        <div className="mt-8 bg-primary/10 border-2 border-primary/30 rounded-lg p-6 text-center">
          <h3 className="text-xl font-semibold mb-2">Want more?</h3>
          <p className="text-muted-foreground mb-4">
            Unlock 100+ workouts and tools — Join Premium.
          </p>
          <Button size="lg" onClick={() => navigate('/premiumbenefits')}>
            Unlock Premium
          </Button>
        </div>
      )}
    </>
  );

  return (
    <>
      <Helmet>
        <title>{workoutInfo.name} | Smarty Gym</title>
        <meta name="description" content={`${workoutInfo.name} - Workout #${workoutInfo.serial}`} />
      </Helmet>
      
      <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {isFreeWorkout ? content : <PremiumContentGate>{content}</PremiumContentGate>}
      </div>
      </div>
    </>
  );
};

export default IndividualWorkout;
