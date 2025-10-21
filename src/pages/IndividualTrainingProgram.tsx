import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { WorkoutDisplay } from "@/components/WorkoutDisplay";
import { PremiumContentGate } from "@/components/PremiumContentGate";
import { ProgramInteractions } from "@/components/ProgramInteractions";

const IndividualTrainingProgram = () => {
  const navigate = useNavigate();
  const { type, id } = useParams();
  const isFreeProgram = id?.includes("-free");

  // Program images mapping - matches TrainingProgramDetail.tsx
  const programImages: { [key: string]: string } = {
    "cardio-free": "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=800&h=600&fit=crop",
    "functional-strength-free": "https://images.unsplash.com/photo-1598971861713-54ad16a5c72e?w=800&h=600&fit=crop",
    "muscle-hypertrophy-free": "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&h=600&fit=crop",
    "weight-loss-free": "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&h=600&fit=crop",
    "low-back-pain-free": "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=800&h=600&fit=crop",
    "mobility-stability-free": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop",
  };

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

  // Get specific program details based on program type and ID
  const getProgramWeeks = (programType: string, programId: string) => {
    // CARDIO PROGRAMS
    if (programId === "cardio-free") {
      return [
        {
          week: 1,
          focus: "Building Base",
          days: [
            {
              day: "Day 1: Easy Run",
              exercises: [
                { name: "Warm-up Walk", sets: "1", reps: "5 min", intensity: "Light", rest: "0", notes: "Gradually increase pace" },
                { name: "Easy Jog", sets: "1", reps: "15 min", intensity: "60-65% HR max", rest: "0", notes: "Conversational pace" },
                { name: "Cool Down", sets: "1", reps: "5 min", intensity: "Light", rest: "0" }
              ]
            },
            {
              day: "Day 3: Interval Introduction",
              exercises: [
                { name: "Warm-up", sets: "1", reps: "10 min", intensity: "Easy", rest: "0" },
                { name: "Run Intervals", sets: "6", reps: "1 min hard / 2 min easy", intensity: "75-80% / 60%", rest: "2 min", notes: "Focus on form" },
                { name: "Cool Down", sets: "1", reps: "5 min", intensity: "Easy", rest: "0" }
              ]
            },
            {
              day: "Day 5: Steady State",
              exercises: [
                { name: "Steady Run", sets: "1", reps: "20 min", intensity: "65-70% HR max", rest: "0", notes: "Maintain consistent pace" }
              ]
            }
          ]
        },
        {
          week: 2,
          focus: "Increasing Volume",
          days: [
            {
              day: "Day 1: Easy Run",
              exercises: [
                { name: "Easy Jog", sets: "1", reps: "20 min", intensity: "60-65% HR max", rest: "0" }
              ]
            },
            {
              day: "Day 3: Intervals",
              exercises: [
                { name: "Warm-up", sets: "1", reps: "10 min", intensity: "Easy", rest: "0" },
                { name: "Run Intervals", sets: "8", reps: "1 min hard / 2 min easy", intensity: "75-80% / 60%", rest: "2 min" },
                { name: "Cool Down", sets: "1", reps: "5 min", intensity: "Easy", rest: "0" }
              ]
            },
            {
              day: "Day 5: Long Run",
              exercises: [
                { name: "Long Steady Run", sets: "1", reps: "25 min", intensity: "65-70% HR max", rest: "0" }
              ]
            }
          ]
        },
        {
          week: 3,
          focus: "Building Intensity",
          days: [
            {
              day: "Day 1: Tempo Run",
              exercises: [
                { name: "Warm-up", sets: "1", reps: "10 min", intensity: "Easy", rest: "0" },
                { name: "Tempo Run", sets: "1", reps: "15 min", intensity: "80-85% HR max", rest: "0", notes: "Comfortably hard pace" },
                { name: "Cool Down", sets: "1", reps: "5 min", intensity: "Easy", rest: "0" }
              ]
            },
            {
              day: "Day 3: Hill Repeats",
              exercises: [
                { name: "Warm-up", sets: "1", reps: "10 min", intensity: "Easy", rest: "0" },
                { name: "Hill Sprints", sets: "6", reps: "30s uphill / walk down", intensity: "85-90%", rest: "walk down", notes: "Find moderate grade" },
                { name: "Cool Down", sets: "1", reps: "5 min", intensity: "Easy", rest: "0" }
              ]
            },
            {
              day: "Day 5: Long Run",
              exercises: [
                { name: "Long Run", sets: "1", reps: "30 min", intensity: "65-70% HR max", rest: "0" }
              ]
            }
          ]
        },
        {
          week: 4,
          focus: "Recovery Week",
          days: [
            {
              day: "Day 1: Easy Run",
              exercises: [
                { name: "Easy Jog", sets: "1", reps: "20 min", intensity: "60-65% HR max", rest: "0", notes: "Focus on recovery" }
              ]
            },
            {
              day: "Day 3: Light Intervals",
              exercises: [
                { name: "Easy Intervals", sets: "4", reps: "1 min / 3 min", intensity: "70-75%", rest: "3 min", notes: "Reduced volume for recovery" }
              ]
            },
            {
              day: "Day 5: Easy Run",
              exercises: [
                { name: "Recovery Run", sets: "1", reps: "20 min", intensity: "60% HR max", rest: "0" }
              ]
            }
          ]
        }
      ];
    }

    if (programId === "1" && programType === "cardio") {
      return [
        {
          week: 1,
          focus: "Endurance Foundation",
          days: [
            {
              day: "Day 1: Easy Run + Strength",
              exercises: [
                { name: "Easy Run", sets: "1", reps: "25 min", intensity: "65% HR max", rest: "0" },
                { name: "Bodyweight Circuit", sets: "3", reps: "Squats, Push-ups, Lunges x10 each", intensity: "Moderate", rest: "90s" }
              ]
            },
            {
              day: "Day 3: Tempo Run",
              exercises: [
                { name: "Warm-up", sets: "1", reps: "15 min", intensity: "Easy", rest: "0" },
                { name: "Tempo Run", sets: "1", reps: "20 min", intensity: "80-85% HR max", rest: "0" },
                { name: "Cool Down", sets: "1", reps: "10 min", intensity: "Easy", rest: "0" }
              ]
            },
            {
              day: "Day 5: Intervals",
              exercises: [
                { name: "Warm-up", sets: "1", reps: "15 min", intensity: "Easy", rest: "0" },
                { name: "Speed Intervals", sets: "10", reps: "400m hard / 400m easy", intensity: "85-90%", rest: "400m jog" }
              ]
            },
            {
              day: "Day 7: Long Run",
              exercises: [
                { name: "Long Steady Run", sets: "1", reps: "40 min", intensity: "65-70% HR max", rest: "0" }
              ]
            }
          ]
        },
        {
          week: 2,
          focus: "Volume Increase",
          days: [
            {
              day: "Day 1: Easy Run + Strength",
              exercises: [
                { name: "Easy Run", sets: "1", reps: "30 min", intensity: "65% HR max", rest: "0" },
                { name: "Bodyweight Circuit", sets: "4", reps: "Squats, Push-ups, Lunges x12 each", intensity: "Moderate", rest: "90s" }
              ]
            },
            {
              day: "Day 3: Tempo Run",
              exercises: [
                { name: "Tempo Run", sets: "1", reps: "25 min", intensity: "80-85% HR max", rest: "0" }
              ]
            },
            {
              day: "Day 5: Intervals",
              exercises: [
                { name: "Speed Intervals", sets: "12", reps: "400m hard / 400m easy", intensity: "85-90%", rest: "400m jog" }
              ]
            },
            {
              day: "Day 7: Long Run",
              exercises: [
                { name: "Long Run", sets: "1", reps: "50 min", intensity: "65-70% HR max", rest: "0" }
              ]
            }
          ]
        }
      ];
    }

    // MUSCLE HYPERTROPHY PROGRAMS
    if (programId === "muscle-hypertrophy-free") {
      return [
        {
          week: 1,
          focus: "Adaptation Phase",
          days: [
            {
              day: "Day 1: Upper Body",
              exercises: [
                { name: "Push-ups", sets: "3", reps: "12-15", intensity: "Bodyweight", rest: "90s", notes: "Controlled tempo" },
                { name: "Pull-ups (assisted if needed)", sets: "3", reps: "8-10", intensity: "Bodyweight", rest: "90s" },
                { name: "Pike Push-ups", sets: "3", reps: "10-12", intensity: "Bodyweight", rest: "60s" },
                { name: "Dips (on chairs)", sets: "3", reps: "10-12", intensity: "Bodyweight", rest: "90s" }
              ]
            },
            {
              day: "Day 3: Lower Body",
              exercises: [
                { name: "Squats", sets: "4", reps: "15-20", intensity: "Bodyweight", rest: "90s", notes: "Full depth" },
                { name: "Bulgarian Split Squats", sets: "3", reps: "12 each", intensity: "Bodyweight", rest: "90s" },
                { name: "Nordic Curls (assisted)", sets: "3", reps: "6-8", intensity: "Bodyweight", rest: "2 min" },
                { name: "Calf Raises", sets: "4", reps: "20", intensity: "Bodyweight", rest: "60s" }
              ]
            },
            {
              day: "Day 5: Full Body",
              exercises: [
                { name: "Archer Push-ups", sets: "3", reps: "8 each side", intensity: "Bodyweight", rest: "90s" },
                { name: "Pistol Squats (assisted)", sets: "3", reps: "6 each leg", intensity: "Bodyweight", rest: "2 min" },
                { name: "Inverted Rows", sets: "3", reps: "12-15", intensity: "Bodyweight", rest: "90s" },
                { name: "Plank to Push-up", sets: "3", reps: "10", intensity: "Bodyweight", rest: "60s" }
              ]
            }
          ]
        },
        {
          week: 2,
          focus: "Volume Increase",
          days: [
            {
              day: "Day 1: Upper Body",
              exercises: [
                { name: "Push-ups", sets: "4", reps: "12-15", intensity: "Bodyweight", rest: "90s" },
                { name: "Pull-ups", sets: "4", reps: "8-10", intensity: "Bodyweight", rest: "90s" },
                { name: "Pike Push-ups", sets: "4", reps: "10-12", intensity: "Bodyweight", rest: "60s" },
                { name: "Dips", sets: "4", reps: "10-12", intensity: "Bodyweight", rest: "90s" }
              ]
            },
            {
              day: "Day 3: Lower Body",
              exercises: [
                { name: "Squats", sets: "5", reps: "15-20", intensity: "Bodyweight", rest: "90s" },
                { name: "Bulgarian Split Squats", sets: "4", reps: "12 each", intensity: "Bodyweight", rest: "90s" },
                { name: "Nordic Curls", sets: "4", reps: "6-8", intensity: "Bodyweight", rest: "2 min" },
                { name: "Calf Raises", sets: "5", reps: "20", intensity: "Bodyweight", rest: "60s" }
              ]
            }
          ]
        }
      ];
    }

    // Default - will add more programs gradually
    return [];
  };

  const programWeeks = getProgramWeeks(type || "", id || "");
  const programImage = programImages[id || ""] || "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=800&h=600&fit=crop";

  const content = (
    <>
      {/* Hero Image */}
      <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden mb-6">
        <img 
          src={programImage} 
          alt={programInfo.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent flex items-end">
          <div className="p-6 w-full">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{programInfo.name}</h1>
            <p className="text-sm text-muted-foreground">Serial: {programInfo.serial}</p>
          </div>
        </div>
      </div>

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
        programWeeks={programWeeks}
      />
    </>
  );

  return (
    <>
      <Helmet>
        <title>{programInfo.name} | Smarty Gym</title>
        <meta name="description" content={`${programInfo.name} - Program #${programInfo.serial}`} />
      </Helmet>
      
      <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {isFreeProgram ? content : <PremiumContentGate>{content}</PremiumContentGate>}
      </div>
      </div>
    </>
  );
};

export default IndividualTrainingProgram;
