import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Clock, Dumbbell, TrendingUp } from "lucide-react";
import { WorkoutDisplay } from "@/components/WorkoutDisplay";
import { ShareButtons } from "@/components/ShareButtons";

const IndividualWorkout = () => {
  const navigate = useNavigate();
  const { type, id } = useParams();

  // All workouts are free
  const isFreeWorkout = true;

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
    "strength-001": {
      name: "Power Foundation",
      serialNumber: "ST-001",
      difficulty: "Intermediate",
      duration: "45 min",
      equipment: "Equipment Required",
      imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop",
      description:
        "Build your strength base with compound movements targeting major muscle groups. This workout focuses on developing raw power through progressive overload with barbells and dumbbells.",
      format: `Traditional Strength Training
Structure: 5 exercises, 4 sets each
Rest Between Sets: 2-3 minutes
Tempo: Controlled eccentric, explosive concentric

Warm-Up: 10 minutes dynamic stretching
Main Block: 30 minutes strength work
Cool-Down: 5 minutes static stretching`,
      instructions:
        "Start with a thorough warm-up. Use weights that challenge you for the prescribed reps while maintaining perfect form. Focus on progressive overload by gradually increasing weight week by week.",
      exercises: [
        {
          name: "Barbell Back Squat",
          sets: "4",
          reps: "6-8",
          rest: "3 min",
          notes: "Bar on upper traps, descend below parallel, drive through heels",
        },
        {
          name: "Barbell Bench Press",
          sets: "4",
          reps: "6-8",
          rest: "3 min",
          notes: "Retract shoulder blades, lower to chest, press explosively",
        },
        {
          name: "Barbell Deadlift",
          sets: "4",
          reps: "5-6",
          rest: "3 min",
          notes: "Neutral spine, hinge at hips, drive through full foot",
        },
        {
          name: "Barbell Overhead Press",
          sets: "4",
          reps: "8-10",
          rest: "2 min",
          notes: "Tight core, press straight up, lock out overhead",
        },
        {
          name: "Barbell Row",
          sets: "4",
          reps: "8-10",
          rest: "2 min",
          notes: "Hinged position, pull to lower chest, squeeze shoulder blades",
        },
      ],
      tips: [
        "Always warm up thoroughly before heavy lifting",
        "Never compromise form for heavier weight",
        "Use a spotter for bench press and squats",
        "Engage core throughout all movements",
        "Rest adequately between sets for full recovery",
        "Breathe properly: exhale on exertion, inhale on return",
      ],
    },
    "calorie-001": {
      name: "Metabolic Burn",
      serialNumber: "CB-001",
      difficulty: "Beginner",
      duration: "30 min",
      equipment: "No Equipment Required",
      imageUrl: "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=800&h=600&fit=crop",
      description:
        "High-intensity bodyweight workout designed to maximize calorie burn. This workout combines cardio bursts with bodyweight exercises to keep your heart rate elevated throughout.",
      format: `Circuit Training
Structure: 6 exercises, 4 rounds
Work:Rest Ratio: 40s work / 20s rest
Total Circuits: 4 rounds

Warm-Up: 5 minutes light cardio
Main Block: 24 minutes circuit work
Cool-Down: 1 minute stretching`,
      instructions:
        "Move quickly between exercises with minimal rest. Focus on maintaining intensity while keeping proper form. Modify exercises as needed by reducing range of motion or intensity.",
      exercises: [
        {
          name: "Jumping Jacks",
          sets: "4 rounds",
          reps: "40s",
          rest: "20s",
          notes: "Full range of motion, steady rhythm, land softly",
        },
        {
          name: "Burpees",
          sets: "4 rounds",
          reps: "40s",
          rest: "20s",
          notes: "Drop down, kick back, push-up, jump up, hands overhead",
        },
        {
          name: "High Knees",
          sets: "4 rounds",
          reps: "40s",
          rest: "20s",
          notes: "Drive knees to hip level, pump arms vigorously",
        },
        {
          name: "Mountain Climbers",
          sets: "4 rounds",
          reps: "40s",
          rest: "20s",
          notes: "Plank position, drive knees to chest alternately",
        },
        {
          name: "Jump Squats",
          sets: "4 rounds",
          reps: "40s",
          rest: "20s",
          notes: "Squat down, explode up, land softly, repeat",
        },
        {
          name: "Plank Jacks",
          sets: "4 rounds",
          reps: "40s",
          rest: "90s",
          notes: "Plank position, jump feet out and in, keep core tight",
        },
      ],
      tips: [
        "Stay hydrated throughout the workout",
        "Land softly on all jumping movements",
        "Maintain core engagement during all exercises",
        "Modify intensity based on fitness level",
        "Focus on consistent pace over maximum speed",
        "Listen to your body and rest if needed",
      ],
    },
    "metabolic-001": {
      name: "Metabolic Ignition",
      serialNumber: "MB-001",
      difficulty: "Intermediate",
      duration: "35 min",
      equipment: "Equipment Required",
      imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=600&fit=crop",
      description:
        "An explosive metabolic workout that combines strength and cardio elements. Using kettlebells and dumbbells, this workout spikes your metabolism and burns calories long after you finish.",
      format: `EMOM (Every Minute on the Minute)
Structure: 5 exercises, 7 rounds
Work Pattern: Complete reps, rest remainder of minute

Warm-Up: 5 minutes dynamic movement
Main Block: 25 minutes EMOM
Cool-Down: 5 minutes recovery`,
      instructions:
        "Start each minute with the prescribed exercise. Complete the reps, then rest for the remainder of that minute. Move immediately to the next exercise when the next minute starts.",
      exercises: [
        {
          name: "Kettlebell Swings",
          sets: "7 rounds",
          reps: "15",
          rest: "remainder of minute",
          notes: "Hip hinge movement, explosive hip drive, bell to shoulder height",
        },
        {
          name: "Dumbbell Thrusters",
          sets: "7 rounds",
          reps: "12",
          rest: "remainder of minute",
          notes: "Front squat to overhead press in one motion",
        },
        {
          name: "Kettlebell Goblet Squats",
          sets: "7 rounds",
          reps: "15",
          rest: "remainder of minute",
          notes: "Hold bell at chest, squat deep, drive through heels",
        },
        {
          name: "Dumbbell Push Press",
          sets: "7 rounds",
          reps: "10",
          rest: "remainder of minute",
          notes: "Slight dip, explosive drive, press overhead",
        },
        {
          name: "Kettlebell Romanian Deadlift",
          sets: "7 rounds",
          reps: "12",
          rest: "60s after round",
          notes: "Hinge at hips, slight knee bend, feel hamstring stretch",
        },
      ],
      tips: [
        "Choose weights that allow you to maintain form throughout",
        "Use hip power for kettlebell swings, not arms",
        "Maintain tight core during all movements",
        "Focus on explosive movements with control",
        "Adjust rest by finishing reps faster or slower",
        "Keep good posture throughout the workout",
      ],
    },
    "cardio-001": {
      name: "Cardio Blast",
      serialNumber: "CD-001",
      difficulty: "Beginner",
      duration: "40 min",
      equipment: "No Equipment Required",
      imageUrl: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=800&h=600&fit=crop",
      description:
        "Build cardiovascular endurance with this progressive cardio workout. Combining steady-state work with interval training to improve your aerobic capacity and stamina.",
      format: `Mixed Cardio Protocol
Structure: Warm-up, intervals, steady state, cool-down
Intensity Zones: 60-85% max heart rate

Warm-Up: 5 minutes easy pace
Intervals: 20 minutes alternating intensity
Steady State: 10 minutes moderate pace
Cool-Down: 5 minutes easy pace`,
      instructions:
        "Monitor your heart rate and maintain prescribed intensity zones. During intervals, push to 80-85% max HR, recover to 60-65% during rest periods.",
      exercises: [
        {
          name: "Warm-Up March",
          sets: "1",
          reps: "5 min",
          rest: "0",
          notes: "Easy pace, gradually increase heart rate, arm swings",
        },
        {
          name: "High Intensity Intervals",
          sets: "10",
          reps: "1 min work / 1 min rest",
          rest: "1 min between",
          notes: "Alternate: High Knees, Butt Kicks, Jumping Jacks, Skaters, repeat",
        },
        {
          name: "Steady State Cardio",
          sets: "1",
          reps: "10 min",
          rest: "0",
          notes: "Jogging in place or step-ups, maintain 70% max HR",
        },
        {
          name: "Cool-Down Walk",
          sets: "1",
          reps: "5 min",
          rest: "0",
          notes: "Gradually lower heart rate, deep breathing",
        },
      ],
      tips: [
        "Monitor your heart rate to stay in target zones",
        "Start at lower intensity if you're new to cardio",
        "Focus on breathing rhythm throughout",
        "Stay hydrated before, during, and after",
        "Land softly on all jumping movements",
        "Progress gradually by increasing work intervals",
      ],
    },
    "mobility-001": {
      name: "Flow & Mobility",
      serialNumber: "MO-001",
      difficulty: "Beginner",
      duration: "30 min",
      equipment: "No Equipment Required",
      imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop",
      description:
        "Improve flexibility, joint health, and movement quality. This mobility-focused session enhances range of motion and helps prevent injury through controlled movements and stretches.",
      format: `Mobility Flow Sequence
Structure: Progressive mobility drills
Hold Time: 30-60 seconds per position
Flow Style: Continuous movement

Breathing: 5 minutes breathwork
Main Flow: 20 minutes mobility sequence
Relaxation: 5 minutes final stretches`,
      instructions:
        "Move slowly and deliberately through each position. Focus on breath and control rather than pushing into pain. Hold stretches at comfortable tension, never force.",
      exercises: [
        {
          name: "Cat-Cow Flow",
          sets: "3",
          reps: "60s",
          rest: "0",
          notes: "Hands and knees, alternate between arching and rounding spine",
        },
        {
          name: "World's Greatest Stretch",
          sets: "3",
          reps: "45s each side",
          rest: "0",
          notes: "Lunge position, rotate torso, reach up, hold and breathe",
        },
        {
          name: "Hip Circles",
          sets: "2",
          reps: "30s each direction",
          rest: "0",
          notes: "Standing or hands/knees, make large circles with hips",
        },
        {
          name: "Thread the Needle",
          sets: "2",
          reps: "45s each side",
          rest: "0",
          notes: "On all fours, reach arm under body, feel shoulder stretch",
        },
        {
          name: "Deep Squat Hold",
          sets: "3",
          reps: "60s",
          rest: "30s",
          notes: "Feet shoulder width, sink into deep squat, hands at chest",
        },
        {
          name: "Cobra to Child's Pose",
          sets: "3",
          reps: "60s",
          rest: "0",
          notes: "Flow between cobra stretch and child's pose",
        },
      ],
      tips: [
        "Never stretch to the point of pain",
        "Breathe deeply and consistently throughout",
        "Move slowly and with control",
        "Listen to your body and respect its limits",
        "Practice regularly for best results",
        "Focus on relaxation, not forcing positions",
      ],
    },
    "challenge-001": {
      name: "Ultimate Challenge",
      serialNumber: "CH-001",
      difficulty: "Advanced",
      duration: "50 min",
      equipment: "Equipment Required",
      imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=600&fit=crop",
      description:
        "The ultimate test of strength, endurance, and mental toughness. This advanced workout combines heavy lifting, high-intensity cardio, and bodyweight challenges to push you to your limits.",
      format: `Multi-Modal Challenge
Structure: 3 phases with increasing difficulty
Work:Rest: Minimal rest between exercises

Phase 1: Strength (20 min)
Phase 2: Metabolic (20 min)
Phase 3: Finisher (10 min)`,
      instructions:
        "This is an advanced workout requiring excellent form and fitness. Take rest as needed but challenge yourself to minimize breaks. Focus on perfect form even when fatigued.",
      exercises: [
        {
          name: "Phase 1: Heavy Barbell Complex",
          sets: "5",
          reps: "5 reps each: Deadlift, Clean, Front Squat, Press, Back Squat",
          rest: "3 min",
          notes: "Complete all 5 movements without dropping bar",
        },
        {
          name: "Phase 2: Chipper",
          sets: "1",
          reps: "For Time",
          rest: "minimal",
          notes: "50 Burpees, 40 KB Swings, 30 Box Jumps, 20 Pull-ups, 10 Thrusters",
        },
        {
          name: "Phase 3: AMRAP 10 Minutes",
          sets: "As many rounds",
          reps: "10 min",
          rest: "minimal",
          notes: "5 Muscle-ups, 10 Pistol Squats, 15 Handstand Push-ups",
        },
      ],
      tips: [
        "This is for advanced athletes only",
        "Warm up thoroughly before attempting",
        "Have a spotter available for heavy lifts",
        "Scale movements if needed to maintain form",
        "Stay mentally focused throughout",
        "Recovery is crucial after this workout",
        "Hydrate well and monitor your body",
      ],
    },
    "cardio-002": {
      name: "Pulse Igniter",
      serialNumber: "001",
      difficulty: "Intermediate",
      duration: "30 minutes",
      equipment: "Jump Rope, Mat",
      imageUrl: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=800&h=600&fit=crop",
      description:
        "Pulse Igniter is a high-energy cardio workout designed to elevate heart rate, improve endurance, and boost cardiovascular health. It's ideal for clients looking for a sweat-heavy session that's short, sharp, and effective.",
      format: `Tabata Circuit – 6 blocks of 4 minutes each
Work: 20s / Rest: 10s x 8 rounds per block`,
      instructions:
        "Complete each Tabata block before moving to the next. Rest 1 minute between blocks. Use a timer app for accuracy.",
      exercises: [
        {
          name: "Block 1: Jump Rope",
          sets: "1 block",
          reps: "8 rounds",
          rest: "10s between rounds, 1 min after block",
          notes: "Each block = 4 minutes (20s on / 10s off x 8)",
        },
        {
          name: "Block 2: High Knees",
          sets: "1 block",
          reps: "8 rounds",
          rest: "10s between rounds, 1 min after block",
          notes: "Each block = 4 minutes (20s on / 10s off x 8)",
        },
        {
          name: "Block 3: Mountain Climbers",
          sets: "1 block",
          reps: "8 rounds",
          rest: "10s between rounds, 1 min after block",
          notes: "Each block = 4 minutes (20s on / 10s off x 8)",
        },
        {
          name: "Block 4: Burpees",
          sets: "1 block",
          reps: "8 rounds",
          rest: "10s between rounds, 1 min after block",
          notes: "Each block = 4 minutes (20s on / 10s off x 8)",
        },
        {
          name: "Block 5: Jumping Jacks",
          sets: "1 block",
          reps: "8 rounds",
          rest: "10s between rounds, 1 min after block",
          notes: "Each block = 4 minutes (20s on / 10s off x 8)",
        },
        {
          name: "Block 6: Skater Hops",
          sets: "1 block",
          reps: "8 rounds",
          rest: "10s between rounds",
          notes: "Each block = 4 minutes (20s on / 10s off x 8)",
        },
      ],
      tips: [
        "Engage your core during high-impact moves",
        "Avoid locking knees during jumps",
        "Hydrate and pace yourself across rounds",
      ],
    },
    "calorie-002": {
      name: "Fat Furnace",
      serialNumber: "002",
      difficulty: "Advanced",
      duration: "45 minutes",
      equipment: "Dumbbells, Mat",
      imageUrl: "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=800&h=600&fit=crop",
      description:
        "Fat Furnace is a metabolic conditioning workout that torches calories and keeps the burn going post-session. It blends compound strength moves with dynamic cardio bursts for maximum fat loss.",
      format: `AMRAP + Challenge Finisher
Main Block: 30 mins AMRAP
Finisher: 10 mins challenge
Warm-Up & Cool-Down: 5 mins`,
      instructions:
        "Use moderate dumbbells. Push for consistent pace. Track rounds completed. Rest only when needed.",
      exercises: [
        {
          name: "Dumbbell Thrusters",
          sets: "AMRAP 30 min",
          reps: "12",
          rest: "as needed",
          notes: "Main Block Exercise 1",
        },
        {
          name: "Jump Squats",
          sets: "AMRAP 30 min",
          reps: "15",
          rest: "as needed",
          notes: "Main Block Exercise 2",
        },
        {
          name: "Dumbbell Renegade Rows",
          sets: "AMRAP 30 min",
          reps: "10/side",
          rest: "as needed",
          notes: "Main Block Exercise 3",
        },
        {
          name: "Jump Lunges",
          sets: "AMRAP 30 min",
          reps: "12/leg",
          rest: "as needed",
          notes: "Main Block Exercise 4",
        },
        {
          name: "Plank to Push-Up",
          sets: "AMRAP 30 min",
          reps: "10",
          rest: "as needed",
          notes: "Main Block Exercise 5",
        },
        {
          name: "Finisher: 100 Jumping Jacks",
          sets: "1",
          reps: "100",
          rest: "0",
          notes: "Complete in 10 mins",
        },
        {
          name: "Finisher: 50 Mountain Climbers",
          sets: "1",
          reps: "50",
          rest: "0",
          notes: "Complete in 10 mins",
        },
        {
          name: "Finisher: 25 Burpees",
          sets: "1",
          reps: "25",
          rest: "0",
          notes: "Complete in 10 mins",
        },
      ],
      tips: [
        "Choose weights that challenge without compromising form",
        "Avoid arching your back during rows",
        "Focus on breathing and posture",
      ],
    },
    "strength-002": {
      name: "Iron Core",
      serialNumber: "003",
      difficulty: "Advanced",
      duration: "60 minutes",
      equipment: "Bars & Weight Plates, Dumbbells, Mat",
      imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop",
      description:
        "Iron Core is a strength-focused workout targeting major muscle groups. It builds raw power, muscular endurance, and structural integrity. Ideal for intermediate to advanced clients.",
      format: `Traditional Sets & Reps
3 sets per exercise
Rest: 60–90s between sets`,
      instructions:
        "Warm up thoroughly. Use progressive overload. Maintain strict form and full range of motion.",
      exercises: [
        {
          name: "Barbell Deadlifts",
          sets: "3",
          reps: "8",
          rest: "60-90s",
          notes: "@ 3010 tempo",
        },
        {
          name: "Dumbbell Bench Press",
          sets: "3",
          reps: "10",
          rest: "60-90s",
          notes: "@ 2011 tempo",
        },
        {
          name: "Barbell Squats",
          sets: "3",
          reps: "8",
          rest: "60-90s",
          notes: "@ 3010 tempo",
        },
        {
          name: "Dumbbell Shoulder Press",
          sets: "3",
          reps: "10",
          rest: "60-90s",
          notes: "@ 2011 tempo",
        },
        {
          name: "Weighted Plank Hold",
          sets: "3",
          reps: "30s",
          rest: "60-90s",
          notes: "Maintain strict form",
        },
      ],
      tips: [
        "Never compromise form for heavier weights",
        "Use a spotter for bench press if needed",
        "Engage glutes and core during squats and deadlifts",
      ],
    },
    "strength-003": {
      name: "Core Builder",
      serialNumber: "STR-BBW-001",
      difficulty: "Beginner",
      duration: "30 minutes",
      equipment: "Bodyweight only",
      imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop",
      description:
        "A foundational strength workout using only bodyweight. Targets major muscle groups with controlled tempo and safe movement patterns.",
      format: `Circuit – 3 rounds
Tempo: Controlled (3010 or 2011)`,
      instructions:
        "Perform each exercise slowly and deliberately. Rest 30s between exercises, 1 min between rounds.",
      exercises: [
        {
          name: "Squat to Chair",
          sets: "3",
          reps: "12",
          rest: "30s",
          notes: "@ 3010 tempo",
        },
        {
          name: "Incline Push-Ups",
          sets: "3",
          reps: "10",
          rest: "30s",
          notes: "@ 2011 tempo",
        },
        {
          name: "Glute Bridges",
          sets: "3",
          reps: "15",
          rest: "30s",
          notes: "@ 3010 tempo",
        },
        {
          name: "Wall Sit",
          sets: "3",
          reps: "30s",
          rest: "30s",
          notes: "Hold steady position",
        },
        {
          name: "Bird-Dog",
          sets: "3",
          reps: "10/side",
          rest: "1 min",
          notes: "Focus on balance and control",
        },
      ],
      tips: [
        "Focus on form over speed",
        "Engage your core",
        "Avoid locking joints",
      ],
    },
    "strength-004": {
      name: "Starter Strength",
      serialNumber: "STR-EQ-002",
      difficulty: "Beginner",
      duration: "30 minutes",
      equipment: "Dumbbells, Bands, Mat",
      imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop",
      description:
        "Gentle intro to resistance training using light dumbbells and bands. Builds strength safely and progressively.",
      format: `Circuit – 3 rounds
Tempo: Moderate (2011)`,
      instructions:
        "Use light weights. Rest 45s between exercises, 1 min between rounds.",
      exercises: [
        {
          name: "Dumbbell Goblet Squat",
          sets: "3",
          reps: "12",
          rest: "45s",
          notes: "Hold dumbbell at chest",
        },
        {
          name: "Band Row",
          sets: "3",
          reps: "15",
          rest: "45s",
          notes: "Squeeze shoulder blades",
        },
        {
          name: "Dumbbell Chest Press (floor)",
          sets: "3",
          reps: "10",
          rest: "45s",
          notes: "Controlled movement",
        },
        {
          name: "Band Overhead Press",
          sets: "3",
          reps: "12",
          rest: "45s",
          notes: "Keep core tight",
        },
        {
          name: "Plank Hold",
          sets: "3",
          reps: "30s",
          rest: "1 min",
          notes: "Maintain straight line",
        },
      ],
      tips: [
        "Keep shoulders relaxed",
        "Don't swing weights",
        "Breathe through each rep",
      ],
    },
    "strength-005": {
      name: "Gravity Grind",
      serialNumber: "STR-BBW-003",
      difficulty: "Intermediate",
      duration: "45 minutes",
      equipment: "Bodyweight only",
      imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop",
      description:
        "A bodyweight strength workout using tempo and holds to challenge muscles and build endurance.",
      format: `Superset + Static Holds
Tempo: Slow (3010)`,
      instructions:
        "Pair exercises into supersets. Rest 30s between moves, 1 min between sets.",
      exercises: [
        {
          name: "Bulgarian Split Squat",
          sets: "3",
          reps: "10/leg",
          rest: "30s",
          notes: "Superset 1 - Part A",
        },
        {
          name: "Wall Sit",
          sets: "3",
          reps: "45s",
          rest: "1 min",
          notes: "Superset 1 - Part B",
        },
        {
          name: "Push-Up",
          sets: "3",
          reps: "12",
          rest: "30s",
          notes: "Superset 2 - Part A",
        },
        {
          name: "Plank Hold",
          sets: "3",
          reps: "45s",
          rest: "1 min",
          notes: "Superset 2 - Part B",
        },
        {
          name: "Glute Bridge March",
          sets: "3",
          reps: "10/leg",
          rest: "30s",
          notes: "Superset 3 - Part A",
        },
        {
          name: "Side Plank",
          sets: "3",
          reps: "30s/side",
          rest: "1 min",
          notes: "Superset 3 - Part B",
        },
      ],
      tips: [
        "Control every rep",
        "Keep spine neutral",
        "Use breath to stabilize",
      ],
    },
    "strength-006": {
      name: "Iron Circuit",
      serialNumber: "STR-EQ-004",
      difficulty: "Intermediate",
      duration: "45 minutes",
      equipment: "Dumbbells, Kettlebells, Mat",
      imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop",
      description:
        "A full-body strength circuit using dumbbells and kettlebells. Builds muscle and improves movement control.",
      format: `Circuit – 4 rounds
Tempo: Moderate (2011)`,
      instructions:
        "Use moderate weights. Rest 30s between exercises, 1 min between rounds.",
      exercises: [
        {
          name: "Kettlebell Deadlift",
          sets: "4",
          reps: "12",
          rest: "30s",
          notes: "Hip hinge movement",
        },
        {
          name: "Dumbbell Shoulder Press",
          sets: "4",
          reps: "10",
          rest: "30s",
          notes: "Press overhead",
        },
        {
          name: "Dumbbell Step-Up",
          sets: "4",
          reps: "10/leg",
          rest: "30s",
          notes: "Alternate legs",
        },
        {
          name: "Kettlebell Goblet Squat",
          sets: "4",
          reps: "12",
          rest: "30s",
          notes: "Hold bell at chest",
        },
        {
          name: "Plank Row",
          sets: "4",
          reps: "10/side",
          rest: "1 min",
          notes: "Keep hips stable",
        },
      ],
      tips: [
        "Keep knees aligned with toes",
        "Brace core during lifts",
        "Don't rush transitions",
      ],
    },
    "strength-007": {
      name: "Bodyweight Beast",
      serialNumber: "STR-BBW-005",
      difficulty: "Advanced",
      duration: "60 minutes",
      equipment: "Bodyweight only",
      imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop",
      description:
        "A high-intensity bodyweight strength workout using advanced variations and isometric holds.",
      format: `EMOM + Static Holds
Tempo: Controlled (3010)`,
      instructions:
        "Start each minute with reps, rest until next minute. Hold positions for max tension.",
      exercises: [
        {
          name: "Plyo Push-Ups",
          sets: "4 cycles",
          reps: "10",
          rest: "remainder of minute",
          notes: "Minute 1 - Explosive power",
        },
        {
          name: "Pistol Squat (assisted)",
          sets: "4 cycles",
          reps: "8/leg",
          rest: "remainder of minute",
          notes: "Minute 2 - Single leg strength",
        },
        {
          name: "Side Plank Reach",
          sets: "4 cycles",
          reps: "30s/side",
          rest: "remainder of minute",
          notes: "Minute 3 - Core stability",
        },
        {
          name: "Glute Bridge Hold",
          sets: "4 cycles",
          reps: "45s",
          rest: "remainder of minute",
          notes: "Minute 4 - Glute activation",
        },
        {
          name: "Rest",
          sets: "4 cycles",
          reps: "Full minute",
          rest: "60s",
          notes: "Minute 5 - Recovery",
        },
        {
          name: "Wall Sit",
          sets: "1",
          reps: "60s",
          rest: "0",
          notes: "Finisher exercise 1",
        },
        {
          name: "Push-Up Hold (bottom)",
          sets: "1",
          reps: "30s",
          rest: "0",
          notes: "Finisher exercise 2",
        },
        {
          name: "Hollow Body Hold",
          sets: "1",
          reps: "30s",
          rest: "0",
          notes: "Finisher exercise 3",
        },
      ],
      tips: [
        "Maintain joint alignment",
        "Don't collapse in holds",
        "Use breath to manage fatigue",
      ],
    },
    "strength-008": {
      name: "Iron Engine",
      serialNumber: "STR-EQ-006",
      difficulty: "Advanced",
      duration: "60 minutes",
      equipment: "Barbell, Dumbbells, Weight Plates, Mat",
      imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop",
      description:
        "A heavy strength workout using barbells, dumbbells, and weighted holds. Designed for serious lifters.",
      format: `Traditional Sets & Reps
Tempo: Controlled (3010)`,
      instructions:
        "Use progressive overload. Rest 90s between sets. Track weights and tempo.",
      exercises: [
        {
          name: "Barbell Deadlift",
          sets: "4",
          reps: "6",
          rest: "90s",
          notes: "@ 3010 tempo",
        },
        {
          name: "Dumbbell Bench Press",
          sets: "4",
          reps: "8",
          rest: "90s",
          notes: "@ 2011 tempo",
        },
        {
          name: "Barbell Back Squat",
          sets: "4",
          reps: "6",
          rest: "90s",
          notes: "@ 3010 tempo",
        },
        {
          name: "Dumbbell Row",
          sets: "3",
          reps: "10/side",
          rest: "90s",
          notes: "Strict form",
        },
        {
          name: "Weighted Plank",
          sets: "3",
          reps: "45s",
          rest: "90s",
          notes: "Add weight plate on back",
        },
      ],
      tips: [
        "Use spotter for heavy lifts",
        "Warm up thoroughly",
        "Prioritize form over load",
      ],
    },
    "metabolic-002": {
      name: "MetaboShock",
      serialNumber: "004",
      difficulty: "Intermediate",
      duration: "15 minutes",
      equipment: "Kettlebells, TRX, Mat",
      imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=600&fit=crop",
      description:
        "MetaboShock is a hybrid metabolic workout blending resistance and cardio to spike metabolism and improve energy systems. Fast-paced and functional.",
      format: `EMOM (Every Minute on the Minute)
Cycle: 5 minutes
Repeat: 3 rounds`,
      instructions:
        "Start each minute with the prescribed reps. Rest until the next minute begins. Maintain intensity.",
      exercises: [
        {
          name: "Kettlebell Swings",
          sets: "3 cycles",
          reps: "20",
          rest: "remainder of minute",
          notes: "Minute 1 of each cycle",
        },
        {
          name: "TRX Rows",
          sets: "3 cycles",
          reps: "15",
          rest: "remainder of minute",
          notes: "Minute 2 of each cycle",
        },
        {
          name: "Jump Squats",
          sets: "3 cycles",
          reps: "20",
          rest: "remainder of minute",
          notes: "Minute 3 of each cycle",
        },
        {
          name: "TRX Push-Ups",
          sets: "3 cycles",
          reps: "15",
          rest: "remainder of minute",
          notes: "Minute 4 of each cycle",
        },
        {
          name: "Rest",
          sets: "3 cycles",
          reps: "Full minute",
          rest: "60s",
          notes: "Minute 5 of each cycle - strategic recovery",
        },
      ],
      tips: [
        "Keep kettlebell swings hip-driven",
        "Adjust TRX straps for proper tension",
        "Don't skip the rest minute—it's strategic recovery",
      ],
    },
    "power-001": {
      name: "Power Surge",
      serialNumber: "005",
      difficulty: "Advanced",
      duration: "30 minutes",
      equipment: "Medicine Balls, Wall Balls, Bands",
      imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=600&fit=crop",
      description:
        "Power Surge develops explosive strength and fast-twitch muscle activation. Ideal for athletes or clients wanting to improve speed, agility, and reactive power.",
      format: `Circuit for Time
5 rounds
Work: 30s / Rest: 30s`,
      instructions:
        "Focus on maximum effort during work intervals. Rest fully between exercises to maintain explosive output.",
      exercises: [
        {
          name: "Medicine Ball Slams",
          sets: "5 rounds",
          reps: "30s",
          rest: "30s",
          notes: "@ max effort",
        },
        {
          name: "Band-Resisted Sprints",
          sets: "5 rounds",
          reps: "3 x 20m",
          rest: "30s",
          notes: "Explosive acceleration",
        },
        {
          name: "Wall Ball Throws",
          sets: "5 rounds",
          reps: "12",
          rest: "30s",
          notes: "Use stable wall",
        },
        {
          name: "Broad Jumps",
          sets: "5 rounds",
          reps: "6",
          rest: "30s",
          notes: "Land softly",
        },
        {
          name: "Plyo Push-Ups",
          sets: "5 rounds",
          reps: "10",
          rest: "30s",
          notes: "Explosive power",
        },
      ],
      tips: [
        "Warm up joints thoroughly",
        "Land softly during jumps",
        "Use a stable wall for throws",
      ],
    },
    "mobility-002": {
      name: "FlowForge",
      serialNumber: "006",
      difficulty: "Beginner",
      duration: "60 minutes",
      equipment: "Fit Ball, Bands, Mat",
      imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop",
      description:
        "FlowForge is a low-impact mobility and stability workout that enhances joint health, posture, and movement control. Ideal for recovery days or as a supplement to intense training.",
      format: `Controlled Flow + Static Holds
2 rounds
Hold Time: 30–60s per move`,
      instructions:
        "Move slowly and intentionally. Focus on breath and control. Use bands for gentle resistance.",
      exercises: [
        {
          name: "Band Shoulder Dislocates",
          sets: "2 rounds",
          reps: "10",
          rest: "0",
          notes: "Controlled movement",
        },
        {
          name: "Fit Ball Hip Bridges",
          sets: "2 rounds",
          reps: "12",
          rest: "0",
          notes: "Squeeze glutes at top",
        },
        {
          name: "Bird-Dog",
          sets: "2 rounds",
          reps: "10/side",
          rest: "0",
          notes: "Focus on balance",
        },
        {
          name: "Deep Squat Hold",
          sets: "2 rounds",
          reps: "45s",
          rest: "0",
          notes: "Breathe deeply",
        },
        {
          name: "Side Plank with Reach",
          sets: "2 rounds",
          reps: "30s/side",
          rest: "0",
          notes: "Control through core",
        },
        {
          name: "Cat-Cow Flow",
          sets: "2 rounds",
          reps: "60s",
          rest: "0",
          notes: "Spinal mobility",
        },
      ],
      tips: [
        "Avoid rushing through stretches",
        "Keep spine neutral during core work",
        "Listen to your body—this is about control, not intensity",
      ],
    },
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
        <title>{workout.name} | Smarty Gym</title>
        <meta name="description" content={workout.description} />
      </Helmet>

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
              imageUrl={workout.imageUrl}
              duration={workout.duration}
              equipment={workout.equipment}
              description={workout.description}
              format={workout.format}
              instructions={workout.instructions}
              tips={workout.tips.join('\n')}
              workoutDetails={{ exercises: workout.exercises }}
            />

            {/* Share Buttons */}
            <div className="mt-8">
              <ShareButtons
                url={window.location.href}
                title={`Check out ${workout.name} workout on Smarty Gym!`}
              />
            </div>
          </div>
        </div>
    </>
  );
};

export default IndividualWorkout;