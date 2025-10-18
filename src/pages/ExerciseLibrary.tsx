import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Play, Pause, Square } from "lucide-react";

interface Exercise {
  id: number;
  name: string;
  equipment: "bodyweight" | "equipment";
  videoId: string;
  targetMuscle: string;
}

const ExerciseLibrary = () => {
  const navigate = useNavigate();
  const [equipmentFilter, setEquipmentFilter] = useState<"all" | "bodyweight" | "equipment">("all");
  const [letterFilter, setLetterFilter] = useState<string>("all");
  const [currentVideoId, setCurrentVideoId] = useState<string>("");

  // 100 exercises list
  const exercises: Exercise[] = [
    // Bodyweight exercises
    { id: 1, name: "Air Squats", equipment: "bodyweight", videoId: "", targetMuscle: "Legs" },
    { id: 2, name: "Burpees", equipment: "bodyweight", videoId: "", targetMuscle: "Full Body" },
    { id: 3, name: "Bridge", equipment: "bodyweight", videoId: "", targetMuscle: "Glutes" },
    { id: 4, name: "Bicycle Crunches", equipment: "bodyweight", videoId: "", targetMuscle: "Abs" },
    { id: 5, name: "Bear Crawl", equipment: "bodyweight", videoId: "", targetMuscle: "Full Body" },
    { id: 6, name: "Calf Raises", equipment: "bodyweight", videoId: "", targetMuscle: "Calves" },
    { id: 7, name: "Crunches", equipment: "bodyweight", videoId: "", targetMuscle: "Abs" },
    { id: 8, name: "Chair Dips", equipment: "bodyweight", videoId: "", targetMuscle: "Triceps" },
    { id: 9, name: "Crow Pose", equipment: "bodyweight", videoId: "", targetMuscle: "Core" },
    { id: 10, name: "Decline Push-ups", equipment: "bodyweight", videoId: "", targetMuscle: "Chest" },
    { id: 11, name: "Diamond Push-ups", equipment: "bodyweight", videoId: "", targetMuscle: "Triceps" },
    { id: 12, name: "Donkey Kicks", equipment: "bodyweight", videoId: "", targetMuscle: "Glutes" },
    { id: 13, name: "Flutter Kicks", equipment: "bodyweight", videoId: "", targetMuscle: "Abs" },
    { id: 14, name: "Forward Lunges", equipment: "bodyweight", videoId: "", targetMuscle: "Legs" },
    { id: 15, name: "Frog Jumps", equipment: "bodyweight", videoId: "", targetMuscle: "Legs" },
    { id: 16, name: "Glute Bridges", equipment: "bodyweight", videoId: "", targetMuscle: "Glutes" },
    { id: 17, name: "High Knees", equipment: "bodyweight", videoId: "", targetMuscle: "Cardio" },
    { id: 18, name: "Handstand Push-ups", equipment: "bodyweight", videoId: "", targetMuscle: "Shoulders" },
    { id: 19, name: "Hip Thrusts", equipment: "bodyweight", videoId: "", targetMuscle: "Glutes" },
    { id: 20, name: "Inchworms", equipment: "bodyweight", videoId: "", targetMuscle: "Full Body" },
    { id: 21, name: "Jumping Jacks", equipment: "bodyweight", videoId: "", targetMuscle: "Cardio" },
    { id: 22, name: "Jump Squats", equipment: "bodyweight", videoId: "", targetMuscle: "Legs" },
    { id: 23, name: "Knee Push-ups", equipment: "bodyweight", videoId: "", targetMuscle: "Chest" },
    { id: 24, name: "Leg Raises", equipment: "bodyweight", videoId: "", targetMuscle: "Abs" },
    { id: 25, name: "Lunges", equipment: "bodyweight", videoId: "", targetMuscle: "Legs" },
    { id: 26, name: "Mountain Climbers", equipment: "bodyweight", videoId: "", targetMuscle: "Cardio" },
    { id: 27, name: "Neutral Grip Pull-ups", equipment: "bodyweight", videoId: "", targetMuscle: "Back" },
    { id: 28, name: "Nose to Wall Handstand", equipment: "bodyweight", videoId: "", targetMuscle: "Shoulders" },
    { id: 29, name: "One Leg Squats", equipment: "bodyweight", videoId: "", targetMuscle: "Legs" },
    { id: 30, name: "Plank", equipment: "bodyweight", videoId: "", targetMuscle: "Core" },
    { id: 31, name: "Pike Push-ups", equipment: "bodyweight", videoId: "", targetMuscle: "Shoulders" },
    { id: 32, name: "Push-ups", equipment: "bodyweight", videoId: "", targetMuscle: "Chest" },
    { id: 33, name: "Pull-ups", equipment: "bodyweight", videoId: "", targetMuscle: "Back" },
    { id: 34, name: "Russian Twists", equipment: "bodyweight", videoId: "", targetMuscle: "Abs" },
    { id: 35, name: "Reverse Lunges", equipment: "bodyweight", videoId: "", targetMuscle: "Legs" },
    { id: 36, name: "Side Plank", equipment: "bodyweight", videoId: "", targetMuscle: "Core" },
    { id: 37, name: "Sit-ups", equipment: "bodyweight", videoId: "", targetMuscle: "Abs" },
    { id: 38, name: "Superman", equipment: "bodyweight", videoId: "", targetMuscle: "Lower Back" },
    { id: 39, name: "Step-ups", equipment: "bodyweight", videoId: "", targetMuscle: "Legs" },
    { id: 40, name: "Tuck Jumps", equipment: "bodyweight", videoId: "", targetMuscle: "Legs" },
    { id: 41, name: "Tricep Dips", equipment: "bodyweight", videoId: "", targetMuscle: "Triceps" },
    { id: 42, name: "V-ups", equipment: "bodyweight", videoId: "", targetMuscle: "Abs" },
    { id: 43, name: "Wall Sits", equipment: "bodyweight", videoId: "", targetMuscle: "Legs" },
    { id: 44, name: "Wide Grip Push-ups", equipment: "bodyweight", videoId: "", targetMuscle: "Chest" },
    { id: 45, name: "Yoga Push-ups", equipment: "bodyweight", videoId: "", targetMuscle: "Full Body" },
    
    // Equipment-based exercises
    { id: 46, name: "Barbell Back Squats", equipment: "equipment", videoId: "", targetMuscle: "Legs" },
    { id: 47, name: "Barbell Bench Press", equipment: "equipment", videoId: "", targetMuscle: "Chest" },
    { id: 48, name: "Barbell Deadlifts", equipment: "equipment", videoId: "", targetMuscle: "Back" },
    { id: 49, name: "Barbell Rows", equipment: "equipment", videoId: "", targetMuscle: "Back" },
    { id: 50, name: "Barbell Curls", equipment: "equipment", videoId: "", targetMuscle: "Biceps" },
    { id: 51, name: "Barbell Overhead Press", equipment: "equipment", videoId: "", targetMuscle: "Shoulders" },
    { id: 52, name: "Cable Flyes", equipment: "equipment", videoId: "", targetMuscle: "Chest" },
    { id: 53, name: "Cable Rows", equipment: "equipment", videoId: "", targetMuscle: "Back" },
    { id: 54, name: "Cable Tricep Pushdowns", equipment: "equipment", videoId: "", targetMuscle: "Triceps" },
    { id: 55, name: "Dumbbell Arnold Press", equipment: "equipment", videoId: "", targetMuscle: "Shoulders" },
    { id: 56, name: "Dumbbell Bench Press", equipment: "equipment", videoId: "", targetMuscle: "Chest" },
    { id: 57, name: "Dumbbell Bicep Curls", equipment: "equipment", videoId: "", targetMuscle: "Biceps" },
    { id: 58, name: "Dumbbell Chest Flyes", equipment: "equipment", videoId: "", targetMuscle: "Chest" },
    { id: 59, name: "Dumbbell Front Raises", equipment: "equipment", videoId: "", targetMuscle: "Shoulders" },
    { id: 60, name: "Dumbbell Goblet Squats", equipment: "equipment", videoId: "", targetMuscle: "Legs" },
    { id: 61, name: "Dumbbell Hammer Curls", equipment: "equipment", videoId: "", targetMuscle: "Biceps" },
    { id: 62, name: "Dumbbell Incline Press", equipment: "equipment", videoId: "", targetMuscle: "Chest" },
    { id: 63, name: "Dumbbell Lateral Raises", equipment: "equipment", videoId: "", targetMuscle: "Shoulders" },
    { id: 64, name: "Dumbbell Lunges", equipment: "equipment", videoId: "", targetMuscle: "Legs" },
    { id: 65, name: "Dumbbell Romanian Deadlifts", equipment: "equipment", videoId: "", targetMuscle: "Hamstrings" },
    { id: 66, name: "Dumbbell Rows", equipment: "equipment", videoId: "", targetMuscle: "Back" },
    { id: 67, name: "Dumbbell Shrugs", equipment: "equipment", videoId: "", targetMuscle: "Traps" },
    { id: 68, name: "Dumbbell Shoulder Press", equipment: "equipment", videoId: "", targetMuscle: "Shoulders" },
    { id: 69, name: "Dumbbell Tricep Extensions", equipment: "equipment", videoId: "", targetMuscle: "Triceps" },
    { id: 70, name: "EZ Bar Curls", equipment: "equipment", videoId: "", targetMuscle: "Biceps" },
    { id: 71, name: "Face Pulls", equipment: "equipment", videoId: "", targetMuscle: "Rear Delts" },
    { id: 72, name: "Farmer's Walk", equipment: "equipment", videoId: "", targetMuscle: "Full Body" },
    { id: 73, name: "Goblet Squats", equipment: "equipment", videoId: "", targetMuscle: "Legs" },
    { id: 74, name: "Hack Squats", equipment: "equipment", videoId: "", targetMuscle: "Legs" },
    { id: 75, name: "Hammer Strength Press", equipment: "equipment", videoId: "", targetMuscle: "Chest" },
    { id: 76, name: "Incline Dumbbell Curls", equipment: "equipment", videoId: "", targetMuscle: "Biceps" },
    { id: 77, name: "Kettlebell Swings", equipment: "equipment", videoId: "", targetMuscle: "Full Body" },
    { id: 78, name: "Kettlebell Goblet Squats", equipment: "equipment", videoId: "", targetMuscle: "Legs" },
    { id: 79, name: "Lat Pulldowns", equipment: "equipment", videoId: "", targetMuscle: "Back" },
    { id: 80, name: "Leg Press", equipment: "equipment", videoId: "", targetMuscle: "Legs" },
    { id: 81, name: "Leg Curls", equipment: "equipment", videoId: "", targetMuscle: "Hamstrings" },
    { id: 82, name: "Leg Extensions", equipment: "equipment", videoId: "", targetMuscle: "Quads" },
    { id: 83, name: "Machine Chest Press", equipment: "equipment", videoId: "", targetMuscle: "Chest" },
    { id: 84, name: "Machine Shoulder Press", equipment: "equipment", videoId: "", targetMuscle: "Shoulders" },
    { id: 85, name: "Nordic Curls", equipment: "equipment", videoId: "", targetMuscle: "Hamstrings" },
    { id: 86, name: "Overhead Tricep Extensions", equipment: "equipment", videoId: "", targetMuscle: "Triceps" },
    { id: 87, name: "Pec Deck Flyes", equipment: "equipment", videoId: "", targetMuscle: "Chest" },
    { id: 88, name: "Preacher Curls", equipment: "equipment", videoId: "", targetMuscle: "Biceps" },
    { id: 89, name: "Reverse Flyes", equipment: "equipment", videoId: "", targetMuscle: "Rear Delts" },
    { id: 90, name: "Romanian Deadlifts", equipment: "equipment", videoId: "", targetMuscle: "Hamstrings" },
    { id: 91, name: "Seated Cable Rows", equipment: "equipment", videoId: "", targetMuscle: "Back" },
    { id: 92, name: "Seated Calf Raises", equipment: "equipment", videoId: "", targetMuscle: "Calves" },
    { id: 93, name: "Smith Machine Squats", equipment: "equipment", videoId: "", targetMuscle: "Legs" },
    { id: 94, name: "T-Bar Rows", equipment: "equipment", videoId: "", targetMuscle: "Back" },
    { id: 95, name: "Trap Bar Deadlifts", equipment: "equipment", videoId: "", targetMuscle: "Full Body" },
    { id: 96, name: "Tricep Kickbacks", equipment: "equipment", videoId: "", targetMuscle: "Triceps" },
    { id: 97, name: "Upright Rows", equipment: "equipment", videoId: "", targetMuscle: "Shoulders" },
    { id: 98, name: "Walking Lunges", equipment: "equipment", videoId: "", targetMuscle: "Legs" },
    { id: 99, name: "Weighted Dips", equipment: "equipment", videoId: "", targetMuscle: "Triceps" },
    { id: 100, name: "Zercher Squats", equipment: "equipment", videoId: "", targetMuscle: "Legs" },
  ];

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const filteredExercises = exercises.filter((exercise) => {
    const matchesEquipment = equipmentFilter === "all" || exercise.equipment === equipmentFilter;
    const matchesLetter = letterFilter === "all" || exercise.name.charAt(0).toUpperCase() === letterFilter;
    return matchesEquipment && matchesLetter;
  });

  const handlePlay = (videoId: string) => {
    setCurrentVideoId(videoId);
  };

  const handlePause = () => {
    // Pause functionality would be implemented with YouTube API
    console.log("Pause video");
  };

  const handleStop = () => {
    setCurrentVideoId("");
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto py-4 sm:py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span className="text-xs sm:text-sm">Back to Home</span>
        </Button>
        
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6 sm:mb-8">
          Exercise Library
        </h1>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4 space-y-4">
            {/* Equipment Filter */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Equipment Type</h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={equipmentFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setEquipmentFilter("all")}
                >
                  All
                </Button>
                <Button
                  variant={equipmentFilter === "bodyweight" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setEquipmentFilter("bodyweight")}
                >
                  Bodyweight
                </Button>
                <Button
                  variant={equipmentFilter === "equipment" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setEquipmentFilter("equipment")}
                >
                  Equipment
                </Button>
              </div>
            </div>

            {/* Alphabetical Filter */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Filter by Name</h3>
              <div className="flex flex-wrap gap-1">
                <Button
                  variant={letterFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLetterFilter("all")}
                  className="px-2 h-8"
                >
                  All
                </Button>
                {alphabet.map((letter) => (
                  <Button
                    key={letter}
                    variant={letterFilter === letter ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLetterFilter(letter)}
                    className="px-2 h-8 min-w-[2rem]"
                  >
                    {letter}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Video Player */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
              {currentVideoId ? (
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${currentVideoId}`}
                  title="Exercise demonstration"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              ) : (
                <div className="text-center text-muted-foreground">
                  <Play className="w-16 h-16 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Select an exercise to view demonstration</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Exercise List */}
        <Card>
          <CardContent className="p-4">
            <div className="mb-4 text-sm text-muted-foreground">
              Showing {filteredExercises.length} exercises
            </div>
            <div className="space-y-2">
              {filteredExercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold">{exercise.name}</h4>
                    <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                      <span className="capitalize">{exercise.equipment}</span>
                      <span>•</span>
                      <span>{exercise.targetMuscle}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePlay(exercise.videoId)}
                      className="h-8 w-8 p-0"
                      title="Play"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handlePause}
                      className="h-8 w-8 p-0"
                      title="Pause"
                    >
                      <Pause className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleStop}
                      className="h-8 w-8 p-0"
                      title="Stop"
                    >
                      <Square className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExerciseLibrary;
