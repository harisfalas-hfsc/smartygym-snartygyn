import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
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
import ultimateChallengeImg from "@/assets/ultimate-challenge-workout.jpg";
import powerPrimerImg from "@/assets/power-primer-workout.jpg";
import explosiveStartImg from "@/assets/explosive-start-workout.jpg";
import bodyBlastImg from "@/assets/body-blast-workout.jpg";
import powerCircuitProImg from "@/assets/power-circuit-pro-workout.jpg";
import explosiveEngineImg from "@/assets/explosive-engine-workout.jpg";
import powerSurgeEliteImg from "@/assets/power-surge-elite-workout.jpg";
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
    "strength": [
      { id: "strength-049", name: "Bodyweight Base", description: "A foundational strength workout using bodyweight exercises with controlled tempo and static holds to build muscular endurance", duration: "30 min", equipment: "bodyweight", level: "beginner", format: "reps & sets", imageUrl: starterStrengthImg, isFree: true },
      { id: "strength-050", name: "Strength Starter", description: "A light resistance circuit using dumbbells and bands to introduce strength training safely and effectively", duration: "30 min", equipment: "equipment", level: "beginner", format: "circuit", imageUrl: powerFoundationImg, isFree: true },
      { id: "strength-051", name: "Gravity Strength", description: "A bodyweight strength workout combining tempo, holds, and dynamic movement to challenge muscular control and endurance", duration: "45 min", equipment: "bodyweight", level: "intermediate", format: "mix", imageUrl: gravityGrindImg, isFree: true },
      { id: "strength-052", name: "Iron Builder", description: "A structured strength workout using dumbbells and kettlebells to build muscle and improve movement control", duration: "45 min", equipment: "equipment", level: "intermediate", format: "reps & sets", imageUrl: ironCoreImg, isFree: true },
      { id: "ws002", name: "Bodyweight Foundation Strength", description: "A full-body strength session using tempo, holds, and unilateral control to simulate resistance training", duration: "45 min", equipment: "bodyweight", level: "intermediate", format: "reps & sets", imageUrl: bodyweightFoundationImg, isFree: false },
      { id: "strength-053", name: "Bodyweight Powerhouse", description: "A high-intensity bodyweight strength workout using advanced variations and isometric holds to build serious muscular endurance", duration: "60 min", equipment: "bodyweight", level: "advanced", format: "amrap", imageUrl: bodyweightBeastImg, isFree: true },
      { id: "strength-054", name: "Iron Mastery", description: "A heavy strength workout using barbells, dumbbells, and weighted holds", duration: "60 min", equipment: "equipment", level: "advanced", format: "for time", imageUrl: ironEngineImg, isFree: true },
      { id: "ws001", name: "Iron Core Strength", description: "This workout focuses on compound lifts to build full-body strength. The mix of bilateral and unilateral movements enhances stability, power output, and joint control", duration: "60 min", equipment: "equipment", level: "advanced", format: "reps & sets", imageUrl: ironCoreStrengthImg, isFree: false },
    ],
    "calorie-burning": [
      { id: "calorie-055", name: "Burn Flow", description: "A low-impact circuit designed to elevate heart rate and burn calories without high-impact stress", duration: "30 min", equipment: "bodyweight", level: "beginner", format: "circuit", imageUrl: burnStartImg, isFree: true },
      { id: "calorie-056", name: "Sweat Band", description: "A beginner-friendly Tabata workout using bands and light dumbbells to blend cardio and resistance for fat burn", duration: "30 min", equipment: "equipment", level: "beginner", format: "tabata", imageUrl: sweatCircuitImg, isFree: true },
      { id: "wc004", name: "Bodyweight Enduro Flow", description: "Continuous-flow cardio bodyweight workout improving endurance and oxygen capacity", duration: "30 min", equipment: "bodyweight", level: "beginner", format: "circuit", imageUrl: bodyweightEnduroFlowImg, isFree: false },
      { id: "wc002", name: "Bodyweight Fat Melt", description: "A HIIT-style circuit emphasizing continuous movement for maximum fat burn", duration: "30 min", equipment: "bodyweight", level: "intermediate", format: "amrap", imageUrl: bodyweightFatMeltImg, isFree: false },
      { id: "calorie-057", name: "Body Burn Pro", description: "A fast-paced bodyweight AMRAP designed to spike heart rate and maximize calorie burn", duration: "45 min", equipment: "bodyweight", level: "intermediate", format: "amrap", imageUrl: bodyBurnoutImg, isFree: true },
      { id: "wc001", name: "Calorie Crusher Circuit", description: "A fast-paced circuit that blends resistance and cardio intervals to maximize calorie expenditure and metabolic demand", duration: "45 min", equipment: "equipment", level: "intermediate", format: "circuit", imageUrl: calorieCrusherCircuitImg, isFree: false },
      { id: "calorie-058", name: "Sweat Surge", description: "A high-intensity interval training session using dumbbells and jump rope to burn calories and improve conditioning", duration: "45 min", equipment: "equipment", level: "intermediate", format: "circuit", imageUrl: sweatStormImg, isFree: true },
      { id: "wc003", name: "Cardio Power Intervals", description: "Cardio conditioning intervals combining endurance with short strength bursts", duration: "45 min", equipment: "equipment", level: "intermediate", format: "for time", imageUrl: cardioPowerIntervalsImg, isFree: false },
      { id: "calorie-059", name: "Inferno Sprint", description: "A high-intensity bodyweight challenge designed to push endurance and burn maximum calories", duration: "60 min", equipment: "bodyweight", level: "advanced", format: "for time", imageUrl: infernoFlowImg, isFree: true },
      { id: "calorie-060", name: "Calorie Forge", description: "A hybrid calorie-burning workout using kettlebells, dumbbells, and wall balls to blend strength and cardio for elite fat burn", duration: "60 min", equipment: "equipment", level: "advanced", format: "mix", imageUrl: calorieCrusherImg, isFree: true },
    ],
    "metabolic": [
      { id: "metabolic-043", name: "Metabo Pulse", description: "A beginner-friendly Tabata workout using bodyweight moves to elevate metabolism and improve aerobic capacity", duration: "30 min", equipment: "bodyweight", level: "beginner", format: "tabata", imageUrl: metaboLiteImg, isFree: true },
      { id: "wm002", name: "Metabolic Body Blast", description: "Short, explosive bodyweight intervals to maximize metabolic impact", duration: "30 min", equipment: "bodyweight", level: "intermediate", format: "tabata", imageUrl: metabolicBodyBlastImg, isFree: false },
      { id: "metabolic-044", name: "Metabo Band Boost", description: "A light metabolic circuit using resistance bands and dumbbells to blend cardio and strength for beginners", duration: "30 min", equipment: "equipment", level: "beginner", format: "circuit", imageUrl: metaboStartImg, isFree: true },
      { id: "metabolic-045", name: "Metabo Sprint", description: "A fast-paced bodyweight AMRAP designed to spike metabolism and build muscular endurance", duration: "45 min", equipment: "bodyweight", level: "intermediate", format: "amrap", imageUrl: metaboFlowImg, isFree: true },
      { id: "wm001", name: "Metabolic Destroyer", description: "Metabolic conditioning workout blending strength and cardio elements for post-workout oxygen consumption (EPOC)", duration: "45 min", equipment: "equipment", level: "advanced", format: "for time", imageUrl: metabolicDestroyerImg, isFree: false },
      { id: "metabolic-046", name: "Metabo Hybrid", description: "A hybrid metabolic workout using kettlebells, TRX, and bodyweight to challenge multiple energy systems", duration: "45 min", equipment: "equipment", level: "intermediate", format: "mix", imageUrl: metaboChargeImg, isFree: true },
      { id: "metabolic-047", name: "Metabo Max", description: "A high-intensity bodyweight workout designed to push metabolic output and endurance", duration: "60 min", equipment: "bodyweight", level: "advanced", format: "for time", imageUrl: metaboInfernoImg, isFree: true },
      { id: "metabolic-048", name: "Metabo Forge", description: "A strength-driven metabolic workout using dumbbells, kettlebells, and wall balls", duration: "60 min", equipment: "equipment", level: "advanced", format: "reps & sets", imageUrl: metaboSurgeImg, isFree: true },
    ],
    "cardio": [
      { id: "cardio-061", name: "Cardio Lift-Off", description: "A gentle cardio circuit designed to elevate heart rate and improve aerobic capacity without high impact", duration: "30 min", equipment: "bodyweight", level: "beginner", format: "circuit", imageUrl: cardioBlastImg, isFree: true },
      { id: "cardio-062", name: "Pulse Builder", description: "A beginner-friendly Tabata workout using jump rope and fit ball to build rhythm, coordination, and endurance", duration: "30 min", equipment: "equipment", level: "beginner", format: "tabata", imageUrl: pulseIgniterImg, isFree: true },
      { id: "cardio-063", name: "Cardio Climb", description: "A bodyweight cardio workout using dynamic movements and short rest to build endurance and burn calories", duration: "45 min", equipment: "bodyweight", level: "intermediate", format: "amrap", imageUrl: cardioBlastImg, isFree: true },
      { id: "cardio-064", name: "Cardio Circuit Pro", description: "A high-energy cardio circuit using jump rope, medicine ball, and wall ball to boost heart rate and stamina", duration: "45 min", equipment: "equipment", level: "intermediate", format: "circuit", imageUrl: cardioBlastImg, isFree: true },
      { id: "cardio-065", name: "Cardio Inferno", description: "A high-intensity bodyweight cardio workout using plyometrics and compound moves for elite endurance and fat burn", duration: "60 min", equipment: "bodyweight", level: "advanced", format: "for time", imageUrl: cardioBlastImg, isFree: true },
      { id: "cardio-066", name: "Cardio Overdrive", description: "A full-body cardio blast using jump rope, wall ball, and bands", duration: "60 min", equipment: "equipment", level: "advanced", format: "mix", imageUrl: cardioBlastImg, isFree: true },
    ],
    "mobility": [
      { id: "mobility-025", name: "Flow Starter", description: "A gentle mobility circuit designed to improve joint range, posture, and control", duration: "30 min", equipment: "bodyweight", level: "beginner", format: "circuit", imageUrl: flowStarterImg, isFree: true },
      { id: "wmob002", name: "Bodyweight Stability Flow", description: "A gentle movement flow focusing on balance, posture, and joint control", duration: "30 min", equipment: "bodyweight", level: "beginner", format: "circuit", imageUrl: bodyweightStabilityFlowImg, isFree: false },
      { id: "mobility-026", name: "Band Balance", description: "A beginner-friendly workout using bands and a fit ball to enhance joint mobility and core stability", duration: "30 min", equipment: "equipment", level: "beginner", format: "reps & sets", imageUrl: bandBalanceImg, isFree: true },
      { id: "mobility-027", name: "Core Flow", description: "A dynamic blend of mobility and core stability using bodyweight flows and static holds", duration: "45 min", equipment: "bodyweight", level: "intermediate", format: "mix", imageUrl: coreFlowImg, isFree: true },
      { id: "wmob001", name: "Mobility Reset", description: "Mobility and stability session focusing on controlled joint movement and core activation", duration: "45 min", equipment: "equipment", level: "intermediate", format: "circuit", imageUrl: mobilityResetImg, isFree: false },
      { id: "mobility-028", name: "Stability Circuit", description: "A full-body stability circuit using fit ball, bands, and mat work to challenge balance", duration: "45 min", equipment: "equipment", level: "intermediate", format: "circuit", imageUrl: stabilityCircuitImg, isFree: true },
      { id: "mobility-029", name: "Mobility Mastery", description: "An advanced mobility and stability workout using high-intensity intervals and deep holds", duration: "60 min", equipment: "bodyweight", level: "advanced", format: "circuit", imageUrl: mobilityMasteryImg, isFree: true },
      { id: "mobility-030", name: "Balance Forge", description: "A precision-based mobility workout using fit ball, bands, and mat work to develop elite control", duration: "60 min", equipment: "equipment", level: "advanced", format: "reps & sets", imageUrl: balanceForgeImg, isFree: true },
    ],
    "power": [
      { id: "power-037", name: "Power Primer", description: "A beginner-friendly circuit focused on basic explosive movements and coordination", duration: "30 min", equipment: "bodyweight", level: "beginner", format: "circuit", imageUrl: powerPrimerImg, isFree: true },
      { id: "wp002", name: "Explosive Body Control", description: "Plyometric training session to develop speed and explosive strength", duration: "30 min", equipment: "bodyweight", level: "intermediate", format: "circuit", imageUrl: explosiveBodyControlImg, isFree: false },
      { id: "power-038", name: "Explosive Start", description: "A light resistance workout using bands and medicine ball to introduce explosive movement patterns safely", duration: "30 min", equipment: "equipment", level: "beginner", format: "reps & sets", imageUrl: explosiveStartImg, isFree: true },
      { id: "power-039", name: "Body Blast", description: "A high-intensity bodyweight workout using plyometrics and dynamic core moves to build explosive power", duration: "45 min", equipment: "bodyweight", level: "intermediate", format: "circuit", imageUrl: bodyBlastImg, isFree: true },
      { id: "wp001", name: "Power Surge", description: "Explosive power session for athletes focused on speed, coordination, and maximal output", duration: "45 min", equipment: "equipment", level: "advanced", format: "reps & sets", imageUrl: powerSurgeAdvancedImg, isFree: false },
      { id: "power-040", name: "Power Circuit Pro", description: "A full-body power circuit using medicine ball, wall ball, and resistance bands", duration: "45 min", equipment: "equipment", level: "intermediate", format: "circuit", imageUrl: powerCircuitProImg, isFree: true },
      { id: "power-041", name: "Explosive Engine", description: "An advanced bodyweight challenge focused on explosive strength, plyometrics, and reactive control", duration: "60 min", equipment: "bodyweight", level: "advanced", format: "for time", imageUrl: explosiveEngineImg, isFree: true },
      { id: "power-042", name: "Power Surge Elite", description: "A hybrid power workout using barbells, medicine balls, and bands to develop explosive strength", duration: "60 min", equipment: "equipment", level: "advanced", format: "mix", imageUrl: powerSurgeEliteImg, isFree: true },
    ],
    "challenge": [
      { id: "challenge-002", name: "Starter Gauntlet", description: "A simple but motivating challenge workout using bodyweight movements in a round-based format", duration: "30 min", equipment: "bodyweight", level: "beginner", format: "for time", imageUrl: starterGauntletImg, isFree: true },
      { id: "challenge-003", name: "Challenge Prep", description: "A light challenge-style circuit using dumbbells and bands to build strength and stamina in a timed format", duration: "30 min", equipment: "equipment", level: "beginner", format: "circuit", imageUrl: challengePrepImg, isFree: true },
      { id: "challenge-004", name: "Bodyweight Blitz", description: "A fast-paced bodyweight challenge designed to push endurance and mental grit", duration: "45 min", equipment: "bodyweight", level: "intermediate", format: "amrap", imageUrl: bodyweightBlitzImg, isFree: true },
      { id: "wch002", name: "HFSC Challenge 2: Bodyweight Inferno", description: "A full-body bodyweight test pushing endurance, coordination, and mindset", duration: "45 min", equipment: "bodyweight", level: "advanced", format: "amrap", imageUrl: hfscBodyweightInfernoImg, isFree: false },
      { id: "challenge-005", name: "Challenge Circuit Pro", description: "A high-intensity challenge using dumbbells, kettlebells, and jump rope to push strength and cardio limits", duration: "45 min", equipment: "equipment", level: "intermediate", format: "circuit", imageUrl: challengeCircuitProImg, isFree: true },
      { id: "challenge-006", name: "Final Form", description: "A brutal bodyweight challenge designed to test endurance, strength, and mental toughness", duration: "60 min", equipment: "bodyweight", level: "advanced", format: "for time", imageUrl: finalFormImg, isFree: true },
      { id: "wch001", name: "HFSC Challenge 1: The Grinder", description: "The HFSC Grinder is a brutal full-body challenge testing strength, endurance, and willpower", duration: "60 min", equipment: "equipment", level: "advanced", format: "for time", imageUrl: hfscGrinderImg, isFree: false },
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
      
      <AccessGate requireAuth={true} requirePremium={false} contentType="feature">
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
      </AccessGate>
    </>
  );
};

export default WorkoutDetail;
