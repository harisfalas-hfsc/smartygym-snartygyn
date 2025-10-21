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
import powerSurgeImg from "@/assets/power-surge-workout.jpg";
import ultimateChallengeImg from "@/assets/ultimate-challenge-workout.jpg";
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
    "strength": [
      { id: "strength-001", name: "Power Foundation", description: "Build your strength base with compound movements", duration: "45 min", equipment: "equipment", level: "intermediate", format: "reps & sets", imageUrl: powerFoundationImg, isFree: true },
      { id: "strength-002", name: "Iron Core", description: "Advanced strength targeting major muscle groups with raw power", duration: "60 min", equipment: "equipment", level: "advanced", format: "reps & sets", imageUrl: ironCoreImg, isFree: true },
      { id: "strength-003", name: "Core Builder", description: "Foundational bodyweight strength for major muscle groups", duration: "30 min", equipment: "bodyweight", level: "beginner", format: "reps & sets", imageUrl: coreBuilderImg, isFree: true },
      { id: "strength-004", name: "Starter Strength", description: "Gentle intro to resistance training with light weights", duration: "30 min", equipment: "equipment", level: "beginner", format: "reps & sets", imageUrl: starterStrengthImg, isFree: true },
      { id: "strength-005", name: "Gravity Grind", description: "Bodyweight strength using tempo and holds", duration: "45 min", equipment: "bodyweight", level: "intermediate", format: "reps & sets", imageUrl: gravityGrindImg, isFree: true },
      { id: "strength-006", name: "Iron Circuit", description: "Full-body circuit with dumbbells and kettlebells", duration: "45 min", equipment: "equipment", level: "intermediate", format: "circuit", imageUrl: ironCircuitImg, isFree: true },
      { id: "strength-007", name: "Bodyweight Beast", description: "High-intensity bodyweight with advanced variations", duration: "60 min", equipment: "bodyweight", level: "advanced", format: "circuit", imageUrl: bodyweightBeastImg, isFree: true },
      { id: "strength-008", name: "Iron Engine", description: "Heavy strength workout for serious lifters", duration: "60 min", equipment: "equipment", level: "advanced", format: "reps & sets", imageUrl: ironEngineImg, isFree: true },
    ],
    "calorie-burning": [
      { id: "calorie-001", name: "Metabolic Burn", description: "High-intensity fat-burning session", duration: "30 min", equipment: "bodyweight", level: "beginner", format: "circuit", imageUrl: metabolicBurnImg, isFree: true },
      { id: "calorie-002", name: "Fat Furnace", description: "Metabolic conditioning that torches calories", duration: "45 min", equipment: "equipment", level: "advanced", format: "circuit", imageUrl: fatFurnaceImg, isFree: true },
      { id: "calorie-007", name: "Burn Start", description: "Low-impact cardio circuit to kickstart fat loss", duration: "30 min", equipment: "bodyweight", level: "beginner", format: "circuit", imageUrl: burnStartImg, isFree: true },
      { id: "calorie-008", name: "Sweat Circuit", description: "Light equipment circuit boosting metabolism", duration: "30 min", equipment: "equipment", level: "beginner", format: "circuit", imageUrl: sweatCircuitImg, isFree: true },
      { id: "calorie-009", name: "Body Burnout", description: "Fast-paced bodyweight AMRAP for max calorie burn", duration: "45 min", equipment: "bodyweight", level: "intermediate", format: "amrap", imageUrl: bodyBurnoutImg, isFree: true },
      { id: "calorie-010", name: "Sweat Storm", description: "High-energy circuit with dumbbells and jump rope", duration: "45 min", equipment: "equipment", level: "intermediate", format: "circuit", imageUrl: sweatStormImg, isFree: true },
      { id: "calorie-011", name: "Inferno Flow", description: "Relentless bodyweight plyometric challenge", duration: "60 min", equipment: "bodyweight", level: "advanced", format: "circuit", imageUrl: infernoFlowImg, isFree: true },
      { id: "calorie-012", name: "Calorie Crusher", description: "Full-body calorie incinerator with kettlebells", duration: "60 min", equipment: "equipment", level: "advanced", format: "circuit", imageUrl: calorieCrusherImg, isFree: true },
    ],
    "metabolic": [
      { id: "metabolic-013", name: "Metabo Lite", description: "Beginner-friendly metabolic circuit to build stamina", duration: "30 min", equipment: "bodyweight", level: "beginner", format: "circuit", imageUrl: metaboLiteImg, isFree: true },
      { id: "metabolic-014", name: "Metabo Start", description: "Light metabolic circuit with bands and dumbbells", duration: "30 min", equipment: "equipment", level: "beginner", format: "circuit", imageUrl: metaboStartImg, isFree: true },
      { id: "metabolic-015", name: "Metabo Flow", description: "Dynamic bodyweight workout to spike metabolism", duration: "45 min", equipment: "bodyweight", level: "intermediate", format: "amrap", imageUrl: metaboFlowImg, isFree: true },
      { id: "metabolic-016", name: "Metabo Charge", description: "High-intensity metabolic workout with kettlebells and TRX", duration: "45 min", equipment: "equipment", level: "intermediate", format: "circuit", imageUrl: metaboChargeImg, isFree: true },
      { id: "metabolic-001", name: "Metabolic Ignition", description: "Boost your metabolism with this explosive workout", duration: "35 min", equipment: "equipment", level: "intermediate", format: "circuit", imageUrl: metabolicIgnitionImg, isFree: true },
      { id: "metabolic-002", name: "MetaboShock", description: "Hybrid metabolic blending resistance and cardio", duration: "15 min", equipment: "equipment", level: "intermediate", format: "circuit", imageUrl: metaboShockImg, isFree: true },
      { id: "metabolic-017", name: "Metabo Inferno", description: "Relentless bodyweight metabolic challenge", duration: "60 min", equipment: "bodyweight", level: "advanced", format: "for time", imageUrl: metaboInfernoImg, isFree: true },
      { id: "metabolic-018", name: "Metabo Surge", description: "Full-body metabolic blast for elite conditioning", duration: "60 min", equipment: "equipment", level: "advanced", format: "mix", imageUrl: metaboSurgeImg, isFree: true },
    ],
    "cardio": [
      { id: "cardio-001", name: "Cardio Blast", description: "Elevate your heart rate and build endurance", duration: "40 min", equipment: "bodyweight", level: "beginner", format: "mix", imageUrl: cardioBlastImg, isFree: true },
      { id: "cardio-002", name: "Pulse Igniter", description: "High-energy cardio to elevate heart rate", duration: "30 min", equipment: "bodyweight", level: "intermediate", format: "circuit", imageUrl: pulseIgniterImg, isFree: true },
    ],
    "mobility": [
      { id: "mobility-001", name: "Flow & Mobility", description: "Enhance flexibility and joint health", duration: "30 min", equipment: "bodyweight", level: "beginner", format: "circuit", imageUrl: flowMobilityImg, isFree: true },
      { id: "mobility-002", name: "FlowForge", description: "Low-impact mobility and stability workout", duration: "60 min", equipment: "equipment", level: "beginner", format: "circuit", imageUrl: flowForgeImg, isFree: true },
    ],
    "challenge": [
      { id: "challenge-001", name: "Ultimate Challenge", description: "Push your limits with this intense workout", duration: "50 min", equipment: "equipment", level: "advanced", format: "mix", imageUrl: ultimateChallengeImg, isFree: true },
    ],
    "power": [
      { id: "power-001", name: "Power Surge", description: "Develops explosive strength and fast-twitch activation", duration: "30 min", equipment: "equipment", level: "advanced", format: "circuit", imageUrl: powerSurgeImg, isFree: true },
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
