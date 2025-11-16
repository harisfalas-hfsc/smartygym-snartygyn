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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        {[...Array(6)].map((_, i) => (
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
      title: "Programs in Progress",
      value: ongoingProgramsCount,
      icon: TrendingUp,
      color: "text-orange-500",
    },
    {
      title: "PT Days",
      value: stats.ptDaysThisMonth,
      icon: User,
      color: "text-purple-500",
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
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
