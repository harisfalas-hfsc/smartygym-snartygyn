import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { WorkoutDisplay } from "@/components/WorkoutDisplay";
import { PremiumContentGate } from "@/components/PremiumContentGate";
import { WorkoutInteractions } from "@/components/WorkoutInteractions";

const IndividualWorkout = () => {
  const navigate = useNavigate();
  const { type, id } = useParams();
  const workoutId = id || "1";
  const isFreeWorkout = workoutId.includes("-free") || type?.includes("-free");

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
