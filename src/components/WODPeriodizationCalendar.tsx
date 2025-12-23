import { format, subDays, addDays } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { getWODInfoForDate, getDifficultyBadgeClass } from "@/lib/wodCycle";

/**
 * Compact Periodization Calendar - Pure Calendar-Based (NO Database)
 * Shows Yesterday, Today, Tomorrow with category and difficulty level
 * Uses the 28-day fixed periodization cycle from wodCycle.ts
 */
const WODPeriodizationCalendar = () => {
  const today = new Date();
  const yesterday = subDays(today, 1);
  const tomorrow = addDays(today, 1);

  // Get WOD info for each day (pure calculation, no DB)
  const yesterdayStr = format(yesterday, "yyyy-MM-dd");
  const todayStr = format(today, "yyyy-MM-dd");
  const tomorrowStr = format(tomorrow, "yyyy-MM-dd");

  const yesterdayInfo = getWODInfoForDate(yesterdayStr);
  const todayInfo = getWODInfoForDate(todayStr);
  const tomorrowInfo = getWODInfoForDate(tomorrowStr);

  // Render a single day cell
  const renderDayCell = (
    label: string,
    dateStr: string,
    info: ReturnType<typeof getWODInfoForDate>,
    isToday: boolean = false
  ) => {
    const dayOfWeek = format(new Date(dateStr), "EEE");
    const dayNumber = format(new Date(dateStr), "d");
    const month = format(new Date(dateStr), "MMM");

    return (
      <div
        className={`flex flex-col items-center p-3 rounded-lg transition-all ${
          isToday
            ? "bg-primary/10 border-2 border-primary shadow-md"
            : "bg-muted/30 border border-border/50"
        }`}
      >
        {/* Day Label */}
        <div className="flex items-center gap-1 mb-1">
          {label === "Yesterday" && <ChevronLeft className="w-3 h-3 text-muted-foreground" />}
          <span className={`text-xs font-medium ${isToday ? "text-primary" : "text-muted-foreground"}`}>
            {label}
          </span>
          {label === "Tomorrow" && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
        </div>

        {/* Date */}
        <div className={`text-sm font-semibold ${isToday ? "text-primary" : "text-foreground"}`}>
          {dayOfWeek} {dayNumber} {month}
        </div>

        {/* Category */}
        <div className={`text-xs font-bold mt-2 text-center ${isToday ? "text-foreground" : "text-muted-foreground"}`}>
          {info.category}
        </div>

        {/* Difficulty Badge */}
        {info.isRecoveryDay ? (
          <Badge variant="outline" className="mt-1.5 text-[10px] px-2 py-0.5 bg-gray-500/10 text-gray-500 border-gray-400/30">
            Rest & Restore
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className={`mt-1.5 text-[10px] px-2 py-0.5 ${getDifficultyBadgeClass(info.difficulty.level)}`}
          >
            {info.difficulty.level}
            {info.difficulty.range && (
              <span className="ml-1 flex items-center gap-0.5">
                ({info.difficulty.range[0]}-{info.difficulty.range[1]}
                <Star className="w-2.5 h-2.5 fill-current" />)
              </span>
            )}
          </Badge>
        )}

        {/* Day in Cycle indicator */}
        <span className="text-[10px] text-muted-foreground/60 mt-1">
          Day {info.dayInCycle}/28
        </span>
      </div>
    );
  };

  return (
    <Card className="mb-6 border-border/50 bg-gradient-to-r from-muted/20 via-background to-muted/20">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">28-Day Training Cycle</h3>
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {renderDayCell("Yesterday", yesterdayStr, yesterdayInfo)}
          {renderDayCell("Today", todayStr, todayInfo, true)}
          {renderDayCell("Tomorrow", tomorrowStr, tomorrowInfo)}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-[10px]">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-muted-foreground">Beginner</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-muted-foreground">Intermediate</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-muted-foreground">Advanced</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-gray-400" />
            <span className="text-muted-foreground">Recovery</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WODPeriodizationCalendar;
