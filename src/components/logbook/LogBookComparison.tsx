import { Card, CardContent } from "@/components/ui/card";
import { Dumbbell, Calendar, Calculator, TrendingUp, Flame } from "lucide-react";
import { useActivityComparison } from "@/hooks/useActivityLog";
import { Skeleton } from "@/components/ui/skeleton";

interface LogBookComparisonProps {
  userId: string;
}

export const LogBookComparison = ({ userId }: LogBookComparisonProps) => {
  const { stats, isLoading } = useActivityComparison(userId);

  if (isLoading) {
    return (
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 mb-6">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-3 sm:p-4">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const comparisonCards = [
    {
      title: "Workouts",
      current: stats.thisMonth.workoutsCompleted,
      previous: stats.lastMonth.workoutsCompleted,
      change: stats.changes.workoutsCompleted,
      icon: Dumbbell,
      color: "text-primary",
    },
    {
      title: "Program Days",
      current: stats.thisMonth.programDaysCompleted,
      previous: stats.lastMonth.programDaysCompleted,
      change: stats.changes.programDaysCompleted,
      icon: Calendar,
      color: "text-primary",
    },
    {
      title: "Tools Used",
      current: stats.thisMonth.toolCalculations,
      previous: stats.lastMonth.toolCalculations,
      change: stats.changes.toolCalculations,
      icon: Calculator,
      color: "text-primary",
    },
    {
      title: "Total Activities",
      current: stats.thisMonth.totalActivities,
      previous: stats.lastMonth.totalActivities,
      change: stats.changes.totalActivities,
      icon: TrendingUp,
      color: "text-primary",
    },
    {
      title: "Current Streak",
      current: stats.thisMonth.currentStreak,
      previous: stats.lastMonth.currentStreak,
      change: stats.changes.currentStreak,
      icon: Flame,
      color: "text-primary",
    },
  ];

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-4">Month Comparison</h3>
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {comparisonCards.map((card, index) => {
          const Icon = card.icon;
          const changeColor =
            card.change > 0
              ? "text-green-600"
              : card.change < 0
              ? "text-red-600"
              : "text-muted-foreground";
          const changeIcon =
            card.change > 0 ? "↑" : card.change < 0 ? "↓" : "→";

          return (
            <Card key={index}>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${card.color}`} />
                  <span className={`text-xs font-semibold ${changeColor}`}>
                    {changeIcon} {Math.abs(card.change).toFixed(1)}%
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-xl sm:text-2xl font-bold">{card.current}</p>
                  <p className="text-xs text-muted-foreground truncate">{card.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Last: {card.previous}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
