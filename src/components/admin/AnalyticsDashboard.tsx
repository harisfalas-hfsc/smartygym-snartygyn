import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { 
  Users, DollarSign, TrendingUp, Star, Activity, RefreshCw, 
  ShoppingCart, Building2, CheckCircle, MessageCircle, 
  Dumbbell, Calendar, Heart, Download, Globe, Award
} from "lucide-react";
import { toast } from "sonner";
import { RevenueAnalytics } from "./RevenueAnalytics";
import { PurchaseAnalytics } from "./PurchaseAnalytics";
import { ContactAnalytics } from "./ContactAnalytics";
import { ShopAnalytics } from "./ShopAnalytics";
import { WebsiteAnalytics } from "./analytics/WebsiteAnalytics";
import { CorporateAnalytics } from "./analytics/CorporateAnalytics";
import { AnalyticsMetricCard } from "./analytics/AnalyticsMetricCard";
import { CompletionAnalytics } from "./analytics/CompletionAnalytics";
import { GrowthAnalytics } from "./analytics/GrowthAnalytics";
import { PopularAnalytics } from "./analytics/PopularAnalytics";
import { BusinessReportExport } from "./analytics/BusinessReportExport";
import html2canvas from "html2canvas";
import { SUBSCRIPTION_PRICES, SUBSCRIPTION_BILLING_PERIODS, CORPORATE_PRICES } from "@/config/pricing";

interface AnalyticsData {
  totalUsers: number;
  activeSubscribers: number;
  paidSubscribers: number;       // Only with stripe_subscription_id
  manualSubscribers: number;     // Manual/complimentary (no stripe_subscription_id)
  goldSubscribers: number;
  goldPaid: number;
  platinumSubscribers: number;
  platinumPaid: number;
  freeUsers: number;
  totalRevenue: number;          // Only from PAID subscriptions
  avgWorkoutCompletionRate: number;
  avgProgramCompletionRate: number;
  totalWorkouts: number;
  totalPrograms: number;
  totalRituals: number;
  totalCheckins: number;
  totalComments: number;
  websiteVisitors: number;
  standaloneWorkoutsSold: number;
  standaloneProgramsSold: number;
  corporatePlansSold: number;
  corporatePaid: number;         // Only with stripe_subscription_id
  corporateFree: number;         // Complimentary
  bestSellingWorkout: string;
  bestSellingProgram: string;
  bestSellingCorporatePlan: string;
  workoutInteractions: number;
  programInteractions: number;
  totalRatings: number;
  avgRating: number;
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
    paidSubscribers: 0,
    manualSubscribers: 0,
    goldSubscribers: 0,
    goldPaid: 0,
    platinumSubscribers: 0,
    platinumPaid: 0,
    freeUsers: 0,
    totalRevenue: 0,
    avgWorkoutCompletionRate: 0,
    avgProgramCompletionRate: 0,
    totalWorkouts: 0,
    totalPrograms: 0,
    totalRituals: 0,
    totalCheckins: 0,
    totalComments: 0,
    websiteVisitors: 0,
    standaloneWorkoutsSold: 0,
    standaloneProgramsSold: 0,
    corporatePlansSold: 0,
    corporatePaid: 0,
    corporateFree: 0,
    bestSellingWorkout: "-",
    bestSellingProgram: "-",
    bestSellingCorporatePlan: "-",
    workoutInteractions: 0,
    programInteractions: 0,
    totalRatings: 0,
    avgRating: 0,
  });
  const [userGrowth, setUserGrowth] = useState<ChartData[]>([]);
  const [revenueData, setRevenueData] = useState<ChartData[]>([]);
  const [revenueDistribution, setRevenueDistribution] = useState<any[]>([]);
  const [revenueTrends, setRevenueTrends] = useState<any[]>([]);
  const [completionData, setCompletionData] = useState<ChartData[]>([]);
  const [popularWorkouts, setPopularWorkouts] = useState<ChartData[]>([]);
  const [subscriptionDistribution, setSubscriptionDistribution] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("revenue");
  const dashboardRef = useRef<HTMLDivElement>(null);

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

      // Fetch ALL users (no date filter for total count)
      const { data: allProfiles, count: totalUsersCount } = await supabase
        .from("profiles")
        .select("id", { count: "exact" });

      const totalUsers = totalUsersCount || 0;

      // Fetch profiles for growth chart (with date filter)
      const { data: profiles } = await supabase
        .from("profiles")
        .select("created_at")
        .gte("created_at", startDate.toISOString());

      // Group users by month for user growth chart
      const usersByMonth: { [key: string]: number } = {};
      profiles?.forEach((profile) => {
        const month = new Date(profile.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short" });
        usersByMonth[month] = (usersByMonth[month] || 0) + 1;
      });
      const userGrowthData = Object.entries(usersByMonth).map(([name, value]) => ({ name, value }));

      // Fetch subscription data - include stripe_subscription_id to identify paid vs manual
      const { data: subscriptions } = await supabase
        .from("user_subscriptions")
        .select("plan_type, status, created_at, current_period_end, stripe_subscription_id");

      const activeSubscribers = subscriptions?.filter(s => s.status === "active" && s.plan_type !== "free").length || 0;
      
      // PAID = has stripe_subscription_id (real Stripe payment)
      // MANUAL = no stripe_subscription_id (admin granted, complimentary)
      const paidSubscribers = subscriptions?.filter(s => s.status === "active" && s.plan_type !== "free" && s.stripe_subscription_id).length || 0;
      const manualSubscribers = subscriptions?.filter(s => s.status === "active" && s.plan_type !== "free" && !s.stripe_subscription_id).length || 0;
      
      const goldSubscribers = subscriptions?.filter(s => s.status === "active" && s.plan_type === "gold").length || 0;
      const goldPaid = subscriptions?.filter(s => s.status === "active" && s.plan_type === "gold" && s.stripe_subscription_id).length || 0;
      
      const platinumSubscribers = subscriptions?.filter(s => s.status === "active" && s.plan_type === "platinum").length || 0;
      const platinumPaid = subscriptions?.filter(s => s.status === "active" && s.plan_type === "platinum" && s.stripe_subscription_id).length || 0;
      
      const freeUsers = subscriptions?.filter(s => s.plan_type === "free" || s.status !== "active").length || 0;

      // Calculate ACTUAL revenue from PAID subscriptions only
      // Gold = €9.99/month, Platinum = €89.89/year
      const goldRevenue = goldPaid * SUBSCRIPTION_PRICES.gold;
      const platinumRevenue = platinumPaid * SUBSCRIPTION_PRICES.platinum;
      let totalRevenue = goldRevenue + platinumRevenue;

      // Fetch purchases for standalone sales
      const { data: purchases } = await supabase
        .from("user_purchases")
        .select("*");

      const standaloneRevenue = purchases?.reduce((sum, p) => sum + Number(p.price || 0), 0) || 0;
      const standaloneWorkoutsSold = purchases?.filter(p => p.content_type === "workout").length || 0;
      const standaloneProgramsSold = purchases?.filter(p => p.content_type === "program").length || 0;

      // Best selling workout
      const workoutSales: { [key: string]: number } = {};
      purchases?.filter(p => p.content_type === "workout").forEach(p => {
        workoutSales[p.content_name] = (workoutSales[p.content_name] || 0) + 1;
      });
      const bestSellingWorkout = Object.entries(workoutSales).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";

      // Best selling program
      const programSales: { [key: string]: number } = {};
      purchases?.filter(p => p.content_type === "program").forEach(p => {
        programSales[p.content_name] = (programSales[p.content_name] || 0) + 1;
      });
      const bestSellingProgram = Object.entries(programSales).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";

      // Revenue chart data - use CORRECT prices and PAID subscribers only
      const revenueChartData = [
        { name: `Gold Plans (€${SUBSCRIPTION_PRICES.gold}/mo)`, value: goldPaid * SUBSCRIPTION_PRICES.gold },
        { name: `Platinum Plans (€${SUBSCRIPTION_PRICES.platinum}/yr)`, value: platinumPaid * SUBSCRIPTION_PRICES.platinum },
        { name: "Standalone Purchases", value: standaloneRevenue }
      ];

      // Revenue distribution
      const totalRevenueSum = revenueChartData.reduce((sum, item) => sum + item.value, 0);
      const distributionData = revenueChartData.map(item => ({
        name: item.name,
        value: item.value,
        percentage: totalRevenueSum > 0 ? ((item.value / totalRevenueSum) * 100).toFixed(1) : 0
      }));

      // 6-month revenue trends
      const trendsData: any[] = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = monthDate.toLocaleDateString("en-US", { year: "numeric", month: "short" });
        const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
        const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

        // Only count PAID subscriptions (with stripe_subscription_id)
        const goldCount = subscriptions?.filter(s => {
          const startDate = new Date(s.created_at);
          return s.plan_type === "gold" && s.stripe_subscription_id && startDate <= monthEnd && 
                 (!s.current_period_end || new Date(s.current_period_end) >= monthStart);
        }).length || 0;

        const platinumCount = subscriptions?.filter(s => {
          const startDate = new Date(s.created_at);
          return s.plan_type === "platinum" && s.stripe_subscription_id && startDate <= monthEnd && 
                 (!s.current_period_end || new Date(s.current_period_end) >= monthStart);
        }).length || 0;

        const monthPurchases = purchases?.filter(p => {
          const purchaseDate = new Date(p.purchased_at);
          return purchaseDate >= monthStart && purchaseDate <= monthEnd;
        }) || [];
        const monthPurchaseRevenue = monthPurchases.reduce((sum, p) => sum + Number(p.price || 0), 0);

        trendsData.push({
          name: monthName,
          "Gold Plans": goldCount * SUBSCRIPTION_PRICES.gold,
          "Platinum Plans": platinumCount * SUBSCRIPTION_PRICES.platinum,
          "Standalone Purchases": monthPurchaseRevenue
        });
      }

      // Subscription distribution
      const subDistribution: { [key: string]: number } = {};
      subscriptions?.forEach((sub) => {
        if (sub.status === "active") {
          subDistribution[sub.plan_type] = (subDistribution[sub.plan_type] || 0) + 1;
        }
      });
      const subDistData = Object.entries(subDistribution).map(([name, value]) => ({ 
        name: name.charAt(0).toUpperCase() + name.slice(1), 
        value 
      }));

      // Fetch workout interactions
      const { data: workoutInteractions } = await supabase
        .from("workout_interactions")
        .select("is_completed, workout_name, rating")
        .gte("created_at", startDate.toISOString());

      const totalWorkoutInteractions = workoutInteractions?.length || 0;
      const completedWorkouts = workoutInteractions?.filter(w => w.is_completed).length || 0;
      const avgWorkoutCompletionRate = totalWorkoutInteractions > 0 ? Math.round((completedWorkouts / totalWorkoutInteractions) * 100) : 0;

      // Fetch program interactions
      const { data: programInteractions } = await supabase
        .from("program_interactions")
        .select("is_completed, program_name, rating")
        .gte("created_at", startDate.toISOString());

      const totalProgramInteractions = programInteractions?.length || 0;
      const completedPrograms = programInteractions?.filter(p => p.is_completed).length || 0;
      const avgProgramCompletionRate = totalProgramInteractions > 0 ? Math.round((completedPrograms / totalProgramInteractions) * 100) : 0;

      // Calculate average ratings
      const allRatings = [
        ...(workoutInteractions?.filter(w => w.rating !== null).map(w => w.rating) || []),
        ...(programInteractions?.filter(p => p.rating !== null).map(p => p.rating) || [])
      ];
      const totalRatings = allRatings.length;
      const avgRating = totalRatings > 0 ? Math.round((allRatings.reduce((a, b) => a + (b || 0), 0) / totalRatings) * 10) / 10 : 0;

      // Completion rate by workout (top 5)
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
      const contentCompletions: { [key: string]: number } = {};
      workoutInteractions?.filter(w => w.is_completed).forEach((interaction) => {
        contentCompletions[interaction.workout_name] = (contentCompletions[interaction.workout_name] || 0) + 1;
      });
      
      const popularWorkoutsData = Object.entries(contentCompletions)
        .map(([name, value]) => ({
          name: name.length > 20 ? name.substring(0, 20) + "..." : name,
          value,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

      // Fetch total content counts
      const { count: totalWorkoutsCount } = await supabase
        .from("admin_workouts")
        .select("id", { count: "exact" });

      const { count: totalProgramsCount } = await supabase
        .from("admin_training_programs")
        .select("id", { count: "exact" });

      const { count: totalRitualsCount } = await supabase
        .from("daily_smarty_rituals")
        .select("id", { count: "exact" });

      // Fetch check-ins count
      const { count: totalCheckinsCount } = await supabase
        .from("smarty_checkins")
        .select("id", { count: "exact" });

      // Fetch comments count
      const { count: totalCommentsCount } = await supabase
        .from("workout_comments")
        .select("id", { count: "exact" });

      // Fetch website visitors
      const { count: websiteVisitorsCount } = await supabase
        .from("social_media_analytics")
        .select("id", { count: "exact" })
        .eq("event_type", "visit")
        .gte("created_at", startDate.toISOString());

      // Fetch corporate subscriptions - include stripe fields to identify paid vs free
      const { data: corporateSubs } = await supabase
        .from("corporate_subscriptions")
        .select("plan_type, status, stripe_subscription_id, stripe_customer_id");

      const corporatePlansSold = corporateSubs?.filter(c => c.status === "active").length || 0;
      // PAID = has stripe_subscription_id AND stripe_customer_id
      const corporatePaid = corporateSubs?.filter(c => c.status === "active" && c.stripe_subscription_id && c.stripe_customer_id).length || 0;
      const corporateFree = corporateSubs?.filter(c => c.status === "active" && (!c.stripe_subscription_id || !c.stripe_customer_id)).length || 0;
      
      // Add corporate revenue only for PAID corporate plans
      const paidCorporatePlans = corporateSubs?.filter(c => c.status === "active" && c.stripe_subscription_id && c.stripe_customer_id) || [];
      const corporateRevenue = paidCorporatePlans.reduce((sum, c) => sum + (CORPORATE_PRICES[c.plan_type as keyof typeof CORPORATE_PRICES] || 0), 0);
      totalRevenue += corporateRevenue;
      
      // Best selling corporate plan (only count PAID)
      const corporatePlanCounts: { [key: string]: number } = {};
      paidCorporatePlans.forEach(c => {
        corporatePlanCounts[c.plan_type] = (corporatePlanCounts[c.plan_type] || 0) + 1;
      });
      const bestSellingCorporatePlan = Object.entries(corporatePlanCounts)
        .sort((a, b) => b[1] - a[1])[0]?.[0]?.toUpperCase() || "-";

      setAnalytics({
        totalUsers,
        activeSubscribers,
        paidSubscribers,
        manualSubscribers,
        goldSubscribers,
        goldPaid,
        platinumSubscribers,
        platinumPaid,
        freeUsers,
        totalRevenue,
        avgWorkoutCompletionRate,
        avgProgramCompletionRate,
        totalWorkouts: totalWorkoutsCount || 0,
        totalPrograms: totalProgramsCount || 0,
        totalRituals: totalRitualsCount || 0,
        totalCheckins: totalCheckinsCount || 0,
        totalComments: totalCommentsCount || 0,
        websiteVisitors: websiteVisitorsCount || 0,
        standaloneWorkoutsSold,
        standaloneProgramsSold,
        corporatePlansSold,
        corporatePaid,
        corporateFree,
        bestSellingWorkout,
        bestSellingProgram,
        bestSellingCorporatePlan,
        workoutInteractions: totalWorkoutInteractions,
        programInteractions: totalProgramInteractions,
        totalRatings,
        avgRating,
      });

      setUserGrowth(userGrowthData);
      setRevenueData(revenueChartData);
      setRevenueDistribution(distributionData);
      setRevenueTrends(trendsData);
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

  const handleExport = async () => {
    if (!dashboardRef.current) return;
    
    try {
      toast.info("Generating export...");
      const canvas = await html2canvas(dashboardRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
      });
      
      const link = document.createElement("a");
      link.download = `smartygym-analytics-${new Date().toISOString().split("T")[0]}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      
      toast.success("Analytics exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export analytics");
    }
  };

  const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "hsl(var(--muted))", "#8884d8", "#82ca9d"];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-lg">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="pt-6 space-y-6" ref={dashboardRef}>
      {/* Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-[180px]">
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
          <Button onClick={fetchAnalytics} variant="outline" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Quick Export
          </Button>
          <BusinessReportExport dashboardRef={dashboardRef} />
        </div>
      </div>

      {/* Key Metrics Cards - Row 1: Users & Subscriptions */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        <AnalyticsMetricCard 
          title="Total Users" 
          value={analytics.totalUsers.toLocaleString()} 
          subtitle="All registered accounts"
          icon={Users}
        />
        <AnalyticsMetricCard 
          title="Active Subscribers" 
          value={analytics.activeSubscribers} 
          subtitle="Paid memberships"
          icon={TrendingUp}
        />
        <AnalyticsMetricCard 
          title="Gold Members" 
          value={`${analytics.goldPaid} paid`} 
          subtitle={`€${SUBSCRIPTION_PRICES.gold}/month • ${analytics.goldSubscribers - analytics.goldPaid} free`}
          icon={Award}
        />
        <AnalyticsMetricCard 
          title="Platinum Members" 
          value={`${analytics.platinumPaid} paid`} 
          subtitle={`€${SUBSCRIPTION_PRICES.platinum}/year • ${analytics.platinumSubscribers - analytics.platinumPaid} free`}
          icon={Star}
        />
        <AnalyticsMetricCard 
          title="Free Users" 
          value={analytics.freeUsers} 
          subtitle="Non-premium"
          icon={Users}
        />
        <AnalyticsMetricCard 
          title="Paid Revenue" 
          value={`€${analytics.totalRevenue.toFixed(2)}`} 
          subtitle={`${analytics.paidSubscribers} paid subs • ${analytics.manualSubscribers} free`}
          icon={DollarSign}
        />
      </div>

      {/* Key Metrics Cards - Row 2: Content & Engagement */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        <AnalyticsMetricCard 
          title="Total Workouts" 
          value={analytics.totalWorkouts} 
          subtitle="Available workouts"
          icon={Dumbbell}
        />
        <AnalyticsMetricCard 
          title="Total Programs" 
          value={analytics.totalPrograms} 
          subtitle="Training programs"
          icon={Calendar}
        />
        <AnalyticsMetricCard 
          title="Total Rituals" 
          value={analytics.totalRituals} 
          subtitle="Daily rituals created"
          icon={Heart}
        />
        <AnalyticsMetricCard 
          title="Total Check-ins" 
          value={analytics.totalCheckins.toLocaleString()} 
          subtitle="Smarty check-ins"
          icon={CheckCircle}
        />
        <AnalyticsMetricCard 
          title="Community Comments" 
          value={analytics.totalComments} 
          subtitle="User feedback"
          icon={MessageCircle}
        />
        <AnalyticsMetricCard 
          title="Website Visitors" 
          value={analytics.websiteVisitors.toLocaleString()} 
          subtitle="Page visits"
          icon={Globe}
        />
      </div>

      {/* Key Metrics Cards - Row 3: Completion & Sales */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        <AnalyticsMetricCard 
          title="Workout Completion" 
          value={`${analytics.avgWorkoutCompletionRate}%`} 
          subtitle="Average rate"
          icon={Activity}
        />
        <AnalyticsMetricCard 
          title="Program Completion" 
          value={`${analytics.avgProgramCompletionRate}%`} 
          subtitle="Average rate"
          icon={Activity}
        />
        <AnalyticsMetricCard 
          title="Workouts Sold" 
          value={analytics.standaloneWorkoutsSold} 
          subtitle="Standalone purchases"
          icon={ShoppingCart}
        />
        <AnalyticsMetricCard 
          title="Programs Sold" 
          value={analytics.standaloneProgramsSold} 
          subtitle="Standalone purchases"
          icon={ShoppingCart}
        />
        <AnalyticsMetricCard 
          title="Corporate Plans" 
          value={analytics.corporatePlansSold} 
          subtitle="Active subscriptions"
          icon={Building2}
        />
        <AnalyticsMetricCard 
          title="Avg. Rating" 
          value={analytics.avgRating > 0 ? `${analytics.avgRating}/5` : "-"} 
          subtitle={`${analytics.totalRatings} ratings`}
          icon={Star}
        />
      </div>

      {/* Best Sellers Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Best Selling Workout</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">{analytics.bestSellingWorkout}</div>
          </CardContent>
        </Card>
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Best Selling Program</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">{analytics.bestSellingProgram}</div>
          </CardContent>
        </Card>
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Best Corporate Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{analytics.bestSellingCorporatePlan}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="w-full overflow-x-auto -mx-2 px-2">
          <TabsList className="inline-flex w-auto min-w-full h-auto p-1 bg-muted/50">
            <TabsTrigger 
              value="revenue" 
              className="flex-shrink-0 whitespace-nowrap text-xs sm:text-sm px-3 sm:px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
            >
              Revenue
            </TabsTrigger>
            <TabsTrigger 
              value="purchases" 
              className="flex-shrink-0 whitespace-nowrap text-xs sm:text-sm px-3 sm:px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
            >
              Purchases
            </TabsTrigger>
            <TabsTrigger 
              value="communications" 
              className="flex-shrink-0 whitespace-nowrap text-xs sm:text-sm px-3 sm:px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
            >
              Messages
            </TabsTrigger>
            <TabsTrigger 
              value="growth" 
              className="flex-shrink-0 whitespace-nowrap text-xs sm:text-sm px-3 sm:px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
            >
              Growth
            </TabsTrigger>
            <TabsTrigger 
              value="completion" 
              className="flex-shrink-0 whitespace-nowrap text-xs sm:text-sm px-3 sm:px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
            >
              Completion
            </TabsTrigger>
            <TabsTrigger 
              value="popular" 
              className="flex-shrink-0 whitespace-nowrap text-xs sm:text-sm px-3 sm:px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
            >
              Popular
            </TabsTrigger>
            <TabsTrigger 
              value="website" 
              className="flex-shrink-0 whitespace-nowrap text-xs sm:text-sm px-3 sm:px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
            >
              Website
            </TabsTrigger>
            <TabsTrigger 
              value="corporate" 
              className="flex-shrink-0 whitespace-nowrap text-xs sm:text-sm px-3 sm:px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
            >
              Corporate
            </TabsTrigger>
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
                    <Tooltip formatter={(value) => `€${value}`} />
                    <Legend />
                    <Bar dataKey="value" name="Revenue (€)" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
                
                {/* Detailed breakdown */}
                <div className="mt-4 space-y-2 border-t pt-4">
                  {revenueData.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">{item.name}</span>
                      <span className="font-medium">€{item.value.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center text-sm font-bold border-t pt-2">
                    <span>Total</span>
                    <span>€{revenueData.reduce((sum, item) => sum + item.value, 0).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Distribution</CardTitle>
                <CardDescription>Percentage breakdown by income stream</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={revenueDistribution}
                      cx="50%"
                      cy="45%"
                      outerRadius={100}
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
                      height={50}
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
                  <Tooltip formatter={(value) => `€${value}`} />
                  <Legend />
                  <Line type="monotone" dataKey="Gold Plans" stroke="hsl(var(--primary))" strokeWidth={2} />
                  <Line type="monotone" dataKey="Platinum Plans" stroke="hsl(var(--secondary))" strokeWidth={2} />
                  <Line type="monotone" dataKey="Standalone Purchases" stroke="hsl(var(--accent))" strokeWidth={2} />
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
          <GrowthAnalytics />
        </TabsContent>

        <TabsContent value="completion" className="space-y-4">
          <CompletionAnalytics />
        </TabsContent>

        <TabsContent value="popular" className="space-y-4">
          <PopularAnalytics />
        </TabsContent>

        <TabsContent value="website" className="space-y-4">
          <WebsiteAnalytics />
        </TabsContent>

        <TabsContent value="corporate" className="space-y-4">
          <CorporateAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}
