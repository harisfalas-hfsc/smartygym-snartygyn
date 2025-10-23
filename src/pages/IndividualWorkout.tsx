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

  // Only specific workouts are free
  const freeWorkouts = ['calorie-007']; // Burn Start
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
  } = {};

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