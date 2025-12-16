import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useWODState } from "@/hooks/useWODState";

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
  const { data: wodState, isLoading } = useWODState();

  if (isLoading || !wodState) {
    return (
      <Card className="mb-8 border border-border/50">
        <CardContent className="p-4">
          <div className="animate-pulse flex justify-around gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-1 h-24 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentDayCount = wodState.day_count;

  // Calculate yesterday, today, tomorrow
  const days = [
    { label: "Yesterday", dayCount: currentDayCount - 1, icon: ChevronLeft },
    { label: "Today", dayCount: currentDayCount, icon: null },
    { label: "Tomorrow", dayCount: currentDayCount + 1, icon: ChevronRight }
  ];

  return (
    <Card className="mb-8 border border-border/50">
      <CardContent className="p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-center mb-4">WOD Schedule</h2>
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {days.map((day, index) => {
            const dayInCycle = getDayInCycle(day.dayCount);
            const weekNumber = getWeekNumber(day.dayCount);
            const category = getCategoryForDay(dayInCycle);
            const difficulty = getDifficultyForDay(dayInCycle, weekNumber);
            const isToday = day.label === "Today";

            return (
              <div
                key={day.label}
                className={`rounded-lg p-3 sm:p-4 text-center transition-all ${
                  isToday
                    ? "bg-primary/10 border-2 border-primary shadow-md"
                    : "bg-muted/30 border border-border/50"
                }`}
              >
                {/* Day Label */}
                <div className={`text-xs sm:text-sm font-medium mb-2 ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                  {day.label}
                </div>

                {/* Category Badge */}
                <Badge className={`${getCategoryColor(category)} text-xs mb-2 px-2 py-1`}>
                  {category}
                </Badge>

                {/* Difficulty */}
                <div className="mt-2">
                  <Badge variant="outline" className={`${getDifficultyColor(difficulty.level)} text-xs px-2 py-0.5`}>
                    {difficulty.level}
                  </Badge>
                  <div className="flex items-center justify-center gap-0.5 mt-1">
                    {[...Array(6)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i >= difficulty.range[0] - 1 && i < difficulty.range[1]
                            ? "fill-primary text-primary"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground mt-1 block">
                    ({difficulty.range[0]}-{difficulty.range[1]}★)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
