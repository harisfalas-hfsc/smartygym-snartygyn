import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { WorkoutDisplay } from "@/components/WorkoutDisplay";

const IndividualTrainingProgram = () => {
  const navigate = useNavigate();
  const { type, id } = useParams();

  // Sample exercises data - would come from database
  const exercises = [
    {
      name: "Exercise 1",
      video_id: "iSSAk4XCsRA",
      video_url: "https://www.youtube.com/watch?v=iSSAk4XCsRA"
    },
    {
      name: "Exercise 2",
      video_id: "IODxDxX7oi4",
      video_url: "https://www.youtube.com/watch?v=IODxDxX7oi4"
    }
  ];

  const planContent = `This training program is a structured, multi-week approach designed to help you progressively build strength, endurance, and overall fitness.

Program Overview:
The program is divided into weekly phases, each building upon the previous week's work. You'll follow a carefully designed progression that allows your body to adapt and grow stronger while minimizing the risk of overtraining or injury.

Week-by-Week Structure:
- Week 1-2: Foundation phase - Building base fitness and proper movement patterns
- Week 3-4: Development phase - Increasing intensity and volume
- Week 5-6: Progressive phase - Peak intensity and performance
- Week 7-8: Consolidation phase - Maintaining gains and preparing for the next cycle

Training Schedule:
Follow the prescribed training days with adequate rest between sessions. Each week includes 3-5 training days depending on your experience level and the program requirements.

Equipment Requirements: As specified in the program type
Time Commitment: 30-60 minutes per session
Rest Days: Built into the program for optimal recovery

This program requires completion of the PAR-Q+ assessment before beginning. Always listen to your body and adjust the program as needed based on your recovery and performance.`;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          onClick={() => navigate(`/training-program/${type}`)}
          variant="outline"
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to {type} Programs
        </Button>

        <WorkoutDisplay
          exercises={exercises}
          planContent={planContent}
          title={`Training Program #${id}`}
        />
      </div>
    </div>
  );
};

export default IndividualTrainingProgram;
