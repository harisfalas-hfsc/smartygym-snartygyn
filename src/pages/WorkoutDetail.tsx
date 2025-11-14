import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Eye, CheckCircle, Search, X, Sparkles, Star, Crown, ShoppingCart, Check } from "lucide-react";
import { AccessGate } from "@/components/AccessGate";
import { CompactFilters } from "@/components/CompactFilters";
import { PageBreadcrumbs } from "@/components/PageBreadcrumbs";
import { ContentLoadingSkeleton } from "@/components/ContentLoadingSkeleton";
import { useAllWorkouts } from "@/hooks/useWorkoutData";
import { useWorkoutInteractions } from "@/hooks/useWorkoutInteractions";
import { supabase } from "@/integrations/supabase/client";
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

type EquipmentFilter = "all" | "bodyweight" | "equipment";
type LevelFilter = "all" | "beginner" | "intermediate" | "advanced";
type FormatFilter = "all" | "circuit" | "amrap" | "for time" | "tabata" | "reps & sets" | "emom" | "mix";
type DurationFilter = "all" | "15" | "20" | "30" | "45" | "60" | "various";
type StatusFilter = "all" | "viewed" | "completed" | "not-viewed" | "favorites";
type SortByFilter = "newest" | "oldest" | "name-asc" | "name-desc";
type AccessFilter = "all" | "free" | "premium" | "purchasable";

export interface Workout {
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
      { id: "ws003", name: "Iron Titan Strength", description: "Heavy compound lifts combined with control tempo for raw strength and improved joint stability", duration: "60 min", equipment: "equipment", level: "advanced", format: "reps & sets", imageUrl: ironTitanStrengthImg, isFree: false },
      { id: "ws004", name: "Functional Compound Strength", description: "Functional strength training combining push, pull, and hinge patterns", duration: "45 min", equipment: "equipment", level: "intermediate", format: "circuit", imageUrl: functionalCompoundStrengthImg, isFree: false },
      { id: "ws005", name: "Strength Density Builder", description: "High-density strength session focusing on maximal tension per time", duration: "60 min", equipment: "equipment", level: "advanced", format: "for time", imageUrl: strengthDensityBuilderImg, isFree: false },
      { id: "ws006", name: "Bodyweight Prime Strength", description: "Develop core strength and stability through unilateral movements", duration: "45 min", equipment: "bodyweight", level: "intermediate", format: "reps & sets", imageUrl: bodyweightPrimeStrengthImg, isFree: false },
      { id: "ws007", name: "Core Stability Strength", description: "A foundational bodyweight session to build core tension and muscle endurance", duration: "30 min", equipment: "bodyweight", level: "beginner", format: "circuit", imageUrl: coreStabilityStrengthImg, isFree: false },
      { id: "ws008", name: "Iron Core Builder", description: "A balanced session focusing on compound lifts to enhance total-body strength and stability", duration: "45 min", equipment: "equipment", level: "intermediate", format: "reps & sets", imageUrl: ironCoreBuilderImg, isFree: false },
      { id: "ws009", name: "Bodyweight Power Frame", description: "Develop raw body control and full-body tension through basic but powerful bodyweight strength moves", duration: "30 min", equipment: "bodyweight", level: "beginner", format: "circuit", imageUrl: bodyweightPowerFrameImg, isFree: false },
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
      { id: "wc005", name: "Calorie Storm Circuit", description: "A mixed resistance and cardio circuit to maximize total energy output", duration: "45 min", equipment: "equipment", level: "intermediate", format: "circuit", imageUrl: calorieStormCircuitImg, isFree: false },
      { id: "wc006", name: "Full Throttle Fat Burn", description: "High-intensity metabolic session combining endurance and strength bursts", duration: "60 min", equipment: "equipment", level: "advanced", format: "for time", imageUrl: fullThrottleFatBurnImg, isFree: false },
      { id: "wc007", name: "Burn Zone Intervals", description: "Explosive intervals alternating upper and lower movements to boost caloric output", duration: "45 min", equipment: "equipment", level: "intermediate", format: "tabata", imageUrl: burnZoneIntervalsImg, isFree: false },
      { id: "wc008", name: "Bodyweight Inferno", description: "A nonstop fat-burner using compound bodyweight movements", duration: "30 min", equipment: "bodyweight", level: "intermediate", format: "amrap", imageUrl: bodyweightInfernoImg, isFree: false },
      { id: "wc009", name: "Burn Flow 2.0", description: "Rhythmic cardio workout for beginners aiming at calorie loss and endurance", duration: "30 min", equipment: "bodyweight", level: "beginner", format: "circuit", imageUrl: burnFlow2Img, isFree: false },
      { id: "wc010", name: "Burnstorm", description: "A high-energy session blending power moves and cardio bursts to maximize calorie expenditure", duration: "45 min", equipment: "equipment", level: "advanced", format: "amrap", imageUrl: burnstormImg, isFree: false },
      { id: "wc011", name: "Cardio Sculpt", description: "A quick and dynamic fat-burning session using simple full-body movements", duration: "30 min", equipment: "bodyweight", level: "beginner", format: "tabata", imageUrl: cardioSculptImg, isFree: false },
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
      { id: "wm003", name: "Metabolic Mayhem", description: "Advanced metabolic workout combining barbell movements with cardio bursts", duration: "60 min", equipment: "equipment", level: "advanced", format: "for time", imageUrl: metabolicMayhemImg, isFree: false },
      { id: "wm004", name: "Metabolic Engine", description: "Circuit-based metabolic conditioning using kettlebells and medicine ball", duration: "45 min", equipment: "equipment", level: "intermediate", format: "circuit", imageUrl: metabolicEngineImg, isFree: false },
      { id: "wm005", name: "Metabolic Overdrive", description: "High-intensity AMRAP focusing on explosive power and metabolic output", duration: "45 min", equipment: "equipment", level: "advanced", format: "amrap", imageUrl: metabolicOverdriveImg, isFree: false },
      { id: "wm006", name: "Bodyweight Engine", description: "Tabata-style metabolic workout using bodyweight movements only", duration: "30 min", equipment: "bodyweight", level: "intermediate", format: "tabata", imageUrl: bodyweightEngineImg, isFree: false },
      { id: "wm007", name: "Metabolic Core Burn", description: "Circuit combining metabolic conditioning with core-focused movements", duration: "30 min", equipment: "bodyweight", level: "beginner", format: "circuit", imageUrl: metabolicCoreBurnImg, isFree: false },
      { id: "wm010", name: "HIIT Inferno", description: "A brutal metabolic conditioning workout designed to skyrocket endurance and afterburn", duration: "45 min", equipment: "equipment", level: "advanced", format: "circuit", imageUrl: hiitInfernoImg, isFree: false },
      { id: "wm011", name: "Sweat Circuit Pro", description: "Simple, effective circuit to elevate metabolism and improve endurance", duration: "30 min", equipment: "bodyweight", level: "beginner", format: "circuit", imageUrl: sweatCircuitProImg, isFree: false },
    ],
    "cardio": [
      { id: "cardio-061", name: "Cardio Lift-Off", description: "A gentle cardio circuit designed to elevate heart rate and improve aerobic capacity without high impact", duration: "30 min", equipment: "bodyweight", level: "beginner", format: "circuit", imageUrl: cardioLiftOffImg, isFree: true },
      { id: "cardio-062", name: "Pulse Builder", description: "A beginner-friendly Tabata workout using jump rope and fit ball to build rhythm, coordination, and endurance", duration: "30 min", equipment: "equipment", level: "beginner", format: "tabata", imageUrl: pulseIgniterImg, isFree: true },
      { id: "cardio-063", name: "Cardio Climb", description: "A bodyweight cardio workout using dynamic movements and short rest to build endurance and burn calories", duration: "45 min", equipment: "bodyweight", level: "intermediate", format: "amrap", imageUrl: cardioClimbImg, isFree: true },
      { id: "cardio-064", name: "Cardio Circuit Pro", description: "A high-energy cardio circuit using jump rope, medicine ball, and wall ball to boost heart rate and stamina", duration: "45 min", equipment: "equipment", level: "intermediate", format: "circuit", imageUrl: cardioCircuitProImg, isFree: true },
      { id: "cardio-065", name: "Cardio Inferno", description: "A high-intensity bodyweight cardio workout using plyometrics and compound moves for elite endurance and fat burn", duration: "60 min", equipment: "bodyweight", level: "advanced", format: "for time", imageUrl: cardioInfernoImg, isFree: true },
      { id: "cardio-066", name: "Cardio Overdrive", description: "A full-body cardio blast using jump rope, wall ball, and bands", duration: "60 min", equipment: "equipment", level: "advanced", format: "mix", imageUrl: cardioOverdriveImg, isFree: true },
      { id: "wca005", name: "Cardio Engine Builder", description: "Build cardiovascular endurance using rower and bike intervals", duration: "45 min", equipment: "equipment", level: "intermediate", format: "circuit", imageUrl: cardioEngineBuilderImg, isFree: false },
      { id: "wca006", name: "Sprint Power Combo", description: "Combining sled pushes with kettlebell work for explosive cardio power", duration: "45 min", equipment: "equipment", level: "advanced", format: "for time", imageUrl: sprintPowerComboImg, isFree: false },
      { id: "wca007", name: "Conditioning Pyramid", description: "Pyramid-style cardio conditioning with dumbbells and jump rope", duration: "45 min", equipment: "equipment", level: "intermediate", format: "circuit", imageUrl: conditioningPyramidImg, isFree: false },
      { id: "wca008", name: "Bodyweight Endurance Flow", description: "Continuous bodyweight cardio flow for sustained aerobic capacity", duration: "30 min", equipment: "bodyweight", level: "intermediate", format: "circuit", imageUrl: bodyweightEnduranceFlowImg, isFree: false },
      { id: "wca009", name: "Fast Feet Cardio Flow", description: "Bodyweight cardio focusing on speed and agility movements", duration: "30 min", equipment: "bodyweight", level: "beginner", format: "circuit", imageUrl: fastFeetCardioFlowImg, isFree: false },
      { id: "wca012", name: "Enduro Flow", description: "A total-body cardio endurance workout combining strength intervals and aerobic conditioning", duration: "45 min", equipment: "equipment", level: "intermediate", format: "for time", imageUrl: enduroFlowImg, isFree: false },
      { id: "wca013", name: "Cardio Sprint Ladder", description: "A fun ladder-style session improving aerobic endurance and leg power", duration: "30 min", equipment: "bodyweight", level: "beginner", format: "circuit", imageUrl: cardioSprintLadderImg, isFree: false },
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
      { id: "wmob003", name: "Joint Flow Restore", description: "Mobility restoration using foam roller and resistance bands", duration: "45 min", equipment: "equipment", level: "intermediate", format: "circuit", imageUrl: jointFlowRestoreImg, isFree: false },
      { id: "wmob004", name: "Core Stability Builder", description: "TRX-based stability workout focusing on core control and balance", duration: "45 min", equipment: "equipment", level: "intermediate", format: "reps & sets", imageUrl: coreStabilityBuilderImg, isFree: false },
      { id: "wmob005", name: "Balance Flow Reset", description: "Mini band and mat work for balance and mobility restoration", duration: "30 min", equipment: "equipment", level: "beginner", format: "circuit", imageUrl: balanceFlowResetImg, isFree: false },
      { id: "wmob006", name: "Mobility Wave", description: "Bodyweight mobility flow with dynamic stretching and joint prep", duration: "30 min", equipment: "bodyweight", level: "beginner", format: "circuit", imageUrl: mobilityWaveImg, isFree: false },
      { id: "wmob007", name: "Stability Core Flow", description: "Bodyweight stability and core activation flow", duration: "30 min", equipment: "bodyweight", level: "beginner", format: "circuit", imageUrl: stabilityCoreFlowImg, isFree: false },
      { id: "wmob012", name: "Core Flow Restore", description: "Core stability and dynamic flexibility session designed for recovery and control", duration: "45 min", equipment: "equipment", level: "intermediate", format: "circuit", imageUrl: coreFlowRestoreImg, isFree: false },
      { id: "wmob013", name: "Mobility Reset Pro", description: "A restorative routine to unlock stiff joints and realign posture", duration: "30 min", equipment: "bodyweight", level: "beginner", format: "circuit", imageUrl: mobilityResetProImg, isFree: false },
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
      { id: "wp003", name: "Explosive Engine", description: "Barbell and medicine ball power training for maximum explosive output", duration: "45 min", equipment: "equipment", level: "advanced", format: "reps & sets", imageUrl: explosiveEnginePowerImg, isFree: false },
      { id: "wp004", name: "Speed Mechanics", description: "Dumbbells and box work focusing on speed and power mechanics", duration: "45 min", equipment: "equipment", level: "intermediate", format: "circuit", imageUrl: speedMechanicsImg, isFree: false },
      { id: "wp005", name: "Olympic Power Session", description: "Olympic lifting-focused session for power development", duration: "60 min", equipment: "equipment", level: "advanced", format: "reps & sets", imageUrl: olympicPowerSessionImg, isFree: false },
      { id: "wp006", name: "Plyometric Burn", description: "Bodyweight plyometric workout for explosive power and calorie burn", duration: "30 min", equipment: "bodyweight", level: "intermediate", format: "circuit", imageUrl: plyometricBurnImg, isFree: false },
      { id: "wp007", name: "Power Flow", description: "Bodyweight power flow combining speed and control", duration: "30 min", equipment: "bodyweight", level: "beginner", format: "circuit", imageUrl: powerFlowImg, isFree: false },
      { id: "wp008", name: "Explosive Engine Pro", description: "Build fast-twitch muscle power and athletic performance", duration: "45 min", equipment: "equipment", level: "advanced", format: "reps & sets", imageUrl: explosiveEngineProImg, isFree: false },
      { id: "wp009", name: "Body Blast Power", description: "Fast, reactive movements to improve coordination and speed", duration: "30 min", equipment: "bodyweight", level: "intermediate", format: "tabata", imageUrl: bodyBlastPowerImg, isFree: false },
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
      { id: "wch003", name: "HFSC Beast Mode", description: "Barbell and dumbbell challenge workout pushing strength and endurance limits", duration: "60 min", equipment: "equipment", level: "advanced", format: "for time", imageUrl: hfscBeastModeImg, isFree: false },
      { id: "wch004", name: "Spartan Endurance Test", description: "Kettlebell and rower endurance challenge for mental and physical toughness", duration: "60 min", equipment: "equipment", level: "advanced", format: "for time", imageUrl: spartanEnduranceTestImg, isFree: false },
      { id: "wch005", name: "Full Body Benchmark", description: "Dumbbells and pull-up bar benchmark workout testing overall fitness", duration: "45 min", equipment: "equipment", level: "intermediate", format: "for time", imageUrl: fullBodyBenchmarkImg, isFree: false },
      { id: "wch006", name: "The Burnout Challenge", description: "Bodyweight challenge designed to test muscular endurance and mental fortitude", duration: "30 min", equipment: "bodyweight", level: "intermediate", format: "amrap", imageUrl: burnoutChallengeImg, isFree: false },
      { id: "wch007", name: "Warrior Flow", description: "Bodyweight warrior-style flow challenge combining strength and mobility", duration: "30 min", equipment: "bodyweight", level: "beginner", format: "circuit", imageUrl: warriorFlowImg, isFree: false },
      { id: "wch008", name: "100 Rep Gauntlet", description: "Complete 100 total reps of each movement — no quitting allowed", duration: "45 min", equipment: "equipment", level: "advanced", format: "for time", imageUrl: repGauntletImg, isFree: false },
      { id: "wch009", name: "Bodyweight Madness", description: "A fast-paced total-body challenge to test endurance and focus", duration: "30 min", equipment: "bodyweight", level: "intermediate", format: "amrap", imageUrl: bodyweightMadnessImg, isFree: false },
    ],
  };

const WorkoutDetail = () => {
  const navigate = useNavigate();
  const { type } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [equipmentFilter, setEquipmentFilter] = useState<EquipmentFilter>("all");
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("all");
  const [formatFilter, setFormatFilter] = useState<FormatFilter>("all");
  const [durationFilter, setDurationFilter] = useState<DurationFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortByFilter>("newest");
  const [accessFilter, setAccessFilter] = useState<AccessFilter>("all");
  const [userId, setUserId] = useState<string | undefined>();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  console.log("🎯 WorkoutDetail mounted - type:", type);
  
  // Fetch current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id);
      console.log("👤 User ID:", user?.id || "NOT LOGGED IN");
    });
  }, []);
  
  // Fetch workouts and interactions from database
  const { data: allWorkouts = [], isLoading } = useAllWorkouts();
  const { data: interactions = [] } = useWorkoutInteractions(userId);

  // Helper function to check if workout is new (created within last 7 days)
  const isNew = (createdAt: string | undefined) => {
    if (!createdAt) return false;
    const daysSinceCreation = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceCreation <= 7;
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm("");
    setEquipmentFilter("all");
    setLevelFilter("all");
    setFormatFilter("all");
    setDurationFilter("all");
    setStatusFilter("all");
    setSortBy("newest");
    setAccessFilter("all");
  };

  const hasActiveFilters = searchTerm || equipmentFilter !== "all" || levelFilter !== "all" || 
    formatFilter !== "all" || durationFilter !== "all" || statusFilter !== "all" || sortBy !== "newest" || accessFilter !== "all";
  
  console.log("📦 All Workouts:", allWorkouts.length, allWorkouts);
  console.log("⏳ Loading:", isLoading);
  
  // Map URL type to database category
  const categoryMap: { [key: string]: string } = {
    "strength": "STRENGTH",
    "calorie-burning": "CARDIO",
    "metabolic": "CONDITIONING",
    "cardio": "CARDIO",
    "mobility": "MOBILITY",
    "power": "POWER",
    "challenge": "CONDITIONING"
  };

  const workoutTitles: { [key: string]: string } = {
    "strength": "Strength Workouts",
    "calorie-burning": "Calorie Burning Workouts",
    "metabolic": "Metabolic Workouts",
    "cardio": "Cardio Workouts",
    "mobility": "Mobility & Stability Workouts",
    "power": "Power Workouts",
    "challenge": "Challenge Workouts"
  };

  const handleWorkoutClick = (workoutId: string) => {
    navigate(`/individualworkout/${workoutId}`);
  };

  const title = workoutTitles[type || ""] || "Workout";
  const mappedCategory = categoryMap[type || "strength"];
  
  // First filter by category from URL
  const currentTypeWorkouts = allWorkouts.filter(workout => {
    const categoryMatch = workout.category?.toUpperCase().includes(mappedCategory);
    return categoryMatch;
  });
  
  console.log("📦 Category filtered workouts:", currentTypeWorkouts.length);

  // Filter and sort workouts with memoization
  const filteredWorkouts = useMemo(() => {
    let filtered = currentTypeWorkouts.filter(workout => {
      // Search filter
      if (debouncedSearch) {
        const searchLower = debouncedSearch.toLowerCase();
        const matchesName = workout.name.toLowerCase().includes(searchLower);
        const matchesDescription = workout.description?.toLowerCase().includes(searchLower);
        const matchesCategory = workout.category?.toLowerCase().includes(searchLower);
        if (!matchesName && !matchesDescription && !matchesCategory) return false;
      }

      // Equipment filter
      if (equipmentFilter !== "all" && workout.equipment?.toLowerCase() !== equipmentFilter) return false;
      
      // Level filter
      if (levelFilter !== "all" && workout.difficulty?.toLowerCase() !== levelFilter) return false;
      
      // Format filter
      if (formatFilter !== "all") {
        const workoutFormat = workout.format?.toLowerCase();
        if (formatFilter === "reps & sets" && workoutFormat !== "reps & sets") return false;
        if (formatFilter === "for time" && workoutFormat !== "for time") return false;
        if (formatFilter !== "reps & sets" && formatFilter !== "for time" && workoutFormat !== formatFilter) return false;
      }
      
      // Duration filter
      if (durationFilter !== "all") {
        const workoutDuration = workout.duration?.toLowerCase();
        if (durationFilter === "various") {
          if (!workoutDuration?.includes("various") && !workoutDuration?.includes("varies")) return false;
        } else {
          const durationNumber = workout.duration?.match(/\d+/)?.[0];
          if (durationNumber !== durationFilter) return false;
        }
      }
      
      // Status filter
      if (statusFilter !== "all" && userId) {
        const interaction = interactions.find(i => i.workout_id === workout.id);
        if (statusFilter === "viewed" && !interaction?.has_viewed) return false;
        if (statusFilter === "completed" && !interaction?.is_completed) return false;
        if (statusFilter === "not-viewed" && interaction?.has_viewed) return false;
        if (statusFilter === "favorites" && !interaction?.is_favorite) return false;
      }
      
      // Access filter
      if (accessFilter === "free" && workout.is_premium) return false;
      if (accessFilter === "premium" && !workout.is_premium) return false;
      if (accessFilter === "purchasable" && (!workout.is_standalone_purchase || !workout.price)) return false;
      
      return true;
    });

    // Sort workouts
    const sorted = [...filtered];
    switch (sortBy) {
      case "newest":
        sorted.sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA;
        });
        break;
      case "oldest":
        sorted.sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateA - dateB;
        });
        break;
      case "name-asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
    }

    return sorted;
  }, [currentTypeWorkouts, debouncedSearch, equipmentFilter, levelFilter, formatFilter, 
      durationFilter, statusFilter, sortBy, accessFilter, userId, interactions]);

  return (
    <>
      {isLoading ? (
        <div className="min-h-screen bg-background py-8 px-4">
          <div className="container mx-auto max-w-7xl">
            <ContentLoadingSkeleton />
          </div>
        </div>
      ) : (
        <>
      <Helmet>
        <title>{title} Online Workouts | Cyprus Fitness | Haris Falas | SmartyGym</title>
        <meta name="description" content={`${title} online workouts by Cyprus Sports Scientist Haris Falas. Professional ${type || 'fitness'} workouts from beginner to advanced. AMRAP, HIIT, TABATA, circuit training. Free and premium online workouts for Cyprus and worldwide.`} />
        <meta name="keywords" content={`online workouts, ${title}, ${type} workouts, Cyprus fitness, Haris Falas workouts, online fitness Cyprus, HIIT workouts, AMRAP workouts, TABATA training, circuit training, bodyweight workouts, Cyprus personal trainers, online gym Cyprus, home workouts Cyprus`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={`${title} Online Workouts | Cyprus Fitness by Haris Falas`} />
        <meta property="og:description" content={`Professional ${title.toLowerCase()} online workouts designed by Cyprus Sports Scientist Haris Falas`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://smartygym.com/workout/${type || ''}`} />
        <meta property="og:site_name" content="SmartyGym Cyprus" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${title} Online Workouts | Haris Falas`} />
        <meta name="twitter:description" content={`Professional ${title.toLowerCase()} by Cyprus Sports Scientist`} />
        
        <link rel="canonical" href={`https://smartygym.com/workout/${type || ''}`} />
        
        {/* Structured Data - Collection of Workouts */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": `${title} Online Workouts`,
            "description": `Collection of professional online ${title.toLowerCase()} designed by Cyprus Sports Scientist Haris Falas`,
            "numberOfItems": filteredWorkouts.length,
            "provider": {
              "@type": "Person",
              "name": "Haris Falas",
              "jobTitle": "Sports Scientist & Personal Trainer",
              "description": "Cyprus fitness expert specializing in functional training"
            },
            "itemListElement": filteredWorkouts.slice(0, 10).map((workout, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "item": {
                "@type": "ExercisePlan",
                "name": workout.name,
                "description": workout.description,
                "image": workout.image_url,
                "duration": workout.duration,
                "workLocation": "Online / Home / Gym"
              }
            }))
          })}
        </script>
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
        
        <PageBreadcrumbs 
          items={[
            { label: "Home", href: "/" },
            { label: "Workouts", href: "/workout" },
            { label: title }
          ]} 
        />
        
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search workouts by name or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10 text-sm h-10"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => setSearchTerm('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Compact Filters */}
        <CompactFilters
          filters={[
            {
              name: "Equipment",
              value: equipmentFilter,
              onChange: (value) => setEquipmentFilter(value as EquipmentFilter),
              placeholder: "Equipment",
              options: [
                { value: "all", label: "All Equipment" },
                { value: "bodyweight", label: "Bodyweight" },
                { value: "equipment", label: "Equipment" },
              ],
            },
            {
              name: "Level",
              value: levelFilter,
              onChange: (value) => setLevelFilter(value as LevelFilter),
              placeholder: "Level",
              options: [
                { value: "all", label: "All Levels" },
                { value: "beginner", label: "Beginner" },
                { value: "intermediate", label: "Intermediate" },
                { value: "advanced", label: "Advanced" },
              ],
            },
            {
              name: "Format",
              value: formatFilter,
              onChange: (value) => setFormatFilter(value as FormatFilter),
              placeholder: "Format",
              options: [
                { value: "all", label: "All Formats" },
                { value: "circuit", label: "Circuit" },
                { value: "amrap", label: "AMRAP" },
                { value: "for time", label: "For Time" },
                { value: "tabata", label: "Tabata" },
                { value: "reps & sets", label: "Reps & Sets" },
                { value: "emom", label: "EMOM" },
                { value: "mix", label: "Mix" },
              ],
            },
            {
              name: "Duration",
              value: durationFilter,
              onChange: (value) => setDurationFilter(value as DurationFilter),
              placeholder: "Duration",
              options: [
                { value: "all", label: "All Durations" },
                { value: "15", label: "15 min" },
                { value: "20", label: "20 min" },
                { value: "30", label: "30 min" },
                { value: "45", label: "45 min" },
                { value: "60", label: "60 min" },
                { value: "various", label: "Various" },
              ],
            },
            {
              name: "Access",
              value: accessFilter,
              onChange: (value) => setAccessFilter(value as AccessFilter),
              placeholder: "Access Level",
              options: [
                { value: "all", label: "All Content" },
                { value: "free", label: "🆓 Free Only" },
                { value: "premium", label: "👑 Premium Only" },
                { value: "purchasable", label: "💶 Purchasable" },
              ],
            },
            ...(userId ? [{
              name: "Status",
              value: statusFilter,
              onChange: (value) => setStatusFilter(value as StatusFilter),
              placeholder: "Status",
              options: [
                { value: "all", label: "All Workouts" },
                { value: "viewed", label: "👁️ Viewed" },
                { value: "completed", label: "✓ Completed" },
                { value: "not-viewed", label: "✨ Not Viewed Yet" },
                { value: "favorites", label: "⭐ Favorites" },
              ],
            }] : []),
            {
              name: "Sort By",
              value: sortBy,
              onChange: (value) => setSortBy(value as SortByFilter),
              placeholder: "Sort By",
              options: [
                { value: "newest", label: "🆕 Newest First" },
                { value: "oldest", label: "📅 Oldest First" },
                { value: "name-asc", label: "🔤 Name A-Z" },
                { value: "name-desc", label: "🔤 Name Z-A" },
              ],
            },
          ]}
        />

        {/* Results Counter & Clear Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 px-1">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Showing {filteredWorkouts.length} of {currentTypeWorkouts.length} workouts
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
          
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="w-full sm:w-auto text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Clear All Filters
            </Button>
          )}
        </div>

        {/* Workout Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredWorkouts.map((workout) => {
            const interaction = userId ? interactions.find(i => i.workout_id === workout.id) : null;
            const isViewed = interaction?.has_viewed;
            const isCompleted = interaction?.is_completed;
            const isFavorite = interaction?.is_favorite;
            const isNewWorkout = isNew(workout.created_at);
            
            return (
              <Card
                key={workout.id}
                className="overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-gold bg-card border-border relative"
                onClick={() => navigate(`/workout/${type}/${workout.id}`)}
              >
                {/* NEW Badge */}
                {isNewWorkout && (
                  <div className="absolute top-2 right-2 z-10">
                    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">
                      <Sparkles className="h-3 w-3 shrink-0" />
                      NEW
                    </span>
                  </div>
                )}

                <div className="relative h-48 w-full overflow-hidden">
                  <img 
                    src={workout.image_url} 
                    alt={`${workout.name} - ${workout.duration} ${workout.difficulty} ${workout.equipment === 'BODYWEIGHT' ? 'bodyweight' : 'equipment-based'} ${workout.format} workout by Haris Falas Sports Scientist at SmartyGym.com`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                
                <div className="p-4 space-y-3">
                  <h3 className="font-semibold text-base sm:text-lg">{workout.name}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{workout.description}</p>
                  
                  {/* Status Indicators Row */}
                  {userId && (
                    <div className="flex items-center gap-2 flex-wrap">
                      {isCompleted && (
                        <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                          <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                          <span className="hidden sm:inline">Completed</span>
                        </div>
                      )}
                      
                      {isViewed && !isCompleted && (
                        <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                          <span className="hidden sm:inline">Viewed</span>
                        </div>
                      )}
                      
                      {isFavorite && (
                        <div className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400">
                          <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-current shrink-0" />
                          <span className="hidden sm:inline">Favorite</span>
                        </div>
                      )}
                      
                      {isNewWorkout && (
                        <div className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400 font-semibold">
                          <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                          <span>NEW</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Access Badge */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{workout.duration}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    {workout.is_premium ? (
                      workout.is_standalone_purchase && workout.price ? (
                        <span className="inline-flex items-center gap-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                          <ShoppingCart className="h-3 w-3 shrink-0" />
                          €{Number(workout.price).toFixed(2)}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                          <Crown className="h-3 w-3 shrink-0" />
                          <span className="hidden sm:inline">Premium</span>
                        </span>
                      )
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-gradient-to-r from-green-500 to-teal-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                        <Check className="h-3 w-3 shrink-0" />
                        FREE
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
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
      )}
    </>
  );
};

export default WorkoutDetail;
