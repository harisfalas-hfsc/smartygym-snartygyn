import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Globe, Monitor, Smartphone, Tablet, Eye, TrendingUp, TrendingDown, Download, RefreshCw, FileText, Calendar as CalendarIcon, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, subDays } from "date-fns";
import html2canvas from "html2canvas";
import { cn } from "@/lib/utils";

interface PageViewData {
  page: string;
  fullPage?: string;
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
  rawSource?: string;
  visits: number;
  signups: number;
  conversionRate: number;
}

interface DailyVisitorData {
  date: string;
  fullDate: string;
  visits: number;
  uniqueSessions: number;
}

interface PeriodSummary {
  totalVisits: number;
  uniqueSessions: number;
  avgEventsPerSession: number;
  bounceRate: number;
  prevTotalVisits: number;
  prevUniqueSessions: number;
  prevAvgEventsPerSession: number;
  prevBounceRate: number;
}

export function WebsiteAnalytics() {
  // Unified filters at top
  const [timeFilter, setTimeFilter] = useState("30");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [deviceFilter, setDeviceFilter] = useState("all");
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();
  
  const [loading, setLoading] = useState(true);
  const [periodSummary, setPeriodSummary] = useState<PeriodSummary>({
    totalVisits: 0,
    uniqueSessions: 0,
    avgEventsPerSession: 0,
    bounceRate: 0,
    prevTotalVisits: 0,
    prevUniqueSessions: 0,
    prevAvgEventsPerSession: 0,
    prevBounceRate: 0,
  });
  const [pageViews, setPageViews] = useState<PageViewData[]>([]);
  const [deviceData, setDeviceData] = useState<DeviceData[]>([]);
  const [trafficSources, setTrafficSources] = useState<TrafficSourceData[]>([]);
  const [dailyVisitors, setDailyVisitors] = useState<DailyVisitorData[]>([]);
  const [availableSources, setAvailableSources] = useState<string[]>([]);
  const [availableDevices, setAvailableDevices] = useState<string[]>([]);
  
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchWebsiteAnalytics();
  }, [timeFilter, sourceFilter, deviceFilter, customStartDate, customEndDate]);

  const getDateRange = () => {
    const endDate = new Date();
    let startDate = new Date();

    if (timeFilter === "custom" && customStartDate && customEndDate) {
      return { startDate: customStartDate, endDate: customEndDate };
    }

    const days = parseInt(timeFilter);
    startDate.setDate(startDate.getDate() - days);
    return { startDate, endDate };
  };

  const getPreviousPeriodRange = () => {
    const { startDate, endDate } = getDateRange();
    const periodLength = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const prevEndDate = new Date(startDate);
    prevEndDate.setDate(prevEndDate.getDate() - 1);
    const prevStartDate = new Date(prevEndDate);
    prevStartDate.setDate(prevStartDate.getDate() - periodLength);
    return { prevStartDate, prevEndDate };
  };

  const fetchWebsiteAnalytics = async () => {
    try {
      setLoading(true);
      const { startDate, endDate } = getDateRange();
      const { prevStartDate, prevEndDate } = getPreviousPeriodRange();

      // Build query with filters - exclude admin/preview traffic
      let query = supabase
        .from("social_media_analytics")
        .select("*")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())
        .order("created_at", { ascending: true });

      // Exclude preview/sandbox visits (Lovable preview iframe)
      query = query.not("browser_info", "ilike", "%lovable%");
      
      if (sourceFilter !== "all") {
        query = query.eq("referral_source", sourceFilter);
      }
      if (deviceFilter !== "all") {
        query = query.eq("device_type", deviceFilter);
      }

      const { data: analyticsData, error } = await query;
      if (error) throw error;

      // Fetch previous period data for comparison
      let prevQuery = supabase
        .from("social_media_analytics")
        .select("*")
        .gte("created_at", prevStartDate.toISOString())
        .lte("created_at", prevEndDate.toISOString())
        .not("browser_info", "ilike", "%lovable%");

      if (sourceFilter !== "all") {
        prevQuery = prevQuery.eq("referral_source", sourceFilter);
      }
      if (deviceFilter !== "all") {
        prevQuery = prevQuery.eq("device_type", deviceFilter);
      }

      const { data: prevData } = await prevQuery;

      // Get available filters
      const { data: allSourcesData } = await supabase
        .from("social_media_analytics")
        .select("referral_source, device_type")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());
      
      const uniqueSources = [...new Set(allSourcesData?.map(d => d.referral_source) || [])].filter(Boolean).sort();
      const uniqueDevices = [...new Set(allSourcesData?.map(d => d.device_type) || [])].filter(Boolean).sort();
      setAvailableSources(uniqueSources);
      setAvailableDevices(uniqueDevices);

      // Calculate current period metrics
      const visits = analyticsData?.filter(d => d.event_type === "visit") || [];
      const uniqueSessionIds = new Set(analyticsData?.map(d => d.session_id));
      const allEvents = analyticsData?.length || 0;
      const sessionsCount = uniqueSessionIds.size || 1;
      const singleEventSessions = analyticsData 
        ? new Set(analyticsData.filter((_, i, arr) => 
            arr.filter(a => a.session_id === analyticsData[i].session_id).length === 1
          ).map(d => d.session_id)).size
        : 0;
      const bounceRate = uniqueSessionIds.size > 0 ? Math.round((singleEventSessions / uniqueSessionIds.size) * 100) : 0;

      // Calculate previous period metrics
      const prevVisits = prevData?.filter(d => d.event_type === "visit") || [];
      const prevUniqueSessionIds = new Set(prevData?.map(d => d.session_id));
      const prevAllEvents = prevData?.length || 0;
      const prevSessionsCount = prevUniqueSessionIds.size || 1;
      const prevSingleEventSessions = prevData 
        ? new Set(prevData.filter((_, i, arr) => 
            arr.filter(a => a.session_id === prevData[i].session_id).length === 1
          ).map(d => d.session_id)).size
        : 0;
      const prevBounceRate = prevUniqueSessionIds.size > 0 ? Math.round((prevSingleEventSessions / prevUniqueSessionIds.size) * 100) : 0;

      setPeriodSummary({
        totalVisits: visits.length,
        uniqueSessions: uniqueSessionIds.size,
        avgEventsPerSession: Math.round((allEvents / sessionsCount) * 10) / 10,
        bounceRate,
        prevTotalVisits: prevVisits.length,
        prevUniqueSessions: prevUniqueSessionIds.size,
        prevAvgEventsPerSession: Math.round((prevAllEvents / prevSessionsCount) * 10) / 10,
        prevBounceRate,
      });

      // Page views
      const pageViewCounts: { [key: string]: number } = {};
      visits.forEach(v => {
        const page = v.landing_page || "/";
        pageViewCounts[page] = (pageViewCounts[page] || 0) + 1;
      });
      
      const totalPageViews = Object.values(pageViewCounts).reduce((a, b) => a + b, 0);
      const pageViewsData = Object.entries(pageViewCounts)
        .map(([page, views]) => ({
          page: page.length > 30 ? page.substring(0, 30) + "..." : page,
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

      // Traffic sources - fetch unfiltered to show all sources
      const { data: allTrafficData } = await supabase
        .from("social_media_analytics")
        .select("*")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())
        .not("browser_info", "ilike", "%lovable%");

      // All tracked social platforms - always show these
      const allTrackedSources = [
        'direct', 'google', 'facebook', 'instagram', 'tiktok', 
        'youtube', 'twitter', 'linkedin', 'bing', 'other'
      ];

      const sourceCounts: { [key: string]: { visits: number; signups: number } } = {};
      
      // Initialize all tracked sources with zero
      allTrackedSources.forEach(source => {
        sourceCounts[source] = { visits: 0, signups: 0 };
      });
      
      // Count actual data
      allTrafficData?.forEach(d => {
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
      const dailyStats: { [key: string]: { visits: number; sessions: Set<string>; fullDate: string } } = {};
      analyticsData?.forEach(d => {
        const dateObj = new Date(d.created_at);
        const dateKey = format(dateObj, "MMM d");
        const fullDate = format(dateObj, "MMMM d, yyyy");
        if (!dailyStats[dateKey]) {
          dailyStats[dateKey] = { visits: 0, sessions: new Set(), fullDate };
        }
        if (d.event_type === "visit") {
          dailyStats[dateKey].visits++;
        }
        dailyStats[dateKey].sessions.add(d.session_id);
      });
      
      const dailyData = Object.entries(dailyStats)
        .map(([date, data]) => ({
          date,
          fullDate: data.fullDate,
          visits: data.visits,
          uniqueSessions: data.sessions.size
        }));
      setDailyVisitors(dailyData);

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
      'duckduckgo': 'DuckDuckGo',
      'ecosia': 'Ecosia',
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

  const exportFullReport = async () => {
    if (!reportRef.current) return;
    try {
      toast.loading("Generating report...");
      const canvas = await html2canvas(reportRef.current, { 
        backgroundColor: "#ffffff", 
        scale: 2,
        logging: false,
        useCORS: true 
      });
      const link = document.createElement("a");
      link.download = `website-analytics-report-${format(new Date(), "yyyy-MM-dd")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.dismiss();
      toast.success("Full report exported!");
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to export report");
    }
  };

  const exportAllDataAsCSV = () => {
    // Combine all data into one comprehensive CSV
    const rows: string[] = [];
    
    // Summary section
    rows.push("=== PERIOD SUMMARY ===");
    rows.push(`Total Visits,${periodSummary.totalVisits}`);
    rows.push(`Unique Sessions,${periodSummary.uniqueSessions}`);
    rows.push(`Avg Events/Session,${periodSummary.avgEventsPerSession}`);
    rows.push(`Bounce Rate,${periodSummary.bounceRate}%`);
    rows.push("");
    
    // Daily visitors
    rows.push("=== DAILY VISITORS ===");
    rows.push("Date,Visits,Unique Sessions");
    dailyVisitors.forEach(d => rows.push(`${d.fullDate},${d.visits},${d.uniqueSessions}`));
    rows.push("");
    
    // Traffic sources
    rows.push("=== TRAFFIC SOURCES ===");
    rows.push("Source,Visits,Signups,Conversion Rate");
    trafficSources.forEach(s => rows.push(`${s.source},${s.visits},${s.signups},${s.conversionRate}%`));
    rows.push("");
    
    // Pages
    rows.push("=== TOP PAGES ===");
    rows.push("Page,Views,Percentage");
    pageViews.forEach(p => rows.push(`${p.fullPage || p.page},${p.views},${p.percentage}%`));
    rows.push("");
    
    // Devices
    rows.push("=== DEVICE DISTRIBUTION ===");
    rows.push("Device,Count,Percentage");
    deviceData.forEach(d => rows.push(`${d.device},${d.count},${d.percentage}%`));
    
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `website-analytics-full-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Full data exported as CSV!");
  };

  const exportSectionCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast.error("No data to export");
      return;
    }
    const headers = Object.keys(data[0]).filter(k => !['fullPage', 'rawSource', 'fullDate'].includes(k));
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(h => `"${row[h]}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Data exported!");
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

  const getChangeIndicator = (current: number, previous: number) => {
    const diff = current - previous;
    const percentChange = previous > 0 ? Math.round((diff / previous) * 100) : (current > 0 ? 100 : 0);
    
    if (diff > 0) {
      return (
        <span className="flex items-center text-green-600 text-xs">
          <ArrowUpRight className="h-3 w-3" />
          +{percentChange}%
        </span>
      );
    } else if (diff < 0) {
      return (
        <span className="flex items-center text-red-600 text-xs">
          <ArrowDownRight className="h-3 w-3" />
          {percentChange}%
        </span>
      );
    }
    return <span className="flex items-center text-muted-foreground text-xs"><Minus className="h-3 w-3" /> 0%</span>;
  };

  const { startDate, endDate } = getDateRange();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-lg">Loading website analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ===== UNIFIED FILTER BAR ===== */}
      <Card className="border-primary/20">
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Period:</span>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-[120px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                  <SelectItem value="90">90 Days</SelectItem>
                  <SelectItem value="180">6 Months</SelectItem>
                  <SelectItem value="365">1 Year</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {timeFilter === "custom" && (
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9">
                      <CalendarIcon className="mr-2 h-3 w-3" />
                      {customStartDate ? format(customStartDate, "MMM d") : "Start"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={customStartDate} onSelect={setCustomStartDate} initialFocus className="pointer-events-auto" />
                  </PopoverContent>
                </Popover>
                <span className="text-muted-foreground">→</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9">
                      <CalendarIcon className="mr-2 h-3 w-3" />
                      {customEndDate ? format(customEndDate, "MMM d") : "End"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={customEndDate} onSelect={setCustomEndDate} initialFocus className="pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Source:</span>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-[140px] h-9">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {availableSources.map(source => (
                    <SelectItem key={source} value={source}>{formatSourceName(source)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Device:</span>
              <Select value={deviceFilter} onValueChange={setDeviceFilter}>
                <SelectTrigger className="w-[120px] h-9">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Devices</SelectItem>
                  {availableDevices.map(device => (
                    <SelectItem key={device} value={device}>{device.charAt(0).toUpperCase() + device.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <Button variant="outline" size="sm" onClick={fetchWebsiteAnalytics} className="h-9">
                <RefreshCw className="h-3 w-3 mr-1" /> Refresh
              </Button>
              <Button variant="default" size="sm" onClick={exportFullReport} className="h-9">
                <FileText className="h-3 w-3 mr-1" /> Export Report
              </Button>
              <Button variant="outline" size="sm" onClick={exportAllDataAsCSV} className="h-9">
                <Download className="h-3 w-3 mr-1" /> CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ===== REPORT CONTENT ===== */}
      <div ref={reportRef} className="space-y-6 bg-background p-4 rounded-lg">
        {/* ===== PERIOD SUMMARY CARD ===== */}
        <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg">Period Summary</CardTitle>
                <CardDescription>
                  {format(startDate, "MMMM d, yyyy")} — {format(endDate, "MMMM d, yyyy")}
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs">
                vs. previous {timeFilter === "custom" ? "period" : `${timeFilter} days`}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-background rounded-lg border">
                <div className="text-2xl font-bold">{periodSummary.totalVisits.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Total Visits</div>
                <div className="mt-1">{getChangeIndicator(periodSummary.totalVisits, periodSummary.prevTotalVisits)}</div>
              </div>
              <div className="text-center p-3 bg-background rounded-lg border">
                <div className="text-2xl font-bold">{periodSummary.uniqueSessions.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Unique Sessions</div>
                <div className="mt-1">{getChangeIndicator(periodSummary.uniqueSessions, periodSummary.prevUniqueSessions)}</div>
              </div>
              <div className="text-center p-3 bg-background rounded-lg border">
                <div className="text-2xl font-bold">{periodSummary.avgEventsPerSession}</div>
                <div className="text-xs text-muted-foreground">Avg Events/Session</div>
                <div className="mt-1">{getChangeIndicator(periodSummary.avgEventsPerSession, periodSummary.prevAvgEventsPerSession)}</div>
              </div>
              <div className="text-center p-3 bg-background rounded-lg border">
                <div className="text-2xl font-bold">{periodSummary.bounceRate}%</div>
                <div className="text-xs text-muted-foreground">Bounce Rate</div>
                <div className="mt-1">{getChangeIndicator(-periodSummary.bounceRate, -periodSummary.prevBounceRate)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ===== SECTION 1: DAILY VISITORS TREND ===== */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Daily Visitors Trend</CardTitle>
                <CardDescription>Visits and unique sessions over time</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => exportSectionCSV(dailyVisitors, 'daily-visitors')}>
                <Download className="h-3 w-3 mr-1" /> CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={dailyVisitors}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                  labelFormatter={(label, payload) => payload?.[0]?.payload?.fullDate || label}
                />
                <Legend />
                <Line type="monotone" dataKey="visits" name="Page Visits" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="uniqueSessions" name="Unique Sessions" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>

            {/* Data Table */}
            <div className="mt-4 border-t pt-4">
              <div className="text-sm font-medium mb-2">Daily Breakdown</div>
              <div className="max-h-[200px] overflow-y-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-muted">
                    <tr>
                      <th className="text-left py-2 px-3 font-medium">Date</th>
                      <th className="text-right py-2 px-3 font-medium">Visits</th>
                      <th className="text-right py-2 px-3 font-medium">Sessions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyVisitors.map((day, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="py-2 px-3">{day.fullDate}</td>
                        <td className="text-right py-2 px-3 font-medium">{day.visits}</td>
                        <td className="text-right py-2 px-3">{day.uniqueSessions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ===== SECTION 2: TRAFFIC SOURCES ===== */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Traffic Sources Performance</CardTitle>
                <CardDescription>Visits, signups, and conversion rates by source</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => exportSectionCSV(trafficSources, 'traffic-sources')}>
                <Download className="h-3 w-3 mr-1" /> CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={trafficSources} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="source" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                <Legend />
                <Bar dataKey="visits" name="Visits" fill="hsl(var(--primary))" />
                <Bar dataKey="signups" name="Signups" fill="hsl(var(--chart-2))" />
              </BarChart>
            </ResponsiveContainer>

            {/* Data Table */}
            <div className="mt-4 border-t pt-4">
              <div className="text-sm font-medium mb-2">Source Breakdown</div>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left py-2 px-3 font-medium">Source</th>
                      <th className="text-right py-2 px-3 font-medium">Visits</th>
                      <th className="text-right py-2 px-3 font-medium">Signups</th>
                      <th className="text-right py-2 px-3 font-medium">Conversion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trafficSources.map((source, idx) => (
                      <tr key={idx} className={cn("border-t", source.visits === 0 && "text-muted-foreground bg-muted/30")}>
                        <td className="py-2 px-3 font-medium">{source.source}</td>
                        <td className="text-right py-2 px-3">
                          {source.visits === 0 ? (
                            <span className="text-xs italic">No data yet</span>
                          ) : (
                            source.visits.toLocaleString()
                          )}
                        </td>
                        <td className="text-right py-2 px-3">
                          {source.visits === 0 ? "—" : source.signups}
                        </td>
                        <td className="text-right py-2 px-3">
                          {source.visits === 0 ? (
                            <Badge variant="outline" className="text-xs text-muted-foreground">—</Badge>
                          ) : (
                            <Badge variant={source.conversionRate > 5 ? "default" : "secondary"} className="text-xs">
                              {source.conversionRate}%
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t bg-muted/50 font-medium">
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
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* ===== SECTION 3: TOP PAGES ===== */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Most Visited Pages</CardTitle>
                  <CardDescription>Top 10 landing pages</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => exportSectionCSV(pageViews, 'page-views')}>
                  <Download className="h-3 w-3 mr-1" /> CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={pageViews} layout="vertical" barSize={12}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="page" width={110} tick={{ fontSize: 9 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} 
                    formatter={(value, name, props) => [value, props.payload.fullPage]}
                  />
                  <Bar dataKey="views" name="Views" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-3 border-t pt-3 max-h-[150px] overflow-y-auto">
                {pageViews.map((page, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs py-1 border-b last:border-0">
                    <span className="text-muted-foreground truncate max-w-[200px]" title={page.fullPage}>{page.page}</span>
                    <span className="font-medium">{page.views} ({page.percentage}%)</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ===== SECTION 4: DEVICE DISTRIBUTION ===== */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Device Distribution</CardTitle>
                  <CardDescription>Visitors by device type</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => exportSectionCSV(deviceData, 'device-data')}>
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

              <div className="mt-3 border-t pt-3">
                {deviceData.map((device, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs py-1.5 border-b last:border-0">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      {getDeviceIcon(device.device)}
                      {device.device}
                    </span>
                    <span className="font-medium">{device.count.toLocaleString()} ({device.percentage}%)</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
