import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
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
import ultimateChallengeImg from "@/assets/ultimate-challenge-workout.jpg";
import powerPrimerImg from "@/assets/power-primer-workout.jpg";
import explosiveStartImg from "@/assets/explosive-start-workout.jpg";
import bodyBlastImg from "@/assets/body-blast-workout.jpg";
import powerCircuitProImg from "@/assets/power-circuit-pro-workout.jpg";
import explosiveEngineImg from "@/assets/explosive-engine-workout.jpg";
import powerSurgeEliteImg from "@/assets/power-surge-elite-workout.jpg";
import starterGauntletImg from "@/assets/starter-gauntlet-workout.jpg";
import challengePrepImg from "@/assets/challenge-prep-workout.jpg";
import bodyweightBlitzImg from "@/assets/bodyweight-blitz-workout.jpg";
import challengeCircuitProImg from "@/assets/challenge-circuit-pro-workout.jpg";
import finalFormImg from "@/assets/final-form-workout.jpg";
import eliteGauntletImg from "@/assets/elite-gauntlet-workout.jpg";
import metaboLiteImg from "@/assets/metabo-lite-workout.jpg";
import metaboStartImg from "@/assets/metabo-start-workout.jpg";
import metaboFlowImg from "@/assets/metabo-flow-workout.jpg";
import metaboChargeImg from "@/assets/metabo-charge-workout.jpg";
import metaboInfernoImg from "@/assets/metabo-inferno-workout.jpg";
import metaboSurgeImg from "@/assets/metabo-surge-workout.jpg";

type EquipmentFilter = "all" | "bodyweight" | "equipment";
type LevelFilter = "all" | "beginner" | "intermediate" | "advanced";
type FormatFilter = "all" | "circuit" | "amrap" | "for time" | "tabata" | "reps & sets" | "mix";

interface Workout {
  id: string;
  name: string;
  description: string;
  duration: string;
  equipment: "bodyweight" | "equipment";
  level: "beginner" | "intermediate" | "advanced";
  format: "circuit" | "amrap" | "for time" | "tabata" | "reps & sets" | "mix";
  imageUrl: string;
  isFree?: boolean;
}

const WorkoutDetail = () => {
  const navigate = useNavigate();
  const { type } = useParams();
  const [equipmentFilter, setEquipmentFilter] = useState<EquipmentFilter>("all");
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("all");
  const [formatFilter, setFormatFilter] = useState<FormatFilter>("all");

  const workoutTitles: { [key: string]: string } = {
    "strength": "Strength Workout",
    "calorie-burning": "Calorie Burning Workout",
    "metabolic": "Metabolic Workout",
    "cardio": "Cardio Workout",
    "mobility": "Mobility & Stability Workout",
    "power": "Power Workout",
    "challenge": "Challenge Workout"
  };

  const workoutData: { [key: string]: Workout[] } = {
    "strength": [],
    "calorie-burning": [],
    "metabolic": [],
    "cardio": [],
    "mobility": [],
    "power": [],
    "challenge": [
      { id: "challenge-002", name: "Starter Gauntlet", description: "A simple but motivating challenge workout using bodyweight movements in a round-based format", duration: "30 min", equipment: "bodyweight", level: "beginner", format: "for time", imageUrl: starterGauntletImg, isFree: true },
      { id: "challenge-003", name: "Challenge Prep", description: "A light challenge-style circuit using dumbbells and bands to build strength and stamina in a timed format", duration: "30 min", equipment: "equipment", level: "beginner", format: "circuit", imageUrl: challengePrepImg, isFree: true },
      { id: "challenge-004", name: "Bodyweight Blitz", description: "A fast-paced bodyweight challenge designed to push endurance and mental grit", duration: "45 min", equipment: "bodyweight", level: "intermediate", format: "amrap", imageUrl: bodyweightBlitzImg, isFree: true },
      { id: "challenge-005", name: "Challenge Circuit Pro", description: "A high-intensity challenge using dumbbells, kettlebells, and jump rope to push strength and cardio limits", duration: "45 min", equipment: "equipment", level: "intermediate", format: "circuit", imageUrl: challengeCircuitProImg, isFree: true },
      { id: "challenge-006", name: "Final Form", description: "A brutal bodyweight challenge designed to test endurance, strength, and mental toughness", duration: "60 min", equipment: "bodyweight", level: "advanced", format: "for time", imageUrl: finalFormImg, isFree: true },
      { id: "challenge-007", name: "Elite Gauntlet", description: "An elite challenge using medicine balls, wall balls, and bands in a Tabata format", duration: "60 min", equipment: "equipment", level: "advanced", format: "tabata", imageUrl: eliteGauntletImg, isFree: true },
    ],
  };

  const title = workoutTitles[type || ""] || "Workout";
  const workouts = workoutData[type || "strength"] || [];
  
  const filteredWorkouts = workouts.filter(
    workout => 
      (equipmentFilter === "all" || workout.equipment === equipmentFilter) &&
      (levelFilter === "all" || workout.level === levelFilter) &&
      (formatFilter === "all" || workout.format === formatFilter)
  );

  return (
    <>
      <Helmet>
        <title>{title} | Smarty Gym</title>
        <meta name="description" content={`Browse ${title.toLowerCase()} workouts - bodyweight and equipment-based options`} />
      </Helmet>
      
      <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/workout")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span className="text-xs sm:text-sm">Back</span>
        </Button>
        
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8">{title}</h1>
        
        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Equipment Filter */}
          <div>
            <p className="text-sm font-medium mb-2">Equipment Type</p>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={equipmentFilter === "all" ? "default" : "outline"}
                onClick={() => setEquipmentFilter("all")}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={equipmentFilter === "bodyweight" ? "default" : "outline"}
                onClick={() => setEquipmentFilter("bodyweight")}
                size="sm"
              >
                Body Weight
              </Button>
              <Button
                variant={equipmentFilter === "equipment" ? "default" : "outline"}
                onClick={() => setEquipmentFilter("equipment")}
                size="sm"
              >
                Equipment
              </Button>
            </div>
          </div>

          {/* Level Filter */}
          <div>
            <p className="text-sm font-medium mb-2">Experience Level</p>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={levelFilter === "all" ? "default" : "outline"}
                onClick={() => setLevelFilter("all")}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={levelFilter === "beginner" ? "default" : "outline"}
                onClick={() => setLevelFilter("beginner")}
                size="sm"
              >
                Beginner
              </Button>
              <Button
                variant={levelFilter === "intermediate" ? "default" : "outline"}
                onClick={() => setLevelFilter("intermediate")}
                size="sm"
              >
                Intermediate
              </Button>
              <Button
                variant={levelFilter === "advanced" ? "default" : "outline"}
                onClick={() => setLevelFilter("advanced")}
                size="sm"
              >
                Advanced
              </Button>
            </div>
          </div>

          {/* Format Filter */}
          <div>
            <p className="text-sm font-medium mb-2">Workout Format</p>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={formatFilter === "all" ? "default" : "outline"}
                onClick={() => setFormatFilter("all")}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={formatFilter === "circuit" ? "default" : "outline"}
                onClick={() => setFormatFilter("circuit")}
                size="sm"
              >
                Circuit
              </Button>
              <Button
                variant={formatFilter === "amrap" ? "default" : "outline"}
                onClick={() => setFormatFilter("amrap")}
                size="sm"
              >
                AMRAP
              </Button>
              <Button
                variant={formatFilter === "for time" ? "default" : "outline"}
                onClick={() => setFormatFilter("for time")}
                size="sm"
              >
                For Time
              </Button>
              <Button
                variant={formatFilter === "tabata" ? "default" : "outline"}
                onClick={() => setFormatFilter("tabata")}
                size="sm"
              >
                Tabata
              </Button>
              <Button
                variant={formatFilter === "reps & sets" ? "default" : "outline"}
                onClick={() => setFormatFilter("reps & sets")}
                size="sm"
              >
                Reps & Sets
              </Button>
              <Button
                variant={formatFilter === "mix" ? "default" : "outline"}
                onClick={() => setFormatFilter("mix")}
                size="sm"
              >
                Mix
              </Button>
            </div>
          </div>
        </div>

        {/* Workout Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredWorkouts.map((workout) => (
            <Card
              key={workout.id}
              className="overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-gold bg-card border-border relative"
              onClick={() => navigate(`/workout/${type}/${workout.id}`)}
            >
              <div className="relative h-48 w-full overflow-hidden">
                <img 
                  src={workout.imageUrl} 
                  alt={workout.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                  {workout.duration}
                </div>
                {workout.isFree && (
                  <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                    FREE
                  </div>
                )}
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-semibold text-lg">{workout.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{workout.description}</p>
              </div>
            </Card>
          ))}
        </div>

        {filteredWorkouts.length === 0 && (
          <Card className="p-8">
            <p className="text-center text-muted-foreground">
              No workouts found for this combination. Try different filters.
            </p>
          </Card>
        )}
      </div>
      </div>
    </>
  );
};

export default WorkoutDetail;
