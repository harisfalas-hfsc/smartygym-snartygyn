import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
    "challenge": "Challenge Workout"
  };

  const workoutData: { [key: string]: Workout[] } = {
    "strength": [
      { id: "1", name: "Foundation Builder", description: "Master the basics with push-ups, squats, and planks", duration: "25 min", equipment: "bodyweight", level: "beginner", imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop" },
      { id: "2", name: "Core Starter", description: "Build core strength with fundamental movements", duration: "20 min", equipment: "bodyweight", level: "beginner", imageUrl: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=400&h=300&fit=crop" },
      { id: "3", name: "Power Push", description: "Advance your push-up game with variations", duration: "30 min", equipment: "bodyweight", level: "intermediate", imageUrl: "https://images.unsplash.com/photo-1598971861713-54ad16a5c72e?w=400&h=300&fit=crop" },
      { id: "4", name: "Leg Legend", description: "Single-leg movements for balanced strength", duration: "35 min", equipment: "bodyweight", level: "intermediate", imageUrl: "https://images.unsplash.com/photo-1566241477600-ac026ad43874?w=400&h=300&fit=crop" },
      { id: "5", name: "Calisthenics King", description: "Master muscle-ups and advanced gymnastics", duration: "40 min", equipment: "bodyweight", level: "advanced", imageUrl: "https://images.unsplash.com/photo-1532384555668-bc0ea7794257?w=400&h=300&fit=crop" },
      { id: "6", name: "Explosive Edge", description: "Plyometric power with clap push-ups and pistol squats", duration: "45 min", equipment: "bodyweight", level: "advanced", imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=300&fit=crop" },
      { id: "7", name: "Dumbbell Debut", description: "Learn proper form with light weights", duration: "30 min", equipment: "equipment", level: "beginner", imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&h=300&fit=crop" },
      { id: "8", name: "Barbell Basics", description: "Introduction to compound lifts", duration: "35 min", equipment: "equipment", level: "beginner", imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&h=300&fit=crop" },
      { id: "9", name: "Iron Warrior", description: "Progressive overload with heavier weights", duration: "45 min", equipment: "equipment", level: "intermediate", imageUrl: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=400&h=300&fit=crop" },
      { id: "10", name: "Muscle Sculptor", description: "Hypertrophy-focused training splits", duration: "50 min", equipment: "equipment", level: "intermediate", imageUrl: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=300&fit=crop" },
      { id: "11", name: "Powerlifting Pro", description: "Heavy compound lifts for maximum strength", duration: "60 min", equipment: "equipment", level: "advanced", imageUrl: "https://images.unsplash.com/photo-1434754205268-ad3b5f549b11?w=400&h=300&fit=crop" },
      { id: "12", name: "Beast Mode", description: "Advanced techniques like drop sets and supersets", duration: "55 min", equipment: "equipment", level: "advanced", imageUrl: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&h=300&fit=crop" },
    ],
    "calorie-burning": [
      { id: "1", name: "Fat Torch Starter", description: "Simple movements to get your heart pumping", duration: "20 min", equipment: "bodyweight", level: "beginner", imageUrl: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400&h=300&fit=crop" },
      { id: "2", name: "Cardio Kickstart", description: "Low-impact movements for calorie burn", duration: "25 min", equipment: "bodyweight", level: "beginner", imageUrl: "https://images.unsplash.com/photo-1594737626072-90dc274bc2bd?w=400&h=300&fit=crop" },
      { id: "3", name: "Burpee Blaster", description: "High-intensity intervals with bodyweight exercises", duration: "30 min", equipment: "bodyweight", level: "intermediate", imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=300&fit=crop" },
      { id: "4", name: "Sweat Storm", description: "Non-stop movement for maximum calorie burn", duration: "35 min", equipment: "bodyweight", level: "intermediate", imageUrl: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=400&h=300&fit=crop" },
      { id: "5", name: "Inferno Circuit", description: "Intense bodyweight circuits for serious burn", duration: "40 min", equipment: "bodyweight", level: "advanced", imageUrl: "https://images.unsplash.com/photo-1549576490-b0b4831ef60a?w=400&h=300&fit=crop" },
      { id: "6", name: "Afterburn Annihilator", description: "EPOC-focused workout for post-exercise burn", duration: "45 min", equipment: "bodyweight", level: "advanced", imageUrl: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=400&h=300&fit=crop" },
      { id: "7", name: "Kettlebell Ignite", description: "Swing and press your way to fat loss", duration: "25 min", equipment: "equipment", level: "beginner", imageUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400&h=300&fit=crop" },
      { id: "8", name: "Jump Rope Journey", description: "Cardio basics with rope work", duration: "20 min", equipment: "equipment", level: "beginner", imageUrl: "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400&h=300&fit=crop" },
      { id: "9", name: "Battle Rope Blaze", description: "Intense rope work for full-body burn", duration: "35 min", equipment: "equipment", level: "intermediate", imageUrl: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=400&h=300&fit=crop" },
      { id: "10", name: "Medicine Ball Mayhem", description: "Explosive movements with med balls", duration: "40 min", equipment: "equipment", level: "intermediate", imageUrl: "https://images.unsplash.com/photo-1517836477839-7072aaa8b121?w=400&h=300&fit=crop" },
      { id: "11", name: "Sled Push Inferno", description: "Heavy sled work for maximum calorie expenditure", duration: "45 min", equipment: "equipment", level: "advanced", imageUrl: "https://images.unsplash.com/photo-1517438476312-10d79c077509?w=400&h=300&fit=crop" },
      { id: "12", name: "Complex Crusher", description: "Advanced equipment complexes for elite burn", duration: "50 min", equipment: "equipment", level: "advanced", imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop" },
    ],
    "metabolic": [
      { id: "1", name: "Metabolism Spark", description: "Wake up your metabolism with simple circuits", duration: "20 min", equipment: "bodyweight", level: "beginner", imageUrl: "https://images.unsplash.com/photo-1483721310020-03333e577078?w=400&h=300&fit=crop" },
      { id: "2", name: "Tempo Trainer", description: "Control your pace for metabolic adaptation", duration: "25 min", equipment: "bodyweight", level: "beginner", imageUrl: "https://images.unsplash.com/photo-1598971861713-54ad16a5c72e?w=400&h=300&fit=crop" },
      { id: "3", name: "HIIT Hurricane", description: "High-intensity intervals for metabolic boost", duration: "30 min", equipment: "bodyweight", level: "intermediate", imageUrl: "https://images.unsplash.com/photo-1549576490-b0b4831ef60a?w=400&h=300&fit=crop" },
      { id: "4", name: "Tabata Thunder", description: "20/10 intervals for maximum metabolic effect", duration: "25 min", equipment: "bodyweight", level: "intermediate", imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=300&fit=crop" },
      { id: "5", name: "Metabolic Massacre", description: "Elite-level conditioning for peak metabolism", duration: "35 min", equipment: "bodyweight", level: "advanced", imageUrl: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=400&h=300&fit=crop" },
      { id: "6", name: "EMOM Extreme", description: "Every minute on the minute metabolic challenge", duration: "40 min", equipment: "bodyweight", level: "advanced", imageUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=300&fit=crop" },
      { id: "7", name: "Dumbbell Metabolism", description: "Light weight circuits for metabolic training", duration: "25 min", equipment: "equipment", level: "beginner", imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&h=300&fit=crop" },
      { id: "8", name: "Resistance Revamp", description: "Bands and weights for metabolic conditioning", duration: "30 min", equipment: "equipment", level: "beginner", imageUrl: "https://images.unsplash.com/photo-1584380931214-dbb5b72e7fd0?w=400&h=300&fit=crop" },
      { id: "9", name: "Complex Catalyst", description: "Equipment complexes for metabolic power", duration: "35 min", equipment: "equipment", level: "intermediate", imageUrl: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=300&fit=crop" },
      { id: "10", name: "Metabolic Matrix", description: "Mixed modality metabolic conditioning", duration: "40 min", equipment: "equipment", level: "intermediate", imageUrl: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&h=300&fit=crop" },
      { id: "11", name: "Barbell Burnout", description: "Heavy barbell complexes for elite conditioning", duration: "45 min", equipment: "equipment", level: "advanced", imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&h=300&fit=crop" },
      { id: "12", name: "Conditioning Crown", description: "Ultimate metabolic challenge with all equipment", duration: "50 min", equipment: "equipment", level: "advanced", imageUrl: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=400&h=300&fit=crop" },
    ],
    "cardio": [
      { id: "1", name: "Heart Starter", description: "Easy movements to build cardiovascular base", duration: "20 min", equipment: "bodyweight", level: "beginner", imageUrl: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400&h=300&fit=crop" },
      { id: "2", name: "Steady Steps", description: "Low-impact cardio for endurance building", duration: "25 min", equipment: "bodyweight", level: "beginner", imageUrl: "https://images.unsplash.com/photo-1483721310020-03333e577078?w=400&h=300&fit=crop" },
      { id: "3", name: "Cardio Climber", description: "Step up your cardio with bodyweight intervals", duration: "35 min", equipment: "bodyweight", level: "intermediate", imageUrl: "https://images.unsplash.com/photo-1594737626072-90dc274bc2bd?w=400&h=300&fit=crop" },
      { id: "4", name: "Endurance Engine", description: "Build lasting cardiovascular fitness", duration: "40 min", equipment: "bodyweight", level: "intermediate", imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=300&fit=crop" },
      { id: "5", name: "Cardio Crusher", description: "High-intensity cardio for peak performance", duration: "45 min", equipment: "bodyweight", level: "advanced", imageUrl: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=400&h=300&fit=crop" },
      { id: "6", name: "VO2 Max Mastery", description: "Push your aerobic capacity to the limit", duration: "50 min", equipment: "bodyweight", level: "advanced", imageUrl: "https://images.unsplash.com/photo-1549576490-b0b4831ef60a?w=400&h=300&fit=crop" },
      { id: "7", name: "Rope Ready", description: "Jump rope basics for cardio fitness", duration: "20 min", equipment: "equipment", level: "beginner", imageUrl: "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400&h=300&fit=crop" },
      { id: "8", name: "Bike Basics", description: "Cycling intervals for heart health", duration: "30 min", equipment: "equipment", level: "beginner", imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop" },
      { id: "9", name: "Rowing Rhythm", description: "Master the rowing machine for full-body cardio", duration: "40 min", equipment: "equipment", level: "intermediate", imageUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=300&fit=crop" },
      { id: "10", name: "Assault Advance", description: "Air bike intervals for serious cardio gains", duration: "35 min", equipment: "equipment", level: "intermediate", imageUrl: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&h=300&fit=crop" },
      { id: "11", name: "Triathlon Prep", description: "Mixed cardio modalities for elite endurance", duration: "60 min", equipment: "equipment", level: "advanced", imageUrl: "https://images.unsplash.com/photo-1517836477839-7072aaa8b121?w=400&h=300&fit=crop" },
      { id: "12", name: "Cardio Champion", description: "Competition-level cardiovascular training", duration: "55 min", equipment: "equipment", level: "advanced", imageUrl: "https://images.unsplash.com/photo-1517438476312-10d79c077509?w=400&h=300&fit=crop" },
    ],
    "mobility": [
      { id: "1", name: "Flexibility Foundation", description: "Basic stretches for improved range of motion", duration: "20 min", equipment: "bodyweight", level: "beginner", imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop" },
      { id: "2", name: "Joint Journey", description: "Gentle movements for joint health", duration: "25 min", equipment: "bodyweight", level: "beginner", imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop" },
      { id: "3", name: "Flow State", description: "Dynamic stretching sequences for mobility", duration: "30 min", equipment: "bodyweight", level: "intermediate", imageUrl: "https://images.unsplash.com/photo-1599447292171-1fc69bde54c7?w=400&h=300&fit=crop" },
      { id: "4", name: "Balance Builder", description: "Stability work with controlled movements", duration: "35 min", equipment: "bodyweight", level: "intermediate", imageUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=300&fit=crop" },
      { id: "5", name: "Contortionist Challenge", description: "Advanced flexibility and control", duration: "40 min", equipment: "bodyweight", level: "advanced", imageUrl: "https://images.unsplash.com/photo-1573384667317-01b24d3e6810?w=400&h=300&fit=crop" },
      { id: "6", name: "Mobility Master", description: "Elite-level range of motion training", duration: "45 min", equipment: "bodyweight", level: "advanced", imageUrl: "https://images.unsplash.com/photo-1599447292171-1fc69bde54c7?w=400&h=300&fit=crop" },
      { id: "7", name: "Foam Roll Relief", description: "Self-myofascial release basics", duration: "20 min", equipment: "equipment", level: "beginner", imageUrl: "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400&h=300&fit=crop" },
      { id: "8", name: "Band Stretch", description: "Resistance band-assisted stretching", duration: "25 min", equipment: "equipment", level: "beginner", imageUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=300&fit=crop" },
      { id: "9", name: "Yoga Block Flow", description: "Props-assisted mobility work", duration: "35 min", equipment: "equipment", level: "intermediate", imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop" },
      { id: "10", name: "Stability Sphere", description: "Balance ball exercises for core stability", duration: "30 min", equipment: "equipment", level: "intermediate", imageUrl: "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=400&h=300&fit=crop" },
      { id: "11", name: "Performance Mobility", description: "Athletic mobility for peak performance", duration: "45 min", equipment: "equipment", level: "advanced", imageUrl: "https://images.unsplash.com/photo-1573384667317-01b24d3e6810?w=400&h=300&fit=crop" },
      { id: "12", name: "Flexibility Elite", description: "Advanced equipment-assisted stretching", duration: "40 min", equipment: "equipment", level: "advanced", imageUrl: "https://images.unsplash.com/photo-1599447292171-1fc69bde54c7?w=400&h=300&fit=crop" },
    ],
    "challenge": [
      { id: "1", name: "30-Day Starter", description: "Progressive bodyweight challenge for beginners", duration: "25 min", equipment: "bodyweight", level: "beginner", imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=300&fit=crop" },
      { id: "2", name: "Push-up Progression", description: "Challenge yourself to 100 push-ups", duration: "20 min", equipment: "bodyweight", level: "beginner", imageUrl: "https://images.unsplash.com/photo-1598971861713-54ad16a5c72e?w=400&h=300&fit=crop" },
      { id: "3", name: "The Murph Lite", description: "Modified version of the classic CrossFit challenge", duration: "40 min", equipment: "bodyweight", level: "intermediate", imageUrl: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=400&h=300&fit=crop" },
      { id: "4", name: "Deck of Pain", description: "Card-based workout challenge", duration: "45 min", equipment: "bodyweight", level: "intermediate", imageUrl: "https://images.unsplash.com/photo-1549576490-b0b4831ef60a?w=400&h=300&fit=crop" },
      { id: "5", name: "The Spartan 300", description: "300 reps of bodyweight brutality", duration: "50 min", equipment: "bodyweight", level: "advanced", imageUrl: "https://images.unsplash.com/photo-1517438476312-10d79c077509?w=400&h=300&fit=crop" },
      { id: "6", name: "Ninja Warrior Test", description: "Obstacle-inspired challenge workout", duration: "55 min", equipment: "bodyweight", level: "advanced", imageUrl: "https://images.unsplash.com/photo-1532384555668-bc0ea7794257?w=400&h=300&fit=crop" },
      { id: "7", name: "Dumbbell Dare", description: "Timed challenge with light dumbbells", duration: "30 min", equipment: "equipment", level: "beginner", imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&h=300&fit=crop" },
      { id: "8", name: "Kettlebell Quest", description: "100 swings challenge for beginners", duration: "25 min", equipment: "equipment", level: "beginner", imageUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400&h=300&fit=crop" },
      { id: "9", name: "The Filthy Fifty", description: "50 reps of 10 different exercises", duration: "50 min", equipment: "equipment", level: "intermediate", imageUrl: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=400&h=300&fit=crop" },
      { id: "10", name: "Barbell Complex Challenge", description: "Non-stop barbell movements", duration: "45 min", equipment: "equipment", level: "intermediate", imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&h=300&fit=crop" },
      { id: "11", name: "The Death by Burpee", description: "Increasing burpee challenge with equipment", duration: "60 min", equipment: "equipment", level: "advanced", imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop" },
      { id: "12", name: "Ultimate Chipper", description: "1000 rep challenge across multiple exercises", duration: "75 min", equipment: "equipment", level: "advanced", imageUrl: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=400&h=300&fit=crop" },
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
              className="overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-gold bg-card border-border"
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
  );
};

export default WorkoutDetail;
