import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Clock, Dumbbell, TrendingUp } from "lucide-react";
import { WorkoutDisplay } from "@/components/WorkoutDisplay";
import { AccessGate } from "@/components/AccessGate";
import { CommentDialog } from "@/components/CommentDialog";
import { PurchaseButton } from "@/components/PurchaseButton";
import { useWorkoutData } from "@/hooks/useWorkoutData";
import { useAccessControl } from "@/hooks/useAccessControl";
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
import cardioLiftOffImg from "@/assets/cardio-lift-off-workout.jpg";
import cardioClimbImg from "@/assets/cardio-climb-workout.jpg";
import cardioCircuitProImg from "@/assets/cardio-circuit-pro-workout.jpg";
import cardioInfernoImg from "@/assets/cardio-inferno-workout.jpg";
import cardioOverdriveImg from "@/assets/cardio-overdrive-workout.jpg";
import flowMobilityImg from "@/assets/flow-mobility-workout.jpg";
import flowForgeImg from "@/assets/flowforge-workout.jpg";
import flowStarterImg from "@/assets/flow-starter-workout.jpg";
import bandBalanceImg from "@/assets/band-balance-workout.jpg";
import coreFlowImg from "@/assets/core-flow-workout.jpg";
import stabilityCircuitImg from "@/assets/stability-circuit-workout.jpg";
import mobilityMasteryImg from "@/assets/mobility-mastery-workout.jpg";
import balanceForgeImg from "@/assets/balance-forge-workout.jpg";
import powerSurgeImg from "@/assets/power-surge-workout.jpg";
import ironCoreStrengthImg from "@/assets/iron-core-strength-workout.jpg";
import bodyweightFoundationImg from "@/assets/bodyweight-foundation-workout.jpg";
import calorieCrusherCircuitImg from "@/assets/calorie-crusher-circuit-workout.jpg";
import bodyweightFatMeltImg from "@/assets/bodyweight-fat-melt-workout.jpg";
import cardioPowerIntervalsImg from "@/assets/cardio-power-intervals-workout.jpg";
import bodyweightEnduroFlowImg from "@/assets/bodyweight-enduro-flow-workout.jpg";
import metabolicDestroyerImg from "@/assets/metabolic-destroyer-workout.jpg";
import metabolicBodyBlastImg from "@/assets/metabolic-body-blast-workout.jpg";
import mobilityResetImg from "@/assets/mobility-reset-workout.jpg";
import bodyweightStabilityFlowImg from "@/assets/bodyweight-stability-flow-workout.jpg";
import powerSurgeAdvancedImg from "@/assets/power-surge-advanced-workout.jpg";
import explosiveBodyControlImg from "@/assets/explosive-body-control-workout.jpg";
import hfscGrinderImg from "@/assets/hfsc-grinder-challenge-workout.jpg";
import hfscBodyweightInfernoImg from "@/assets/hfsc-bodyweight-inferno-workout.jpg";
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
import ironTitanStrengthImg from "@/assets/iron-titan-strength-workout.jpg";
import functionalCompoundStrengthImg from "@/assets/functional-compound-strength-workout.jpg";
import strengthDensityBuilderImg from "@/assets/strength-density-builder-workout.jpg";
import bodyweightPrimeStrengthImg from "@/assets/bodyweight-prime-strength-workout.jpg";
import coreStabilityStrengthImg from "@/assets/core-stability-strength-workout.jpg";
import calorieStormCircuitImg from "@/assets/calorie-storm-circuit-workout.jpg";
import fullThrottleFatBurnImg from "@/assets/full-throttle-fat-burn-workout.jpg";
import burnZoneIntervalsImg from "@/assets/burn-zone-intervals-workout.jpg";
import bodyweightInfernoImg from "@/assets/bodyweight-inferno-workout.jpg";
import burnFlow2Img from "@/assets/burn-flow-2-workout.jpg";
import metabolicMayhemImg from "@/assets/metabolic-mayhem-workout.jpg";
import metabolicEngineImg from "@/assets/metabolic-engine-workout.jpg";
import metabolicOverdriveImg from "@/assets/metabolic-overdrive-workout.jpg";
import bodyweightEngineImg from "@/assets/bodyweight-engine-workout.jpg";
import metabolicCoreBurnImg from "@/assets/metabolic-core-burn-workout.jpg";
import cardioEngineBuilderImg from "@/assets/cardio-engine-builder-workout.jpg";
import sprintPowerComboImg from "@/assets/sprint-power-combo-workout.jpg";
import conditioningPyramidImg from "@/assets/conditioning-pyramid-workout.jpg";
import bodyweightEnduranceFlowImg from "@/assets/bodyweight-endurance-flow-workout.jpg";
import fastFeetCardioFlowImg from "@/assets/fast-feet-cardio-flow-workout.jpg";
import jointFlowRestoreImg from "@/assets/joint-flow-restore-workout.jpg";
import coreStabilityBuilderImg from "@/assets/core-stability-builder-workout.jpg";
import balanceFlowResetImg from "@/assets/balance-flow-reset-workout.jpg";
import mobilityWaveImg from "@/assets/mobility-wave-workout.jpg";
import stabilityCoreFlowImg from "@/assets/stability-core-flow-workout.jpg";
import explosiveEnginePowerImg from "@/assets/explosive-engine-power-workout.jpg";
import speedMechanicsImg from "@/assets/speed-mechanics-workout.jpg";
import olympicPowerSessionImg from "@/assets/olympic-power-session-workout.jpg";
import plyometricBurnImg from "@/assets/plyometric-burn-workout.jpg";
import powerFlowImg from "@/assets/power-flow-workout.jpg";
import hfscBeastModeImg from "@/assets/hfsc-beast-mode-workout.jpg";
import spartanEnduranceTestImg from "@/assets/spartan-endurance-test-workout.jpg";
import fullBodyBenchmarkImg from "@/assets/full-body-benchmark-workout.jpg";
import burnoutChallengeImg from "@/assets/burnout-challenge-workout.jpg";
import warriorFlowImg from "@/assets/warrior-flow-workout.jpg";
import ironCoreBuilderImg from "@/assets/iron-core-builder-workout.jpg";
import bodyweightPowerFrameImg from "@/assets/bodyweight-power-frame-workout.jpg";
import burnstormImg from "@/assets/burnstorm-workout.jpg";
import cardioSculptImg from "@/assets/cardio-sculpt-workout.jpg";
import hiitInfernoImg from "@/assets/hiit-inferno-workout.jpg";
import sweatCircuitProImg from "@/assets/sweat-circuit-pro-workout.jpg";
import enduroFlowImg from "@/assets/enduro-flow-workout.jpg";
import cardioSprintLadderImg from "@/assets/cardio-sprint-ladder-workout.jpg";
import coreFlowRestoreImg from "@/assets/core-flow-restore-workout.jpg";
import mobilityResetProImg from "@/assets/mobility-reset-pro-workout.jpg";
import explosiveEngineProImg from "@/assets/explosive-engine-pro-workout.jpg";
import bodyBlastPowerImg from "@/assets/body-blast-power-workout.jpg";
import repGauntletImg from "@/assets/100-rep-gauntlet-workout.jpg";
import bodyweightMadnessImg from "@/assets/bodyweight-madness-workout.jpg";

const IndividualWorkout = () => {
  const navigate = useNavigate();
  const { type, id } = useParams();
  const { userTier, hasPurchased } = useAccessControl();
  
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

  // Free workouts (accessible by logged-in members)
  const freeWorkouts = [
    'challenge-002', 'challenge-003', 'challenge-004', 'challenge-005', 'challenge-006', 'challenge-007',
    'power-037', 'power-038', 'power-039', 'power-040', 'power-041', 'power-042',
    'mobility-025', 'mobility-026', 'mobility-027', 'mobility-028', 'mobility-029', 'mobility-030',
    'metabolic-043', 'metabolic-044', 'metabolic-045', 'metabolic-046', 'metabolic-047', 'metabolic-048',
    'strength-049', 'strength-050', 'strength-051', 'strength-052', 'strength-053', 'strength-054',
    'calorie-055', 'calorie-056', 'calorie-057', 'calorie-058', 'calorie-059', 'calorie-060',
    'cardio-061', 'cardio-062', 'cardio-063', 'cardio-064', 'cardio-065', 'cardio-066',
  ];
  const isFreeWorkout = freeWorkouts.includes(id || '');
  
  // Fetch from database
  const { data: dbWorkout, isLoading: isLoadingDb } = useWorkoutData(id);

  // If we have database workout, use it directly
  if (isLoadingDb) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading workout...</p>
      </div>
    );
  }

  if (dbWorkout) {
    return (
      <>
        <Helmet>
          <title>{dbWorkout.name} | Online Workout by Haris Falas | SmartyGym Cyprus</title>
          <meta name="description" content={`${dbWorkout.description || dbWorkout.name} - Professional online workout by Cyprus Sports Scientist Haris Falas. ${dbWorkout.duration} ${dbWorkout.format} workout. ${dbWorkout.equipment}.`} />
          <meta name="keywords" content={`${dbWorkout.name}, online workouts, ${dbWorkout.format} workout, ${dbWorkout.category} training, Haris Falas, Cyprus fitness, online fitness Cyprus, ${dbWorkout.equipment} workout`} />
          
          {/* Open Graph */}
          <meta property="og:type" content="article" />
          <meta property="og:url" content={window.location.href} />
          <meta property="og:title" content={`${dbWorkout.name} | Online Workout by Haris Falas`} />
          <meta property="og:description" content={dbWorkout.description || `Professional ${dbWorkout.format} workout designed by Cyprus Sports Scientist`} />
          <meta property="og:image" content={dbWorkout.image_url} />
          
          {/* Twitter */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={`${dbWorkout.name} | Online Workout`} />
          <meta name="twitter:description" content={dbWorkout.description || dbWorkout.name} />
          <meta name="twitter:image" content={dbWorkout.image_url} />
          
          <link rel="canonical" href={window.location.href} />
          
          {/* Structured Data - ExercisePlan */}
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ExercisePlan",
              "name": dbWorkout.name,
              "description": dbWorkout.description,
              "image": dbWorkout.image_url,
              "duration": dbWorkout.duration,
              "category": dbWorkout.category,
              "activityDuration": dbWorkout.duration,
              "workLocation": "Online / Home / Gym",
              "author": {
                "@type": "Person",
                "name": "Haris Falas",
                "jobTitle": "Sports Scientist & Strength Coach",
                "description": "Cyprus fitness expert and personal trainer"
              },
              "identifier": dbWorkout.id
            })}
          </script>
        </Helmet>
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-6 flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="gap-2"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                <span className="text-xs sm:text-sm">Back</span>
              </Button>
              <CommentDialog
                workoutId={id}
                workoutName={dbWorkout.name}
                workoutType={type}
              />
            </div>

            <AccessGate 
              requireAuth={true} 
              requirePremium={!isFreeWorkout} 
              contentType="workout"
              contentId={dbWorkout.id}
              contentName={dbWorkout.name}
              price={dbWorkout.price || undefined}
              stripePriceId={dbWorkout.stripe_price_id || undefined}
              stripeProductId={dbWorkout.stripe_product_id || undefined}
            >
              <WorkoutDisplay
                exercises={[]}
                planContent=""
                title={dbWorkout.name}
                serial={dbWorkout.id}
                focus={dbWorkout.focus || getFocusLabel(type)}
                difficulty={dbWorkout.difficulty_stars || 3}
                workoutType={dbWorkout.format}
                imageUrl={dbWorkout.image_url}
                duration={dbWorkout.duration}
                equipment={dbWorkout.equipment}
                description={dbWorkout.description}
                format={dbWorkout.format}
                instructions={dbWorkout.instructions}
                tips={dbWorkout.tips}
                activation={dbWorkout.activation}
                warm_up={dbWorkout.warm_up}
                main_workout={dbWorkout.main_workout}
                finisher={dbWorkout.finisher}
                cool_down={dbWorkout.cool_down}
                workoutId={id}
                workoutCategory={type || ''}
                isFreeContent={isFreeWorkout}
              />
            </AccessGate>
          </div>
        </div>
      </>
    );
  }

  // Workout data structure (fallback for hardcoded workouts)
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
    },
    "strength-049": {
      name: "Bodyweight Base",
      serialNumber: "STR-BBW-049",
      difficulty: "Beginner",
      duration: "30 min",
      equipment: "No Equipment Required",
      imageUrl: starterStrengthImg,
      description: "A foundational strength workout using bodyweight exercises with controlled tempo and static holds to build muscular endurance.",
      workoutType: "REPS & SETS",
      format: `3 sets per exercise
Tempo: Controlled (3010)`,
      instructions: "Perform each exercise slowly and deliberately. Rest 30s between exercises, 1 min between sets.",
      exercises: [
        {
          name: "Squat to Chair",
          sets: "3",
          reps: "12",
          rest: "30s",
          notes: "Controlled descent"
        },
        {
          name: "Incline Push-Ups",
          sets: "3",
          reps: "10",
          rest: "30s",
          notes: "Hands elevated"
        },
        {
          name: "Glute Bridges",
          sets: "3",
          reps: "15",
          rest: "30s",
          notes: "Squeeze at top"
        },
        {
          name: "Wall Sit",
          sets: "3",
          reps: "30s",
          rest: "30s",
          notes: "90 degree angle"
        },
        {
          name: "Bird-Dog",
          sets: "3",
          reps: "10/side",
          rest: "60s after set",
          notes: "Maintain stability"
        }
      ],
      tips: [
        "Focus on form over speed",
        "Engage your core",
        "Avoid locking joints"
      ]
    },
    "strength-050": {
      name: "Strength Starter",
      serialNumber: "STR-EQ-050",
      difficulty: "Beginner",
      duration: "30 min",
      equipment: "Dumbbells, Bands, Mat",
      imageUrl: powerFoundationImg,
      description: "A light resistance circuit using dumbbells and bands to introduce strength training safely and effectively.",
      workoutType: "CIRCUIT",
      format: `Circuit – 3 rounds
Work: 40s / Rest: 20s`,
      instructions: "Use light weights. Rest 1 minute between rounds. Focus on control and posture.",
      exercises: [
        {
          name: "Dumbbell Goblet Squat",
          sets: "3 rounds",
          reps: "40s",
          rest: "20s",
          notes: "Full range"
        },
        {
          name: "Band Row",
          sets: "3 rounds",
          reps: "40s",
          rest: "20s",
          notes: "Squeeze shoulder blades"
        },
        {
          name: "Dumbbell Chest Press (floor)",
          sets: "3 rounds",
          reps: "40s",
          rest: "20s",
          notes: "Control descent"
        },
        {
          name: "Band Overhead Press",
          sets: "3 rounds",
          reps: "40s",
          rest: "20s",
          notes: "Keep core tight"
        },
        {
          name: "Plank Hold",
          sets: "3 rounds",
          reps: "30s",
          rest: "60s after round",
          notes: "Maintain form"
        }
      ],
      tips: [
        "Keep shoulders relaxed",
        "Don't swing weights",
        "Breathe through each rep"
      ]
    },
    "strength-051": {
      name: "Gravity Strength",
      serialNumber: "STR-BBW-051",
      difficulty: "Intermediate",
      duration: "45 min",
      equipment: "No Equipment Required",
      imageUrl: gravityGrindImg,
      description: "A bodyweight strength workout combining tempo, holds, and dynamic movement to challenge muscular control and endurance.",
      workoutType: "MIX",
      format: `Superset + Static Holds
Tempo: Slow (3010)`,
      instructions: "Pair exercises into supersets. Rest 30s between moves, 1 min between sets.",
      exercises: [
        {
          name: "Superset 1: Bulgarian Split Squat",
          sets: "3",
          reps: "10/leg",
          rest: "30s",
          notes: "Control movement"
        },
        {
          name: "Superset 1: Wall Sit",
          sets: "3",
          reps: "45s",
          rest: "60s after superset",
          notes: "Static hold"
        },
        {
          name: "Superset 2: Push-Up",
          sets: "3",
          reps: "12",
          rest: "30s",
          notes: "Full range"
        },
        {
          name: "Superset 2: Plank Hold",
          sets: "3",
          reps: "45s",
          rest: "60s after superset",
          notes: "Keep hips aligned"
        },
        {
          name: "Superset 3: Glute Bridge March",
          sets: "3",
          reps: "10/leg",
          rest: "30s",
          notes: "Maintain hip height"
        },
        {
          name: "Superset 3: Side Plank",
          sets: "3",
          reps: "30s/side",
          rest: "60s after superset",
          notes: "Stack hips"
        }
      ],
      tips: [
        "Control every rep",
        "Keep spine neutral",
        "Use breath to stabilize"
      ]
    },
    "strength-052": {
      name: "Iron Builder",
      serialNumber: "STR-EQ-052",
      difficulty: "Intermediate",
      duration: "45 min",
      equipment: "Dumbbells, Kettlebells, Mat",
      imageUrl: ironCoreImg,
      description: "A structured strength workout using dumbbells and kettlebells to build muscle and improve movement control.",
      workoutType: "REPS & SETS",
      format: `3 sets per exercise
Tempo: Moderate (2011)`,
      instructions: "Use moderate weights. Rest 60s between sets. Track reps and tempo.",
      exercises: [
        {
          name: "Kettlebell Deadlift",
          sets: "3",
          reps: "12",
          rest: "60s",
          notes: "Hip hinge pattern"
        },
        {
          name: "Dumbbell Shoulder Press",
          sets: "3",
          reps: "10",
          rest: "60s",
          notes: "Press overhead"
        },
        {
          name: "Dumbbell Step-Up",
          sets: "3",
          reps: "10/leg",
          rest: "60s",
          notes: "Drive through heel"
        },
        {
          name: "Kettlebell Goblet Squat",
          sets: "3",
          reps: "12",
          rest: "60s",
          notes: "Full depth"
        },
        {
          name: "Plank Row",
          sets: "3",
          reps: "10/side",
          rest: "60s",
          notes: "Maintain plank position"
        }
      ],
      tips: [
        "Keep knees aligned with toes",
        "Brace core during lifts",
        "Don't rush transitions"
      ]
    },
    "strength-053": {
      name: "Bodyweight Powerhouse",
      serialNumber: "STR-BBW-053",
      difficulty: "Advanced",
      duration: "60 min",
      equipment: "No Equipment Required",
      imageUrl: bodyweightBeastImg,
      description: "A high-intensity bodyweight strength workout using advanced variations and isometric holds to build serious muscular endurance.",
      workoutType: "AMRAP",
      format: `AMRAP – 30 mins
Finisher – 10 mins
Warm-Up & Cool-Down – 10 mins`,
      instructions: "Complete as many rounds as possible. Rest only when needed. Finish with a challenge block.",
      exercises: [
        {
          name: "Main Block (30 mins AMRAP)",
          sets: "AMRAP",
          reps: "As many rounds as possible",
          rest: "As needed",
          notes: "Plyo Push-Ups – 10 reps, Pistol Squat (assisted) – 8 reps/leg, Side Plank Reach – 30s/side, Glute Bridge Hold – 45s, Burpees – 10 reps"
        },
        {
          name: "Finisher",
          sets: "1",
          reps: "Complete all",
          rest: "0",
          notes: "Wall Sit – 60s, Push-Up Hold (bottom) – 30s, Hollow Body Hold – 30s"
        }
      ],
      tips: [
        "Maintain joint alignment",
        "Don't collapse in holds",
        "Use breath to manage fatigue"
      ]
    },
    "strength-054": {
      name: "Iron Mastery",
      serialNumber: "STR-EQ-054",
      difficulty: "Advanced",
      duration: "60 min",
      equipment: "Barbell, Dumbbells, Weight Plates, Mat",
      imageUrl: ironEngineImg,
      description: "A heavy strength workout using barbells, dumbbells, and weighted holds. Designed for advanced lifters seeking power and endurance.",
      workoutType: "FOR TIME",
      format: `For Time – 3 blocks
Rest: 2 mins between blocks`,
      instructions: "Complete each block as fast as possible. Rest only as needed. Track time and weights.",
      exercises: [
        {
          name: "Block 1: Barbell Deadlift",
          sets: "4",
          reps: "6",
          rest: "As needed",
          notes: "Tempo: 3010"
        },
        {
          name: "Block 1: Dumbbell Bench Press",
          sets: "4",
          reps: "8",
          rest: "2 mins after block",
          notes: "Tempo: 2011"
        },
        {
          name: "Block 2: Barbell Back Squat",
          sets: "4",
          reps: "6",
          rest: "As needed",
          notes: "Tempo: 3010"
        },
        {
          name: "Block 2: Dumbbell Row",
          sets: "3",
          reps: "10/side",
          rest: "2 mins after block",
          notes: "Control movement"
        },
        {
          name: "Block 3: Weighted Plank",
          sets: "3",
          reps: "45s",
          rest: "As needed",
          notes: "Plate on back"
        },
        {
          name: "Block 3: Hollow Body Hold",
          sets: "3",
          reps: "30s",
          rest: "0",
          notes: "Core engaged"
        }
      ],
      tips: [
        "Use spotter for heavy lifts",
        "Warm up thoroughly",
        "Prioritize form over load"
      ]
    },
    "calorie-055": {
      name: "Burn Flow",
      serialNumber: "CAL-BBW-055",
      difficulty: "Beginner",
      duration: "30 min",
      equipment: "No Equipment Required",
      imageUrl: burnStartImg,
      description: "A low-impact circuit designed to elevate heart rate and burn calories without high-impact stress. Perfect for beginners easing into cardio.",
      workoutType: "CIRCUIT",
      format: `Circuit – 3 rounds
Work: 30s / Rest: 30s`,
      instructions: "Perform each move for 30 seconds. Rest 30 seconds between exercises. Rest 1 minute between rounds.",
      exercises: [
        {
          name: "March in Place",
          sets: "3 rounds",
          reps: "30s",
          rest: "30s",
          notes: "Light and rhythmic"
        },
        {
          name: "Bodyweight Squats",
          sets: "3 rounds",
          reps: "30s",
          rest: "30s",
          notes: "Full range"
        },
        {
          name: "Step-Back Lunges",
          sets: "3 rounds",
          reps: "30s",
          rest: "30s",
          notes: "Alternate legs"
        },
        {
          name: "Arm Circles",
          sets: "3 rounds",
          reps: "30s",
          rest: "30s",
          notes: "Forward and backward"
        },
        {
          name: "Standing Knee Raises",
          sets: "3 rounds",
          reps: "30s",
          rest: "30s",
          notes: "Controlled movement"
        },
        {
          name: "Wall Sit",
          sets: "3 rounds",
          reps: "30s",
          rest: "60s after round",
          notes: "90 degree angle"
        }
      ],
      tips: [
        "Keep movements light and rhythmic",
        "Modify jumps to steps if needed",
        "Focus on breathing and posture"
      ]
    },
    "calorie-056": {
      name: "Sweat Band",
      serialNumber: "CAL-EQ-056",
      difficulty: "Beginner",
      duration: "30 min",
      equipment: "Resistance Bands, Dumbbells, Mat",
      imageUrl: sweatCircuitImg,
      description: "A beginner-friendly Tabata workout using bands and light dumbbells to blend cardio and resistance for fat burn.",
      workoutType: "TABATA",
      format: `Tabata – 4 blocks
Work: 20s / Rest: 10s x 8 rounds per block`,
      instructions: "Complete each Tabata block before moving to the next. Rest 1 minute between blocks.",
      exercises: [
        {
          name: "Block 1: Band Squat to Press",
          sets: "8 rounds",
          reps: "20s work / 10s rest",
          rest: "60s after block",
          notes: "Each block = 4 mins"
        },
        {
          name: "Block 2: Dumbbell Rows",
          sets: "8 rounds",
          reps: "20s work / 10s rest",
          rest: "60s after block",
          notes: "Control movement"
        },
        {
          name: "Block 3: Band Lateral Walks",
          sets: "8 rounds",
          reps: "20s work / 10s rest",
          rest: "60s after block",
          notes: "Keep tension"
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
        "Don't rush reps",
        "Keep band tension consistent",
        "Breathe through transitions"
      ]
    },
    "calorie-057": {
      name: "Body Burn Pro",
      serialNumber: "CAL-BBW-057",
      difficulty: "Intermediate",
      duration: "45 min",
      equipment: "No Equipment Required",
      imageUrl: bodyBurnoutImg,
      description: "A fast-paced bodyweight AMRAP designed to spike heart rate and maximize calorie burn.",
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
    "calorie-058": {
      name: "Sweat Surge",
      serialNumber: "CAL-EQ-058",
      difficulty: "Intermediate",
      duration: "45 min",
      equipment: "Dumbbells, Jump Rope, Mat",
      imageUrl: sweatStormImg,
      description: "A high-intensity interval training session using dumbbells and jump rope to burn calories and improve conditioning.",
      workoutType: "HIIT",
      format: `HIIT – 4 rounds
Work: 45s / Rest: 15s`,
      instructions: "Push hard during work intervals. Rest 1 minute between rounds.",
      exercises: [
        {
          name: "Jump Rope",
          sets: "4 rounds",
          reps: "45s",
          rest: "15s",
          notes: "Steady rhythm"
        },
        {
          name: "Dumbbell Thrusters",
          sets: "4 rounds",
          reps: "45s",
          rest: "15s",
          notes: "Front squat to press"
        },
        {
          name: "Dumbbell Renegade Rows",
          sets: "4 rounds",
          reps: "45s",
          rest: "15s",
          notes: "Plank position"
        },
        {
          name: "Jump Lunges",
          sets: "4 rounds",
          reps: "45s",
          rest: "15s",
          notes: "Explosive movement"
        },
        {
          name: "Plank to Push-Up",
          sets: "4 rounds",
          reps: "45s",
          rest: "60s after round",
          notes: "Alternate arms"
        }
      ],
      tips: [
        "Keep jump rope rhythm steady",
        "Choose weights that challenge you",
        "Don't sacrifice form for speed"
      ]
    },
    "calorie-059": {
      name: "Inferno Sprint",
      serialNumber: "CAL-BBW-059",
      difficulty: "Advanced",
      duration: "60 min",
      equipment: "No Equipment Required",
      imageUrl: infernoFlowImg,
      description: "A high-intensity bodyweight challenge designed to push endurance and burn maximum calories. Complete the full workout as fast as possible.",
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
    "calorie-060": {
      name: "Calorie Forge",
      serialNumber: "CAL-EQ-060",
      difficulty: "Advanced",
      duration: "60 min",
      equipment: "Kettlebells, Dumbbells, Wall Ball, Mat",
      imageUrl: calorieCrusherImg,
      description: "A hybrid calorie-burning workout using kettlebells, dumbbells, and wall balls to blend strength and cardio for elite fat burn.",
      workoutType: "MIX",
      format: `REPS & SETS + HIIT Finisher
Main Block: 4 sets
Finisher: 3 rounds`,
      instructions: "Use progressive overload. Push max effort during finisher. Rest 90s between sets.",
      exercises: [
        {
          name: "Main: Dumbbell Snatch",
          sets: "4",
          reps: "10/arm",
          rest: "90s",
          notes: "Explosive movement"
        },
        {
          name: "Main: Kettlebell Swings",
          sets: "4",
          reps: "20",
          rest: "90s",
          notes: "Hip driven"
        },
        {
          name: "Main: Wall Ball Squat to Press",
          sets: "4",
          reps: "15",
          rest: "90s",
          notes: "Full depth squat"
        },
        {
          name: "Main: Dumbbell Renegade Rows",
          sets: "4",
          reps: "10/side",
          rest: "90s",
          notes: "Maintain plank"
        },
        {
          name: "Finisher: Jump Lunges",
          sets: "3 rounds",
          reps: "45s work",
          rest: "15s",
          notes: "HIIT block"
        },
        {
          name: "Finisher: Burpees",
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
        "Use explosive hip drive",
        "Control weights on descent",
        "Keep transitions tight"
      ]
    },
    "cardio-061": {
      name: "Cardio Lift-Off",
      serialNumber: "CAR-BBW-061",
      difficulty: "Beginner",
      duration: "30 min",
      equipment: "No Equipment Required",
      imageUrl: cardioLiftOffImg,
      description: "A gentle cardio circuit designed to elevate heart rate and improve aerobic capacity without high impact. Ideal for beginners easing into movement.",
      workoutType: "CIRCUIT",
      format: `Circuit – 3 rounds
Work: 30s / Rest: 30s`,
      instructions: "Perform each move for 30 seconds. Rest 30 seconds between exercises. Rest 1 minute between rounds.",
      exercises: [
        {
          name: "March in Place",
          sets: "3 rounds",
          reps: "30s",
          rest: "30s",
          notes: "Light and rhythmic"
        },
        {
          name: "Step Touch Side to Side",
          sets: "3 rounds",
          reps: "30s",
          rest: "30s",
          notes: "Controlled movement"
        },
        {
          name: "Standing Knee Raises",
          sets: "3 rounds",
          reps: "30s",
          rest: "30s",
          notes: "Alternate legs"
        },
        {
          name: "Arm Circles",
          sets: "3 rounds",
          reps: "30s",
          rest: "30s",
          notes: "Forward and backward"
        },
        {
          name: "Wall Sit",
          sets: "3 rounds",
          reps: "30s",
          rest: "60s after round",
          notes: "90 degree angle"
        }
      ],
      tips: [
        "Keep movements light and rhythmic",
        "Modify jumps to steps if needed",
        "Focus on breathing and posture"
      ]
    },
    "cardio-062": {
      name: "Pulse Builder",
      serialNumber: "CAR-EQ-062",
      difficulty: "Beginner",
      duration: "30 min",
      equipment: "Jump Rope, Fit Ball, Mat",
      imageUrl: pulseIgniterImg,
      description: "A beginner-friendly Tabata workout using jump rope and fit ball to build rhythm, coordination, and endurance.",
      workoutType: "TABATA",
      format: `Tabata – 4 blocks
Work: 20s / Rest: 10s x 8 rounds per block`,
      instructions: "Complete each Tabata block before moving to the next. Rest 1 minute between blocks.",
      exercises: [
        {
          name: "Block 1: Jump Rope",
          sets: "8 rounds",
          reps: "20s work / 10s rest",
          rest: "60s after block",
          notes: "Each block = 4 mins"
        },
        {
          name: "Block 2: Fit Ball Wall Squats",
          sets: "8 rounds",
          reps: "20s work / 10s rest",
          rest: "60s after block",
          notes: "Full range"
        },
        {
          name: "Block 3: Jumping Jacks",
          sets: "8 rounds",
          reps: "20s work / 10s rest",
          rest: "60s after block",
          notes: "Controlled rhythm"
        },
        {
          name: "Block 4: Fit Ball Seated Bounces",
          sets: "8 rounds",
          reps: "20s work / 10s rest",
          rest: "0",
          notes: "Light bounces"
        }
      ],
      tips: [
        "Keep jump rope low",
        "Control fit ball movements",
        "Don't rush transitions"
      ]
    },
    "cardio-063": {
      name: "Cardio Climb",
      serialNumber: "CAR-BBW-063",
      difficulty: "Intermediate",
      duration: "45 min",
      equipment: "No Equipment Required",
      imageUrl: cardioClimbImg,
      description: "A bodyweight cardio workout using dynamic movements and short rest to build endurance and burn calories.",
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
    "cardio-064": {
      name: "Cardio Circuit Pro",
      serialNumber: "CAR-EQ-064",
      difficulty: "Intermediate",
      duration: "45 min",
      equipment: "Jump Rope, Medicine Ball, Wall Ball, Mat",
      imageUrl: cardioCircuitProImg,
      description: "A high-energy cardio circuit using jump rope, medicine ball, and wall ball to boost heart rate and stamina.",
      workoutType: "HIIT",
      format: `HIIT – 4 rounds
Work: 45s / Rest: 15s`,
      instructions: "Push hard during work intervals. Rest 1 minute between rounds.",
      exercises: [
        {
          name: "Jump Rope",
          sets: "4 rounds",
          reps: "45s",
          rest: "15s",
          notes: "Steady rhythm"
        },
        {
          name: "Medicine Ball Slams",
          sets: "4 rounds",
          reps: "45s",
          rest: "15s",
          notes: "Explosive slams"
        },
        {
          name: "Wall Ball Throws",
          sets: "4 rounds",
          reps: "45s",
          rest: "15s",
          notes: "Squat to throw"
        },
        {
          name: "Jump Lunges",
          sets: "4 rounds",
          reps: "45s",
          rest: "15s",
          notes: "Explosive alternating"
        },
        {
          name: "Plank to Push-Up",
          sets: "4 rounds",
          reps: "45s",
          rest: "60s after round",
          notes: "Alternate arms"
        }
      ],
      tips: [
        "Keep jump rope rhythm steady",
        "Use explosive power with wall ball",
        "Don't sacrifice form for speed"
      ]
    },
    "cardio-065": {
      name: "Cardio Inferno",
      serialNumber: "CAR-BBW-065",
      difficulty: "Advanced",
      duration: "60 min",
      equipment: "No Equipment Required",
      imageUrl: cardioInfernoImg,
      description: "A high-intensity bodyweight cardio workout using plyometrics and compound moves for elite endurance and fat burn.",
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
    "cardio-066": {
      name: "Cardio Overdrive",
      serialNumber: "CAR-EQ-066",
      difficulty: "Advanced",
      duration: "60 min",
      equipment: "Jump Rope, Wall Ball, Bands, Mat",
      imageUrl: cardioOverdriveImg,
      description: "A full-body cardio blast using jump rope, wall ball, and bands. Designed for elite conditioning and endurance.",
      workoutType: "MIX",
      format: `REPS & SETS + HIIT Finisher
Main Block: 4 sets
Finisher: 3 rounds`,
      instructions: "Use progressive overload. Push max effort during finisher. Rest 90s between sets.",
      exercises: [
        {
          name: "Main: Wall Ball Squat to Press",
          sets: "4",
          reps: "15",
          rest: "90s",
          notes: "Full depth squat"
        },
        {
          name: "Main: Jump Rope",
          sets: "4",
          reps: "60s",
          rest: "90s",
          notes: "Steady rhythm"
        },
        {
          name: "Main: Band Sprints",
          sets: "3",
          reps: "20m",
          rest: "90s",
          notes: "Explosive sprints"
        },
        {
          name: "Main: Plank Rows",
          sets: "4",
          reps: "10/side",
          rest: "90s",
          notes: "Maintain plank"
        },
        {
          name: "Finisher: Jump Lunges",
          sets: "3 rounds",
          reps: "45s work",
          rest: "15s",
          notes: "HIIT block"
        },
        {
          name: "Finisher: Burpees",
          sets: "3 rounds",
          reps: "45s work",
          rest: "15s",
          notes: "HIIT block"
        },
        {
          name: "Finisher: Plank Hold",
          sets: "3 rounds",
          reps: "45s work",
          rest: "15s",
          notes: "HIIT block"
        }
      ],
      tips: [
        "Use explosive hip drive",
        "Control wall ball throws",
        "Keep band tension consistent"
      ]
    },
    "ws001": {
      name: "Iron Core Strength",
      serialNumber: "WS001",
      difficulty: "Advanced",
      duration: "60 min",
      equipment: "Barbell, Dumbbells, Kettlebells, Pull-Up Bar",
      imageUrl: ironCoreStrengthImg,
      description: "This workout focuses on compound lifts to build full-body strength. The mix of bilateral and unilateral movements enhances stability, power output, and joint control.",
      workoutType: "REPS & SETS",
      format: `4-3 Sets per exercise
Rest 90-120s between heavy sets
Tempo: 3-1-1 (controlled)`,
      instructions: "Perform all sets with controlled tempo (3-1-1). Rest 90–120s between heavy sets.",
      exercises: [
        {
          name: "Barbell Back Squat",
          sets: "4",
          reps: "6 @ 80% 1RM",
          rest: "120s",
          notes: "Keep your spine neutral"
        },
        {
          name: "Bench Press",
          sets: "4",
          reps: "8 @ 75% 1RM",
          rest: "90s",
          notes: "Controlled descent"
        },
        {
          name: "Deadlift",
          sets: "4",
          reps: "5 @ 80% 1RM",
          rest: "120s",
          notes: "Avoid locking knees under heavy load"
        },
        {
          name: "Bulgarian Split Squat",
          sets: "3",
          reps: "10/leg",
          rest: "90s",
          notes: "Focus on front leg"
        },
        {
          name: "Weighted Pull-Ups",
          sets: "3",
          reps: "8",
          rest: "90s",
          notes: "Full range of motion"
        },
        {
          name: "Farmer's Carry",
          sets: "3",
          reps: "40m",
          rest: "90s",
          notes: "Keep core tight"
        }
      ],
      tips: [
        "Keep your spine neutral",
        "Avoid locking knees or elbows under heavy load",
        "Focus on controlled tempo",
        "Maintain proper breathing throughout"
      ]
    },
    "ws002": {
      name: "Bodyweight Foundation Strength",
      serialNumber: "WS002",
      difficulty: "Intermediate",
      duration: "45 min",
      equipment: "Bodyweight Only",
      imageUrl: bodyweightFoundationImg,
      description: "A full-body strength session using tempo, holds, and unilateral control to simulate resistance training.",
      workoutType: "REPS & SETS",
      format: `3-4 sets per exercise
Slow eccentrics (4 seconds down)
Rest 60-90s between sets`,
      instructions: "Use slow eccentrics (4 seconds down) to increase time under tension.",
      exercises: [
        {
          name: "Pistol Squat (Assisted)",
          sets: "3",
          reps: "8/leg",
          rest: "90s",
          notes: "4 second eccentric"
        },
        {
          name: "Push-Ups (Slow Eccentric)",
          sets: "4",
          reps: "10",
          rest: "60s",
          notes: "4 seconds down, explosive up"
        },
        {
          name: "Single-Leg Glute Bridge",
          sets: "3",
          reps: "12/leg",
          rest: "60s",
          notes: "Hold at top for 2s"
        },
        {
          name: "Pike Shoulder Press",
          sets: "3",
          reps: "10",
          rest: "90s",
          notes: "Full shoulder flexion"
        },
        {
          name: "Inverted Row",
          sets: "3",
          reps: "10",
          rest: "60s",
          notes: "Pull chest to bar"
        },
        {
          name: "Plank Hold",
          sets: "3",
          reps: "60s",
          rest: "60s",
          notes: "Maintain neutral spine"
        }
      ],
      tips: [
        "Keep core tight in every move",
        "Push through full range of motion",
        "Focus on time under tension",
        "Control the eccentric phase"
      ]
    },
    "wc001": {
      name: "Calorie Crusher Circuit",
      serialNumber: "WC001",
      difficulty: "Intermediate",
      duration: "45 min",
      equipment: "Dumbbells, Kettlebells",
      imageUrl: calorieCrusherCircuitImg,
      description: "A fast-paced circuit that blends resistance and cardio intervals to maximize calorie expenditure and metabolic demand.",
      workoutType: "CIRCUIT",
      format: `5 Rounds for Time
Complete all exercises in a row
Rest 90s between rounds`,
      instructions: "Complete all exercises in a row, rest 90s between rounds.",
      exercises: [
        {
          name: "Kettlebell Swings",
          sets: "5 rounds",
          reps: "15",
          rest: "0",
          notes: "Hip drive power"
        },
        {
          name: "Dumbbell Thrusters",
          sets: "5 rounds",
          reps: "12",
          rest: "0",
          notes: "Full squat to press"
        },
        {
          name: "Jump Lunges",
          sets: "5 rounds",
          reps: "20",
          rest: "0",
          notes: "Explosive switches"
        },
        {
          name: "Push-Up to Row",
          sets: "5 rounds",
          reps: "10/side",
          rest: "0",
          notes: "Maintain plank position"
        },
        {
          name: "Mountain Climbers",
          sets: "5 rounds",
          reps: "40",
          rest: "90s after round",
          notes: "Fast pace"
        }
      ],
      tips: [
        "Choose weights you can sustain through all 5 rounds",
        "Focus on breathing rhythm",
        "Maintain pace throughout",
        "Keep transitions short"
      ]
    },
    "wc002": {
      name: "Bodyweight Fat Melt",
      serialNumber: "WC002",
      difficulty: "Intermediate",
      duration: "30 min",
      equipment: "Bodyweight Only",
      imageUrl: bodyweightFatMeltImg,
      description: "A HIIT-style circuit emphasizing continuous movement for maximum fat burn.",
      workoutType: "AMRAP",
      format: `AMRAP - 20 minutes
As Many Rounds As Possible
No rest between exercises`,
      instructions: "Perform as many full rounds as possible in 20 minutes.",
      exercises: [
        {
          name: "Jump Squats",
          sets: "AMRAP",
          reps: "15",
          rest: "0",
          notes: "Land softly"
        },
        {
          name: "Push-Ups",
          sets: "AMRAP",
          reps: "10",
          rest: "0",
          notes: "Full range"
        },
        {
          name: "Alternating Lunges",
          sets: "AMRAP",
          reps: "20",
          rest: "0",
          notes: "10 each leg"
        },
        {
          name: "Sit-Ups",
          sets: "AMRAP",
          reps: "15",
          rest: "0",
          notes: "Controlled movement"
        },
        {
          name: "Burpees",
          sets: "AMRAP",
          reps: "10",
          rest: "0",
          notes: "Maintain pace"
        }
      ],
      tips: [
        "Maintain pace, avoid burnout early",
        "Keep short transitions between moves",
        "Focus on breathing",
        "Track your total rounds"
      ]
    },
    "wc003": {
      name: "Cardio Power Intervals",
      serialNumber: "WC003",
      difficulty: "Intermediate",
      duration: "45 min",
      equipment: "Rower, Bike, Kettlebell, Dumbbells",
      imageUrl: cardioPowerIntervalsImg,
      description: "Cardio conditioning intervals combining endurance with short strength bursts.",
      workoutType: "FOR TIME",
      format: `3 min work per station
1 min rest between stations
Repeat x3 rounds`,
      instructions: "Work 3 min per station, rest 1 min between.",
      exercises: [
        {
          name: "Rowing (Max Meters)",
          sets: "3 rounds",
          reps: "3 min",
          rest: "60s",
          notes: "Steady intensity"
        },
        {
          name: "Kettlebell Swings",
          sets: "3 rounds",
          reps: "3 min",
          rest: "60s",
          notes: "Continuous work"
        },
        {
          name: "Assault Bike",
          sets: "3 rounds",
          reps: "3 min",
          rest: "60s",
          notes: "Maintain pace"
        },
        {
          name: "Dumbbell Burpees",
          sets: "3 rounds",
          reps: "3 min",
          rest: "60s",
          notes: "Hold dumbbells throughout"
        }
      ],
      tips: [
        "Keep intensity steady, avoid early fatigue",
        "Focus on consistent output",
        "Breathe through your nose when possible",
        "Track total distance/reps"
      ]
    },
    "wc004": {
      name: "Bodyweight Enduro Flow",
      serialNumber: "WC004",
      difficulty: "Beginner",
      duration: "30 min",
      equipment: "Bodyweight Only",
      imageUrl: bodyweightEnduroFlowImg,
      description: "Continuous-flow cardio bodyweight workout improving endurance and oxygen capacity.",
      workoutType: "CIRCUIT",
      format: `4 Rounds
45s work / 15s rest
Continuous movement`,
      instructions: "Perform each exercise for 45s, rest 15s, repeat 4 rounds.",
      exercises: [
        {
          name: "Jumping Jacks",
          sets: "4 rounds",
          reps: "45s",
          rest: "15s",
          notes: "Full range motion"
        },
        {
          name: "High Knees",
          sets: "4 rounds",
          reps: "45s",
          rest: "15s",
          notes: "Drive knees up"
        },
        {
          name: "Squat to Reach",
          sets: "4 rounds",
          reps: "45s",
          rest: "15s",
          notes: "Reach overhead"
        },
        {
          name: "Push-Ups",
          sets: "4 rounds",
          reps: "45s",
          rest: "15s",
          notes: "Modify as needed"
        },
        {
          name: "Plank Shoulder Taps",
          sets: "4 rounds",
          reps: "45s",
          rest: "15s",
          notes: "Minimize hip rotation"
        }
      ],
      tips: [
        "Keep steady pace",
        "Focus on nasal breathing",
        "Maintain form throughout",
        "Modify exercises as needed"
      ]
    },
    "wm001": {
      name: "Metabolic Destroyer",
      serialNumber: "WM001",
      difficulty: "Advanced",
      duration: "45 min",
      equipment: "Barbell, Kettlebells, Rower",
      imageUrl: metabolicDestroyerImg,
      description: "Metabolic conditioning workout blending strength and cardio elements for post-workout oxygen consumption (EPOC).",
      workoutType: "FOR TIME",
      format: `For Time
Complete all reps for each exercise
Record total time`,
      instructions: "Complete all reps for each exercise before moving to the next. Record total time.",
      exercises: [
        {
          name: "Deadlift",
          sets: "1",
          reps: "21 @ 60% 1RM",
          rest: "0",
          notes: "Controlled reps"
        },
        {
          name: "Front Squat",
          sets: "1",
          reps: "15",
          rest: "0",
          notes: "Maintain form under fatigue"
        },
        {
          name: "Push Press",
          sets: "1",
          reps: "12",
          rest: "0",
          notes: "Use leg drive"
        },
        {
          name: "Kettlebell Swing",
          sets: "1",
          reps: "20",
          rest: "0",
          notes: "Explosive hip extension"
        },
        {
          name: "Row",
          sets: "1",
          reps: "500m",
          rest: "0",
          notes: "Max effort"
        }
      ],
      tips: [
        "Stay efficient under fatigue",
        "Keep technique solid when tired",
        "Pace yourself strategically",
        "Focus on breathing rhythm"
      ]
    },
    "wm002": {
      name: "Metabolic Body Blast",
      serialNumber: "WM002",
      difficulty: "Intermediate",
      duration: "30 min",
      equipment: "Bodyweight Only",
      imageUrl: metabolicBodyBlastImg,
      description: "Short, explosive bodyweight intervals to maximize metabolic impact.",
      workoutType: "TABATA",
      format: `Tabata Format
8 rounds: 20s work / 10s rest
Rotate between exercises
1 min rest between blocks`,
      instructions: "Rotate between exercises with 1-min rest between each block.",
      exercises: [
        {
          name: "Jumping Lunges",
          sets: "8 rounds",
          reps: "20s work",
          rest: "10s",
          notes: "All-out effort"
        },
        {
          name: "Push-Ups",
          sets: "8 rounds",
          reps: "20s work",
          rest: "10s",
          notes: "Max reps"
        },
        {
          name: "Mountain Climbers",
          sets: "8 rounds",
          reps: "20s work",
          rest: "10s",
          notes: "Fast pace"
        },
        {
          name: "Plank Jacks",
          sets: "8 rounds",
          reps: "20s work",
          rest: "10s",
          notes: "Maintain plank"
        }
      ],
      tips: [
        "Go all-out during work intervals",
        "Maintain consistent rhythm",
        "Short rest means high intensity",
        "Track total reps per block"
      ]
    },
    "wmob001": {
      name: "Mobility Reset",
      serialNumber: "WMOB001",
      difficulty: "Intermediate",
      duration: "45 min",
      equipment: "Foam Roller, Mini Band, Mat",
      imageUrl: mobilityResetImg,
      description: "Mobility and stability session focusing on controlled joint movement and core activation.",
      workoutType: "CIRCUIT",
      format: `Controlled movements
Focus on breathing
3 sets per exercise`,
      instructions: "Perform each move slowly with controlled breathing.",
      exercises: [
        {
          name: "Foam Rolling",
          sets: "1",
          reps: "5 min",
          rest: "0",
          notes: "Full body release"
        },
        {
          name: "Cat-Cow Stretch",
          sets: "3",
          reps: "10",
          rest: "30s",
          notes: "Smooth transitions"
        },
        {
          name: "Mini Band Lateral Walks",
          sets: "3",
          reps: "15/side",
          rest: "30s",
          notes: "Keep tension"
        },
        {
          name: "Bird-Dog",
          sets: "3",
          reps: "10/side",
          rest: "30s",
          notes: "Maintain neutral spine"
        },
        {
          name: "Deadbug",
          sets: "3",
          reps: "10",
          rest: "30s",
          notes: "Press lower back down"
        },
        {
          name: "90/90 Hip Flow",
          sets: "3 rounds",
          reps: "Complete flow",
          rest: "60s",
          notes: "Focus on hip mobility"
        }
      ],
      tips: [
        "Never force range of motion",
        "Focus on quality over quantity",
        "Breathe deeply throughout",
        "Listen to your body"
      ]
    },
    "wmob002": {
      name: "Bodyweight Stability Flow",
      serialNumber: "WMOB002",
      difficulty: "Beginner",
      duration: "30 min",
      equipment: "Bodyweight Only",
      imageUrl: bodyweightStabilityFlowImg,
      description: "A gentle movement flow focusing on balance, posture, and joint control.",
      workoutType: "FLOW",
      format: `Flow Sequence
Repeat 3 times
Hold each move 30s`,
      instructions: "Repeat full sequence 3 times, holding each move 30s.",
      exercises: [
        {
          name: "Deep Squat Hold",
          sets: "3 rounds",
          reps: "30s",
          rest: "0",
          notes: "Sit back into heels"
        },
        {
          name: "World's Greatest Stretch",
          sets: "3 rounds",
          reps: "30s/side",
          rest: "0",
          notes: "Rotate through thoracic spine"
        },
        {
          name: "T-Spine Rotation",
          sets: "3 rounds",
          reps: "30s",
          rest: "0",
          notes: "Follow hand with eyes"
        },
        {
          name: "Glute Bridge Hold",
          sets: "3 rounds",
          reps: "30s",
          rest: "0",
          notes: "Squeeze glutes"
        },
        {
          name: "Down Dog to Cobra Flow",
          sets: "3 rounds",
          reps: "30s",
          rest: "0",
          notes: "Smooth transitions"
        }
      ],
      tips: [
        "Breathe through your nose",
        "Maintain posture alignment",
        "Move with intention",
        "Focus on the present moment"
      ]
    },
    "wp001": {
      name: "Power Surge",
      serialNumber: "WP001",
      difficulty: "Advanced",
      duration: "45 min",
      equipment: "Barbell, Medicine Ball, Box",
      imageUrl: powerSurgeAdvancedImg,
      description: "Explosive power session for athletes focused on speed, coordination, and maximal output.",
      workoutType: "REPS & SETS",
      format: `3-4 sets per exercise
Focus on speed and intent
Full recovery between sets`,
      instructions: "Focus on speed and intent, not volume.",
      exercises: [
        {
          name: "Power Clean",
          sets: "4",
          reps: "5 @ 60% 1RM",
          rest: "120s",
          notes: "Explosive triple extension"
        },
        {
          name: "Push Press",
          sets: "3",
          reps: "8",
          rest: "90s",
          notes: "Powerful leg drive"
        },
        {
          name: "Box Jump",
          sets: "3",
          reps: "8",
          rest: "90s",
          notes: "Land softly"
        },
        {
          name: "Medicine Ball Slam",
          sets: "4",
          reps: "10",
          rest: "60s",
          notes: "Full body power"
        },
        {
          name: "Broad Jump",
          sets: "3",
          reps: "6",
          rest: "90s",
          notes: "Max distance"
        }
      ],
      tips: [
        "Always land softly during jumps",
        "Prioritize full recovery between sets",
        "Focus on explosive intent",
        "Quality over quantity"
      ]
    },
    "wp002": {
      name: "Explosive Body Control",
      serialNumber: "WP002",
      difficulty: "Intermediate",
      duration: "30 min",
      equipment: "Bodyweight Only",
      imageUrl: explosiveBodyControlImg,
      description: "Plyometric training session to develop speed and explosive strength.",
      workoutType: "CIRCUIT",
      format: `4 Rounds
30s work / 30s rest
Focus on power output`,
      instructions: "Perform 4 rounds, 30s work per exercise, 30s rest.",
      exercises: [
        {
          name: "Jump Squats",
          sets: "4 rounds",
          reps: "30s",
          rest: "30s",
          notes: "Explosive jumps"
        },
        {
          name: "Plyo Push-Ups",
          sets: "4 rounds",
          reps: "30s",
          rest: "30s",
          notes: "Hands leave ground"
        },
        {
          name: "Skater Jumps",
          sets: "4 rounds",
          reps: "30s",
          rest: "30s",
          notes: "Lateral power"
        },
        {
          name: "Tuck Jumps",
          sets: "4 rounds",
          reps: "30s",
          rest: "30s",
          notes: "Pull knees high"
        },
        {
          name: "Burpees",
          sets: "4 rounds",
          reps: "30s",
          rest: "30s",
          notes: "Explosive movement"
        }
      ],
      tips: [
        "Land light, control deceleration",
        "Focus on explosive power",
        "Maintain form under fatigue",
        "Rest as needed between rounds"
      ]
    },
    "wch001": {
      name: "HFSC Challenge 1: The Grinder",
      serialNumber: "WCH001",
      difficulty: "Elite",
      duration: "60 min",
      equipment: "Barbell, Dumbbells, Pull-Up Bar, Rower",
      imageUrl: hfscBodyweightInfernoImg,
      description: "The HFSC Grinder is a brutal full-body challenge testing strength, endurance, and willpower.",
      workoutType: "FOR TIME",
      format: `For Time
Complete all exercises
100 reps each + 1km row
Record total time`,
      instructions: "Complete all exercises for time. Record completion time.",
      exercises: [
        {
          name: "Barbell Squats",
          sets: "1",
          reps: "100",
          rest: "0",
          notes: "Break reps strategically"
        },
        {
          name: "Push-Ups",
          sets: "1",
          reps: "100",
          rest: "0",
          notes: "Maintain form"
        },
        {
          name: "Pull-Ups",
          sets: "1",
          reps: "100",
          rest: "0",
          notes: "Full range of motion"
        },
        {
          name: "Deadlifts",
          sets: "1",
          reps: "100",
          rest: "0",
          notes: "Control each rep"
        },
        {
          name: "Sit-Ups",
          sets: "1",
          reps: "100",
          rest: "0",
          notes: "Continuous movement"
        },
        {
          name: "Row",
          sets: "1",
          reps: "1km",
          rest: "0",
          notes: "Finish strong"
        }
      ],
      tips: [
        "Break reps strategically",
        "Keep breathing controlled",
        "This is a mental game",
        "Trust your training"
      ]
    },
    "wch002": {
      name: "HFSC Challenge 2: Bodyweight Inferno",
      serialNumber: "WCH002",
      difficulty: "Advanced",
      duration: "45 min",
      equipment: "Bodyweight Only, Pull-Up Bar",
      imageUrl: hfscGrinderImg,
      description: "A full-body bodyweight test pushing endurance, coordination, and mindset.",
      workoutType: "AMRAP",
      format: `AMRAP - 30 minutes
Complete as many rounds as possible
Track total rounds`,
      instructions: "Complete as many rounds as possible.",
      exercises: [
        {
          name: "Air Squats",
          sets: "AMRAP",
          reps: "20",
          rest: "0",
          notes: "Full depth"
        },
        {
          name: "Push-Ups",
          sets: "AMRAP",
          reps: "15",
          rest: "0",
          notes: "Chest to ground"
        },
        {
          name: "Burpees",
          sets: "AMRAP",
          reps: "10",
          rest: "0",
          notes: "Maintain pace"
        },
        {
          name: "Pull-Ups",
          sets: "AMRAP",
          reps: "5",
          rest: "0",
          notes: "Full extension"
        }
      ],
      tips: [
        "Focus on breathing and pacing",
        "Break early if needed",
        "Mental toughness is key",
        "Track your rounds"
      ]
    },
    "ws003": {
      name: "Iron Titan Strength",
      serialNumber: "WS003",
      difficulty: "Advanced",
      duration: "60 min",
      equipment: "Equipment Required",
      imageUrl: ironTitanStrengthImg,
      description: "Heavy compound lifts combined with control tempo for raw strength and improved joint stability.",
      workoutType: "REPS & SETS",
      format: `Reps & Sets
5x5 @ 85% 1RM on main lifts
Rest: 2-3 mins between heavy sets`,
      instructions: "Maintain 2–3 min rest between heavy sets. Focus on controlled eccentrics.",
      exercises: [
        { name: "Barbell Deadlift", sets: "5", reps: "5", rest: "3 mins", notes: "@ 85% 1RM" },
        { name: "Bench Press", sets: "4", reps: "6", rest: "3 mins", notes: "@ 80% 1RM" },
        { name: "Barbell Row", sets: "4", reps: "8", rest: "2 mins", notes: "Control the eccentric" },
        { name: "Dumbbell Lunge", sets: "3", reps: "10/leg", rest: "90s", notes: "Full range of motion" },
        { name: "Weighted Pull-Up", sets: "3", reps: "8", rest: "2 mins", notes: "Add weight as able" },
        { name: "Plank", sets: "3", reps: "60s", rest: "60s", notes: "Maintain core tension" }
      ],
      tips: [
        "Prioritize form over load",
        "Keep core tight throughout",
        "Control the eccentric phase",
        "Rest fully between heavy sets",
        "Track your weights"
      ]
    },
    "ws004": {
      name: "Functional Compound Strength",
      serialNumber: "WS004",
      difficulty: "Intermediate",
      duration: "45 min",
      equipment: "Equipment Required",
      imageUrl: functionalCompoundStrengthImg,
      description: "Functional strength training combining push, pull, and hinge patterns.",
      workoutType: "CIRCUIT",
      format: `Circuit - 3 rounds
Rest 2 mins between rounds`,
      instructions: "Perform one round of all exercises, rest 2 min, and repeat 3 times.",
      exercises: [
        { name: "Dumbbell Squat to Press", sets: "3", reps: "12", rest: "0", notes: "Fluid movement" },
        { name: "TRX Row", sets: "3", reps: "12", rest: "0", notes: "Pull chest to hands" },
        { name: "Kettlebell Deadlift", sets: "3", reps: "10", rest: "0", notes: "Hip hinge pattern" },
        { name: "Dumbbell Step-Up", sets: "3", reps: "12/leg", rest: "0", notes: "Drive through heel" },
        { name: "Side Plank", sets: "3", reps: "30s/side", rest: "2 mins", notes: "Maintain alignment" }
      ],
      tips: [
        "Choose weights allowing consistent form",
        "Keep tempo steady",
        "Focus on movement quality",
        "Rest fully between circuits"
      ]
    },
    "ws005": {
      name: "Strength Density Builder",
      serialNumber: "WS005",
      difficulty: "Advanced",
      duration: "60 min",
      equipment: "Equipment Required",
      imageUrl: strengthDensityBuilderImg,
      description: "High-density strength session focusing on maximal tension per time.",
      workoutType: "FOR TIME",
      format: `For Time - 5 rounds
40 minute cap
Track total time`,
      instructions: "Complete 5 rounds as quickly as possible while maintaining good form.",
      exercises: [
        { name: "Front Squat", sets: "5", reps: "6", rest: "As needed", notes: "@ 75% 1RM" },
        { name: "Push Press", sets: "5", reps: "8", rest: "As needed", notes: "@ 70% 1RM" },
        { name: "Weighted Pull-Up", sets: "5", reps: "8", rest: "As needed", notes: "Control descent" },
        { name: "Walking Lunges", sets: "5", reps: "20 steps", rest: "As needed", notes: "Maintain posture" },
        { name: "Weighted Plank", sets: "5", reps: "45s", rest: "As needed", notes: "Add plate on back" }
      ],
      tips: [
        "Control pace on heavy lifts",
        "Avoid skipping rest when form deteriorates",
        "Maintain quality over speed",
        "Track your time"
      ]
    },
    "ws006": {
      name: "Bodyweight Prime Strength",
      serialNumber: "WS006",
      difficulty: "Intermediate",
      duration: "45 min",
      equipment: "No Equipment Required",
      imageUrl: bodyweightPrimeStrengthImg,
      description: "Develop core strength and stability through unilateral movements.",
      workoutType: "REPS & SETS",
      format: `Reps & Sets - 3-4 rounds
Slow tempo (3-1-1)
Focus on control`,
      instructions: "Perform 3–4 rounds with perfect control on every rep.",
      exercises: [
        { name: "Single-Leg Squat to Bench", sets: "3-4", reps: "10/leg", rest: "90s", notes: "Controlled descent" },
        { name: "Decline Push-Ups", sets: "3-4", reps: "12", rest: "60s", notes: "Feet elevated" },
        { name: "Single-Leg Glute Bridge", sets: "3-4", reps: "15/leg", rest: "60s", notes: "Squeeze at top" },
        { name: "Side Plank with Reach", sets: "3-4", reps: "12/side", rest: "60s", notes: "Reach under body" },
        { name: "Superman Hold", sets: "3-4", reps: "40s", rest: "90s", notes: "Full extension" }
      ],
      tips: [
        "Use slow tempo (3–1–1)",
        "Stay stable during single-leg work",
        "Focus on control over reps",
        "Maintain form throughout"
      ]
    },
    "ws007": {
      name: "Core Stability Strength",
      serialNumber: "WS007",
      difficulty: "Beginner",
      duration: "30 min",
      equipment: "No Equipment Required",
      imageUrl: coreStabilityStrengthImg,
      description: "A foundational bodyweight session to build core tension and muscle endurance.",
      workoutType: "CIRCUIT",
      format: `Circuit - 4 rounds
40s work / 20s rest per exercise`,
      instructions: "Perform 4 rounds, 40s work, 20s rest per exercise.",
      exercises: [
        { name: "Plank Shoulder Taps", sets: "4", reps: "40s", rest: "20s", notes: "Minimize rotation" },
        { name: "Glute Bridge Hold", sets: "4", reps: "40s", rest: "20s", notes: "Squeeze glutes" },
        { name: "Superman Pulls", sets: "4", reps: "40s", rest: "20s", notes: "Pull shoulder blades back" },
        { name: "Push-Ups", sets: "4", reps: "40s", rest: "20s", notes: "Modify as needed" },
        { name: "Side Plank", sets: "4", reps: "30s/side", rest: "60s", notes: "Maintain alignment" }
      ],
      tips: [
        "Keep abs engaged through all sets",
        "Focus on quality reps",
        "Don't rush transitions",
        "Modify as needed"
      ]
    },
    "wc005": {
      name: "Calorie Storm Circuit",
      serialNumber: "WC005",
      difficulty: "Intermediate",
      duration: "45 min",
      equipment: "Equipment Required",
      imageUrl: calorieStormCircuitImg,
      description: "A mixed resistance and cardio circuit to maximize total energy output.",
      workoutType: "CIRCUIT",
      format: `Circuit - 5 rounds
Rest 90s between rounds
Work at 80% effort`,
      instructions: "Rest 90s between rounds, work at 80% effort.",
      exercises: [
        { name: "Kettlebell Swing", sets: "5", reps: "15", rest: "0", notes: "Hip drive" },
        { name: "Dumbbell Thruster", sets: "5", reps: "12", rest: "0", notes: "Squat to press" },
        { name: "Jump Lunges", sets: "5", reps: "20", rest: "0", notes: "Explosive" },
        { name: "Renegade Row", sets: "5", reps: "12", rest: "0", notes: "Plank position" },
        { name: "Burpees", sets: "5", reps: "10", rest: "90s", notes: "Full range" }
      ],
      tips: [
        "Keep consistent movement pace",
        "Don't go max effort too early",
        "Control breathing",
        "Rest fully between rounds"
      ]
    },
    "wc006": {
      name: "Full Throttle Fat Burn",
      serialNumber: "WC006",
      difficulty: "Advanced",
      duration: "60 min",
      equipment: "Equipment Required",
      imageUrl: fullThrottleFatBurnImg,
      description: "High-intensity metabolic session combining endurance and strength bursts.",
      workoutType: "FOR TIME",
      format: `For Time - 3 rounds
Complete all stations ASAP`,
      instructions: "3 rounds, complete all stations as fast as possible.",
      exercises: [
        { name: "Row", sets: "3", reps: "500m", rest: "0", notes: "Max effort" },
        { name: "Dumbbell Snatch", sets: "3", reps: "10/side", rest: "0", notes: "Explosive pull" },
        { name: "Bike", sets: "3", reps: "1km", rest: "0", notes: "High cadence" },
        { name: "Jump Squats", sets: "3", reps: "20", rest: "0", notes: "Full depth" },
        { name: "Push-Ups", sets: "3", reps: "15", rest: "As needed", notes: "Chest to ground" }
      ],
      tips: [
        "Track heart rate (stay near 80–90% MHR)",
        "Pace the rows and bike",
        "Push through fatigue",
        "Track your time"
      ]
    },
    "wc007": {
      name: "Burn Zone Intervals",
      serialNumber: "WC007",
      difficulty: "Intermediate",
      duration: "45 min",
      equipment: "Equipment Required",
      imageUrl: burnZoneIntervalsImg,
      description: "Explosive intervals alternating upper and lower movements to boost caloric output.",
      workoutType: "TABATA",
      format: `Tabata - 20s work / 10s rest
4 rounds through all exercises`,
      instructions: "Cycle through all exercises for 4 rounds.",
      exercises: [
        { name: "Medicine Ball Slam", sets: "4", reps: "20s", rest: "10s", notes: "Max power" },
        { name: "Kettlebell Swing", sets: "4", reps: "20s", rest: "10s", notes: "Hip hinge" },
        { name: "Jump Lunges", sets: "4", reps: "20s", rest: "10s", notes: "Alternate legs" },
        { name: "Burpees", sets: "4", reps: "20s", rest: "10s", notes: "Full range" }
      ],
      tips: [
        "Max effort during work intervals",
        "Use the 10s rest to breathe",
        "Maintain form even when tired",
        "Track total reps"
      ]
    },
    "wc008": {
      name: "Bodyweight Inferno",
      serialNumber: "WC008",
      difficulty: "Intermediate",
      duration: "30 min",
      equipment: "No Equipment Required",
      imageUrl: bodyweightInfernoImg,
      description: "A nonstop fat-burner using compound bodyweight movements.",
      workoutType: "AMRAP",
      format: `AMRAP - 20 minutes
As many rounds as possible`,
      instructions: "Perform as many rounds as possible.",
      exercises: [
        { name: "Jump Squats", sets: "AMRAP", reps: "15", rest: "0", notes: "Full depth" },
        { name: "Push-Ups", sets: "AMRAP", reps: "10", rest: "0", notes: "Chest to ground" },
        { name: "Mountain Climbers", sets: "AMRAP", reps: "20", rest: "0", notes: "Fast pace" },
        { name: "Sit-Ups", sets: "AMRAP", reps: "15", rest: "0", notes: "Full range" },
        { name: "Burpees", sets: "AMRAP", reps: "10", rest: "0", notes: "Explosive jump" }
      ],
      tips: [
        "Keep steady breathing",
        "Pace yourself",
        "Don't rest too long",
        "Track your rounds"
      ]
    },
    "wc009": {
      name: "Burn Flow 2.0",
      serialNumber: "WC009",
      difficulty: "Beginner",
      duration: "30 min",
      equipment: "No Equipment Required",
      imageUrl: burnFlow2Img,
      description: "Rhythmic cardio workout for beginners aiming at calorie loss and endurance.",
      workoutType: "CIRCUIT",
      format: `Circuit - 4 rounds
45s work / 15s rest`,
      instructions: "4 rounds, 45s work, 15s rest.",
      exercises: [
        { name: "Jumping Jacks", sets: "4", reps: "45s", rest: "15s", notes: "Steady rhythm" },
        { name: "High Knees", sets: "4", reps: "45s", rest: "15s", notes: "Drive knees up" },
        { name: "Air Squats", sets: "4", reps: "45s", rest: "15s", notes: "Full range" },
        { name: "Plank Shoulder Taps", sets: "4", reps: "45s", rest: "15s", notes: "Minimize rotation" },
        { name: "Jump Rope (imaginary)", sets: "4", reps: "45s", rest: "60s", notes: "Wrist motion" }
      ],
      tips: [
        "Focus on full range motion",
        "Keep breathing steady",
        "Don't rush",
        "Build rhythm"
      ]
    },
    "wm003": {
      name: "Metabolic Mayhem",
      serialNumber: "WM003",
      difficulty: "Advanced",
      duration: "60 min",
      equipment: "Equipment Required",
      imageUrl: metabolicMayhemImg,
      description: "Advanced metabolic workout combining barbell movements with cardio bursts.",
      workoutType: "FOR TIME",
      format: `For Time
21-15-9 reps scheme
Then 3 rounds of 15 DB Snatches/arm`,
      instructions: "Complete 21-15-9 reps, then 3 rounds of 15 Dumbbell Snatches each arm.",
      exercises: [
        { name: "Front Squat", sets: "1", reps: "21-15-9", rest: "0", notes: "Barbell" },
        { name: "Push Press", sets: "1", reps: "21-15-9", rest: "0", notes: "Barbell" },
        { name: "Row (calories)", sets: "1", reps: "21-15-9", rest: "0", notes: "Max effort" },
        { name: "Dumbbell Snatch", sets: "3", reps: "15/arm", rest: "As needed", notes: "Explosive" }
      ],
      tips: [
        "Pace the barbell movements",
        "Push hard on the row",
        "Rest when needed",
        "Track your time"
      ]
    },
    "wm004": {
      name: "Metabolic Engine",
      serialNumber: "WM004",
      difficulty: "Intermediate",
      duration: "45 min",
      equipment: "Equipment Required",
      imageUrl: metabolicEngineImg,
      description: "Circuit-based metabolic conditioning using kettlebells and medicine ball.",
      workoutType: "CIRCUIT",
      format: `Circuit - 5 rounds
Minimal rest between exercises`,
      instructions: "Perform 5 rounds with minimal rest.",
      exercises: [
        { name: "Kettlebell Swing", sets: "5", reps: "15", rest: "0", notes: "Hip drive" },
        { name: "Medicine Ball Slam", sets: "5", reps: "12", rest: "0", notes: "Overhead slam" },
        { name: "Kettlebell Lunge", sets: "5", reps: "10/leg", rest: "0", notes: "Front rack" },
        { name: "Jump Rope", sets: "5", reps: "60s", rest: "90s", notes: "Steady pace" }
      ],
      tips: [
        "Keep movement continuous",
        "Control breathing",
        "Rest only between rounds",
        "Track total rounds"
      ]
    },
    "wm005": {
      name: "Metabolic Overdrive",
      serialNumber: "WM005",
      difficulty: "Advanced",
      duration: "45 min",
      equipment: "Equipment Required",
      imageUrl: metabolicOverdriveImg,
      description: "High-intensity AMRAP focusing on explosive power and metabolic output.",
      workoutType: "AMRAP",
      format: `AMRAP - 20 minutes
Max rounds possible`,
      instructions: "Complete as many rounds as possible in 20 minutes.",
      exercises: [
        { name: "Box Jump", sets: "AMRAP", reps: "10", rest: "0", notes: "Full extension" },
        { name: "Dumbbell Clean", sets: "AMRAP", reps: "12", rest: "0", notes: "Explosive pull" },
        { name: "Push-Up to Row", sets: "AMRAP", reps: "10", rest: "0", notes: "Plank position" },
        { name: "Air Bike", sets: "AMRAP", reps: "1 min", rest: "0", notes: "High intensity" }
      ],
      tips: [
        "Pace yourself early",
        "Keep form clean",
        "Push through fatigue",
        "Track your rounds"
      ]
    },
    "wm006": {
      name: "Bodyweight Engine",
      serialNumber: "WM006",
      difficulty: "Intermediate",
      duration: "30 min",
      equipment: "No Equipment Required",
      imageUrl: bodyweightEngineImg,
      description: "Tabata-style metabolic workout using bodyweight movements only.",
      workoutType: "TABATA",
      format: `Tabata - 20s work / 10s rest
8 rounds per exercise`,
      instructions: "8 rounds of 20s work, 10s rest per exercise.",
      exercises: [
        { name: "Jump Squat", sets: "8", reps: "20s", rest: "10s", notes: "Explosive" },
        { name: "Push-Up", sets: "8", reps: "20s", rest: "10s", notes: "Full range" },
        { name: "Mountain Climber", sets: "8", reps: "20s", rest: "10s", notes: "Fast pace" },
        { name: "Plank Jacks", sets: "8", reps: "20s", rest: "10s", notes: "Feet wide" }
      ],
      tips: [
        "Max effort in work intervals",
        "Use rest to breathe",
        "Maintain form",
        "Track total reps"
      ]
    },
    "wm007": {
      name: "Metabolic Core Burn",
      serialNumber: "WM007",
      difficulty: "Beginner",
      duration: "30 min",
      equipment: "No Equipment Required",
      imageUrl: metabolicCoreBurnImg,
      description: "Circuit combining metabolic conditioning with core-focused movements.",
      workoutType: "CIRCUIT",
      format: `Circuit - 4 rounds
45s work / 15s rest`,
      instructions: "4 rounds, 45s work, 15s rest.",
      exercises: [
        { name: "Burpees", sets: "4", reps: "10", rest: "0", notes: "Full range" },
        { name: "Sit-Ups", sets: "4", reps: "15", rest: "0", notes: "Hands behind head" },
        { name: "Jumping Lunges", sets: "4", reps: "10/leg", rest: "0", notes: "Alternate legs" },
        { name: "Superman", sets: "4", reps: "12", rest: "0", notes: "Arms extended" },
        { name: "Plank", sets: "4", reps: "45s", rest: "60s", notes: "Maintain alignment" }
      ],
      tips: [
        "Focus on core engagement",
        "Keep pace steady",
        "Don't rush reps",
        "Rest between rounds"
      ]
    },
    "wca005": {
      name: "Cardio Engine Builder",
      serialNumber: "WCA005",
      difficulty: "Intermediate",
      duration: "45 min",
      equipment: "Equipment Required",
      imageUrl: cardioEngineBuilderImg,
      description: "Build cardiovascular endurance using rower and bike intervals.",
      workoutType: "CIRCUIT",
      format: `Circuit - 6 rounds
Alternate between rower and bike`,
      instructions: "Alternate between rower and bike for 6 rounds.",
      exercises: [
        { name: "Rower", sets: "6", reps: "2 mins", rest: "1 min", notes: "Moderate intensity" },
        { name: "Bike", sets: "6", reps: "2 mins", rest: "1 min", notes: "Steady cadence" }
      ],
      tips: [
        "Maintain consistent pace",
        "Focus on breathing",
        "Don't sprint early",
        "Build endurance progressively"
      ]
    },
    "wca006": {
      name: "Sprint Power Combo",
      serialNumber: "WCA006",
      difficulty: "Advanced",
      duration: "45 min",
      equipment: "Equipment Required",
      imageUrl: sprintPowerComboImg,
      description: "Combining sled pushes with kettlebell work for explosive cardio power.",
      workoutType: "FOR TIME",
      format: `For Time - 5 rounds
Complete ASAP`,
      instructions: "Complete 5 rounds as fast as possible.",
      exercises: [
        { name: "Sled Push", sets: "5", reps: "20m", rest: "0", notes: "Heavy load" },
        { name: "Kettlebell Swing", sets: "5", reps: "15", rest: "0", notes: "Hip drive" },
        { name: "Sprint", sets: "5", reps: "50m", rest: "2 mins", notes: "Max effort" }
      ],
      tips: [
        "Push through the sled",
        "Explosive swings",
        "Sprint all-out",
        "Rest fully between rounds"
      ]
    },
    "wca007": {
      name: "Conditioning Pyramid",
      serialNumber: "WCA007",
      difficulty: "Intermediate",
      duration: "45 min",
      equipment: "Equipment Required",
      imageUrl: conditioningPyramidImg,
      description: "Pyramid-style cardio conditioning with dumbbells and jump rope.",
      workoutType: "CIRCUIT",
      format: `Circuit - Pyramid
1-2-3-4-5-4-3-2-1 rounds`,
      instructions: "Complete pyramid: 1-2-3-4-5-4-3-2-1 rounds.",
      exercises: [
        { name: "Dumbbell Thruster", sets: "Pyramid", reps: "Varies", rest: "0", notes: "Squat to press" },
        { name: "Jump Rope", sets: "Pyramid", reps: "30s each", rest: "0", notes: "Steady pace" },
        { name: "Burpees", sets: "Pyramid", reps: "Varies", rest: "30s", notes: "Full range" }
      ],
      tips: [
        "Pace the pyramid climb",
        "Peak at 5 rounds",
        "Descend with control",
        "Track your time"
      ]
    },
    "wca008": {
      name: "Bodyweight Endurance Flow",
      serialNumber: "WCA008",
      difficulty: "Intermediate",
      duration: "30 min",
      equipment: "No Equipment Required",
      imageUrl: bodyweightEnduranceFlowImg,
      description: "Continuous bodyweight cardio flow for sustained aerobic capacity.",
      workoutType: "CIRCUIT",
      format: `Circuit - 5 rounds
40s work / 20s rest`,
      instructions: "5 rounds, 40s work, 20s rest.",
      exercises: [
        { name: "High Knees", sets: "5", reps: "40s", rest: "20s", notes: "Drive knees up" },
        { name: "Mountain Climbers", sets: "5", reps: "40s", rest: "20s", notes: "Fast pace" },
        { name: "Jump Squats", sets: "5", reps: "40s", rest: "20s", notes: "Full depth" },
        { name: "Burpees", sets: "5", reps: "40s", rest: "20s", notes: "Full range" },
        { name: "Jumping Jacks", sets: "5", reps: "40s", rest: "60s", notes: "Steady rhythm" }
      ],
      tips: [
        "Keep continuous movement",
        "Control breathing",
        "Maintain form",
        "Build aerobic base"
      ]
    },
    "wca009": {
      name: "Fast Feet Cardio Flow",
      serialNumber: "WCA009",
      difficulty: "Beginner",
      duration: "30 min",
      equipment: "No Equipment Required",
      imageUrl: fastFeetCardioFlowImg,
      description: "Bodyweight cardio focusing on speed and agility movements.",
      workoutType: "CIRCUIT",
      format: `Circuit - 4 rounds
45s work / 15s rest`,
      instructions: "4 rounds, 45s work, 15s rest.",
      exercises: [
        { name: "Fast Feet", sets: "4", reps: "45s", rest: "15s", notes: "Quick steps" },
        { name: "High Knees", sets: "4", reps: "45s", rest: "15s", notes: "Drive knees" },
        { name: "Butt Kicks", sets: "4", reps: "45s", rest: "15s", notes: "Heel to glute" },
        { name: "Lateral Shuffles", sets: "4", reps: "45s", rest: "15s", notes: "Stay low" },
        { name: "Jumping Jacks", sets: "4", reps: "45s", rest: "60s", notes: "Full range" }
      ],
      tips: [
        "Focus on foot speed",
        "Stay light on feet",
        "Maintain good posture",
        "Build coordination"
      ]
    },
    "wmob003": {
      name: "Joint Flow Restore",
      serialNumber: "WMOB003",
      difficulty: "Intermediate",
      duration: "45 min",
      equipment: "Equipment Required",
      imageUrl: jointFlowRestoreImg,
      description: "Mobility restoration using foam roller and resistance bands.",
      workoutType: "CIRCUIT",
      format: `Circuit - 3 rounds
Focus on controlled movement`,
      instructions: "3 rounds, focus on control and mobility.",
      exercises: [
        { name: "Foam Roller - IT Band", sets: "3", reps: "60s/side", rest: "30s", notes: "Slow roll" },
        { name: "Band Pull-Apart", sets: "3", reps: "15", rest: "30s", notes: "Squeeze shoulder blades" },
        { name: "Cat-Cow Stretch", sets: "3", reps: "10", rest: "30s", notes: "Full range" },
        { name: "Band Overhead Reach", sets: "3", reps: "12", rest: "30s", notes: "Full extension" },
        { name: "Hip Circles", sets: "3", reps: "10/direction", rest: "60s", notes: "Control movement" }
      ],
      tips: [
        "Move slowly and controlled",
        "Breathe deeply",
        "Don't force range",
        "Focus on problem areas"
      ]
    },
    "wmob004": {
      name: "Core Stability Builder",
      serialNumber: "WMOB004",
      difficulty: "Intermediate",
      duration: "45 min",
      equipment: "Equipment Required",
      imageUrl: coreStabilityBuilderImg,
      description: "TRX-based stability workout focusing on core control and balance.",
      workoutType: "REPS & SETS",
      format: `Reps & Sets - 3 rounds
Focus on stability`,
      instructions: "3 rounds, focus on stability and control.",
      exercises: [
        { name: "TRX Plank", sets: "3", reps: "45s", rest: "60s", notes: "Feet in straps" },
        { name: "TRX Pike", sets: "3", reps: "12", rest: "60s", notes: "Core engagement" },
        { name: "TRX Mountain Climber", sets: "3", reps: "20", rest: "60s", notes: "Controlled pace" },
        { name: "TRX Single-Leg Squat", sets: "3", reps: "10/leg", rest: "60s", notes: "Balance focus" },
        { name: "TRX Row", sets: "3", reps: "15", rest: "90s", notes: "Pull chest to hands" }
      ],
      tips: [
        "Focus on core stability",
        "Control all movements",
        "Maintain balance",
        "Progress gradually"
      ]
    },
    "wmob005": {
      name: "Balance Flow Reset",
      serialNumber: "WMOB005",
      difficulty: "Beginner",
      duration: "30 min",
      equipment: "Equipment Required",
      imageUrl: balanceFlowResetImg,
      description: "Mini band and mat work for balance and mobility restoration.",
      workoutType: "CIRCUIT",
      format: `Circuit - 3 rounds
Focus on balance`,
      instructions: "3 rounds, focus on balance and control.",
      exercises: [
        { name: "Mini Band Lateral Walk", sets: "3", reps: "20 steps", rest: "30s", notes: "Stay low" },
        { name: "Single-Leg Balance", sets: "3", reps: "30s/leg", rest: "30s", notes: "Focus point" },
        { name: "Cat-Cow", sets: "3", reps: "10", rest: "30s", notes: "Spine articulation" },
        { name: "Mini Band Glute Bridge", sets: "3", reps: "15", rest: "30s", notes: "Push knees out" },
        { name: "Child's Pose", sets: "3", reps: "30s", rest: "60s", notes: "Relaxation" }
      ],
      tips: [
        "Focus on stability",
        "Breathe deeply",
        "Don't rush",
        "Build balance progressively"
      ]
    },
    "wmob006": {
      name: "Mobility Wave",
      serialNumber: "WMOB006",
      difficulty: "Beginner",
      duration: "30 min",
      equipment: "No Equipment Required",
      imageUrl: mobilityWaveImg,
      description: "Bodyweight mobility flow with dynamic stretching and joint prep.",
      workoutType: "CIRCUIT",
      format: `Circuit - 3 rounds
Dynamic movement`,
      instructions: "3 rounds of dynamic mobility movements.",
      exercises: [
        { name: "Arm Circles", sets: "3", reps: "10/direction", rest: "0", notes: "Full range" },
        { name: "Leg Swings", sets: "3", reps: "10/leg", rest: "0", notes: "Front to back" },
        { name: "Hip Circles", sets: "3", reps: "10/direction", rest: "0", notes: "Control movement" },
        { name: "Thoracic Rotations", sets: "3", reps: "10/side", rest: "0", notes: "Open chest" },
        { name: "World's Greatest Stretch", sets: "3", reps: "5/side", rest: "60s", notes: "Full flow" }
      ],
      tips: [
        "Move through full range",
        "Control each movement",
        "Breathe deeply",
        "Warm up joints"
      ]
    },
    "wmob007": {
      name: "Stability Core Flow",
      serialNumber: "WMOB007",
      difficulty: "Beginner",
      duration: "30 min",
      equipment: "No Equipment Required",
      imageUrl: stabilityCoreFlowImg,
      description: "Bodyweight stability and core activation flow.",
      workoutType: "CIRCUIT",
      format: `Circuit - 3 rounds
Focus on control`,
      instructions: "3 rounds, focus on core stability.",
      exercises: [
        { name: "Bird Dog", sets: "3", reps: "10/side", rest: "30s", notes: "Opposite limbs" },
        { name: "Dead Bug", sets: "3", reps: "12", rest: "30s", notes: "Core engaged" },
        { name: "Side Plank", sets: "3", reps: "30s/side", rest: "30s", notes: "Maintain alignment" },
        { name: "Glute Bridge", sets: "3", reps: "15", rest: "30s", notes: "Squeeze at top" },
        { name: "Plank", sets: "3", reps: "45s", rest: "60s", notes: "Full tension" }
      ],
      tips: [
        "Focus on core activation",
        "Control all movements",
        "Maintain alignment",
        "Breathe consistently"
      ]
    },
    "wp003": {
      name: "Explosive Engine",
      serialNumber: "WP003",
      difficulty: "Advanced",
      duration: "45 min",
      equipment: "Equipment Required",
      imageUrl: explosiveEnginePowerImg,
      description: "Barbell and medicine ball power training for maximum explosive output.",
      workoutType: "REPS & SETS",
      format: `Reps & Sets - 5 sets
Focus on explosive power`,
      instructions: "5 sets, focus on maximal explosive power.",
      exercises: [
        { name: "Barbell Power Clean", sets: "5", reps: "5", rest: "3 mins", notes: "Explosive pull" },
        { name: "Medicine Ball Slam", sets: "5", reps: "10", rest: "2 mins", notes: "Overhead throw" },
        { name: "Box Jump", sets: "5", reps: "8", rest: "2 mins", notes: "Full extension" },
        { name: "Barbell Push Press", sets: "5", reps: "6", rest: "3 mins", notes: "Drive through legs" },
        { name: "Broad Jump", sets: "5", reps: "8", rest: "2 mins", notes: "Explosive hip extension" }
      ],
      tips: [
        "Focus on power output",
        "Rest fully between sets",
        "Maintain explosive intent",
        "Quality over quantity"
      ]
    },
    "wp004": {
      name: "Speed Mechanics",
      serialNumber: "WP004",
      difficulty: "Intermediate",
      duration: "45 min",
      equipment: "Equipment Required",
      imageUrl: speedMechanicsImg,
      description: "Dumbbells and box work focusing on speed and power mechanics.",
      workoutType: "CIRCUIT",
      format: `Circuit - 4 rounds
Focus on speed`,
      instructions: "4 rounds, focus on speed and technique.",
      exercises: [
        { name: "Dumbbell Snatch", sets: "4", reps: "8/arm", rest: "0", notes: "Explosive pull" },
        { name: "Box Jump", sets: "4", reps: "10", rest: "0", notes: "Full extension" },
        { name: "Dumbbell Push Press", sets: "4", reps: "12", rest: "0", notes: "Drive through legs" },
        { name: "Speed Skaters", sets: "4", reps: "20", rest: "0", notes: "Explosive lateral" },
        { name: "Plank", sets: "4", reps: "30s", rest: "2 mins", notes: "Core recovery" }
      ],
      tips: [
        "Focus on speed of movement",
        "Maintain technique",
        "Rest between rounds",
        "Progressive load"
      ]
    },
    "wp005": {
      name: "Olympic Power Session",
      serialNumber: "WP005",
      difficulty: "Advanced",
      duration: "60 min",
      equipment: "Equipment Required",
      imageUrl: olympicPowerSessionImg,
      description: "Olympic lifting-focused session for power development.",
      workoutType: "REPS & SETS",
      format: `Reps & Sets - 6 sets
Olympic lifting focus`,
      instructions: "6 sets of Olympic lifts with full rest.",
      exercises: [
        { name: "Clean & Jerk", sets: "6", reps: "3", rest: "3 mins", notes: "Technical focus" },
        { name: "Snatch", sets: "6", reps: "2", rest: "3 mins", notes: "Explosive pull" },
        { name: "Front Squat", sets: "6", reps: "5", rest: "3 mins", notes: "Maintain posture" },
        { name: "Push Press", sets: "6", reps: "5", rest: "3 mins", notes: "Drive from legs" },
        { name: "Barbell Row", sets: "6", reps: "8", rest: "2 mins", notes: "Control tempo" }
      ],
      tips: [
        "Focus on technique first",
        "Rest fully between sets",
        "Warm up thoroughly",
        "Progress load gradually"
      ]
    },
    "wp006": {
      name: "Plyometric Burn",
      serialNumber: "WP006",
      difficulty: "Intermediate",
      duration: "30 min",
      equipment: "No Equipment Required",
      imageUrl: plyometricBurnImg,
      description: "Bodyweight plyometric workout for explosive power and calorie burn.",
      workoutType: "CIRCUIT",
      format: `Circuit - 4 rounds
45s work / 15s rest`,
      instructions: "4 rounds, 45s work, 15s rest.",
      exercises: [
        { name: "Jump Squats", sets: "4", reps: "45s", rest: "15s", notes: "Explosive" },
        { name: "Burpees", sets: "4", reps: "45s", rest: "15s", notes: "Full range" },
        { name: "Tuck Jumps", sets: "4", reps: "45s", rest: "15s", notes: "Knees to chest" },
        { name: "Plyo Push-Ups", sets: "4", reps: "45s", rest: "15s", notes: "Explosive push" },
        { name: "Box Jumps (or Step-Ups)", sets: "4", reps: "45s", rest: "60s", notes: "Full extension" }
      ],
      tips: [
        "Land softly",
        "Focus on explosive movements",
        "Maintain form",
        "Rest between rounds"
      ]
    },
    "wp007": {
      name: "Power Flow",
      serialNumber: "WP007",
      difficulty: "Beginner",
      duration: "30 min",
      equipment: "No Equipment Required",
      imageUrl: powerFlowImg,
      description: "Bodyweight power flow combining speed and control.",
      workoutType: "CIRCUIT",
      format: `Circuit - 3 rounds
Focus on controlled power`,
      instructions: "3 rounds, focus on controlled explosive movements.",
      exercises: [
        { name: "Jump Squats", sets: "3", reps: "10", rest: "30s", notes: "Controlled landing" },
        { name: "Plyo Push-Ups (knee option)", sets: "3", reps: "8", rest: "30s", notes: "Explosive push" },
        { name: "Lunge Jumps", sets: "3", reps: "8/leg", rest: "30s", notes: "Alternate legs" },
        { name: "Mountain Climbers", sets: "3", reps: "20", rest: "30s", notes: "Fast pace" },
        { name: "Burpees", sets: "3", reps: "8", rest: "90s", notes: "Full range" }
      ],
      tips: [
        "Start with control",
        "Build explosive power",
        "Land softly",
        "Progress gradually"
      ]
    },
    "wch003": {
      name: "HFSC Beast Mode",
      serialNumber: "WCH003",
      difficulty: "Advanced",
      duration: "60 min",
      equipment: "Equipment Required",
      imageUrl: hfscBeastModeImg,
      description: "Barbell and dumbbell challenge workout pushing strength and endurance limits.",
      workoutType: "FOR TIME",
      format: `For Time
Complete all movements ASAP`,
      instructions: "Complete all movements as fast as possible.",
      exercises: [
        { name: "Barbell Back Squat", sets: "1", reps: "50", rest: "0", notes: "Heavy load" },
        { name: "Dumbbell Bench Press", sets: "1", reps: "40", rest: "0", notes: "Control descent" },
        { name: "Barbell Deadlift", sets: "1", reps: "30", rest: "0", notes: "Maintain form" },
        { name: "Dumbbell Thruster", sets: "1", reps: "20", rest: "0", notes: "Squat to press" },
        { name: "Burpees", sets: "1", reps: "10", rest: "0", notes: "Full range" }
      ],
      tips: [
        "Pace yourself strategically",
        "Break up reps as needed",
        "Maintain form throughout",
        "Mental toughness is key"
      ]
    },
    "wch004": {
      name: "Spartan Endurance Test",
      serialNumber: "WCH004",
      difficulty: "Advanced",
      duration: "60 min",
      equipment: "Equipment Required",
      imageUrl: spartanEnduranceTestImg,
      description: "Kettlebell and rower endurance challenge for mental and physical toughness.",
      workoutType: "FOR TIME",
      format: `For Time
Complete all stations`,
      instructions: "Complete all stations as fast as possible.",
      exercises: [
        { name: "Row", sets: "1", reps: "2000m", rest: "0", notes: "Steady pace" },
        { name: "Kettlebell Swing", sets: "1", reps: "100", rest: "0", notes: "Hip drive" },
        { name: "Row", sets: "1", reps: "1500m", rest: "0", notes: "Push pace" },
        { name: "Kettlebell Goblet Squat", sets: "1", reps: "75", rest: "0", notes: "Full depth" },
        { name: "Row", sets: "1", reps: "1000m", rest: "0", notes: "Max effort" }
      ],
      tips: [
        "Pace the rows wisely",
        "Break kettlebell work early",
        "Stay mentally strong",
        "Track your time"
      ]
    },
    "wch005": {
      name: "Full Body Benchmark",
      serialNumber: "WCH005",
      difficulty: "Intermediate",
      duration: "45 min",
      equipment: "Equipment Required",
      imageUrl: fullBodyBenchmarkImg,
      description: "Dumbbells and pull-up bar benchmark workout testing overall fitness.",
      workoutType: "FOR TIME",
      format: `For Time - 21-15-9 reps`,
      instructions: "Complete 21-15-9 reps of each movement.",
      exercises: [
        { name: "Dumbbell Thruster", sets: "1", reps: "21-15-9", rest: "0", notes: "Squat to press" },
        { name: "Pull-Ups", sets: "1", reps: "21-15-9", rest: "0", notes: "Full extension" },
        { name: "Dumbbell Burpee", sets: "1", reps: "21-15-9", rest: "0", notes: "Touch dumbbells" }
      ],
      tips: [
        "Pace the thrusters",
        "Break pull-ups strategically",
        "Push through the burpees",
        "Track your time"
      ]
    },
    "wch006": {
      name: "The Burnout Challenge",
      serialNumber: "WCH006",
      difficulty: "Intermediate",
      duration: "30 min",
      equipment: "No Equipment Required",
      imageUrl: burnoutChallengeImg,
      description: "Bodyweight challenge designed to test muscular endurance and mental fortitude.",
      workoutType: "AMRAP",
      format: `AMRAP - 25 minutes`,
      instructions: "Complete as many rounds as possible in 25 minutes.",
      exercises: [
        { name: "Burpees", sets: "AMRAP", reps: "10", rest: "0", notes: "Full range" },
        { name: "Push-Ups", sets: "AMRAP", reps: "20", rest: "0", notes: "Chest to ground" },
        { name: "Air Squats", sets: "AMRAP", reps: "30", rest: "0", notes: "Full depth" },
        { name: "Sit-Ups", sets: "AMRAP", reps: "40", rest: "0", notes: "Full range" }
      ],
      tips: [
        "Start conservative",
        "Maintain steady pace",
        "Break strategically",
        "Track your rounds"
      ]
    },
    "wch007": {
      name: "Warrior Flow",
      serialNumber: "WCH007",
      difficulty: "Beginner",
      duration: "30 min",
      equipment: "No Equipment Required",
      imageUrl: warriorFlowImg,
      description: "Bodyweight warrior-style flow challenge combining strength and mobility.",
      workoutType: "CIRCUIT",
      format: `Circuit - 3 rounds
Focus on flow`,
      instructions: "3 rounds, focus on movement flow and control.",
      exercises: [
        { name: "Warrior Push-Ups", sets: "3", reps: "10", rest: "30s", notes: "Control descent" },
        { name: "Jump Squats", sets: "3", reps: "12", rest: "30s", notes: "Soft landing" },
        { name: "Plank to Downward Dog", sets: "3", reps: "10", rest: "30s", notes: "Flow movement" },
        { name: "Lunge with Twist", sets: "3", reps: "10/side", rest: "30s", notes: "Open chest" },
        { name: "Burpees", sets: "3", reps: "8", rest: "90s", notes: "Full range" }
      ],
      tips: [
        "Focus on movement quality",
        "Control breathing",
        "Move with intention",
        "Build warrior mindset"
      ]
    },
    "ws008": {
      name: "Iron Core Builder",
      serialNumber: "WS008",
      difficulty: "Intermediate",
      duration: "45 min",
      equipment: "Dumbbells, Barbell, Resistance Band",
      imageUrl: ironCoreBuilderImg,
      description: "A balanced session focusing on compound lifts to enhance total-body strength and stability. Ideal for intermediate lifters aiming to develop control and muscle density.",
      workoutType: "REPS & SETS",
      format: `4 sets per exercise
Rest 60-90s between sets`,
      instructions: "Perform all exercises in listed order. Rest 60–90 seconds between sets. Maintain correct tempo and form under load.",
      exercises: [
        { name: "Barbell Back Squat", sets: "4", reps: "8 @ 70% 1RM", rest: "90s", notes: "Keep core tight" },
        { name: "Dumbbell Bench Press", sets: "4", reps: "10 @ 65% 1RM", rest: "90s", notes: "Controlled tempo" },
        { name: "Bent-Over Barbell Row", sets: "4", reps: "8 @ 70% 1RM", rest: "90s", notes: "Pull to sternum" },
        { name: "Resistance Band Pull-Apart", sets: "3", reps: "15", rest: "60s", notes: "Squeeze shoulder blades" },
        { name: "Plank Hold", sets: "3", reps: "45 sec", rest: "90s", notes: "Maintain neutral spine" }
      ],
      tips: [
        "Keep your core tight",
        "Avoid over-arching the back",
        "Progress weight weekly",
        "Focus on compound movements"
      ]
    },
    "ws009": {
      name: "Bodyweight Power Frame",
      serialNumber: "WS009",
      difficulty: "Beginner",
      duration: "30 min",
      equipment: "Bodyweight only",
      imageUrl: bodyweightPowerFrameImg,
      description: "Develop raw body control and full-body tension through basic but powerful bodyweight strength moves.",
      workoutType: "CIRCUIT",
      format: `4 Rounds
Rest 1 min between rounds`,
      instructions: "Complete all exercises in sequence, rest 1 minute, repeat for 4 rounds.",
      exercises: [
        { name: "Push-Ups", sets: "4", reps: "15", rest: "0", notes: "Slow tempo" },
        { name: "Bodyweight Squats", sets: "4", reps: "20", rest: "0", notes: "Full depth" },
        { name: "Inverted Rows", sets: "4", reps: "12", rest: "0", notes: "Under bar" },
        { name: "Side Plank", sets: "4", reps: "30s/side", rest: "0", notes: "Hold steady" },
        { name: "Glute Bridge Hold", sets: "4", reps: "45s", rest: "60s", notes: "Squeeze glutes" }
      ],
      tips: [
        "Focus on slow tempo",
        "Perfect movement execution",
        "Control every rep",
        "Build strong foundation"
      ]
    },
    "wc010": {
      name: "Burnstorm",
      serialNumber: "WC010",
      difficulty: "Advanced",
      duration: "45 min",
      equipment: "Kettlebell, Jump Rope",
      imageUrl: burnstormImg,
      description: "A high-energy session blending power moves and cardio bursts to maximize calorie expenditure.",
      workoutType: "AMRAP",
      format: `AMRAP - 20 minutes
Rest 30s after each round`,
      instructions: "Complete as many rounds as possible in 20 minutes.",
      exercises: [
        { name: "Kettlebell Swing", sets: "AMRAP", reps: "15", rest: "0", notes: "Hip drive" },
        { name: "Jump Rope", sets: "AMRAP", reps: "60 sec", rest: "0", notes: "Steady pace" },
        { name: "Kettlebell Clean to Press", sets: "AMRAP", reps: "10", rest: "0", notes: "Explosive movement" },
        { name: "Mountain Climbers", sets: "AMRAP", reps: "40 sec", rest: "0", notes: "Fast pace" },
        { name: "Burpees", sets: "AMRAP", reps: "10", rest: "30s", notes: "Full range" }
      ],
      tips: [
        "Push intensity",
        "Maintain breathing control",
        "Keep steady rhythm",
        "Track your rounds"
      ]
    },
    "wc011": {
      name: "Cardio Sculpt",
      serialNumber: "WC011",
      difficulty: "Beginner",
      duration: "30 min",
      equipment: "Bodyweight only",
      imageUrl: cardioSculptImg,
      description: "A quick and dynamic fat-burning session using simple full-body movements.",
      workoutType: "TABATA",
      format: `Tabata - 20s work / 10s rest x 8 rounds
Rest 1 min between blocks`,
      instructions: "Alternate between two exercises per block.",
      exercises: [
        { name: "Jumping Jacks / Bodyweight Squats", sets: "8", reps: "20s work/10s rest", rest: "60s", notes: "Block 1" },
        { name: "High Knees / Push-Ups", sets: "8", reps: "20s work/10s rest", rest: "60s", notes: "Block 2" },
        { name: "Mountain Climbers / Lunges", sets: "8", reps: "20s work/10s rest", rest: "60s", notes: "Block 3" },
        { name: "Plank Shoulder Tap / Sit-Ups", sets: "8", reps: "20s work/10s rest", rest: "60s", notes: "Block 4" }
      ],
      tips: [
        "Stay light on your feet",
        "Keep consistent tempo",
        "Focus on form",
        "Breathe rhythmically"
      ]
    },
    "wm010": {
      name: "HIIT Inferno",
      serialNumber: "WM010",
      difficulty: "Advanced",
      duration: "45 min",
      equipment: "Dumbbells, Battle Rope",
      imageUrl: hiitInfernoImg,
      description: "A brutal metabolic conditioning workout designed to skyrocket endurance and afterburn.",
      workoutType: "EMOM",
      format: `EMOM - 5 rounds
Perform listed reps each minute`,
      instructions: "Perform listed reps each minute, rest in remaining time. 5 rounds total.",
      exercises: [
        { name: "Dumbbell Thrusters", sets: "5", reps: "10", rest: "remainder of minute", notes: "Squat to press" },
        { name: "Battle Rope Slams", sets: "5", reps: "15", rest: "remainder of minute", notes: "Full extension" },
        { name: "Jump Squats", sets: "5", reps: "10", rest: "remainder of minute", notes: "Explosive" },
        { name: "Renegade Rows", sets: "5", reps: "10", rest: "remainder of minute", notes: "Alternate arms" }
      ],
      tips: [
        "Pace yourself early",
        "Keep breathing steady",
        "Use active recovery",
        "Maximize effort"
      ]
    },
    "wm011": {
      name: "Sweat Circuit Pro",
      serialNumber: "WM011",
      difficulty: "Beginner",
      duration: "30 min",
      equipment: "Bodyweight only",
      imageUrl: sweatCircuitProImg,
      description: "Simple, effective circuit to elevate metabolism and improve endurance.",
      workoutType: "CIRCUIT",
      format: `3 rounds
40 sec work / 20 sec rest per exercise`,
      instructions: "3 rounds of 40 sec work / 20 sec rest per exercise.",
      exercises: [
        { name: "Jump Squats", sets: "3", reps: "40s", rest: "20s", notes: "Land softly" },
        { name: "Push-Ups", sets: "3", reps: "40s", rest: "20s", notes: "Full range" },
        { name: "Skater Hops", sets: "3", reps: "40s", rest: "20s", notes: "Side to side" },
        { name: "Mountain Climbers", sets: "3", reps: "40s", rest: "20s", notes: "Fast pace" },
        { name: "Crunches", sets: "3", reps: "40s", rest: "90s", notes: "Controlled" }
      ],
      tips: [
        "Keep steady rhythm",
        "Aim for consistent reps",
        "Control breathing",
        "Track your progress"
      ]
    },
    "wca012": {
      name: "Enduro Flow",
      serialNumber: "WCA012",
      difficulty: "Intermediate",
      duration: "45 min",
      equipment: "Rowing Machine, Dumbbells",
      imageUrl: enduroFlowImg,
      description: "A total-body cardio endurance workout combining strength intervals and aerobic conditioning.",
      workoutType: "FOR TIME",
      format: `For Time
Rest 2 min between sections`,
      instructions: "Complete listed exercises as fast as possible, maintain form.",
      exercises: [
        { name: "Row", sets: "1", reps: "1000m", rest: "0", notes: "Steady pace" },
        { name: "Dumbbell Snatches", sets: "1", reps: "20", rest: "120s", notes: "Alternating arms" },
        { name: "Row", sets: "1", reps: "800m", rest: "0", notes: "Push pace" },
        { name: "Dumbbell Squat to Press", sets: "1", reps: "20", rest: "120s", notes: "Full range" },
        { name: "Row", sets: "1", reps: "400m", rest: "0", notes: "Max effort" }
      ],
      tips: [
        "Steady pace > all-out sprint",
        "Control breathing",
        "Maintain form under fatigue",
        "Track your time"
      ]
    },
    "wca013": {
      name: "Cardio Sprint Ladder",
      serialNumber: "WCA013",
      difficulty: "Beginner",
      duration: "30 min",
      equipment: "Bodyweight only",
      imageUrl: cardioSprintLadderImg,
      description: "A fun ladder-style session improving aerobic endurance and leg power.",
      workoutType: "CIRCUIT",
      format: `Ladder - 5 rounds
Reps: 10 → 20 → 30 → 20 → 10`,
      instructions: "5 rounds: reps go 10 → 20 → 30 → 20 → 10.",
      exercises: [
        { name: "Jumping Jacks", sets: "5", reps: "10-20-30-20-10", rest: "30s", notes: "Follow ladder" },
        { name: "Squat Jumps", sets: "5", reps: "10-20-30-20-10", rest: "30s", notes: "Land softly" },
        { name: "High Knees", sets: "5", reps: "10-20-30-20-10s", rest: "30s", notes: "Seconds = reps" }
      ],
      tips: [
        "Land softly",
        "Keep breathing steady",
        "Maintain rhythm",
        "Track your rounds"
      ]
    },
    "wmob012": {
      name: "Core Flow Restore",
      serialNumber: "WMOB012",
      difficulty: "Intermediate",
      duration: "45 min",
      equipment: "Yoga Mat, Mini Band",
      imageUrl: coreFlowRestoreImg,
      description: "Core stability and dynamic flexibility session designed for recovery and control.",
      workoutType: "CIRCUIT",
      format: `Flow Circuit
Perform slowly with controlled breathing`,
      instructions: "Perform slowly with controlled breathing.",
      exercises: [
        { name: "Cat-Cow Flow", sets: "1", reps: "60 sec", rest: "30s", notes: "Smooth transitions" },
        { name: "Mini Band Glute Activation", sets: "1", reps: "12", rest: "30s", notes: "Squeeze at top" },
        { name: "Bird-Dog", sets: "1", reps: "10/side", rest: "30s", notes: "Hold 2s each" },
        { name: "Side Plank Reach", sets: "1", reps: "30s/side", rest: "30s", notes: "Control rotation" },
        { name: "Hip Flexor Stretch", sets: "1", reps: "60 sec", rest: "30s", notes: "Deep stretch" }
      ],
      tips: [
        "Focus on movement quality",
        "Control breathing",
        "Move through full range",
        "No speed - focus control"
      ]
    },
    "wmob013": {
      name: "Mobility Reset Pro",
      serialNumber: "WMOB013",
      difficulty: "Beginner",
      duration: "30 min",
      equipment: "Bodyweight only",
      imageUrl: mobilityResetProImg,
      description: "A restorative routine to unlock stiff joints and realign posture.",
      workoutType: "CIRCUIT",
      format: `2 rounds
Slow tempo`,
      instructions: "Perform 2 rounds of all movements, slow tempo.",
      exercises: [
        { name: "World's Greatest Stretch", sets: "2", reps: "5/side", rest: "30s", notes: "Full ROM" },
        { name: "Deep Squat Hold", sets: "2", reps: "45 sec", rest: "30s", notes: "Open hips" },
        { name: "Arm Circles", sets: "2", reps: "15", rest: "30s", notes: "Large circles" },
        { name: "T-Spine Rotation", sets: "2", reps: "8/side", rest: "30s", notes: "Follow hand" },
        { name: "Glute Bridge", sets: "2", reps: "10", rest: "60s", notes: "Squeeze at top" }
      ],
      tips: [
        "Move through full range of motion",
        "Never force stretches",
        "Breathe deeply",
        "Focus on problem areas"
      ]
    },
    "wp008": {
      name: "Explosive Engine Pro",
      serialNumber: "WP008",
      difficulty: "Advanced",
      duration: "45 min",
      equipment: "Kettlebell, Medicine Ball",
      imageUrl: explosiveEngineProImg,
      description: "Build fast-twitch muscle power and athletic performance.",
      workoutType: "REPS & SETS",
      format: `4 sets per exercise
Rest 90s between sets`,
      instructions: "Controlled explosive effort on every rep.",
      exercises: [
        { name: "Kettlebell Swing", sets: "4", reps: "10", rest: "90s", notes: "Hip drive" },
        { name: "Medicine Ball Slam", sets: "4", reps: "12", rest: "90s", notes: "Full extension" },
        { name: "Jump Lunges", sets: "3", reps: "12", rest: "90s", notes: "Explosive switch" },
        { name: "Plyo Push-Ups", sets: "3", reps: "10", rest: "90s", notes: "Leave ground" },
        { name: "Broad Jump", sets: "3", reps: "6", rest: "90s", notes: "Land softly" }
      ],
      tips: [
        "Focus on speed, not fatigue",
        "Explosive on concentric",
        "Control the landing",
        "Quality over quantity"
      ]
    },
    "wp009": {
      name: "Body Blast Power",
      serialNumber: "WP009",
      difficulty: "Intermediate",
      duration: "30 min",
      equipment: "Bodyweight only",
      imageUrl: bodyBlastPowerImg,
      description: "Fast, reactive movements to improve coordination and speed.",
      workoutType: "TABATA",
      format: `Tabata - 20s work / 10s rest
Rest 1 min between rounds`,
      instructions: "20 sec work / 10 sec rest per move.",
      exercises: [
        { name: "Jump Squats", sets: "8", reps: "20s work/10s rest", rest: "60s", notes: "Explode up" },
        { name: "Push-Up to Jump", sets: "8", reps: "20s work/10s rest", rest: "60s", notes: "Explosive push" },
        { name: "Skater Bounds", sets: "8", reps: "20s work/10s rest", rest: "60s", notes: "Side to side" },
        { name: "Burpees", sets: "8", reps: "20s work/10s rest", rest: "60s", notes: "Full range" }
      ],
      tips: [
        "Explode fast",
        "Land soft",
        "Maintain form",
        "Track your reps"
      ]
    },
    "wch008": {
      name: "100 Rep Gauntlet",
      serialNumber: "WCH008",
      difficulty: "Advanced",
      duration: "45 min",
      equipment: "Dumbbells",
      imageUrl: repGauntletImg,
      description: "Complete 100 total reps of each movement — no quitting allowed.",
      workoutType: "FOR TIME",
      format: `For Time
100 reps each exercise`,
      instructions: "Finish all reps before moving on to next exercise.",
      exercises: [
        { name: "Dumbbell Front Squats", sets: "1", reps: "100", rest: "as needed", notes: "Break smartly" },
        { name: "Push-Ups", sets: "1", reps: "100", rest: "as needed", notes: "Chest to ground" },
        { name: "Dumbbell Rows", sets: "1", reps: "100", rest: "as needed", notes: "Each arm" },
        { name: "Jump Lunges", sets: "1", reps: "100", rest: "as needed", notes: "Alternating" },
        { name: "Sit-Ups", sets: "1", reps: "100", rest: "as needed", notes: "Full ROM" }
      ],
      tips: [
        "Break sets smartly to maintain form",
        "Track your splits",
        "Stay mentally strong",
        "Pace yourself"
      ]
    },
    "wch009": {
      name: "Bodyweight Madness",
      serialNumber: "WCH009",
      difficulty: "Intermediate",
      duration: "30 min",
      equipment: "Bodyweight only",
      imageUrl: bodyweightMadnessImg,
      description: "A fast-paced total-body challenge to test endurance and focus.",
      workoutType: "AMRAP",
      format: `AMRAP - 20 minutes
Rest 30s between rounds`,
      instructions: "Complete as many rounds as possible in 20 minutes.",
      exercises: [
        { name: "Push-Ups", sets: "AMRAP", reps: "10", rest: "0", notes: "Full range" },
        { name: "Air Squats", sets: "AMRAP", reps: "15", rest: "0", notes: "Full depth" },
        { name: "Mountain Climbers", sets: "AMRAP", reps: "20", rest: "0", notes: "Fast pace" },
        { name: "Jump Lunges", sets: "AMRAP", reps: "10", rest: "0", notes: "Explosive" },
        { name: "Plank", sets: "AMRAP", reps: "30s", rest: "30s", notes: "Hold steady" }
      ],
      tips: [
        "Keep steady rhythm",
        "Don't burn out early",
        "Maintain form",
        "Track your rounds"
      ]
    }
  };

  let workout: any = null;
  let isPremium = false;
  let canPurchase = false;
  let hasAccess = true;
  let alreadyPurchased = false;
  
  if (dbWorkout) {
    isPremium = dbWorkout.is_premium && !isFreeWorkout;
    canPurchase = dbWorkout.is_standalone_purchase && !!dbWorkout.price;
    alreadyPurchased = hasPurchased(dbWorkout.id, "workout");
    hasAccess = userTier === "premium" || alreadyPurchased || !isPremium;

    // Convert database format to expected format
    workout = {
      name: dbWorkout.name,
      serialNumber: id || '',
      difficulty: dbWorkout.difficulty || 'Intermediate',
      duration: dbWorkout.duration || '30 min',
      equipment: dbWorkout.equipment || 'No Equipment',
      imageUrl: dbWorkout.image_url || '',
      description: dbWorkout.description || '',
      workoutType: dbWorkout.type,
      format: dbWorkout.notes?.split('\n\n')[0] || '',
      instructions: dbWorkout.notes?.split('\n\n')[1] || '',
      exercises: dbWorkout.main_workout?.split('\n\n').map((ex: string) => {
        const lines = ex.split('\n');
        return {
          name: lines[0] || '',
          sets: lines[1]?.split('|')[0]?.replace('Sets:', '').trim() || '',
          reps: lines[1]?.split('|')[1]?.replace('Reps:', '').trim() || '',
          rest: lines[1]?.split('|')[2]?.replace('Rest:', '').trim() || '',
          notes: lines[2]?.replace('Notes:', '').trim() || ''
        };
      }) || [],
      tips: dbWorkout.notes?.split('\n\n').slice(2) || []
    };
  } else {
    // Fall back to hardcoded data
    workout = workoutData[id || ""];
  }

  if (isLoadingDb) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">Loading workout...</div>
      </div>
    );
  }

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
        <title>{workout.name} {workout.workoutType ? `- ${workout.workoutType}` : ''} | {getFocusLabel(type)} Workout Cyprus | {workout.difficulty} {workout.equipment === 'bodyweight' ? 'Bodyweight' : 'Equipment'} Training | Haris Falas | smartygym.com</title>
        <meta name="description" content={`${workout.name} - ${workout.workoutType || 'Circuit'} ${getFocusLabel(type)} workout. ${workout.description} ${workout.duration} ${workout.equipment === 'bodyweight' ? 'bodyweight only, no equipment' : 'equipment-based'} ${workout.difficulty} training. ${workout.format} format by Sports Scientist Haris Falas at Smarty Gym Cyprus (smartygym.com).`} />
        <meta name="keywords" content={`${workout.name}, ${workout.workoutType || 'circuit'} workout, ${getFocusLabel(type)}, ${workout.equipment} training, ${workout.difficulty} workout, ${workout.format} training, AMRAP workout Cyprus, TABATA training Cyprus, HIIT Cyprus, for time workout, circuit training, ${workout.equipment === 'bodyweight' ? 'bodyweight training, calisthenics Cyprus, no equipment workout, home workout Cyprus' : 'gym workout Cyprus, weight training, equipment training, dumbbell workout, kettlebell training'}, functional fitness Cyprus, strength training Cyprus, cardio workout Cyprus, metabolic conditioning Cyprus, fat loss workout Cyprus, muscle building Cyprus, explosive training Cyprus, power training Cyprus, challenge workout, endurance training Cyprus, conditioning workout Cyprus, online workout Cyprus, fitness training Cyprus, Haris Falas Cyprus, Sports Scientist Cyprus, Smarty Gym, smartygym.com, online fitness Cyprus, personal trainer Cyprus, strength and conditioning Cyprus, workout program Cyprus`} />
        
        <meta property="og:title" content={`${workout.name} - ${workout.workoutType || 'Workout'} by Haris Falas`} />
        <meta property="og:description" content={`${workout.description} ${workout.duration} ${getFocusLabel(type)} workout at Smarty Gym Cyprus`} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://smartygym.com/workout/${type}/${id}`} />
        <meta property="og:image" content={workout.imageUrl} />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${workout.name} - ${workout.workoutType || 'Workout'} | Smarty Gym Cyprus`} />
        <meta name="twitter:description" content={`${workout.description} by Haris Falas at smartygym.com`} />
        <meta name="twitter:image" content={workout.imageUrl} />
        
        <link rel="canonical" href={`https://smartygym.com/workout/${type}/${id}`} />
        
        {/* Structured Data - Exercise/Workout */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ExercisePlan",
            "name": `${workout.name} - ${workout.workoutType || 'Workout'}`,
            "description": workout.description,
            "image": workout.imageUrl,
            "activityDuration": workout.duration,
            "exerciseType": `${workout.workoutType || 'Circuit'} - ${getFocusLabel(type)}`,
            "audience": {
              "@type": "Audience",
              "audienceType": workout.difficulty
            },
            "author": {
              "@type": "Person",
              "name": "Haris Falas",
              "jobTitle": "Sports Scientist & Strength and Conditioning Coach",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "CY"
              }
            },
            "provider": {
              "@type": "Organization",
              "name": "Smarty Gym",
              "url": "https://smartygym.com",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "CY"
              }
            },
            "keywords": `${workout.workoutType}, ${getFocusLabel(type)}, ${workout.equipment}, ${workout.format}, AMRAP, TABATA, HIIT, Cyprus fitness, strength training Cyprus, cardio conditioning, metabolic training, online fitness Cyprus, Haris Falas Sports Scientist, functional fitness, explosive power training, endurance conditioning`
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/workout/${type}`)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span className="text-xs sm:text-sm">Back</span>
        </Button>
        <CommentDialog
          workoutId={id}
          workoutName={workout.name}
          workoutType={type}
        />
      </div>

      {/* Show purchase button if available for standalone purchases */}
      {canPurchase && !hasAccess && dbWorkout && (
        <div className="mb-6">
          <Card className="border-primary/50 bg-gradient-to-r from-primary/5 to-primary/10">
            <div className="p-6 text-center space-y-4">
              <h3 className="text-xl font-semibold">
                {alreadyPurchased ? "You Own This Workout" : "Get Instant Access"}
              </h3>
              <p className="text-muted-foreground">
                {alreadyPurchased 
                  ? "This workout is in your library" 
                  : "Purchase this workout once and own it forever"}
              </p>
              <div className="text-3xl font-bold text-primary">
                €{Number(dbWorkout.price).toFixed(2)}
              </div>
              {!alreadyPurchased && (
                <PurchaseButton
                  contentId={dbWorkout.id}
                  contentType="workout"
                  contentName={dbWorkout.name}
                  price={Number(dbWorkout.price) || 0}
                  stripeProductId={dbWorkout.stripe_product_id}
                  stripePriceId={dbWorkout.stripe_price_id}
                />
              )}
            </div>
          </Card>
        </div>
      )}

      <AccessGate requireAuth={true} requirePremium={isPremium && !hasAccess} contentType="workout">
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
              workoutId={id}
              workoutCategory={type || ''}
              isFreeContent={isFreeWorkout}
            />
          </AccessGate>
        </div>
      </div>
    </>
  );
};

export default IndividualWorkout;