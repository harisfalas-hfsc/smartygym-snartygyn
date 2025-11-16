import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, Calendar, User, Calculator, Flame } from "lucide-react";
import { useActivityStats } from "@/hooks/useActivityLog";

interface LogBookStatsProps {
  userId: string;
}

export const LogBookStats = ({ userId }: LogBookStatsProps) => {
  const { stats, isLoading } = useActivityStats(userId);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-24" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Workouts This Month",
      value: stats.workoutsThisMonth,
      icon: Dumbbell,
      color: "text-green-500",
    },
    {
      title: "Program Days",
      value: stats.programDaysThisMonth,
      icon: Calendar,
      color: "text-blue-500",
    },
    {
      title: "PT Days",
      value: stats.ptDaysThisMonth,
      icon: User,
      color: "text-orange-500",
    },
    {
      title: "Tool Uses",
      value: stats.toolCalculationsThisMonth,
      icon: Calculator,
      color: "text-purple-500",
    },
    {
      title: "Current Streak",
      value: stats.currentStreak,
      icon: Flame,
      color: "text-red-500",
      suffix: stats.currentStreak === 1 ? " day" : " days",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stat.value}
                {stat.suffix && <span className="text-sm font-normal text-muted-foreground">{stat.suffix}</span>}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
