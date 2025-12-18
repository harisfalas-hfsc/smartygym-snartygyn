import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Calendar, Edit2, Clock, Star, Flame, Save, Dumbbell, User } from "lucide-react";
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

// FORMAT RULES BY CATEGORY
const FORMATS_BY_CATEGORY: Record<string, string[]> = {
  "STRENGTH": ["REPS & SETS"],
  "MOBILITY & STABILITY": ["REPS & SETS"],
  "CARDIO": ["CIRCUIT", "EMOM", "FOR TIME", "AMRAP", "TABATA"],
  "METABOLIC": ["CIRCUIT", "AMRAP", "EMOM", "FOR TIME", "TABATA"],
  "CALORIE BURNING": ["CIRCUIT", "TABATA", "AMRAP", "FOR TIME", "EMOM"],
  "CHALLENGE": ["CIRCUIT", "TABATA", "AMRAP", "EMOM", "FOR TIME", "MIX"]
};

// Match backend formula exactly
const getDayInCycle = (dayCount: number): number => (dayCount % 7) + 1;
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

export const WODSchedulePreview = () => {
  const queryClient = useQueryClient();
  const [overrideDialogOpen, setOverrideDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [overrideCategory, setOverrideCategory] = useState<string>("");
  const [overrideFormat, setOverrideFormat] = useState<string>("");
  const [overrideDifficulty, setOverrideDifficulty] = useState<string>("");

  // Fetch WOD state
  const { data: wodState, isLoading } = useQuery({
    queryKey: ["wod-state"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workout_of_day_state")
        .select("*")
        .limit(1)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  // Calculate next 7 days schedule
  // CRITICAL: day_count represents AFTER today's generation
  // So day_count already points to tomorrow's position in the cycle
  const getUpcomingSchedule = () => {
    if (!wodState) return [];
    
    const schedule = [];
    const currentDayCount = wodState.day_count || 0;
    const currentWeekNumber = wodState.week_number || getWeekNumber(currentDayCount);
    const manualOverrides = (wodState.manual_overrides as Record<string, any>) || {};
    
    for (let i = 0; i < 7; i++) {
      // i=0 is tomorrow (uses currentDayCount directly)
      // i=1 is day after tomorrow (currentDayCount + 1), etc.
      const futureDayCount = currentDayCount + i;
      const futureDayInCycle = getDayInCycle(futureDayCount);
      const futureWeekNumber = futureDayInCycle === 1 && i > 0 ? currentWeekNumber + 1 : currentWeekNumber;
      
      const futureDate = addDays(new Date(), i + 1); // i+1 because i=0 is tomorrow
      const dateStr = format(futureDate, "yyyy-MM-dd");
      
      const override = manualOverrides[dateStr];
      
      const category = override?.category || getCategoryForDay(futureDayInCycle);
      const difficultyInfo = getDifficultyForDay(futureDayInCycle, futureWeekNumber);
      const formats = FORMATS_BY_CATEGORY[category] || ["CIRCUIT"];
      
      schedule.push({
        date: futureDate,
        dateStr,
        dayInCycle: futureDayInCycle,
        category,
        difficultyLevel: override?.difficulty 
          ? (override.difficulty <= 2 ? "Beginner" : override.difficulty <= 4 ? "Intermediate" : "Advanced")
          : difficultyInfo.level,
        difficultyRange: difficultyInfo.range,
        formats,
        selectedFormat: override?.format || null,
        hasOverride: !!override
      });
    }
    
    return schedule;
  };

  const upcomingSchedule = getUpcomingSchedule();

  const handleOpenOverride = (dateStr: string, defaultCategory: string) => {
    setSelectedDate(dateStr);
    setOverrideCategory(defaultCategory);
    setOverrideFormat("");
    setOverrideDifficulty("");
    setOverrideDialogOpen(true);
  };

  const handleSaveOverride = async () => {
    if (!wodState || !selectedDate) return;
    
    try {
      const currentOverrides = (wodState.manual_overrides as Record<string, any>) || {};
      const newOverride: Record<string, any> = {};
      
      if (overrideCategory) newOverride.category = overrideCategory;
      if (overrideFormat) newOverride.format = overrideFormat;
      if (overrideDifficulty) newOverride.difficulty = parseInt(overrideDifficulty);
      
      const updatedOverrides = {
        ...currentOverrides,
        [selectedDate]: newOverride
      };
      
      const { error } = await supabase
        .from("workout_of_day_state")
        .update({ manual_overrides: updatedOverrides })
        .eq("id", wodState.id);
      
      if (error) throw error;
      
      toast.success("Override saved", {
        description: `WOD for ${selectedDate} will use custom settings`
      });
      
      queryClient.invalidateQueries({ queryKey: ["wod-state"] });
      setOverrideDialogOpen(false);
    } catch (error: any) {
      toast.error("Failed to save override", {
        description: error.message
      });
    }
  };

  const handleRemoveOverride = async (dateStr: string) => {
    if (!wodState) return;
    
    try {
      const currentOverrides = (wodState.manual_overrides as Record<string, any>) || {};
      const { [dateStr]: removed, ...remaining } = currentOverrides;
      
      const { error } = await supabase
        .from("workout_of_day_state")
        .update({ manual_overrides: remaining })
        .eq("id", wodState.id);
      
      if (error) throw error;
      
      toast.success("Override removed");
      queryClient.invalidateQueries({ queryKey: ["wod-state"] });
    } catch (error: any) {
      toast.error("Failed to remove override");
    }
  };

  const getDifficultyColor = (level: string) => {
    if (level === "Beginner") return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"; // Beginner = YELLOW
    if (level === "Intermediate") return "bg-green-500/20 text-green-400 border-green-500/30"; // Intermediate = GREEN
    return "bg-red-500/20 text-red-400 border-red-500/30"; // Advanced = RED
  };

  const availableFormats = overrideCategory ? FORMATS_BY_CATEGORY[overrideCategory] || ["CIRCUIT"] : [];

  if (isLoading) {
    return <Card><CardContent className="p-6">Loading schedule...</CardContent></Card>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-primary" />
            Upcoming WOD Schedule (Next 7 Days)
          </CardTitle>
          <CardDescription>
            <span className="block">Preview future WODs and set overrides. The "Day X/7" shows position in the 7-day category rotation cycle (not calendar days).</span>
            <span className="block mt-1 text-xs">💡 <strong>What is Day 1/7?</strong> The system rotates through 7 workout categories. Day 1 = Challenge, Day 2 = Strength, etc. This cycle repeats continuously.</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcomingSchedule.map((day, index) => (
            <div 
              key={day.dateStr}
              className={`p-4 rounded-lg border ${day.hasOverride ? 'border-primary/50 bg-primary/5' : 'border-border'}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {format(day.date, "EEEE, MMM d")}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      Day {day.dayInCycle}/7
                    </Badge>
                    {day.hasOverride && (
                      <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                        Override Set
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <Badge variant="secondary">
                      <Flame className="h-3 w-3 mr-1" />
                      {day.category}
                    </Badge>
                    <Badge variant="outline">
                      {day.selectedFormat || day.formats[0]} {!day.selectedFormat && day.formats.length > 1 && "(rotating)"}
                    </Badge>
                    <Badge className={getDifficultyColor(day.difficultyLevel)}>
                      <Star className="h-3 w-3 mr-1" />
                      {day.difficultyLevel} ({day.difficultyRange[0]}-{day.difficultyRange[1]}★)
                    </Badge>
                  </div>
                  
                  {/* Equipment/Bodyweight versions indicator */}
                  <div className="flex items-center gap-4 mt-2 pt-2 border-t border-border/50">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Dumbbell className="h-3 w-3" />
                      <span>With Equipment</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>Bodyweight</span>
                    </div>
                    <span className="text-xs text-muted-foreground/70 italic">
                      — Same settings for both versions
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {day.hasOverride && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleRemoveOverride(day.dateStr)}
                    >
                      Remove Override
                    </Button>
                  )}
                  <Button 
                    variant="default" 
                    size="sm"
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => handleOpenOverride(day.dateStr, day.category)}
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    {day.hasOverride ? "Edit Override" : "Set Override"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
          <p className="text-xs text-muted-foreground pt-2">
            <Clock className="h-3 w-3 inline mr-1" />
            WODs generate daily at 7:00 AM UTC. Overrides are applied during generation.
          </p>
        </CardContent>
      </Card>

      <Dialog open={overrideDialogOpen} onOpenChange={setOverrideDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Override WOD for {selectedDate}</DialogTitle>
            <DialogDescription>
              Customize the WOD settings for this day. This override will NOT affect the normal rotation sequence.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={overrideCategory} onValueChange={setOverrideCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_CYCLE_7DAY.filter((v, i, a) => a.indexOf(v) === i).map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Format</Label>
              <Select value={overrideFormat} onValueChange={setOverrideFormat} disabled={!overrideCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format (or leave for rotation)" />
                </SelectTrigger>
                <SelectContent>
                  {availableFormats.map(fmt => (
                    <SelectItem key={fmt} value={fmt}>{fmt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Available formats depend on category selection
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Difficulty (Stars)</Label>
              <Select value={overrideDifficulty} onValueChange={setOverrideDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty (or leave for rotation)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1★ - Beginner</SelectItem>
                  <SelectItem value="2">2★ - Beginner</SelectItem>
                  <SelectItem value="3">3★ - Intermediate</SelectItem>
                  <SelectItem value="4">4★ - Intermediate</SelectItem>
                  <SelectItem value="5">5★ - Advanced</SelectItem>
                  <SelectItem value="6">6★ - Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOverrideDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveOverride}>
              <Save className="h-4 w-4 mr-2" />
              Save Override
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
