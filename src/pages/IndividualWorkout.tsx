import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Clock, Dumbbell, TrendingUp } from "lucide-react";
import { WorkoutDisplay } from "@/components/WorkoutDisplay";
import { AccessGate } from "@/components/AccessGate";
import burnStartImg from "@/assets/burn-start-workout.jpg";
import sweatCircuitImg from "@/assets/sweat-circuit-workout.jpg";
import bodyBurnoutImg from "@/assets/body-burnout-workout.jpg";
import sweatStormImg from "@/assets/sweat-storm-workout.jpg";
import infernoFlowImg from "@/assets/inferno-flow-workout.jpg";
import calorieCrusherImg from "@/assets/calorie-crusher-workout.jpg";
import powerFoundationImg from "@/assets/power-foundation-workout.jpg";
import ironCoreImg from "@/assets/iron-core-workout.jpg";
import coreBuilderImg from "@/assets/core-builder-workout.jpg";
import starterStrengthImg from "@/assets/starter-strength-workout.jpg";
import gravityGrindImg from "@/assets/gravity-grind-workout.jpg";
import ironCircuitImg from "@/assets/iron-circuit-workout.jpg";
import bodyweightBeastImg from "@/assets/bodyweight-beast-workout.jpg";
import ironEngineImg from "@/assets/iron-engine-workout.jpg";
import metabolicBurnImg from "@/assets/metabolic-burn-workout.jpg";
import fatFurnaceImg from "@/assets/fat-furnace-workout.jpg";
import metabolicIgnitionImg from "@/assets/metabolic-ignition-workout.jpg";
import metaboShockImg from "@/assets/metaboshock-workout.jpg";
import cardioBlastImg from "@/assets/cardio-blast-workout.jpg";
import pulseIgniterImg from "@/assets/pulse-igniter-workout.jpg";
import flowMobilityImg from "@/assets/flow-mobility-workout.jpg";
import flowForgeImg from "@/assets/flowforge-workout.jpg";
import flowStarterImg from "@/assets/flow-starter-workout.jpg";
import bandBalanceImg from "@/assets/band-balance-workout.jpg";
import coreFlowImg from "@/assets/core-flow-workout.jpg";
import stabilityCircuitImg from "@/assets/stability-circuit-workout.jpg";
import mobilityMasteryImg from "@/assets/mobility-mastery-workout.jpg";
import balanceForgeImg from "@/assets/balance-forge-workout.jpg";
import powerSurgeImg from "@/assets/power-surge-workout.jpg";
import ultimateChallengeImg from "@/assets/ultimate-challenge-workout.jpg";
import powerPrimerImg from "@/assets/power-primer-workout.jpg";
import explosiveStartImg from "@/assets/explosive-start-workout.jpg";
import bodyBlastImg from "@/assets/body-blast-workout.jpg";
import powerCircuitProImg from "@/assets/power-circuit-pro-workout.jpg";
import explosiveEngineImg from "@/assets/explosive-engine-workout.jpg";
import powerSurgeEliteImg from "@/assets/power-surge-elite-workout.jpg";
import metaboLiteImg from "@/assets/metabo-lite-workout.jpg";
import metaboStartImg from "@/assets/metabo-start-workout.jpg";
import metaboFlowImg from "@/assets/metabo-flow-workout.jpg";
import metaboChargeImg from "@/assets/metabo-charge-workout.jpg";
import metaboInfernoImg from "@/assets/metabo-inferno-workout.jpg";
import metaboSurgeImg from "@/assets/metabo-surge-workout.jpg";
import starterGauntletImg from "@/assets/starter-gauntlet-workout.jpg";
import challengePrepImg from "@/assets/challenge-prep-workout.jpg";
import bodyweightBlitzImg from "@/assets/bodyweight-blitz-workout.jpg";
import challengeCircuitProImg from "@/assets/challenge-circuit-pro-workout.jpg";
import finalFormImg from "@/assets/final-form-workout.jpg";
import eliteGauntletImg from "@/assets/elite-gauntlet-workout.jpg";

const IndividualWorkout = () => {
  const navigate = useNavigate();
  const { type, id } = useParams();

  // Free workouts (accessible by logged-in members)
  const freeWorkouts = [
    'challenge-002', // Starter Gauntlet
    'challenge-003', // Challenge Prep
    'challenge-004', // Bodyweight Blitz
    'challenge-005', // Challenge Circuit Pro
    'challenge-006', // Final Form
    'challenge-007', // Elite Gauntlet
    'power-037', // Power Primer
    'power-038', // Explosive Start
    'power-039', // Body Blast
    'power-040', // Power Circuit Pro
    'power-041', // Explosive Engine
    'power-042', // Power Surge Elite
    'mobility-025', // Flow Starter
    'mobility-026', // Band Balance
    'mobility-027', // Core Flow
    'mobility-028', // Stability Circuit
    'mobility-029', // Mobility Mastery
    'mobility-030', // Balance Forge
    'metabolic-043', // Metabo Pulse
    'metabolic-044', // Metabo Band Boost
    'metabolic-045', // Metabo Sprint
    'metabolic-046', // Metabo Hybrid
    'metabolic-047', // Metabo Max
    'metabolic-048', // Metabo Forge
  ];
  const isFreeWorkout = freeWorkouts.includes(id || '');

  // Helper function to format focus label
  const getFocusLabel = (type: string | undefined): string => {
    const focusMap: { [key: string]: string } = {
      'strength': 'Strength',
      'calorie': 'Calorie Burning',
      'calorie-burning': 'Calorie Burning',
      'metabolic': 'Metabolic',
      'cardio': 'Cardio',
      'mobility': 'Mobility & Stability',
      'power': 'Power',
      'challenge': 'Challenge'
    };
    return focusMap[type || ''] || 'General Fitness';
  };

  // Workout data structure
  const workoutData: {
    [key: string]: {
      name: string;
      serialNumber: string;
      difficulty: string;
      duration: string;
      equipment: string;
      imageUrl: string;
      description: string;
      workoutType?: string;
      format: string;
      instructions: string;
      exercises: Array<{
        name: string;
        sets: string;
        reps: string;
        rest: string;
        notes: string;
      }>;
      tips: string[];
    };
  } = {
    "challenge-002": {
      name: "Starter Gauntlet",
      serialNumber: "CHA-BBW-031",
      difficulty: "Beginner",
      duration: "30 min",
      equipment: "No Equipment Required",
      imageUrl: starterGauntletImg,
      description: "A simple but motivating challenge workout using bodyweight movements in a round-based format. Designed to build confidence and consistency.",
      workoutType: "FOR ROUNDS",
      format: `3 Rounds
Work at your own pace
Rest 1 minute between rounds`,
      instructions: "Complete all exercises in order. Rest 1 minute between rounds. Track your time for each round.",
      exercises: [
        {
          name: "Bodyweight Squats",
          sets: "3 rounds",
          reps: "20",
          rest: "0",
          notes: "Full range of motion, chest up"
        },
        {
          name: "Incline Push-Ups",
          sets: "3 rounds",
          reps: "15",
          rest: "0",
          notes: "Hands elevated, controlled descent"
        },
        {
          name: "Glute Bridges",
          sets: "3 rounds",
          reps: "20",
          rest: "0",
          notes: "Squeeze glutes at top"
        },
        {
          name: "Bird-Dog",
          sets: "3 rounds",
          reps: "10/side",
          rest: "0",
          notes: "Maintain neutral spine"
        },
        {
          name: "Wall Sit",
          sets: "3 rounds",
          reps: "30s",
          rest: "60s after round",
          notes: "Thighs parallel to ground"
        }
      ],
      tips: [
        "Focus on clean reps",
        "Don't rush transitions",
        "Use breath to manage effort",
        "Track your time for each round",
        "Maintain proper form throughout"
      ]
    },
    "challenge-003": {
      name: "Challenge Prep",
      serialNumber: "CHA-EQ-032",
      difficulty: "Beginner",
      duration: "30 min",
      equipment: "Equipment Required",
      imageUrl: challengePrepImg,
      description: "A light challenge-style circuit using dumbbells and bands to build strength and stamina in a timed format.",
      workoutType: "CIRCUIT",
      format: `Circuit – 3 rounds
Work: 40s / Rest: 20s
Rest 1 minute between rounds`,
      instructions: "Perform each move for 40 seconds. Rest 20 seconds between exercises. Rest 1 minute between rounds.",
      exercises: [
        {
          name: "Dumbbell Goblet Squat",
          sets: "3 rounds",
          reps: "40s",
          rest: "20s",
          notes: "Hold dumbbell at chest, squat deep"
        },
        {
          name: "Band Row",
          sets: "3 rounds",
          reps: "40s",
          rest: "20s",
          notes: "Pull band to chest, squeeze shoulder blades"
        },
        {
          name: "Dumbbell Shoulder Press",
          sets: "3 rounds",
          reps: "40s",
          rest: "20s",
          notes: "Press overhead, control descent"
        },
        {
          name: "Band Lateral Walks",
          sets: "3 rounds",
          reps: "40s",
          rest: "20s",
          notes: "Band around knees, stay low"
        },
        {
          name: "Plank Hold",
          sets: "3 rounds",
          reps: "30s",
          rest: "60s after round",
          notes: "Maintain straight line from head to heels"
        }
      ],
      tips: [
        "Choose light weights",
        "Keep band tension consistent",
        "Don't sacrifice form for speed",
        "Focus on controlled movements",
        "Rest fully between rounds"
      ]
    },
    "challenge-004": {
      name: "Bodyweight Blitz",
      serialNumber: "CHA-BBW-033",
      difficulty: "Intermediate",
      duration: "45 min",
      equipment: "No Equipment Required",
      imageUrl: bodyweightBlitzImg,
      description: "A fast-paced bodyweight challenge designed to push endurance and mental grit. Complete as many rounds as possible.",
      workoutType: "AMRAP",
      format: `AMRAP – 30 mins
Finisher – 10 mins
Warm-Up & Cool-Down – 5 mins`,
      instructions: "Complete as many rounds as possible. Rest only when needed. Finish with a challenge block.",
      exercises: [
        {
          name: "Main Block (30 mins AMRAP)",
          sets: "AMRAP",
          reps: "As many rounds as possible",
          rest: "As needed",
          notes: "Jump Squats – 15 reps, Push-Ups – 12 reps, Reverse Lunges – 10 reps/leg, Plank Shoulder Taps – 20 reps, Burpees – 8 reps"
        },
        {
          name: "Finisher (10 mins)",
          sets: "1",
          reps: "Complete all",
          rest: "0",
          notes: "100 High Knees, 50 Mountain Climbers, 25 Jumping Jacks"
        }
      ],
      tips: [
        "Pace yourself early",
        "Use full range of motion",
        "Stay consistent across rounds",
        "Rest strategically",
        "Push through the finisher"
      ]
    },
    "challenge-005": {
      name: "Challenge Circuit Pro",
      serialNumber: "CHA-EQ-034",
      difficulty: "Intermediate",
      duration: "45 min",
      equipment: "Equipment Required",
      imageUrl: challengeCircuitProImg,
      description: "A high-intensity challenge using dumbbells, kettlebells, and jump rope to push strength and cardio limits.",
      workoutType: "HIIT",
      format: `HIIT – 4 rounds
Work: 45s / Rest: 15s
Rest 1 minute between rounds`,
      instructions: "Push max effort during work intervals. Rest 1 minute between rounds.",
      exercises: [
        {
          name: "Jump Rope",
          sets: "4 rounds",
          reps: "45s",
          rest: "15s",
          notes: "Maintain steady rhythm"
        },
        {
          name: "Dumbbell Thrusters",
          sets: "4 rounds",
          reps: "45s",
          rest: "15s",
          notes: "Front squat to overhead press"
        },
        {
          name: "Kettlebell Swings",
          sets: "4 rounds",
          reps: "45s",
          rest: "15s",
          notes: "Hip hinge, explosive drive"
        },
        {
          name: "Dumbbell Renegade Rows",
          sets: "4 rounds",
          reps: "45s",
          rest: "15s",
          notes: "Plank position, row alternating"
        },
        {
          name: "Burpees",
          sets: "4 rounds",
          reps: "45s",
          rest: "60s after round",
          notes: "Full range, explosive jump"
        }
      ],
      tips: [
        "Keep jump rope rhythm steady",
        "Choose weights that challenge you",
        "Don't sacrifice form for speed",
        "Breathe consistently",
        "Push max effort during work intervals"
      ]
    },
    "challenge-006": {
      name: "Final Form",
      serialNumber: "CHA-BBW-035",
      difficulty: "Advanced",
      duration: "60 min",
      equipment: "No Equipment Required",
      imageUrl: finalFormImg,
      description: "A brutal bodyweight challenge designed to test endurance, strength, and mental toughness. Complete the full workout as fast as possible.",
      workoutType: "FOR TIME",
      format: `For Time – 3 blocks
Rest: 2 mins between blocks
Complete each block as fast as possible`,
      instructions: "Complete each block as fast as possible. Rest only as needed within blocks. Take 2 minutes rest between blocks.",
      exercises: [
        {
          name: "Block 1 (15 mins)",
          sets: "Repeat for 15 mins",
          reps: "20-15-10",
          rest: "As needed",
          notes: "20 Jump Squats, 15 Push-Ups, 10 Burpees - Repeat"
        },
        {
          name: "Block 2 (15 mins)",
          sets: "Repeat for 15 mins",
          reps: "20-15-10",
          rest: "As needed",
          notes: "20 Mountain Climbers, 15 Jump Lunges, 10 Plank Jacks - Repeat"
        },
        {
          name: "Block 3 (15 mins)",
          sets: "Repeat for 15 mins",
          reps: "20-15-10",
          rest: "As needed",
          notes: "20 High Knees, 15 Tuck Jumps, 10 Push-Up to Pike - Repeat"
        }
      ],
      tips: [
        "Explode through jumps",
        "Keep transitions tight",
        "Hydrate between blocks",
        "Maintain mental toughness",
        "Track rounds completed per block"
      ]
    },
    "challenge-007": {
      name: "Elite Gauntlet",
      serialNumber: "CHA-EQ-036",
      difficulty: "Advanced",
      duration: "60 min",
      equipment: "Equipment Required",
      imageUrl: eliteGauntletImg,
      description: "An elite challenge using medicine balls, wall balls, and bands in a Tabata format. Built for explosive power and endurance.",
      workoutType: "TABATA",
      format: `Tabata – 6 blocks
Work: 20s / Rest: 10s x 8 rounds per block
Rest 1 minute between blocks`,
      instructions: "Complete each Tabata block before moving to the next. Rest 1 minute between blocks. Each block = 4 minutes.",
      exercises: [
        {
          name: "Block 1: Medicine Ball Slams",
          sets: "8 rounds",
          reps: "20s work / 10s rest",
          rest: "60s after block",
          notes: "Explosive overhead slams"
        },
        {
          name: "Block 2: Wall Ball Throws",
          sets: "8 rounds",
          reps: "20s work / 10s rest",
          rest: "60s after block",
          notes: "Squat to throw, catch and repeat"
        },
        {
          name: "Block 3: Band Sprints",
          sets: "8 rounds",
          reps: "20s work / 10s rest",
          rest: "60s after block",
          notes: "Band around waist, sprint in place"
        },
        {
          name: "Block 4: Jump Lunges",
          sets: "8 rounds",
          reps: "20s work / 10s rest",
          rest: "60s after block",
          notes: "Explosive alternating lunges"
        },
        {
          name: "Block 5: Plyo Push-Ups",
          sets: "8 rounds",
          reps: "20s work / 10s rest",
          rest: "60s after block",
          notes: "Hands leave ground on each rep"
        },
        {
          name: "Block 6: Plank Rows",
          sets: "8 rounds",
          reps: "20s work / 10s rest",
          rest: "0",
          notes: "Plank position with band rows"
        }
      ],
      tips: [
        "Use explosive power",
        "Keep band tension consistent",
        "Don't skip rest intervals",
        "Maintain intensity across all 8 rounds",
        "Focus on quality over quantity"
      ]
    },
    "power-037": {
      name: "Power Primer",
      serialNumber: "POW-BBW-037",
      difficulty: "Beginner",
      duration: "30 min",
      equipment: "No Equipment Required",
      imageUrl: powerPrimerImg,
      description: "A beginner-friendly circuit focused on basic explosive movements and coordination. Builds foundational power and neuromuscular control.",
      workoutType: "CIRCUIT",
      format: `Circuit – 3 rounds
Work: 30s / Rest: 30s`,
      instructions: "Perform each move with intent and control. Rest 1 minute between rounds.",
      exercises: [
        {
          name: "Squat to Calf Raise",
          sets: "3 rounds",
          reps: "12",
          rest: "30s",
          notes: "Controlled movement"
        },
        {
          name: "Step-Back Lunge to Knee Drive",
          sets: "3 rounds",
          reps: "10/leg",
          rest: "30s",
          notes: "Balance and control"
        },
        {
          name: "Jumping Jacks",
          sets: "3 rounds",
          reps: "30s",
          rest: "30s",
          notes: "Continuous movement"
        },
        {
          name: "Glute Bridge",
          sets: "3 rounds",
          reps: "15",
          rest: "30s",
          notes: "Squeeze at top"
        },
        {
          name: "Plank Shoulder Taps",
          sets: "3 rounds",
          reps: "20",
          rest: "60s after round",
          notes: "Keep hips stable"
        }
      ],
      tips: [
        "Focus on landing softly",
        "Use arms to drive movement",
        "Keep core engaged during jumps"
      ]
    },
    "power-038": {
      name: "Explosive Start",
      serialNumber: "POW-EQ-038",
      difficulty: "Beginner",
      duration: "30 min",
      equipment: "Resistance Bands, Medicine Ball, Mat",
      imageUrl: explosiveStartImg,
      description: "A light resistance workout using bands and medicine ball to introduce explosive movement patterns safely.",
      workoutType: "REPS & SETS",
      format: `3 sets per exercise
Rest: 45s between sets`,
      instructions: "Use light resistance. Focus on speed of movement with control.",
      exercises: [
        {
          name: "Band Squat to Press",
          sets: "3",
          reps: "12",
          rest: "45s",
          notes: "Explosive press"
        },
        {
          name: "Medicine Ball Chest Pass (against wall)",
          sets: "3",
          reps: "10",
          rest: "45s",
          notes: "Catch and throw quickly"
        },
        {
          name: "Band Lateral Steps",
          sets: "3",
          reps: "10/side",
          rest: "45s",
          notes: "Keep tension"
        },
        {
          name: "Medicine Ball Slams",
          sets: "3",
          reps: "12",
          rest: "45s",
          notes: "Full body engagement"
        },
        {
          name: "Plank Hold",
          sets: "3",
          reps: "30s",
          rest: "45s",
          notes: "Maintain neutral spine"
        }
      ],
      tips: [
        "Don't overextend joints",
        "Use full-body coordination",
        "Keep band tension consistent"
      ]
    },
    "power-039": {
      name: "Body Blast",
      serialNumber: "POW-BBW-039",
      difficulty: "Intermediate",
      duration: "45 min",
      equipment: "No Equipment Required",
      imageUrl: bodyBlastImg,
      description: "A high-intensity bodyweight workout using plyometrics and dynamic core moves to build explosive power and coordination.",
      workoutType: "HIIT",
      format: `HIIT – 4 rounds
Work: 45s / Rest: 15s`,
      instructions: "Push max effort during work intervals. Rest 1 minute between rounds.",
      exercises: [
        {
          name: "Jump Squats",
          sets: "4 rounds",
          reps: "45s work",
          rest: "15s",
          notes: "Explosive jumps"
        },
        {
          name: "Push-Up to Pike",
          sets: "4 rounds",
          reps: "45s work",
          rest: "15s",
          notes: "Controlled movement"
        },
        {
          name: "Jump Lunges",
          sets: "4 rounds",
          reps: "45s work",
          rest: "15s",
          notes: "Alternate legs"
        },
        {
          name: "Plank Jacks",
          sets: "4 rounds",
          reps: "45s work",
          rest: "15s",
          notes: "Keep hips level"
        },
        {
          name: "Burpees",
          sets: "4 rounds",
          reps: "45s work",
          rest: "60s after round",
          notes: "Full range of motion"
        }
      ],
      tips: [
        "Land softly during jumps",
        "Keep knees aligned",
        "Use breath to stabilize"
      ]
    },
    "power-040": {
      name: "Power Circuit Pro",
      serialNumber: "POW-EQ-040",
      difficulty: "Intermediate",
      duration: "45 min",
      equipment: "Medicine Ball, Wall Ball, Bands, Mat",
      imageUrl: powerCircuitProImg,
      description: "A full-body power circuit using medicine ball, wall ball, and resistance bands to build explosive strength and reactive control.",
      workoutType: "CIRCUIT",
      format: `Circuit – 4 rounds
Work: 40s / Rest: 20s`,
      instructions: "Push hard during work intervals. Rest 1 minute between rounds.",
      exercises: [
        {
          name: "Medicine Ball Slams",
          sets: "4 rounds",
          reps: "40s work",
          rest: "20s",
          notes: "Explosive power"
        },
        {
          name: "Wall Ball Squat to Press",
          sets: "4 rounds",
          reps: "40s work",
          rest: "20s",
          notes: "Full squat depth"
        },
        {
          name: "Band-Resisted Sprints",
          sets: "4 rounds",
          reps: "3 x 20m",
          rest: "20s",
          notes: "Maximum effort"
        },
        {
          name: "Jump Lunges",
          sets: "4 rounds",
          reps: "40s work",
          rest: "20s",
          notes: "Alternate legs"
        },
        {
          name: "Plank Rows",
          sets: "4 rounds",
          reps: "40s work",
          rest: "60s after round",
          notes: "Maintain plank position"
        }
      ],
      tips: [
        "Use explosive hip drive",
        "Control wall ball throws",
        "Keep band tension consistent"
      ]
    },
    "power-041": {
      name: "Explosive Engine",
      serialNumber: "POW-BBW-041",
      difficulty: "Advanced",
      duration: "60 min",
      equipment: "No Equipment Required",
      imageUrl: explosiveEngineImg,
      description: "An advanced bodyweight challenge focused on explosive strength, plyometrics, and reactive control. Designed for elite performance.",
      workoutType: "FOR TIME",
      format: `For Time – 3 blocks
Rest: 2 mins between blocks`,
      instructions: "Complete each block as fast as possible. Rest only as needed.",
      exercises: [
        {
          name: "Block 1: Jump Squats",
          sets: "Repeat for 15 mins",
          reps: "20",
          rest: "As needed",
          notes: "Explosive power"
        },
        {
          name: "Block 1: Plyo Push-Ups",
          sets: "Repeat for 15 mins",
          reps: "15",
          rest: "As needed",
          notes: "Hands leave ground"
        },
        {
          name: "Block 1: Burpees",
          sets: "Repeat for 15 mins",
          reps: "10",
          rest: "120s after block",
          notes: "Full range"
        },
        {
          name: "Block 2: Tuck Jumps",
          sets: "Repeat for 15 mins",
          reps: "20",
          rest: "As needed",
          notes: "Knees to chest"
        },
        {
          name: "Block 2: Jump Lunges",
          sets: "Repeat for 15 mins",
          reps: "15",
          rest: "As needed",
          notes: "Alternate legs"
        },
        {
          name: "Block 2: Push-Up to Pike",
          sets: "Repeat for 15 mins",
          reps: "10",
          rest: "120s after block",
          notes: "Controlled movement"
        },
        {
          name: "Block 3: High Knees",
          sets: "Repeat for 15 mins",
          reps: "20",
          rest: "As needed",
          notes: "Fast pace"
        },
        {
          name: "Block 3: Broad Jumps",
          sets: "Repeat for 15 mins",
          reps: "15",
          rest: "As needed",
          notes: "Maximum distance"
        },
        {
          name: "Block 3: Plank Jacks",
          sets: "Repeat for 15 mins",
          reps: "10",
          rest: "0",
          notes: "Keep hips stable"
        }
      ],
      tips: [
        "Explode through jumps",
        "Keep transitions tight",
        "Hydrate between blocks"
      ]
    },
    "power-042": {
      name: "Power Surge Elite",
      serialNumber: "POW-EQ-042",
      difficulty: "Advanced",
      duration: "60 min",
      equipment: "Barbell, Medicine Ball, Bands, Mat",
      imageUrl: powerSurgeEliteImg,
      description: "A hybrid power workout using barbells, medicine balls, and bands to develop explosive strength and fast-twitch activation.",
      workoutType: "MIX",
      format: `REPS & SETS + HIIT Finisher
Main Block: 4 sets
Finisher: 3 rounds`,
      instructions: "Use progressive overload. Push max effort during finisher. Rest 90s between sets.",
      exercises: [
        {
          name: "Barbell Deadlift",
          sets: "4",
          reps: "6 @ 3010",
          rest: "90s",
          notes: "Heavy load, controlled tempo"
        },
        {
          name: "Medicine Ball Slams",
          sets: "4",
          reps: "12",
          rest: "90s",
          notes: "Explosive power"
        },
        {
          name: "Band-Resisted Sprints",
          sets: "4",
          reps: "3 x 20m",
          rest: "90s",
          notes: "Maximum effort"
        },
        {
          name: "Barbell Push Press",
          sets: "4",
          reps: "8",
          rest: "90s",
          notes: "Explosive overhead drive"
        },
        {
          name: "Finisher: Jump Lunges",
          sets: "3 rounds",
          reps: "45s work",
          rest: "15s",
          notes: "HIIT block"
        },
        {
          name: "Finisher: Plyo Push-Ups",
          sets: "3 rounds",
          reps: "45s work",
          rest: "15s",
          notes: "HIIT block"
        },
        {
          name: "Finisher: Plank Rows",
          sets: "3 rounds",
          reps: "45s work",
          rest: "15s",
          notes: "HIIT block"
        }
      ],
      tips: [
        "Use spotter for heavy lifts",
        "Warm up thoroughly",
        "Prioritize form over load"
      ]
    },
    "mobility-025": {
      name: "Flow Starter",
      serialNumber: "MOB-BBW-025",
      difficulty: "Beginner",
      duration: "30 min",
      equipment: "No Equipment Required",
      imageUrl: flowStarterImg,
      description: "A gentle mobility circuit designed to improve joint range, posture, and control. Ideal for beginners or recovery days.",
      workoutType: "CIRCUIT",
      format: `Circuit – 2 rounds
Hold Time: 30–60s per move`,
      instructions: "Move slowly and intentionally. Focus on breath and control. Rest 30s between moves.",
      exercises: [
        {
          name: "Cat-Cow Flow",
          sets: "2 rounds",
          reps: "60s",
          rest: "30s",
          notes: "Fluid spine movement"
        },
        {
          name: "Deep Squat Hold",
          sets: "2 rounds",
          reps: "45s",
          rest: "30s",
          notes: "Full range hold"
        },
        {
          name: "Bird-Dog",
          sets: "2 rounds",
          reps: "10/side",
          rest: "30s",
          notes: "Core stability"
        },
        {
          name: "Standing Hip Circles",
          sets: "2 rounds",
          reps: "10/leg",
          rest: "30s",
          notes: "Control and balance"
        },
        {
          name: "Side Plank",
          sets: "2 rounds",
          reps: "30s/side",
          rest: "30s",
          notes: "Engage obliques"
        }
      ],
      tips: [
        "Avoid rushing through stretches",
        "Keep spine neutral during core work",
        "Listen to your body"
      ]
    },
    "mobility-026": {
      name: "Band Balance",
      serialNumber: "MOB-EQ-026",
      difficulty: "Beginner",
      duration: "30 min",
      equipment: "Bands, Fit Ball, Mat",
      imageUrl: bandBalanceImg,
      description: "A beginner-friendly workout using bands and a fit ball to enhance joint mobility and core stability.",
      workoutType: "REPS & SETS",
      format: `3 sets per exercise
Hold Time: 30–45s`,
      instructions: "Use light resistance. Perform each move with control. Rest 45s between sets.",
      exercises: [
        {
          name: "Band Shoulder Dislocates",
          sets: "3",
          reps: "10",
          rest: "45s",
          notes: "Wide grip"
        },
        {
          name: "Fit Ball Hip Bridges",
          sets: "3",
          reps: "12",
          rest: "45s",
          notes: "Squeeze glutes"
        },
        {
          name: "Band Pull-Aparts",
          sets: "3",
          reps: "15",
          rest: "45s",
          notes: "Retract scapula"
        },
        {
          name: "Fit Ball Wall Squat Hold",
          sets: "3",
          reps: "45s",
          rest: "45s",
          notes: "Back against ball"
        },
        {
          name: "Seated Band Leg Extensions",
          sets: "3",
          reps: "12/leg",
          rest: "45s",
          notes: "Controlled movement"
        }
      ],
      tips: [
        "Don't overextend joints",
        "Keep band tension consistent",
        "Engage core throughout"
      ]
    },
    "mobility-027": {
      name: "Core Flow",
      serialNumber: "MOB-BBW-027",
      difficulty: "Intermediate",
      duration: "45 min",
      equipment: "No Equipment Required",
      imageUrl: coreFlowImg,
      description: "A dynamic blend of mobility and core stability using bodyweight flows and static holds. Great for posture and control.",
      workoutType: "MIX",
      format: `Flow + Static Holds
2 rounds
Hold Time: 30–60s`,
      instructions: "Alternate between movement and holds. Rest 30s between exercises, 1 min between rounds.",
      exercises: [
        {
          name: "Cat-Cow Flow",
          sets: "2 rounds",
          reps: "60s",
          rest: "30s",
          notes: "Fluid transitions"
        },
        {
          name: "Side Plank Reach",
          sets: "2 rounds",
          reps: "30s/side",
          rest: "30s",
          notes: "Rotate through torso"
        },
        {
          name: "Deep Squat to Stand",
          sets: "2 rounds",
          reps: "10",
          rest: "30s",
          notes: "Full range movement"
        },
        {
          name: "Bird-Dog",
          sets: "2 rounds",
          reps: "10/side",
          rest: "30s",
          notes: "Opposite arm/leg"
        },
        {
          name: "Hollow Body Hold",
          sets: "2 rounds",
          reps: "30s",
          rest: "60s after round",
          notes: "Lower back pressed down"
        }
      ],
      tips: [
        "Breathe through transitions",
        "Keep hips aligned",
        "Avoid collapsing in planks"
      ]
    },
    "mobility-028": {
      name: "Stability Circuit",
      serialNumber: "MOB-EQ-028",
      difficulty: "Intermediate",
      duration: "45 min",
      equipment: "Fit Ball, Bands, Mat",
      imageUrl: stabilityCircuitImg,
      description: "A full-body stability circuit using fit ball, bands, and mat work to challenge balance and joint control.",
      workoutType: "CIRCUIT",
      format: `Circuit – 3 rounds
Hold Time: 30–60s`,
      instructions: "Perform each move with control. Rest 30s between exercises, 1 min between rounds.",
      exercises: [
        {
          name: "Fit Ball Wall Squats",
          sets: "3 rounds",
          reps: "12",
          rest: "30s",
          notes: "Full range"
        },
        {
          name: "Band Lateral Walks",
          sets: "3 rounds",
          reps: "10 steps/side",
          rest: "30s",
          notes: "Keep tension"
        },
        {
          name: "Fit Ball Plank Hold",
          sets: "3 rounds",
          reps: "45s",
          rest: "30s",
          notes: "Engage core"
        },
        {
          name: "Band Shoulder Circles",
          sets: "3 rounds",
          reps: "10",
          rest: "30s",
          notes: "Controlled rotation"
        },
        {
          name: "Side Plank with Reach",
          sets: "3 rounds",
          reps: "30s/side",
          rest: "60s after round",
          notes: "Rotate through torso"
        }
      ],
      tips: [
        "Keep knees aligned",
        "Don't rush transitions",
        "Use breath to stabilize"
      ]
    },
    "mobility-029": {
      name: "Mobility Mastery",
      serialNumber: "MOB-BBW-029",
      difficulty: "Advanced",
      duration: "60 min",
      equipment: "No Equipment Required",
      imageUrl: mobilityMasteryImg,
      description: "An advanced mobility and stability workout using high-intensity intervals and deep holds to challenge control and flexibility.",
      workoutType: "HIIT",
      format: `HIIT – 5 blocks
Work: 45s / Rest: 15s
Static Holds: 60s`,
      instructions: "Alternate dynamic moves with static holds. Rest 1 min between blocks.",
      exercises: [
        {
          name: "Block 1: Jump Lunges",
          sets: "5 blocks",
          reps: "45s work",
          rest: "15s",
          notes: "Explosive movement"
        },
        {
          name: "Block 1: Deep Squat Hold",
          sets: "5 blocks",
          reps: "60s",
          rest: "60s after block",
          notes: "Static hold"
        },
        {
          name: "Block 2: Plank to Pike",
          sets: "5 blocks",
          reps: "45s work",
          rest: "15s",
          notes: "Dynamic core"
        },
        {
          name: "Block 2: Side Plank Hold",
          sets: "5 blocks",
          reps: "60s",
          rest: "60s after block",
          notes: "Each side"
        },
        {
          name: "Block 3: Bird-Dog",
          sets: "5 blocks",
          reps: "45s work",
          rest: "15s",
          notes: "Alternating sides"
        },
        {
          name: "Block 3: Hollow Body Hold",
          sets: "5 blocks",
          reps: "60s",
          rest: "60s after block",
          notes: "Core engaged"
        },
        {
          name: "Block 4: Squat to Stand",
          sets: "5 blocks",
          reps: "45s work",
          rest: "15s",
          notes: "Full range"
        },
        {
          name: "Block 4: Wall Sit",
          sets: "5 blocks",
          reps: "60s",
          rest: "60s after block",
          notes: "90 degree angle"
        },
        {
          name: "Block 5: Push-Up to Down Dog",
          sets: "5 blocks",
          reps: "45s work",
          rest: "15s",
          notes: "Flow movement"
        },
        {
          name: "Block 5: Cat-Cow Flow",
          sets: "5 blocks",
          reps: "60s",
          rest: "0",
          notes: "Fluid transitions"
        }
      ],
      tips: [
        "Don't skip warm-up",
        "Keep core engaged",
        "Focus on breath during holds"
      ]
    },
    "mobility-030": {
      name: "Balance Forge",
      serialNumber: "MOB-EQ-030",
      difficulty: "Advanced",
      duration: "60 min",
      equipment: "Fit Ball, Bands, Mat",
      imageUrl: balanceForgeImg,
      description: "A precision-based mobility workout using fit ball, bands, and mat work to develop elite control and joint integrity.",
      workoutType: "REPS & SETS",
      format: `3 sets per exercise
Hold Time: 45–60s`,
      instructions: "Use slow tempo and full range. Rest 60s between sets.",
      exercises: [
        {
          name: "Fit Ball Hip Bridges",
          sets: "3",
          reps: "15",
          rest: "60s",
          notes: "Squeeze at top"
        },
        {
          name: "Band Shoulder Dislocates",
          sets: "3",
          reps: "12",
          rest: "60s",
          notes: "Wide grip"
        },
        {
          name: "Fit Ball Plank Hold",
          sets: "3",
          reps: "45s",
          rest: "60s",
          notes: "Maintain stability"
        },
        {
          name: "Band Lateral Walks",
          sets: "3",
          reps: "10 steps/side",
          rest: "60s",
          notes: "Keep tension"
        },
        {
          name: "Side Plank with Reach",
          sets: "3",
          reps: "45s/side",
          rest: "60s",
          notes: "Rotate through core"
        },
        {
          name: "Hollow Body Hold",
          sets: "3",
          reps: "45s",
          rest: "60s",
          notes: "Lower back pressed"
        }
      ],
      tips: [
        "Keep spine neutral",
        "Don't overextend joints",
        "Engage stabilizers throughout"
      ]
    },
    "metabolic-043": {
      name: "Metabo Pulse",
      serialNumber: "MET-BBW-043",
      difficulty: "Beginner",
      duration: "30 min",
      equipment: "No Equipment Required",
      imageUrl: metaboLiteImg,
      description: "A beginner-friendly Tabata workout using bodyweight moves to elevate metabolism and improve aerobic capacity.",
      workoutType: "TABATA",
      format: `Tabata – 4 blocks
Work: 20s / Rest: 10s x 8 rounds per block`,
      instructions: "Complete each Tabata block before moving to the next. Rest 1 minute between blocks.",
      exercises: [
        {
          name: "Block 1: March in Place",
          sets: "8 rounds",
          reps: "20s work / 10s rest",
          rest: "60s after block",
          notes: "Each block = 4 mins"
        },
        {
          name: "Block 2: Bodyweight Squats",
          sets: "8 rounds",
          reps: "20s work / 10s rest",
          rest: "60s after block",
          notes: "Full range of motion"
        },
        {
          name: "Block 3: Step-Back Lunges",
          sets: "8 rounds",
          reps: "20s work / 10s rest",
          rest: "60s after block",
          notes: "Alternate legs"
        },
        {
          name: "Block 4: Plank Hold",
          sets: "8 rounds",
          reps: "20s work / 10s rest",
          rest: "0",
          notes: "Maintain form"
        }
      ],
      tips: [
        "Keep movements light and rhythmic",
        "Modify jumps to steps if needed",
        "Focus on breathing and posture"
      ]
    },
    "metabolic-044": {
      name: "Metabo Band Boost",
      serialNumber: "MET-EQ-044",
      difficulty: "Beginner",
      duration: "30 min",
      equipment: "Resistance Bands, Dumbbells, Mat",
      imageUrl: metaboStartImg,
      description: "A light metabolic circuit using resistance bands and dumbbells to blend cardio and strength for beginners.",
      workoutType: "CIRCUIT",
      format: `Circuit – 3 rounds
Work: 40s / Rest: 20s`,
      instructions: "Use light resistance. Perform each move with control. Rest 1 minute between rounds.",
      exercises: [
        {
          name: "Band Squat to Row",
          sets: "3 rounds",
          reps: "40s",
          rest: "20s",
          notes: "Controlled movement"
        },
        {
          name: "Dumbbell Curl to Press",
          sets: "3 rounds",
          reps: "40s",
          rest: "20s",
          notes: "Full range"
        },
        {
          name: "Band Lateral Walks",
          sets: "3 rounds",
          reps: "40s",
          rest: "20s",
          notes: "Keep tension"
        },
        {
          name: "Dumbbell Deadlift",
          sets: "3 rounds",
          reps: "40s",
          rest: "20s",
          notes: "Hip hinge"
        },
        {
          name: "Plank with Band Pull",
          sets: "3 rounds",
          reps: "40s",
          rest: "60s after round",
          notes: "Maintain plank position"
        }
      ],
      tips: [
        "Don't rush reps",
        "Keep band tension consistent",
        "Breathe through transitions"
      ]
    },
    "metabolic-045": {
      name: "Metabo Sprint",
      serialNumber: "MET-BBW-045",
      difficulty: "Intermediate",
      duration: "45 min",
      equipment: "No Equipment Required",
      imageUrl: metaboFlowImg,
      description: "A fast-paced bodyweight AMRAP designed to spike metabolism and build muscular endurance.",
      workoutType: "AMRAP",
      format: `AMRAP – 30 mins
Finisher – 10 mins
Warm-Up & Cool-Down – 5 mins`,
      instructions: "Complete as many rounds as possible. Push consistent effort. Finish with a challenge block.",
      exercises: [
        {
          name: "Main Block (30 mins AMRAP)",
          sets: "AMRAP",
          reps: "As many rounds as possible",
          rest: "As needed",
          notes: "Jump Squats – 15 reps, Push-Ups – 12 reps, Reverse Lunges – 10 reps/leg, Plank Shoulder Taps – 20 reps, Burpees – 8 reps"
        },
        {
          name: "Finisher (10 mins)",
          sets: "1",
          reps: "Complete all",
          rest: "0",
          notes: "100 High Knees, 50 Mountain Climbers, 25 Jumping Jacks"
        }
      ],
      tips: [
        "Keep transitions tight",
        "Use full range of motion",
        "Hydrate between blocks"
      ]
    },
    "metabolic-046": {
      name: "Metabo Hybrid",
      serialNumber: "MET-EQ-046",
      difficulty: "Intermediate",
      duration: "45 min",
      equipment: "Kettlebells, TRX, Mat",
      imageUrl: metaboChargeImg,
      description: "A hybrid metabolic workout using kettlebells, TRX, and bodyweight to challenge multiple energy systems.",
      workoutType: "MIX",
      format: `EMOM + Circuit
EMOM: 20 mins
Circuit: 3 rounds`,
      instructions: "Alternate EMOM and circuit blocks. Push max effort during EMOM.",
      exercises: [
        {
          name: "EMOM Block (20 mins)",
          sets: "4 cycles",
          reps: "5 minute cycle",
          rest: "Minute 5 rest",
          notes: "Min 1: Kettlebell Swings – 20 reps, Min 2: TRX Rows – 15 reps, Min 3: Jump Squats – 20 reps, Min 4: TRX Push-Ups – 15 reps, Min 5: Rest"
        },
        {
          name: "Circuit (3 rounds)",
          sets: "3 rounds",
          reps: "See notes",
          rest: "As needed",
          notes: "Kettlebell Goblet Squat – 15 reps, TRX Mountain Climbers – 20 reps, Plank Hold – 45s"
        }
      ],
      tips: [
        "Keep kettlebell swings hip-driven",
        "Adjust TRX straps properly",
        "Don't skip rest minutes"
      ]
    },
    "metabolic-047": {
      name: "Metabo Max",
      serialNumber: "MET-BBW-047",
      difficulty: "Advanced",
      duration: "60 min",
      equipment: "No Equipment Required",
      imageUrl: metaboInfernoImg,
      description: "A high-intensity bodyweight workout designed to push metabolic output and endurance. Complete the full challenge as fast as possible.",
      workoutType: "FOR TIME",
      format: `For Time – 3 blocks
Rest: 2 mins between blocks`,
      instructions: "Complete each block as fast as possible. Rest only as needed.",
      exercises: [
        {
          name: "Block 1 (15 mins)",
          sets: "Repeat for 15 mins",
          reps: "20-15-10",
          rest: "As needed",
          notes: "20 Jump Squats, 15 Push-Ups, 10 Burpees - Repeat"
        },
        {
          name: "Block 2 (15 mins)",
          sets: "Repeat for 15 mins",
          reps: "20-15-10",
          rest: "As needed",
          notes: "20 Mountain Climbers, 15 Jump Lunges, 10 Plank Jacks - Repeat"
        },
        {
          name: "Block 3 (15 mins)",
          sets: "Repeat for 15 mins",
          reps: "20-15-10",
          rest: "As needed",
          notes: "20 High Knees, 15 Tuck Jumps, 10 Push-Up to Pike - Repeat"
        }
      ],
      tips: [
        "Explode through jumps",
        "Keep transitions tight",
        "Hydrate between blocks"
      ]
    },
    "metabolic-048": {
      name: "Metabo Forge",
      serialNumber: "MET-EQ-048",
      difficulty: "Advanced",
      duration: "60 min",
      equipment: "Dumbbells, Kettlebells, Wall Ball, Mat",
      imageUrl: metaboSurgeImg,
      description: "A strength-driven metabolic workout using dumbbells, kettlebells, and wall balls. Designed for elite conditioning and muscular endurance.",
      workoutType: "REPS & SETS",
      format: `3 sets per exercise
Rest: 60–90s between sets`,
      instructions: "Use moderate to heavy weights. Track reps and tempo. Rest strategically.",
      exercises: [
        {
          name: "Dumbbell Thrusters",
          sets: "3",
          reps: "12",
          rest: "60-90s",
          notes: "Front squat to overhead press"
        },
        {
          name: "Kettlebell Swings",
          sets: "3",
          reps: "20",
          rest: "60-90s",
          notes: "Hip hinge, explosive"
        },
        {
          name: "Wall Ball Squat to Press",
          sets: "3",
          reps: "15",
          rest: "60-90s",
          notes: "Full squat depth"
        },
        {
          name: "Dumbbell Renegade Rows",
          sets: "3",
          reps: "10/side",
          rest: "60-90s",
          notes: "Plank position"
        },
        {
          name: "Plank Hold",
          sets: "3",
          reps: "45s",
          rest: "60-90s",
          notes: "Maintain form"
        }
      ],
      tips: [
        "Use full-body coordination",
        "Don't rush transitions",
        "Prioritize form over speed"
      ]
    }
  };

  const workout = workoutData[id || ""];

  if (!workout) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8">
          <p className="text-center">Workout not found</p>
          <Button onClick={() => navigate("/workout")} className="mt-4">
            Back to Workouts
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{workout.name} - Smarty Gym | Workout by Haris Falas | smartygym.com</title>
        <meta name="description" content={`${workout.description} - ${workout.duration} ${getFocusLabel(type)} workout by Haris Falas. Convenient & flexible training at smartygym.com for anywhere, anytime fitness.`} />
        <meta name="keywords" content={`smartygym, smarty gym, smartygym.com, Haris Falas, ${workout.name}, ${getFocusLabel(type)} workout, ${workout.equipment} workout, ${workout.difficulty} workout, convenient fitness, gym reimagined, flexible training, ${workout.format} workout`} />
        
        <meta property="og:title" content={`${workout.name} - Smarty Gym Workout`} />
        <meta property="og:description" content={`${workout.description} - Convenient & flexible ${getFocusLabel(type)} workout by Haris Falas`} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://smartygym.com/workout/${type}/${id}`} />
        <meta property="og:image" content={workout.imageUrl} />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${workout.name} - Smarty Gym`} />
        <meta name="twitter:description" content={`${workout.description} by Haris Falas at smartygym.com`} />
        
        <link rel="canonical" href={`https://smartygym.com/workout/${type}/${id}`} />
        
        {/* Structured Data - Exercise/Workout */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ExercisePlan",
            "name": workout.name,
            "description": workout.description,
            "image": workout.imageUrl,
            "duration": workout.duration,
            "exerciseType": getFocusLabel(type),
            "author": {
              "@type": "Person",
              "name": "Haris Falas",
              "jobTitle": "Sports Scientist & Strength and Conditioning Coach"
            },
            "provider": {
              "@type": "Organization",
              "name": "Smarty Gym",
              "url": "https://smartygym.com"
            }
          })}
        </script>
      </Helmet>

      <AccessGate requireAuth={!isFreeWorkout} requirePremium={!isFreeWorkout} contentType="workout">
        <div className="min-h-screen bg-background">
          <div className="container mx-auto max-w-4xl px-4 py-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/workout/${type}`)}
              className="mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span className="text-xs sm:text-sm">Back</span>
            </Button>

            {/* Use WorkoutDisplay component with all functionality */}
            <WorkoutDisplay
              exercises={[
                { name: "Exercise Demo", video_id: "dQw4w9WgXcQ", video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }
              ]}
              planContent=""
              title={workout.name}
              serial={workout.serialNumber}
              focus={getFocusLabel(type)}
              difficulty={workout.difficulty === "Beginner" ? 1 : workout.difficulty === "Intermediate" ? 3 : 5}
              workoutType={workout.workoutType}
              imageUrl={workout.imageUrl}
              duration={workout.duration}
              equipment={workout.equipment}
              description={workout.description}
              format={workout.format}
              instructions={workout.instructions}
              tips={workout.tips.join('\n')}
              workoutDetails={{ exercises: workout.exercises }}
            />
          </div>
        </div>
      </AccessGate>
    </>
  );
};

export default IndividualWorkout;