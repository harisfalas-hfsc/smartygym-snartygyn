import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

type EquipmentFilter = "bodyweight" | "equipment";
type LevelFilter = "beginner" | "intermediate" | "advanced";

const WorkoutDetail = () => {
  const navigate = useNavigate();
  const { type } = useParams();
  const [equipmentFilter, setEquipmentFilter] = useState<EquipmentFilter>("bodyweight");
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("beginner");

  const workoutTitles: { [key: string]: string } = {
    "strength": "Strength Workout",
    "calorie-burning": "Calorie Burning Workout",
    "metabolic": "Metabolic Workout",
    "cardio": "Cardio Workout",
    "mobility": "Mobility & Stability Workout",
    "challenge": "Challenge Workout"
  };

  const title = workoutTitles[type || ""] || "Workout";

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/workout")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span className="text-xs sm:text-sm">Back to Workouts</span>
        </Button>
        
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8">{title}</h1>
        
        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Equipment Filter */}
          <div>
            <p className="text-sm font-medium mb-2">Equipment Type</p>
            <div className="flex gap-2">
              <Button
                variant={equipmentFilter === "bodyweight" ? "default" : "outline"}
                onClick={() => setEquipmentFilter("bodyweight")}
                className="flex-1 sm:flex-none"
              >
                Body Weight
              </Button>
              <Button
                variant={equipmentFilter === "equipment" ? "default" : "outline"}
                onClick={() => setEquipmentFilter("equipment")}
                className="flex-1 sm:flex-none"
              >
                Equipment
              </Button>
            </div>
          </div>

          {/* Level Filter */}
          <div>
            <p className="text-sm font-medium mb-2">Experience Level</p>
            <div className="flex gap-2">
              <Button
                variant={levelFilter === "beginner" ? "default" : "outline"}
                onClick={() => setLevelFilter("beginner")}
                className="flex-1 sm:flex-none"
              >
                Beginner
              </Button>
              <Button
                variant={levelFilter === "intermediate" ? "default" : "outline"}
                onClick={() => setLevelFilter("intermediate")}
                className="flex-1 sm:flex-none"
              >
                Intermediate
              </Button>
              <Button
                variant={levelFilter === "advanced" ? "default" : "outline"}
                onClick={() => setLevelFilter("advanced")}
                className="flex-1 sm:flex-none"
              >
                Advanced
              </Button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <Card className="p-6">
          <p className="text-muted-foreground text-center">
            Showing {equipmentFilter === "bodyweight" ? "Body Weight" : "Equipment"} workouts for {levelFilter.charAt(0).toUpperCase() + levelFilter.slice(1)} level
          </p>
          <p className="text-muted-foreground text-center mt-4">
            Workout content coming soon...
          </p>
        </Card>
      </div>
    </div>
  );
};

export default WorkoutDetail;
