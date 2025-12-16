import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { useWODState } from "@/hooks/useWODState";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, addDays } from "date-fns";

// 7-DAY CATEGORY CYCLE (same as admin WODSchedulePreview)
const CATEGORY_CYCLE_7DAY = [
  "CHALLENGE",
  "STRENGTH", 
  "CARDIO",
  "MOBILITY & STABILITY",
  "STRENGTH",
  "METABOLIC",
  "CALORIE BURNING"
];

// DIFFICULTY PATTERN BASE (same as admin WODSchedulePreview)
const DIFFICULTY_PATTERN_BASE = [
  { level: "Intermediate", range: [3, 4] },
  { level: "Advanced", range: [5, 6] },
  { level: "Beginner", range: [1, 2] },
  { level: "Advanced", range: [5, 6] },
  { level: "Intermediate", range: [3, 4] },
  { level: "Beginner", range: [1, 2] },
  { level: "Advanced", range: [5, 6] }
];

const getDayInCycle = (dayCount: number): number => ((dayCount - 1) % 7) + 1 || 7;
const getWeekNumber = (dayCount: number): number => Math.floor((dayCount - 1) / 7) + 1;

const getCategoryForDay = (dayInCycle: number): string => CATEGORY_CYCLE_7DAY[dayInCycle - 1];

const getDifficultyForDay = (dayInCycle: number, weekNumber: number): { level: string; range: [number, number] } => {
  const shiftAmount = (weekNumber - 1) % 7;
  const shiftedIndex = ((dayInCycle - 1) + shiftAmount) % 7;
  return {
    level: DIFFICULTY_PATTERN_BASE[shiftedIndex].level,
    range: DIFFICULTY_PATTERN_BASE[shiftedIndex].range as [number, number]
  };
};

const getDifficultyColor = (level: string) => {
  switch (level) {
    case "Beginner":
      return "bg-green-500/20 text-green-600 border-green-500/30";
    case "Intermediate":
      return "bg-yellow-500/20 text-yellow-600 border-yellow-500/30";
    case "Advanced":
      return "bg-red-500/20 text-red-600 border-red-500/30";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    "STRENGTH": "bg-blue-500/90 text-white",
    "CARDIO": "bg-red-500/90 text-white",
    "CHALLENGE": "bg-purple-500/90 text-white",
    "MOBILITY & STABILITY": "bg-green-500/90 text-white",
    "METABOLIC": "bg-orange-500/90 text-white",
    "CALORIE BURNING": "bg-pink-500/90 text-white"
  };
  return colors[category] || "bg-primary/90 text-primary-foreground";
};

export const WODScheduleInfo = () => {
  const { data: wodState, isLoading: stateLoading } = useWODState();

  // Fetch actual WODs for yesterday and today to get exact difficulty stars
  const { data: actualWods } = useQuery({
    queryKey: ["wod-schedule-actual"],
    queryFn: async () => {
      const today = new Date();
      const yesterday = subDays(today, 1);
      const todayStr = format(today, "yyyy-MM-dd");
      const yesterdayStr = format(yesterday, "yyyy-MM-dd");

      const { data, error } = await supabase
        .from("admin_workouts")
        .select("generated_for_date, difficulty_stars, difficulty, category")
        .eq("is_workout_of_day", true)
        .in("generated_for_date", [yesterdayStr, todayStr]);

      if (error) {
        console.error("Error fetching actual WODs:", error);
        return {};
      }

      // Create lookup by date
      const lookup: Record<string, { stars: number | null; difficulty: string | null; category: string | null }> = {};
      data?.forEach(wod => {
        if (wod.generated_for_date) {
          lookup[wod.generated_for_date] = {
            stars: wod.difficulty_stars,
            difficulty: wod.difficulty,
            category: wod.category
          };
        }
      });
      return lookup;
    },
    staleTime: 5 * 60 * 1000,
  });

  if (stateLoading || !wodState) {
    return (
      <Card className="mb-8 bg-gradient-to-br from-primary/5 via-background to-primary/5 border-2 border-primary/40">
        <CardContent className="p-4">
          <div className="animate-pulse flex justify-around gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-1 h-16 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentDayCount = wodState.day_count;
  const today = new Date();
  const yesterday = subDays(today, 1);
  const tomorrow = addDays(today, 1);

  const todayStr = format(today, "yyyy-MM-dd");
  const yesterdayStr = format(yesterday, "yyyy-MM-dd");

  // Calculate schedule data for each day
  const days = [
    { label: "Yesterday", dayCount: currentDayCount - 1, dateStr: yesterdayStr },
    { label: "Today", dayCount: currentDayCount, dateStr: todayStr },
    { label: "Tomorrow", dayCount: currentDayCount + 1, dateStr: null } // Tomorrow not generated yet
  ];

  // Get card styling based on day
  const getDayCardStyle = (label: string) => {
    switch (label) {
      case "Yesterday":
        return "bg-green-500/10 dark:bg-green-500/20 border-2 border-green-500 shadow-md";
      case "Today":
        return "bg-primary/10 dark:bg-primary/20 border-2 border-primary shadow-md";
      case "Tomorrow":
        return "bg-amber-500/10 dark:bg-amber-500/20 border-2 border-amber-500 shadow-md";
      default:
        return "bg-muted/30 border border-border/50";
    }
  };

  // Get day label text color based on day
  const getDayLabelColor = (label: string) => {
    switch (label) {
      case "Yesterday":
        return "text-green-600 dark:text-green-400";
      case "Today":
        return "text-primary";
      case "Tomorrow":
        return "text-amber-600 dark:text-amber-400";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Card className="mb-8 bg-gradient-to-br from-primary/5 via-background to-primary/5 border-2 border-primary/40">
      <CardContent className="p-4">
        <h2 className="text-lg font-bold text-center mb-3">WOD Schedule</h2>
        {/* Stack on mobile, 3 columns on sm+ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {days.map((day) => {
            const dayInCycle = getDayInCycle(day.dayCount);
            const weekNumber = getWeekNumber(day.dayCount);
            const scheduledCategory = getCategoryForDay(dayInCycle);
            const scheduledDifficulty = getDifficultyForDay(dayInCycle, weekNumber);
            const isTomorrow = day.label === "Tomorrow";

            // Get actual data from database for yesterday and today
            const actualData = day.dateStr ? actualWods?.[day.dateStr] : null;
            const category = actualData?.category || scheduledCategory;
            const difficultyLevel = actualData?.difficulty || scheduledDifficulty.level;
            const exactStars = actualData?.stars;

            return (
              <div
                key={day.label}
                className={`rounded-lg p-3 text-center transition-all ${getDayCardStyle(day.label)}`}
              >
                {/* Day Label + Difficulty + Stars on one line */}
                <div className={`text-xs font-medium mb-1.5 ${getDayLabelColor(day.label)}`}>
                  <span className="font-semibold">{day.label}</span>
                  <span className="mx-1">•</span>
                  <span className={`${
                    difficultyLevel === "Beginner" ? "text-green-600 dark:text-green-400" :
                    difficultyLevel === "Intermediate" ? "text-yellow-600 dark:text-yellow-400" :
                    difficultyLevel === "Advanced" ? "text-red-600 dark:text-red-400" : ""
                  }`}>
                    {difficultyLevel}
                  </span>
                  <span className="ml-1">
                    {isTomorrow ? (
                      <span className="text-muted-foreground">({scheduledDifficulty.range[0]}-{scheduledDifficulty.range[1]}★)</span>
                    ) : exactStars ? (
                      <span className={getDayLabelColor(day.label)}>{exactStars}★</span>
                    ) : (
                      <span className="text-muted-foreground">({scheduledDifficulty.range[0]}-{scheduledDifficulty.range[1]}★)</span>
                    )}
                  </span>
                </div>

                {/* Category Badge */}
                <Badge className={`${getCategoryColor(category)} text-xs px-2 py-0.5`}>
                  {category}
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};