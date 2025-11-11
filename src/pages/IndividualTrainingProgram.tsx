import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { WorkoutDisplay } from "@/components/WorkoutDisplay";
import { AccessGate } from "@/components/AccessGate";
import { CommentDialog } from "@/components/CommentDialog";
import { PurchaseButton } from "@/components/PurchaseButton";
import { useProgramData } from "@/hooks/useProgramData";
import { useAccessControl } from "@/hooks/useAccessControl";
import cardioEnduranceImg from "@/assets/cardio-endurance-program.jpg";
import functionalStrengthImg from "@/assets/functional-strength-program.jpg";
import muscleHypertrophyImg from "@/assets/muscle-hypertrophy-program.jpg";
import metabolicBurnImg from "@/assets/metabolic-burn-workout.jpg";
import fatFurnaceImg from "@/assets/fat-furnace-workout.jpg";
import coreBuilderImg from "@/assets/core-builder-workout.jpg";
import flowMobilityImg from "@/assets/flow-mobility-workout.jpg";
import muscleHypertrophyProImg from "@/assets/muscle-hypertrophy-pro-program.jpg";
import cardioMaxEnduranceImg from "@/assets/cardio-max-endurance-program.jpg";
import lowBackPerformanceImg from "@/assets/low-back-performance-program.jpg";
import mobilityMasterFlowImg from "@/assets/mobility-master-flow-program.jpg";
import functionalStrengthEliteImg from "@/assets/functional-strength-elite-program.jpg";
import functionalStrengthFoundationsImg from "@/assets/functional-strength-foundations-program.jpg";
import muscleHypertrophyBuildImg from "@/assets/muscle-hypertrophy-build-program.jpg";
import cardioPerformanceImg from "@/assets/cardio-performance-program.jpg";
import weightLossIgniteImg from "@/assets/weight-loss-ignite-program.jpg";
import lowBackPainReliefImg from "@/assets/low-back-pain-relief-program.jpg";
import mobilityStabilityFlowImg from "@/assets/mobility-stability-flow-program.jpg";

const IndividualTrainingProgram = () => {
  const navigate = useNavigate();
  const { type, id } = useParams();
  const { userTier, hasPurchased } = useAccessControl();
  
  // Helper function to format focus label
  const getFocusLabel = (type: string | undefined): string => {
    const focusMap: { [key: string]: string } = {
      'cardio': 'Cardio',
      'functional': 'Functional Training',
      'hypertrophy': 'Hypertrophy',
      'weightloss': 'Weight Loss',
      'weight-loss': 'Weight Loss',
      'backcare': 'Back Care',
      'back-care': 'Back Care',
      'mobility': 'Mobility & Stability',
      'strength': 'Strength',
      'endurance': 'Endurance'
    };
    return focusMap[type || ''] || 'General Training';
  };

  // Weight Loss Ignite (T-W001) is FREE for testing
  const freePrograms: string[] = ["T-W001"];
  const isFreeProgram = id === "T-W001" || freePrograms.includes(id || '');
  
  // Try to fetch from database first
  const { data: dbProgram, isLoading: isLoadingDb } = useProgramData(id);

  // If we have database program, use it directly
  if (isLoadingDb) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading program...</p>
      </div>
    );
  }

  if (dbProgram) {
    const isPremium = dbProgram.is_premium && !isFreeProgram;
    const canPurchase = dbProgram.is_standalone_purchase && dbProgram.price;
    const hasAccess = userTier === "premium" || hasPurchased(dbProgram.id, "program") || !isPremium;

    return (
      <>
        <Helmet>
          <title>{dbProgram.name} | Online Training Program by Haris Falas | SmartyGym Cyprus</title>
          <meta name="description" content={`${dbProgram.description || dbProgram.name} - ${dbProgram.weeks} week online training program by Cyprus Sports Scientist Haris Falas. ${dbProgram.category} program. ${dbProgram.days_per_week} days per week. ${dbProgram.equipment}.`} />
          <meta name="keywords" content={`${dbProgram.name}, online training programs, ${dbProgram.category} program, ${dbProgram.weeks} week program, Haris Falas, Cyprus fitness programs, online personal training, Cyprus personal trainers, structured training program`} />
          
          {/* Open Graph */}
          <meta property="og:type" content="article" />
          <meta property="og:url" content={window.location.href} />
          <meta property="og:title" content={`${dbProgram.name} | Online Training Program by Haris Falas`} />
          <meta property="og:description" content={dbProgram.description || `${dbProgram.weeks} week ${dbProgram.category} program designed by Cyprus Sports Scientist`} />
          <meta property="og:image" content={dbProgram.image_url} />
          
          {/* Twitter */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={`${dbProgram.name} | Training Program`} />
          <meta name="twitter:description" content={dbProgram.description || dbProgram.name} />
          <meta name="twitter:image" content={dbProgram.image_url} />
          
          <link rel="canonical" href={window.location.href} />
          
          {/* Structured Data - ExercisePlan */}
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ExercisePlan",
              "name": dbProgram.name,
              "description": dbProgram.description,
              "image": dbProgram.image_url,
              "duration": `P${dbProgram.weeks}W`,
              "category": dbProgram.category,
              "exerciseType": dbProgram.category,
              "intensity": dbProgram.difficulty,
              "repetitions": `${dbProgram.days_per_week} days per week`,
              "workLocation": "Online / Home / Gym",
              "author": {
                "@type": "Person",
                "name": "Haris Falas",
                "jobTitle": "Sports Scientist & Strength Coach",
                "description": "Cyprus personal trainer specializing in structured training programs"
              },
              "identifier": dbProgram.id,
              "offers": dbProgram.is_standalone_purchase ? {
                "@type": "Offer",
                "price": dbProgram.price,
                "priceCurrency": "EUR"
              } : undefined
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
                programId={id}
                programName={dbProgram.name}
                programType={type}
              />
            </div>

            {/* Show purchase button if available and user doesn't have access */}
            {!hasAccess && canPurchase && userTier === "subscriber" && (
              <div className="mb-6">
                <Card className="border-primary/50 bg-gradient-to-r from-primary/5 to-primary/10">
                  <div className="p-6 text-center space-y-4">
                    <h3 className="text-xl font-semibold">Get Instant Access</h3>
                    <p className="text-muted-foreground">
                      Purchase this program once and own it forever
                    </p>
                    <PurchaseButton
                      contentId={dbProgram.id}
                      contentType="program"
                      contentName={dbProgram.name}
                      price={Number(dbProgram.price) || 0}
                      stripeProductId={dbProgram.stripe_product_id}
                      stripePriceId={dbProgram.stripe_price_id}
                    />
                  </div>
                </Card>
              </div>
            )}

            <AccessGate requireAuth={true} requirePremium={isPremium && !hasAccess} contentType="program">
              <WorkoutDisplay
                exercises={[]}
                planContent=""
                title={dbProgram.name}
                serial={dbProgram.id}
                focus={dbProgram.category || getFocusLabel(type)}
                difficulty={dbProgram.difficulty_stars || 3}
                imageUrl={dbProgram.image_url}
                duration={`${dbProgram.weeks} weeks / ${dbProgram.days_per_week} days per week`}
                equipment={dbProgram.equipment}
                description={dbProgram.description}
                overview={dbProgram.overview}
                target_audience={dbProgram.target_audience}
                program_structure={dbProgram.program_structure}
                weekly_schedule={dbProgram.weekly_schedule}
                progression_plan={dbProgram.progression_plan}
                nutrition_tips={dbProgram.nutrition_tips}
                expected_results={dbProgram.expected_results}
                programId={id}
                programType={type || ''}
                isFreeContent={isFreeProgram}
              />
            </AccessGate>
          </div>
        </div>
      </>
    );
  }

  // Program data structure (fallback for hardcoded programs)
  const programData: {
    [key: string]: {
      name: string;
      serialNumber: string;
      focus: string;
      difficulty: string;
      duration: string;
      equipment: string;
      imageUrl: string;
      description: string;
      format: string;
      instructions: string;
      exercises: Array<{
        week: string;
        day: string;
        workout: string;
        details: string;
      }>;
      tips: string[];
    };
  } = {
    "T-F001": {
      name: "Functional Strength Builder",
      serialNumber: "T-F001",
      focus: "Functional Strength",
      difficulty: "Intermediate",
      duration: "6 Weeks / 4 Training Days per Week",
      equipment: "Dumbbells, Kettlebells, Barbell, TRX, Bodyweight",
      imageUrl: functionalStrengthImg,
      description: "A 6-week intermediate program designed to develop foundational full-body strength, improve neuromuscular control, and enhance movement efficiency. The focus is on compound lifts, unilateral stability, and functional movement patterns under moderate load.",
      format: "Reps & Sets",
      instructions: "Perform all lifts with a controlled tempo (3-1-1-0). Progressively overload each week by increasing load 2.5–5% or adding one extra rep when all sets are completed with proper form. Rest 60–90s between accessory sets and 90–120s between compound lifts.",
      tips: ["Focus on technique and joint alignment", "Activate the core before each main lift", "Avoid ego lifting — quality before quantity"],
      exercises: [
        { week: "All Weeks", day: "Day 1", workout: "Lower Body Push", details: "Barbell Back Squat – 4x6 @70–75% 1RM (Tempo 3-1-1-0, Rest 120s)\nBulgarian Split Squat – 3x10/leg @RPE 8 (Tempo 2-1-1-0, Rest 90s)\nDB Step-Ups – 3x12/leg (Tempo 2-0-1-0, Rest 60s)\nCore: Plank w/ Shoulder Tap – 3x30s" },
        { week: "All Weeks", day: "Day 2", workout: "Upper Body Pull + Core", details: "Pull-Ups – 4x8 (weighted optional) (Tempo 2-1-1-1, Rest 120s)\nBent-Over Row – 3x10 @65% 1RM (Tempo 3-0-1-0, Rest 90s)\nFace Pulls – 3x15 (Tempo 2-0-1-0, Rest 60s)\nCore: Hanging Leg Raise – 3x12" },
        { week: "All Weeks", day: "Day 3", workout: "Rest or Active Recovery", details: "Light mobility, walking, foam rolling" },
        { week: "All Weeks", day: "Day 4", workout: "Lower Body Pull", details: "Romanian Deadlift – 4x8 @70% 1RM (Tempo 3-1-1-0, Rest 120s)\nKettlebell Swing – 3x15 (Tempo 1-0-1-0, Rest 60s)\nSingle-Leg RDL – 3x10/leg (Tempo 2-1-1-0, Rest 90s)\nCore: Dead Bug – 3x12" },
        { week: "All Weeks", day: "Day 5", workout: "Upper Body Push", details: "Barbell Bench Press – 4x6 @75% 1RM (Tempo 3-1-1-0, Rest 120s)\nDB Shoulder Press – 3x10 (Tempo 2-1-1-0, Rest 90s)\nDips – 3x12 @RIR 1–2 (Tempo 2-0-1-0, Rest 60s)\nCore: Pallof Press – 3x15" },
        { week: "All Weeks", day: "Day 6 & 7", workout: "Rest", details: "Complete rest days for recovery" }
      ]
    },
    "T-F002": {
      name: "Functional Strength Elite I",
      serialNumber: "T-F002",
      focus: "Functional Strength",
      difficulty: "Advanced",
      duration: "8 Weeks / 5 Training Days per Week",
      equipment: "Barbell, Dumbbells, Kettlebells, TRX, Bands, Sled, Pull-up Bar",
      imageUrl: functionalStrengthEliteImg,
      description: "Eight weeks of high-intensity compound lifting and functional circuits that develop maximal strength, explosiveness, and control through every plane of motion.",
      format: "Strength + Power Hybrid",
      instructions: "Tempo 3-1-1-0 on strength, 1-0-1-0 on power moves. Weeks 1–4 = volume (70–80% 1RM). Weeks 5–8 = intensity (80–90%). Increase load 2–5% weekly when all sets complete. Rest 2 min on compounds, 60–90s on accessories.",
      tips: ["Brace the core before every rep", "Maintain mobility work 2×/week", "Fuel with carbs pre-workout and protein after"],
      exercises: [
        { week: "All Weeks", day: "Day 1", workout: "Lower Body Power", details: "Back Squat – 5×5 @ 80% 1RM (3-1-1-0) Rest 2 min\nJump Squat – 4×6 (bodyweight or light load) Rest 90s\nWalking Lunge – 3×12/leg (2-0-1-0)\nWeighted Plank – 3×40s" },
        { week: "All Weeks", day: "Day 2", workout: "Upper Push + Core", details: "Bench Press – 5×5 @ 80%\nDB Overhead Press – 4×8\nDips – 3×12 @ RIR 1\nPallof Press – 3×15" },
        { week: "All Weeks", day: "Day 3", workout: "Pull Strength", details: "Deadlift – 5×4 @ 85%\nPull-Ups (weighted) – 4×8\nBarbell Row – 3×10\nFace Pull – 3×15" },
        { week: "All Weeks", day: "Day 4", workout: "Functional Circuit (3 Rounds)", details: "Kettlebell Swing 15\nPush Press 10\nSled Push 20m\nTRX Row 12\nRest 2 min" },
        { week: "All Weeks", day: "Day 5", workout: "Core & Conditioning", details: "Farmer Carry 4×40m\nHanging Leg Raise 3×12\nAb Wheel Roll-out 3×10\nAssault Bike Intervals 8×20s on / 40s off" },
        { week: "All Weeks", day: "Day 6-7", workout: "Rest or Mobility", details: "Complete rest or light mobility work" }
      ]
    },
    "T-F003": {
      name: "Functional Strength Elite II",
      serialNumber: "T-F003",
      focus: "Functional Strength",
      difficulty: "Advanced",
      duration: "8 Weeks / 4 Training Days",
      equipment: "Barbell, Trap Bar, Kettlebells, Sandbag, TRX, Slam Ball",
      imageUrl: functionalStrengthEliteImg,
      description: "A power-endurance plan for advanced athletes blending heavy compound movements with metabolic finishers. Ideal for building real-world strength and capacity.",
      format: "Mixed (Strength + MetCon)",
      instructions: "Main lifts 3-1-1-0, finishers 1-0-1-0. Add load or rounds each week (+5% or +1 set). Rest 90–120s between strength sets, 30–45s inside circuits.",
      tips: ["Perfect technique beats extra weight", "Recover with sleep and mobility days"],
      exercises: [
        { week: "All Weeks", day: "Day 1", workout: "Lower Pull + Posterior Chain", details: "Trap Bar Deadlift – 5×5 @ 80%\nRomanian Deadlift – 4×8\nSingle-Leg Glute Bridge – 3×12/leg\nBand Good Morning – 3×15" },
        { week: "All Weeks", day: "Day 2", workout: "Upper Push/Pull Complex", details: "Superset (4 Rounds):\nIncline Barbell Press – 8 reps @ 75%\nPendlay Row – 8 reps @ 75%\n\nThen:\nPush-Up to Row 3×10\nFace Pull 3×15" },
        { week: "All Weeks", day: "Day 3", workout: "Rest / Mobility", details: "Complete rest or mobility session" },
        { week: "All Weeks", day: "Day 4", workout: "Full Body MetCon (5 Rounds)", details: "Sandbag Clean 5\nFront Squat 5\nPush Press 5\nBurpee 10\nSlam Ball 15\nRest 90s" },
        { week: "All Weeks", day: "Day 5", workout: "Core & Grip", details: "Hanging Knee Raise 3×15\nFarmer Carry 5×30m\nSide Plank Hip Lift 3×12/side\nSled Drag 4×20m" },
        { week: "All Weeks", day: "Day 6-7", workout: "Rest", details: "Complete rest days" }
      ]
    },
    "T-H001": {
      name: "Muscle Hypertrophy Builder",
      serialNumber: "T-H001",
      focus: "Muscle Hypertrophy",
      difficulty: "Intermediate",
      duration: "6 Weeks / 5 Training Days per Week",
      equipment: "Machines, Dumbbells, Barbells, Bodyweight",
      imageUrl: muscleHypertrophyImg,
      description: "A 6-week intermediate hypertrophy split designed to maximize muscle volume and structural balance. Focuses on moderate loads, high volume, and controlled eccentric tempos.",
      format: "Reps & Sets",
      instructions: "Tempo: 3-1-2-0. Load: 65–75% 1RM, working to near failure (1–2 RIR). Progression: Add 1 rep or 2.5% load weekly when all sets are completed. Rest 60–90s between sets.",
      tips: ["Prioritize mind–muscle connection and eccentric control", "Maintain consistent training frequency and recovery nutrition"],
      exercises: [
        { week: "All Weeks", day: "Day 1", workout: "Chest & Triceps", details: "Flat Barbell Press – 4x10 @70%\nIncline DB Press – 3x12\nCable Fly – 3x15\nTriceps Rope Pushdown – 3x15\nOverhead Extension – 2x12" },
        { week: "All Weeks", day: "Day 2", workout: "Back & Biceps", details: "Lat Pulldown – 4x10\nSeated Row – 3x12\nDB Row – 3x12/side\nBarbell Curl – 3x10\nHammer Curl – 3x12" },
        { week: "All Weeks", day: "Day 3", workout: "Legs", details: "Squat – 4x8 @70%\nLeg Press – 3x12\nRomanian Deadlift – 3x10\nWalking Lunge – 3x12/leg\nCalf Raise – 3x20" },
        { week: "All Weeks", day: "Day 4", workout: "Shoulders & Core", details: "DB Shoulder Press – 4x10\nLateral Raise – 3x15\nRear Delt Fly – 3x15\nHanging Leg Raise – 3x12\nCable Crunch – 3x20" },
        { week: "All Weeks", day: "Day 5", workout: "Full Body Pump", details: "DB Clean & Press – 3x10\nPush-Ups – 3xAMRAP\nKB Swings – 3x15\nMountain Climbers – 3x40s" },
        { week: "All Weeks", day: "Day 6-7", workout: "Rest", details: "Complete rest days" }
      ]
    },
    "T-H002": {
      name: "Muscle Hypertrophy Pro I",
      serialNumber: "T-H002",
      focus: "Muscle Hypertrophy",
      difficulty: "Advanced",
      duration: "8 Weeks / 6 Training Days (Push/Pull/Legs × 2)",
      equipment: "Full Gym Setup",
      imageUrl: muscleHypertrophyProImg,
      description: "A classic push-pull-legs split geared for maximum size. High volume, controlled tempo, and progressive overload build thickness and symmetry.",
      format: "Reps & Sets",
      instructions: "Weeks 1–4 10–12 reps @ 70%; Weeks 5–8 6–8 reps @ 80%. Tempo 3-1-1-0 on compounds. Add 2–5% load weekly. Rest 90s (iso), 120s (compound).",
      tips: ["Eat in a small surplus (+250 kcal)", "Hit 1.8–2g protein/kg", "Sleep 8h min", "Creatine and EAAs help recovery"],
      exercises: [
        { week: "All Weeks", day: "Day 1", workout: "Push", details: "Flat Bench Press – 5×8 @ 75%\nIncline DB Press – 4×10\nDB Lateral Raise – 3×15\nCable Fly – 3×15\nOverhead Tricep Ext – 3×12" },
        { week: "All Weeks", day: "Day 2", workout: "Pull", details: "Deadlift – 5×5 @ 80%\nPull-Up – 4×10\nSeated Row – 3×12\nBarbell Curl – 3×10\nFace Pull – 3×15" },
        { week: "All Weeks", day: "Day 3", workout: "Legs", details: "Back Squat – 5×6 @ 80%\nLeg Press – 4×12\nRomanian Deadlift – 3×10\nLeg Curl – 3×15\nStanding Calf Raise – 4×20" },
        { week: "All Weeks", day: "Day 4", workout: "Repeat Push", details: "DB Press – 4×10\nArnold Press – 3×12\nCable Crossover – 3×15\nRope Pushdown – 3×15" },
        { week: "All Weeks", day: "Day 5", workout: "Repeat Pull", details: "Bent Over Row – 4×8\nLat Pulldown – 3×12\nIncline DB Curl – 3×12\nRear Delt Fly – 3×15" },
        { week: "All Weeks", day: "Day 6", workout: "Legs 2", details: "Front Squat – 4×8\nDB Lunge – 3×10/leg\nLeg Extension – 3×15\nSeated Calf Raise – 4×20" },
        { week: "All Weeks", day: "Day 7", workout: "Rest", details: "Complete rest" }
      ]
    },
    "T-H003": {
      name: "Muscle Hypertrophy Pro II",
      serialNumber: "T-H003",
      focus: "Muscle Hypertrophy",
      difficulty: "Advanced",
      duration: "8 Weeks / 5 Training Days",
      equipment: "Barbell, Machines, Dumbbells, Cable Station",
      imageUrl: muscleHypertrophyProImg,
      description: "A blended upper/lower split for advanced lifters targeting balanced growth and metabolic stress. Includes mechanical drops and supersets to maximize hypertrophy.",
      format: "Upper/Lower + Full Body",
      instructions: "Tempo 3-1-2-0. Progressive overload via added volume (+1 set every 2 weeks) or +2.5% load if all reps completed. Rest 60–90s between supersets.",
      tips: ["Use controlled eccentrics and train 1–2 reps short of failure", "Deload after week 8 before restarting"],
      exercises: [
        { week: "All Weeks", day: "Day 1", workout: "Upper A", details: "Barbell Bench Press – 4×8\nBarbell Row – 4×10\nSeated DB Press – 3×12\nPull-Ups – 3×10\nCable Curl + Tricep Pushdown (Superset) 3×12 each" },
        { week: "All Weeks", day: "Day 2", workout: "Lower A", details: "Back Squat – 5×6 @ 80%\nRDL – 4×8\nWalking Lunge – 3×12/leg\nCalf Raise – 4×15" },
        { week: "All Weeks", day: "Day 3", workout: "Rest / Mobility", details: "Complete rest or light mobility work" },
        { week: "All Weeks", day: "Day 4", workout: "Upper B", details: "Incline DB Press – 4×10\nT-Bar Row – 4×10\nLateral Raise – 3×15\nPreacher Curl – 3×12\nOverhead Tricep Ext – 3×12" },
        { week: "All Weeks", day: "Day 5", workout: "Lower B + Full Body Finisher", details: "Front Squat – 4×8\nLeg Press – 3×12\nLeg Curl – 3×15\nFull-Body Finisher (3 Rounds): 10 Burpees + 10 KB Swings + 250m Row" },
        { week: "All Weeks", day: "Day 6-7", workout: "Rest", details: "Complete rest days" }
      ]
    },
    "T-C001": {
      name: "Cardio Performance Booster",
      serialNumber: "T-C001",
      focus: "Cardio",
      difficulty: "Intermediate",
      duration: "6 Weeks / 4 Training Days per Week",
      equipment: "Treadmill, Rower, Bike, Jump Rope, Bodyweight",
      imageUrl: cardioEnduranceImg,
      description: "A 6-week cardiovascular conditioning plan aimed to build aerobic base, increase VO₂ max, and improve overall endurance. The sessions alternate between steady-state and interval conditioning to maximize heart and lung performance.",
      format: "Interval + Steady-State Combination",
      instructions: "Tempo is expressed as effort level (% of max HR or RPE 1–10). Weeks 1–3: Aerobic base (Zone 2–3, RPE 5–6), Weeks 4–6: Intensity and speed (Zone 4–5, RPE 7–8). Progress overload by increasing duration 5% weekly or intensity slightly each week.",
      tips: ["Warm up 5–10 minutes before all sessions", "Keep heart rate under control—avoid overtraining", "Hydrate and cool down 5–10 minutes post-session"],
      exercises: [
        { week: "All Weeks", day: "Day 1", workout: "Steady-State Run", details: "35 min @ Zone 2–3 (RPE 6)\nFinish: 4x100m strides" },
        { week: "All Weeks", day: "Day 2", workout: "Interval Bike", details: "Warm-up: 10 min easy spin\n10x1 min @ Zone 4 (RPE 8) / 1 min easy recovery\nCool down: 10 min" },
        { week: "All Weeks", day: "Day 3", workout: "Active Recovery or Rest", details: "20–30 min brisk walk or yoga session" },
        { week: "All Weeks", day: "Day 4", workout: "Rowing Pyramid", details: "250m / 500m / 750m / 1000m / 750m / 500m / 250m\nRest: 60s between efforts" },
        { week: "All Weeks", day: "Day 5", workout: "Bodyweight Cardio Circuit", details: "3 Rounds:\nJump Rope – 1 min\nBurpees – 15\nMountain Climbers – 40\nAir Squats – 20\nRest 90s between rounds" },
        { week: "All Weeks", day: "Day 6-7", workout: "Rest", details: "Complete rest days" }
      ]
    },
    "T-C002": {
      name: "Cardio Max Endurance",
      serialNumber: "T-C002",
      focus: "Cardio",
      difficulty: "Advanced",
      duration: "8 Weeks / 5 Days per Week",
      equipment: "Bike, Rower, Treadmill, Weighted Vest, Kettlebell",
      imageUrl: cardioMaxEnduranceImg,
      description: "A progressive 8-week endurance plan for athletes seeking peak aerobic and anaerobic capacity. Uses a blend of HIIT, threshold training, and long slow distance (LSD) sessions.",
      format: "Interval + Steady-State Combination",
      instructions: "Effort measured via HR zones or RPE: LSD (Zone 2–3) = 60–70% HR max, Threshold (Zone 4) = 80–85%, HIIT (Zone 5) = 90%+. Overload by adding 1–2 intervals or extending LSD sessions by 5–10 min weekly.",
      tips: ["Don't skip recovery", "HR monitoring is essential", "Maintain 48h between high-intensity sessions"],
      exercises: [
        { week: "All Weeks", day: "Day 1", workout: "Threshold Run", details: "10 min warm-up\n3x10 min @ Zone 4 (RPE 8) / 2 min recovery\nCool down 5 min" },
        { week: "All Weeks", day: "Day 2", workout: "Bike HIIT", details: "Warm-up 10 min\n12x30s sprint @ Zone 5 / 90s recovery\nFinish: 5 min cool down" },
        { week: "All Weeks", day: "Day 3", workout: "LSD Day", details: "60–90 min continuous effort @ Zone 2–3 (RPE 6)" },
        { week: "All Weeks", day: "Day 4", workout: "Full-Body Conditioning", details: "3–4 Rounds for time:\n500m Row\n20 KB Swings\n15 Burpees\n10 Pull-ups\nRest 2 min" },
        { week: "All Weeks", day: "Day 5", workout: "Mixed Intervals", details: "Repeat x5 rounds:\n800m Run\n20 Air Squats\n20 Mountain Climbers\n10 Push-Ups" },
        { week: "All Weeks", day: "Day 6-7", workout: "Rest", details: "Complete rest days" }
      ]
    },
    "T-W001": {
      name: "Weight Loss Ignite",
      serialNumber: "T-W001",
      focus: "Weight Loss",
      difficulty: "Intermediate",
      duration: "6 Weeks / 5 Training Days",
      equipment: "Dumbbells, Kettlebells, Bands, Bodyweight",
      imageUrl: metabolicBurnImg,
      description: "A metabolic-driven fat loss program combining circuit training, interval cardio, and strength elements. Designed to maximize caloric expenditure and improve lean muscle retention.",
      format: "Reps & Sets",
      instructions: "Tempo: 2-0-1-0 (dynamic). Work:Rest ratio 40:20 to 60:30 depending on conditioning. Overload by adding volume or increasing working time. Maintain 1–2 RIR in strength circuits.",
      tips: ["Train in a caloric deficit with adequate protein", "Keep heart rate elevated throughout workouts but maintain form"],
      exercises: [
        { week: "All Weeks", day: "Day 1", workout: "Total Body Circuit", details: "4 Rounds:\nDB Squat to Press – 12\nPush-Ups – 12\nBent-Over Row – 12\nMountain Climbers – 40\nPlank – 40s\nRest: 90s" },
        { week: "All Weeks", day: "Day 2", workout: "HIIT Intervals", details: "10x (30s sprint + 90s walk) on treadmill or bike" },
        { week: "All Weeks", day: "Day 3", workout: "Active Recovery", details: "Mobility & walk 30 min" },
        { week: "All Weeks", day: "Day 4", workout: "Lower Body Blast", details: "3 Rounds:\nGoblet Squat – 15\nReverse Lunge – 10/leg\nKettlebell Swing – 20\nJump Squat – 15\nRest: 90s" },
        { week: "All Weeks", day: "Day 5", workout: "Upper Body + Core", details: "Supersets:\nDB Bench Press – 3x12\nTRX Row – 3x12\nShoulder Taps – 3x20\nSit-Ups – 3x20" },
        { week: "All Weeks", day: "Day 6-7", workout: "Rest", details: "Complete rest days" }
      ]
    },
    "T-W002": {
      name: "Weight Loss Max Burn I",
      serialNumber: "T-W002",
      focus: "Weight Loss",
      difficulty: "Advanced",
      duration: "8 Weeks / 5 Training Days per Week",
      equipment: "Dumbbells, Kettlebells, Barbell, Rower, Bike, Resistance Bands, Treadmill",
      imageUrl: fatFurnaceImg,
      description: "An eight-week metabolic-conditioning plan created to accelerate fat loss while maintaining lean muscle. It blends strength endurance, Tabata, and cardio intervals with structured recovery and outdoor runs.",
      format: "Mixed (Circuit + HIIT + Running)",
      instructions: "Tempo 1-0-1-0 for conditioning, 2-0-1-0 for loaded work. Use RPE 8–9 for work intervals, 5–6 for active recoveries. Progress by adding 1–2 reps or 5% load weekly, or reducing rest by 10s each week. Rest 60s between circuits and 2 min after full rounds. Follow proper warm-up and cool-down routines before and after each session.",
      tips: ["Maintain a calorie deficit (–400 to –600 kcal/day)", "Sleep 7–9h, stay hydrated, and refuel with protein and fiber", "Change music or environment to keep energy high — variety beats boredom"],
      exercises: [
        { week: "All Weeks", day: "Day 1", workout: "Metabolic Strength Circuit (4 Rounds)", details: "Front Squat – 10 @ 70% 1RM (2-0-1-0)\nPush Press – 10 (1-0-1-0)\nBent-Over Row – 12\nKettlebell Swing – 20\nPlank w/ Shoulder Tap – 20 taps\nRest 90s between rounds" },
        { week: "All Weeks", day: "Day 2", workout: "Tabata Inferno (20s work / 10s rest × 8 per station)", details: "Burpees\nJump Lunges\nDB Thrusters\nMountain Climbers\nRest 1 min between stations → Repeat Twice" },
        { week: "All Weeks", day: "Day 3", workout: "Outdoor Cardio", details: "Jog 5 min warm-up → 4 × (3 min hard run + 2 min walk) → 5 min cool-down\nKeep RPE 7–8 on run segments" },
        { week: "All Weeks", day: "Day 4", workout: "Lower Body Power & Core", details: "Barbell Deadlift – 4×6 @ 80% (3-1-1-0)\nWalking Lunge – 3×12/leg\nBox Jump – 3×8\nHanging Leg Raise – 3×15" },
        { week: "All Weeks", day: "Day 5", workout: "HIIT Bike + Core", details: "10× (30s sprint + 90s easy) → finish with:\nSide Plank 3×30s each\nAb Wheel 3×10" },
        { week: "All Weeks", day: "Day 6", workout: "Active Recovery", details: "Yoga / Mobility / Walk 45 min" },
        { week: "All Weeks", day: "Day 7", workout: "Rest", details: "Complete rest" }
      ]
    },
    "T-W003": {
      name: "Weight Loss Shred II",
      serialNumber: "T-W003",
      focus: "Weight Loss",
      difficulty: "Advanced",
      duration: "8 Weeks / 6 Training Days per Week",
      equipment: "Barbell, Dumbbells, Kettlebells, TRX, Bike, Row Erg, Treadmill, Bodyweight",
      imageUrl: fatFurnaceImg,
      description: "A challenging hybrid program that combines resistance training, cardio intervals, and athletic conditioning to keep metabolism elevated all day. It integrates running days, HIIT, and functional strength for constant variety and max engagement.",
      format: "Hybrid (Metabolic Training + Running + Tabata + Functional Circuits)",
      instructions: "Use tempo 1-0-1-0 for conditioning, 3-1-1-0 for strength. Overload by adding rounds (+1 each two weeks) or reducing rest (–10s every two weeks). Alternate high- and moderate-intensity days to avoid fatigue. Hydrate well and stretch after each session.",
      tips: ["Eat protein with every meal, limit refined carbs post-evening, and keep stress low", "Use music or outdoor locations for running sessions to prevent burnout"],
      exercises: [
        { week: "All Weeks", day: "Day 1", workout: "Full-Body MetCon (AMRAP 20 min)", details: "As many rounds as possible in 20 min of:\n10 Barbell Front Squats @ 60%\n10 Push-Ups\n10 Pull-Ups\n15 Kettlebell Swings\nRest as needed" },
        { week: "All Weeks", day: "Day 2", workout: "Interval Run", details: "Warm-Up 5 min → 8× (400m run fast + 200m walk) → Cool-Down 5 min\nMaintain RPE 8 on run segments" },
        { week: "All Weeks", day: "Day 3", workout: "Upper Body Strength + Tabata Finisher", details: "Strength Block:\nBench Press 4×8 @ 75% (3-1-1-0)\nBent-Over Row 4×10\nDB Shoulder Press 3×12\n\nTabata Finisher (20s on / 10s off × 8): Jump Rope + Burpees" },
        { week: "All Weeks", day: "Day 4", workout: "Active Recovery Run/Walk", details: "40–60 min continuous Zone 2 effort (RPE 6). Choose trail or treadmill" },
        { week: "All Weeks", day: "Day 5", workout: "Lower Body & Core Complex (4 Rounds)", details: "Deadlift – 6 @ 80%\nFront Rack Lunge – 10/leg\nBox Jump – 8\nHanging Knee Raise – 15\nRest 90s" },
        { week: "All Weeks", day: "Day 6", workout: "Metabolic Tabata Series", details: "Perform 4 Stations (20s work / 10s rest × 8):\nKettlebell Clean & Press\nBattle Rope Slams\nJump Lunges\nRow (Calories)\nRest 1 min between stations" },
        { week: "All Weeks", day: "Day 7", workout: "Rest or Light Stretching", details: "Complete rest or light stretching" }
      ]
    },
    "T-L001": {
      name: "Low Back Pain Rehab Strength",
      serialNumber: "T-L001",
      focus: "Low Back Pain",
      difficulty: "Intermediate",
      duration: "6 Weeks / 3 Days per Week",
      equipment: "Stability Ball, Resistance Bands, Cable Machine, Bodyweight",
      imageUrl: coreBuilderImg,
      description: "A controlled 6-week program for strengthening spinal stabilizers, improving posture, and reducing lower back discomfort. Includes anti-flexion, extension, and rotation exercises.",
      format: "Reps & Sets",
      instructions: "Tempo: 3-1-2-0. Focus on bracing and control. Progressive overload: increase resistance every 2 weeks only when pain-free. Rest 60s between sets.",
      tips: ["Avoid pain-producing ranges", "Prioritize neutral spine", "Focus on activation before load"],
      exercises: [
        { week: "All Weeks", day: "Day 1", workout: "Core Activation & Stability", details: "Dead Bug – 3x12\nBird Dog – 3x12/side\nGlute Bridge – 3x15\nPallof Press – 3x15\nSide Plank – 3x20s" },
        { week: "All Weeks", day: "Day 2", workout: "Lower Strength + Mobility", details: "Goblet Squat – 3x10\nStep-Up – 3x10/leg\nHamstring Curl (Stability Ball) – 3x12\nCat-Cow Stretch – 3x10" },
        { week: "All Weeks", day: "Day 3", workout: "Posterior Chain Focus", details: "Romanian Deadlift (light) – 3x10\nCable Pull-Through – 3x12\nSuperman Hold – 3x30s\nSeated Hip Stretch – 3x30s" },
        { week: "All Weeks", day: "Day 4-7", workout: "Rest or gentle walks", details: "Complete rest or gentle walking" }
      ]
    },
    "T-L002": {
      name: "Low Back Performance",
      serialNumber: "T-L002",
      focus: "Low Back Pain Prevention & Performance",
      difficulty: "Advanced",
      duration: "8 Weeks / 4 Days per Week",
      equipment: "Cable Machine, Dumbbells, Barbell, Stability Ball",
      imageUrl: lowBackPerformanceImg,
      description: "An advanced 8-week strength and stability program designed to reinforce the posterior chain and protect against re-injury. Enhances hip hinge strength and trunk stiffness.",
      format: "Reps & Sets",
      instructions: "Tempo: 3-1-1-0. Overload via gradual load increases (2.5% per 2 weeks). Prioritize quality movement over volume.",
      tips: ["Activate glutes before lifting", "Maintain braced core during all movements"],
      exercises: [
        { week: "All Weeks", day: "Day 1", workout: "Core & Mobility", details: "Plank – 3x30s\nDead Bug – 3x12\nGlute Bridge March – 3x15\nCat-Camel – 3x10" },
        { week: "All Weeks", day: "Day 2", workout: "Posterior Chain Strength", details: "Deadlift – 4x6 @60–70%\nReverse Hyper – 3x12\nDB Row – 3x10\nSide Plank Reach – 3x15" },
        { week: "All Weeks", day: "Day 3", workout: "Rest / Mobility Flow", details: "Complete rest or mobility work" },
        { week: "All Weeks", day: "Day 4", workout: "Functional Stability", details: "Single-Leg RDL – 3x10\nPallof Press Walkout – 3x12\nCable Rotation – 3x15\nFarmer Carry – 4x30m" },
        { week: "All Weeks", day: "Day 5", workout: "Active Core Recovery", details: "Bird Dog – 3x12\nStability Ball Rollout – 3x12\nGlute Activation Mini Band – 3x15" },
        { week: "All Weeks", day: "Day 6-7", workout: "Rest", details: "Complete rest days" }
      ]
    },
    "T-M001": {
      name: "Mobility & Stability Flow",
      serialNumber: "T-M001",
      focus: "Mobility & Stability",
      difficulty: "Intermediate",
      duration: "6 Weeks / 3 Days per Week",
      equipment: "Foam Roller, Bands, Bodyweight",
      imageUrl: flowMobilityImg,
      description: "A full-body mobility plan improving joint range, neuromuscular control, and posture. Great as a stand-alone or recovery adjunct.",
      format: "Reps & Sets",
      instructions: "Tempo: Controlled 3-2-2-0 on mobility drills. Overload: increase time-under-tension or add repetitions weekly.",
      tips: ["Perform barefoot or minimal footwear", "Prioritize breathing control during stretches"],
      exercises: [
        { week: "All Weeks", day: "Day 1", workout: "Lower Body Mobility", details: "Foam Roll Quads/Glutes – 5 min\n90/90 Hip Stretch – 3x30s\nDeep Squat Hold – 3x40s\nGlute Bridge – 3x12\nHamstring Sweep – 3x10" },
        { week: "All Weeks", day: "Day 2", workout: "Upper Body & Thoracic Flow", details: "Band Pull-Apart – 3x15\nT-Spine Rotation – 3x10\nWall Angels – 3x10\nShoulder CARs – 3x5/side" },
        { week: "All Weeks", day: "Day 3", workout: "Full Body Integration", details: "World's Greatest Stretch – 3x5/side\nBear Crawl – 3x20m\nDead Bug – 3x12\nCat-Camel – 3x10" },
        { week: "All Weeks", day: "Day 4-7", workout: "Rest or optional cardio", details: "Complete rest or optional light cardio" }
      ]
    },
    "T-M002": {
      name: "Mobility & Stability Master Flow",
      serialNumber: "T-M002",
      focus: "Mobility & Stability",
      difficulty: "Advanced",
      duration: "8 Weeks / 4 Days per Week",
      equipment: "Bands, TRX, Kettlebell, Foam Roller",
      imageUrl: mobilityMasterFlowImg,
      description: "An advanced 8-week flow for dynamic joint control, strength through range, and high-level body awareness. Integrates mobility under tension and stability challenges.",
      format: "Reps & Sets",
      instructions: "Tempo: 4-2-2-0. Progress overload via deeper range, longer holds, or added load. Rest 45s between drills.",
      tips: ["Maintain diaphragmatic breathing", "Smooth, controlled transitions between exercises"],
      exercises: [
        { week: "All Weeks", day: "Day 1", workout: "Mobility Strength (Hips & Shoulders)", details: "Cossack Squat – 3x10/side\nKettlebell Arm Bar – 3x8/side\nTRX Y-T-W – 3x12\nDeep Lunge Rotation – 3x5/side" },
        { week: "All Weeks", day: "Day 2", workout: "Core Stability Flow", details: "Dead Bug – 3x12\nPlank Shoulder Tap – 3x20\nSide Plank + Leg Raise – 3x10/side\nBird Dog Row – 3x10/side" },
        { week: "All Weeks", day: "Day 3", workout: "Dynamic Flow Session", details: "World's Greatest Stretch – 3x5/side\nKB Halo – 3x10\nCrawling Patterns – 3x20m\nWindmill – 3x10/side" },
        { week: "All Weeks", day: "Day 4", workout: "Full Body Integration", details: "Turkish Get-Up – 3x6/side\nJefferson Curl – 3x8\nSumo Deadlift to Upright Row – 3x10\nControlled Hip CARs – 3x6/side" },
        { week: "All Weeks", day: "Day 5-7", workout: "Rest / Optional Yoga", details: "Complete rest or optional yoga session" }
      ]
    },
    "T-F004": {
      name: "Functional Strength Foundations",
      serialNumber: "T-F004",
      focus: "Functional Strength",
      difficulty: "Intermediate",
      duration: "6 Weeks / 4 Training Days per Week",
      equipment: "Dumbbells, Kettlebells, Resistance Bands, Pull-Up Bar",
      imageUrl: functionalStrengthFoundationsImg,
      description: "This program develops functional strength for daily activities and athletic performance. Focused on multi-joint movements, core stability, and progressive overload, it improves overall power, coordination, and resilience.",
      format: "Circuit + Strength",
      instructions: "Use controlled tempo (2-0-1-0 for compound lifts, 1-0-1-0 for accessory). Progress overload weekly by increasing weight by 2–5% or adding 1–2 reps per set. Rest between strength exercises 90–120s, circuits 60s.",
      tips: ["Focus on movement quality over load", "Warm up thoroughly, engage core during all lifts", "Use proper footwear"],
      exercises: [
        { week: "All Weeks", day: "Day 1", workout: "Lower Body Push + Core", details: "Bulgarian Split Squat – 3x12 each leg, tempo 3-0-1-0, RIR 2\nGoblet Squat – 3x15, tempo 2-0-1-0, RIR 2\nPlank with Arm Reach – 3x30s\nMini-Band Lateral Walks – 3x20 steps" },
        { week: "All Weeks", day: "Day 2", workout: "Upper Body Push + Pull", details: "Push-Ups – 4x12, RIR 2\nDumbbell Row – 4x10 each arm, tempo 2-1-1-0\nShoulder Press – 3x12, tempo 2-0-1-0\nFace Pulls (Band) – 3x15" },
        { week: "All Weeks", day: "Day 3", workout: "Rest or Active Recovery", details: "Light cardio, mobility, or yoga" },
        { week: "All Weeks", day: "Day 4", workout: "Full Body Strength Circuit", details: "Kettlebell Deadlift – 3x12, tempo 2-1-1-0\nStep-Ups – 3x12 each leg\nPull-Ups (Assisted if needed) – 3x8\nRussian Twists – 3x20" },
        { week: "All Weeks", day: "Day 5-7", workout: "Rest or light activity", details: "Complete rest or light activity" }
      ]
    },
    "T-H004": {
      name: "Muscle Hypertrophy Build",
      serialNumber: "T-H004",
      focus: "Muscle Hypertrophy",
      difficulty: "Intermediate",
      duration: "6 Weeks / 4 Training Days",
      equipment: "Dumbbells, Barbell, Cable Machine, Bench",
      imageUrl: muscleHypertrophyBuildImg,
      description: "A 6-week hypertrophy plan targeting all major muscle groups using progressive overload principles. Focuses on time-under-tension and structured volume to stimulate muscle growth.",
      format: "Reps and Sets",
      instructions: "Tempo: 3-1-2-0 for compound lifts, 2-0-1-0 for isolation. Overload by increasing 2–5% load weekly or adding reps while maintaining form. Rest 60–90s between hypertrophy sets.",
      tips: ["Consume 1.6–2 g protein per kg bodyweight", "Maintain slight caloric surplus, and sleep 7–9 hours", "Creatine and whey protein can enhance results"],
      exercises: [
        { week: "All Weeks", day: "Day 1", workout: "Upper Body Push", details: "Barbell Bench Press – 4x8, tempo 3-1-2-0, RIR 1–2\nDumbbell Shoulder Press – 3x10, tempo 2-0-1-0\nIncline Dumbbell Fly – 3x12\nTricep Rope Pushdown – 3x15" },
        { week: "All Weeks", day: "Day 2", workout: "Lower Body Push", details: "Back Squat – 4x8, tempo 3-1-2-0, RIR 1–2\nBulgarian Split Squat – 3x10 each leg\nLeg Press – 3x12\nStanding Calf Raises – 4x15" },
        { week: "All Weeks", day: "Day 3", workout: "Rest or Active Recovery", details: "Complete rest or light activity" },
        { week: "All Weeks", day: "Day 4", workout: "Upper Body Pull", details: "Barbell Row – 4x8\nPull-Ups – 3x10\nDumbbell Bicep Curl – 3x12\nFace Pull – 3x15" },
        { week: "All Weeks", day: "Day 5", workout: "Lower Body Pull + Core", details: "Romanian Deadlift – 4x8\nHamstring Curl Machine – 3x12\nHanging Leg Raise – 3x12\nPlank – 3x40s" },
        { week: "All Weeks", day: "Day 6-7", workout: "Rest", details: "Complete rest days" }
      ]
    },
    "T-C003": {
      name: "Cardio Performance",
      serialNumber: "T-C003",
      focus: "Cardio",
      difficulty: "Intermediate",
      duration: "6 Weeks / 4 Training Days",
      equipment: "Treadmill, Rowing Machine, Bike, Jump Rope",
      imageUrl: cardioPerformanceImg,
      description: "Develops endurance, VO₂ max, and cardiovascular efficiency through a combination of interval training and steady-state conditioning.",
      format: "Interval + Steady-State",
      instructions: "Tempo: RPE 6–8 for intervals, 5–6 for steady-state. Increase duration by 5% weekly or increase intensity slightly. Rest 60–90s between intervals.",
      tips: ["Hydrate, sleep well, maintain carbohydrate intake to support energy", "Track HR zones for precision"],
      exercises: [
        { week: "All Weeks", day: "Day 1", workout: "Treadmill Intervals", details: "10x1 min fast / 1 min walk" },
        { week: "All Weeks", day: "Day 2", workout: "Bike Steady-State", details: "40 min moderate intensity" },
        { week: "All Weeks", day: "Day 3", workout: "Rest or Active Recovery", details: "Light cardio or rest" },
        { week: "All Weeks", day: "Day 4", workout: "Rowing Pyramid", details: "250m / 500m / 750m / 1000m / 750m / 500m / 250m, 60s rest" },
        { week: "All Weeks", day: "Day 5", workout: "Bodyweight Cardio Circuit (3 Rounds)", details: "Jump Rope – 1 min\nMountain Climbers – 40\nAir Squats – 20\nBurpees – 12" },
        { week: "All Weeks", day: "Day 6-7", workout: "Rest", details: "Complete rest days" }
      ]
    },
    "T-W004": {
      name: "Weight Loss Ignite Premium",
      serialNumber: "T-W004",
      focus: "Weight Loss",
      difficulty: "Intermediate",
      duration: "6 Weeks / 5 Training Days",
      equipment: "Dumbbells, Kettlebells, Bodyweight, Bands",
      imageUrl: weightLossIgniteImg,
      description: "Maximizes caloric expenditure while maintaining lean muscle using metabolic circuits, cardio intervals, and strength training.",
      format: "Circuit + HIIT",
      instructions: "Tempo: 1-0-1-0 for circuits. Overload by increasing rounds or weight progressively. Work:Rest ratio 40:20–60:30.",
      tips: ["Calorie deficit is key", "High-protein intake preserves muscle", "Sleep, stress management, and consistency are crucial"],
      exercises: [
        { week: "All Weeks", day: "Day 1", workout: "Full Body Circuit", details: "Goblet Squat – 15\nPush-Up – 12\nBent-Over Row – 12\nMountain Climbers – 40\nRest 90s, 3 Rounds" },
        { week: "All Weeks", day: "Day 2", workout: "HIIT Intervals", details: "Treadmill or Bike: 10x (30s sprint / 90s walk)" },
        { week: "All Weeks", day: "Day 3", workout: "Active Recovery", details: "Mobility & walk 30 min" },
        { week: "All Weeks", day: "Day 4", workout: "Lower Body Blast", details: "Kettlebell Swing – 20\nReverse Lunge – 10 each leg\nJump Squat – 15\n3 Rounds" },
        { week: "All Weeks", day: "Day 5", workout: "Upper Body + Core", details: "Dumbbell Bench Press – 3x12\nTRX Row – 3x12\nPlank – 3x40s\nSit-Ups – 3x20" },
        { week: "All Weeks", day: "Day 6-7", workout: "Rest", details: "Complete rest days" }
      ]
    },
    "T-L003": {
      name: "Low Back Pain Relief",
      serialNumber: "T-L003",
      focus: "Low Back Pain",
      difficulty: "Intermediate",
      duration: "6 Weeks / 3 Training Days",
      equipment: "Stability Ball, Bands, Bodyweight",
      imageUrl: lowBackPainReliefImg,
      description: "Strengthens spinal stabilizers, improves posture, and reduces lower back discomfort through controlled movements and core activation.",
      format: "Rehab + Strength",
      instructions: "Tempo: 3-1-2-0. Overload only when pain-free. Gradually increase reps or resistance every 2 weeks. Rest 60s between sets.",
      tips: ["Maintain neutral spine, avoid prolonged sitting", "Incorporate daily movement and mobility"],
      exercises: [
        { week: "All Weeks", day: "Day 1", workout: "Core Activation", details: "Dead Bug – 3x12\nBird Dog – 3x12/side\nGlute Bridge – 3x15\nPallof Press – 3x15" },
        { week: "All Weeks", day: "Day 2", workout: "Posterior Chain & Mobility", details: "Romanian Deadlift (light) – 3x10\nCable Pull-Through – 3x12\nSide Plank – 3x20s" },
        { week: "All Weeks", day: "Day 3", workout: "Stability & Recovery", details: "Cat-Cow – 3x10\nHip Flexor Stretch – 3x30s\nGlute Activation Mini Band – 3x15" },
        { week: "All Weeks", day: "Day 4-7", workout: "Rest / Light Activity", details: "Complete rest or light activity" }
      ]
    },
    "T-M003": {
      name: "Mobility & Stability Flow Premium",
      serialNumber: "T-M003",
      focus: "Mobility & Stability",
      difficulty: "Intermediate",
      duration: "6 Weeks / 3 Days per Week",
      equipment: "Foam Roller, Bands, Bodyweight",
      imageUrl: mobilityStabilityFlowImg,
      description: "Improves joint range of motion, neuromuscular control, and balance for better performance and injury prevention.",
      format: "Flow + Stability",
      instructions: "Tempo: 3-2-2-0. Overload by holding stretches longer or performing deeper ranges. Rest 45s–60s between drills.",
      tips: ["Move slowly, control breathing, and maintain good posture throughout", "Include barefoot or minimal footwear training for better proprioception"],
      exercises: [
        { week: "All Weeks", day: "Day 1", workout: "Lower Body", details: "Foam Roll Quads/Glutes – 5 min\n90/90 Hip Stretch – 3x30s\nDeep Squat Hold – 3x40s\nGlute Bridge – 3x12" },
        { week: "All Weeks", day: "Day 2", workout: "Upper Body", details: "Band Pull-Apart – 3x15\nT-Spine Rotation – 3x10\nWall Angels – 3x10\nShoulder CARs – 3x5/side" },
        { week: "All Weeks", day: "Day 3", workout: "Full Body Flow", details: "World's Greatest Stretch – 3x5/side\nBear Crawl – 3x20m\nDead Bug – 3x12\nCat-Camel – 3x10" },
        { week: "All Weeks", day: "Day 4-7", workout: "Rest / Optional Yoga or Cardio", details: "Complete rest or optional light activity" }
      ]
    }
  };

  // Use database program if available, otherwise fall back to hardcoded data
  let program: any = null;
  
  if (dbProgram) {
    // Convert database format to expected format
    program = {
      name: dbProgram.name,
      serialNumber: id || '',
      focus: dbProgram.category,
      difficulty: dbProgram.target_audience?.split('\n')[0]?.replace('Difficulty:', '').trim() || 'Intermediate',
      duration: dbProgram.duration || '6 Weeks',
      equipment: dbProgram.target_audience?.split('\n')[1]?.replace('Equipment:', '').trim() || 'Various',
      imageUrl: dbProgram.image_url || '',
      description: dbProgram.description || '',
      format: dbProgram.program_structure || '',
      instructions: dbProgram.progression_plan || '',
      exercises: dbProgram.weekly_schedule?.split('\n\n').map((ex: string) => {
        const [week, details] = ex.split(':');
        const [weekNum, day] = week.split(' - ');
        return {
          week: weekNum || '',
          day: day || '',
          workout: details?.split('\n')[0] || '',
          details: details?.split('\n').slice(1).join('\n') || ''
        };
      }) || [],
      tips: dbProgram.overview?.split('\n') || []
    };
  } else {
    // Fall back to hardcoded data
    program = programData[id || ""];
  }

  if (isLoadingDb) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">Loading program...</div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8">
          <p className="text-center">Training program not found</p>
          <Button onClick={() => navigate("/trainingprogram")} className="mt-4">
            Back to Programs
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{program.name} - {program.duration} Training Program Cyprus | {program.difficulty} {program.focus} Plan | Haris Falas | smartygym.com</title>
        <meta name="description" content={`${program.name} - ${program.description} ${program.duration} ${program.focus} program. Progressive strength training, functional fitness, periodized workout plan by Sports Scientist Haris Falas at Smarty Gym Cyprus (smartygym.com). Structured ${program.difficulty} level ${program.equipment === 'bodyweight' ? 'bodyweight' : 'equipment'} training with ${program.format} format.`} />
        <meta name="keywords" content={`${program.name}, ${program.duration} program, ${program.focus} training, structured workout plan, progressive overload, periodization training Cyprus, strength program Cyprus, functional fitness program, training program Cyprus, ${program.equipment} training, ${program.difficulty} program, muscle building program Cyprus, endurance training Cyprus, performance program Cyprus, hypertrophy training Cyprus, cardio program Cyprus, weight loss program Cyprus, online training program Cyprus, fitness coaching Cyprus, Haris Falas Cyprus, Sports Scientist Cyprus, Smarty Gym, smartygym.com, online fitness Cyprus, personal training Cyprus, strength and conditioning Cyprus, workout periodization, training split, training mesocycle, progressive training Cyprus, structured fitness Cyprus`} />
        
        <meta property="og:title" content={`${program.name} - ${program.duration} Structured Training Program`} />
        <meta property="og:description" content={`${program.description} ${program.duration} ${program.focus} program by Haris Falas at Smarty Gym Cyprus`} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://smartygym.com/trainingprogram/${type}/${id}`} />
        <meta property="og:image" content={program.imageUrl} />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${program.name} - ${program.duration} Training Program | Smarty Gym Cyprus`} />
        <meta name="twitter:description" content={`${program.duration} ${program.focus} program by Sports Scientist Haris Falas`} />
        <meta name="twitter:image" content={program.imageUrl} />
        
        <link rel="canonical" href={`https://smartygym.com/trainingprogram/${type}/${id}`} />
        
        {/* Structured Data - Exercise Program */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Course",
            "name": program.name,
            "description": program.description,
            "image": program.imageUrl,
            "timeRequired": program.duration,
            "courseCode": program.serialNumber,
            "hasCourseInstance": {
              "@type": "CourseInstance",
              "courseMode": "online",
              "courseWorkload": program.duration
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
            "keywords": `${program.focus}, ${program.duration}, ${program.difficulty} training, structured program, periodization, Cyprus fitness, online training, Haris Falas Sports Scientist, progressive overload, training split`
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/trainingprogram/${type}`)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span className="text-xs sm:text-sm">Back</span>
            </Button>
            <CommentDialog
              programId={id}
              programName={program.name}
              programType={type}
            />
          </div>

          <AccessGate requireAuth={true} requirePremium={!isFreeProgram} contentType="program">
            {/* Use WorkoutDisplay component with all functionality */}
            <WorkoutDisplay
            exercises={[
              { name: "Exercise Demo", video_id: "dQw4w9WgXcQ", video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }
            ]}
            planContent=""
            title={program.name}
            serial={program.serialNumber}
            focus={program.focus}
            difficulty={program.difficulty === "Beginner" ? 1 : program.difficulty === "Intermediate" ? 3 : 5}
            imageUrl={program.imageUrl}
            duration={program.duration}
            equipment={program.equipment}
            description={program.description}
            format={program.format}
            instructions={program.instructions}
            tips={program.tips.join('\n')}
            programWeeks={[{
              week: 1,
              focus: "Training Program",
              days: program.exercises.map(ex => ({
                day: `${ex.week} - ${ex.day}`,
                exercises: [{
                  name: ex.workout,
                  sets: "See details",
                  reps: ex.details,
                  intensity: "As prescribed",
                  rest: "As needed"
                }]
              }))
            }]}
            programId={id}
            programType={type || ''}
            isFreeContent={isFreeProgram}
          />
          </AccessGate>
        </div>
      </div>
    </>
  );
};

export default IndividualTrainingProgram;
