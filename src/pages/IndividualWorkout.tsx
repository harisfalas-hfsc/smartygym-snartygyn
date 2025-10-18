import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { WorkoutDisplay } from "@/components/WorkoutDisplay";
import { PremiumContentGate } from "@/components/PremiumContentGate";
import { WorkoutInteractions } from "@/components/WorkoutInteractions";

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
    
    // Default workout structure for other workouts
    return {
      exercises: [
        {
          name: "Exercise 1",
          sets: "3-4",
          reps: "10-12",
          rest: "60-90s",
          notes: "Focus on proper form and controlled movement."
        },
        {
          name: "Exercise 2",
          sets: "3-4",
          reps: "10-12",
          rest: "60-90s",
          notes: "Maintain consistent tempo throughout."
        },
        {
          name: "Exercise 3",
          sets: "3-4",
          reps: "12-15",
          rest: "45-60s",
          notes: "Challenge yourself while maintaining good form."
        }
      ]
    };
  };

  const workoutDetails = getWorkoutDetails(type || "", id || "");

  const content = (
    <>
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
