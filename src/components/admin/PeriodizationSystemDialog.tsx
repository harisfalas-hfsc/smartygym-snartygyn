import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Dumbbell, Info, Settings, CalendarDays, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { format, addDays } from "date-fns";
import type { Json } from "@/integrations/supabase/types";
import {
  PERIODIZATION_28DAY,
  FORMATS_BY_CATEGORY,
  CYCLE_START_DATE,
  getWODInfoForDate,
  getDifficultyBadgeClass,
  STRENGTH_DAY_FOCUS,
  STRENGTH_84DAY_ROTATION
} from "@/lib/wodCycle";

interface PeriodizationSystemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wodState: {
    id: string;
    day_count: number;
    week_number?: number | null;
    used_stars_in_week?: Json | null;
    manual_overrides?: Json | null;
    format_usage?: Json | null;
  } | null;
}

export const PeriodizationSystemDialog = ({ 
  open, 
  onOpenChange, 
  wodState 
}: PeriodizationSystemDialogProps) => {
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  // Get today's and tomorrow's date-based info (source of truth)
  const todayDateStr = format(new Date(), "yyyy-MM-dd");
  const tomorrowDateStr = format(addDays(new Date(), 1), "yyyy-MM-dd");
  const todayInfo = getWODInfoForDate(todayDateStr);
  const tomorrowInfo = getWODInfoForDate(tomorrowDateStr);

  // Generate full 84-day super-cycle with Strength rotation
  const PERIODIZATION_84DAY = useMemo(() => {
    const fullCycle: Array<{
      globalDay: number;
      dayInCycle: number;
      cycle: number;
      category: string;
      difficulty: string | null;
      difficultyStars: [number, number] | null;
      focus?: string;
    }> = [];

    for (let cycle = 1; cycle <= 3; cycle++) {
      for (let day = 1; day <= 28; day++) {
        const base = PERIODIZATION_28DAY[day - 1];
        const globalDay = (cycle - 1) * 28 + day;

        // For Strength days, apply the 84-day rotation
        let difficulty = base.difficulty;
        let difficultyStars = base.difficultyStars;

        if (base.category === "STRENGTH" && STRENGTH_84DAY_ROTATION[day]) {
          const rotationIndex = (cycle - 1) % 3;
          const rotation = STRENGTH_84DAY_ROTATION[day][rotationIndex];
          difficulty = rotation.difficulty;
          difficultyStars = rotation.stars;
        }

        fullCycle.push({
          globalDay,
          dayInCycle: day,
          cycle,
          category: base.category,
          difficulty,
          difficultyStars,
          focus: base.category === "STRENGTH" ? STRENGTH_DAY_FOCUS[day]?.focus : undefined
        });
      }
    }
    return fullCycle;
  }, []);

  // Calculate global day for today and tomorrow
  const todayGlobalDay = ((todayInfo.cycleNumber - 1) % 3) * 28 + todayInfo.dayInCycle;
  const tomorrowGlobalDay = ((tomorrowInfo.cycleNumber - 1) % 3) * 28 + tomorrowInfo.dayInCycle;

  const handleClearFormatUsage = async () => {
    if (!wodState?.id) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("workout_of_day_state")
        .update({
          format_usage: {},
          updated_at: new Date().toISOString()
        })
        .eq("id", wodState.id);

      if (error) throw error;

      toast.success("Format usage cleared");
      queryClient.invalidateQueries({ queryKey: ["wod-state"] });
    } catch (error: any) {
      toast.error("Failed to clear", { description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            WOD Periodization System (84-Day Super-Cycle)
          </DialogTitle>
          <DialogDescription>
            Complete 84-day super-cycle with Strength difficulty rotation across 3 cycles
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="periodization" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="periodization">84-Day Cycle</TabsTrigger>
            <TabsTrigger value="formats">Formats</TabsTrigger>
            <TabsTrigger value="state">Current State</TabsTrigger>
            <TabsTrigger value="overrides">Overrides</TabsTrigger>
          </TabsList>

          {/* 84-Day Super-Cycle Tab */}
          <TabsContent value="periodization" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  84-Day Super-Cycle Periodization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg mb-4">
                  <p className="text-sm text-green-400">
                    <strong>✓ 84-Day Super-Cycle:</strong> 3 × 28-day cycles with Strength difficulty rotation.
                    <br />
                    <span className="text-yellow-400">★ Strength Days (2, 5, 12, 15, 20, 23):</span> Difficulty rotates every 28 days through Beginner → Intermediate → Advanced.
                    <br />
                    Reference: <code className="bg-muted px-1 rounded">{CYCLE_START_DATE}</code> = Day 1 (CARDIO/Beginner)
                  </p>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-3 mb-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-yellow-500/30 border border-yellow-500/50"></div>
                    <span>Strength Day (rotating difficulty)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-green-500/30 border border-green-500/50"></div>
                    <span>Recovery Day</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-blue-500/30 border border-blue-500/50"></div>
                    <span>Today</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-primary/30 border border-primary/50"></div>
                    <span>Tomorrow</span>
                  </div>
                </div>
                
                <div className="max-h-[500px] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-10">
                      <TableRow>
                        <TableHead className="w-16">Day</TableHead>
                        <TableHead className="w-16">Cycle</TableHead>
                        <TableHead className="w-20">Day 1-28</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Focus</TableHead>
                        <TableHead>Difficulty</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {PERIODIZATION_84DAY.map((entry) => {
                        const isToday = entry.globalDay === todayGlobalDay;
                        const isTomorrow = entry.globalDay === tomorrowGlobalDay;
                        const isRecovery = entry.category === "RECOVERY";
                        const isStrength = entry.category === "STRENGTH";
                        
                        return (
                          <TableRow 
                            key={entry.globalDay} 
                            className={`
                              ${isTomorrow ? "bg-primary/10" : ""}
                              ${isToday ? "bg-blue-500/10" : ""}
                              ${isRecovery ? "bg-green-500/5" : ""}
                              ${isStrength && !isToday && !isTomorrow ? "bg-yellow-500/5" : ""}
                            `}
                          >
                            <TableCell className="font-bold text-primary">Day {entry.globalDay}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                C{entry.cycle}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {entry.dayInCycle}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant="secondary" 
                                className={`flex items-center gap-1 w-fit ${isStrength ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" : ""}`}
                              >
                                {isRecovery && <Heart className="h-3 w-3" />}
                                {entry.category}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {entry.focus ? (
                                <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                                  {entry.focus}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground text-sm">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {entry.difficulty ? (
                                <Badge variant="outline" className={getDifficultyBadgeClass(entry.difficulty)}>
                                  {entry.difficulty} ({entry.difficultyStars?.[0]}-{entry.difficultyStars?.[1]}★)
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                                  No Level
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {isToday ? (
                                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                                  Today
                                </Badge>
                              ) : isTomorrow ? (
                                <Badge className="bg-primary/20 text-primary border-primary/30">
                                  Tomorrow
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground text-sm">—</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="mt-4 p-3 bg-muted/30 rounded-lg space-y-2">
                  <p className="text-sm font-medium">Strength Day Rotation Pattern:</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    <div><strong>Day 2 (Lower Body):</strong> Adv → Int → Beg</div>
                    <div><strong>Day 5 (Upper Body):</strong> Int → Beg → Adv</div>
                    <div><strong>Day 12 (Full Body):</strong> Adv → Beg → Int</div>
                    <div><strong>Day 15 (Push/Pull):</strong> Beg → Adv → Int</div>
                    <div><strong>Day 20 (Pull/Push):</strong> Int → Beg → Adv</div>
                    <div><strong>Day 23 (Core/Glutes):</strong> Adv → Int → Beg</div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mt-3">
                  The super-cycle repeats every 84 days. Non-Strength categories maintain fixed difficulty.
                  Days 10, 28, 38, 56, 66, and 84 are recovery days.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Format Rules Tab */}
          <TabsContent value="formats" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Dumbbell className="h-4 w-4" />
                  Format Rules by Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Allowed Formats</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(FORMATS_BY_CATEGORY).map(([category, formats]) => (
                      <TableRow key={category}>
                        <TableCell>
                          <Badge variant="secondary">{category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {formats.map((fmt) => (
                              <Badge 
                                key={fmt} 
                                variant="outline" 
                                className={formats.length === 1 ? "border-yellow-500/50 text-yellow-400" : ""}
                              >
                                {fmt}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="p-3 bg-muted/30 rounded-lg mt-4 space-y-2">
                  <p className="text-sm font-medium">Format Rules:</p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                    <li><strong>STRENGTH</strong>, <strong>MOBILITY & STABILITY</strong>, and <strong>PILATES</strong> use ONLY "Reps & Sets" format</li>
                    <li>Other categories: AI selects format intelligently based on category requirements</li>
                    <li>Format usage is tracked to ensure variety across days</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Current State Tab */}
          <TabsContent value="state" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Current System State
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Calendar-derived source of truth */}
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-green-400" />
                    <p className="text-sm font-medium text-green-400">Calendar-Derived (Source of Truth)</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-2 bg-background/50 rounded">
                      <p className="text-xs text-muted-foreground">Today ({todayDateStr})</p>
                      <p className="font-bold">Day {todayInfo.dayInCycle}/28</p>
                      <Badge variant="secondary" className="mt-1 text-xs">{todayInfo.category}</Badge>
                    </div>
                    <div className="p-2 bg-background/50 rounded">
                      <p className="text-xs text-muted-foreground">Tomorrow ({tomorrowDateStr})</p>
                      <p className="font-bold">Day {tomorrowInfo.dayInCycle}/28</p>
                      <Badge variant="secondary" className="mt-1 text-xs">{tomorrowInfo.category}</Badge>
                    </div>
                    <div className="p-2 bg-background/50 rounded">
                      <p className="text-xs text-muted-foreground">Current Cycle</p>
                      <p className="font-bold">Cycle {tomorrowInfo.cycleNumber}</p>
                    </div>
                    <div className="p-2 bg-background/50 rounded">
                      <p className="text-xs text-muted-foreground">Tomorrow's Difficulty</p>
                      {tomorrowInfo.difficulty.level ? (
                        <Badge className={`mt-1 text-xs ${getDifficultyBadgeClass(tomorrowInfo.difficulty.level)}`}>
                          {tomorrowInfo.difficulty.level} ({tomorrowInfo.difficulty.range?.[0]}-{tomorrowInfo.difficulty.range?.[1]}★)
                        </Badge>
                      ) : (
                        <Badge className="mt-1 text-xs bg-gray-500/20 text-gray-400">
                          Recovery Day
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="p-3 bg-muted/30 rounded-lg space-y-3">
                  <p className="text-sm font-medium">Quick Actions:</p>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearFormatUsage}
                      disabled={isSaving}
                    >
                      Clear Format Usage
                    </Button>
                  </div>
                </div>

                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm font-medium mb-2">Format Usage Tracking:</p>
                  <div className="flex flex-wrap gap-2">
                    {wodState?.format_usage && typeof wodState.format_usage === 'object' && !Array.isArray(wodState.format_usage) && Object.keys(wodState.format_usage).length > 0 ? (
                      Object.entries(wodState.format_usage as Record<string, unknown>).map(([category, formats]) => (
                        <div key={category} className="text-xs">
                          <Badge variant="outline" className="mr-1">{category}:</Badge>
                          <span className="text-muted-foreground">
                            {Array.isArray(formats) ? formats.join(', ') : String(formats)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No format usage tracked yet</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manual Overrides Tab */}
          <TabsContent value="overrides" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Manual Overrides
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-sm font-medium text-blue-400 mb-2">How Manual Overrides Work:</p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                    <li>Overrides only affect specific dates</li>
                    <li>They do NOT break the fixed 28-day cycle</li>
                    <li>After an override, the next day resumes normal calendar-based rotation</li>
                    <li>Use overrides for special occasions or theme days</li>
                  </ul>
                </div>

                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm font-medium mb-2">Active Overrides:</p>
                  {wodState?.manual_overrides && typeof wodState.manual_overrides === 'object' && !Array.isArray(wodState.manual_overrides) && Object.keys(wodState.manual_overrides).length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Override Settings</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(wodState.manual_overrides as Record<string, unknown>).map(([date, settings]) => (
                          <TableRow key={date}>
                            <TableCell>{date}</TableCell>
                            <TableCell>
                              <pre className="text-xs bg-muted p-2 rounded">
                                {JSON.stringify(settings, null, 2)}
                              </pre>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <span className="text-sm text-muted-foreground">No active overrides</span>
                  )}
                </div>

                <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-sm text-yellow-400">
                    To add a manual override, use the "Upcoming WOD Schedule" section in the WOD Manager 
                    or update the <code className="bg-muted px-1 rounded">manual_overrides</code> field directly.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
