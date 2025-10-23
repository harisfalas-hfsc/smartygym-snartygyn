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
    "cardio-endurance": "Cardio Endurance Programs",
    "functional-strength": "Functional Strength Programs",
    "muscle-hypertrophy": "Muscle Hypertrophy Programs",
    "weight-loss": "Weight Loss Programs",
    "low-back-pain": "Low Back Pain Programs",
    "mobility-stability": "Mobility & Stability Programs"
  };

  const programData: { [key: string]: TrainingProgram[] } = {
    "cardio-endurance": [
      {
        id: "T-C001",
        name: "Cardio Performance Booster",
        description: "6-week cardiovascular conditioning plan to build aerobic base, increase VO₂ max, and improve overall endurance.",
        duration: "6",
        equipment: "equipment",
        level: "intermediate",
        imageUrl: cardioEnduranceImg,
        isFree: false
      },
      {
        id: "T-C002",
        name: "Cardio Max Endurance",
        description: "Progressive 8-week endurance plan for athletes seeking peak aerobic and anaerobic capacity using HIIT and threshold training.",
        duration: "8",
        equipment: "equipment",
        level: "advanced",
        imageUrl: cardioEnduranceImg,
        isFree: false
      }
    ],
    "functional-strength": [
      {
        id: "T-F001",
        name: "Functional Strength Builder",
        description: "6-week program to develop foundational full-body strength, improve neuromuscular control, and enhance movement efficiency.",
        duration: "6",
        equipment: "equipment",
        level: "intermediate",
        imageUrl: functionalStrengthImg,
        isFree: false
      },
      {
        id: "T-F002",
        name: "Functional Strength Elite",
        description: "Advanced 8-week program focused on multi-plane compound lifts, explosive power integration, and heavy load tolerance.",
        duration: "8",
        equipment: "equipment",
        level: "advanced",
        imageUrl: functionalStrengthImg,
        isFree: false
      }
    ],
    "muscle-hypertrophy": [
      {
        id: "T-H001",
        name: "Muscle Hypertrophy Builder",
        description: "6-week intermediate hypertrophy split designed to maximize muscle volume and structural balance with moderate loads.",
        duration: "6",
        equipment: "equipment",
        level: "intermediate",
        imageUrl: muscleHypertrophyImg,
        isFree: false
      },
      {
        id: "T-H002",
        name: "Muscle Hypertrophy Pro",
        description: "Advanced 8-week hypertrophy system emphasizing metabolic stress, mechanical tension, and progressive overload.",
        duration: "8",
        equipment: "equipment",
        level: "advanced",
        imageUrl: muscleHypertrophyImg,
        isFree: false
      }
    ],
    "weight-loss": [
      {
        id: "T-W001",
        name: "Weight Loss Ignite",
        description: "Metabolic-driven 6-week fat loss program combining circuit training, interval cardio, and strength elements.",
        duration: "6",
        equipment: "equipment",
        level: "intermediate",
        imageUrl: cardioEnduranceImg,
        isFree: false
      },
      {
        id: "T-W002",
        name: "Weight Loss Elite",
        description: "Aggressive 8-week fat-loss regimen focused on metabolic conditioning, resistance circuits, and athletic HIIT.",
        duration: "8",
        equipment: "equipment",
        level: "advanced",
        imageUrl: cardioEnduranceImg,
        isFree: false
      }
    ],
    "low-back-pain": [
      {
        id: "T-L001",
        name: "Low Back Pain Rehab Strength",
        description: "Controlled 6-week program for strengthening spinal stabilizers, improving posture, and reducing lower back discomfort.",
        duration: "6",
        equipment: "equipment",
        level: "intermediate",
        imageUrl: functionalStrengthImg,
        isFree: false
      },
      {
        id: "T-L002",
        name: "Low Back Performance",
        description: "Advanced 8-week strength and stability program to reinforce posterior chain and protect against re-injury.",
        duration: "8",
        equipment: "equipment",
        level: "advanced",
        imageUrl: functionalStrengthImg,
        isFree: false
      }
    ],
    "mobility-stability": [
      {
        id: "T-M001",
        name: "Mobility & Stability Flow",
        description: "Full-body 6-week mobility plan improving joint range, neuromuscular control, and posture.",
        duration: "6",
        equipment: "bodyweight",
        level: "intermediate",
        imageUrl: functionalStrengthImg,
        isFree: false
      },
      {
        id: "T-M002",
        name: "Mobility & Stability Master Flow",
        description: "Advanced 8-week flow for dynamic joint control, strength through range, and high-level body awareness.",
        duration: "8",
        equipment: "equipment",
        level: "advanced",
        imageUrl: functionalStrengthImg,
        isFree: false
      }
    ],
  };

  const title = programTitles[type || ""] || "Training Programs";
  const programs = programData[type || "cardio-endurance"] || [];
  
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
