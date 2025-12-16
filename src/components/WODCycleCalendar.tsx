import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Download, FileText, Flame, Star } from "lucide-react";
import { format, addDays } from "date-fns";

// 7-DAY CATEGORY CYCLE
const CATEGORY_CYCLE_7DAY = [
  "CHALLENGE",
  "STRENGTH", 
  "CARDIO",
  "MOBILITY & STABILITY",
  "STRENGTH",
  "METABOLIC",
  "CALORIE BURNING"
];

// DIFFICULTY PATTERN BASE
const DIFFICULTY_PATTERN_BASE = [
  { level: "Intermediate", range: [3, 4] },
  { level: "Advanced", range: [5, 6] },
  { level: "Beginner", range: [1, 2] },
  { level: "Advanced", range: [5, 6] },
  { level: "Intermediate", range: [3, 4] },
  { level: "Beginner", range: [1, 2] },
  { level: "Advanced", range: [5, 6] }
];

// Category colors for visual distinction
const CATEGORY_COLORS: Record<string, string> = {
  "CHALLENGE": "bg-purple-500/20 text-purple-400 border-purple-500/50",
  "STRENGTH": "bg-red-500/20 text-red-400 border-red-500/50",
  "CARDIO": "bg-blue-500/20 text-blue-400 border-blue-500/50",
  "MOBILITY & STABILITY": "bg-emerald-500/20 text-emerald-400 border-emerald-500/50",
  "METABOLIC": "bg-orange-500/20 text-orange-400 border-orange-500/50",
  "CALORIE BURNING": "bg-pink-500/20 text-pink-400 border-pink-500/50"
};

const DIFFICULTY_COLORS: Record<string, string> = {
  "Beginner": "bg-green-500/20 text-green-400 border-green-500/50",
  "Intermediate": "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
  "Advanced": "bg-red-500/20 text-red-400 border-red-500/50"
};

interface WODCycleCalendarProps {
  dayCount?: number;
  weekNumber?: number;
  showExport?: boolean;
  compact?: boolean;
}

const getDayInCycle = (dayCount: number): number => ((dayCount - 1) % 7) + 1 || 7;
const getWeekNumber = (dayCount: number): number => Math.floor(dayCount / 7) + 1;
const getCategoryForDay = (dayInCycle: number): string => CATEGORY_CYCLE_7DAY[dayInCycle - 1];

const getDifficultyForDay = (dayInCycle: number, weekNumber: number): { level: string; range: [number, number] } => {
  const shiftAmount = (weekNumber - 1) % 7;
  const shiftedIndex = ((dayInCycle - 1) + shiftAmount) % 7;
  return {
    level: DIFFICULTY_PATTERN_BASE[shiftedIndex].level,
    range: DIFFICULTY_PATTERN_BASE[shiftedIndex].range as [number, number]
  };
};

export const WODCycleCalendar = ({ 
  dayCount = 0, 
  weekNumber, 
  showExport = false,
  compact = false
}: WODCycleCalendarProps) => {
  const currentWeekNumber = weekNumber || getWeekNumber(dayCount);
  
  // Generate 7-day schedule starting from yesterday
  const schedule = [];
  for (let i = -1; i < 6; i++) {
    const offsetDayCount = dayCount + i;
    const dayInCycle = getDayInCycle(offsetDayCount);
    const weekNum = currentWeekNumber + Math.floor((offsetDayCount - 1) / 7) - Math.floor((dayCount - 1) / 7);
    
    const date = addDays(new Date(), i);
    const category = getCategoryForDay(dayInCycle);
    const difficultyInfo = getDifficultyForDay(dayInCycle, weekNum);
    
    schedule.push({
      date,
      dateStr: format(date, "yyyy-MM-dd"),
      dayLabel: format(date, "EEE"),
      dayNumber: format(date, "d"),
      monthLabel: format(date, "MMM"),
      dayInCycle,
      category,
      difficultyLevel: difficultyInfo.level,
      difficultyRange: difficultyInfo.range,
      isToday: i === 0
    });
  }

  // Export as CSV
  const handleExportCSV = () => {
    const headers = ["Date", "Day", "Category", "Difficulty Level", "Stars Range"];
    const rows = schedule.map(day => [
      format(day.date, "yyyy-MM-dd"),
      `Day ${day.dayInCycle}/7`,
      day.category,
      day.difficultyLevel,
      `${day.difficultyRange[0]}-${day.difficultyRange[1]}`
    ]);
    
    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `wod-schedule-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  // Export as PDF-like text
  const handleExportPDF = () => {
    const content = schedule.map(day => 
      `${format(day.date, "EEEE, MMMM d, yyyy")}\n` +
      `  Category: ${day.category}\n` +
      `  Difficulty: ${day.difficultyLevel} (${day.difficultyRange[0]}-${day.difficultyRange[1]}★)\n` +
      `  Cycle Position: Day ${day.dayInCycle}/7\n`
    ).join("\n");

    const fullContent = `SmartyGym WOD Periodization Schedule\n` +
      `Generated: ${format(new Date(), "MMMM d, yyyy 'at' h:mm a")}\n` +
      `Week Number: ${currentWeekNumber}\n\n` +
      `${"=".repeat(50)}\n\n` +
      content +
      `\n${"=".repeat(50)}\n\n` +
      `7-Day Category Cycle:\n` +
      CATEGORY_CYCLE_7DAY.map((cat, i) => `  Day ${i + 1}: ${cat}`).join("\n") +
      `\n\nDifficulty rotates weekly to ensure variety.`;

    const blob = new Blob([fullContent], { type: "text/plain;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `wod-schedule-${format(new Date(), "yyyy-MM-dd")}.txt`;
    link.click();
  };

  if (compact) {
    return (
      <div className="w-full overflow-x-auto">
        <div className="grid grid-cols-7 gap-1 sm:gap-2 min-w-[500px]">
          {schedule.map((day) => (
            <div
              key={day.dateStr}
              className={`rounded-lg p-2 sm:p-3 text-center border transition-all ${
                day.isToday 
                  ? "border-primary bg-primary/10 ring-2 ring-primary/30" 
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              {/* Date */}
              <div className="text-xs text-muted-foreground mb-1">
                {day.dayLabel}
              </div>
              <div className={`text-lg font-bold mb-2 ${day.isToday ? "text-primary" : ""}`}>
                {day.dayNumber}
              </div>
              
              {/* Category Badge */}
              <Badge 
                className={`${CATEGORY_COLORS[day.category]} text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 mb-1 w-full justify-center truncate`}
              >
                {day.category.split(" ")[0]}
              </Badge>
              
              {/* Difficulty Badge */}
              <Badge 
                className={`${DIFFICULTY_COLORS[day.difficultyLevel]} text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 w-full justify-center`}
              >
                {day.difficultyRange[0]}-{day.difficultyRange[1]}★
              </Badge>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-primary" />
            7-Day Periodization Cycle
          </CardTitle>
          
          {showExport && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-1" />
                CSV
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportPDF}>
                <FileText className="h-4 w-4 mr-1" />
                TXT
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {schedule.map((day) => (
            <div
              key={day.dateStr}
              className={`rounded-lg p-3 text-center border transition-all ${
                day.isToday 
                  ? "border-primary bg-primary/10 ring-2 ring-primary/30" 
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              {/* Date Header */}
              <div className="text-xs text-muted-foreground">
                {day.dayLabel}
              </div>
              <div className={`text-xl font-bold ${day.isToday ? "text-primary" : ""}`}>
                {day.dayNumber}
              </div>
              <div className="text-xs text-muted-foreground mb-2">
                {day.monthLabel}
              </div>
              
              {/* Category */}
              <Badge 
                className={`${CATEGORY_COLORS[day.category]} text-[10px] px-1.5 py-0.5 mb-1.5 w-full justify-center`}
              >
                <Flame className="h-2.5 w-2.5 mr-0.5" />
                <span className="truncate">{day.category.split("&")[0].trim()}</span>
              </Badge>
              
              {/* Difficulty */}
              <Badge 
                className={`${DIFFICULTY_COLORS[day.difficultyLevel]} text-[10px] px-1.5 py-0.5 w-full justify-center`}
              >
                <Star className="h-2.5 w-2.5 mr-0.5" />
                {day.difficultyLevel.substring(0, 3)}
              </Badge>
              
              {/* Cycle position */}
              <div className="text-[10px] text-muted-foreground mt-1.5">
                Day {day.dayInCycle}/7
              </div>
            </div>
          ))}
        </div>
        
        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground mb-2">Category Colors:</div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(CATEGORY_COLORS).map(([category, colorClass]) => (
              <Badge key={category} className={`${colorClass} text-[10px]`}>
                {category.split(" ")[0]}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
