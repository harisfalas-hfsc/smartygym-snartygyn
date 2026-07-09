import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { DollarSign, Download, TrendingUp, CreditCard, ShoppingBag, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { ChartFilterBar } from "./analytics/ChartFilterBar";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import html2canvas from "html2canvas";
import { StripeRevenueTruth } from "./analytics/StripeRevenueTruth";
import {
  CURRENT_REVENUE_CATEGORY_LABELS,
  fetchStripeRevenueTruth,
  isCurrentPremiumAccess,
  isCurrentPremiumSubscription,
  normalizePlanLabel,
} from "@/lib/admin-analytics";

interface RevenueData {
  period: string;
  premium_membership: number;
  standalone_workout: number;
  standalone_program: number;
  other_smartygym: number;
  total: number;
}

interface SubscriptionDetail {
  id: string;
  user_email: string;
  plan_type: string;
  status: string;
  created_at: string;
  current_period_end: string | null;
  monthly_revenue: number;
  is_paid: boolean;  // Has stripe_subscription_id
}

interface PurchaseDetail {
  id: string;
  user_email: string;
  content_name: string;
  content_type: string;
  price: number;
  purchased_at: string;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function RevenueAnalytics() {
  const [timeFilter, setTimeFilter] = useState<string>("90");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [subscriptionDetails, setSubscriptionDetails] = useState<SubscriptionDetail[]>([]);
  const [purchaseDetails, setPurchaseDetails] = useState<PurchaseDetail[]>([]);
  const [activeTab, setActiveTab] = useState("stripe");
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

    if (timeFilter === "all") {
      startDate.setFullYear(2020, 0, 1);
    } else {
      startDate.setDate(startDate.getDate() - parseInt(timeFilter));
    }
    return { startDate, endDate };
  };

  const fetchRevenueData = async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange();
      const revenueByMonth: { [key: string]: Omit<RevenueData, "period" | "total"> } = {};
      let total = 0;
      const subDetails: SubscriptionDetail[] = [];
      const purDetails: PurchaseDetail[] = [];
      const stripeTruth = await fetchStripeRevenueTruth();

      // Fetch subscriptions with user emails — use ACTIVE-OVERLAP semantics so
      // recurring revenue created before the window but still active in it is
      // counted. (Filtering by `created_at` alone undercounts MRR.)
      if (planFilter === "all" || planFilter === "premium") {
        let subQuery = supabase
          .from("user_subscriptions")
          .select("id, user_id, plan_type, status, created_at, current_period_end, stripe_subscription_id, stripe_customer_id, subscription_source")
          .lte("created_at", endDate.toISOString())
          .or(`current_period_end.is.null,current_period_end.gte.${startDate.toISOString()}`);

        const { data: subscriptions } = await subQuery;

        if (subscriptions) {
          // Get user emails
          const userIds = [...new Set(subscriptions.map(s => s.user_id))];
          
          // Fallback to profiles if admin API not available
          const { data: profiles } = await supabase
            .from("profiles")
            .select("user_id, full_name")
            .in("user_id", userIds);
          
          const userEmailMap: Record<string, string> = {};
          profiles?.forEach(p => {
            userEmailMap[p.user_id] = p.full_name || "Unknown";
          });

          subscriptions.forEach((sub) => {
            if (!isCurrentPremiumAccess(sub as any)) return;
            const isPaid = isCurrentPremiumSubscription(sub as any);
            const month = new Date(sub.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
            });

            if (!revenueByMonth[month]) {
              revenueByMonth[month] = { premium_membership: 0, standalone_workout: 0, standalone_program: 0, other_smartygym: 0 };
            }

            // Revenue is not estimated from subscription rows anymore; Stripe payments below are the truth.
            const monthlyRevenue = 0;

            if (isPaid) revenueByMonth[month].premium_membership += monthlyRevenue;

            subDetails.push({
              id: sub.id,
              user_email: userEmailMap[sub.user_id] || sub.user_id.slice(0, 8),
              plan_type: normalizePlanLabel(sub as any),
              status: sub.status,
              created_at: sub.created_at,
              current_period_end: sub.current_period_end,
              monthly_revenue: monthlyRevenue,
              is_paid: isPaid,
            });
          });
        }
      }

      if (stripeTruth) {
        total = stripeTruth.totalCollected;
        Object.keys(revenueByMonth).forEach(key => delete revenueByMonth[key]);
        Object.entries(stripeTruth.byMonthByCategory || {}).forEach(([monthKey, values]) => {
          const month = new Date(`${monthKey}-01T00:00:00Z`).toLocaleDateString("en-US", { year: "numeric", month: "short" });
          revenueByMonth[month] = {
            premium_membership: values.premium_membership || 0,
            standalone_workout: values.standalone_workout || 0,
            standalone_program: values.standalone_program || 0,
            other_smartygym: values.other_smartygym || 0,
          };
        });
        const stripePurchases = stripeTruth.payments
          .filter((payment) => payment.category === "standalone_workout" || payment.category === "standalone_program")
          .filter((payment) => planFilter === "all" || planFilter === "standalone_purchases")
          .map((payment) => ({
            id: payment.id,
            user_email: payment.email || payment.customer || "Stripe customer",
            content_name: payment.productName || payment.description || "SmartyGym purchase",
            content_type: payment.category === "standalone_workout" ? "workout" : "program",
            price: Number(payment.amount) || 0,
            purchased_at: payment.date,
          }));
        purDetails.splice(0, purDetails.length, ...stripePurchases);
      }

      // Convert to chart data - sorted by date
      const sortedMonths = Object.keys(revenueByMonth).sort((a, b) => 
        new Date(a).getTime() - new Date(b).getTime()
      );

      const chartData: RevenueData[] = sortedMonths.map(period => {
        const plans = revenueByMonth[period];
        return {
          period,
          premium_membership: plans.premium_membership,
          standalone_workout: plans.standalone_workout,
          standalone_program: plans.standalone_program,
          other_smartygym: plans.other_smartygym,
          total: plans.premium_membership + plans.standalone_workout + plans.standalone_program + plans.other_smartygym,
        };
      });

      setRevenueData(chartData);
      setTotalRevenue(total);
      setSubscriptionDetails(subDetails);
      setPurchaseDetails(purDetails);
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

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast.error("No data to export");
      return;
    }
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map(row => Object.values(row).map(v => `"${v}"`).join(",")).join("\n");
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported!");
  };

  // Calculate totals for breakdown
  const totals = revenueData.reduce((acc, item) => ({
    premium_membership: acc.premium_membership + item.premium_membership,
    standalone_workout: acc.standalone_workout + item.standalone_workout,
    standalone_program: acc.standalone_program + item.standalone_program,
    other_smartygym: acc.other_smartygym + item.other_smartygym,
  }), { premium_membership: 0, standalone_workout: 0, standalone_program: 0, other_smartygym: 0 });

  const pieData = [
    { name: CURRENT_REVENUE_CATEGORY_LABELS.premium_membership, value: totals.premium_membership },
    { name: CURRENT_REVENUE_CATEGORY_LABELS.standalone_workout, value: totals.standalone_workout },
    { name: CURRENT_REVENUE_CATEGORY_LABELS.standalone_program, value: totals.standalone_program },
    { name: CURRENT_REVENUE_CATEGORY_LABELS.other_smartygym, value: totals.other_smartygym },
  ].filter(d => d.value > 0);

  const paidSubscriptionsCount = subscriptionDetails.filter(s => s.is_paid).length;
  const freeSubscriptionsCount = subscriptionDetails.filter(s => !s.is_paid).length;

  return (
    <div className="space-y-6">
      {/* Revenue Summary Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Revenue Analytics
          </CardTitle>
          <CardDescription>Stripe-only SmartyGym revenue, grouped by the current Premium and standalone products</CardDescription>
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
                  <SelectValue placeholder="Revenue Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="premium">Premium Memberships</SelectItem>
                  <SelectItem value="standalone_purchases">Standalone</SelectItem>
                </SelectContent>
              </Select>
            }
          />

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-primary/10 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <TrendingUp className="h-4 w-4" />
                  Paid Revenue Only
                </div>
                <p className="text-2xl font-bold">€{totalRevenue.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Stripe charges net of refunds</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground mb-1">Premium Memberships</div>
                <p className="text-xl font-bold">€{totals.premium_membership.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">
                  {paidSubscriptionsCount} paid • {freeSubscriptionsCount} manual access
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground mb-1">Standalone Workouts</div>
                <p className="text-xl font-bold">€{totals.standalone_workout.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">{purchaseDetails.filter(p => p.content_type === "workout").length} sales</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground mb-1">Standalone Programs</div>
                <p className="text-xl font-bold">€{totals.standalone_program.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">{purchaseDetails.filter(p => p.content_type === "program").length} sales</p>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="-mx-1 mb-4 overflow-x-auto">
              <TabsList className="inline-flex w-max gap-1 px-1 md:grid md:w-full md:grid-cols-4">
                <TabsTrigger value="stripe" className="whitespace-nowrap">Stripe (truth)</TabsTrigger>
                <TabsTrigger value="overview" className="whitespace-nowrap">Overview</TabsTrigger>
                <TabsTrigger value="subscriptions" className="whitespace-nowrap">Subscriptions</TabsTrigger>
                <TabsTrigger value="purchases" className="whitespace-nowrap">Purchases</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="stripe" className="space-y-4">
              <StripeRevenueTruth />
            </TabsContent>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div ref={chartRef}>
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-pulse">Loading chart...</div>
                  </div>
                ) : revenueData.length === 0 ? (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    No revenue data for selected period
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Trend Chart */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Revenue Trend</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                          <LineChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="period" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `€${v}`} />
                            <Tooltip 
                              formatter={(value) => `€${value}`}
                              contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="total" name="Total" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Distribution Pie */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Revenue Distribution</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => `€${value}`} />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>

              {/* Monthly Breakdown Table */}
              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm">Monthly Breakdown</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => exportToCSV(revenueData, "monthly-revenue")}>
                    <Download className="h-4 w-4 mr-1" /> Export CSV
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Period</TableHead>
                          <TableHead className="text-right">Premium</TableHead>
                          <TableHead className="text-right">Standalone</TableHead>
                            <TableHead className="text-right">Programs</TableHead>
                            <TableHead className="text-right">Other</TableHead>
                          <TableHead className="text-right font-bold">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {revenueData.map((row) => (
                          <TableRow key={row.period}>
                            <TableCell>{row.period}</TableCell>
                            <TableCell className="text-right">€{row.premium_membership.toFixed(2)}</TableCell>
                            <TableCell className="text-right">€{row.standalone_workout.toFixed(2)}</TableCell>
                            <TableCell className="text-right">€{row.standalone_program.toFixed(2)}</TableCell>
                            <TableCell className="text-right">€{row.other_smartygym.toFixed(2)}</TableCell>
                            <TableCell className="text-right font-bold">€{row.total.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-muted/50 font-bold">
                          <TableCell>Total</TableCell>
                          <TableCell className="text-right">€{totals.premium_membership.toFixed(2)}</TableCell>
                          <TableCell className="text-right">€{totals.standalone_workout.toFixed(2)}</TableCell>
                          <TableCell className="text-right">€{totals.standalone_program.toFixed(2)}</TableCell>
                          <TableCell className="text-right">€{totals.other_smartygym.toFixed(2)}</TableCell>
                          <TableCell className="text-right">€{totalRevenue.toFixed(2)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Subscriptions Tab */}
            <TabsContent value="subscriptions" className="space-y-4">
              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    <CardTitle className="text-sm">Subscription Details</CardTitle>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => exportToCSV(subscriptionDetails, "subscriptions")}>
                    <Download className="h-4 w-4 mr-1" /> Export CSV
                  </Button>
                </CardHeader>
                <CardContent>
                  {subscriptionDetails.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No subscriptions in selected period</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Payment</TableHead>
                            <TableHead>Start Date</TableHead>
                            <TableHead>Renewal</TableHead>
                            <TableHead className="text-right">Stripe Revenue</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {subscriptionDetails.map((sub) => (
                            <TableRow key={sub.id} className={!sub.is_paid ? "opacity-60" : ""}>
                              <TableCell className="font-medium">{sub.user_email}</TableCell>
                              <TableCell>
                                <span className="px-2 py-1 rounded text-xs bg-primary/20 text-primary">
                                  {sub.plan_type}
                                </span>
                              </TableCell>
                              <TableCell>
                                {sub.is_paid ? (
                                  <Badge variant="default" className="bg-green-600">Paid</Badge>
                                ) : (
                                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Manual Access
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>{new Date(sub.created_at).toLocaleDateString()}</TableCell>
                              <TableCell>{sub.current_period_end ? new Date(sub.current_period_end).toLocaleDateString() : "-"}</TableCell>
                              <TableCell className="text-right font-medium">
                                {sub.is_paid ? `€${sub.monthly_revenue.toFixed(2)}` : "€0.00"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Purchases Tab */}
            <TabsContent value="purchases" className="space-y-4">
              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    <CardTitle className="text-sm">Purchase Details</CardTitle>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => exportToCSV(purchaseDetails, "purchases")}>
                    <Download className="h-4 w-4 mr-1" /> Export CSV
                  </Button>
                </CardHeader>
                <CardContent>
                  {purchaseDetails.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No purchases in selected period</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Item</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {purchaseDetails.map((purchase) => (
                            <TableRow key={purchase.id}>
                              <TableCell className="font-medium">{purchase.user_email}</TableCell>
                              <TableCell>{purchase.content_name}</TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded text-xs ${
                                  purchase.content_type === "workout"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-purple-100 text-purple-800"
                                }`}>
                                  {purchase.content_type.replace("_", " ")}
                                </span>
                              </TableCell>
                              <TableCell>{new Date(purchase.purchased_at).toLocaleDateString()}</TableCell>
                              <TableCell className="text-right font-medium">€{purchase.price.toFixed(2)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
