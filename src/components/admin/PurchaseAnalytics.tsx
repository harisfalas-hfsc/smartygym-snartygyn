import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import { 
  ShoppingCart, TrendingUp, DollarSign, Award, 
  Users, Target, RefreshCw 
} from "lucide-react";
import { toast } from "sonner";

interface PurchaseData {
  id: string;
  user_id: string;
  content_type: string;
  content_id: string;
  content_name: string;
  price: number;
  purchased_at: string;
}

interface ChartData {
  name: string;
  value: number;
  count?: number;
}

interface MetricsData {
  totalRevenue: number;
  totalPurchases: number;
  averageOrderValue: number;
  uniqueCustomers: number;
  conversionRate: number;
  customerLifetimeValue: number;
}

export function PurchaseAnalytics() {
  const [timeFilter, setTimeFilter] = useState<string>("30");
  const [contentTypeFilter, setContentTypeFilter] = useState<string>("all");
  const [metrics, setMetrics] = useState<MetricsData>({
    totalRevenue: 0,
    totalPurchases: 0,
    averageOrderValue: 0,
    uniqueCustomers: 0,
    conversionRate: 0,
    customerLifetimeValue: 0,
  });
  const [revenueByDay, setRevenueByDay] = useState<ChartData[]>([]);
  const [popularItems, setPopularItems] = useState<ChartData[]>([]);
  const [contentTypeDistribution, setContentTypeDistribution] = useState<ChartData[]>([]);
  const [topCustomers, setTopCustomers] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPurchaseAnalytics();
  }, [timeFilter, contentTypeFilter]);

  const fetchPurchaseAnalytics = async () => {
    setLoading(true);
    try {
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(timeFilter));

      // Fetch all purchases within date range
      let query = supabase
        .from("user_purchases")
        .select("*")
        .gte("purchased_at", startDate.toISOString())
        .lte("purchased_at", endDate.toISOString());

      // Apply content type filter
      if (contentTypeFilter !== "all") {
        query = query.eq("content_type", contentTypeFilter);
      }

      const { data: purchases, error } = await query;

      if (error) throw error;

      if (!purchases || purchases.length === 0) {
        // Reset all data if no purchases
        setMetrics({
          totalRevenue: 0,
          totalPurchases: 0,
          averageOrderValue: 0,
          uniqueCustomers: 0,
          conversionRate: 0,
          customerLifetimeValue: 0,
        });
        setRevenueByDay([]);
        setPopularItems([]);
        setContentTypeDistribution([]);
        setTopCustomers([]);
        setLoading(false);
        return;
      }

      // Calculate total revenue
      const totalRevenue = purchases.reduce((sum, p) => sum + parseFloat(p.price.toString()), 0);

      // Calculate unique customers
      const uniqueUserIds = new Set(purchases.map(p => p.user_id));
      const uniqueCustomers = uniqueUserIds.size;

      // Calculate average order value
      const averageOrderValue = totalRevenue / purchases.length;

      // Fetch total registered users for conversion rate
      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: 'exact', head: true });

      const conversionRate = totalUsers ? (uniqueCustomers / totalUsers) * 100 : 0;

      // Calculate customer lifetime value (total revenue / unique customers)
      const customerLifetimeValue = uniqueCustomers > 0 ? totalRevenue / uniqueCustomers : 0;

      setMetrics({
        totalRevenue,
        totalPurchases: purchases.length,
        averageOrderValue,
        uniqueCustomers,
        conversionRate,
        customerLifetimeValue,
      });

      // Revenue by day
      const revenueByDayMap: { [key: string]: number } = {};
      purchases.forEach(purchase => {
        const day = new Date(purchase.purchased_at).toLocaleDateString("en-US", { 
          month: "short", 
          day: "numeric" 
        });
        revenueByDayMap[day] = (revenueByDayMap[day] || 0) + parseFloat(purchase.price.toString());
      });
      
      const revenueByDayData: ChartData[] = Object.entries(revenueByDayMap)
        .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
        .sort((a, b) => {
          const dateA = new Date(a.name + ", " + new Date().getFullYear());
          const dateB = new Date(b.name + ", " + new Date().getFullYear());
          return dateA.getTime() - dateB.getTime();
        });

      setRevenueByDay(revenueByDayData);

      // Popular items (top 10)
      const itemSalesMap: { [key: string]: { revenue: number; count: number } } = {};
      purchases.forEach(purchase => {
        const key = `${purchase.content_name}`;
        if (!itemSalesMap[key]) {
          itemSalesMap[key] = { revenue: 0, count: 0 };
        }
        itemSalesMap[key].revenue += parseFloat(purchase.price.toString());
        itemSalesMap[key].count += 1;
      });

      const popularItemsData: ChartData[] = Object.entries(itemSalesMap)
        .map(([name, data]) => ({
          name: name.length > 30 ? name.substring(0, 30) + "..." : name,
          value: Math.round(data.revenue * 100) / 100,
          count: data.count,
        }))
        .sort((a, b) => (b.count || 0) - (a.count || 0))
        .slice(0, 10);

      setPopularItems(popularItemsData);

      // Content type distribution
      const contentTypeMap: { [key: string]: number } = {};
      purchases.forEach(purchase => {
        const type = purchase.content_type === "workout" ? "Workouts" : "Programs";
        contentTypeMap[type] = (contentTypeMap[type] || 0) + 1;
      });

      const contentTypeData: ChartData[] = Object.entries(contentTypeMap).map(([name, value]) => ({
        name,
        value,
      }));

      setContentTypeDistribution(contentTypeData);

      // Top customers by total spending
      const customerSpendingMap: { [key: string]: number } = {};
      purchases.forEach(purchase => {
        customerSpendingMap[purchase.user_id] = 
          (customerSpendingMap[purchase.user_id] || 0) + parseFloat(purchase.price.toString());
      });

      // Fetch user emails for display
      const topCustomerIds = Object.entries(customerSpendingMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([userId]) => userId);

      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", topCustomerIds);

      const topCustomersData: ChartData[] = topCustomerIds.map(userId => {
        const profile = profiles?.find(p => p.user_id === userId);
        return {
          name: profile?.full_name || `Customer ${userId.substring(0, 8)}`,
          value: Math.round(customerSpendingMap[userId] * 100) / 100,
        };
      });

      setTopCustomers(topCustomersData);

    } catch (error) {
      console.error("Error fetching purchase analytics:", error);
      toast.error("Failed to load purchase analytics");
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

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Purchase Analytics
          </CardTitle>
          <CardDescription>Analyze standalone purchase performance and customer behavior</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger>
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

            <Select value={contentTypeFilter} onValueChange={setContentTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Content Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Content</SelectItem>
                <SelectItem value="workout">Workouts Only</SelectItem>
                <SelectItem value="program">Programs Only</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={fetchPurchaseAnalytics} disabled={loading} className="w-full">
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
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{metrics.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From standalone purchases</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalPurchases}</div>
            <p className="text-xs text-muted-foreground">Individual items sold</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{metrics.averageOrderValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per transaction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.uniqueCustomers}</div>
            <p className="text-xs text-muted-foreground">Who made purchases</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.conversionRate.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">Users to purchasers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Lifetime Value</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{metrics.customerLifetimeValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Average per customer</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="revenue">Revenue Trends</TabsTrigger>
          <TabsTrigger value="popular">Popular Items</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="customers">Top Customers</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Over Time</CardTitle>
              <CardDescription>Daily revenue from standalone purchases</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-80">
                  <div className="animate-pulse">Loading chart...</div>
                </div>
              ) : revenueByDay.length === 0 ? (
                <div className="flex items-center justify-center h-80 text-muted-foreground">
                  No purchase data for selected period
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={revenueByDay}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `€${value}`} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      name="Revenue (€)" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="popular" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Most Purchased Items</CardTitle>
              <CardDescription>Ranked by number of purchases</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-80">
                  <div className="animate-pulse">Loading chart...</div>
                </div>
              ) : popularItems.length === 0 ? (
                <div className="flex items-center justify-center h-80 text-muted-foreground">
                  No purchase data for selected period
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={popularItems} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={200} />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === "Purchases") return value;
                        return `€${value}`;
                      }}
                    />
                    <Legend />
                    <Bar dataKey="count" name="Purchases" fill="hsl(var(--chart-1))" />
                    <Bar dataKey="value" name="Revenue (€)" fill="hsl(var(--chart-2))" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Distribution</CardTitle>
              <CardDescription>Breakdown by content type</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-80">
                  <div className="animate-pulse">Loading chart...</div>
                </div>
              ) : contentTypeDistribution.length === 0 ? (
                <div className="flex items-center justify-center h-80 text-muted-foreground">
                  No purchase data for selected period
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={contentTypeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      outerRadius={120}
                      fill="hsl(var(--primary))"
                      dataKey="value"
                    >
                      {contentTypeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Customers by Spending</CardTitle>
              <CardDescription>Highest spending customers in selected period</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-80">
                  <div className="animate-pulse">Loading chart...</div>
                </div>
              ) : topCustomers.length === 0 ? (
                <div className="flex items-center justify-center h-80 text-muted-foreground">
                  No purchase data for selected period
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={topCustomers} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={150} />
                    <Tooltip formatter={(value) => `€${value}`} />
                    <Legend />
                    <Bar dataKey="value" name="Total Spent (€)" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
