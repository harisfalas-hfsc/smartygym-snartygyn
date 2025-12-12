import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Globe, Monitor, Smartphone, Tablet, Eye, TrendingUp, Download } from "lucide-react";
import { toast } from "sonner";
import { ChartFilterBar } from "./ChartFilterBar";
import html2canvas from "html2canvas";

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
  const [sourceFilter, setSourceFilter] = useState("all");
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();
  const [loading, setLoading] = useState(true);
  const [totalVisitors, setTotalVisitors] = useState(0);
  const [uniqueSessions, setUniqueSessions] = useState(0);
  const [pageViews, setPageViews] = useState<PageViewData[]>([]);
  const [deviceData, setDeviceData] = useState<DeviceData[]>([]);
  const [trafficSources, setTrafficSources] = useState<TrafficSourceData[]>([]);
  const [dailyVisitors, setDailyVisitors] = useState<DailyVisitorData[]>([]);
  const [avgPagesPerSession, setAvgPagesPerSession] = useState(0);
  const [availableSources, setAvailableSources] = useState<string[]>([]);
  const chartRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchWebsiteAnalytics();
  }, [timeFilter, sourceFilter, customStartDate, customEndDate]);

  const getDateRange = () => {
    const endDate = new Date();
    let startDate = new Date();

    if (timeFilter === "custom" && customStartDate && customEndDate) {
      return { startDate: customStartDate, endDate: customEndDate };
    }

    startDate.setDate(startDate.getDate() - parseInt(timeFilter));
    return { startDate, endDate };
  };

  const fetchWebsiteAnalytics = async () => {
    try {
      setLoading(true);
      const { startDate, endDate } = getDateRange();

      // Fetch all website analytics data
      let query = supabase
        .from("social_media_analytics")
        .select("*")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())
        .order("created_at", { ascending: true });

      if (sourceFilter !== "all") {
        query = query.eq("referral_source", sourceFilter);
      }

      const { data: analyticsData, error } = await query;

      if (error) throw error;

      // Get all unique sources for the filter dropdown
      const { data: allSourcesData } = await supabase
        .from("social_media_analytics")
        .select("referral_source")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());
      
      const uniqueSources = [...new Set(allSourcesData?.map(d => d.referral_source) || [])].sort();
      setAvailableSources(uniqueSources);

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
          page: page.length > 25 ? page.substring(0, 25) + "..." : page,
          fullPage: page,
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

      // Traffic sources (use all data, not filtered by source for this view)
      const { data: allData } = await supabase
        .from("social_media_analytics")
        .select("*")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());

      const sourceCounts: { [key: string]: { visits: number; signups: number } } = {};
      allData?.forEach(d => {
        const source = d.referral_source || "direct";
        if (!sourceCounts[source]) {
          sourceCounts[source] = { visits: 0, signups: 0 };
        }
        if (d.event_type === "visit") sourceCounts[source].visits++;
        if (d.event_type === "signup") sourceCounts[source].signups++;
      });
      
      const trafficSourcesData = Object.entries(sourceCounts)
        .map(([source, data]) => ({
          source: formatSourceName(source),
          rawSource: source,
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

  const formatSourceName = (source: string): string => {
    const sourceMap: { [key: string]: string } = {
      'direct': 'Direct Traffic',
      'google': 'Google (Organic)',
      'bing': 'Bing (Organic)',
      'yahoo': 'Yahoo (Organic)',
      'duckduckgo': 'DuckDuckGo (Organic)',
      'ecosia': 'Ecosia (Organic)',
      'facebook': 'Facebook',
      'instagram': 'Instagram',
      'twitter': 'Twitter/X',
      'linkedin': 'LinkedIn',
      'youtube': 'YouTube',
      'tiktok': 'TikTok',
      'other': 'Other Referrals'
    };
    return sourceMap[source.toLowerCase()] || source.charAt(0).toUpperCase() + source.slice(1);
  };

  const handleExport = async () => {
    if (!chartRef.current) return;
    try {
      const canvas = await html2canvas(chartRef.current, { backgroundColor: "#ffffff", scale: 2 });
      const link = document.createElement("a");
      link.download = `website-analytics-${new Date().toISOString().split("T")[0]}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Chart exported!");
    } catch (error) {
      toast.error("Failed to export chart");
    }
  };

  const exportTableAsCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast.error("No data to export");
      return;
    }
    const headers = Object.keys(data[0]).filter(k => k !== 'fullPage' && k !== 'rawSource');
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(h => `"${row[h]}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Data exported as CSV!");
  };

  const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case "desktop": return <Monitor className="h-4 w-4" />;
      case "mobile": return <Smartphone className="h-4 w-4" />;
      case "tablet": return <Tablet className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
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
    <div className="space-y-6" ref={chartRef}>
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
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
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

      {/* Daily Visitors Chart with Filter */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap justify-between items-start gap-2">
            <div>
              <CardTitle>Daily Visitors Trend</CardTitle>
              <CardDescription>Visits and unique sessions over time</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All Sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {availableSources.map(source => (
                    <SelectItem key={source} value={source}>
                      {formatSourceName(source)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={dailyVisitors}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
              <Legend />
              <Line type="monotone" dataKey="visits" name="Page Visits" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="uniqueSessions" name="Unique Sessions" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>

          {/* Detailed Data Table */}
          <div className="mt-4 border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Daily Breakdown</span>
              <Button variant="outline" size="sm" onClick={() => exportTableAsCSV(dailyVisitors, 'daily-visitors')}>
                <Download className="h-3 w-3 mr-1" /> Export CSV
              </Button>
            </div>
            <div className="max-h-[200px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-background">
                  <tr className="border-b">
                    <th className="text-left py-2 px-2 font-medium">Date</th>
                    <th className="text-right py-2 px-2 font-medium">Visits</th>
                    <th className="text-right py-2 px-2 font-medium">Sessions</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyVisitors.map((day, idx) => (
                    <tr key={idx} className="border-b last:border-0">
                      <td className="py-1.5 px-2">{day.date}</td>
                      <td className="text-right py-1.5 px-2">{day.visits}</td>
                      <td className="text-right py-1.5 px-2">{day.uniqueSessions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Pages */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Most Visited Pages</CardTitle>
                <CardDescription>Top landing pages by visit count</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => exportTableAsCSV(pageViews, 'page-views')}>
                <Download className="h-3 w-3 mr-1" /> CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={pageViews} layout="vertical" barSize={10}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="page" width={100} tick={{ fontSize: 9 }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                <Bar dataKey="views" name="Views" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
            
            <div className="mt-3 space-y-1 border-t pt-3 max-h-[120px] overflow-y-auto">
              {pageViews.map((page, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground truncate max-w-[180px]">{page.page}</span>
                  <span className="font-medium">{page.views} ({page.percentage}%)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Device Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Device Distribution</CardTitle>
                <CardDescription>Visitors by device type</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => exportTableAsCSV(deviceData, 'device-data')}>
                <Download className="h-3 w-3 mr-1" /> CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  fill="hsl(var(--primary))"
                  dataKey="count"
                  label={({ device, percentage }) => `${device}: ${percentage}%`}
                  labelLine={{ strokeWidth: 1 }}
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
              </PieChart>
            </ResponsiveContainer>

            <div className="mt-3 space-y-1 border-t pt-3">
              {deviceData.map((device, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
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

      {/* Traffic Sources with Full Details */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Traffic Sources Performance</CardTitle>
              <CardDescription>Visits, signups, and conversion rates by source (including organic search)</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => exportTableAsCSV(trafficSources, 'traffic-sources')}>
              <Download className="h-3 w-3 mr-1" /> Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={trafficSources} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="source" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
              <Legend />
              <Bar dataKey="visits" name="Visits" fill="hsl(var(--primary))" />
              <Bar dataKey="signups" name="Signups" fill="hsl(var(--chart-2))" />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-4 border-t pt-4 overflow-x-auto" ref={tableRef}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-2 px-3 font-medium">Source</th>
                  <th className="text-right py-2 px-3 font-medium">Visits</th>
                  <th className="text-right py-2 px-3 font-medium">Signups</th>
                  <th className="text-right py-2 px-3 font-medium">Conversion Rate</th>
                </tr>
              </thead>
              <tbody>
                {trafficSources.map((source, idx) => (
                  <tr key={idx} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="py-2 px-3 font-medium">{source.source}</td>
                    <td className="text-right py-2 px-3">{source.visits.toLocaleString()}</td>
                    <td className="text-right py-2 px-3">{source.signups}</td>
                    <td className="text-right py-2 px-3">
                      <span className={source.conversionRate > 5 ? "text-green-600 font-medium" : source.conversionRate > 0 ? "text-primary font-medium" : "text-muted-foreground"}>
                        {source.conversionRate}%
                      </span>
                    </td>
                  </tr>
                ))}
                {/* Totals Row */}
                <tr className="bg-muted/50 font-medium">
                  <td className="py-2 px-3">Total</td>
                  <td className="text-right py-2 px-3">{trafficSources.reduce((sum, s) => sum + s.visits, 0).toLocaleString()}</td>
                  <td className="text-right py-2 px-3">{trafficSources.reduce((sum, s) => sum + s.signups, 0)}</td>
                  <td className="text-right py-2 px-3">
                    {trafficSources.reduce((sum, s) => sum + s.visits, 0) > 0 
                      ? Math.round((trafficSources.reduce((sum, s) => sum + s.signups, 0) / trafficSources.reduce((sum, s) => sum + s.visits, 0)) * 100)
                      : 0}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
