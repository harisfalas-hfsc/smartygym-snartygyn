import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useActivityLog } from "@/hooks/useActivityLog";
import { Skeleton } from "@/components/ui/skeleton";
import { startOfMonth, subMonths, format } from "date-fns";

interface LogBookEnhancedChartsProps {
  userId: string;
  filter: string;
}

const COLORS = {
  workout: "hsl(var(--primary))",
  program: "hsl(var(--chart-2))",
  tool: "hsl(var(--chart-3))",
  completed: "hsl(var(--chart-4))",
  viewed: "hsl(var(--chart-5))",
};

export const LogBookEnhancedCharts = ({ userId, filter }: LogBookEnhancedChartsProps) => {
  const { activities, isLoading } = useActivityLog(userId, filter);

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Completed vs Viewed Bar Chart Data
  const getLast12Weeks = () => {
    const weeks: any[] = [];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      const weekActivities = activities.filter(a => {
        const activityDate = new Date(a.activity_date);
        return activityDate >= weekStart && activityDate <= weekEnd;
      });
      
      const completed = weekActivities.filter(a => 
        a.action_type === 'completed' || a.action_type === 'program_day_completed'
      ).length;
      
      const viewed = weekActivities.filter(a => 
        a.action_type === 'viewed'
      ).length;
      
      weeks.push({
        week: format(weekStart, 'MMM dd'),
        Completed: completed,
        Viewed: viewed,
      });
    }
    
    return weeks;
  };

  // Monthly Trend Line Chart Data
  const getLast6Months = () => {
    const months: any[] = [];
    
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(new Date(), i));
      const monthEnd = startOfMonth(subMonths(new Date(), i - 1));
      
      const monthActivities = activities.filter(a => {
        const activityDate = new Date(a.activity_date);
        return activityDate >= monthStart && activityDate < monthEnd;
      });
      
      const workouts = monthActivities.filter(a => 
        a.content_type === 'workout' && a.action_type === 'completed'
      ).length;
      
      const programDays = monthActivities.filter(a => 
        a.content_type === 'program' && a.action_type === 'program_day_completed'
      ).length;
      
      const tools = monthActivities.filter(a => 
        a.content_type === 'tool' && a.action_type === 'calculated'
      ).length;
      
      months.push({
        month: format(monthStart, 'MMM'),
        Workouts: workouts,
        'Program Days': programDays,
        Tools: tools,
      });
    }
    
    return months;
  };

  // Enhanced Activity Distribution Pie Chart
  const getActivityDistribution = () => {
    const distribution: { [key: string]: { completed: number; viewed: number } } = {
      workout: { completed: 0, viewed: 0 },
      program: { completed: 0, viewed: 0 },
      tool: { completed: 0, viewed: 0 },
    };

    activities.forEach(activity => {
      const type = activity.content_type;
      if (activity.action_type === 'completed' || activity.action_type === 'program_day_completed') {
        distribution[type].completed++;
      } else if (activity.action_type === 'viewed') {
        distribution[type].viewed++;
      } else if (activity.action_type === 'calculated') {
        distribution[type].completed++;
      }
    });

    return [
      {
        name: 'Workouts',
        value: distribution.workout.completed + distribution.workout.viewed,
        completed: distribution.workout.completed,
        viewed: distribution.workout.viewed,
      },
      {
        name: 'Programs',
        value: distribution.program.completed + distribution.program.viewed,
        completed: distribution.program.completed,
        viewed: distribution.program.viewed,
      },
      {
        name: 'Tools',
        value: distribution.tool.completed,
        completed: distribution.tool.completed,
        viewed: 0,
      },
    ].filter(item => item.value > 0);
  };

  const weeklyData = getLast12Weeks();
  const monthlyData = getLast6Months();
  const pieData = getActivityDistribution();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border p-3 rounded-lg shadow-lg">
          <p className="font-semibold">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            Completed: {data.completed}
          </p>
          {data.viewed > 0 && (
            <p className="text-sm text-muted-foreground">
              Viewed: {data.viewed}
            </p>
          )}
          <p className="text-sm font-medium mt-1">
            Total: {data.value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Completed vs Viewed Bar Chart */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Completed vs Viewed Activities (Last 12 Weeks)</CardTitle>
        </CardHeader>
        <CardContent>
          {weeklyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Completed" fill={COLORS.completed} />
                <Bar dataKey="Viewed" fill={COLORS.viewed} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground py-8">No data to display</p>
          )}
        </CardContent>
      </Card>

      {/* Monthly Trend Line Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Trends (Last 6 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Workouts" stroke={COLORS.workout} strokeWidth={2} />
                <Line type="monotone" dataKey="Program Days" stroke={COLORS.program} strokeWidth={2} />
                <Line type="monotone" dataKey="Tools" stroke={COLORS.tool} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground py-8">No data to display</p>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Activity Distribution Pie Chart */}
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
                  label={({ name, value, completed, viewed }) => 
                    `${name} (${value}): C:${completed}${viewed > 0 ? ` V:${viewed}` : ''}`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground py-8">No data to display</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
