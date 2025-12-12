import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { ChartFilterBar } from "./ChartFilterBar";
import html2canvas from "html2canvas";

interface GrowthData {
  period: string;
  newUsers: number;
  cumulativeUsers: number;
}

interface SubscriptionData {
  name: string;
  value: number;
}

export function GrowthAnalytics() {
  const [timeFilter, setTimeFilter] = useState("180");
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();
  const [loading, setLoading] = useState(true);
  const [growthData, setGrowthData] = useState<GrowthData[]>([]);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const chartRef = useRef<HTMLDivElement>(null);

  const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];

  useEffect(() => {
    fetchGrowthData();
  }, [timeFilter, customStartDate, customEndDate]);

  const getDateRange = () => {
    const endDate = new Date();
    let startDate = new Date();

    if (timeFilter === "custom" && customStartDate && customEndDate) {
      return { startDate: customStartDate, endDate: customEndDate };
    }

    startDate.setDate(startDate.getDate() - parseInt(timeFilter));
    return { startDate, endDate };
  };

  const fetchGrowthData = async () => {
    try {
      setLoading(true);
      const { startDate, endDate } = getDateRange();

      // Fetch all users for cumulative calculation
      const { data: allProfiles, count } = await supabase
        .from("profiles")
        .select("created_at", { count: "exact" })
        .lte("created_at", endDate.toISOString())
        .order("created_at", { ascending: true });

      setTotalUsers(count || 0);

      // Fetch users in date range
      const { data: profiles } = await supabase
        .from("profiles")
        .select("created_at")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())
        .order("created_at", { ascending: true });

      // Group by month
      const monthlyStats: { [key: string]: number } = {};
      profiles?.forEach(p => {
        const month = new Date(p.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short" });
        monthlyStats[month] = (monthlyStats[month] || 0) + 1;
      });

      // Calculate cumulative - need to know users before start date
      const { count: usersBeforeStart } = await supabase
        .from("profiles")
        .select("id", { count: "exact" })
        .lt("created_at", startDate.toISOString());

      let cumulative = usersBeforeStart || 0;

      const sortedMonths = Object.keys(monthlyStats).sort((a, b) => 
        new Date(a).getTime() - new Date(b).getTime()
      );

      const chartData: GrowthData[] = sortedMonths.map(period => {
        const newUsers = monthlyStats[period];
        cumulative += newUsers;
        return {
          period,
          newUsers,
          cumulativeUsers: cumulative,
        };
      });

      setGrowthData(chartData);

      // Fetch subscription distribution
      const { data: subscriptions } = await supabase
        .from("user_subscriptions")
        .select("plan_type, status");

      const subCounts: { [key: string]: number } = {};
      subscriptions?.forEach(s => {
        if (s.status === "active") {
          const plan = s.plan_type.charAt(0).toUpperCase() + s.plan_type.slice(1);
          subCounts[plan] = (subCounts[plan] || 0) + 1;
        }
      });

      const subData = Object.entries(subCounts).map(([name, value]) => ({ name, value }));
      setSubscriptionData(subData);

    } catch (error) {
      console.error("Error fetching growth data:", error);
      toast.error("Failed to load growth data");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!chartRef.current) return;
    try {
      const canvas = await html2canvas(chartRef.current, { backgroundColor: "#ffffff", scale: 2 });
      const link = document.createElement("a");
      link.download = `growth-analytics-${new Date().toISOString().split("T")[0]}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Chart exported!");
    } catch (error) {
      toast.error("Failed to export chart");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-lg">Loading growth analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6" ref={chartRef}>
      {/* User Growth Trend */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>User Growth Over Time</CardTitle>
          <CardDescription>New registrations and cumulative users</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartFilterBar
            timeFilter={timeFilter}
            onTimeFilterChange={setTimeFilter}
            customStartDate={customStartDate}
            onStartDateChange={setCustomStartDate}
            customEndDate={customEndDate}
            onEndDateChange={setCustomEndDate}
            onExport={handleExport}
          />

          {growthData.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              No growth data for selected period
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="newUsers" 
                    name="New Users" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2} 
                    dot={{ r: 4 }} 
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="cumulativeUsers" 
                    name="Total Users" 
                    stroke="hsl(var(--chart-2))" 
                    strokeWidth={2} 
                    strokeDasharray="5 5"
                    dot={{ r: 3 }} 
                  />
                </LineChart>
              </ResponsiveContainer>

              {/* Detailed breakdown */}
              <div className="mt-4 space-y-2 border-t pt-4 max-h-[150px] overflow-y-auto">
                {growthData.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">{item.period}</span>
                    <div className="flex items-center gap-4">
                      <span>+{item.newUsers} new</span>
                      <span className="font-medium">{item.cumulativeUsers} total</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Subscription Distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Subscription Distribution</CardTitle>
          <CardDescription>Active subscriptions by plan type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={subscriptionData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="hsl(var(--primary))"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ strokeWidth: 1 }}
                >
                  {subscriptionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
              </PieChart>
            </ResponsiveContainer>

            <div className="flex flex-col justify-center space-y-2">
              {subscriptionData.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    {item.name}
                  </span>
                  <span className="font-medium">{item.value} subscribers</span>
                </div>
              ))}
              <div className="flex justify-between items-center text-sm font-bold border-t pt-2">
                <span>Total Users</span>
                <span>{totalUsers}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
