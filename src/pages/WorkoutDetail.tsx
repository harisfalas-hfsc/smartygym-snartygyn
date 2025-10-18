import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Clock, TrendingUp } from "lucide-react";

type EquipmentFilter = "bodyweight" | "equipment";
type LevelFilter = "beginner" | "intermediate" | "advanced";

interface Workout {
  id: string;
  name: string;
  description: string;
  duration: string;
  equipment: EquipmentFilter;
  level: LevelFilter;
}

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

  const workoutData: { [key: string]: Workout[] } = {
    "strength": [
      // Bodyweight Beginner
      { id: "1", name: "Foundation Builder", description: "Master the basics with push-ups, squats, and planks", duration: "25 min", equipment: "bodyweight", level: "beginner" },
      { id: "2", name: "Core Starter", description: "Build core strength with fundamental movements", duration: "20 min", equipment: "bodyweight", level: "beginner" },
      // Bodyweight Intermediate
      { id: "3", name: "Power Push", description: "Advance your push-up game with variations", duration: "30 min", equipment: "bodyweight", level: "intermediate" },
      { id: "4", name: "Leg Legend", description: "Single-leg movements for balanced strength", duration: "35 min", equipment: "bodyweight", level: "intermediate" },
      // Bodyweight Advanced
      { id: "5", name: "Calisthenics King", description: "Master muscle-ups and advanced gymnastics", duration: "40 min", equipment: "bodyweight", level: "advanced" },
      { id: "6", name: "Explosive Edge", description: "Plyometric power with clap push-ups and pistol squats", duration: "45 min", equipment: "bodyweight", level: "advanced" },
      // Equipment Beginner
      { id: "7", name: "Dumbbell Debut", description: "Learn proper form with light weights", duration: "30 min", equipment: "equipment", level: "beginner" },
      { id: "8", name: "Barbell Basics", description: "Introduction to compound lifts", duration: "35 min", equipment: "equipment", level: "beginner" },
      // Equipment Intermediate
      { id: "9", name: "Iron Warrior", description: "Progressive overload with heavier weights", duration: "45 min", equipment: "equipment", level: "intermediate" },
      { id: "10", name: "Muscle Sculptor", description: "Hypertrophy-focused training splits", duration: "50 min", equipment: "equipment", level: "intermediate" },
      // Equipment Advanced
      { id: "11", name: "Powerlifting Pro", description: "Heavy compound lifts for maximum strength", duration: "60 min", equipment: "equipment", level: "advanced" },
      { id: "12", name: "Beast Mode", description: "Advanced techniques like drop sets and supersets", duration: "55 min", equipment: "equipment", level: "advanced" },
    ],
    "calorie-burning": [
      // Bodyweight Beginner
      { id: "1", name: "Fat Torch Starter", description: "Simple movements to get your heart pumping", duration: "20 min", equipment: "bodyweight", level: "beginner" },
      { id: "2", name: "Cardio Kickstart", description: "Low-impact movements for calorie burn", duration: "25 min", equipment: "bodyweight", level: "beginner" },
      // Bodyweight Intermediate
      { id: "3", name: "Burpee Blaster", description: "High-intensity intervals with bodyweight exercises", duration: "30 min", equipment: "bodyweight", level: "intermediate" },
      { id: "4", name: "Sweat Storm", description: "Non-stop movement for maximum calorie burn", duration: "35 min", equipment: "bodyweight", level: "intermediate" },
      // Bodyweight Advanced
      { id: "5", name: "Inferno Circuit", description: "Intense bodyweight circuits for serious burn", duration: "40 min", equipment: "bodyweight", level: "advanced" },
      { id: "6", name: "Afterburn Annihilator", description: "EPOC-focused workout for post-exercise burn", duration: "45 min", equipment: "bodyweight", level: "advanced" },
      // Equipment Beginner
      { id: "7", name: "Kettlebell Ignite", description: "Swing and press your way to fat loss", duration: "25 min", equipment: "equipment", level: "beginner" },
      { id: "8", name: "Jump Rope Journey", description: "Cardio basics with rope work", duration: "20 min", equipment: "equipment", level: "beginner" },
      // Equipment Intermediate
      { id: "9", name: "Battle Rope Blaze", description: "Intense rope work for full-body burn", duration: "35 min", equipment: "equipment", level: "intermediate" },
      { id: "10", name: "Medicine Ball Mayhem", description: "Explosive movements with med balls", duration: "40 min", equipment: "equipment", level: "intermediate" },
      // Equipment Advanced
      { id: "11", name: "Sled Push Inferno", description: "Heavy sled work for maximum calorie expenditure", duration: "45 min", equipment: "equipment", level: "advanced" },
      { id: "12", name: "Complex Crusher", description: "Advanced equipment complexes for elite burn", duration: "50 min", equipment: "equipment", level: "advanced" },
    ],
    "metabolic": [
      // Bodyweight Beginner
      { id: "1", name: "Metabolism Spark", description: "Wake up your metabolism with simple circuits", duration: "20 min", equipment: "bodyweight", level: "beginner" },
      { id: "2", name: "Tempo Trainer", description: "Control your pace for metabolic adaptation", duration: "25 min", equipment: "bodyweight", level: "beginner" },
      // Bodyweight Intermediate
      { id: "3", name: "HIIT Hurricane", description: "High-intensity intervals for metabolic boost", duration: "30 min", equipment: "bodyweight", level: "intermediate" },
      { id: "4", name: "Tabata Thunder", description: "20/10 intervals for maximum metabolic effect", duration: "25 min", equipment: "bodyweight", level: "intermediate" },
      // Bodyweight Advanced
      { id: "5", name: "Metabolic Massacre", description: "Elite-level conditioning for peak metabolism", duration: "35 min", equipment: "bodyweight", level: "advanced" },
      { id: "6", name: "EMOM Extreme", description: "Every minute on the minute metabolic challenge", duration: "40 min", equipment: "bodyweight", level: "advanced" },
      // Equipment Beginner
      { id: "7", name: "Dumbbell Metabolism", description: "Light weight circuits for metabolic training", duration: "25 min", equipment: "equipment", level: "beginner" },
      { id: "8", name: "Resistance Revamp", description: "Bands and weights for metabolic conditioning", duration: "30 min", equipment: "equipment", level: "beginner" },
      // Equipment Intermediate
      { id: "9", name: "Complex Catalyst", description: "Equipment complexes for metabolic power", duration: "35 min", equipment: "equipment", level: "intermediate" },
      { id: "10", name: "Metabolic Matrix", description: "Mixed modality metabolic conditioning", duration: "40 min", equipment: "equipment", level: "intermediate" },
      // Equipment Advanced
      { id: "11", name: "Barbell Burnout", description: "Heavy barbell complexes for elite conditioning", duration: "45 min", equipment: "equipment", level: "advanced" },
      { id: "12", name: "Conditioning Crown", description: "Ultimate metabolic challenge with all equipment", duration: "50 min", equipment: "equipment", level: "advanced" },
    ],
    "cardio": [
      // Bodyweight Beginner
      { id: "1", name: "Heart Starter", description: "Easy movements to build cardiovascular base", duration: "20 min", equipment: "bodyweight", level: "beginner" },
      { id: "2", name: "Steady Steps", description: "Low-impact cardio for endurance building", duration: "25 min", equipment: "bodyweight", level: "beginner" },
      // Bodyweight Intermediate
      { id: "3", name: "Cardio Climber", description: "Step up your cardio with bodyweight intervals", duration: "35 min", equipment: "bodyweight", level: "intermediate" },
      { id: "4", name: "Endurance Engine", description: "Build lasting cardiovascular fitness", duration: "40 min", equipment: "bodyweight", level: "intermediate" },
      // Bodyweight Advanced
      { id: "5", name: "Cardio Crusher", description: "High-intensity cardio for peak performance", duration: "45 min", equipment: "bodyweight", level: "advanced" },
      { id: "6", name: "VO2 Max Mastery", description: "Push your aerobic capacity to the limit", duration: "50 min", equipment: "bodyweight", level: "advanced" },
      // Equipment Beginner
      { id: "7", name: "Rope Ready", description: "Jump rope basics for cardio fitness", duration: "20 min", equipment: "equipment", level: "beginner" },
      { id: "8", name: "Bike Basics", description: "Cycling intervals for heart health", duration: "30 min", equipment: "equipment", level: "beginner" },
      // Equipment Intermediate
      { id: "9", name: "Rowing Rhythm", description: "Master the rowing machine for full-body cardio", duration: "40 min", equipment: "equipment", level: "intermediate" },
      { id: "10", name: "Assault Advance", description: "Air bike intervals for serious cardio gains", duration: "35 min", equipment: "equipment", level: "intermediate" },
      // Equipment Advanced
      { id: "11", name: "Triathlon Prep", description: "Mixed cardio modalities for elite endurance", duration: "60 min", equipment: "equipment", level: "advanced" },
      { id: "12", name: "Cardio Champion", description: "Competition-level cardiovascular training", duration: "55 min", equipment: "equipment", level: "advanced" },
    ],
    "mobility": [
      // Bodyweight Beginner
      { id: "1", name: "Flexibility Foundation", description: "Basic stretches for improved range of motion", duration: "20 min", equipment: "bodyweight", level: "beginner" },
      { id: "2", name: "Joint Journey", description: "Gentle movements for joint health", duration: "25 min", equipment: "bodyweight", level: "beginner" },
      // Bodyweight Intermediate
      { id: "3", name: "Flow State", description: "Dynamic stretching sequences for mobility", duration: "30 min", equipment: "bodyweight", level: "intermediate" },
      { id: "4", name: "Balance Builder", description: "Stability work with controlled movements", duration: "35 min", equipment: "bodyweight", level: "intermediate" },
      // Bodyweight Advanced
      { id: "5", name: "Contortionist Challenge", description: "Advanced flexibility and control", duration: "40 min", equipment: "bodyweight", level: "advanced" },
      { id: "6", name: "Mobility Master", description: "Elite-level range of motion training", duration: "45 min", equipment: "bodyweight", level: "advanced" },
      // Equipment Beginner
      { id: "7", name: "Foam Roll Relief", description: "Self-myofascial release basics", duration: "20 min", equipment: "equipment", level: "beginner" },
      { id: "8", name: "Band Stretch", description: "Resistance band-assisted stretching", duration: "25 min", equipment: "equipment", level: "beginner" },
      // Equipment Intermediate
      { id: "9", name: "Yoga Block Flow", description: "Props-assisted mobility work", duration: "35 min", equipment: "equipment", level: "intermediate" },
      { id: "10", name: "Stability Sphere", description: "Balance ball exercises for core stability", duration: "30 min", equipment: "equipment", level: "intermediate" },
      // Equipment Advanced
      { id: "11", name: "Performance Mobility", description: "Athletic mobility for peak performance", duration: "45 min", equipment: "equipment", level: "advanced" },
      { id: "12", name: "Flexibility Elite", description: "Advanced equipment-assisted stretching", duration: "40 min", equipment: "equipment", level: "advanced" },
    ],
    "challenge": [
      // Bodyweight Beginner
      { id: "1", name: "30-Day Starter", description: "Progressive bodyweight challenge for beginners", duration: "25 min", equipment: "bodyweight", level: "beginner" },
      { id: "2", name: "Push-up Progression", description: "Challenge yourself to 100 push-ups", duration: "20 min", equipment: "bodyweight", level: "beginner" },
      // Bodyweight Intermediate
      { id: "3", name: "The Murph Lite", description: "Modified version of the classic CrossFit challenge", duration: "40 min", equipment: "bodyweight", level: "intermediate" },
      { id: "4", name: "Deck of Pain", description: "Card-based workout challenge", duration: "45 min", equipment: "bodyweight", level: "intermediate" },
      // Bodyweight Advanced
      { id: "5", name: "The Spartan 300", description: "300 reps of bodyweight brutality", duration: "50 min", equipment: "bodyweight", level: "advanced" },
      { id: "6", name: "Ninja Warrior Test", description: "Obstacle-inspired challenge workout", duration: "55 min", equipment: "bodyweight", level: "advanced" },
      // Equipment Beginner
      { id: "7", name: "Dumbbell Dare", description: "Timed challenge with light dumbbells", duration: "30 min", equipment: "equipment", level: "beginner" },
      { id: "8", name: "Kettlebell Quest", description: "100 swings challenge for beginners", duration: "25 min", equipment: "equipment", level: "beginner" },
      // Equipment Intermediate
      { id: "9", name: "The Filthy Fifty", description: "50 reps of 10 different exercises", duration: "50 min", equipment: "equipment", level: "intermediate" },
      { id: "10", name: "Barbell Complex Challenge", description: "Non-stop barbell movements", duration: "45 min", equipment: "equipment", level: "intermediate" },
      // Equipment Advanced
      { id: "11", name: "The Death by Burpee", description: "Increasing burpee challenge with equipment", duration: "60 min", equipment: "equipment", level: "advanced" },
      { id: "12", name: "Ultimate Chipper", description: "1000 rep challenge across multiple exercises", duration: "75 min", equipment: "equipment", level: "advanced" },
    ],
  };

  const title = workoutTitles[type || ""] || "Workout";
  const workouts = workoutData[type || "strength"] || [];
  
  const filteredWorkouts = workouts.filter(
    workout => workout.equipment === equipmentFilter && workout.level === levelFilter
  );

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

        {/* Workout Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {filteredWorkouts.map((workout) => (
            <Card
              key={workout.id}
              className="p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-gold bg-card border-border"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-xl">{workout.name}</h3>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{workout.duration}</span>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">{workout.description}</p>
                <div className="flex items-center gap-2 pt-2">
                  <div className="flex items-center gap-1 text-primary">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-xs font-medium capitalize">{workout.level}</span>
                  </div>
                </div>
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
  );
};

export default WorkoutDetail;
