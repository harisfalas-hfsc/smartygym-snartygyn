import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { WorkoutDisplay } from "@/components/WorkoutDisplay";

const IndividualWorkout = () => {
  const navigate = useNavigate();
  const { type, id } = useParams();

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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          onClick={() => navigate(`/workout/${type}`)}
          variant="outline"
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to {type} Workouts
        </Button>

        <WorkoutDisplay
          exercises={exercises}
          planContent={planContent}
          title={`Workout #${id}`}
        />
      </div>
    </div>
  );
};

export default IndividualWorkout;
