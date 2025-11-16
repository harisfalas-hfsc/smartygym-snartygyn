import { useEffect, useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { usePurchases } from "@/hooks/usePurchases";
import { UserMessagesPanel } from "@/components/UserMessagesPanel";
import { useQuery } from "@tanstack/react-query";
import { 
  Heart, 
  CheckCircle, 
  Clock,
  Star,
  Dumbbell,
  Calendar,
  Crown,
  ArrowLeft,
  Calculator,
  ShoppingBag,
  MessageSquare,
  Loader2,
  RefreshCw,
  ExternalLink,
  ClipboardList,
  TrendingUp,
  BookOpen,
  Headphones,
  Sparkles
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
  const location = useLocation();
  const [searchParams] = useSearchParams();
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
  
  // Get tab from URL or default to "workouts"
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || 'workouts');
  
  // Fetch user purchases
  const { data: purchases = [], isLoading: purchasesLoading } = usePurchases(user?.id);

  // Fetch unread messages count (both contact and system)
  const { data: unreadCount = 0, refetch: refetchUnreadCount } = useQuery({
    queryKey: ['unread-messages-count', user?.id],
    queryFn: async () => {
      if (!user) return 0;

      const [contactResult, systemResult] = await Promise.all([
        supabase
          .from('contact_messages')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .not('response', 'is', null)
          .is('response_read_at', null),
        supabase
          .from('user_system_messages')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_read', false)
      ]);

      const contactCount = contactResult.count || 0;
      const systemCount = systemResult.count || 0;

      return contactCount + systemCount;
    },
    enabled: !!user,
  });

  useEffect(() => {
    initDashboard();

    // Listen for auth state changes to handle session updates after refresh
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT' || !session?.user) {
          setUser(null);
          setLoading(false);
          navigate('/auth');
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // Defer Supabase calls to prevent deadlock
          setUser(session.user);
          setTimeout(async () => {
            await Promise.allSettled([
              fetchAllData(session.user.id),
              checkSubscription(session.user.id)
            ]);
            setLoading(false);
          }, 0);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const initDashboard = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setLoading(false);
        navigate('/auth');
        return;
      }

      setUser(session.user);
      
      // Fetch all data in parallel with individual error handling
      await Promise.allSettled([
        fetchAllData(session.user.id),
        checkSubscription(session.user.id)
      ]);
      
    } catch (error) {
      console.error("Error initializing dashboard:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard. Please refresh the page.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAllData = async (userId: string) => {
    // Use allSettled so individual failures don't block others
    await Promise.allSettled([
      fetchWorkoutInteractions(userId),
      fetchProgramInteractions(userId),
      fetchFavoriteExercises(userId),
      fetchCalculatorHistory(userId),
    ]);
  };

  const fetchWorkoutInteractions = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("workout_interactions")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      if (data) setWorkoutInteractions(data);
    } catch (error) {
      console.error("Error fetching workout interactions:", error);
    }
  };

  const fetchProgramInteractions = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("program_interactions")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      if (data) setProgramInteractions(data);
    } catch (error) {
      console.error("Error fetching program interactions:", error);
    }
  };

  const fetchFavoriteExercises = async (userId: string) => {
    // Favorite exercises feature removed
    setFavoriteExercises([]);
  };

  const fetchCalculatorHistory = async (userId: string) => {
    try {
      // Fetch all calculator histories in parallel
      const [onermResult, bmrResult, calorieResult] = await Promise.allSettled([
        supabase
          .from("onerm_history")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("bmr_history")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("calorie_history")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(5)
      ]);

      if (onermResult.status === 'fulfilled' && onermResult.value.data) {
        setOneRMHistory(onermResult.value.data);
      }
      if (bmrResult.status === 'fulfilled' && bmrResult.value.data) {
        setBMRHistory(bmrResult.value.data);
      }
      if (calorieResult.status === 'fulfilled' && calorieResult.value.data) {
        setCalorieHistory(calorieResult.value.data);
      }
    } catch (error) {
      console.error("Error fetching calculator history:", error);
    }
  };

  const checkSubscription = async (userId?: string) => {
    try {
      const uid = userId || user?.id;
      if (!uid) return;

      const { data: dbData, error: dbError } = await supabase
        .from('user_subscriptions')
        .select('plan_type, status, current_period_end, current_period_start, stripe_subscription_id, cancel_at_period_end')
        .eq('user_id', uid)
        .maybeSingle();

      if (dbError) {
        console.error("Dashboard subscription error:", dbError);
        return;
      }

      if (!dbData) {
        setSubscriptionInfo({
          subscribed: false,
          product_id: null,
          subscription_end: null
        });
        return;
      }

      const isSubscribed = dbData?.status === 'active' && (dbData.plan_type === 'gold' || dbData.plan_type === 'platinum');

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
    // Use plan_type from database (gold, platinum, free)
    const planType = productId.toLowerCase();
    if (planType === "gold") return "Gold";
    if (planType === "platinum") return "Platinum";
    if (planType === "free") return "Free";
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
    if (!user) {
      console.error("No user found when trying to manage subscription");
      toast({
        title: "Error",
        description: "Please log in to manage your subscription.",
        variant: "destructive"
      });
      return;
    }
    
    console.log("Opening customer portal for user:", user.id);
    setManagingSubscription(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("No active session found");
      }

      console.log("Invoking customer-portal function...");
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      console.log("Customer portal response:", { data, error });
      
      if (error) {
        console.error("Customer portal error:", error);
        throw error;
      }
      
      if (data?.url) {
        console.log("Opening portal URL:", data.url);
        window.open(data.url, '_blank');
        toast({
          title: "Opening subscription portal",
          description: "Manage your subscription in the new tab",
        });
      } else if (data?.portalNotConfigured) {
        // Portal not configured in Stripe - provide helpful message
        toast({
          title: "Portal Setup Required",
          description: "The subscription management portal is being set up. Please contact support for subscription changes.",
          variant: "destructive"
        });
      } else {
        throw new Error("No portal URL returned");
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      
      // Check if it's a portal configuration error
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isConfigError = errorMessage.includes("No configuration") || 
                           errorMessage.includes("default configuration");
      
      if (isConfigError) {
        toast({
          title: "Portal Setup Required",
          description: "The subscription management portal is being configured. Please contact support for subscription changes.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: `Failed to open subscription management: ${errorMessage}`,
          variant: "destructive"
        });
      }
    } finally {
      setManagingSubscription(false);
    }
  };

  const handleRefreshSubscription = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Force refresh from Stripe
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        throw error;
      }
      
      // Reload subscription data
      await checkSubscription();
      
      toast({
        title: "Subscription refreshed",
        description: "Your subscription status has been updated from Stripe",
      });
    } catch (error) {
      console.error('Error refreshing subscription:', error);
      toast({
        title: "Error",
        description: "Failed to refresh subscription status. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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
          <Card className="mb-6 border-primary/50 bg-gradient-to-r from-primary/5 to-primary/10">
            <CardContent className="p-4">
              {/* Free Plan - Simple Layout */}
              {!subscriptionInfo.subscribed && (
                <div className="space-y-3">
                  <h2 className="flex items-center gap-2 text-lg font-bold">
                    <Crown className="h-5 w-5 text-primary" />
                    Your Free Membership
                  </h2>
                  <div>
                    <h3 className="text-sm font-semibold mb-1">Free Plan</h3>
                    <p className="text-sm text-muted-foreground">
                      You're currently on the free plan with limited access.
                    </p>
                  </div>
                  <Button onClick={() => navigate("/premiumbenefits")} className="w-full sm:w-auto">
                    Upgrade Now
                  </Button>
                </div>
              )}

              {/* Premium Plan - Two Column Layout with Title in Left Column */}
              {subscriptionInfo.subscribed && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {/* LEFT COLUMN - Title + Plan Info & Actions */}
                  <div className="col-span-1 md:col-span-2 space-y-3">
                    {/* Title at top of left column */}
                    <h2 className="flex items-center gap-2 text-lg font-bold">
                      <Crown className="h-5 w-5 text-primary" />
                      Your {getPlanName(subscriptionInfo.product_id)} Membership
                    </h2>
                    
                    {/* Plan Status */}
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold">{getPlanName(subscriptionInfo.product_id)} Plan</h3>
                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant="outline" className="text-xs h-5 px-1.5 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30">
                          <Crown className="h-3 w-3 mr-1" />
                          Premium Member
                        </Badge>
                        <Badge variant="outline" className="text-xs h-5 px-1.5 bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                          Active
                        </Badge>
                        {stripeDetails?.cancel_at_period_end && (
                          <Badge variant="outline" className="text-xs h-5 px-1.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20">
                            Cancels at period end
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Subscription Details */}
                    {subscriptionInfo.subscription_end && (
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            {stripeDetails?.cancel_at_period_end ? "Expires:" : "Next Billing:"}
                          </span>
                          <span className="font-medium">{formatDate(subscriptionInfo.subscription_end)}</span>
                        </div>
                        {getDaysRemaining() !== null && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Days Left:</span>
                            <span className="font-medium text-primary">{getDaysRemaining()} days</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Billing:</span>
                          <span className="font-medium">
                            {stripeDetails?.cancel_at_period_end ? "One-time" : "Auto-renewing"}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-1">
                      <Button
                        onClick={handleRefreshSubscription}
                        disabled={loading}
                        variant="outline"
                        className="h-7 px-2 text-xs"
                      >
                        {loading ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <>
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Refresh
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={handleManageSubscription}
                        disabled={managingSubscription}
                        className="h-7 px-2 text-xs"
                      >
                        {managingSubscription ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <>
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Manage
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* RIGHT COLUMN - Membership Benefits (aligned with title) */}
                  <div className="col-span-1 md:col-span-3 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-3 border border-primary/20">
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2 tracking-wide">
                      Membership Benefits
                    </h4>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                      <div className="bg-white/50 dark:bg-gray-800/50 rounded-md p-2 border border-primary/10 hover:border-primary/30 transition-colors">
                        <div className="flex flex-col items-center text-center gap-1">
                          <Dumbbell className="h-5 w-5 text-primary" />
                          <span className="text-xs font-semibold">500+ Premium</span>
                          <span className="text-xs font-medium">Workouts</span>
                        </div>
                      </div>
                      
                      <div className="bg-white/50 dark:bg-gray-800/50 rounded-md p-2 border border-primary/10 hover:border-primary/30 transition-colors">
                        <div className="flex flex-col items-center text-center gap-1">
                          <ClipboardList className="h-5 w-5 text-primary" />
                          <span className="text-xs font-semibold">Training</span>
                          <span className="text-xs font-medium">Programs</span>
                        </div>
                      </div>
                      
                      <div className="bg-white/50 dark:bg-gray-800/50 rounded-md p-2 border border-primary/10 hover:border-primary/30 transition-colors">
                        <div className="flex flex-col items-center text-center gap-1">
                          <TrendingUp className="h-5 w-5 text-primary" />
                          <span className="text-xs font-semibold">Progress</span>
                          <span className="text-xs font-medium">Tracking</span>
                        </div>
                      </div>
                      
                      <div className="bg-white/50 dark:bg-gray-800/50 rounded-md p-2 border border-primary/10 hover:border-primary/30 transition-colors">
                        <div className="flex flex-col items-center text-center gap-1">
                          <Calculator className="h-5 w-5 text-primary" />
                          <span className="text-xs font-semibold">Fitness</span>
                          <span className="text-xs font-medium">Calculators</span>
                        </div>
                      </div>
                      
                      <div className="bg-white/50 dark:bg-gray-800/50 rounded-md p-2 border border-primary/10 hover:border-primary/30 transition-colors">
                        <div className="flex flex-col items-center text-center gap-1">
                          <BookOpen className="h-5 w-5 text-primary" />
                          <span className="text-xs font-semibold">Exercise</span>
                          <span className="text-xs font-medium">Library</span>
                        </div>
                      </div>
                      
                      <div className="bg-white/50 dark:bg-gray-800/50 rounded-md p-2 border border-primary/10 hover:border-primary/30 transition-colors">
                        <div className="flex flex-col items-center text-center gap-1">
                          <Headphones className="h-5 w-5 text-primary" />
                          <span className="text-xs font-semibold">Premium</span>
                          <span className="text-xs font-medium">Support</span>
                        </div>
                      </div>
                      
                      <div className="bg-white/50 dark:bg-gray-800/50 rounded-md p-2 border border-primary/10 hover:border-primary/30 transition-colors">
                        <div className="flex flex-col items-center text-center gap-1">
                          <Sparkles className="h-5 w-5 text-primary" />
                          <span className="text-xs font-semibold">Ad-Free</span>
                          <span className="text-xs font-medium">Experience</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quick Stats Overview - For all users */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
          <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Favorite Workouts</p>
                  <p className="text-2xl font-bold">{favoriteWorkouts.length}</p>
                </div>
                <Heart className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Completed Workouts</p>
                  <p className="text-2xl font-bold">{completedWorkouts.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Favorite Programs</p>
                  <p className="text-2xl font-bold">{favoritePrograms.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Ratings</p>
                  <p className="text-2xl font-bold">{ratedWorkouts.length + ratedPrograms.length}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Calculator Uses</p>
                  <p className="text-2xl font-bold">{oneRMHistory.length + bmrHistory.length + calorieHistory.length}</p>
                </div>
                <Calculator className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Overview */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">My Dashboard</h2>
          <p className="text-muted-foreground mb-4">
            Access your workouts, programs, purchases, messages, and more
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="w-full overflow-x-auto">
            <TabsList className="w-full inline-flex sm:grid sm:grid-cols-5 min-w-max sm:min-w-0">
              <TabsTrigger value="workouts" className="flex-shrink-0">
                <Dumbbell className="mr-2 h-4 w-4" />
                <span className="whitespace-nowrap">Workouts</span>
              </TabsTrigger>
              <TabsTrigger value="programs" className="flex-shrink-0">
                <Calendar className="mr-2 h-4 w-4" />
                <span className="whitespace-nowrap">Programs</span>
              </TabsTrigger>
              <TabsTrigger value="purchases" className="flex-shrink-0">
                <ShoppingBag className="mr-2 h-4 w-4" />
                <span className="whitespace-nowrap">My Purchases</span>
              </TabsTrigger>
              <TabsTrigger value="messages" className="flex-shrink-0">
                <MessageSquare className="mr-2 h-4 w-4" />
                <span className="whitespace-nowrap">Messages</span>
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="ml-2 h-5 min-w-5 flex items-center justify-center rounded-full p-1 text-xs"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="calculators" className="flex-shrink-0">
                <Calculator className="mr-2 h-4 w-4" />
                <span className="whitespace-nowrap">My Calculators</span>
              </TabsTrigger>
            </TabsList>
          </div>

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

          {/* My Purchases Tab */}
          <TabsContent value="purchases" className="space-y-6">
            {/* Premium Member Special Message */}
            {hasActivePlan && (
              <Card className="border-primary bg-gradient-to-br from-primary/10 via-primary/5 to-background overflow-hidden">
                <CardContent className="text-center py-12 px-6 relative">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
                    <Crown className="h-10 w-10 text-primary animate-pulse" />
                  </div>
                  <h3 className="text-3xl font-bold mb-3 bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                    🎉 Congratulations! 🎉
                  </h3>
                  <p className="text-xl font-semibold mb-2 text-foreground">
                    You're a {getPlanName(subscriptionInfo?.product_id)} Member!
                  </p>
                  <p className="text-lg text-muted-foreground mb-4">
                    No need to purchase anything — everything is unlocked for you!
                  </p>
                  <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/5 border border-primary/20">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span className="font-medium text-primary">Full Access to All Content</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-6 max-w-2xl mx-auto">
                    As a premium member, you have unlimited access to all workouts, training programs, and exclusive features. 
                    Enjoy your complete fitness experience!
                  </p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  My Purchases
                </CardTitle>
              </CardHeader>
              <CardContent>
                {purchasesLoading ? (
                  <p className="text-center text-muted-foreground py-8">Loading purchases...</p>
                ) : purchases.length === 0 ? (
                  <div className="text-center py-8 space-y-4">
                    {!hasActivePlan && (
                      <>
                        <p className="text-muted-foreground">You haven't purchased any individual content yet</p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <Button onClick={() => navigate("/workout/strength")}>
                            Browse Workouts
                          </Button>
                          <Button variant="outline" onClick={() => navigate("/trainingprogram/functional-strength")}>
                            Browse Programs
                          </Button>
                        </div>
                      </>
                    )}
                    {hasActivePlan && (
                      <p className="text-muted-foreground">No individual purchases — but you have full access to everything as a premium member!</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {purchases.map((purchase) => (
                      <Card key={purchase.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {purchase.content_type === "workout" ? "Workout" : "Program"}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  Purchased {new Date(purchase.purchased_at).toLocaleDateString()}
                                </span>
                              </div>
                              <h3 className="text-lg font-semibold">{purchase.content_name}</h3>
                              <p className="text-sm text-muted-foreground">€{Number(purchase.price).toFixed(2)}</p>
                            </div>
                            <Button
                              onClick={() => {
                                if (purchase.content_type === "workout") {
                                  navigate(`/workout/detail/${purchase.content_id}`);
                                } else {
                                  navigate(`/trainingprogram/detail/${purchase.content_id}`);
                                }
                              }}
                            >
                              View Content
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-6">
            <UserMessagesPanel />
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
