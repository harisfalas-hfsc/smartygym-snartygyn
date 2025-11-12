import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Users, DollarSign, TrendingUp, Star, Activity } from "lucide-react";
import { toast } from "sonner";
import { RevenueAnalytics } from "./RevenueAnalytics";
import { PurchaseAnalytics } from "./PurchaseAnalytics";
import { PersonalTrainingAnalytics } from "./PersonalTrainingAnalytics";

interface AnalyticsData {
  totalUsers: number;
  activeSubscribers: number;
  totalRevenue: number;
  avgCompletionRate: number;
  totalWorkouts: number;
  totalComments: number;
}

interface ChartData {
  name: string;
  value: number;
}

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    activeSubscribers: 0,
    totalRevenue: 0,
    avgCompletionRate: 0,
    totalWorkouts: 0,
    totalComments: 0,
  });
  const [userGrowth, setUserGrowth] = useState<ChartData[]>([]);
  const [revenueData, setRevenueData] = useState<ChartData[]>([]);
  const [completionData, setCompletionData] = useState<ChartData[]>([]);
  const [popularWorkouts, setPopularWorkouts] = useState<ChartData[]>([]);
  const [subscriptionDistribution, setSubscriptionDistribution] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch total users and user growth over time
      const { data: profiles } = await supabase
        .from("profiles")
        .select("created_at");

      const totalUsers = profiles?.length || 0;

      // Group users by month for user growth chart
      const usersByMonth: { [key: string]: number } = {};
      profiles?.forEach((profile) => {
        const month = new Date(profile.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short" });
        usersByMonth[month] = (usersByMonth[month] || 0) + 1;
      });
      const userGrowthData = Object.entries(usersByMonth).map(([name, value]) => ({ name, value }));

      // Fetch subscription data
      const { data: subscriptions } = await supabase
        .from("user_subscriptions")
        .select("plan_type, status, created_at");

      const activeSubscribers = subscriptions?.filter(s => s.status === "active" && s.plan_type !== "free").length || 0;

      // Fetch real revenue from Stripe and calculate all income streams
      let totalRevenue = 0;
      let revenueChartData: ChartData[] = [];
      
      try {
        const { data: stripeData, error: revenueError } = await supabase.functions.invoke('get-stripe-revenue');
        
        if (!revenueError && stripeData) {
          totalRevenue = stripeData.totalRevenue || 0;
        }
      } catch (error) {
        console.error("Error fetching Stripe revenue:", error);
        totalRevenue = 0;
      }

      // Calculate revenue by income stream
      const goldRevenue = subscriptions?.filter(s => s.status === "active" && s.plan_type === "gold").length || 0;
      const platinumRevenue = subscriptions?.filter(s => s.status === "active" && s.plan_type === "platinum").length || 0;

      // Fetch standalone purchases revenue
      const { data: purchases } = await supabase
        .from("user_purchases")
        .select("price");
      const standaloneRevenue = purchases?.reduce((sum, p) => sum + Number(p.price || 0), 0) || 0;

      // Fetch personal training revenue
      const { data: ptRequests } = await supabase
        .from("personal_training_requests")
        .select("*")
        .eq("stripe_payment_status", "paid");
      const personalTrainingRevenue = (ptRequests?.length || 0) * 100; // Assuming $100 per PT request

      // Create unified revenue comparison data
      revenueChartData = [
        { name: "Gold Plans", value: goldRevenue * 15 }, // Assuming $15/month
        { name: "Platinum Plans", value: platinumRevenue * 25 }, // Assuming $25/month
        { name: "Standalone Purchases", value: standaloneRevenue },
        { name: "Personal Training", value: personalTrainingRevenue }
      ];

      // Subscription distribution
      const subDistribution: { [key: string]: number } = {};
      subscriptions?.forEach((sub) => {
        if (sub.status === "active") {
          subDistribution[sub.plan_type] = (subDistribution[sub.plan_type] || 0) + 1;
        }
      });
      const subDistData = Object.entries(subDistribution).map(([name, value]) => ({ name, value }));

      // Fetch workout interactions
      const { data: workoutInteractions } = await supabase
        .from("workout_interactions")
        .select("is_completed, workout_name");

      const totalWorkouts = workoutInteractions?.length || 0;
      const completedWorkouts = workoutInteractions?.filter(w => w.is_completed).length || 0;
      const avgCompletionRate = totalWorkouts > 0 ? Math.round((completedWorkouts / totalWorkouts) * 100) : 0;

      // Completion rate by workout type (top 5)
      const workoutCompletions: { [key: string]: { total: number; completed: number } } = {};
      workoutInteractions?.forEach((interaction) => {
        if (!workoutCompletions[interaction.workout_name]) {
          workoutCompletions[interaction.workout_name] = { total: 0, completed: 0 };
        }
        workoutCompletions[interaction.workout_name].total += 1;
        if (interaction.is_completed) {
          workoutCompletions[interaction.workout_name].completed += 1;
        }
      });

      const completionChartData = Object.entries(workoutCompletions)
        .map(([name, data]) => ({
          name: name.length > 20 ? name.substring(0, 20) + "..." : name,
          value: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      // Popular workouts (most completed)
      const workoutPopularity: { [key: string]: number } = {};
      workoutInteractions?.forEach((interaction) => {
        if (interaction.is_completed) {
          workoutPopularity[interaction.workout_name] = (workoutPopularity[interaction.workout_name] || 0) + 1;
        }
      });
      const popularWorkoutsData = Object.entries(workoutPopularity)
        .map(([name, value]) => ({
          name: name.length > 20 ? name.substring(0, 20) + "..." : name,
          value,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

      // Fetch comments
      const { data: comments } = await supabase
        .from("workout_comments")
        .select("id");

      const totalComments = comments?.length || 0;

      setAnalytics({
        totalUsers,
        activeSubscribers,
        totalRevenue,
        avgCompletionRate,
        totalWorkouts,
        totalComments,
      });

      setUserGrowth(userGrowthData);
      setRevenueData(revenueChartData);
      setCompletionData(completionChartData);
      setPopularWorkouts(popularWorkoutsData);
      setSubscriptionDistribution(subDistData);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "hsl(var(--muted))"];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-lg">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.activeSubscribers}</div>
            <p className="text-xs text-muted-foreground">Paid memberships</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.totalRevenue}</div>
            <p className="text-xs text-muted-foreground">From subscriptions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.avgCompletionRate}%</div>
            <p className="text-xs text-muted-foreground">Average workout completion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workouts</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalWorkouts}</div>
            <p className="text-xs text-muted-foreground">Workout sessions logged</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Community Engagement</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalComments}</div>
            <p className="text-xs text-muted-foreground">Comments posted</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <div className="w-full overflow-x-auto">
          <TabsList className="w-full inline-flex sm:grid sm:grid-cols-6 min-w-max sm:min-w-0">
            <TabsTrigger value="revenue" className="flex-shrink-0 whitespace-nowrap">Subscriptions</TabsTrigger>
            <TabsTrigger value="purchases" className="flex-shrink-0 whitespace-nowrap">Purchases</TabsTrigger>
            <TabsTrigger value="personal-training" className="flex-shrink-0 whitespace-nowrap">Personal Training</TabsTrigger>
            <TabsTrigger value="growth" className="flex-shrink-0 whitespace-nowrap">User Growth</TabsTrigger>
            <TabsTrigger value="completion" className="flex-shrink-0 whitespace-nowrap">Completion Rates</TabsTrigger>
            <TabsTrigger value="popular" className="flex-shrink-0 whitespace-nowrap">Popular Content</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Comparison - All Income Streams</CardTitle>
              <CardDescription>Side-by-side comparison of all revenue sources</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Revenue ($)" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <RevenueAnalytics />
        </TabsContent>

        <TabsContent value="purchases" className="space-y-4">
          <PurchaseAnalytics />
        </TabsContent>

        <TabsContent value="personal-training" className="space-y-4">
          <PersonalTrainingAnalytics />
        </TabsContent>

        <TabsContent value="growth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Growth Over Time</CardTitle>
              <CardDescription>New user registrations by month</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" name="New Users" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subscription Distribution</CardTitle>
              <CardDescription>Active subscriptions by plan type</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={subscriptionDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="hsl(var(--primary))"
                    dataKey="value"
                  >
                    {subscriptionDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>


        <TabsContent value="completion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workout Completion Rates</CardTitle>
              <CardDescription>Top 5 workouts by completion percentage</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={completionData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis type="category" dataKey="name" width={150} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Completion %" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="popular" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Most Popular Workouts</CardTitle>
              <CardDescription>Top 10 most completed workouts</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={popularWorkouts} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={150} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Completions" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
