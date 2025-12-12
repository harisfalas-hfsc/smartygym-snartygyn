import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { DollarSign } from "lucide-react";
import { toast } from "sonner";
import { ChartFilterBar } from "./analytics/ChartFilterBar";
import html2canvas from "html2canvas";

interface RevenueData {
  period: string;
  gold: number;
  platinum: number;
  standalone: number;
  personal_training: number;
  total: number;
}

export function RevenueAnalytics() {
  const [timeFilter, setTimeFilter] = useState<string>("90");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchRevenueData();
  }, [timeFilter, planFilter, customStartDate, customEndDate]);

  const getDateRange = () => {
    const endDate = new Date();
    let startDate = new Date();

    if (timeFilter === "custom" && customStartDate && customEndDate) {
      return { startDate: customStartDate, endDate: customEndDate };
    }

    startDate.setDate(startDate.getDate() - parseInt(timeFilter));
    return { startDate, endDate };
  };

  const fetchRevenueData = async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange();
      const revenueByMonth: { [key: string]: { gold: number; platinum: number; standalone: number; personal_training: number } } = {};
      let total = 0;

      // Fetch subscriptions
      if (planFilter === "all" || planFilter === "gold" || planFilter === "platinum") {
        let subQuery = supabase
          .from("user_subscriptions")
          .select("plan_type, created_at")
          .eq("status", "active")
          .gte("created_at", startDate.toISOString())
          .lte("created_at", endDate.toISOString());

        if (planFilter === "gold" || planFilter === "platinum") {
          subQuery = subQuery.eq("plan_type", planFilter);
        }

        const { data: subscriptions } = await subQuery;

        subscriptions?.forEach((sub) => {
          const month = new Date(sub.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
          });

          if (!revenueByMonth[month]) {
            revenueByMonth[month] = { gold: 0, platinum: 0, standalone: 0, personal_training: 0 };
          }

          const monthlyRevenue = sub.plan_type === "gold" ? 15 : sub.plan_type === "platinum" ? 25 : 0;
          revenueByMonth[month][sub.plan_type as "gold" | "platinum"] += monthlyRevenue;
          total += monthlyRevenue;
        });
      }

      // Fetch standalone purchases
      if (planFilter === "all" || planFilter === "standalone_purchases") {
        const { data: purchases } = await supabase
          .from("user_purchases")
          .select("price, purchased_at, content_type")
          .gte("purchased_at", startDate.toISOString())
          .lte("purchased_at", endDate.toISOString())
          .neq("content_type", "personal_training");

        purchases?.forEach((purchase) => {
          const month = new Date(purchase.purchased_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
          });

          if (!revenueByMonth[month]) {
            revenueByMonth[month] = { gold: 0, platinum: 0, standalone: 0, personal_training: 0 };
          }

          const revenue = parseFloat(purchase.price?.toString() || "0");
          revenueByMonth[month].standalone += revenue;
          total += revenue;
        });
      }

      // Fetch personal training purchases
      if (planFilter === "all" || planFilter === "personal_training") {
        const { data: ptPurchases } = await supabase
          .from("user_purchases")
          .select("price, purchased_at")
          .eq("content_type", "personal_training")
          .gte("purchased_at", startDate.toISOString())
          .lte("purchased_at", endDate.toISOString());

        ptPurchases?.forEach((purchase) => {
          const month = new Date(purchase.purchased_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
          });

          if (!revenueByMonth[month]) {
            revenueByMonth[month] = { gold: 0, platinum: 0, standalone: 0, personal_training: 0 };
          }

          const revenue = parseFloat(purchase.price?.toString() || "0");
          revenueByMonth[month].personal_training += revenue;
          total += revenue;
        });
      }

      // Convert to chart data - sorted by date
      const sortedMonths = Object.keys(revenueByMonth).sort((a, b) => 
        new Date(a).getTime() - new Date(b).getTime()
      );

      const chartData: RevenueData[] = sortedMonths.map(period => {
        const plans = revenueByMonth[period];
        return {
          period,
          gold: plans.gold,
          platinum: plans.platinum,
          standalone: plans.standalone,
          personal_training: plans.personal_training,
          total: plans.gold + plans.platinum + plans.standalone + plans.personal_training,
        };
      });

      setRevenueData(chartData);
      setTotalRevenue(total);
    } catch (error) {
      console.error("Error fetching revenue data:", error);
      toast.error("Failed to load revenue data");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!chartRef.current) return;
    try {
      const canvas = await html2canvas(chartRef.current, { backgroundColor: "#ffffff", scale: 2 });
      const link = document.createElement("a");
      link.download = `revenue-analytics-${new Date().toISOString().split("T")[0]}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Chart exported!");
    } catch (error) {
      toast.error("Failed to export chart");
    }
  };

  // Calculate totals for breakdown
  const totals = revenueData.reduce((acc, item) => ({
    gold: acc.gold + item.gold,
    platinum: acc.platinum + item.platinum,
    standalone: acc.standalone + item.standalone,
    personal_training: acc.personal_training + item.personal_training,
  }), { gold: 0, platinum: 0, standalone: 0, personal_training: 0 });

  return (
    <div className="space-y-6" ref={chartRef}>
      {/* Revenue Summary Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Revenue Analytics
          </CardTitle>
          <CardDescription>Revenue trends by income stream</CardDescription>
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
            additionalFilters={
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger className="w-[150px] h-9 text-sm">
                  <SelectValue placeholder="Plan Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="gold">Gold Plans</SelectItem>
                  <SelectItem value="platinum">Platinum Plans</SelectItem>
                  <SelectItem value="standalone_purchases">Standalone</SelectItem>
                  <SelectItem value="personal_training">Personal Training</SelectItem>
                </SelectContent>
              </Select>
            }
          />

          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-3xl font-bold">€{totalRevenue.toFixed(2)}</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-pulse">Loading chart...</div>
            </div>
          ) : revenueData.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              No revenue data for selected period
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `€${v}`} />
                  <Tooltip 
                    formatter={(value) => `€${value}`}
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                  />
                  <Legend />
                  {(planFilter === "all" || planFilter === "gold") && (
                    <Line type="monotone" dataKey="gold" name="Gold Plans" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                  )}
                  {(planFilter === "all" || planFilter === "platinum") && (
                    <Line type="monotone" dataKey="platinum" name="Platinum Plans" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 3 }} />
                  )}
                  {(planFilter === "all" || planFilter === "standalone_purchases") && (
                    <Line type="monotone" dataKey="standalone" name="Standalone" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={{ r: 3 }} />
                  )}
                  {(planFilter === "all" || planFilter === "personal_training") && (
                    <Line type="monotone" dataKey="personal_training" name="Personal Training" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={{ r: 3 }} />
                  )}
                </LineChart>
              </ResponsiveContainer>

              {/* Detailed breakdown */}
              <div className="mt-4 space-y-2 border-t pt-4">
                {(planFilter === "all" || planFilter === "gold") && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(var(--primary))" }} />
                      Gold Plans
                    </span>
                    <span className="font-medium">€{totals.gold.toFixed(2)}</span>
                  </div>
                )}
                {(planFilter === "all" || planFilter === "platinum") && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(var(--chart-2))" }} />
                      Platinum Plans
                    </span>
                    <span className="font-medium">€{totals.platinum.toFixed(2)}</span>
                  </div>
                )}
                {(planFilter === "all" || planFilter === "standalone_purchases") && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(var(--chart-3))" }} />
                      Standalone Purchases
                    </span>
                    <span className="font-medium">€{totals.standalone.toFixed(2)}</span>
                  </div>
                )}
                {(planFilter === "all" || planFilter === "personal_training") && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(var(--chart-4))" }} />
                      Personal Training
                    </span>
                    <span className="font-medium">€{totals.personal_training.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm font-bold border-t pt-2">
                  <span>Total</span>
                  <span>€{totalRevenue.toFixed(2)}</span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
