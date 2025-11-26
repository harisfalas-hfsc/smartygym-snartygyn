import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Heart, 
  TrendingUp, 
  TrendingDown, 
  Calculator, 
  Activity, 
  Flame,
  Dumbbell,
  Calendar,
  ArrowLeft,
  CheckCircle,
  Clock,
  Link as LinkIcon,
  Settings,
  RefreshCw,
  Youtube,
  Filter,
  Star,
  Users
} from "lucide-react";
import smartyGymLogo from "@/assets/smarty-gym-logo.png";
import { AvatarUpload } from "@/components/AvatarUpload";
import { Helmet } from "react-helmet";
import { SEOEnhancer } from "@/components/SEOEnhancer";

interface FavoriteWorkout {
  id: string;
  name: string;
  created_at: string;
  status: string | null;
}

interface FavoriteProgram {
  id: string;
  name: string;
  duration: string;
  created_at: string;
  status: string | null;
}

interface OneRMRecord {
  id: string;
  weight_lifted: number;
  reps: number;
  one_rm_result: number;
  exercise_name: string | null;
  created_at: string;
}

interface BMRRecord {
  id: string;
  age: number;
  weight: number;
  height: number;
  gender: string;
  bmr_result: number;
  created_at: string;
}

interface CalorieRecord {
  id: string;
  age: number;
  weight: number;
  height: number;
  gender: string;
  activity_level: string;
  goal: string;
  maintenance_calories: number;
  target_calories: number;
  created_at: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Favorites
  const [favoriteWorkouts, setFavoriteWorkouts] = useState<FavoriteWorkout[]>([]);
  const [favoritePrograms, setFavoritePrograms] = useState<FavoriteProgram[]>([]);

  // All Plans with filtering
  const [allWorkouts, setAllWorkouts] = useState<FavoriteWorkout[]>([]);
  const [allPrograms, setAllPrograms] = useState<FavoriteProgram[]>([]);
  const [workoutStatusFilter, setWorkoutStatusFilter] = useState<string>("all");
  const [workoutRatingFilter, setWorkoutRatingFilter] = useState<string>("all");
  const [programStatusFilter, setProgramStatusFilter] = useState<string>("all");
  const [programRatingFilter, setProgramRatingFilter] = useState<string>("all");

  // Calculator History
  const [oneRMHistory, setOneRMHistory] = useState<OneRMRecord[]>([]);
  const [bmrHistory, setBMRHistory] = useState<BMRRecord[]>([]);
  const [calorieHistory, setCalorieHistory] = useState<CalorieRecord[]>([]);

  const [syncingExercises, setSyncingExercises] = useState(false);
  const [profileAvatarUrl, setProfileAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    setUser(session.user);
    
    // Fetch user profile for avatar
    const { data: profile } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('user_id', session.user.id)
      .maybeSingle();
    
    if (profile) {
      setProfileAvatarUrl(profile.avatar_url);
    }
    
    await fetchAllData(session.user.id);
    setLoading(false);
  };

  const fetchAllData = async (userId: string) => {
    await Promise.all([
      fetchFavorites(userId),
      fetchAllWorkouts(userId),
      fetchAllPrograms(userId),
      fetchCalculatorHistory(userId)
    ]);
  };

  const fetchFavorites = async (userId: string) => {
    const { data: workouts } = await supabase
      .from("saved_workouts")
      .select("id, name, created_at, status")
      .eq("user_id", userId)
      .eq("is_favorite", true)
      .order("created_at", { ascending: false })
      .limit(5);

    const { data: programs } = await supabase
      .from("saved_training_programs")
      .select("id, name, duration, created_at, status")
      .eq("user_id", userId)
      .eq("is_favorite", true)
      .order("created_at", { ascending: false })
      .limit(5);

    if (workouts) setFavoriteWorkouts(workouts);
    if (programs) setFavoritePrograms(programs);
  };

  const fetchAllWorkouts = async (userId: string) => {
    const { data } = await supabase
      .from("saved_workouts")
      .select("id, name, created_at, status, rating")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (data) setAllWorkouts(data);
  };

  const fetchAllPrograms = async (userId: string) => {
    const { data } = await supabase
      .from("saved_training_programs")
      .select("id, name, duration, created_at, status, rating")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (data) setAllPrograms(data);
  };

  const getFilteredWorkouts = () => {
    return allWorkouts.filter((workout) => {
      const statusMatch = workoutStatusFilter === "all" || workout.status === workoutStatusFilter;
      const ratingMatch = workoutRatingFilter === "all" || 
        (workout as any).rating >= parseInt(workoutRatingFilter);
      return statusMatch && ratingMatch;
    });
  };

  const getFilteredPrograms = () => {
    return allPrograms.filter((program) => {
      const statusMatch = programStatusFilter === "all" || program.status === programStatusFilter;
      const ratingMatch = programRatingFilter === "all" || 
        (program as any).rating >= parseInt(programRatingFilter);
      return statusMatch && ratingMatch;
    });
  };

  const fetchCalculatorHistory = async (userId: string) => {
    const { data: onerm } = await supabase
      .from("onerm_history")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    const { data: bmr } = await supabase
      .from("bmr_history")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    const { data: calorie } = await supabase
      .from("calorie_history")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (onerm) setOneRMHistory(onerm);
    if (bmr) setBMRHistory(bmr);
    if (calorie) setCalorieHistory(calorie);
  };

  const handleLogout = async () => {
    try {
      // Sign out with global scope to clear all sessions
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        console.error("Logout error:", error);
        toast({ 
          title: "Error", 
          description: "Failed to log out. Please try again.",
          variant: "destructive"
        });
        return;
      }

      toast({ 
        title: "Logged out", 
        description: "You have been logged out successfully" 
      });
      
      navigate("/");
      
      // Force reload to clear all state
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const calculateOneRMProgress = () => {
    if (oneRMHistory.length < 2) return null;
    const latest = oneRMHistory[0].one_rm_result;
    const previous = oneRMHistory[1].one_rm_result;
    const change = ((latest - previous) / previous) * 100;
    return { value: change.toFixed(1), improved: change > 0 };
  };

  const calculateBMRProgress = () => {
    if (bmrHistory.length < 2) return null;
    const latest = bmrHistory[0].bmr_result;
    const previous = bmrHistory[1].bmr_result;
    const change = ((latest - previous) / previous) * 100;
    return { value: change.toFixed(1), improved: change > 0 };
  };

  const isNewUser = () => {
    if (!user?.created_at) return false;
    const createdAt = new Date(user.created_at);
    const now = new Date();
    const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    // Consider user as "new" if account was created within the last 24 hours
    return hoursSinceCreation < 24;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleSyncExercises = async () => {
    setSyncingExercises(true);
    try {
      const { data, error } = await supabase.functions.invoke("sync-youtube-exercises");

      if (error) throw error;

      toast({
        title: "Success!",
        description: `Synced ${data?.count || 0} exercises from YouTube playlist`,
      });
    } catch (error) {
      console.error("Error syncing exercises:", error);
      toast({
        title: "Error",
        description: "Failed to sync exercises from YouTube",
        variant: "destructive",
      });
    } finally {
      setSyncingExercises(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>User Dashboard | SmartyGym | My Workouts & Progress</title>
        <meta name="description" content="SmartyGym User Dashboard: Track your workouts, training programs, favorites, progress, and calculator history. Manage your fitness journey with personalized tools." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <SEOEnhancer
        entities={["User Dashboard", "Fitness Tracking", "Progress Monitor", "Workout History"]}
        topics={["user portal", "fitness tracking", "workout favorites", "progress monitoring"]}
        expertise={["user management", "fitness tracking", "progress analytics"]}
        contentType="User Dashboard"
        aiSummary="SmartyGym User Dashboard: Personal fitness hub for tracking workouts, training programs, favorites, calculator history, and progress. Manage your complete fitness journey in one place."
        aiKeywords={["fitness dashboard", "workout tracking", "training progress", "user portal", "fitness history"]}
        targetAudience="registered users"
        pageType="ProfilePage"
      />

      <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border py-3 sm:py-4 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex justify-between items-center gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <img src={smartyGymLogo} alt="SmartyGym" className="h-10 sm:h-12 w-auto flex-shrink-0" />
              <h1 className="text-lg sm:text-2xl font-bold truncate">Dashboard</h1>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button variant="outline" size="sm" onClick={() => navigate("/")} className="hidden sm:flex">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Home
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate("/")} className="sm:hidden">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-7xl p-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            {isNewUser() ? `Welcome to SmartyGym, ${user?.user_metadata?.full_name || "User"}!` : `Welcome back, ${user?.user_metadata?.full_name || "User"}!`}
          </h2>
          <p className="text-muted-foreground">
            {isNewUser() ? "We're excited to have you here! Let's start your fitness journey." : "Here's your fitness overview"}
          </p>
        </div>

        <Tabs defaultValue="favorites" className="space-y-6">
          <div className="w-full overflow-x-auto">
            <TabsList className="w-full inline-flex sm:grid sm:grid-cols-3 lg:grid-cols-7 min-w-max sm:min-w-0 gap-1">
              <TabsTrigger value="favorites" className="text-xs sm:text-sm flex-shrink-0">
                <Heart className="mr-2 h-4 w-4" />
                <span className="whitespace-nowrap">Favorites</span>
              </TabsTrigger>
              <TabsTrigger value="workouts" className="text-xs sm:text-sm flex-shrink-0">
                <Dumbbell className="mr-2 h-4 w-4" />
                <span className="whitespace-nowrap">Workouts</span>
              </TabsTrigger>
              <TabsTrigger value="programs" className="text-xs sm:text-sm flex-shrink-0">
                <Calendar className="mr-2 h-4 w-4" />
                <span className="whitespace-nowrap">Programs</span>
              </TabsTrigger>
              <TabsTrigger value="calculators" className="text-xs sm:text-sm flex-shrink-0">
                <Calculator className="mr-2 h-4 w-4" />
                <span className="whitespace-nowrap">Calculators</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="text-xs sm:text-sm flex-shrink-0">
                <Settings className="mr-2 h-4 w-4" />
                <span className="whitespace-nowrap">Settings</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Favorite Workouts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Dumbbell className="h-5 w-5 text-primary" />
                    Favorite Workouts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {favoriteWorkouts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No favorite workouts yet</p>
                  ) : (
                    <div className="space-y-3">
                      {favoriteWorkouts.map((workout) => (
                        <div
                          key={workout.id}
                          className="p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                          onClick={() => navigate('/userdashboard?tab=workouts')}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{workout.name}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDate(workout.created_at)}
                              </p>
                            </div>
                            {workout.status === "Completed" ? (
                              <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                            ) : (
                              <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Favorite Programs */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Favorite Programs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {favoritePrograms.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No favorite programs yet</p>
                  ) : (
                    <div className="space-y-3">
                      {favoritePrograms.map((program) => (
                        <div
                          key={program.id}
                          className="p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                          onClick={() => navigate('/userdashboard?tab=programs')}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{program.name}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {program.duration} • {formatDate(program.created_at)}
                              </p>
                            </div>
                            {program.status === "Completed" ? (
                              <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                            ) : (
                              <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* All Workouts Tab */}
          <TabsContent value="workouts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="h-5 w-5 text-primary" />
                    All Workouts
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Select value={workoutStatusFilter} onValueChange={setWorkoutStatusFilter}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="not-started">Not Started</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={workoutRatingFilter} onValueChange={setWorkoutRatingFilter}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Ratings</SelectItem>
                        <SelectItem value="5">5 Stars</SelectItem>
                        <SelectItem value="4">4+ Stars</SelectItem>
                        <SelectItem value="3">3+ Stars</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getFilteredWorkouts().length === 0 ? (
                  <p className="text-sm text-muted-foreground">No workouts found with current filters</p>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {getFilteredWorkouts().map((workout) => (
                      <div
                        key={workout.id}
                        className="p-4 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                        onClick={() => navigate(`/workout/${workout.id}`)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-medium">{workout.name}</p>
                          {workout.status === "Completed" ? (
                            <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                          ) : (
                            <Clock className="h-5 w-5 text-muted-foreground shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {formatDate(workout.created_at)}
                        </p>
                        {(workout as any).rating && (
                          <div className="flex gap-1">
                            {Array.from({ length: (workout as any).rating }).map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-primary text-primary" />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Programs Tab */}
          <TabsContent value="programs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    All Training Programs
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Select value={programStatusFilter} onValueChange={setProgramStatusFilter}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="not-started">Not Started</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={programRatingFilter} onValueChange={setProgramRatingFilter}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Ratings</SelectItem>
                        <SelectItem value="5">5 Stars</SelectItem>
                        <SelectItem value="4">4+ Stars</SelectItem>
                        <SelectItem value="3">3+ Stars</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getFilteredPrograms().length === 0 ? (
                  <p className="text-sm text-muted-foreground">No programs found with current filters</p>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {getFilteredPrograms().map((program) => (
                      <div
                        key={program.id}
                        className="p-4 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                        onClick={() => navigate('/userdashboard?tab=programs')}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-medium">{program.name}</p>
                          {program.status === "Completed" ? (
                            <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                          ) : (
                            <Clock className="h-5 w-5 text-muted-foreground shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {program.duration} • {formatDate(program.created_at)}
                        </p>
                        {(program as any).rating && (
                          <div className="flex gap-1">
                            {Array.from({ length: (program as any).rating }).map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-primary text-primary" />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Calculator History Tab */}
          <TabsContent value="calculators" className="space-y-6">
            {/* 1RM Calculator History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-primary" />
                    1RM Calculator History
                  </div>
                  <Button size="sm" onClick={() => navigate("/1rmcalculator")}>
                    Use Calculator
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {oneRMHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No calculations yet. Try the 1RM calculator!</p>
                ) : (
                  <>
                    {calculateOneRMProgress() && (
                      <div className="mb-4 p-4 bg-muted rounded-lg flex items-center justify-between">
                        <span className="font-medium">Progress:</span>
                        <div className="flex items-center gap-2">
                          {calculateOneRMProgress()!.improved ? (
                            <TrendingUp className="h-5 w-5 text-green-500" />
                          ) : (
                            <TrendingDown className="h-5 w-5 text-red-500" />
                          )}
                          <span className={calculateOneRMProgress()!.improved ? "text-green-500" : "text-red-500"}>
                            {calculateOneRMProgress()!.value}%
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="space-y-3">
                      {oneRMHistory.map((record) => (
                        <div key={record.id} className="p-3 bg-muted rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              {record.exercise_name && (
                                <p className="font-medium text-sm">{record.exercise_name}</p>
                              )}
                              <p className="text-sm text-muted-foreground">
                                {record.weight_lifted}kg × {record.reps} reps
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDate(record.created_at)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-primary">{record.one_rm_result}kg</p>
                              <p className="text-xs text-muted-foreground">1RM</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* BMR Calculator History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    BMR Calculator History
                  </div>
                  <Button size="sm" onClick={() => navigate("/bmrcalculator")}>
                    Use Calculator
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {bmrHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No calculations yet. Try the BMR calculator!</p>
                ) : (
                  <>
                    {calculateBMRProgress() && (
                      <div className="mb-4 p-4 bg-muted rounded-lg flex items-center justify-between">
                        <span className="font-medium">Progress:</span>
                        <div className="flex items-center gap-2">
                          {calculateBMRProgress()!.improved ? (
                            <TrendingUp className="h-5 w-5 text-green-500" />
                          ) : (
                            <TrendingDown className="h-5 w-5 text-red-500" />
                          )}
                          <span className={calculateBMRProgress()!.improved ? "text-green-500" : "text-red-500"}>
                            {calculateBMRProgress()!.value}%
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="space-y-3">
                      {bmrHistory.map((record) => (
                        <div key={record.id} className="p-3 bg-muted rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm">
                                {record.age}yo, {record.weight}kg, {record.height}cm
                              </p>
                              <p className="text-xs text-muted-foreground capitalize">
                                {record.gender}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDate(record.created_at)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-primary">{record.bmr_result}</p>
                              <p className="text-xs text-muted-foreground">cal/day</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Calorie Calculator History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-primary" />
                    Calorie Calculator History
                  </div>
                  <Button size="sm" onClick={() => navigate("/macrocalculator")}>
                    Use Calculator
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {calorieHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No calculations yet. Try the calorie calculator!</p>
                ) : (
                  <div className="space-y-3">
                    {calorieHistory.map((record) => (
                      <div key={record.id} className="p-3 bg-muted rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium capitalize">
                              Goal: {record.goal} weight
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {record.age}yo, {record.weight}kg, {record.activity_level}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDate(record.created_at)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-primary">{record.target_calories}</p>
                            <p className="text-xs text-muted-foreground">cal/day target</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              (Maintenance: {record.maintenance_calories})
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Avatar</h3>
                  {user && (
                    <AvatarUpload 
                      userId={user.id}
                      currentAvatarUrl={profileAvatarUrl}
                      userName={user.user_metadata?.full_name}
                      onAvatarUpdate={(url) => setProfileAvatarUrl(url)}
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Youtube className="h-5 w-5 text-primary" />
                  Exercise Library Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Sync exercises from your YouTube playlist to use in workouts and training programs.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Playlist: PLT3yfwvL9SV72Hm_8XHZ8ovkuFFv9L5l2
                  </p>
                </div>
                <Button 
                  onClick={handleSyncExercises}
                  disabled={syncingExercises}
                  className="w-full sm:w-auto"
                >
                  {syncingExercises ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Sync Exercise Library
                    </>
                  )}
                </Button>
                <div className="bg-muted p-4 rounded-lg text-sm">
                  <p className="font-medium mb-2">How it works:</p>
                  <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                    <li>Click "Sync Exercise Library" to fetch all videos from your YouTube playlist</li>
                    <li>Exercises will be used in all generated workouts and training programs</li>
                    <li>Each exercise name will link to its video demonstration</li>
                    <li>Click on exercise names during workouts to view demonstrations</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
    </>
  );
};
