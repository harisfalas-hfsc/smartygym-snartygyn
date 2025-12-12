import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Globe, Monitor, Smartphone, Tablet, Clock, MapPin, Eye, TrendingUp, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PageViewData {
  page: string;
  views: number;
  percentage: number;
}

interface DeviceData {
  device: string;
  count: number;
  percentage: number;
}

interface TrafficSourceData {
  source: string;
  visits: number;
  signups: number;
  conversionRate: number;
}

interface DailyVisitorData {
  date: string;
  visits: number;
  uniqueSessions: number;
}

export function WebsiteAnalytics() {
  const [timeFilter, setTimeFilter] = useState("30");
  const [loading, setLoading] = useState(true);
  const [totalVisitors, setTotalVisitors] = useState(0);
  const [uniqueSessions, setUniqueSessions] = useState(0);
  const [pageViews, setPageViews] = useState<PageViewData[]>([]);
  const [deviceData, setDeviceData] = useState<DeviceData[]>([]);
  const [trafficSources, setTrafficSources] = useState<TrafficSourceData[]>([]);
  const [dailyVisitors, setDailyVisitors] = useState<DailyVisitorData[]>([]);
  const [avgPagesPerSession, setAvgPagesPerSession] = useState(0);

  useEffect(() => {
    fetchWebsiteAnalytics();
  }, [timeFilter]);

  const fetchWebsiteAnalytics = async () => {
    try {
      setLoading(true);

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(timeFilter));

      // Fetch all website analytics data
      const { data: analyticsData, error } = await supabase
        .from("social_media_analytics")
        .select("*")
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Total visitors (visits)
      const visits = analyticsData?.filter(d => d.event_type === "visit") || [];
      setTotalVisitors(visits.length);

      // Unique sessions
      const uniqueSessionIds = new Set(analyticsData?.map(d => d.session_id));
      setUniqueSessions(uniqueSessionIds.size);

      // Page views by landing page
      const pageViewCounts: { [key: string]: number } = {};
      visits.forEach(v => {
        const page = v.landing_page || "/";
        pageViewCounts[page] = (pageViewCounts[page] || 0) + 1;
      });
      
      const totalPageViews = Object.values(pageViewCounts).reduce((a, b) => a + b, 0);
      const pageViewsData = Object.entries(pageViewCounts)
        .map(([page, views]) => ({
          page: page.length > 30 ? page.substring(0, 30) + "..." : page,
          views,
          percentage: totalPageViews > 0 ? Math.round((views / totalPageViews) * 100) : 0
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);
      setPageViews(pageViewsData);

      // Device breakdown
      const deviceCounts: { [key: string]: number } = {};
      analyticsData?.forEach(d => {
        const device = d.device_type || "unknown";
        deviceCounts[device] = (deviceCounts[device] || 0) + 1;
      });
      
      const totalDevices = Object.values(deviceCounts).reduce((a, b) => a + b, 0);
      const deviceDataArray = Object.entries(deviceCounts)
        .map(([device, count]) => ({
          device: device.charAt(0).toUpperCase() + device.slice(1),
          count,
          percentage: totalDevices > 0 ? Math.round((count / totalDevices) * 100) : 0
        }))
        .sort((a, b) => b.count - a.count);
      setDeviceData(deviceDataArray);

      // Traffic sources
      const sourceCounts: { [key: string]: { visits: number; signups: number } } = {};
      analyticsData?.forEach(d => {
        const source = d.referral_source || "direct";
        if (!sourceCounts[source]) {
          sourceCounts[source] = { visits: 0, signups: 0 };
        }
        if (d.event_type === "visit") sourceCounts[source].visits++;
        if (d.event_type === "signup") sourceCounts[source].signups++;
      });
      
      const trafficSourcesData = Object.entries(sourceCounts)
        .map(([source, data]) => ({
          source: source.charAt(0).toUpperCase() + source.slice(1),
          visits: data.visits,
          signups: data.signups,
          conversionRate: data.visits > 0 ? Math.round((data.signups / data.visits) * 100) : 0
        }))
        .sort((a, b) => b.visits - a.visits);
      setTrafficSources(trafficSourcesData);

      // Daily visitors trend
      const dailyStats: { [key: string]: { visits: number; sessions: Set<string> } } = {};
      analyticsData?.forEach(d => {
        const date = new Date(d.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        if (!dailyStats[date]) {
          dailyStats[date] = { visits: 0, sessions: new Set() };
        }
        if (d.event_type === "visit") {
          dailyStats[date].visits++;
        }
        dailyStats[date].sessions.add(d.session_id);
      });
      
      const dailyData = Object.entries(dailyStats)
        .map(([date, data]) => ({
          date,
          visits: data.visits,
          uniqueSessions: data.sessions.size
        }));
      setDailyVisitors(dailyData);

      // Average pages per session
      const allEvents = analyticsData?.length || 0;
      const sessionsCount = uniqueSessionIds.size || 1;
      setAvgPagesPerSession(Math.round((allEvents / sessionsCount) * 10) / 10);

    } catch (error) {
      console.error("Error fetching website analytics:", error);
      toast.error("Failed to load website analytics");
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "hsl(var(--muted))", "#8884d8", "#82ca9d"];

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case "desktop":
        return <Monitor className="h-4 w-4" />;
      case "mobile":
        return <Smartphone className="h-4 w-4" />;
      case "tablet":
        return <Tablet className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-lg">Loading website analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
            <Button onClick={fetchWebsiteAnalytics} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Loading..." : "Refresh"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVisitors.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Page visits tracked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Sessions</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueSessions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Distinct user sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Events/Session</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgPagesPerSession}</div>
            <p className="text-xs text-muted-foreground">Engagement depth</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Traffic Sources</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trafficSources.length}</div>
            <p className="text-xs text-muted-foreground">Referral channels</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Visitors Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Visitors Trend</CardTitle>
          <CardDescription>Visits and unique sessions over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyVisitors}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="visits" name="Page Visits" stroke="hsl(var(--primary))" strokeWidth={2} />
              <Line type="monotone" dataKey="uniqueSessions" name="Unique Sessions" stroke="hsl(var(--secondary))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle>Most Visited Pages</CardTitle>
            <CardDescription>Top landing pages by visit count</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pageViews} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="page" width={120} />
                <Tooltip />
                <Bar dataKey="views" name="Views" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
            
            {/* Detailed list below chart */}
            <div className="mt-4 space-y-2 border-t pt-4">
              {pageViews.map((page, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground truncate max-w-[200px]">{page.page}</span>
                  <span className="font-medium">{page.views} ({page.percentage}%)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Device Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Device Distribution</CardTitle>
            <CardDescription>Visitors by device type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="hsl(var(--primary))"
                  dataKey="count"
                  label={({ device, percentage }) => `${device}: ${percentage}%`}
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            {/* Detailed list below chart */}
            <div className="mt-4 space-y-2 border-t pt-4">
              {deviceData.map((device, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    {getDeviceIcon(device.device)}
                    {device.device}
                  </span>
                  <span className="font-medium">{device.count} ({device.percentage}%)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Traffic Sources */}
      <Card>
        <CardHeader>
          <CardTitle>Traffic Sources Performance</CardTitle>
          <CardDescription>Visits, signups, and conversion rates by source</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 font-medium">Source</th>
                  <th className="text-right py-3 px-2 font-medium">Visits</th>
                  <th className="text-right py-3 px-2 font-medium">Signups</th>
                  <th className="text-right py-3 px-2 font-medium">Conversion Rate</th>
                </tr>
              </thead>
              <tbody>
                {trafficSources.map((source, idx) => (
                  <tr key={idx} className="border-b last:border-0">
                    <td className="py-3 px-2 font-medium">{source.source}</td>
                    <td className="text-right py-3 px-2">{source.visits.toLocaleString()}</td>
                    <td className="text-right py-3 px-2">{source.signups}</td>
                    <td className="text-right py-3 px-2">
                      <span className={source.conversionRate > 5 ? "text-green-600" : "text-muted-foreground"}>
                        {source.conversionRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
