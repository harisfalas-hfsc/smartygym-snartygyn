import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useActivityLog } from "@/hooks/useActivityLog";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface LogBookChartsProps {
  userId: string;
  filter: string;
}

export const LogBookCharts = ({ userId, filter }: LogBookChartsProps) => {
  const { activities, isLoading } = useActivityLog(userId, filter === 'all' ? undefined : filter);

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-32" />
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted rounded" />
          </CardContent>
        </Card>
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-32" />
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Prepare data for pie chart - activity distribution
  const activityCounts = activities.reduce((acc, activity) => {
    const type = activity.content_type;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(activityCounts).map(([name, value]) => ({
    name: name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value,
  }));

  const COLORS = {
    'Workout': '#10B981',
    'Program': '#3B82F6',
    'Personal Training': '#F97316',
    'Tool': '#A855F7',
  };

  // Prepare data for bar chart - weekly activity count
  const getWeekNumber = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date.getTime() - firstDay.getTime()) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + firstDay.getDay() + 1) / 7);
  };

  const weeklyData = activities.reduce((acc, activity) => {
    const date = new Date(activity.activity_date);
    const week = getWeekNumber(date);
    const key = `Week ${week}`;
    
    if (!acc[key]) {
      acc[key] = { name: key, count: 0 };
    }
    acc[key].count++;
    return acc;
  }, {} as Record<string, { name: string; count: number }>);

  const barData = Object.values(weeklyData).slice(-12); // Last 12 weeks

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Pie Chart - Activity Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
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
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#9CA3AF'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No data to display
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bar Chart - Weekly Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="hsl(var(--primary))" name="Activities" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No data to display
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
