import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { WorkoutDisplay } from "@/components/WorkoutDisplay";
import { PremiumContentGate } from "@/components/PremiumContentGate";
import { WorkoutInteractions } from "@/components/WorkoutInteractions";
import { ShareButtons } from "@/components/ShareButtons";

const IndividualWorkout = () => {
  const navigate = useNavigate();
  const { type, id } = useParams();
  const isFreeWorkout = id?.includes("-free") || id === "strength-free" || id === "calorie-burning-free" || id === "metabolic-free" || id === "cardio-free" || id === "mobility-free" || id === "challenge-free";

  // Sample workout names based on type and id
  const workoutNames: { [key: string]: { [key: string]: { name: string; difficulty: number; serial: string } } } = {
    cardio: {
      "1": { name: "HIIT Foundation", difficulty: 1, serial: "CD-001" },
      "2": { name: "Cardio Blast Advanced", difficulty: 3, serial: "CD-002" },
    },
    strength: {
      "1": { name: "Upper Body Power", difficulty: 2, serial: "ST-001" },
      "2": { name: "Full Body Strength", difficulty: 3, serial: "ST-002" },
    },
    functional: {
      "1": { name: "Functional Movement Basics", difficulty: 1, serial: "FN-001" },
      "2": { name: "Athletic Performance", difficulty: 3, serial: "FN-002" },
    },
    hypertrophy: {
      "1": { name: "Muscle Building Fundamentals", difficulty: 2, serial: "HY-001" },
      "2": { name: "Hypertrophy Advanced", difficulty: 3, serial: "HY-002" },
    },
    weightloss: {
      "1": { name: "Fat Burn Beginner", difficulty: 1, serial: "WL-001" },
      "2": { name: "Metabolic Accelerator", difficulty: 3, serial: "WL-002" },
    },
    lowbackpain: {
      "1": { name: "Back Care Essentials", difficulty: 1, serial: "LB-001" },
      "2": { name: "Spine Strengthening", difficulty: 2, serial: "LB-002" },
    },
    mobility: {
      "1": { name: "Flexibility Foundation", difficulty: 1, serial: "MB-001" },
      "2": { name: "Advanced Mobility Flow", difficulty: 3, serial: "MB-002" },
    },
  };

  const workoutInfo = workoutNames[type || "cardio"]?.[id || "1"] || { 
    name: "Workout Session", 
    difficulty: 2,
    serial: "WO-001"
  };

  // Sample exercises data - would come from database
  const exercises = [
    {
      name: "Jumping Jacks",
      video_id: "iSSAk4XCsRA",
      video_url: "https://www.youtube.com/watch?v=iSSAk4XCsRA"
    },
    {
      name: "Push-ups",
      video_id: "IODxDxX7oi4",
      video_url: "https://www.youtube.com/watch?v=IODxDxX7oi4"
    },
    {
      name: "Burpees",
      video_id: "JZQA08SlJnM",
      video_url: "https://www.youtube.com/watch?v=JZQA08SlJnM"
    }
  ];

  const planContent = `This comprehensive workout is designed to help you achieve your fitness goals through a structured and progressive approach.

The workout combines cardiovascular exercises, strength training, and mobility work to create a well-rounded fitness program. Each exercise has been carefully selected to maximize effectiveness while minimizing risk of injury.

Duration: 30-45 minutes
Equipment: As specified in the workout type
Target Areas: Full body conditioning
Intensity: Adjustable based on your fitness level

This program is suitable for individuals who have completed their PAR-Q+ assessment and received clearance to exercise. The workout can be modified to match your current fitness level by adjusting work and rest periods, rounds, and exercise intensity.`;

  // Get specific workout details based on workout ID
  const getWorkoutDetails = (workoutType: string, workoutId: string) => {
    // STRENGTH WORKOUTS
    if (workoutId === "strength-free") {
      return {
        exercises: [
          {
            name: "Push-Ups",
            sets: "3",
            reps: "10-12",
            rest: "60s",
            notes: "Keep your core tight and lower until chest nearly touches ground. Modify on knees if needed."
          },
          {
            name: "Bodyweight Squats",
            sets: "3",
            reps: "15-20",
            rest: "60s",
            notes: "Keep knees tracking over toes, chest up, and lower until thighs are parallel to ground."
          },
          {
            name: "Plank Hold",
            sets: "3",
            reps: "30-45s",
            rest: "45s",
            notes: "Maintain straight line from head to heels. Don't let hips sag or pike up."
          },
          {
            name: "Lunges (Alternating)",
            sets: "3",
            reps: "10 each leg",
            rest: "60s",
            notes: "Step forward and lower back knee toward ground. Keep front knee at 90 degrees."
          },
          {
            name: "Pike Push-Ups",
            sets: "3",
            reps: "8-10",
            rest: "60s",
            notes: "Start in downward dog position and perform push-ups. Great for shoulders."
          },
          {
            name: "Glute Bridges",
            sets: "3",
            reps: "15-20",
            rest: "45s",
            notes: "Squeeze glutes at the top and hold for 1 second. Keep core engaged."
          }
        ]
      };
    }
    
    if (workoutId === "1" && workoutType === "strength") {
      return {
        exercises: [
          {
            name: "Diamond Push-Ups",
            sets: "4",
            reps: "8-12",
            rest: "90s",
            notes: "Hands form diamond shape. Focuses on triceps. Modify on knees if needed."
          },
          {
            name: "Bulgarian Split Squats",
            sets: "4",
            reps: "10 each leg",
            rest: "90s",
            notes: "Back foot elevated on bench. Increases single-leg strength and stability."
          },
          {
            name: "Decline Push-Ups",
            sets: "3",
            reps: "12-15",
            rest: "60s",
            notes: "Feet elevated on bench or chair. Increases upper chest activation."
          },
          {
            name: "Jump Squats",
            sets: "3",
            reps: "12-15",
            rest: "90s",
            notes: "Explosive power exercise. Land softly with controlled descent."
          },
          {
            name: "Side Plank (each side)",
            sets: "3",
            reps: "30-45s",
            rest: "45s",
            notes: "Works obliques and lateral core stability. Keep hips elevated."
          },
          {
            name: "Single-Leg Glute Bridges",
            sets: "3",
            reps: "12 each leg",
            rest: "60s",
            notes: "Increases difficulty and hip stability. Squeeze glutes hard at top."
          }
        ]
      };
    }

    // CALORIE BURNING WORKOUTS
    if (workoutId === "calorie-burning-free") {
      return {
        exercises: [
          {
            name: "Jumping Jacks",
            sets: "4",
            reps: "30s",
            rest: "30s",
            notes: "Full body warm-up exercise. Keep steady rhythm and breathe consistently."
          },
          {
            name: "High Knees",
            sets: "4",
            reps: "30s",
            rest: "30s",
            notes: "Drive knees up to hip level. Pump arms vigorously for maximum calorie burn."
          },
          {
            name: "Butt Kicks",
            sets: "4",
            reps: "30s",
            rest: "30s",
            notes: "Kick heels to glutes. Maintains heart rate elevation."
          },
          {
            name: "Mountain Climbers",
            sets: "4",
            reps: "30s",
            rest: "30s",
            notes: "Drive knees to chest alternately. Keep core tight and hips level."
          },
          {
            name: "Burpees (Modified)",
            sets: "3",
            reps: "20s",
            rest: "40s",
            notes: "Step back instead of jump if needed. Full body exercise for maximum burn."
          },
          {
            name: "Skater Hops",
            sets: "3",
            reps: "30s",
            rest: "30s",
            notes: "Lateral jumps side to side. Great for leg power and cardio."
          }
        ]
      };
    }

    if (workoutId === "1" && workoutType === "calorie-burning") {
      return {
        exercises: [
          {
            name: "Burpees",
            sets: "5",
            reps: "30s",
            rest: "30s",
            notes: "Full burpee with jump. Maximum calorie expenditure exercise."
          },
          {
            name: "Jump Squats",
            sets: "5",
            reps: "30s",
            rest: "30s",
            notes: "Explosive squats. Land softly and immediately go into next rep."
          },
          {
            name: "High Knees Sprint",
            sets: "5",
            reps: "30s",
            rest: "30s",
            notes: "Maximum intensity. Drive knees as high as possible."
          },
          {
            name: "Plank Jacks",
            sets: "4",
            reps: "30s",
            rest: "30s",
            notes: "In plank position, jump feet out and in. Core + cardio combo."
          },
          {
            name: "Tuck Jumps",
            sets: "4",
            reps: "20s",
            rest: "40s",
            notes: "Jump and bring knees to chest. High intensity plyometric move."
          },
          {
            name: "Speed Skaters",
            sets: "4",
            reps: "30s",
            rest: "30s",
            notes: "Fast lateral bounds. Touch ground with opposite hand for balance."
          }
        ]
      };
    }

    // METABOLIC WORKOUTS
    if (workoutId === "metabolic-free") {
      return {
        exercises: [
          {
            name: "Circuit Round 1: Jump Rope (or imaginary)",
            sets: "3 rounds",
            reps: "45s",
            rest: "15s",
            notes: "Maintain steady pace. Can do imaginary jump rope if no rope available."
          },
          {
            name: "Circuit Round 1: Push-Ups",
            sets: "continue",
            reps: "45s",
            rest: "15s",
            notes: "As many as possible in 45s with good form."
          },
          {
            name: "Circuit Round 1: Squats",
            sets: "continue",
            reps: "45s",
            rest: "90s",
            notes: "Finish round with bodyweight squats. Rest 90s before next round."
          },
          {
            name: "Circuit Round 2: Mountain Climbers",
            sets: "3 rounds",
            reps: "45s",
            rest: "15s",
            notes: "Increase intensity from previous round if possible."
          },
          {
            name: "Circuit Round 2: Dips (on chair)",
            sets: "continue",
            reps: "45s",
            rest: "15s",
            notes: "Use sturdy chair or bench. Lower until elbows at 90 degrees."
          },
          {
            name: "Circuit Round 2: Lunges",
            sets: "continue",
            reps: "45s",
            rest: "90s",
            notes: "Alternating lunges. Complete 3 full rounds."
          }
        ]
      };
    }

    if (workoutId === "1" && workoutType === "metabolic") {
      return {
        exercises: [
          {
            name: "EMOM (Every Minute On the Minute) Block 1",
            sets: "10 minutes",
            reps: "10 Burpees at start of each minute",
            rest: "remainder of minute",
            notes: "Start burpees at 0:00, 1:00, 2:00, etc. Rest is what's left of each minute."
          },
          {
            name: "Rest",
            sets: "1",
            reps: "2 minutes",
            rest: "2 min",
            notes: "Active recovery - walk around, shake out muscles."
          },
          {
            name: "Tabata Block: Jump Squats",
            sets: "8 rounds",
            reps: "20s work / 10s rest",
            rest: "10s between",
            notes: "20 seconds max effort, 10 seconds rest. Repeat 8 times (4 minutes total)."
          },
          {
            name: "Rest",
            sets: "1",
            reps: "1 minute",
            rest: "1 min",
            notes: "Prepare for final block."
          },
          {
            name: "AMRAP (As Many Rounds As Possible) - 5 minutes",
            sets: "AMRAP",
            reps: "10 Push-ups + 15 Mountain Climbers + 20 High Knees",
            rest: "minimal",
            notes: "Complete as many full rounds as possible in 5 minutes."
          }
        ]
      };
    }

    // CARDIO WORKOUTS  
    if (workoutId === "cardio-free") {
      return {
        exercises: [
          {
            name: "Warm-Up Walk/Jog",
            sets: "1",
            reps: "5 minutes",
            rest: "0s",
            notes: "Start easy, gradually increase pace to get heart rate up."
          },
          {
            name: "Easy Pace Jog",
            sets: "1",
            reps: "10 minutes",
            rest: "0s",
            notes: "Maintain conversational pace. Should be able to talk in full sentences."
          },
          {
            name: "Interval Block: Moderate Pace",
            sets: "5",
            reps: "1 min",
            rest: "1 min walk",
            notes: "Slightly faster than easy pace. Alternate with 1 min walking recovery."
          },
          {
            name: "Cool Down",
            sets: "1",
            reps: "5 minutes",
            rest: "0s",
            notes: "Gradually decrease pace to walking. Focus on breathing."
          }
        ]
      };
    }

    if (workoutId === "1" && workoutType === "cardio") {
      return {
        exercises: [
          {
            name: "Warm-Up",
            sets: "1",
            reps: "5 minutes",
            rest: "0s",
            notes: "Dynamic stretches and light jogging."
          },
          {
            name: "Steady State Run",
            sets: "1",
            reps: "15 minutes",
            rest: "0s",
            notes: "Maintain 65-75% max heart rate. Conversational pace."
          },
          {
            name: "Speed Intervals",
            sets: "6",
            reps: "90s hard / 90s easy",
            rest: "90s between",
            notes: "Push to 85% effort for 90s, recover at easy pace for 90s."
          },
          {
            name: "Recovery Jog",
            sets: "1",
            reps: "5 minutes",
            rest: "0s",
            notes: "Easy pace to bring heart rate down gradually."
          },
          {
            name: "Cool Down & Stretch",
            sets: "1",
            reps: "5 minutes",
            rest: "0s",
            notes: "Walk and static stretching for major muscle groups."
          }
        ]
      };
    }

    // MOBILITY WORKOUTS
    if (workoutId === "mobility-free") {
      return {
        exercises: [
          {
            name: "Cat-Cow Stretch",
            sets: "3",
            reps: "10 reps",
            rest: "30s",
            notes: "On hands and knees. Alternate between arching and rounding spine slowly."
          },
          {
            name: "World's Greatest Stretch",
            sets: "3",
            reps: "5 each side",
            rest: "30s",
            notes: "Lunge position with twist. Opens hips, hamstrings, and thoracic spine."
          },
          {
            name: "Hip Circles",
            sets: "3",
            reps: "10 each direction",
            rest: "30s",
            notes: "Standing, make large circles with hips. Both clockwise and counter-clockwise."
          },
          {
            name: "Shoulder Dislocations (with band or towel)",
            sets: "3",
            reps: "10 reps",
            rest: "30s",
            notes: "Wide grip, pass over head and behind back. Improves shoulder mobility."
          },
          {
            name: "90/90 Hip Stretch",
            sets: "3",
            reps: "45s each side",
            rest: "30s",
            notes: "Seated position. One leg in front at 90°, one behind at 90°. Lean forward."
          },
          {
            name: "Child's Pose to Upward Dog",
            sets: "3",
            reps: "8 reps",
            rest: "30s",
            notes: "Flow between positions. Stretches spine, hips, and shoulders."
          }
        ]
      };
    }

    if (workoutId === "1" && workoutType === "mobility") {
      return {
        exercises: [
          {
            name: "Dynamic Warm-Up Flow",
            sets: "2",
            reps: "5 min",
            rest: "60s",
            notes: "Arm circles, leg swings, torso twists, neck rolls."
          },
          {
            name: "Deep Squat Hold",
            sets: "3",
            reps: "60s",
            rest: "45s",
            notes: "Sit in bottom of squat. Use hands for balance if needed. Opens hips and ankles."
          },
          {
            name: "Thoracic Bridge",
            sets: "3",
            reps: "10 reps",
            rest: "45s",
            notes: "On hands and feet, lift hips high. Excellent for spine extension."
          },
          {
            name: "Cossack Squats",
            sets: "3",
            reps: "8 each side",
            rest: "60s",
            notes: "Side-to-side shifting squats. Improves hip and adductor mobility."
          },
          {
            name: "Thread the Needle",
            sets: "3",
            reps: "10 each side",
            rest: "45s",
            notes: "On hands and knees, thread arm under body. Rotates thoracic spine."
          },
          {
            name: "Lizard Pose with Rotation",
            sets: "3",
            reps: "8 each side",
            rest: "45s",
            notes: "Low lunge with rotation. Opens hips and improves spinal mobility."
          }
        ]
      };
    }

    // CHALLENGE WORKOUTS
    if (workoutId === "challenge-free") {
      return {
        exercises: [
          {
            name: "100 Push-Up Challenge (can break into sets)",
            sets: "As needed",
            reps: "100 total",
            rest: "as needed",
            notes: "Break into manageable sets. Example: 10 sets of 10, or 5 sets of 20."
          },
          {
            name: "100 Squat Challenge",
            sets: "As needed",
            reps: "100 total",
            rest: "as needed",
            notes: "Bodyweight squats. Focus on full range of motion for all reps."
          },
          {
            name: "3-Minute Plank Hold (total cumulative time)",
            sets: "As needed",
            reps: "3 min total",
            rest: "as needed",
            notes: "Can break into multiple holds. Track total time to reach 3 minutes."
          },
          {
            name: "50 Burpee Challenge",
            sets: "As needed",
            reps: "50 total",
            rest: "minimal",
            notes: "Complete as fast as possible with good form. Time yourself!"
          }
        ]
      };
    }

    if (workoutId === "1" && workoutType === "challenge") {
      return {
        exercises: [
          {
            name: "The Spartan 300 Challenge",
            sets: "1",
            reps: "Complete all 300 reps",
            rest: "minimal",
            notes: "25 Pull-ups, 50 Deadlifts, 50 Push-ups, 50 Box Jumps, 50 Floor Wipers, 50 Kettlebell Clean & Press, 25 Pull-ups. Modify as needed."
          },
          {
            name: "Rest",
            sets: "1",
            reps: "5 minutes",
            rest: "5 min",
            notes: "You'll need it after that! Hydrate well."
          },
          {
            name: "Bonus Round: Max Effort",
            sets: "1",
            reps: "AMRAP - 5 minutes",
            rest: "minimal",
            notes: "5 Burpees + 10 Push-ups + 15 Squats. As many rounds as possible in 5 minutes."
          }
        ]
      };
    }
    
    // Default workout structure for other workouts not yet detailed
    return {
      exercises: [
        {
          name: "Exercise 1",
          sets: "3-4",
          reps: "10-12",
          rest: "60-90s",
          notes: "Detailed workout plan coming soon! This workout will have specific exercises, sets, reps, and rest periods."
        }
      ]
    };
  };

  const workoutDetails = getWorkoutDetails(type || "", id || "");

  const content = (
    <>
      {/* Quick Info Bar */}
      <div className="bg-muted/30 rounded-lg p-4 mb-6 flex flex-wrap gap-4 justify-center text-sm">
        <span className="flex items-center gap-2">
          <strong>Duration:</strong> 30-45 minutes
        </span>
        <span className="flex items-center gap-2">
          <strong>Difficulty:</strong> {workoutInfo.difficulty === 1 ? 'Beginner' : workoutInfo.difficulty === 2 ? 'Intermediate' : 'Advanced'}
        </span>
        <span className="flex items-center gap-2">
          <strong>Equipment:</strong> {type?.includes('strength') ? 'Dumbbells/Bands' : type?.includes('cardio') ? 'None' : 'Varies'}
        </span>
      </div>

      <ShareButtons 
        title={workoutInfo.name} 
        url={window.location.href}
      />

      <WorkoutInteractions
        workoutId={`${type}-${id}`}
        workoutType={type || 'cardio'}
        workoutName={workoutInfo.name}
      />
      
      <WorkoutDisplay
        exercises={exercises}
        planContent={planContent}
        title={workoutInfo.name}
        serial={workoutInfo.serial}
        difficulty={workoutInfo.difficulty}
        workoutDetails={workoutDetails}
      />

      {/* Upsell Banner for Free Workouts */}
      {isFreeWorkout && (
        <div className="mt-8 bg-primary/10 border-2 border-primary/30 rounded-lg p-6 text-center">
          <h3 className="text-xl font-semibold mb-2">Want more?</h3>
          <p className="text-muted-foreground mb-4">
            Unlock 100+ workouts and tools — Join Premium.
          </p>
          <Button size="lg" onClick={() => navigate('/premium-benefits')}>
            Unlock Premium
          </Button>
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          onClick={() => navigate('/workout')}
          variant="outline"
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Workouts
        </Button>

        {isFreeWorkout ? content : <PremiumContentGate>{content}</PremiumContentGate>}
      </div>
    </div>
  );
};

export default IndividualWorkout;
