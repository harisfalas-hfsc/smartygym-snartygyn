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
import { Calendar, Edit2, Clock, Star, Flame, Save, Dumbbell, User, Heart } from "lucide-react";
import { format, addDays } from "date-fns";
import {
  ALL_CATEGORIES,
  FORMATS_BY_CATEGORY,
  getDayIn84Cycle,
  getPeriodizationForDay,
  getDifficultyBadgeClass
} from "@/lib/wodCycle";
import { utcToCyprus } from "@/lib/cyprusDate";

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

  // Fetch WOD auto-generation config for schedule time
  const { data: wodConfig } = useQuery({
    queryKey: ["wod-auto-gen-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wod_auto_generation_config")
        .select("*")
        .limit(1)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  // Calculate next 28 days schedule using 84-day cycle
  const getUpcomingSchedule = () => {
    if (!wodState) return [];
    
    const schedule = [];
    const manualOverrides = (wodState.manual_overrides as Record<string, any>) || {};
    
    for (let i = 0; i < 28; i++) {
      const futureDate = addDays(new Date(), i + 1);
      const dateStr = format(futureDate, "yyyy-MM-dd");
      
      // Get day in 84-day cycle
      const dayIn84 = getDayIn84Cycle(dateStr);
      const periodization = getPeriodizationForDay(dayIn84);
      
      const override = manualOverrides[dateStr];
      
      const category = override?.category || periodization.category;
      const difficultyLevel = override?.difficulty 
        ? (override.difficulty <= 2 ? "Beginner" : override.difficulty <= 4 ? "Intermediate" : "Advanced")
        : periodization.difficulty;
      const difficultyRange = periodization.difficultyStars;
      const formats = FORMATS_BY_CATEGORY[category] || ["CIRCUIT"];
      const isRecoveryDay = category === "RECOVERY";
      
      schedule.push({
        date: futureDate,
        dateStr,
        dayIn84,
        category,
        difficultyLevel,
        difficultyRange,
        formats,
        selectedFormat: override?.format || null,
        hasOverride: !!override,
        isRecoveryDay,
        strengthFocus: periodization.strengthFocus
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
            Upcoming WOD Schedule (84-Day Cycle)
          </CardTitle>
          <CardDescription>
            <span className="block">Preview future WODs and set overrides. Simple 84-day cycle - Day 1 to 84, then restart.</span>
            <span className="block mt-1 text-xs">💡 <strong>Days 10, 28, 38, 56, 66, 84 are RECOVERY days</strong> with no difficulty level.</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
          {upcomingSchedule.slice(0, 14).map((day) => (
            <div 
              key={day.dateStr}
              className={`p-4 rounded-lg border ${day.hasOverride ? 'border-primary/50 bg-primary/5' : day.isRecoveryDay ? 'border-green-500/30 bg-green-500/5' : 'border-border'}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {format(day.date, "EEEE, MMM d")}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      Day {day.dayIn84}/84
                    </Badge>
                    {day.hasOverride && (
                      <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                        Override Set
                      </Badge>
                    )}
                    {day.isRecoveryDay && (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                        <Heart className="h-3 w-3 mr-1" />
                        Recovery
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <Badge variant="secondary">
                      <Flame className="h-3 w-3 mr-1" />
                      {day.category}
                    </Badge>
                    {day.strengthFocus && (
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs">
                        {day.strengthFocus}
                      </Badge>
                    )}
                    <Badge variant="outline">
                      {day.selectedFormat || day.formats[0]} {!day.selectedFormat && day.formats.length > 1 && "(AI selected)"}
                    </Badge>
                    {day.difficultyLevel && day.difficultyRange ? (
                      <Badge className={getDifficultyBadgeClass(day.difficultyLevel)}>
                        <Star className="h-3 w-3 mr-1" />
                        {day.difficultyLevel} ({day.difficultyRange[0]}-{day.difficultyRange[1]}★)
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                        No Difficulty
                      </Badge>
                    )}
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
                      — Same category & difficulty for both
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
            {(() => {
              const utcHour = wodConfig?.generation_hour_utc ?? 22;
              const utcMinute = (wodConfig as any)?.generation_minute_utc ?? 30;
              const cyprusHour = utcToCyprus(utcHour);
              return `WODs generate daily at ${cyprusHour.toString().padStart(2, '0')}:${utcMinute.toString().padStart(2, '0')} Cyprus (${utcHour.toString().padStart(2, '0')}:${utcMinute.toString().padStart(2, '0')} UTC)`;
            })()}. Overrides are applied during generation. Showing first 14 days.
          </p>
        </CardContent>
      </Card>

      <Dialog open={overrideDialogOpen} onOpenChange={setOverrideDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Override WOD for {selectedDate}</DialogTitle>
            <DialogDescription>
              Customize the WOD settings for this day.
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
                  {ALL_CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Format</Label>
              <Select value={overrideFormat} onValueChange={setOverrideFormat} disabled={!overrideCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format (or leave for AI selection)" />
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
                  <SelectValue placeholder="Select difficulty (or leave for default)" />
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
