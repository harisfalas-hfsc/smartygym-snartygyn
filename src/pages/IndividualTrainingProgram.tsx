import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { WorkoutDisplay } from "@/components/WorkoutDisplay";
import { PremiumContentGate } from "@/components/PremiumContentGate";
import { ProgramInteractions } from "@/components/ProgramInteractions";

const IndividualTrainingProgram = () => {
  const navigate = useNavigate();
  const { type, id } = useParams();
  const programId = id || "1";
  const isFreeProgram = programId.includes("-free") || type?.includes("-free");

  // Sample program names based on type and id
  const programNames: { [key: string]: { [key: string]: { name: string; difficulty: number; serial: string } } } = {
    cardio: {
      "1": { name: "Cardio Endurance Builder", difficulty: 1, serial: "CP-001" },
      "2": { name: "Elite Cardio Performance", difficulty: 3, serial: "CP-002" },
    },
    functional: {
      "1": { name: "Functional Fitness Foundation", difficulty: 1, serial: "FP-001" },
      "2": { name: "Functional Athlete Program", difficulty: 3, serial: "FP-002" },
    },
    strength: {
      "1": { name: "Strength Development Program", difficulty: 2, serial: "SP-001" },
      "2": { name: "Maximum Strength Protocol", difficulty: 3, serial: "SP-002" },
    },
    hypertrophy: {
      "1": { name: "Muscle Growth Foundation", difficulty: 2, serial: "HP-001" },
      "2": { name: "Advanced Mass Building", difficulty: 3, serial: "HP-002" },
    },
    weightloss: {
      "1": { name: "Weight Loss Transformation", difficulty: 1, serial: "WP-001" },
      "2": { name: "Advanced Fat Loss Program", difficulty: 3, serial: "WP-002" },
    },
    lowbackpain: {
      "1": { name: "Back Pain Relief Program", difficulty: 1, serial: "LP-001" },
      "2": { name: "Spine Health Advanced", difficulty: 2, serial: "LP-002" },
    },
    mobility: {
      "1": { name: "Mobility Enhancement Program", difficulty: 1, serial: "MP-001" },
      "2": { name: "Elite Mobility & Stability", difficulty: 3, serial: "MP-002" },
    },
  };

  const programInfo = programNames[type || "cardio"]?.[id || "1"] || { 
    name: "Training Program", 
    difficulty: 2,
    serial: "TP-001"
  };

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

  const content = (
    <>
      <ProgramInteractions
        programId={`${type}-${id}`}
        programType={type || 'cardio'}
        programName={programInfo.name}
      />
      
      <WorkoutDisplay
        exercises={exercises}
        planContent={planContent}
        title={programInfo.name}
        serial={programInfo.serial}
        difficulty={programInfo.difficulty}
      />
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          onClick={() => navigate('/training-program')}
          variant="outline"
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Training Programs
        </Button>

        {isFreeProgram ? content : <PremiumContentGate>{content}</PremiumContentGate>}
      </div>
    </div>
  );
};

export default IndividualTrainingProgram;
