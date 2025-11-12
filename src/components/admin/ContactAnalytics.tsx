import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Clock, MessageSquare, CheckCircle2, TrendingUp, Users, Timer } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

interface ContactStats {
  totalMessages: number;
  respondedMessages: number;
  avgResponseTime: number; // in hours
  medianResponseTime: number;
  fastestResponse: number;
  slowestResponse: number;
  responseRate: number;
  categoryBreakdown: { category: string; count: number }[];
  statusBreakdown: { status: string; count: number }[];
  dailyVolume: { date: string; count: number }[];
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export const ContactAnalytics = () => {
  const [stats, setStats] = useState<ContactStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState(30); // days

  useEffect(() => {
    fetchStats();
  }, [dateRange]);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - dateRange);

      // Fetch all messages within date range
      const { data: messages, error } = await supabase
        .from("contact_messages")
        .select("*")
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: true });

      if (error) throw error;

      if (!messages || messages.length === 0) {
        setStats({
          totalMessages: 0,
          respondedMessages: 0,
          avgResponseTime: 0,
          medianResponseTime: 0,
          fastestResponse: 0,
          slowestResponse: 0,
          responseRate: 0,
          categoryBreakdown: [],
          statusBreakdown: [],
          dailyVolume: []
        });
        return;
      }

      // Calculate response times
      const responseTimes = messages
        .filter(m => m.responded_at && m.created_at)
        .map(m => {
          const created = new Date(m.created_at).getTime();
          const responded = new Date(m.responded_at!).getTime();
          return (responded - created) / (1000 * 60 * 60); // hours
        });

      const avgResponseTime = responseTimes.length > 0
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
        : 0;

      const sortedTimes = [...responseTimes].sort((a, b) => a - b);
      const medianResponseTime = sortedTimes.length > 0
        ? sortedTimes[Math.floor(sortedTimes.length / 2)]
        : 0;

      // Category breakdown
      const categoryMap = new Map<string, number>();
      messages.forEach(m => {
        categoryMap.set(m.category, (categoryMap.get(m.category) || 0) + 1);
      });
      const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, count]) => ({
        category: category === 'general' ? 'General' : category === 'support' ? 'Support' : 'Coach Direct',
        count
      }));

      // Status breakdown
      const statusMap = new Map<string, number>();
      messages.forEach(m => {
        statusMap.set(m.status, (statusMap.get(m.status) || 0) + 1);
      });
      const statusBreakdown = Array.from(statusMap.entries()).map(([status, count]) => ({
        status: status.charAt(0).toUpperCase() + status.slice(1),
        count
      }));

      // Daily volume (last 30 days)
      const dailyMap = new Map<string, number>();
      messages.forEach(m => {
        const date = new Date(m.created_at).toISOString().split('T')[0];
        dailyMap.set(date, (dailyMap.get(date) || 0) + 1);
      });
      const dailyVolume = Array.from(dailyMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-30);

      setStats({
        totalMessages: messages.length,
        respondedMessages: messages.filter(m => m.responded_at).length,
        avgResponseTime,
        medianResponseTime,
        fastestResponse: sortedTimes.length > 0 ? sortedTimes[0] : 0,
        slowestResponse: sortedTimes.length > 0 ? sortedTimes[sortedTimes.length - 1] : 0,
        responseRate: messages.length > 0 ? (messages.filter(m => m.responded_at).length / messages.length) * 100 : 0,
        categoryBreakdown,
        statusBreakdown,
        dailyVolume
      });
    } catch (error) {
      console.error("Error fetching contact stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatHours = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)} min`;
    if (hours < 24) return `${hours.toFixed(1)} hrs`;
    return `${(hours / 24).toFixed(1)} days`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Header with date range selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Contact Analytics</h2>
          <p className="text-sm text-muted-foreground">Response times and customer engagement metrics</p>
        </div>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(Number(e.target.value))}
          className="px-4 py-2 rounded-md border border-border bg-background"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
          <option value={365}>Last year</option>
        </select>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMessages}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.respondedMessages} responded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.responseRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.respondedMessages} of {stats.totalMessages}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatHours(stats.avgResponseTime)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Median: {formatHours(stats.medianResponseTime)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Times</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              Fastest: {formatHours(stats.fastestResponse)}
            </div>
            <div className="text-sm text-muted-foreground">
              Slowest: {formatHours(stats.slowestResponse)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Volume Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Message Volume Over Time</CardTitle>
            <CardDescription>Daily incoming messages</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.dailyVolume}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" name="Messages" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Messages by Category</CardTitle>
            <CardDescription>Distribution of message types</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percent }) => `${category}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="hsl(var(--primary))"
                  dataKey="count"
                >
                  {stats.categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Message Status Distribution</CardTitle>
            <CardDescription>Current status of all messages</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.statusBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="hsl(var(--primary))" name="Messages" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
            <CardDescription>Response time insights</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Average Response</p>
                  <p className="text-xs text-muted-foreground">Mean time to respond</p>
                </div>
              </div>
              <p className="text-xl font-bold">{formatHours(stats.avgResponseTime)}</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-accent/20 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-accent-foreground" />
                <div>
                  <p className="text-sm font-medium">Median Response</p>
                  <p className="text-xs text-muted-foreground">50th percentile</p>
                </div>
              </div>
              <p className="text-xl font-bold">{formatHours(stats.medianResponseTime)}</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-secondary-foreground" />
                <div>
                  <p className="text-sm font-medium">Response Coverage</p>
                  <p className="text-xs text-muted-foreground">Messages answered</p>
                </div>
              </div>
              <p className="text-xl font-bold">{stats.responseRate.toFixed(0)}%</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
