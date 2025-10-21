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