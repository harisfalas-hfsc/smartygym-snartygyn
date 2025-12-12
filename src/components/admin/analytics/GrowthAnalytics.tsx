import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Download } from "lucide-react";
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
  percentage: number;
}

export function GrowthAnalytics() {
  const [timeFilter, setTimeFilter] = useState("180");
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();
  const [loading, setLoading] = useState(true);
  const [growthData, setGrowthData] = useState<GrowthData[]>([]);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [newUsersInPeriod, setNewUsersInPeriod] = useState(0);
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
      const { count } = await supabase
        .from("profiles")
        .select("created_at", { count: "exact" })
        .lte("created_at", endDate.toISOString());

      setTotalUsers(count || 0);

      // Fetch users in date range
      const { data: profiles } = await supabase
        .from("profiles")
        .select("created_at")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())
        .order("created_at", { ascending: true });

      setNewUsersInPeriod(profiles?.length || 0);

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

      const totalSubs = Object.values(subCounts).reduce((a, b) => a + b, 0);
      const subData = Object.entries(subCounts).map(([name, value]) => ({ 
        name, 
        value,
        percentage: totalSubs > 0 ? Math.round((value / totalSubs) * 100) : 0
      }));
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

  const exportGrowthCSV = () => {
    if (growthData.length === 0) {
      toast.error("No data to export");
      return;
    }
    const headers = ["Period", "New Users", "Cumulative Total"];
    const csvContent = [
      headers.join(','),
      ...growthData.map(row => [row.period, row.newUsers, row.cumulativeUsers].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `user-growth-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Data exported as CSV!");
  };

  const exportSubscriptionCSV = () => {
    if (subscriptionData.length === 0) {
      toast.error("No data to export");
      return;
    }
    const headers = ["Plan Type", "Active Subscribers", "Percentage"];
    const csvContent = [
      headers.join(','),
      ...subscriptionData.map(row => [row.name, row.value, `${row.percentage}%`].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `subscription-distribution-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Data exported as CSV!");
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
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All registered accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">New Users (Period)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{newUsersInPeriod.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">In selected time range</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Growth Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {totalUsers > 0 ? Math.round((newUsersInPeriod / totalUsers) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Of total user base</p>
          </CardContent>
        </Card>
      </div>

      {/* User Growth Trend */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>User Growth Over Time</CardTitle>
              <CardDescription>New registrations and cumulative users</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={exportGrowthCSV}>
              <Download className="h-3 w-3 mr-1" /> Export CSV
            </Button>
          </div>
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

              {/* Detailed Data Table */}
              <div className="mt-4 border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Monthly Breakdown</span>
                </div>
                <div className="max-h-[200px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-background">
                      <tr className="border-b bg-muted/50">
                        <th className="text-left py-2 px-2 font-medium">Period</th>
                        <th className="text-right py-2 px-2 font-medium">New Users</th>
                        <th className="text-right py-2 px-2 font-medium">Cumulative Total</th>
                        <th className="text-right py-2 px-2 font-medium">Growth %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {growthData.map((item, idx) => (
                        <tr key={idx} className="border-b last:border-0 hover:bg-muted/30">
                          <td className="py-1.5 px-2 font-medium">{item.period}</td>
                          <td className="text-right py-1.5 px-2 text-primary font-medium">+{item.newUsers}</td>
                          <td className="text-right py-1.5 px-2">{item.cumulativeUsers.toLocaleString()}</td>
                          <td className="text-right py-1.5 px-2">
                            {idx > 0 && growthData[idx - 1].cumulativeUsers > 0
                              ? `+${Math.round((item.newUsers / growthData[idx - 1].cumulativeUsers) * 100)}%`
                              : "-"}
                          </td>
                        </tr>
                      ))}
                      {/* Totals Row */}
                      <tr className="bg-muted/50 font-medium">
                        <td className="py-2 px-2">Total New</td>
                        <td className="text-right py-2 px-2 text-primary">+{growthData.reduce((sum, d) => sum + d.newUsers, 0)}</td>
                        <td className="text-right py-2 px-2">{totalUsers.toLocaleString()}</td>
                        <td className="text-right py-2 px-2">-</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Subscription Distribution */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Subscription Distribution</CardTitle>
              <CardDescription>Active subscriptions by plan type</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={exportSubscriptionCSV}>
              <Download className="h-3 w-3 mr-1" /> Export CSV
            </Button>
          </div>
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

            {/* Subscription Table */}
            <div className="flex flex-col justify-center">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-2 px-2 font-medium">Plan</th>
                    <th className="text-right py-2 px-2 font-medium">Subscribers</th>
                    <th className="text-right py-2 px-2 font-medium">%</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptionData.map((item, idx) => (
                    <tr key={idx} className="border-b last:border-0">
                      <td className="py-2 px-2">
                        <span className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                          {item.name}
                        </span>
                      </td>
                      <td className="text-right py-2 px-2 font-medium">{item.value}</td>
                      <td className="text-right py-2 px-2">{item.percentage}%</td>
                    </tr>
                  ))}
                  <tr className="bg-muted/50 font-medium">
                    <td className="py-2 px-2">Total Active</td>
                    <td className="text-right py-2 px-2">{subscriptionData.reduce((sum, d) => sum + d.value, 0)}</td>
                    <td className="text-right py-2 px-2">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
