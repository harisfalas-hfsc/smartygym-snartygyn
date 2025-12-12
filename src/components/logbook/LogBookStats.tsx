import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, Calendar, User, Calculator, Flame, TrendingUp } from "lucide-react";
import { useActivityStats } from "@/hooks/useActivityLog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface LogBookStatsProps {
  userId: string;
}

export const LogBookStats = ({ userId }: LogBookStatsProps) => {
  const { stats, isLoading } = useActivityStats(userId);
  
  // Query for programs in progress
  const { data: ongoingProgramsCount = 0 } = useQuery({
    queryKey: ['ongoing-programs', userId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('program_interactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_ongoing', true);
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2 p-3 sm:p-4">
              <div className="h-4 bg-muted rounded w-20" />
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="h-7 bg-muted rounded w-12" />
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
      title: "Programs in Progress",
      value: ongoingProgramsCount,
      icon: TrendingUp,
      color: "text-orange-500",
    },
    {
      title: "Tool Uses",
      value: stats.toolCalculationsThisMonth,
      icon: Calculator,
      color: "text-pink-500",
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
    <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
              <CardTitle className="text-xs sm:text-sm font-medium truncate pr-2">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 flex-shrink-0 ${stat.color}`} />
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="text-xl sm:text-2xl font-bold">
                {stat.value}
                {stat.suffix && <span className="text-xs sm:text-sm font-normal text-muted-foreground">{stat.suffix}</span>}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
