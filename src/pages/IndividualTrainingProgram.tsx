import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { WorkoutDisplay } from "@/components/WorkoutDisplay";
import { AccessGate } from "@/components/AccessGate";
import cardioEnduranceImg from "@/assets/cardio-endurance-program.jpg";
import functionalStrengthImg from "@/assets/functional-strength-program.jpg";
import muscleHypertrophyImg from "@/assets/muscle-hypertrophy-program.jpg";
import powerFoundationImg from "@/assets/power-foundation-workout.jpg";
import ironCoreStrengthImg from "@/assets/iron-core-strength-workout.jpg";
import cardioPowerIntervalsImg from "@/assets/cardio-power-intervals-workout.jpg";
import metabolicBurnImg from "@/assets/metabolic-burn-workout.jpg";
import fatFurnaceImg from "@/assets/fat-furnace-workout.jpg";
import coreBuilderImg from "@/assets/core-builder-workout.jpg";
import stabilityCircuitImg from "@/assets/stability-circuit-workout.jpg";
import flowMobilityImg from "@/assets/flow-mobility-workout.jpg";
import mobilityMasteryImg from "@/assets/mobility-mastery-workout.jpg";

const IndividualTrainingProgram = () => {
  const navigate = useNavigate();
  const { type, id } = useParams();

  // Weight Loss Ignite (T-W001) is FREE for testing
  const freePrograms: string[] = ["T-W001"];
  const isFreeProgram = id === "T-W001" || freePrograms.includes(id || '');

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
      name: "Functional Strength Elite",
      serialNumber: "T-F002",
      focus: "Functional Strength",
      difficulty: "Advanced",
      duration: "8 Weeks / 5 Training Days per Week",
      equipment: "Barbell, Dumbbells, Kettlebells, TRX, Weighted Vest",
      imageUrl: powerFoundationImg,
      description: "An advanced 8-week program focused on multi-plane compound lifts, explosive power integration, and heavy load tolerance. Designed to build maximum strength with functional carryover.",
      format: "Reps & Sets",
      instructions: "Use structured progressive overload: Weeks 1–4: Build volume (70–80% 1RM), Weeks 5–8: Increase intensity (80–90% 1RM). Tempo: 3-1-1-0 for strength, 1-0-1-0 for power. Rest 2–3 min between compound lifts, 60–90s on accessories.",
      tips: ["Maintain braced core and neutral spine", "Track every session", "Prioritize recovery with adequate sleep and hydration"],
      exercises: [
        { week: "All Weeks", day: "Day 1", workout: "Squat Strength", details: "Back Squat – 5x5 @80% 1RM\nFront Squat – 3x6 @70%\nWalking Lunge – 3x10/leg\nCore: Weighted Plank – 3x30s" },
        { week: "All Weeks", day: "Day 2", workout: "Push Strength", details: "Bench Press – 5x5 @80%\nStanding Overhead Press – 4x6\nDB Floor Press – 3x10\nDips – 3x12" },
        { week: "All Weeks", day: "Day 3", workout: "Pull Strength", details: "Deadlift – 5x4 @85%\nBarbell Row – 4x8 @75%\nPull-Ups (weighted) – 3x10\nFace Pulls – 3x15" },
        { week: "All Weeks", day: "Day 4", workout: "Power & Stability", details: "Hang Power Clean – 4x4 @70%\nBox Jumps – 3x8\nTRX Y-T-W – 3x15\nFarmer Carry – 4x40m" },
        { week: "All Weeks", day: "Day 5", workout: "Core & Conditioning", details: "Anti-Rotation Cable Press – 3x12\nKB Swings – 4x20\nAb Wheel – 3x10\nSprint Intervals – 8x20s on / 40s off" },
        { week: "All Weeks", day: "Day 6-7", workout: "Rest / Active Recovery", details: "Complete rest or light active recovery" }
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
      name: "Muscle Hypertrophy Pro",
      serialNumber: "T-H002",
      focus: "Hypertrophy",
      difficulty: "Advanced",
      duration: "8 Weeks / 6 Training Days",
      equipment: "Full Gym Setup",
      imageUrl: ironCoreStrengthImg,
      description: "An 8-week advanced hypertrophy system emphasizing metabolic stress, mechanical tension, and progressive overload with high-volume intensity techniques (drop sets, supersets, rest–pause).",
      format: "Reps & Sets",
      instructions: "Weeks 1–4: Volume phase (10–12 reps @70%), Weeks 5–8: Intensity phase (6–8 reps @80%). Tempo: 3-1-1-0. Rest: 60–90s on isolation, 120s on compounds.",
      tips: ["Train close to failure with control", "Use supersets efficiently", "Don't skip deload at week 8 if fatigue accumulates"],
      exercises: [
        { week: "All Weeks", day: "Day 1", workout: "Chest", details: "Flat Bench – 5x8\nIncline DB Press – 4x10\nCable Fly – 3x15\nDips – 3xAMRAP" },
        { week: "All Weeks", day: "Day 2", workout: "Back", details: "Deadlift – 5x5 @80%\nPull-Up – 4x10\nT-Bar Row – 3x12\nFace Pull – 3x15" },
        { week: "All Weeks", day: "Day 3", workout: "Legs", details: "Back Squat – 5x6\nLeg Press – 4x12\nLeg Curl – 3x15\nCalf Raise – 4x20" },
        { week: "All Weeks", day: "Day 4", workout: "Shoulders", details: "Seated Overhead Press – 4x10\nUpright Row – 3x12\nLateral Raise – 3x15\nRear Delt Fly – 3x15" },
        { week: "All Weeks", day: "Day 5", workout: "Arms", details: "Close Grip Bench Press – 4x10\nBarbell Curl – 4x10\nSkull Crusher – 3x12\nIncline DB Curl – 3x12" },
        { week: "All Weeks", day: "Day 6", workout: "Conditioning / Core", details: "Weighted Plank – 3x40s\nHanging Leg Raise – 3x12\nRope Slam – 4x20s\nSled Push – 5x20m" },
        { week: "All Weeks", day: "Day 7", workout: "Rest", details: "Complete rest" }
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
      imageUrl: cardioPowerIntervalsImg,
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
      name: "Weight Loss Elite",
      serialNumber: "T-W002",
      focus: "Weight Loss",
      difficulty: "Advanced",
      duration: "8 Weeks / 5–6 Days per Week",
      equipment: "Kettlebells, Dumbbells, Barbell, Rower, Bike",
      imageUrl: fatFurnaceImg,
      description: "An aggressive fat-loss regimen focused on metabolic conditioning, resistance circuits, and athletic HIIT. Ideal for advanced trainees aiming to strip fat while maintaining lean muscle.",
      format: "Reps & Sets",
      instructions: "Tempo varies by component: Strength: 3-1-1-0, Conditioning: 1-0-1-0. Progressive overload via density (more rounds same time). Use RPE 8–9 in conditioning blocks.",
      tips: ["Track resting heart rate and recovery", "Prioritize nutrition and hydration", "Avoid overtraining"],
      exercises: [
        { week: "All Weeks", day: "Day 1", workout: "MetCon Strength", details: "Circuit x4 Rounds:\nFront Squat – 10\nPush Press – 10\nDeadlift – 10\nRow (Calorie) – 10\nRest: 2 min" },
        { week: "All Weeks", day: "Day 2", workout: "Sprint & Core", details: "10x100m sprints / 60s rest\nAb Circuit: 3x (Plank 40s + Leg Raise 15 + Sit-Ups 20)" },
        { week: "All Weeks", day: "Day 3", workout: "Rest / Mobility Flow", details: "Complete rest or mobility work" },
        { week: "All Weeks", day: "Day 4", workout: "Full Body Complex", details: "4 Rounds:\nClean – 5\nFront Squat – 5\nPush Press – 5\nDeadlift – 5\nRest: 2 min" },
        { week: "All Weeks", day: "Day 5", workout: "Conditioning Ladder", details: "10-9-8-7-6-5-4-3-2-1 Reps of:\nBurpees\nKB Swings\nGoblet Squats" },
        { week: "All Weeks", day: "Day 6", workout: "Long Duration Cardio", details: "45–60 min continuous work (Bike, Run, or Row) @ Zone 3" },
        { week: "All Weeks", day: "Day 7", workout: "Rest", details: "Complete rest" }
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
      imageUrl: stabilityCircuitImg,
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
      imageUrl: mobilityMasteryImg,
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
    }
  };

  const program = programData[id || ""];

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
        <title>{program.name} - {program.duration} Training Program Cyprus | Haris Falas | smartygym.com</title>
        <meta name="description" content={`${program.name} - ${program.description} ${program.duration} ${program.focus} program. Progressive strength training, functional fitness, structured workout plan by Sports Scientist Haris Falas at smartygym.com Cyprus`} />
        <meta name="keywords" content={`${program.name}, ${program.duration} program, ${program.focus} training, structured workout plan, progressive overload, strength program Cyprus, functional fitness program, training program, ${program.equipment}, ${program.difficulty} program, Haris Falas Cyprus, Smarty Gym, smartygym.com, online training Cyprus, periodization, muscle building, endurance training, performance program, sports science Cyprus`} />
        
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
            "keywords": `${program.focus}, ${program.duration}, structured training, Cyprus fitness program`
          })}
        </script>
      </Helmet>

      <AccessGate requireAuth={true} requirePremium={true} contentType="program">
        <div className="min-h-screen bg-background">
          <div className="container mx-auto max-w-4xl px-4 py-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/trainingprogram/${type}`)}
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
          />
        </div>
      </div>
      </AccessGate>
    </>
  );
};

export default IndividualTrainingProgram;
