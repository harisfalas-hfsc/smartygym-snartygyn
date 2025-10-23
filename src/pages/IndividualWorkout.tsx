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