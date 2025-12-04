import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Users, DollarSign, TrendingUp, Star, Activity, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { RevenueAnalytics } from "./RevenueAnalytics";
import { PurchaseAnalytics } from "./PurchaseAnalytics";
import { ContactAnalytics } from "./ContactAnalytics";
import { ShopAnalytics } from "./ShopAnalytics";

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
  const [timeFilter, setTimeFilter] = useState<string>("30");
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
  const [revenueDistribution, setRevenueDistribution] = useState<ChartData[]>([]);
  const [revenueTrends, setRevenueTrends] = useState<any[]>([]);
  const [completionData, setCompletionData] = useState<ChartData[]>([]);
  const [popularWorkouts, setPopularWorkouts] = useState<ChartData[]>([]);
  const [subscriptionDistribution, setSubscriptionDistribution] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [timeFilter]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Calculate date range based on time filter
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(timeFilter));

      // Fetch total users and user growth over time
      const { data: profiles } = await supabase
        .from("profiles")
        .select("created_at")
        .gte("created_at", startDate.toISOString());

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
        .select("plan_type, status, created_at, current_period_end");

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
        .select("price, purchased_at");
      const standaloneRevenue = purchases?.reduce((sum, p) => sum + Number(p.price || 0), 0) || 0;

      // Create unified revenue comparison data
      revenueChartData = [
        { name: "Gold Plans", value: goldRevenue * 15 }, // €15/month
        { name: "Platinum Plans", value: platinumRevenue * 25 }, // €25/month
        { name: "Standalone Purchases", value: standaloneRevenue }
      ];

      // Create revenue distribution pie chart data
      const totalRevenueSum = revenueChartData.reduce((sum, item) => sum + item.value, 0);
      const distributionData = revenueChartData.map(item => ({
        name: item.name,
        value: item.value,
        percentage: totalRevenueSum > 0 ? ((item.value / totalRevenueSum) * 100).toFixed(1) : 0
      }));

      // Calculate 6-month revenue trends
      const trendsData: any[] = [];
      const now = new Date();
      
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = monthDate.toLocaleDateString("en-US", { year: "numeric", month: "short" });
        const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
        const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

        // Count active subscriptions for that month
        const goldCount = subscriptions?.filter(s => {
          const startDate = new Date(s.created_at);
          return s.plan_type === "gold" && startDate <= monthEnd && 
                 (!s.current_period_end || new Date(s.current_period_end) >= monthStart);
        }).length || 0;

        const platinumCount = subscriptions?.filter(s => {
          const startDate = new Date(s.created_at);
          return s.plan_type === "platinum" && startDate <= monthEnd && 
                 (!s.current_period_end || new Date(s.current_period_end) >= monthStart);
        }).length || 0;

        // Count purchases for that month
        const monthPurchases = purchases?.filter(p => {
          const purchaseDate = new Date(p.purchased_at);
          return purchaseDate >= monthStart && purchaseDate <= monthEnd;
        }) || [];
        const monthPurchaseRevenue = monthPurchases.reduce((sum, p) => sum + Number(p.price || 0), 0);

        trendsData.push({
          name: monthName,
          "Gold Plans": goldCount * 15,
          "Platinum Plans": platinumCount * 25,
          "Standalone Purchases": monthPurchaseRevenue
        });
      }

      setRevenueDistribution(distributionData);
      setRevenueTrends(trendsData);

      // Subscription distribution
      const subDistribution: { [key: string]: number } = {};
      subscriptions?.forEach((sub) => {
        if (sub.status === "active") {
          subDistribution[sub.plan_type] = (subDistribution[sub.plan_type] || 0) + 1;
        }
      });
      const subDistData = Object.entries(subDistribution).map(([name, value]) => ({ name, value }));

      // Fetch workout interactions within date range
      const { data: workoutInteractions } = await supabase
        .from("workout_interactions")
        .select("is_completed, workout_name")
        .gte("created_at", startDate.toISOString());

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

      // Popular workouts - Query from actual database workouts
      const { data: adminWorkouts } = await supabase
        .from("admin_workouts")
        .select("name, id");

      const { data: adminPrograms } = await supabase
        .from("admin_training_programs")
        .select("name, id");

      // Count completions for each workout/program from database
      const contentCompletions: { [key: string]: number } = {};
      
      workoutInteractions?.forEach((interaction) => {
        const exists = adminWorkouts?.some(w => w.name === interaction.workout_name) ||
                      adminPrograms?.some(p => p.name === interaction.workout_name);
        if (exists && interaction.is_completed) {
          contentCompletions[interaction.workout_name] = (contentCompletions[interaction.workout_name] || 0) + 1;
        }
      });
      
      const popularWorkoutsData = Object.entries(contentCompletions)
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
    <div className="pt-6 space-y-6">
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
            <div className="text-2xl font-bold">€{analytics.totalRevenue}</div>
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
        <div className="w-full overflow-x-auto -mx-2 px-2">
          <TabsList className="inline-flex w-auto min-w-full h-auto p-1">
            <TabsTrigger value="revenue" className="flex-shrink-0 whitespace-nowrap text-xs sm:text-sm px-2 sm:px-3 py-2">Revenue</TabsTrigger>
            <TabsTrigger value="purchases" className="flex-shrink-0 whitespace-nowrap text-xs sm:text-sm px-2 sm:px-3 py-2">Purchases</TabsTrigger>
            <TabsTrigger value="communications" className="flex-shrink-0 whitespace-nowrap text-xs sm:text-sm px-2 sm:px-3 py-2">Messages</TabsTrigger>
            <TabsTrigger value="growth" className="flex-shrink-0 whitespace-nowrap text-xs sm:text-sm px-2 sm:px-3 py-2">Growth</TabsTrigger>
            <TabsTrigger value="completion" className="flex-shrink-0 whitespace-nowrap text-xs sm:text-sm px-2 sm:px-3 py-2">Completion</TabsTrigger>
            <TabsTrigger value="popular" className="flex-shrink-0 whitespace-nowrap text-xs sm:text-sm px-2 sm:px-3 py-2">Popular</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Comparison - All Income Streams</CardTitle>
                <CardDescription>Side-by-side comparison of all revenue sources</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Revenue (€)" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Distribution</CardTitle>
                <CardDescription>Percentage breakdown by income stream</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={revenueDistribution}
                      cx="50%"
                      cy="45%"
                      outerRadius={120}
                      fill="hsl(var(--primary))"
                      dataKey="value"
                    >
                      {revenueDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any, name: any, props: any) => [`€${value}`, `${props.payload.percentage}%`]} />
                    <Legend 
                      verticalAlign="bottom" 
                      height={60}
                      formatter={(value: string, entry: any) => `${value}: ${entry.payload.percentage}%`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>6-Month Revenue Trends</CardTitle>
              <CardDescription>Historical revenue by income stream</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={revenueTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Gold Plans" stroke="hsl(var(--primary))" strokeWidth={2} />
                  <Line type="monotone" dataKey="Platinum Plans" stroke="hsl(var(--secondary))" strokeWidth={2} />
                  <Line type="monotone" dataKey="Standalone Purchases" stroke="hsl(var(--accent))" strokeWidth={2} />
                  <Line type="monotone" dataKey="Personal Training" stroke="hsl(var(--muted))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <RevenueAnalytics />
        </TabsContent>

        <TabsContent value="purchases" className="space-y-4">
          <PurchaseAnalytics />
        </TabsContent>

        <TabsContent value="shop" className="space-y-4">
          <ShopAnalytics />
        </TabsContent>


        <TabsContent value="communications" className="space-y-4">
          <ContactAnalytics />
        </TabsContent>

        <TabsContent value="growth" className="space-y-4">
          {/* Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Select value={timeFilter} onValueChange={setTimeFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 Days</SelectItem>
                    <SelectItem value="30">Last 30 Days</SelectItem>
                    <SelectItem value="90">Last 90 Days</SelectItem>
                    <SelectItem value="180">Last 6 Months</SelectItem>
                    <SelectItem value="365">Last Year</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={fetchAnalytics} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                  {loading ? "Loading..." : "Refresh"}
                </Button>
              </div>
            </CardContent>
          </Card>

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
          {/* Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Select value={timeFilter} onValueChange={setTimeFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 Days</SelectItem>
                    <SelectItem value="30">Last 30 Days</SelectItem>
                    <SelectItem value="90">Last 90 Days</SelectItem>
                    <SelectItem value="180">Last 6 Months</SelectItem>
                    <SelectItem value="365">Last Year</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={fetchAnalytics} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                  {loading ? "Loading..." : "Refresh"}
                </Button>
              </div>
            </CardContent>
          </Card>

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
          {/* Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Select value={timeFilter} onValueChange={setTimeFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 Days</SelectItem>
                    <SelectItem value="30">Last 30 Days</SelectItem>
                    <SelectItem value="90">Last 90 Days</SelectItem>
                    <SelectItem value="180">Last 6 Months</SelectItem>
                    <SelectItem value="365">Last Year</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={fetchAnalytics} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                  {loading ? "Loading..." : "Refresh"}
                </Button>
              </div>
            </CardContent>
          </Card>

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
