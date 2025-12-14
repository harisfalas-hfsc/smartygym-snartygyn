import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { DollarSign, Download, TrendingUp, CreditCard, Building2, ShoppingBag, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { ChartFilterBar } from "./analytics/ChartFilterBar";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import html2canvas from "html2canvas";
import { SUBSCRIPTION_PRICES, CORPORATE_PRICES } from "@/config/pricing";

interface RevenueData {
  period: string;
  gold: number;
  platinum: number;
  standalone: number;
  personal_training: number;
  corporate: number;
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

interface CorporateDetail {
  id: string;
  organization_name: string;
  plan_type: string;
  max_users: number;
  current_users_count: number;
  status: string;
  current_period_end: string;
  annual_revenue: number;
  is_paid: boolean;  // Has stripe_subscription_id AND stripe_customer_id
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
  const [corporateDetails, setCorporateDetails] = useState<CorporateDetail[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
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
      const revenueByMonth: { [key: string]: { gold: number; platinum: number; standalone: number; personal_training: number; corporate: number } } = {};
      let total = 0;
      const subDetails: SubscriptionDetail[] = [];
      const purDetails: PurchaseDetail[] = [];
      const corpDetails: CorporateDetail[] = [];

      // Fetch subscriptions with user emails - ONLY PAID (has stripe_subscription_id)
      if (planFilter === "all" || planFilter === "gold" || planFilter === "platinum") {
        let subQuery = supabase
          .from("user_subscriptions")
          .select("id, user_id, plan_type, status, created_at, current_period_end, stripe_subscription_id")
          .eq("status", "active")
          .gte("created_at", startDate.toISOString())
          .lte("created_at", endDate.toISOString());

        if (planFilter === "gold" || planFilter === "platinum") {
          subQuery = subQuery.eq("plan_type", planFilter);
        }

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
            const isPaid = !!sub.stripe_subscription_id;
            const month = new Date(sub.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
            });

            if (!revenueByMonth[month]) {
              revenueByMonth[month] = { gold: 0, platinum: 0, standalone: 0, personal_training: 0, corporate: 0 };
            }

            // Use CORRECT prices from config - only count PAID subscriptions
            const monthlyRevenue = isPaid 
              ? (sub.plan_type === "gold" ? SUBSCRIPTION_PRICES.gold : sub.plan_type === "platinum" ? SUBSCRIPTION_PRICES.platinum : 0)
              : 0;
            
            if (isPaid) {
              revenueByMonth[month][sub.plan_type as "gold" | "platinum"] += monthlyRevenue;
              total += monthlyRevenue;
            }

            subDetails.push({
              id: sub.id,
              user_email: userEmailMap[sub.user_id] || sub.user_id.slice(0, 8),
              plan_type: sub.plan_type,
              status: sub.status,
              created_at: sub.created_at,
              current_period_end: sub.current_period_end,
              monthly_revenue: monthlyRevenue,
              is_paid: isPaid,
            });
          });
        }
      }

      // Fetch standalone purchases
      if (planFilter === "all" || planFilter === "standalone_purchases") {
        const { data: purchases } = await supabase
          .from("user_purchases")
          .select("id, user_id, price, purchased_at, content_type, content_name")
          .gte("purchased_at", startDate.toISOString())
          .lte("purchased_at", endDate.toISOString())
          .neq("content_type", "personal_training");

        if (purchases) {
          const userIds = [...new Set(purchases.map(p => p.user_id))];
          const { data: profiles } = await supabase
            .from("profiles")
            .select("user_id, full_name")
            .in("user_id", userIds);
          
          const userEmailMap: Record<string, string> = {};
          profiles?.forEach(p => {
            userEmailMap[p.user_id] = p.full_name || "Unknown";
          });

          purchases.forEach((purchase) => {
            const month = new Date(purchase.purchased_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
            });

            if (!revenueByMonth[month]) {
              revenueByMonth[month] = { gold: 0, platinum: 0, standalone: 0, personal_training: 0, corporate: 0 };
            }

            const revenue = parseFloat(purchase.price?.toString() || "0");
            revenueByMonth[month].standalone += revenue;
            total += revenue;

            purDetails.push({
              id: purchase.id,
              user_email: userEmailMap[purchase.user_id] || purchase.user_id.slice(0, 8),
              content_name: purchase.content_name,
              content_type: purchase.content_type,
              price: revenue,
              purchased_at: purchase.purchased_at,
            });
          });
        }
      }

      // Fetch personal training purchases
      if (planFilter === "all" || planFilter === "personal_training") {
        const { data: ptPurchases } = await supabase
          .from("user_purchases")
          .select("id, user_id, price, purchased_at, content_name")
          .eq("content_type", "personal_training")
          .gte("purchased_at", startDate.toISOString())
          .lte("purchased_at", endDate.toISOString());

        if (ptPurchases) {
          const userIds = [...new Set(ptPurchases.map(p => p.user_id))];
          const { data: profiles } = await supabase
            .from("profiles")
            .select("user_id, full_name")
            .in("user_id", userIds);
          
          const userEmailMap: Record<string, string> = {};
          profiles?.forEach(p => {
            userEmailMap[p.user_id] = p.full_name || "Unknown";
          });

          ptPurchases.forEach((purchase) => {
            const month = new Date(purchase.purchased_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
            });

            if (!revenueByMonth[month]) {
              revenueByMonth[month] = { gold: 0, platinum: 0, standalone: 0, personal_training: 0, corporate: 0 };
            }

            const revenue = parseFloat(purchase.price?.toString() || "0");
            revenueByMonth[month].personal_training += revenue;
            total += revenue;

            purDetails.push({
              id: purchase.id,
              user_email: userEmailMap[purchase.user_id] || purchase.user_id.slice(0, 8),
              content_name: purchase.content_name,
              content_type: "personal_training",
              price: revenue,
              purchased_at: purchase.purchased_at,
            });
          });
        }
      }

      // Fetch corporate subscriptions - ONLY PAID (has stripe_subscription_id AND stripe_customer_id)
      if (planFilter === "all" || planFilter === "corporate") {
        const { data: corporateSubs } = await supabase
          .from("corporate_subscriptions")
          .select("*, stripe_subscription_id, stripe_customer_id")
          .eq("status", "active")
          .gte("created_at", startDate.toISOString())
          .lte("created_at", endDate.toISOString());

        corporateSubs?.forEach((corp) => {
          const isPaid = !!(corp.stripe_subscription_id && corp.stripe_customer_id);
          const month = new Date(corp.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
          });

          if (!revenueByMonth[month]) {
            revenueByMonth[month] = { gold: 0, platinum: 0, standalone: 0, personal_training: 0, corporate: 0 };
          }

          // Only count revenue for PAID corporate plans
          const annualRevenue = isPaid ? (CORPORATE_PRICES[corp.plan_type as keyof typeof CORPORATE_PRICES] || 0) : 0;
          
          if (isPaid) {
            revenueByMonth[month].corporate += annualRevenue;
            total += annualRevenue;
          }

          corpDetails.push({
            id: corp.id,
            organization_name: corp.organization_name,
            plan_type: corp.plan_type,
            max_users: corp.max_users,
            current_users_count: corp.current_users_count,
            status: corp.status,
            current_period_end: corp.current_period_end,
            annual_revenue: annualRevenue,
            is_paid: isPaid,
          });
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
          corporate: plans.corporate,
          total: plans.gold + plans.platinum + plans.standalone + plans.personal_training + plans.corporate,
        };
      });

      setRevenueData(chartData);
      setTotalRevenue(total);
      setSubscriptionDetails(subDetails);
      setPurchaseDetails(purDetails);
      setCorporateDetails(corpDetails);
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
    gold: acc.gold + item.gold,
    platinum: acc.platinum + item.platinum,
    standalone: acc.standalone + item.standalone,
    personal_training: acc.personal_training + item.personal_training,
    corporate: acc.corporate + item.corporate,
  }), { gold: 0, platinum: 0, standalone: 0, personal_training: 0, corporate: 0 });

  const pieData = [
    { name: `Gold (€${SUBSCRIPTION_PRICES.gold}/mo)`, value: totals.gold },
    { name: `Platinum (€${SUBSCRIPTION_PRICES.platinum}/yr)`, value: totals.platinum },
    { name: "Standalone", value: totals.standalone },
    { name: "Personal Training", value: totals.personal_training },
    { name: "Corporate", value: totals.corporate },
  ].filter(d => d.value > 0);

  const paidSubscriptionsCount = subscriptionDetails.filter(s => s.is_paid).length;
  const freeSubscriptionsCount = subscriptionDetails.filter(s => !s.is_paid).length;
  const paidCorporateCount = corporateDetails.filter(c => c.is_paid).length;
  const freeCorporateCount = corporateDetails.filter(c => !c.is_paid).length;

  return (
    <div className="space-y-6">
      {/* Revenue Summary Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Revenue Analytics
          </CardTitle>
          <CardDescription>Comprehensive revenue tracking with detailed breakdowns</CardDescription>
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
                  <SelectItem value="gold">Gold Plans</SelectItem>
                  <SelectItem value="platinum">Platinum Plans</SelectItem>
                  <SelectItem value="standalone_purchases">Standalone</SelectItem>
                  <SelectItem value="personal_training">Personal Training</SelectItem>
                  <SelectItem value="corporate">Corporate Plans</SelectItem>
                </SelectContent>
              </Select>
            }
          />

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <Card className="bg-primary/10 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <TrendingUp className="h-4 w-4" />
                  Paid Revenue Only
                </div>
                <p className="text-2xl font-bold">€{totalRevenue.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Excludes complimentary</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground mb-1">Subscriptions</div>
                <p className="text-xl font-bold">€{(totals.gold + totals.platinum).toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">
                  {paidSubscriptionsCount} paid • {freeSubscriptionsCount} free
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground mb-1">Standalone</div>
                <p className="text-xl font-bold">€{totals.standalone.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">{purchaseDetails.filter(p => p.content_type !== "personal_training").length} sales</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground mb-1">Personal Training</div>
                <p className="text-xl font-bold">€{totals.personal_training.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">{purchaseDetails.filter(p => p.content_type === "personal_training").length} sessions</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground mb-1">Corporate</div>
                <p className="text-xl font-bold">€{totals.corporate.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">
                  {paidCorporateCount} paid • {freeCorporateCount} free
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
              <TabsTrigger value="purchases">Purchases</TabsTrigger>
              <TabsTrigger value="corporate">Corporate</TabsTrigger>
            </TabsList>

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
                          <TableHead className="text-right">Gold</TableHead>
                          <TableHead className="text-right">Platinum</TableHead>
                          <TableHead className="text-right">Standalone</TableHead>
                          <TableHead className="text-right">Personal Training</TableHead>
                          <TableHead className="text-right">Corporate</TableHead>
                          <TableHead className="text-right font-bold">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {revenueData.map((row) => (
                          <TableRow key={row.period}>
                            <TableCell>{row.period}</TableCell>
                            <TableCell className="text-right">€{row.gold.toFixed(2)}</TableCell>
                            <TableCell className="text-right">€{row.platinum.toFixed(2)}</TableCell>
                            <TableCell className="text-right">€{row.standalone.toFixed(2)}</TableCell>
                            <TableCell className="text-right">€{row.personal_training.toFixed(2)}</TableCell>
                            <TableCell className="text-right">€{row.corporate.toFixed(2)}</TableCell>
                            <TableCell className="text-right font-bold">€{row.total.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-muted/50 font-bold">
                          <TableCell>Total</TableCell>
                          <TableCell className="text-right">€{totals.gold.toFixed(2)}</TableCell>
                          <TableCell className="text-right">€{totals.platinum.toFixed(2)}</TableCell>
                          <TableCell className="text-right">€{totals.standalone.toFixed(2)}</TableCell>
                          <TableCell className="text-right">€{totals.personal_training.toFixed(2)}</TableCell>
                          <TableCell className="text-right">€{totals.corporate.toFixed(2)}</TableCell>
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
                            <TableHead className="text-right">Revenue</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {subscriptionDetails.map((sub) => (
                            <TableRow key={sub.id} className={!sub.is_paid ? "opacity-60" : ""}>
                              <TableCell className="font-medium">{sub.user_email}</TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded text-xs ${sub.plan_type === "platinum" ? "bg-purple-100 text-purple-800" : "bg-primary/20 text-primary"}`}>
                                  {sub.plan_type.charAt(0).toUpperCase() + sub.plan_type.slice(1)}
                                </span>
                              </TableCell>
                              <TableCell>
                                {sub.is_paid ? (
                                  <Badge variant="default" className="bg-green-600">Paid</Badge>
                                ) : (
                                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Free/Manual
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
                                  purchase.content_type === "personal_training" 
                                    ? "bg-blue-100 text-blue-800" 
                                    : purchase.content_type === "workout"
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

            {/* Corporate Tab */}
            <TabsContent value="corporate" className="space-y-4">
              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    <CardTitle className="text-sm">Corporate Subscriptions</CardTitle>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => exportToCSV(corporateDetails, "corporate")}>
                    <Download className="h-4 w-4 mr-1" /> Export CSV
                  </Button>
                </CardHeader>
                <CardContent>
                  {corporateDetails.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No corporate subscriptions in selected period</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Organization</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Users</TableHead>
                            <TableHead>Payment</TableHead>
                            <TableHead>Renewal</TableHead>
                            <TableHead className="text-right">Revenue</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {corporateDetails.map((corp) => (
                            <TableRow key={corp.id} className={!corp.is_paid ? "opacity-60" : ""}>
                              <TableCell className="font-medium">{corp.organization_name}</TableCell>
                              <TableCell>
                                <span className="px-2 py-1 rounded text-xs bg-primary/20 text-primary">
                                  Smarty {corp.plan_type.charAt(0).toUpperCase() + corp.plan_type.slice(1)}
                                </span>
                              </TableCell>
                              <TableCell>{corp.current_users_count}/{corp.max_users}</TableCell>
                              <TableCell>
                                {corp.is_paid ? (
                                  <Badge variant="default" className="bg-green-600">Paid</Badge>
                                ) : (
                                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Complimentary
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>{new Date(corp.current_period_end).toLocaleDateString()}</TableCell>
                              <TableCell className="text-right font-medium">
                                {corp.is_paid ? `€${corp.annual_revenue.toFixed(2)}` : "€0.00"}
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
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
