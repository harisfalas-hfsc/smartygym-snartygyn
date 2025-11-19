import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { DollarSign, Package, TrendingUp, ShoppingCart, Download, RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface ShopMetrics {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  pendingOrders: number;
}

export function ShopAnalytics() {
  const [timeFilter, setTimeFilter] = useState<string>("30");
  const [metrics, setMetrics] = useState<ShopMetrics>({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    pendingOrders: 0,
  });
  const [revenueByCategory, setRevenueByCategory] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [fulfillmentStatus, setFulfillmentStatus] = useState<any[]>([]);
  const [stockLevels, setStockLevels] = useState<any[]>([]);
  const [revenueOverTime, setRevenueOverTime] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    fetchAnalytics();

    // Real-time updates
    const channel = supabase
      .channel('shop_analytics')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'user_purchases',
        filter: 'content_type=eq.shop_product'
      }, () => {
        fetchAnalytics();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [timeFilter]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(timeFilter));

      // Fetch shop purchases
      const { data: purchases } = await supabase
        .from('user_purchases')
        .select('*')
        .eq('content_type', 'shop_product')
        .gte('purchased_at', startDate.toISOString());

      // Fetch shop products separately
      const { data: allProducts } = await supabase
        .from('shop_products')
        .select('id, title, category, stock_quantity');

      const totalRevenue = purchases?.reduce((sum, p) => sum + (p.price || 0), 0) || 0;
      const totalOrders = purchases?.length || 0;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const pendingOrders = purchases?.filter(p => p.fulfillment_status === 'pending').length || 0;

      setMetrics({
        totalRevenue,
        totalOrders,
        avgOrderValue,
        pendingOrders,
      });

      // Revenue by category
      const categoryRevenue: { [key: string]: number } = {};
      purchases?.forEach(p => {
        const product = allProducts?.find(prod => prod.id === p.content_id);
        const category = product?.category || 'Unknown';
        categoryRevenue[category] = (categoryRevenue[category] || 0) + (p.price || 0);
      });
      setRevenueByCategory(
        Object.entries(categoryRevenue).map(([name, value]) => ({ name, value }))
      );

      // Top products by revenue
      const productRevenue: { [key: string]: { revenue: number; quantity: number } } = {};
      purchases?.forEach(p => {
        const name = p.content_name || 'Unknown';
        if (!productRevenue[name]) {
          productRevenue[name] = { revenue: 0, quantity: 0 };
        }
        productRevenue[name].revenue += p.price || 0;
        productRevenue[name].quantity += 1;
      });
      const topProductsArray = Object.entries(productRevenue)
        .map(([name, data]) => ({ name, revenue: data.revenue, quantity: data.quantity }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);
      setTopProducts(topProductsArray);

      // Fulfillment status distribution
      const statusCounts: { [key: string]: number } = {};
      purchases?.forEach(p => {
        const status = p.fulfillment_status || 'pending';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
      setFulfillmentStatus(
        Object.entries(statusCounts).map(([name, value]) => ({ name, value }))
      );

      // Stock levels overview
      const { data: products } = await supabase
        .from('shop_products')
        .select('id, title, category, stock_quantity, product_type')
        .eq('product_type', 'direct_sale');

      const stockData = await Promise.all(
        (products || []).map(async (product) => {
          const { count } = await supabase
            .from('user_purchases')
            .select('*', { count: 'exact', head: true })
            .eq('content_type', 'shop_product')
            .eq('content_id', product.id);

          const productPurchases = purchases?.filter(p => p.content_id === product.id) || [];
          const revenue = productPurchases.reduce((sum, p) => sum + (p.price || 0), 0);

          return {
            name: product.title,
            stock: product.stock_quantity || 0,
            sold: count || 0,
            revenue,
            lowStock: (product.stock_quantity || 0) < 5,
          };
        })
      );
      setStockLevels(stockData.sort((a, b) => b.revenue - a.revenue));

      // Revenue over time (group by week)
      const revenueByWeek: { [key: string]: number } = {};
      purchases?.forEach(p => {
        const week = new Date(p.purchased_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        revenueByWeek[week] = (revenueByWeek[week] || 0) + (p.price || 0);
      });
      setRevenueOverTime(
        Object.entries(revenueByWeek).map(([date, revenue]) => ({ date, revenue }))
      );

    } catch (error) {
      console.error('Error fetching shop analytics:', error);
      toast.error('Failed to load shop analytics');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const csv = [
      ['Product', 'Category', 'Quantity Sold', 'Revenue', 'Current Stock'],
      ...stockLevels.map(item => [
        item.name,
        '',
        item.sold,
        `€${item.revenue.toFixed(2)}`,
        item.stock
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shop-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Analytics exported successfully');
  };

  const COLORS = ['#FFD700', '#FFA500', '#FF6347', '#4682B4', '#32CD32', '#9370DB'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Shop Analytics</h2>
          <p className="text-muted-foreground">Track your shop performance and sales</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchAnalytics} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={exportToCSV} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{metrics.totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{metrics.avgOrderValue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pendingOrders}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: any) => `€${value.toFixed(2)}`} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#FFD700" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={revenueByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: €${value.toFixed(0)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {revenueByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `€${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Products by Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value: any) => `€${value.toFixed(2)}`} />
                <Legend />
                <Bar dataKey="revenue" fill="#FFD700" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fulfillment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={fulfillmentStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {fulfillmentStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Stock Levels Table */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Levels & Performance</CardTitle>
          <CardDescription>Track inventory and sales performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Product</th>
                  <th className="text-right p-2">Stock</th>
                  <th className="text-right p-2">Sold</th>
                  <th className="text-right p-2">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {stockLevels.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">
                      {item.name}
                      {item.lowStock && (
                        <span className="ml-2 text-xs text-destructive">⚠️ Low Stock</span>
                      )}
                    </td>
                    <td className="text-right p-2">{item.stock}</td>
                    <td className="text-right p-2">{item.sold}</td>
                    <td className="text-right p-2">€{item.revenue.toFixed(2)}</td>
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
