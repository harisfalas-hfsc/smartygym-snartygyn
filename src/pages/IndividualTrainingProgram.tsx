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

const IndividualTrainingProgram = () => {
  const navigate = useNavigate();
  const { type, id } = useParams();

  // Only specific programs are free
  const freePrograms = ['cardio-001']; // Cardio Endurance Builder
  const isFreeProgram = freePrograms.includes(id || '');

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
    "cardio-001": {
      name: "Cardio Endurance Builder",
      serialNumber: "CP-001",
      focus: "Cardio",
      difficulty: "Beginner",
      duration: "4 weeks",
      equipment: "No Equipment Required",
      imageUrl: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=800&h=600&fit=crop",
      description:
        "A progressive 4-week cardio program designed to build cardiovascular endurance from the ground up. Perfect for beginners looking to establish a solid aerobic base and improve overall fitness.",
      format: `Progressive Cardio Training
Structure: 4 weeks, 4 sessions per week
Intensity: Gradually increasing from 60% to 75% max HR
Duration: 20-40 minutes per session

Week 1-2: Foundation building
Week 3-4: Endurance development`,
      instructions:
        "Start each session with a 5-minute warm-up. Monitor your heart rate to stay within target zones. Progress gradually and listen to your body. Rest days are crucial for recovery.",
      exercises: [
        {
          week: "Week 1",
          day: "Day 1",
          workout: "Easy Pace Cardio",
          details: "20 min at 60% max HR - Walking or light jogging",
        },
        {
          week: "Week 1",
          day: "Day 2",
          workout: "Interval Introduction",
          details: "5 rounds: 2 min moderate / 2 min easy",
        },
        {
          week: "Week 1",
          day: "Day 3",
          workout: "Steady State",
          details: "25 min at 65% max HR - Consistent pace",
        },
        {
          week: "Week 1",
          day: "Day 4",
          workout: "Recovery Cardio",
          details: "20 min at 60% max HR - Easy movement",
        },
        {
          week: "Week 2",
          day: "Day 1",
          workout: "Moderate Pace",
          details: "25 min at 65% max HR - Comfortable pace",
        },
        {
          week: "Week 2",
          day: "Day 2",
          workout: "Interval Training",
          details: "6 rounds: 2 min moderate / 1.5 min easy",
        },
        {
          week: "Week 2",
          day: "Day 3",
          workout: "Steady State",
          details: "30 min at 65% max HR - Maintain rhythm",
        },
        {
          week: "Week 2",
          day: "Day 4",
          workout: "Active Recovery",
          details: "25 min at 60% max HR - Light activity",
        },
        {
          week: "Week 3",
          day: "Day 1",
          workout: "Tempo Run",
          details: "30 min at 70% max HR - Challenging but sustainable",
        },
        {
          week: "Week 3",
          day: "Day 2",
          workout: "Interval Training",
          details: "8 rounds: 2 min hard / 1 min easy",
        },
        {
          week: "Week 3",
          day: "Day 3",
          workout: "Long Steady State",
          details: "35 min at 65-70% max HR - Build endurance",
        },
        {
          week: "Week 3",
          day: "Day 4",
          workout: "Recovery Session",
          details: "25 min at 60% max HR - Easy pace",
        },
        {
          week: "Week 4",
          day: "Day 1",
          workout: "Tempo Challenge",
          details: "35 min at 70-75% max HR - Push your limits",
        },
        {
          week: "Week 4",
          day: "Day 2",
          workout: "Peak Intervals",
          details: "10 rounds: 2 min hard / 1 min easy",
        },
        {
          week: "Week 4",
          day: "Day 3",
          workout: "Endurance Test",
          details: "40 min at 70% max HR - Longest session",
        },
        {
          week: "Week 4",
          day: "Day 4",
          workout: "Cool Down Week",
          details: "30 min at 65% max HR - Celebrate progress",
        },
      ],
      tips: [
        "Always warm up for 5 minutes before starting",
        "Stay hydrated throughout your training",
        "Monitor your heart rate to ensure proper intensity",
        "Take rest days seriously for optimal recovery",
        "Progress gradually - don't rush the process",
        "Listen to your body and adjust as needed",
        "Maintain consistent training schedule",
      ],
    },
    "functional-001": {
      name: "Functional Power Program",
      serialNumber: "FP-001",
      focus: "Functional Strength",
      difficulty: "Intermediate",
      duration: "6 weeks",
      equipment: "Equipment Required",
      imageUrl: "https://images.unsplash.com/photo-1598971861713-54ad16a5c72e?w=800&h=600&fit=crop",
      description:
        "A comprehensive 6-week program focused on building functional strength through compound movements and athletic exercises. Develops power, coordination, and real-world strength.",
      format: `Functional Strength Training
Structure: 6 weeks, 4 sessions per week
Focus: Compound movements, power development
Equipment: Barbells, dumbbells, kettlebells

Week 1-2: Foundation and technique
Week 3-4: Power development
Week 5-6: Peak performance`,
      instructions:
        "Focus on movement quality over weight. Master the technique before adding load. Rest 2-3 minutes between sets for optimal power output.",
      exercises: [
        {
          week: "Week 1",
          day: "Day 1",
          workout: "Lower Body Power",
          details: "Squats – 4×8\nDeadlifts – 3×6\nLunges – 3×10 each leg",
        },
        {
          week: "Week 1",
          day: "Day 2",
          workout: "Upper Body Push",
          details: "Bench Press – 4×8\nOverhead Press – 3×8\nDips – 3×10",
        },
        {
          week: "Week 1",
          day: "Day 3",
          workout: "Full Body Power",
          details: "Power Cleans – 5×5\nFront Squats – 3×6\nPush Press – 3×8",
        },
        {
          week: "Week 1",
          day: "Day 4",
          workout: "Upper Body Pull",
          details: "Pull-ups – 4×8\nRows – 4×8\nFace Pulls – 3×12",
        },
      ],
      tips: [
        "Master technique before increasing weight",
        "Focus on explosive movements with control",
        "Maintain proper breathing throughout",
        "Use appropriate weight for prescribed reps",
        "Rest adequately between training days",
        "Track your progress weekly",
      ],
    },
    "hypertrophy-001": {
      name: "Mass Builder Program",
      serialNumber: "MH-001",
      focus: "Muscle Hypertrophy",
      difficulty: "Intermediate",
      duration: "8 weeks",
      equipment: "Equipment Required",
      imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&h=600&fit=crop",
      description:
        "An intensive 8-week muscle hypertrophy program designed to maximize muscle growth through progressive overload and volume training. Structured for serious muscle building.",
      format: `Hypertrophy Training Protocol
Structure: 8 weeks, 5 sessions per week
Volume: High volume with moderate intensity
Rest: 60-90 seconds between sets

Week 1-3: Volume accumulation
Week 4: Deload
Week 5-7: Intensification
Week 8: Peak`,
      instructions:
        "Focus on time under tension and muscle contraction. Control the eccentric phase and squeeze at peak contraction. Nutrition and recovery are crucial for growth.",
      exercises: [
        {
          week: "Week 1",
          day: "Day 1",
          workout: "Chest & Triceps",
          details: "Bench Press – 4×10\nIncline DB Press – 4×12\nCable Flyes – 3×15\nTricep Extensions – 4×12",
        },
        {
          week: "Week 1",
          day: "Day 2",
          workout: "Back & Biceps",
          details: "Deadlifts – 4×8\nPull-ups – 4×10\nRows – 4×12\nBicep Curls – 4×12",
        },
        {
          week: "Week 1",
          day: "Day 3",
          workout: "Legs",
          details: "Squats – 4×10\nLeg Press – 4×12\nLeg Curls – 4×12\nCalf Raises – 4×15",
        },
        {
          week: "Week 1",
          day: "Day 4",
          workout: "Shoulders & Abs",
          details: "Overhead Press – 4×10\nLateral Raises – 4×12\nRear Delts – 4×12\nAb Circuit",
        },
        {
          week: "Week 1",
          day: "Day 5",
          workout: "Full Body Pump",
          details: "Compound movements – 3×12 each\nFocus on muscle connection",
        },
      ],
      tips: [
        "Eat in a caloric surplus for muscle growth",
        "Get 7-9 hours of sleep nightly",
        "Focus on progressive overload",
        "Maintain strict form throughout",
        "Stay consistent with training schedule",
        "Track your lifts and measurements",
        "Consider supplementation if needed",
      ],
    },
    "weightloss-001": {
      name: "Fat Loss Transform",
      serialNumber: "WL-001",
      focus: "Weight Loss",
      difficulty: "Beginner",
      duration: "6 weeks",
      equipment: "No Equipment Required",
      imageUrl: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&h=600&fit=crop",
      description:
        "A 6-week fat loss program combining cardio and bodyweight strength training. Designed to create a caloric deficit while preserving muscle mass through strategic exercise selection.",
      format: `Fat Loss Training Protocol
Structure: 6 weeks, 5 sessions per week
Mix: Cardio + Strength circuits
Intensity: Moderate to high

Week 1-2: Adaptation phase
Week 3-4: Acceleration phase
Week 5-6: Transformation phase`,
      instructions:
        "Combine this program with a moderate caloric deficit. Stay consistent with training and nutrition. Track your progress weekly through measurements and photos.",
      exercises: [
        {
          week: "Week 1",
          day: "Day 1",
          workout: "Full Body Circuit",
          details: "4 rounds:\nSquats – 45s\nPush-ups – 45s\nLunges – 45s\nPlank – 45s",
        },
        {
          week: "Week 1",
          day: "Day 2",
          workout: "Cardio Intervals",
          details: "30 min total\n2 min moderate\n1 min high intensity\nRepeat",
        },
        {
          week: "Week 1",
          day: "Day 3",
          workout: "Lower Body Focus",
          details: "Jump Squats – 4 sets\nLunges – 4 sets\nGlute Bridges – 4 sets",
        },
        {
          week: "Week 1",
          day: "Day 4",
          workout: "HIIT Session",
          details: "20 min total:\nBurpees\nMountain Climbers\nHigh Knees",
        },
        {
          week: "Week 1",
          day: "Day 5",
          workout: "Active Recovery",
          details: "30 min steady state cardio\nStretching routine",
        },
      ],
      tips: [
        "Maintain a moderate caloric deficit",
        "Prioritize protein intake",
        "Stay hydrated throughout the day",
        "Get adequate sleep for recovery",
        "Track your food intake",
        "Be patient with the process",
        "Combine with healthy nutrition",
      ],
    },
    "backcare-001": {
      name: "Back Rehabilitation Program",
      serialNumber: "BC-001",
      focus: "Back Care",
      difficulty: "Beginner",
      duration: "4 weeks",
      equipment: "No Equipment Required",
      imageUrl: "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=800&h=600&fit=crop",
      description:
        "A gentle 4-week program designed to alleviate low back pain through targeted exercises, stretches, and core strengthening. Focus on proper movement patterns and pain-free mobility.",
      format: `Therapeutic Exercise Program
Structure: 4 weeks, daily practice
Duration: 15-20 minutes per session
Focus: Pain relief, mobility, core stability

Week 1: Pain management
Week 2-3: Mobility restoration
Week 4: Strength building`,
      instructions:
        "Never push through sharp pain. All movements should be pain-free or cause only mild discomfort. Progress slowly and consistently. Consult healthcare provider if pain persists.",
      exercises: [
        {
          week: "Week 1",
          day: "Daily",
          workout: "Gentle Mobility",
          details: "Cat-Cow – 2×10\nKnee to Chest – 2×30s each\nPelvic Tilts – 2×15",
        },
        {
          week: "Week 2",
          day: "Daily",
          workout: "Core Activation",
          details: "Dead Bug – 3×10\nBird Dog – 3×10 each\nBridges – 3×12",
        },
        {
          week: "Week 3",
          day: "Daily",
          workout: "Strength Building",
          details: "Planks – 3×20s\nSide Planks – 3×15s each\nSuperman – 3×10",
        },
        {
          week: "Week 4",
          day: "Daily",
          workout: "Integration",
          details: "Full routine combining all previous exercises",
        },
      ],
      tips: [
        "Never force movements that cause pain",
        "Practice daily for best results",
        "Focus on quality over quantity",
        "Breathe deeply throughout exercises",
        "Maintain neutral spine position",
        "Progress gradually and patiently",
        "Consult doctor if pain worsens",
      ],
    },
    "mobility-001": {
      name: "Mobility Mastery Program",
      serialNumber: "MM-001",
      focus: "Mobility & Stability",
      difficulty: "Beginner",
      duration: "4 weeks",
      equipment: "No Equipment Required",
      imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop",
      description:
        "A 4-week progressive mobility program to enhance flexibility, joint health, and movement quality. Suitable for all fitness levels looking to improve range of motion and reduce stiffness.",
      format: `Mobility Enhancement Protocol
Structure: 4 weeks, 5 sessions per week
Duration: 20-30 minutes per session
Focus: Joint mobility, flexibility, movement quality

Week 1: Foundation
Week 2-3: Development
Week 4: Mastery`,
      instructions:
        "Move slowly and mindfully through each position. Focus on breathing and relaxation. Never force stretches. Consistency is key for lasting improvements.",
      exercises: [
        {
          week: "Week 1",
          day: "Day 1-5",
          workout: "Full Body Flow",
          details: "Cat-Cow\nWorld's Greatest Stretch\nHip Circles\nShoulder Rolls",
        },
        {
          week: "Week 2",
          day: "Day 1-5",
          workout: "Lower Body Focus",
          details: "Deep Squat Holds\nHip Flexor Stretches\nHamstring Flows",
        },
        {
          week: "Week 3",
          day: "Day 1-5",
          workout: "Upper Body Focus",
          details: "Shoulder Mobility\nThoracic Rotations\nNeck Stretches",
        },
        {
          week: "Week 4",
          day: "Day 1-5",
          workout: "Integration Flow",
          details: "Complete mobility sequence combining all movements",
        },
      ],
      tips: [
        "Practice consistently for best results",
        "Never stretch to the point of pain",
        "Breathe deeply throughout",
        "Move slowly and with control",
        "Be patient with progress",
        "Listen to your body",
        "Make it a daily habit",
      ],
    },
    "cardio-cg-001": {
      name: "Cardio Endurance & Heart Longevity",
      serialNumber: "CG-001",
      focus: "Cardio",
      difficulty: "Beginner to Intermediate",
      duration: "6 weeks",
      equipment: "Optional (jump rope, treadmill, bike, mat, timer)",
      imageUrl: cardioEnduranceImg,
      description:
        "A progressive cardio plan designed to improve aerobic capacity, heart health, and stamina through steady-state, interval, and tempo-based training.",
      format: `Progressive Cardio Training
Structure: 4 training days/week
Intensity: RPE-based (Rate of Perceived Exertion)
Weekly progression in duration and intensity

RPE 6–7 = moderate effort
RPE 8–9 = high effort`,
      instructions:
        "Warm-up and cooldown are mandatory. Use a timer for intervals. RPE 6–7 = moderate effort, RPE 8–9 = high effort. Track heart rate if possible.",
      exercises: [
        {
          week: "Week 1–2",
          day: "Day 1",
          workout: "Steady-State Cardio",
          details: "5-min warm-up\n20-min continuous cardio @ RPE 6\n5-min cooldown",
        },
        {
          week: "Week 1–2",
          day: "Day 2",
          workout: "Intervals",
          details: "5-min warm-up\n4 rounds:\n  2 min @ RPE 6\n  1 min @ RPE 8\n5-min cooldown",
        },
        {
          week: "Week 1–2",
          day: "Day 4",
          workout: "Cardio Circuit",
          details: "3 rounds:\n  Mountain climbers – 30s\n  Jumping jacks – 30s\n  Rest – 30s\nPlank Hold – 3×30s\nDead Bug – 3×10 per side",
        },
        {
          week: "Week 1–2",
          day: "Day 5",
          workout: "Tempo Cardio",
          details: "5-min warm-up\n25-min cardio @ RPE 7\n5-min cooldown",
        },
        {
          week: "Week 3–4",
          day: "Progression",
          workout: "Increased Duration",
          details: "Increase duration by 5–10 min • Add 1–2 rounds to intervals • RPE 7–8",
        },
        {
          week: "Week 5–6",
          day: "Progression",
          workout: "Increased Intensity",
          details: "Increase intensity (RPE 8–9) • Add sprint intervals or incline work • Maintain recovery strategies",
        },
      ],
      tips: [
        "Choose cardio modes you enjoy",
        "Track heart rate if possible",
        "Stay hydrated and wear breathable gear",
        "Warm-up and cooldown are mandatory",
        "Progress gradually each week",
        "Rest and recovery are essential",
      ],
    },
    "functional-fs-002": {
      name: "Functional Strength & Movement Control",
      serialNumber: "FS-002",
      focus: "Functional Strength",
      difficulty: "Intermediate",
      duration: "6 weeks",
      equipment: "Required (barbell, dumbbells, kettlebell, bench, pull-up bar, bands)",
      imageUrl: functionalStrengthImg,
      description:
        "A strength-focused plan using compound lifts and movement patterns that enhance real-life performance, stability, and injury prevention.",
      format: `Full-Body Functional Training
Structure: 3 training days/week
Progressive overload every 2 weeks
Tempo: 2 sec up / 3 sec down
Rest: 90–120 sec between sets`,
      instructions:
        "Use %1RM for compound lifts. Tempo: 2 sec up / 3 sec down. Rest: 90–120 sec between sets. Prioritize form and control over weight.",
      exercises: [
        {
          week: "Week 1–2",
          day: "Day 1",
          workout: "Lower Body Function (65–70% 1RM, 10 reps)",
          details: "Back Squat – 4×10\nBulgarian Split Squat – 3×12 each leg\nKettlebell Swing – 3×15\nPlank Hold – 3×30s",
        },
        {
          week: "Week 1–2",
          day: "Day 2",
          workout: "Upper Body Function (65–70% 1RM, 10 reps)",
          details: "Pull-Ups – 4 sets to near-failure\nDumbbell Overhead Press – 3×12\nBent Over Row – 3×10\nDead Bug – 3×10 per side",
        },
        {
          week: "Week 1–2",
          day: "Day 3",
          workout: "Full Body Circuit",
          details: "Goblet Squat – 3×12\nDumbbell Bench Press – 3×12\nOne-Leg RDL – 3×10 each leg\nBand Face Pulls – 3×15\nMobility Flow – 10 min",
        },
        {
          week: "Week 3–4",
          day: "Progression",
          workout: "Increased Load (75–80% 1RM, 8 reps)",
          details: "Add 1 set to compound lifts\nIncrease load\nRest: 90–120 sec",
        },
        {
          week: "Week 5–6",
          day: "Progression",
          workout: "Peak Strength (85% 1RM, 6 reps)",
          details: "Focus on tempo (3 sec eccentric)\nMaintain volume\nRest: 120 sec",
        },
      ],
      tips: [
        "Use mirrors or video to check technique",
        "Warm up joints before heavy lifts",
        "Focus on breathing and bracing",
        "Prioritize form over load",
        "Progress gradually every 2 weeks",
        "Full range of motion is key",
      ],
    },
    "hypertrophy-mh-003": {
      name: "Muscle Hypertrophy Builder",
      serialNumber: "MH-003",
      focus: "Muscle Hypertrophy",
      difficulty: "Intermediate to Advanced",
      duration: "6 weeks",
      equipment: "Required (barbell, dumbbells, bench, pull-up bar, bands)",
      imageUrl: muscleHypertrophyImg,
      description:
        "A hypertrophy-focused plan designed to stimulate muscle growth through volume, intensity, and controlled tempo across all major muscle groups.",
      format: `Push/Pull/Lower/Full Body Split
Structure: 4 training days/week
Progressive overload every 2 weeks
Tempo: 2 sec up / 3 sec down
Rest: 60–90 sec between sets`,
      instructions:
        "Use %1RM for compound lifts. Tempo: 2 sec up / 3 sec down. Rest: 60–90 sec between sets. Leave 1–2 reps in reserve (RIR).",
      exercises: [
        {
          week: "Week 1–2",
          day: "Day 1",
          workout: "Push Focus (65–70% 1RM, 12 reps)",
          details: "Bench Press – 4×12\nIncline Dumbbell Press – 3×12\nOverhead Press – 3×12\nTricep Dips – 3 sets to near-failure",
        },
        {
          week: "Week 1–2",
          day: "Day 2",
          workout: "Pull Focus (65–70% 1RM, 12 reps)",
          details: "Pull-Ups – 4 sets to near-failure\nBent Over Row – 4×12\nUpright Row – 3×12\nBicep Curls – 3×15",
        },
        {
          week: "Week 1–2",
          day: "Day 4",
          workout: "Lower Body Hypertrophy (65–70% 1RM, 12 reps)",
          details: "Back Squat – 4×12\nRomanian Deadlift – 3×12\nBulgarian Split Squat – 3×12\nGlute Bridge – 3×15",
        },
        {
          week: "Week 1–2",
          day: "Day 5",
          workout: "Full Body Blend",
          details: "Deadlift – 4×10\nDumbbell Bench Press – 3×12\nOne-Leg RDL – 3×10\nHip Thrust – 3×15\nPlank Hold – 3×45s",
        },
        {
          week: "Week 3–4",
          day: "Progression",
          workout: "Increased Load (75–80% 1RM, 10 reps)",
          details: "Add 1 set to compound lifts\nIncrease load\nRest: 90 sec",
        },
        {
          week: "Week 5–6",
          day: "Progression",
          workout: "Peak Volume (80–85% 1RM, 8 reps)",
          details: "Focus on tempo\nMaintain volume\nRest: 90–120 sec",
        },
      ],
      tips: [
        "Track weights and reps weekly",
        "Use full range of motion",
        "Prioritize recovery and sleep",
        "Leave 1-2 reps in reserve",
        "Focus on muscle contraction",
        "Eat in a slight caloric surplus",
      ],
    },
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
        <title>{program.name} - Smarty Gym | {program.duration} Program by Haris Falas</title>
        <meta name="description" content={`${program.description} - ${program.duration} ${program.focus} training program by Haris Falas at smartygym.com. Convenient & flexible gym reimagined for anywhere, anytime fitness.`} />
        <meta name="keywords" content={`smartygym, smarty gym, smartygym.com, Haris Falas, ${program.name}, ${program.focus} program, ${program.duration} program, ${program.equipment}, ${program.difficulty} program, training program, convenient fitness, gym reimagined, flexible training`} />
        
        <meta property="og:title" content={`${program.name} - ${program.duration} Training Program`} />
        <meta property="og:description" content={`${program.description} - Structured ${program.focus} program by Haris Falas`} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://smartygym.com/trainingprogram/${type}/${id}`} />
        <meta property="og:image" content={program.imageUrl} />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${program.name} - Smarty Gym`} />
        <meta name="twitter:description" content={`${program.duration} ${program.focus} program by Haris Falas at smartygym.com`} />
        
        <link rel="canonical" href={`https://smartygym.com/trainingprogram/${type}/${id}`} />
        
        {/* Structured Data - Exercise Program */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ExercisePlan",
            "name": program.name,
            "description": program.description,
            "image": program.imageUrl,
            "duration": program.duration,
            "exerciseType": program.focus,
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

      <AccessGate requireAuth={!isFreeProgram} requirePremium={!isFreeProgram} contentType="program">
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
