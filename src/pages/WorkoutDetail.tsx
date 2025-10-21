import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

type EquipmentFilter = "all" | "bodyweight" | "equipment";
type LevelFilter = "all" | "beginner" | "intermediate" | "advanced";

interface Workout {
  id: string;
  name: string;
  description: string;
  duration: string;
  equipment: "bodyweight" | "equipment";
  level: "beginner" | "intermediate" | "advanced";
  imageUrl: string;
  isFree?: boolean;
}

const WorkoutDetail = () => {
  const navigate = useNavigate();
  const { type } = useParams();
  const [equipmentFilter, setEquipmentFilter] = useState<EquipmentFilter>("all");
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("all");

  const workoutTitles: { [key: string]: string } = {
    "strength": "Strength Workout",
    "calorie-burning": "Calorie Burning Workout",
    "metabolic": "Metabolic Workout",
    "cardio": "Cardio Workout",
    "mobility": "Mobility & Stability Workout",
    "power": "Power Workout",
    "challenge": "Challenge Workout"
  };

  const workoutData: { [key: string]: Workout[] } = {
    "strength": [
      { id: "strength-001", name: "Power Foundation", description: "Build your strength base with compound movements", duration: "45 min", equipment: "equipment", level: "intermediate", imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop", isFree: true },
      { id: "strength-002", name: "Iron Core", description: "Advanced strength targeting major muscle groups with raw power", duration: "60 min", equipment: "equipment", level: "advanced", imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop", isFree: true },
      { id: "strength-003", name: "Core Builder", description: "Foundational bodyweight strength for major muscle groups", duration: "30 min", equipment: "bodyweight", level: "beginner", imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop", isFree: true },
      { id: "strength-004", name: "Starter Strength", description: "Gentle intro to resistance training with light weights", duration: "30 min", equipment: "equipment", level: "beginner", imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop", isFree: true },
      { id: "strength-005", name: "Gravity Grind", description: "Bodyweight strength using tempo and holds", duration: "45 min", equipment: "bodyweight", level: "intermediate", imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop", isFree: true },
      { id: "strength-006", name: "Iron Circuit", description: "Full-body circuit with dumbbells and kettlebells", duration: "45 min", equipment: "equipment", level: "intermediate", imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop", isFree: true },
      { id: "strength-007", name: "Bodyweight Beast", description: "High-intensity bodyweight with advanced variations", duration: "60 min", equipment: "bodyweight", level: "advanced", imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop", isFree: true },
      { id: "strength-008", name: "Iron Engine", description: "Heavy strength workout for serious lifters", duration: "60 min", equipment: "equipment", level: "advanced", imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop", isFree: true },
    ],
    "calorie-burning": [
      { id: "calorie-001", name: "Metabolic Burn", description: "High-intensity fat-burning session", duration: "30 min", equipment: "bodyweight", level: "beginner", imageUrl: "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=800&h=600&fit=crop", isFree: true },
      { id: "calorie-002", name: "Fat Furnace", description: "Metabolic conditioning that torches calories", duration: "45 min", equipment: "equipment", level: "advanced", imageUrl: "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=800&h=600&fit=crop", isFree: true },
    ],
    "metabolic": [
      { id: "metabolic-001", name: "Metabolic Ignition", description: "Boost your metabolism with this explosive workout", duration: "35 min", equipment: "equipment", level: "intermediate", imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=600&fit=crop", isFree: true },
      { id: "metabolic-002", name: "MetaboShock", description: "Hybrid metabolic blending resistance and cardio", duration: "15 min", equipment: "equipment", level: "intermediate", imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=600&fit=crop", isFree: true },
    ],
    "cardio": [
      { id: "cardio-001", name: "Cardio Blast", description: "Elevate your heart rate and build endurance", duration: "40 min", equipment: "bodyweight", level: "beginner", imageUrl: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=800&h=600&fit=crop", isFree: true },
      { id: "cardio-002", name: "Pulse Igniter", description: "High-energy cardio to elevate heart rate", duration: "30 min", equipment: "bodyweight", level: "intermediate", imageUrl: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=800&h=600&fit=crop", isFree: true },
    ],
    "mobility": [
      { id: "mobility-001", name: "Flow & Mobility", description: "Enhance flexibility and joint health", duration: "30 min", equipment: "bodyweight", level: "beginner", imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop", isFree: true },
      { id: "mobility-002", name: "FlowForge", description: "Low-impact mobility and stability workout", duration: "60 min", equipment: "equipment", level: "beginner", imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop", isFree: true },
    ],
    "challenge": [
      { id: "challenge-001", name: "Ultimate Challenge", description: "Push your limits with this intense workout", duration: "50 min", equipment: "equipment", level: "advanced", imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=600&fit=crop", isFree: true },
    ],
    "power": [
      { id: "power-001", name: "Power Surge", description: "Develops explosive strength and fast-twitch activation", duration: "30 min", equipment: "equipment", level: "advanced", imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=600&fit=crop", isFree: true },
    ],
  };

  const title = workoutTitles[type || ""] || "Workout";
  const workouts = workoutData[type || "strength"] || [];
  
  const filteredWorkouts = workouts.filter(
    workout => 
      (equipmentFilter === "all" || workout.equipment === equipmentFilter) &&
      (levelFilter === "all" || workout.level === levelFilter)
  );

  return (
    <>
      <Helmet>
        <title>{title} | Smarty Gym</title>
        <meta name="description" content={`Browse ${title.toLowerCase()} workouts - bodyweight and equipment-based options`} />
      </Helmet>
      
      <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/workout")}
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
        </div>

        {/* Workout Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredWorkouts.map((workout) => (
            <Card
              key={workout.id}
              className="overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-gold bg-card border-border relative"
              onClick={() => navigate(`/workout/${type}/${workout.id}`)}
            >
              <div className="relative h-48 w-full overflow-hidden">
                <img 
                  src={workout.imageUrl} 
                  alt={workout.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                  {workout.duration}
                </div>
                {workout.isFree && (
                  <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                    FREE
                  </div>
                )}
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-semibold text-lg">{workout.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{workout.description}</p>
              </div>
            </Card>
          ))}
        </div>

        {filteredWorkouts.length === 0 && (
          <Card className="p-8">
            <p className="text-center text-muted-foreground">
              No workouts found for this combination. Try different filters.
            </p>
          </Card>
        )}
      </div>
      </div>
    </>
  );
};

export default WorkoutDetail;
