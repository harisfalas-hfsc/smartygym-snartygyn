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
  ArrowLeft,
  Calculator
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

interface FavoriteExercise {
  id: string;
  exercise_name: string;
  created_at: string;
}

interface CalculatorRecord {
  id: string;
  created_at: string;
}

interface OneRMRecord extends CalculatorRecord {
  weight_lifted: number;
  reps: number;
  one_rm_result: number;
  exercise_name: string | null;
}

interface BMRRecord extends CalculatorRecord {
  age: number;
  weight: number;
  height: number;
  gender: string;
  bmr_result: number;
}

interface CalorieRecord extends CalculatorRecord {
  age: number;
  weight: number;
  height: number;
  gender: string;
  activity_level: string;
  goal: string;
  maintenance_calories: number;
  target_calories: number;
}

interface SubscriptionInfo {
  subscribed: boolean;
  product_id: string | null;
  subscription_end: string | null;
}

interface StripeSubscription {
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
}

export default function UserDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [managingSubscription, setManagingSubscription] = useState(false);
  const [workoutInteractions, setWorkoutInteractions] = useState<WorkoutInteraction[]>([]);
  const [programInteractions, setProgramInteractions] = useState<ProgramInteraction[]>([]);
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [stripeDetails, setStripeDetails] = useState<StripeSubscription | null>(null);
  const [favoriteExercises, setFavoriteExercises] = useState<FavoriteExercise[]>([]);
  const [oneRMHistory, setOneRMHistory] = useState<OneRMRecord[]>([]);
  const [bmrHistory, setBMRHistory] = useState<BMRRecord[]>([]);
  const [calorieHistory, setCalorieHistory] = useState<CalorieRecord[]>([]);

  useEffect(() => {
    initDashboard();
  }, []);

  const initDashboard = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      await fetchAllData(session.user.id);
      await checkSubscription();
    }
    setLoading(false);
  };

  const fetchAllData = async (userId: string) => {
    await Promise.all([
      fetchWorkoutInteractions(userId),
      fetchProgramInteractions(userId),
      fetchFavoriteExercises(userId),
      fetchCalculatorHistory(userId),
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

  const fetchFavoriteExercises = async (userId: string) => {
    const { data } = await supabase
      .from("favorite_exercises")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (data) setFavoriteExercises(data);
  };

  const fetchCalculatorHistory = async (userId: string) => {
    const { data: onerm } = await supabase
      .from("onerm_history")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);

    const { data: bmr } = await supabase
      .from("bmr_history")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);

    const { data: calorie } = await supabase
      .from("calorie_history")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);

    if (onerm) setOneRMHistory(onerm);
    if (bmr) setBMRHistory(bmr);
    if (calorie) setCalorieHistory(calorie);
  };

  const checkSubscription = async () => {
    try {
      if (!user) return;

      const { data: dbData, error: dbError } = await supabase
        .from('user_subscriptions')
        .select('plan_type, status, current_period_end, current_period_start, stripe_subscription_id, cancel_at_period_end')
        .eq('user_id', user.id)
        .single();

      if (dbError) {
        console.error("Dashboard subscription error:", dbError);
        return;
      }

      console.log("Dashboard subscription data:", dbData);

      const isSubscribed = dbData?.status === 'active' && (dbData.plan_type === 'gold' || dbData.plan_type === 'platinum');
      
      console.log("Dashboard - isSubscribed:", isSubscribed, "plan_type:", dbData?.plan_type, "status:", dbData?.status);

      setSubscriptionInfo({
        subscribed: isSubscribed,
        product_id: dbData?.plan_type || null,
        subscription_end: dbData?.current_period_end || null
      });

      if (dbData?.current_period_start && dbData?.current_period_end) {
        setStripeDetails({
          current_period_start: new Date(dbData.current_period_start).getTime() / 1000,
          current_period_end: new Date(dbData.current_period_end).getTime() / 1000,
          cancel_at_period_end: dbData.cancel_at_period_end || false
        });
      }
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

  const getDaysRemaining = () => {
    if (!subscriptionInfo?.subscription_end) return null;
    const endDate = new Date(subscriptionInfo.subscription_end);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleNavigateToWorkout = (workoutType: string, workoutId: string) => {
    navigate(`/workout/${workoutType}/${workoutId}`);
  };

  const handleNavigateToProgram = (programType: string, programId: string) => {
    navigate(`/trainingprogram/${programType}/${programId}`);
  };

  const handleManageSubscription = async () => {
    if (!user) return;
    
    setManagingSubscription(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
        toast({
          title: "Opening subscription portal",
          description: "Manage your subscription in the new tab",
        });
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Error",
        description: "Failed to open subscription management. Please try again.",
        variant: "destructive"
      });
    } finally {
      setManagingSubscription(false);
    }
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

  const hasActivePlan = subscriptionInfo?.subscribed && subscriptionInfo?.product_id;

  console.log("UserDashboard - Subscription Info:", subscriptionInfo);
  console.log("UserDashboard - hasActivePlan:", hasActivePlan);

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto max-w-7xl p-4 py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span className="text-xs sm:text-sm">Back</span>
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
              <div className="flex flex-col gap-6">
                {/* Plan Name */}
                <div>
                  <p className="text-2xl font-bold mb-1">
                    {getPlanName(subscriptionInfo.product_id)} Plan
                  </p>
                  
                  {/* Free Plan Info */}
                  {!subscriptionInfo.subscribed && (
                    <div className="space-y-2 mt-4">
                      <p className="text-sm text-muted-foreground">
                        You're currently on the free plan with limited access.
                      </p>
                      <Button onClick={() => navigate("/premiumbenefits")} className="mt-2">
                        Upgrade Now
                      </Button>
                    </div>
                  )}
                  
                  {/* Premium Plan Details */}
                  {subscriptionInfo.subscribed && subscriptionInfo.subscription_end && (
                    <div className="space-y-4 mt-4">
                      {/* Status Badges */}
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/20">
                          Active Subscription
                        </Badge>
                        {stripeDetails?.cancel_at_period_end ? (
                          <Badge variant="outline" className="text-xs bg-orange-500/10 text-orange-600 border-orange-500/20">
                            Cancels at period end
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-600 border-blue-500/20">
                            Auto-renewing
                          </Badge>
                        )}
                      </div>
                      
                      {/* Subscription Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-background/50 rounded-lg border border-border/50">
                        {/* Subscription Start */}
                        {stripeDetails?.current_period_start && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Subscription Started</p>
                            <p className="font-semibold">{formatTimestamp(stripeDetails.current_period_start)}</p>
                          </div>
                        )}
                        
                        {/* Next Billing Date */}
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            {stripeDetails?.cancel_at_period_end ? "Expires On" : "Next Billing Date"}
                          </p>
                          <p className="font-semibold">{formatDate(subscriptionInfo.subscription_end)}</p>
                        </div>
                        
                        {/* Days Remaining */}
                        {getDaysRemaining() !== null && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Days Remaining</p>
                            <p className="font-semibold text-primary">{getDaysRemaining()} days</p>
                          </div>
                        )}
                        
                        {/* Billing Type */}
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Billing Type</p>
                          <p className="font-semibold">
                            {stripeDetails?.cancel_at_period_end ? "One-time (No renewal)" : "Recurring Monthly"}
                          </p>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button 
                          onClick={handleManageSubscription}
                          disabled={managingSubscription}
                          className="flex-1"
                        >
                          {managingSubscription ? "Opening..." : "Manage Subscription"}
                        </Button>
                      </div>
                      
                      <p className="text-xs text-muted-foreground">
                        {stripeDetails?.cancel_at_period_end 
                          ? "Your subscription will end on the expiration date. You can reactivate anytime before then."
                          : "You can cancel, update payment method, or view billing history in the subscription portal."
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Fitness Overview */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Your Fitness Overview</h2>
          <p className="text-muted-foreground mb-4">
            Track your workout progress and achievements
          </p>
        </div>

        <Tabs defaultValue="workouts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="workouts">
              <Dumbbell className="mr-2 h-4 w-4" />
              Workouts
            </TabsTrigger>
            <TabsTrigger value="programs">
              <Calendar className="mr-2 h-4 w-4" />
              Programs
            </TabsTrigger>
            <TabsTrigger value="exercises">
              <Heart className="mr-2 h-4 w-4" />
              Exercises
            </TabsTrigger>
            <TabsTrigger value="calculators">
              <Calculator className="mr-2 h-4 w-4" />
              My Calculators
            </TabsTrigger>
          </TabsList>

          {/* Workouts Tab */}
          <TabsContent value="workouts" className="space-y-6">
            {!hasActivePlan ? (
              <Card className="border-primary/50 bg-gradient-to-r from-primary/5 to-primary/10">
                <CardContent className="text-center py-12">
                  <Crown className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Premium Feature</h3>
                  <p className="text-muted-foreground mb-6">
                    Track your workouts, mark favorites, and monitor your progress with a Gold or Platinum plan.
                  </p>
                  <Button onClick={() => navigate("/premiumbenefits")}>
                    Upgrade to Premium
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
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
            </>
            )}
          </TabsContent>

          {/* Programs Tab */}
          <TabsContent value="programs" className="space-y-6">
            {!hasActivePlan ? (
              <Card className="border-primary/50 bg-gradient-to-r from-primary/5 to-primary/10">
                <CardContent className="text-center py-12">
                  <Crown className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Premium Feature</h3>
                  <p className="text-muted-foreground mb-6">
                    Access structured training programs, track your progress, and achieve your fitness goals with a Gold or Platinum plan.
                  </p>
                  <Button onClick={() => navigate("/premiumbenefits")}>
                    Upgrade to Premium
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
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
            </>
            )}
          </TabsContent>

          {/* Exercises Tab */}
          <TabsContent value="exercises" className="space-y-6">
            {!hasActivePlan ? (
              <Card className="border-primary/50 bg-gradient-to-r from-primary/5 to-primary/10">
                <CardContent className="text-center py-12">
                  <Crown className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Premium Feature</h3>
                  <p className="text-muted-foreground mb-6">
                    Save your favorite exercises and build your personalized library with a Gold or Platinum plan.
                  </p>
                  <Button onClick={() => navigate("/premiumbenefits")}>
                    Upgrade to Premium
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
              <CardHeader>
                <CardTitle>My Favorite Exercises</CardTitle>
              </CardHeader>
              <CardContent>
                {favoriteExercises.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground mb-4">No favorite exercises yet</p>
                    <Button onClick={() => navigate("/exerciselibrary")}>
                      Browse Exercise Library
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {favoriteExercises.map((exercise) => (
                      <div
                        key={exercise.id}
                        className="p-3 bg-muted rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{exercise.exercise_name}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Added {formatDate(exercise.created_at)}
                            </p>
                          </div>
                          <Heart className="h-4 w-4 fill-red-500 text-red-500 ml-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            )}
          </TabsContent>

          {/* Calculators Tab */}
          <TabsContent value="calculators" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              {/* 1RM Calculator History */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">1RM Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  {oneRMHistory.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-xs text-muted-foreground mb-2">No history yet</p>
                      <Button size="sm" variant="outline" onClick={() => navigate("/1rmcalculator")}>
                        Calculate Now
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {oneRMHistory.map((record) => (
                        <div key={record.id} className="p-2 bg-muted rounded text-xs">
                          <div className="font-semibold">{record.one_rm_result.toFixed(1)} kg</div>
                          {record.exercise_name && (
                            <div className="text-muted-foreground">{record.exercise_name}</div>
                          )}
                          <div className="text-muted-foreground">
                            {record.weight_lifted}kg × {record.reps} reps
                          </div>
                          <div className="text-muted-foreground mt-1">
                            {formatDate(record.created_at)}
                          </div>
                        </div>
                      ))}
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full mt-2"
                        onClick={() => navigate("/1rmcalculator")}
                      >
                        View All / Add New
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* BMR Calculator History */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">BMR Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  {bmrHistory.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-xs text-muted-foreground mb-2">No history yet</p>
                      <Button size="sm" variant="outline" onClick={() => navigate("/bmrcalculator")}>
                        Calculate Now
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {bmrHistory.map((record) => (
                        <div key={record.id} className="p-2 bg-muted rounded text-xs">
                          <div className="font-semibold">{record.bmr_result} cal/day</div>
                          <div className="text-muted-foreground">
                            {record.age}y • {record.weight}kg • {record.height}cm
                          </div>
                          <div className="text-muted-foreground capitalize">
                            {record.gender}
                          </div>
                          <div className="text-muted-foreground mt-1">
                            {formatDate(record.created_at)}
                          </div>
                        </div>
                      ))}
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full mt-2"
                        onClick={() => navigate("/bmrcalculator")}
                      >
                        View All / Add New
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Macro Tracking Calculator History */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Macro Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  {calorieHistory.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-xs text-muted-foreground mb-2">No history yet</p>
                      <Button size="sm" variant="outline" onClick={() => navigate("/macrocalculator")}>
                        Calculate Now
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {calorieHistory.map((record) => (
                        <div key={record.id} className="p-2 bg-muted rounded text-xs">
                          <div className="font-semibold">{record.target_calories} cal/day</div>
                          <div className="text-muted-foreground capitalize">
                            Goal: {record.goal.replace('_', ' ')}
                          </div>
                          <div className="text-muted-foreground">
                            Maintenance: {record.maintenance_calories} cal
                          </div>
                          <div className="text-muted-foreground mt-1">
                            {formatDate(record.created_at)}
                          </div>
                        </div>
                      ))}
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full mt-2"
                        onClick={() => navigate("/macrocalculator")}
                      >
                        View All / Add New
                      </Button>
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
