import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { DollarSign, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface RevenueData {
  period: string;
  revenue: number;
  plan?: string;
}

export function RevenueAnalytics() {
  const [timeFilter, setTimeFilter] = useState<string>("1month");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRevenueData();
  }, [timeFilter, planFilter, customStartDate, customEndDate]);

  const fetchRevenueData = async () => {
    setLoading(true);
    try {
      let startDate: Date;
      const endDate = new Date();

      // Calculate start date based on time filter
      if (timeFilter === "custom" && customStartDate && customEndDate) {
        startDate = customStartDate;
      } else {
        switch (timeFilter) {
          case "1month":
            startDate = new Date();
            startDate.setMonth(startDate.getMonth() - 1);
            break;
          case "3months":
            startDate = new Date();
            startDate.setMonth(startDate.getMonth() - 3);
            break;
          case "6months":
            startDate = new Date();
            startDate.setMonth(startDate.getMonth() - 6);
            break;
          case "12months":
            startDate = new Date();
            startDate.setFullYear(startDate.getFullYear() - 1);
            break;
          default:
            startDate = new Date();
            startDate.setMonth(startDate.getMonth() - 1);
        }
      }

      // Fetch subscriptions within the date range
      let query = supabase
        .from("user_subscriptions")
        .select("plan_type, status, created_at, current_period_start, current_period_end")
        .eq("status", "active")
        .gte("created_at", startDate.toISOString());

      // Apply plan filter
      if (planFilter !== "all") {
        if (planFilter === "personal_training") {
          // Personal training is tracked differently - skip for now or handle separately
          query = query.eq("plan_type", "platinum"); // Placeholder
        } else {
          query = query.eq("plan_type", planFilter as "gold" | "platinum");
        }
      }

      const { data: subscriptions, error } = await query;

      if (error) throw error;

      // Calculate revenue by month and plan
      const revenueByMonth: { [key: string]: { [plan: string]: number } } = {};
      let total = 0;

      subscriptions?.forEach((sub) => {
        const month = new Date(sub.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
        });

        if (!revenueByMonth[month]) {
          revenueByMonth[month] = {};
        }

        // Calculate revenue based on plan type
        let monthlyRevenue = 0;
        if (sub.plan_type === "gold") {
          monthlyRevenue = 15; // €15/month
        } else if (sub.plan_type === "platinum") {
          monthlyRevenue = 25; // €25/month
        }

        revenueByMonth[month][sub.plan_type] = (revenueByMonth[month][sub.plan_type] || 0) + monthlyRevenue;
        total += monthlyRevenue;
      });

      // Convert to chart data
      const chartData: RevenueData[] = Object.entries(revenueByMonth).map(([period, plans]) => ({
        period,
        revenue: Object.values(plans).reduce((sum, val) => sum + val, 0),
        ...plans,
      }));

      setRevenueData(chartData);
      setTotalRevenue(total);
    } catch (error) {
      console.error("Error fetching revenue data:", error);
      toast.error("Failed to load revenue data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Revenue Analytics
          </CardTitle>
          <CardDescription>Filter revenue by time period and plan type</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Time Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">Last Month</SelectItem>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="12months">Last 12 Months</SelectItem>
                <SelectItem value="custom">Custom Period</SelectItem>
              </SelectContent>
            </Select>

            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Plan Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="gold">Gold</SelectItem>
                <SelectItem value="platinum">Platinum</SelectItem>
                <SelectItem value="personal_training">Personal Training</SelectItem>
              </SelectContent>
            </Select>

            {timeFilter === "custom" && (
              <>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customStartDate ? format(customStartDate, "PPP") : "Start Date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={customStartDate} onSelect={setCustomStartDate} initialFocus />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customEndDate ? format(customEndDate, "PPP") : "End Date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={customEndDate} onSelect={setCustomEndDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-muted rounded-lg gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl sm:text-3xl font-bold">€{totalRevenue.toFixed(2)}</p>
            </div>
            <Button onClick={fetchRevenueData} disabled={loading} className="w-full sm:w-auto">
              {loading ? "Loading..." : "Refresh"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trends</CardTitle>
          <CardDescription>
            {timeFilter === "custom"
              ? `Custom period: ${customStartDate ? format(customStartDate, "PP") : "..."} - ${
                  customEndDate ? format(customEndDate, "PP") : "..."
                }`
              : `Revenue over the ${timeFilter === "1month" ? "last month" : timeFilter}`}
            {planFilter !== "all" && ` | Filtered by: ${planFilter}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-pulse">Loading chart...</div>
            </div>
          ) : revenueData.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              No revenue data for selected period
            </div>
           ) : (
             <div className="overflow-x-auto">
               <ResponsiveContainer width="100%" height={400} minWidth={300}>
                 <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                {planFilter === "all" ? (
                  <>
                    <Bar dataKey="gold" name="Gold" stackId="a" fill="hsl(var(--chart-1))" />
                    <Bar dataKey="platinum" name="Platinum" stackId="a" fill="hsl(var(--chart-2))" />
                    <Bar
                      dataKey="personal_training"
                      name="Personal Training"
                      stackId="a"
                      fill="hsl(var(--chart-3))"
                    />
                  </>
                ) : (
                   <Bar dataKey="revenue" name="Revenue (€)" fill="hsl(var(--primary))" />
                 )}
               </BarChart>
             </ResponsiveContainer>
             </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
