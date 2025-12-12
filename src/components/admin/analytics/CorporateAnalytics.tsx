import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Building2, Users, DollarSign, TrendingUp, RefreshCw, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface PlanTierData {
  plan: string;
  count: number;
  revenue: number;
  members: number;
  maxMembers: number;
  utilization: number;
}

interface CorporateSubscription {
  id: string;
  organization_name: string;
  plan_type: string;
  status: string;
  max_users: number;
  current_users_count: number;
  current_period_end: string;
  created_at: string;
}

export function CorporateAnalytics() {
  const [timeFilter, setTimeFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [totalCorporateSubs, setTotalCorporateSubs] = useState(0);
  const [activeCorporateSubs, setActiveCorporateSubs] = useState(0);
  const [totalCorporateRevenue, setTotalCorporateRevenue] = useState(0);
  const [totalCorporateMembers, setTotalCorporateMembers] = useState(0);
  const [avgUtilization, setAvgUtilization] = useState(0);
  const [planTierData, setPlanTierData] = useState<PlanTierData[]>([]);
  const [recentSubscriptions, setRecentSubscriptions] = useState<CorporateSubscription[]>([]);

  const PLAN_PRICES: { [key: string]: number } = {
    dynamic: 399,
    power: 499,
    elite: 599,
    enterprise: 699
  };

  const PLAN_MAX_USERS: { [key: string]: number } = {
    dynamic: 10,
    power: 20,
    elite: 30,
    enterprise: 100 // Treat enterprise as 100 for calculations
  };

  useEffect(() => {
    fetchCorporateAnalytics();
  }, [timeFilter]);

  const fetchCorporateAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch corporate subscriptions
      let query = supabase.from("corporate_subscriptions").select("*");
      
      if (timeFilter !== "all") {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(timeFilter));
        query = query.gte("created_at", startDate.toISOString());
      }

      const { data: subscriptions, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;

      setTotalCorporateSubs(subscriptions?.length || 0);
      
      const activeCount = subscriptions?.filter(s => s.status === "active").length || 0;
      setActiveCorporateSubs(activeCount);
      
      setRecentSubscriptions((subscriptions || []).slice(0, 10));

      // Calculate revenue and plan breakdown
      const planStats: { [key: string]: PlanTierData } = {};
      let totalRevenue = 0;
      let totalMembers = 0;
      let totalMaxMembers = 0;

      subscriptions?.forEach(sub => {
        const plan = sub.plan_type;
        if (!planStats[plan]) {
          planStats[plan] = {
            plan: plan.charAt(0).toUpperCase() + plan.slice(1),
            count: 0,
            revenue: 0,
            members: 0,
            maxMembers: 0,
            utilization: 0
          };
        }
        
        planStats[plan].count++;
        if (sub.status === "active") {
          planStats[plan].revenue += PLAN_PRICES[plan] || 0;
          totalRevenue += PLAN_PRICES[plan] || 0;
        }
        planStats[plan].members += sub.current_users_count || 0;
        planStats[plan].maxMembers += sub.max_users || PLAN_MAX_USERS[plan] || 10;
        
        totalMembers += sub.current_users_count || 0;
        totalMaxMembers += sub.max_users || PLAN_MAX_USERS[plan] || 10;
      });

      // Calculate utilization per plan
      Object.values(planStats).forEach(stats => {
        stats.utilization = stats.maxMembers > 0 
          ? Math.round((stats.members / stats.maxMembers) * 100) 
          : 0;
      });

      setTotalCorporateRevenue(totalRevenue);
      setTotalCorporateMembers(totalMembers);
      setAvgUtilization(totalMaxMembers > 0 ? Math.round((totalMembers / totalMaxMembers) * 100) : 0);
      setPlanTierData(Object.values(planStats).sort((a, b) => b.count - a.count));

    } catch (error) {
      console.error("Error fetching corporate analytics:", error);
      toast.error("Failed to load corporate analytics");
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "hsl(var(--muted))"];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "expired":
        return <Badge variant="destructive">Expired</Badge>;
      case "cancelled":
        return <Badge variant="secondary">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-lg">Loading corporate analytics...</div>
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
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="30">Last 30 Days</SelectItem>
                <SelectItem value="90">Last 90 Days</SelectItem>
                <SelectItem value="180">Last 6 Months</SelectItem>
                <SelectItem value="365">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchCorporateAnalytics} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Loading..." : "Refresh"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Corporate Subs</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCorporateSubs}</div>
            <p className="text-xs text-muted-foreground">All organizations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Corporate</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCorporateSubs}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Corporate Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalCorporateRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Annual value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Corporate Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCorporateMembers}</div>
            <p className="text-xs text-muted-foreground">Users under corporate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Utilization</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgUtilization}%</div>
            <p className="text-xs text-muted-foreground">Seats filled</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Revenue by Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Plan Tier</CardTitle>
            <CardDescription>Annual revenue from each corporate plan</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={planTierData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="plan" />
                <YAxis />
                <Tooltip formatter={(value) => `€${value}`} />
                <Legend />
                <Bar dataKey="revenue" name="Revenue (€)" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>

            {/* Detailed breakdown below */}
            <div className="mt-4 space-y-2 border-t pt-4">
              {planTierData.map((tier, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">{tier.plan}</span>
                  <div className="flex items-center gap-4">
                    <span>{tier.count} subs</span>
                    <span className="font-medium">€{tier.revenue.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Subscription Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Plan Distribution</CardTitle>
            <CardDescription>Corporate subscriptions by plan type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={planTierData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="hsl(var(--primary))"
                  dataKey="count"
                  label={({ plan, count }) => `${plan}: ${count}`}
                >
                  {planTierData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            {/* Utilization details */}
            <div className="mt-4 space-y-2 border-t pt-4">
              {planTierData.map((tier, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">{tier.plan}</span>
                  <div className="flex items-center gap-4">
                    <span>{tier.members}/{tier.maxMembers} members</span>
                    <span className={`font-medium ${tier.utilization > 75 ? "text-green-600" : "text-muted-foreground"}`}>
                      {tier.utilization}% utilized
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Corporate Subscriptions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Corporate Subscriptions</CardTitle>
          <CardDescription>Latest organizations that signed up</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 font-medium">Organization</th>
                  <th className="text-left py-3 px-2 font-medium">Plan</th>
                  <th className="text-center py-3 px-2 font-medium">Members</th>
                  <th className="text-center py-3 px-2 font-medium">Status</th>
                  <th className="text-right py-3 px-2 font-medium">Expires</th>
                </tr>
              </thead>
              <tbody>
                {recentSubscriptions.map((sub) => (
                  <tr key={sub.id} className="border-b last:border-0">
                    <td className="py-3 px-2 font-medium">{sub.organization_name}</td>
                    <td className="py-3 px-2 capitalize">{sub.plan_type}</td>
                    <td className="text-center py-3 px-2">
                      {sub.current_users_count}/{sub.max_users}
                    </td>
                    <td className="text-center py-3 px-2">{getStatusBadge(sub.status)}</td>
                    <td className="text-right py-3 px-2 text-sm text-muted-foreground">
                      {new Date(sub.current_period_end).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {recentSubscriptions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      No corporate subscriptions yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
