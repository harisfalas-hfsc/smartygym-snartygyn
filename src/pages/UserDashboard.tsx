import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Heart, 
  CheckCircle, 
  Clock,
  Star,
  Dumbbell,
  Calendar,
  Crown,
  ArrowLeft
} from "lucide-react";

interface WorkoutInteraction {
  id: string;
  workout_id: string;
  workout_name: string;
  workout_type: string;
  is_favorite: boolean;
  is_completed: boolean;
  has_viewed: boolean;
  rating: number | null;
  created_at: string;
  updated_at: string;
}

interface ProgramInteraction {
  id: string;
  program_id: string;
  program_name: string;
  program_type: string;
  is_favorite: boolean;
  is_completed: boolean;
  has_viewed: boolean;
  rating: number | null;
  created_at: string;
  updated_at: string;
}

interface SubscriptionInfo {
  subscribed: boolean;
  product_id: string | null;
  subscription_end: string | null;
}

export default function UserDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [workoutInteractions, setWorkoutInteractions] = useState<WorkoutInteraction[]>([]);
  const [programInteractions, setProgramInteractions] = useState<ProgramInteraction[]>([]);
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);

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
    await fetchAllData(session.user.id);
    await checkSubscription();
    setLoading(false);
  };

  const fetchAllData = async (userId: string) => {
    await Promise.all([
      fetchWorkoutInteractions(userId),
      fetchProgramInteractions(userId),
    ]);
  };

  const fetchWorkoutInteractions = async (userId: string) => {
    const { data } = await supabase
      .from("workout_interactions")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (data) setWorkoutInteractions(data);
  };

  const fetchProgramInteractions = async (userId: string) => {
    const { data } = await supabase
      .from("program_interactions")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (data) setProgramInteractions(data);
  };

  const checkSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) throw error;
      setSubscriptionInfo(data);
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  };

  const getPlanName = (productId: string | null) => {
    if (!productId) return "Free";
    if (productId.includes("gold") || productId === "prod_SxiRoBlC4pPZkV") return "Gold";
    if (productId.includes("platinum") || productId === "prod_SxiRyLMu9u8NPC") return "Platinum";
    return "Premium";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleNavigateToWorkout = (workoutType: string, workoutId: string) => {
    navigate(`/workout/${workoutType}/${workoutId}`);
  };

  const handleNavigateToProgram = (programType: string, programId: string) => {
    navigate(`/training-program/${programType}/${programId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading dashboard...</div>
      </div>
    );
  }

  const favoriteWorkouts = workoutInteractions.filter(w => w.is_favorite);
  const completedWorkouts = workoutInteractions.filter(w => w.is_completed);
  const viewedWorkouts = workoutInteractions.filter(w => w.has_viewed);
  const ratedWorkouts = workoutInteractions.filter(w => w.rating && w.rating > 0);

  const favoritePrograms = programInteractions.filter(p => p.is_favorite);
  const completedPrograms = programInteractions.filter(p => p.is_completed);
  const viewedPrograms = programInteractions.filter(p => p.has_viewed);
  const ratedPrograms = programInteractions.filter(p => p.rating && p.rating > 0);

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto max-w-7xl p-4 py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span className="text-xs sm:text-sm">Back to Home</span>
        </Button>
        
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-2">My Dashboard</h1>
        <p className="text-center text-muted-foreground mb-4">
          Track your fitness journey, monitor your progress, and stay on top of your goals.
        </p>
        
        {/* Info Ribbon */}
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-8 text-center">
          <p className="text-sm text-muted-foreground">
            Your personalized hub for workouts, programs, and achievements. Keep pushing forward!
          </p>
        </div>

        <div className="mb-8 flex items-center justify-between">
          <div>
          </div>
        </div>

        {/* Subscription Info */}
        {subscriptionInfo && (
          <Card className="mb-8 border-primary/50 bg-gradient-to-r from-primary/5 to-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                Your Subscription
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-2xl font-bold mb-1">
                    {getPlanName(subscriptionInfo.product_id)} Plan
                  </p>
                  {subscriptionInfo.subscribed && subscriptionInfo.subscription_end ? (
                    <p className="text-sm text-muted-foreground">
                      Active until {formatDate(subscriptionInfo.subscription_end)}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Upgrade to access premium content
                    </p>
                  )}
                </div>
                {!subscriptionInfo.subscribed && (
                  <Button onClick={() => navigate("/")}>
                    Upgrade Now
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="workouts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="workouts">
              <Dumbbell className="mr-2 h-4 w-4" />
              Workouts
            </TabsTrigger>
            <TabsTrigger value="programs">
              <Calendar className="mr-2 h-4 w-4" />
              Programs
            </TabsTrigger>
          </TabsList>

          {/* Workouts Tab */}
          <TabsContent value="workouts" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    Favorites
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{favoriteWorkouts.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Completed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completedWorkouts.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    Viewed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{viewedWorkouts.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    Rated
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{ratedWorkouts.length}</div>
                </CardContent>
              </Card>
            </div>

            {/* Workout Lists */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Favorites */}
              <Card>
                <CardHeader>
                  <CardTitle>Favorite Workouts</CardTitle>
                </CardHeader>
                <CardContent>
                  {favoriteWorkouts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No favorite workouts yet</p>
                  ) : (
                    <div className="space-y-2">
                      {favoriteWorkouts.map((workout) => (
                        <div
                          key={workout.id}
                          className="p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                          onClick={() => handleNavigateToWorkout(workout.workout_type, workout.workout_id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{workout.workout_name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {workout.workout_type}
                                </Badge>
                                {workout.rating && (
                                  <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                                    <span className="text-xs">{workout.rating}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            {workout.is_completed && (
                              <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Completed */}
              <Card>
                <CardHeader>
                  <CardTitle>Completed Workouts</CardTitle>
                </CardHeader>
                <CardContent>
                  {completedWorkouts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No completed workouts yet</p>
                  ) : (
                    <div className="space-y-2">
                      {completedWorkouts.map((workout) => (
                        <div
                          key={workout.id}
                          className="p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                          onClick={() => handleNavigateToWorkout(workout.workout_type, workout.workout_id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{workout.workout_name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {workout.workout_type}
                                </Badge>
                                {workout.rating && (
                                  <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                                    <span className="text-xs">{workout.rating}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            {workout.is_favorite && (
                              <Heart className="h-4 w-4 fill-red-500 text-red-500 ml-2" />
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

          {/* Programs Tab */}
          <TabsContent value="programs" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    Favorites
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{favoritePrograms.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Completed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completedPrograms.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    Viewed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{viewedPrograms.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    Rated
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{ratedPrograms.length}</div>
                </CardContent>
              </Card>
            </div>

            {/* Program Lists */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Favorites */}
              <Card>
                <CardHeader>
                  <CardTitle>Favorite Programs</CardTitle>
                </CardHeader>
                <CardContent>
                  {favoritePrograms.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No favorite programs yet</p>
                  ) : (
                    <div className="space-y-2">
                      {favoritePrograms.map((program) => (
                        <div
                          key={program.id}
                          className="p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                          onClick={() => handleNavigateToProgram(program.program_type, program.program_id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{program.program_name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {program.program_type}
                                </Badge>
                                {program.rating && (
                                  <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                                    <span className="text-xs">{program.rating}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            {program.is_completed && (
                              <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Completed */}
              <Card>
                <CardHeader>
                  <CardTitle>Completed Programs</CardTitle>
                </CardHeader>
                <CardContent>
                  {completedPrograms.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No completed programs yet</p>
                  ) : (
                    <div className="space-y-2">
                      {completedPrograms.map((program) => (
                        <div
                          key={program.id}
                          className="p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                          onClick={() => handleNavigateToProgram(program.program_type, program.program_id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{program.program_name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {program.program_type}
                                </Badge>
                                {program.rating && (
                                  <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                                    <span className="text-xs">{program.rating}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            {program.is_favorite && (
                              <Heart className="h-4 w-4 fill-red-500 text-red-500 ml-2" />
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
        </Tabs>
      </main>
    </div>
  );
}
