import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ArrowLeft, Play, Heart } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";

interface Exercise {
  id: number;
  name: string;
  equipment: "bodyweight" | "equipment";
  videoId: string;
  bodyRegion: "upper" | "lower" | "full";
  movementType: "push" | "pull" | "linear" | "rotational" | "isometric" | "hinge" | "squat" | "lunge" | "gait";
  targetMuscle: string;
}

const ExerciseLibrary = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [equipmentFilter, setEquipmentFilter] = useState<"all" | "bodyweight" | "equipment">("all");
  const [bodyRegionFilter, setBodyRegionFilter] = useState<string>("all");
  const [movementTypeFilter, setMovementTypeFilter] = useState<string>("all");
  const [muscleGroupFilter, setMuscleGroupFilter] = useState<string>("all");
  const [letterFilter, setLetterFilter] = useState<string>("all");
  const [currentVideoId, setCurrentVideoId] = useState<string>("");
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [favoriteExercises, setFavoriteExercises] = useState<string[]>([]);
  const [hasSubscription, setHasSubscription] = useState(false);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setFavoriteExercises([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    loadFavorites();
    checkSubscription();
  }, [user]);

  const loadFavorites = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from("favorite_exercises")
      .select("exercise_name")
      .eq("user_id", user.id);
    
    if (data) {
      setFavoriteExercises(data.map(d => d.exercise_name));
    }
  };

  const checkSubscription = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase.functions.invoke('check-subscription');
      if (data?.subscribed) {
        setHasSubscription(true);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const toggleFavorite = async (exerciseName: string) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to access favorites",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }

    if (!hasSubscription) {
      toast({
        title: "Premium membership required",
        description: "Upgrade to premium to favorite exercises",
        variant: "destructive"
      });
      navigate("/premiumbenefits");
      return;
    }

    const isFavorite = favoriteExercises.includes(exerciseName);

    if (isFavorite) {
      // Remove from favorites
      const { error } = await supabase
        .from("favorite_exercises")
        .delete()
        .eq("user_id", user.id)
        .eq("exercise_name", exerciseName);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to remove from favorites",
          variant: "destructive"
        });
      } else {
        setFavoriteExercises(prev => prev.filter(name => name !== exerciseName));
        toast({
          title: "Removed from favorites",
          description: `${exerciseName} has been removed from your favorites`
        });
      }
    } else {
      // Add to favorites
      const { error } = await supabase
        .from("favorite_exercises")
        .insert({
          user_id: user.id,
          exercise_name: exerciseName
        });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to add to favorites",
          variant: "destructive"
        });
      } else {
        setFavoriteExercises(prev => [...prev, exerciseName]);
        toast({
          title: "Added to favorites",
          description: `${exerciseName} has been added to your favorites`
        });
      }
    }
  };

  // 100 exercises list with comprehensive categorization
  const exercises: Exercise[] = [
    // Bodyweight exercises
    { id: 1, name: "Air Squats", equipment: "bodyweight", bodyRegion: "lower", movementType: "squat", videoId: "C_VtOYc6j5c", targetMuscle: "Quadriceps" },
    { id: 2, name: "Burpees", equipment: "bodyweight", bodyRegion: "full", movementType: "linear", videoId: "", targetMuscle: "Full Body" },
    { id: 3, name: "Bridge", equipment: "bodyweight", bodyRegion: "lower", movementType: "hinge", videoId: "", targetMuscle: "Glutes" },
    { id: 4, name: "Bicycle Crunches", equipment: "bodyweight", bodyRegion: "upper", movementType: "rotational", videoId: "", targetMuscle: "Abs" },
    { id: 5, name: "Bear Crawl", equipment: "bodyweight", bodyRegion: "full", movementType: "gait", videoId: "", targetMuscle: "Core" },
    { id: 6, name: "Calf Raises", equipment: "bodyweight", bodyRegion: "lower", movementType: "linear", videoId: "", targetMuscle: "Calves" },
    { id: 7, name: "Crunches", equipment: "bodyweight", bodyRegion: "upper", movementType: "linear", videoId: "", targetMuscle: "Abs" },
    { id: 8, name: "Chair Dips", equipment: "bodyweight", bodyRegion: "upper", movementType: "push", videoId: "", targetMuscle: "Triceps" },
    { id: 9, name: "Crow Pose", equipment: "bodyweight", bodyRegion: "upper", movementType: "isometric", videoId: "", targetMuscle: "Core" },
    { id: 10, name: "Decline Push-ups", equipment: "bodyweight", bodyRegion: "upper", movementType: "push", videoId: "", targetMuscle: "Chest" },
    { id: 11, name: "Diamond Push-ups", equipment: "bodyweight", bodyRegion: "upper", movementType: "push", videoId: "", targetMuscle: "Triceps" },
    { id: 12, name: "Donkey Kicks", equipment: "bodyweight", bodyRegion: "lower", movementType: "hinge", videoId: "", targetMuscle: "Glutes" },
    { id: 13, name: "Flutter Kicks", equipment: "bodyweight", bodyRegion: "upper", movementType: "linear", videoId: "", targetMuscle: "Abs" },
    { id: 14, name: "Forward Lunges", equipment: "bodyweight", bodyRegion: "lower", movementType: "lunge", videoId: "", targetMuscle: "Quadriceps" },
    { id: 15, name: "Frog Jumps", equipment: "bodyweight", bodyRegion: "lower", movementType: "squat", videoId: "", targetMuscle: "Quadriceps" },
    { id: 16, name: "Glute Bridges", equipment: "bodyweight", bodyRegion: "lower", movementType: "hinge", videoId: "", targetMuscle: "Glutes" },
    { id: 17, name: "High Knees", equipment: "bodyweight", bodyRegion: "full", movementType: "gait", videoId: "", targetMuscle: "Legs" },
    { id: 18, name: "Handstand Push-ups", equipment: "bodyweight", bodyRegion: "upper", movementType: "push", videoId: "", targetMuscle: "Shoulders" },
    { id: 19, name: "Hip Thrusts", equipment: "bodyweight", bodyRegion: "lower", movementType: "hinge", videoId: "", targetMuscle: "Glutes" },
    { id: 20, name: "Inchworms", equipment: "bodyweight", bodyRegion: "full", movementType: "gait", videoId: "", targetMuscle: "Core" },
    { id: 21, name: "Jumping Jacks", equipment: "bodyweight", bodyRegion: "full", movementType: "linear", videoId: "", targetMuscle: "Full Body" },
    { id: 22, name: "Jump Squats", equipment: "bodyweight", bodyRegion: "lower", movementType: "squat", videoId: "", targetMuscle: "Quadriceps" },
    { id: 23, name: "Knee Push-ups", equipment: "bodyweight", bodyRegion: "upper", movementType: "push", videoId: "", targetMuscle: "Chest" },
    { id: 24, name: "Leg Raises", equipment: "bodyweight", bodyRegion: "upper", movementType: "linear", videoId: "", targetMuscle: "Abs" },
    { id: 25, name: "Lunges", equipment: "bodyweight", bodyRegion: "lower", movementType: "lunge", videoId: "", targetMuscle: "Quadriceps" },
    { id: 26, name: "Mountain Climbers", equipment: "bodyweight", bodyRegion: "full", movementType: "linear", videoId: "", targetMuscle: "Core" },
    { id: 27, name: "Neutral Grip Pull-ups", equipment: "bodyweight", bodyRegion: "upper", movementType: "pull", videoId: "", targetMuscle: "Back" },
    { id: 28, name: "Nose to Wall Handstand", equipment: "bodyweight", bodyRegion: "upper", movementType: "isometric", videoId: "", targetMuscle: "Shoulders" },
    { id: 29, name: "One Leg Squats", equipment: "bodyweight", bodyRegion: "lower", movementType: "squat", videoId: "", targetMuscle: "Quadriceps" },
    { id: 30, name: "Plank", equipment: "bodyweight", bodyRegion: "upper", movementType: "isometric", videoId: "", targetMuscle: "Core" },
    { id: 31, name: "Pike Push-ups", equipment: "bodyweight", bodyRegion: "upper", movementType: "push", videoId: "", targetMuscle: "Shoulders" },
    { id: 32, name: "Push-ups", equipment: "bodyweight", bodyRegion: "upper", movementType: "push", videoId: "", targetMuscle: "Chest" },
    { id: 33, name: "Pull-ups", equipment: "bodyweight", bodyRegion: "upper", movementType: "pull", videoId: "", targetMuscle: "Back" },
    { id: 34, name: "Russian Twists", equipment: "bodyweight", bodyRegion: "upper", movementType: "rotational", videoId: "", targetMuscle: "Abs" },
    { id: 35, name: "Reverse Lunges", equipment: "bodyweight", bodyRegion: "lower", movementType: "lunge", videoId: "", targetMuscle: "Quadriceps" },
    { id: 36, name: "Side Plank", equipment: "bodyweight", bodyRegion: "upper", movementType: "isometric", videoId: "", targetMuscle: "Core" },
    { id: 37, name: "Sit-ups", equipment: "bodyweight", bodyRegion: "upper", movementType: "linear", videoId: "", targetMuscle: "Abs" },
    { id: 38, name: "Superman", equipment: "bodyweight", bodyRegion: "upper", movementType: "isometric", videoId: "", targetMuscle: "Back" },
    { id: 39, name: "Step-ups", equipment: "bodyweight", bodyRegion: "lower", movementType: "lunge", videoId: "", targetMuscle: "Quadriceps" },
    { id: 40, name: "Tuck Jumps", equipment: "bodyweight", bodyRegion: "lower", movementType: "squat", videoId: "", targetMuscle: "Quadriceps" },
    { id: 41, name: "Tricep Dips", equipment: "bodyweight", bodyRegion: "upper", movementType: "push", videoId: "", targetMuscle: "Triceps" },
    { id: 42, name: "V-ups", equipment: "bodyweight", bodyRegion: "upper", movementType: "linear", videoId: "", targetMuscle: "Abs" },
    { id: 43, name: "Wall Sits", equipment: "bodyweight", bodyRegion: "lower", movementType: "isometric", videoId: "", targetMuscle: "Quadriceps" },
    { id: 44, name: "Wide Grip Push-ups", equipment: "bodyweight", bodyRegion: "upper", movementType: "push", videoId: "", targetMuscle: "Chest" },
    { id: 45, name: "Yoga Push-ups", equipment: "bodyweight", bodyRegion: "full", movementType: "push", videoId: "", targetMuscle: "Full Body" },
    
    // Equipment-based exercises
    { id: 46, name: "Barbell Back Squats", equipment: "equipment", bodyRegion: "lower", movementType: "squat", videoId: "", targetMuscle: "Quadriceps" },
    { id: 47, name: "Barbell Bench Press", equipment: "equipment", bodyRegion: "upper", movementType: "push", videoId: "", targetMuscle: "Chest" },
    { id: 48, name: "Barbell Deadlifts", equipment: "equipment", bodyRegion: "full", movementType: "hinge", videoId: "", targetMuscle: "Back" },
    { id: 49, name: "Barbell Rows", equipment: "equipment", bodyRegion: "upper", movementType: "pull", videoId: "", targetMuscle: "Back" },
    { id: 50, name: "Barbell Curls", equipment: "equipment", bodyRegion: "upper", movementType: "pull", videoId: "", targetMuscle: "Biceps" },
    { id: 51, name: "Barbell Overhead Press", equipment: "equipment", bodyRegion: "upper", movementType: "push", videoId: "", targetMuscle: "Shoulders" },
    { id: 52, name: "Cable Flyes", equipment: "equipment", bodyRegion: "upper", movementType: "push", videoId: "", targetMuscle: "Chest" },
    { id: 53, name: "Cable Rows", equipment: "equipment", bodyRegion: "upper", movementType: "pull", videoId: "", targetMuscle: "Back" },
    { id: 54, name: "Cable Tricep Pushdowns", equipment: "equipment", bodyRegion: "upper", movementType: "push", videoId: "", targetMuscle: "Triceps" },
    { id: 55, name: "Dumbbell Arnold Press", equipment: "equipment", bodyRegion: "upper", movementType: "push", videoId: "", targetMuscle: "Shoulders" },
    { id: 56, name: "Dumbbell Bench Press", equipment: "equipment", bodyRegion: "upper", movementType: "push", videoId: "", targetMuscle: "Chest" },
    { id: 57, name: "Dumbbell Bicep Curls", equipment: "equipment", bodyRegion: "upper", movementType: "pull", videoId: "", targetMuscle: "Biceps" },
    { id: 58, name: "Dumbbell Chest Flyes", equipment: "equipment", bodyRegion: "upper", movementType: "push", videoId: "", targetMuscle: "Chest" },
    { id: 59, name: "Dumbbell Front Raises", equipment: "equipment", bodyRegion: "upper", movementType: "push", videoId: "", targetMuscle: "Shoulders" },
    { id: 60, name: "Dumbbell Goblet Squats", equipment: "equipment", bodyRegion: "lower", movementType: "squat", videoId: "", targetMuscle: "Quadriceps" },
    { id: 61, name: "Dumbbell Hammer Curls", equipment: "equipment", bodyRegion: "upper", movementType: "pull", videoId: "", targetMuscle: "Biceps" },
    { id: 62, name: "Dumbbell Incline Press", equipment: "equipment", bodyRegion: "upper", movementType: "push", videoId: "", targetMuscle: "Chest" },
    { id: 63, name: "Dumbbell Lateral Raises", equipment: "equipment", bodyRegion: "upper", movementType: "push", videoId: "", targetMuscle: "Shoulders" },
    { id: 64, name: "Dumbbell Lunges", equipment: "equipment", bodyRegion: "lower", movementType: "lunge", videoId: "", targetMuscle: "Quadriceps" },
    { id: 65, name: "Dumbbell Romanian Deadlifts", equipment: "equipment", bodyRegion: "lower", movementType: "hinge", videoId: "", targetMuscle: "Hamstrings" },
    { id: 66, name: "Dumbbell Rows", equipment: "equipment", bodyRegion: "upper", movementType: "pull", videoId: "", targetMuscle: "Back" },
    { id: 67, name: "Dumbbell Shrugs", equipment: "equipment", bodyRegion: "upper", movementType: "linear", videoId: "", targetMuscle: "Traps" },
    { id: 68, name: "Dumbbell Shoulder Press", equipment: "equipment", bodyRegion: "upper", movementType: "push", videoId: "", targetMuscle: "Shoulders" },
    { id: 69, name: "Dumbbell Tricep Extensions", equipment: "equipment", bodyRegion: "upper", movementType: "push", videoId: "", targetMuscle: "Triceps" },
    { id: 70, name: "EZ Bar Curls", equipment: "equipment", bodyRegion: "upper", movementType: "pull", videoId: "", targetMuscle: "Biceps" },
    { id: 71, name: "Face Pulls", equipment: "equipment", bodyRegion: "upper", movementType: "pull", videoId: "", targetMuscle: "Shoulders" },
    { id: 72, name: "Farmer's Walk", equipment: "equipment", bodyRegion: "full", movementType: "gait", videoId: "", targetMuscle: "Full Body" },
    { id: 73, name: "Goblet Squats", equipment: "equipment", bodyRegion: "lower", movementType: "squat", videoId: "", targetMuscle: "Quadriceps" },
    { id: 74, name: "Hack Squats", equipment: "equipment", bodyRegion: "lower", movementType: "squat", videoId: "", targetMuscle: "Quadriceps" },
    { id: 75, name: "Hammer Strength Press", equipment: "equipment", bodyRegion: "upper", movementType: "push", videoId: "", targetMuscle: "Chest" },
    { id: 76, name: "Incline Dumbbell Curls", equipment: "equipment", bodyRegion: "upper", movementType: "pull", videoId: "", targetMuscle: "Biceps" },
    { id: 77, name: "Kettlebell Swings", equipment: "equipment", bodyRegion: "full", movementType: "hinge", videoId: "", targetMuscle: "Glutes" },
    { id: 78, name: "Kettlebell Goblet Squats", equipment: "equipment", bodyRegion: "lower", movementType: "squat", videoId: "", targetMuscle: "Quadriceps" },
    { id: 79, name: "Lat Pulldowns", equipment: "equipment", bodyRegion: "upper", movementType: "pull", videoId: "", targetMuscle: "Back" },
    { id: 80, name: "Leg Press", equipment: "equipment", bodyRegion: "lower", movementType: "push", videoId: "", targetMuscle: "Quadriceps" },
    { id: 81, name: "Leg Curls", equipment: "equipment", bodyRegion: "lower", movementType: "pull", videoId: "", targetMuscle: "Hamstrings" },
    { id: 82, name: "Leg Extensions", equipment: "equipment", bodyRegion: "lower", movementType: "push", videoId: "", targetMuscle: "Quadriceps" },
    { id: 83, name: "Machine Chest Press", equipment: "equipment", bodyRegion: "upper", movementType: "push", videoId: "", targetMuscle: "Chest" },
    { id: 84, name: "Machine Shoulder Press", equipment: "equipment", bodyRegion: "upper", movementType: "push", videoId: "", targetMuscle: "Shoulders" },
    { id: 85, name: "Nordic Curls", equipment: "equipment", bodyRegion: "lower", movementType: "hinge", videoId: "", targetMuscle: "Hamstrings" },
    { id: 86, name: "Overhead Tricep Extensions", equipment: "equipment", bodyRegion: "upper", movementType: "push", videoId: "", targetMuscle: "Triceps" },
    { id: 87, name: "Pec Deck Flyes", equipment: "equipment", bodyRegion: "upper", movementType: "push", videoId: "", targetMuscle: "Chest" },
    { id: 88, name: "Preacher Curls", equipment: "equipment", bodyRegion: "upper", movementType: "pull", videoId: "", targetMuscle: "Biceps" },
    { id: 89, name: "Reverse Flyes", equipment: "equipment", bodyRegion: "upper", movementType: "pull", videoId: "", targetMuscle: "Shoulders" },
    { id: 90, name: "Romanian Deadlifts", equipment: "equipment", bodyRegion: "lower", movementType: "hinge", videoId: "", targetMuscle: "Hamstrings" },
    { id: 91, name: "Seated Cable Rows", equipment: "equipment", bodyRegion: "upper", movementType: "pull", videoId: "", targetMuscle: "Back" },
    { id: 92, name: "Seated Calf Raises", equipment: "equipment", bodyRegion: "lower", movementType: "linear", videoId: "", targetMuscle: "Calves" },
    { id: 93, name: "Smith Machine Squats", equipment: "equipment", bodyRegion: "lower", movementType: "squat", videoId: "", targetMuscle: "Quadriceps" },
    { id: 94, name: "T-Bar Rows", equipment: "equipment", bodyRegion: "upper", movementType: "pull", videoId: "", targetMuscle: "Back" },
    { id: 95, name: "Trap Bar Deadlifts", equipment: "equipment", bodyRegion: "full", movementType: "hinge", videoId: "", targetMuscle: "Full Body" },
    { id: 96, name: "Tricep Kickbacks", equipment: "equipment", bodyRegion: "upper", movementType: "push", videoId: "", targetMuscle: "Triceps" },
    { id: 97, name: "Upright Rows", equipment: "equipment", bodyRegion: "upper", movementType: "pull", videoId: "", targetMuscle: "Shoulders" },
    { id: 98, name: "Walking Lunges", equipment: "equipment", bodyRegion: "lower", movementType: "lunge", videoId: "", targetMuscle: "Quadriceps" },
    { id: 99, name: "Weighted Dips", equipment: "equipment", bodyRegion: "upper", movementType: "push", videoId: "", targetMuscle: "Triceps" },
    { id: 100, name: "Zercher Squats", equipment: "equipment", bodyRegion: "lower", movementType: "squat", videoId: "", targetMuscle: "Quadriceps" },
  ];

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const filteredExercises = exercises.filter((exercise) => {
    const matchesEquipment = equipmentFilter === "all" || exercise.equipment === equipmentFilter;
    const matchesBodyRegion = bodyRegionFilter === "all" || exercise.bodyRegion === bodyRegionFilter;
    const matchesMovementType = movementTypeFilter === "all" || exercise.movementType === movementTypeFilter;
    const matchesMuscleGroup = muscleGroupFilter === "all" || exercise.targetMuscle === muscleGroupFilter;
    const matchesLetter = letterFilter === "all" || exercise.name.charAt(0).toUpperCase() === letterFilter;
    return matchesEquipment && matchesBodyRegion && matchesMovementType && matchesMuscleGroup && matchesLetter;
  });

  const handlePlay = (videoId: string) => {
    setCurrentVideoId(videoId);
    setIsVideoDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsVideoDialogOpen(false);
    setCurrentVideoId("");
  };

  return (
    <>
      <Helmet>
        <title>Exercise Library - Smarty Gym | 100+ Video Exercises by Haris Falas</title>
        <meta name="description" content="Browse 100+ exercise videos at smartygym.com by Haris Falas. Convenient & flexible exercise library - filter by equipment, body region, muscle group. Gym reimagined for anywhere, anytime training." />
        <meta name="keywords" content="smartygym exercises, smarty gym, smartygym.com, Haris Falas, exercise library, workout exercises, bodyweight exercises, exercise videos, convenient fitness, gym reimagined, flexible training" />
        
        <meta property="og:title" content="Exercise Library - Smarty Gym | 100+ Exercise Videos" />
        <meta property="og:description" content="100+ exercises with video demonstrations by Haris Falas - convenient library for flexible training anywhere" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://smartygym.com/exerciselibrary" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Exercise Library - Smarty Gym" />
        <meta name="twitter:description" content="100+ exercise videos at smartygym.com for convenient training" />
        
        <link rel="canonical" href="https://smartygym.com/exerciselibrary" />
      </Helmet>
      
      <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto py-4 sm:py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span className="text-xs sm:text-sm">Back</span>
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

            {/* Dropdown Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Body Region Filter */}
              <div>
                <h3 className="text-sm font-semibold mb-2">Body Region</h3>
                <Select value={bodyRegionFilter} onValueChange={setBodyRegionFilter}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="All Regions" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="all">All Regions</SelectItem>
                    <SelectItem value="upper">Upper Body</SelectItem>
                    <SelectItem value="lower">Lower Body</SelectItem>
                    <SelectItem value="full">Full Body</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Movement Type Filter */}
              <div>
                <h3 className="text-sm font-semibold mb-2">Movement Type</h3>
                <Select value={movementTypeFilter} onValueChange={setMovementTypeFilter}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="All Movements" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="all">All Movements</SelectItem>
                    <SelectItem value="push">Push</SelectItem>
                    <SelectItem value="pull">Pull</SelectItem>
                    <SelectItem value="hinge">Hinge</SelectItem>
                    <SelectItem value="squat">Squat</SelectItem>
                    <SelectItem value="lunge">Lunge</SelectItem>
                    <SelectItem value="gait">Gait</SelectItem>
                    <SelectItem value="linear">Linear</SelectItem>
                    <SelectItem value="rotational">Rotational</SelectItem>
                    <SelectItem value="isometric">Isometric</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Muscle Group Filter */}
              <div>
                <h3 className="text-sm font-semibold mb-2">Target Muscle</h3>
                <Select value={muscleGroupFilter} onValueChange={setMuscleGroupFilter}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="All Muscles" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="all">All Muscles</SelectItem>
                    <SelectItem value="Chest">Chest</SelectItem>
                    <SelectItem value="Back">Back</SelectItem>
                    <SelectItem value="Shoulders">Shoulders</SelectItem>
                    <SelectItem value="Biceps">Biceps</SelectItem>
                    <SelectItem value="Triceps">Triceps</SelectItem>
                    <SelectItem value="Abs">Abs</SelectItem>
                    <SelectItem value="Core">Core</SelectItem>
                    <SelectItem value="Quadriceps">Quadriceps</SelectItem>
                    <SelectItem value="Hamstrings">Hamstrings</SelectItem>
                    <SelectItem value="Glutes">Glutes</SelectItem>
                    <SelectItem value="Calves">Calves</SelectItem>
                    <SelectItem value="Traps">Traps</SelectItem>
                    <SelectItem value="Full Body">Full Body</SelectItem>
                  </SelectContent>
                </Select>
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
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-1">
                      <span className="capitalize">{exercise.equipment}</span>
                      <span>•</span>
                      <span className="capitalize">{exercise.bodyRegion} Body</span>
                      <span>•</span>
                      <span className="capitalize">{exercise.movementType}</span>
                      <span>•</span>
                      <span>{exercise.targetMuscle}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={favoriteExercises.includes(exercise.name) ? "default" : "outline"}
                      onClick={() => toggleFavorite(exercise.name)}
                      className="h-8 w-8 p-0"
                      title={favoriteExercises.includes(exercise.name) ? "Remove from favorites" : "Add to favorites"}
                    >
                      <Heart className={`h-4 w-4 ${favoriteExercises.includes(exercise.name) ? 'fill-current' : ''}`} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePlay(exercise.videoId)}
                      className="h-8 w-8 p-0"
                      title="Play"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Video Dialog Popup */}
      <Dialog open={isVideoDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-md w-full p-0 overflow-hidden">
          <div className="aspect-video bg-muted">
            {currentVideoId && (
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${currentVideoId}?autoplay=1`}
                title="Exercise demonstration"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </>
  );
};

export default ExerciseLibrary;
