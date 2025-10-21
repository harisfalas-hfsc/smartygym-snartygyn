import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Calendar } from "lucide-react";
import cardioEnduranceImg from "@/assets/cardio-endurance-program.jpg";
import functionalStrengthImg from "@/assets/functional-strength-program.jpg";
import muscleHypertrophyImg from "@/assets/muscle-hypertrophy-program.jpg";

type EquipmentFilter = "all" | "bodyweight" | "equipment";
type LevelFilter = "all" | "beginner" | "intermediate" | "advanced";
type DurationFilter = "all" | "4" | "6" | "8";

interface TrainingProgram {
  id: string;
  name: string;
  description: string;
  duration: "4" | "6" | "8";
  equipment: "bodyweight" | "equipment";
  level: "beginner" | "intermediate" | "advanced";
  imageUrl: string;
  isFree?: boolean;
}

const TrainingProgramDetail = () => {
  const navigate = useNavigate();
  const { type } = useParams();
  const [equipmentFilter, setEquipmentFilter] = useState<EquipmentFilter>("all");
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("all");
  const [durationFilter, setDurationFilter] = useState<DurationFilter>("all");

  const programTitles: { [key: string]: string } = {
    "cardio": "Cardio Program",
    "functional-strength": "Functional Strength Program",
    "muscle-hypertrophy": "Muscle Hypertrophy Program",
    "weight-loss": "Weight Loss Program",
    "low-back-pain": "Low Back Pain Program",
    "mobility-stability": "Mobility & Stability Program"
  };

  const programData: { [key: string]: TrainingProgram[] } = {
    "cardio": [
      { id: "cardio-001", name: "Cardio Endurance Builder", description: "4-week progressive cardio program", duration: "4", equipment: "bodyweight", level: "beginner", imageUrl: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=800&h=600&fit=crop", isFree: true },
      { id: "cardio-cg-001", name: "Cardio Endurance & Heart Longevity", description: "Improve aerobic capacity, heart health, and stamina through steady-state, interval, and tempo-based training", duration: "6", equipment: "bodyweight", level: "beginner", imageUrl: cardioEnduranceImg, isFree: true },
    ],
    "functional-strength": [
      { id: "functional-001", name: "Functional Power Program", description: "6-week functional strength development", duration: "6", equipment: "equipment", level: "intermediate", imageUrl: "https://images.unsplash.com/photo-1598971861713-54ad16a5c72e?w=800&h=600&fit=crop", isFree: true },
      { id: "functional-fs-002", name: "Functional Strength & Movement Control", description: "Compound lifts and movement patterns that enhance real-life performance, stability, and injury prevention", duration: "6", equipment: "equipment", level: "intermediate", imageUrl: functionalStrengthImg, isFree: true },
    ],
    "muscle-hypertrophy": [
      { id: "hypertrophy-001", name: "Mass Builder Program", description: "8-week muscle growth program", duration: "8", equipment: "equipment", level: "intermediate", imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&h=600&fit=crop", isFree: true },
      { id: "hypertrophy-mh-003", name: "Muscle Hypertrophy Builder", description: "Stimulate muscle growth through volume, intensity, and controlled tempo across all major muscle groups", duration: "6", equipment: "equipment", level: "intermediate", imageUrl: muscleHypertrophyImg, isFree: true },
    ],
    "weight-loss": [
      { id: "weightloss-001", name: "Fat Loss Transform", description: "6-week weight loss program", duration: "6", equipment: "bodyweight", level: "beginner", imageUrl: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&h=600&fit=crop", isFree: true },
    ],
    "low-back-pain": [
      { id: "backcare-001", name: "Back Rehabilitation Program", description: "4-week back pain relief program", duration: "4", equipment: "bodyweight", level: "beginner", imageUrl: "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=800&h=600&fit=crop", isFree: true },
    ],
    "mobility-stability": [
      { id: "mobility-001", name: "Mobility Mastery Program", description: "4-week mobility enhancement program", duration: "4", equipment: "bodyweight", level: "beginner", imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop", isFree: true },
    ],
  };

  const title = programTitles[type || ""] || "Training Program";
  const programs = programData[type || "cardio"] || [];
  
  const filteredPrograms = programs.filter(
    program => 
      (equipmentFilter === "all" || program.equipment === equipmentFilter) &&
      (levelFilter === "all" || program.level === levelFilter) &&
      (durationFilter === "all" || program.duration === durationFilter)
  );

  return (
    <>
      <Helmet>
        <title>{title} | Smarty Gym</title>
        <meta name="description" content={`Browse ${title.toLowerCase()} training programs - 4, 6, and 8 week options`} />
      </Helmet>
      
      <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/trainingprogram")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span className="text-xs sm:text-sm">Back</span>
        </Button>
        
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8">{title}</h1>
        
        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Equipment Filter */}
          <div>
            <p className="text-sm font-medium mb-2">Equipment Type</p>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={equipmentFilter === "all" ? "default" : "outline"}
                onClick={() => setEquipmentFilter("all")}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={equipmentFilter === "bodyweight" ? "default" : "outline"}
                onClick={() => setEquipmentFilter("bodyweight")}
                size="sm"
              >
                Body Weight
              </Button>
              <Button
                variant={equipmentFilter === "equipment" ? "default" : "outline"}
                onClick={() => setEquipmentFilter("equipment")}
                size="sm"
              >
                Equipment
              </Button>
            </div>
          </div>

          {/* Level Filter */}
          <div>
            <p className="text-sm font-medium mb-2">Experience Level</p>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={levelFilter === "all" ? "default" : "outline"}
                onClick={() => setLevelFilter("all")}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={levelFilter === "beginner" ? "default" : "outline"}
                onClick={() => setLevelFilter("beginner")}
                size="sm"
              >
                Beginner
              </Button>
              <Button
                variant={levelFilter === "intermediate" ? "default" : "outline"}
                onClick={() => setLevelFilter("intermediate")}
                size="sm"
              >
                Intermediate
              </Button>
              <Button
                variant={levelFilter === "advanced" ? "default" : "outline"}
                onClick={() => setLevelFilter("advanced")}
                size="sm"
              >
                Advanced
              </Button>
            </div>
          </div>

          {/* Duration Filter */}
          <div>
            <p className="text-sm font-medium mb-2">Program Duration</p>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={durationFilter === "all" ? "default" : "outline"}
                onClick={() => setDurationFilter("all")}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={durationFilter === "4" ? "default" : "outline"}
                onClick={() => setDurationFilter("4")}
                size="sm"
              >
                4 Weeks
              </Button>
              <Button
                variant={durationFilter === "6" ? "default" : "outline"}
                onClick={() => setDurationFilter("6")}
                size="sm"
              >
                6 Weeks
              </Button>
              <Button
                variant={durationFilter === "8" ? "default" : "outline"}
                onClick={() => setDurationFilter("8")}
                size="sm"
              >
                8 Weeks
              </Button>
            </div>
          </div>
        </div>

        {/* Program Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredPrograms.map((program) => (
            <Card
              key={program.id}
              className="overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-gold bg-card border-border"
              onClick={() => navigate(`/trainingprogram/${type}/${program.id}`)}
            >
              <div className="relative h-48 w-full overflow-hidden">
                <img 
                  src={program.imageUrl} 
                  alt={program.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{program.duration} weeks</span>
                </div>
                {program.isFree && (
                  <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                    FREE
                  </div>
                )}
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-semibold text-lg">{program.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{program.description}</p>
              </div>
            </Card>
          ))}
        </div>

        {filteredPrograms.length === 0 && (
          <Card className="p-8">
            <p className="text-center text-muted-foreground">
              No programs found for this combination. Try different filters.
            </p>
          </Card>
        )}
      </div>
      </div>
    </>
  );
};

export default TrainingProgramDetail;
