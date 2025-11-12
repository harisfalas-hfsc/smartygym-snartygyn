import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { 
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import { 
  UserCheck, Clock, DollarSign, TrendingUp, 
  CheckCircle2, AlertCircle, RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface PTRequest {
  id: string;
  user_name: string;
  user_email: string;
  status: string;
  created_at: string;
  completed_at: string | null;
  stripe_payment_status: string | null;
}

interface ChartData {
  name: string;
  value: number;
}

interface PTMetrics {
  totalRequests: number;
  pendingRequests: number;
  completedRequests: number;
  averageCompletionTime: number;
  conversionRate: number;
  totalRevenue: number;
}

export function PersonalTrainingAnalytics() {
  const [timeFilter, setTimeFilter] = useState<string>("30");
  const [metrics, setMetrics] = useState<PTMetrics>({
    totalRequests: 0,
    pendingRequests: 0,
    completedRequests: 0,
    averageCompletionTime: 0,
    conversionRate: 0,
    totalRevenue: 0,
  });
  const [statusDistribution, setStatusDistribution] = useState<ChartData[]>([]);
  const [requestsByMonth, setRequestsByMonth] = useState<ChartData[]>([]);
  const [completionTimes, setCompletionTimes] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(false);

  // Personal Training price (assuming €150 per program)
  const PT_PRICE = 150;

  useEffect(() => {
    fetchPTAnalytics();
  }, [timeFilter]);

  const fetchPTAnalytics = async () => {
    setLoading(true);
    try {
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(timeFilter));

      // Fetch all PT requests within date range
      const { data: requests, error } = await supabase
        .from("personal_training_requests")
        .select("*")
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: true });

      if (error) throw error;

      if (!requests || requests.length === 0) {
        // Reset all data
        setMetrics({
          totalRequests: 0,
          pendingRequests: 0,
          completedRequests: 0,
          averageCompletionTime: 0,
          conversionRate: 0,
          totalRevenue: 0,
        });
        setStatusDistribution([]);
        setRequestsByMonth([]);
        setCompletionTimes([]);
        setLoading(false);
        return;
      }

      // Calculate metrics
      const totalRequests = requests.length;
      const pendingRequests = requests.filter(r => r.status === "pending").length;
      const completedRequests = requests.filter(r => r.status === "completed").length;
      const paidRequests = requests.filter(r => r.stripe_payment_status === "paid").length;

      // Calculate average completion time (in hours)
      const completedWithDates = requests.filter(r => r.completed_at && r.created_at);
      const completionTimesArray = completedWithDates.map(r => {
        const created = new Date(r.created_at).getTime();
        const completed = new Date(r.completed_at!).getTime();
        return (completed - created) / (1000 * 60 * 60); // convert to hours
      });
      const averageCompletionTime = completionTimesArray.length > 0
        ? completionTimesArray.reduce((a, b) => a + b, 0) / completionTimesArray.length
        : 0;

      // Calculate conversion rate (paid / total)
      const conversionRate = totalRequests > 0 ? (paidRequests / totalRequests) * 100 : 0;

      // Calculate total revenue
      const totalRevenue = paidRequests * PT_PRICE;

      setMetrics({
        totalRequests,
        pendingRequests,
        completedRequests,
        averageCompletionTime,
        conversionRate,
        totalRevenue,
      });

      // Status distribution
      const statusMap = new Map<string, number>();
      requests.forEach(r => {
        const status = r.status.charAt(0).toUpperCase() + r.status.slice(1);
        statusMap.set(status, (statusMap.get(status) || 0) + 1);
      });
      const statusData: ChartData[] = Array.from(statusMap.entries()).map(([name, value]) => ({
        name,
        value,
      }));
      setStatusDistribution(statusData);

      // Requests by month
      const monthMap = new Map<string, number>();
      requests.forEach(r => {
        const month = new Date(r.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        monthMap.set(month, (monthMap.get(month) || 0) + 1);
      });
      const monthData: ChartData[] = Array.from(monthMap.entries()).map(([name, value]) => ({
        name,
        value,
      }));
      setRequestsByMonth(monthData);

      // Completion time distribution (grouped by ranges)
      const timeRanges = {
        "< 24h": 0,
        "1-3 days": 0,
        "4-7 days": 0,
        "1-2 weeks": 0,
        "> 2 weeks": 0,
      };

      completionTimesArray.forEach(hours => {
        if (hours < 24) timeRanges["< 24h"]++;
        else if (hours < 72) timeRanges["1-3 days"]++;
        else if (hours < 168) timeRanges["4-7 days"]++;
        else if (hours < 336) timeRanges["1-2 weeks"]++;
        else timeRanges["> 2 weeks"]++;
      });

      const timeData: ChartData[] = Object.entries(timeRanges).map(([name, value]) => ({
        name,
        value,
      }));
      setCompletionTimes(timeData);

    } catch (error) {
      console.error("Error fetching PT analytics:", error);
      toast.error("Failed to load personal training analytics");
    } finally {
      setLoading(false);
    }
  };

  const COLORS = [
    "hsl(var(--chart-1))", 
    "hsl(var(--chart-2))", 
    "hsl(var(--chart-3))", 
    "hsl(var(--chart-4))"
  ];

  const formatCompletionTime = (hours: number) => {
    if (hours < 24) return `${Math.round(hours)}h`;
    const days = hours / 24;
    if (days < 7) return `${days.toFixed(1)}d`;
    return `${(days / 7).toFixed(1)}w`;
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Personal Training Analytics
          </CardTitle>
          <CardDescription>Track personal training requests, completions, and revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Time Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 Days</SelectItem>
                <SelectItem value="30">Last 30 Days</SelectItem>
                <SelectItem value="90">Last 90 Days</SelectItem>
                <SelectItem value="180">Last 6 Months</SelectItem>
                <SelectItem value="365">Last Year</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={fetchPTAnalytics} disabled={loading} className="w-full sm:w-auto">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Loading..." : "Refresh"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalRequests}</div>
            <p className="text-xs text-muted-foreground">Personal training inquiries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{metrics.pendingRequests}</div>
            <p className="text-xs text-muted-foreground">Awaiting completion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.completedRequests}</div>
            <p className="text-xs text-muted-foreground">Programs delivered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Completion Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCompletionTime(metrics.averageCompletionTime)}</div>
            <p className="text-xs text-muted-foreground">From request to delivery</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Requests to payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{metrics.totalRevenue}</div>
            <p className="text-xs text-muted-foreground">From PT programs</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Request Status Distribution</CardTitle>
            <CardDescription>Current status of all requests</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-80">
                <div className="animate-pulse">Loading chart...</div>
              </div>
            ) : statusDistribution.length === 0 ? (
              <div className="flex items-center justify-center h-80 text-muted-foreground">
                No requests in selected period
              </div>
            ) : (
              <div className="overflow-x-auto flex justify-center">
                <ResponsiveContainer width="100%" height={300} minWidth={250}>
                  <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="hsl(var(--primary))"
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Completion Time Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Completion Time Distribution</CardTitle>
            <CardDescription>Time taken to complete requests</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-80">
                <div className="animate-pulse">Loading chart...</div>
              </div>
            ) : completionTimes.length === 0 || completionTimes.every(d => d.value === 0) ? (
              <div className="flex items-center justify-center h-80 text-muted-foreground">
                No completed requests yet
              </div>
            ) : (
              <div className="overflow-x-auto">
                <ResponsiveContainer width="100%" height={300} minWidth={300}>
                  <BarChart data={completionTimes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Requests" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Requests Over Time */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Requests Over Time</CardTitle>
            <CardDescription>Personal training requests trend</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-80">
                <div className="animate-pulse">Loading chart...</div>
              </div>
            ) : requestsByMonth.length === 0 ? (
              <div className="flex items-center justify-center h-80 text-muted-foreground">
                No requests in selected period
              </div>
            ) : (
              <div className="overflow-x-auto">
                <ResponsiveContainer width="100%" height={300} minWidth={300}>
                  <LineChart data={requestsByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    name="Requests" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
