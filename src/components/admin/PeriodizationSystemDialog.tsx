import { useState } from "react";
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
  PERIODIZATION_84DAY,
  FORMATS_BY_CATEGORY,
  CYCLE_START_DATE,
  getWODInfoForDate,
  getDifficultyBadgeClass
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

  // Get today's and tomorrow's info
  const todayDateStr = format(new Date(), "yyyy-MM-dd");
  const tomorrowDateStr = format(addDays(new Date(), 1), "yyyy-MM-dd");
  const todayInfo = getWODInfoForDate(todayDateStr);
  const tomorrowInfo = getWODInfoForDate(tomorrowDateStr);

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
            WOD Periodization System (84-Day Cycle)
          </DialogTitle>
          <DialogDescription>
            Simple 84-day cycle: Day 1 to Day 84, then restart. No complex rotation.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="periodization" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="periodization">84-Day Cycle</TabsTrigger>
            <TabsTrigger value="formats">Formats</TabsTrigger>
            <TabsTrigger value="state">Current State</TabsTrigger>
            <TabsTrigger value="overrides">Overrides</TabsTrigger>
          </TabsList>

          {/* 84-Day Cycle Tab */}
          <TabsContent value="periodization" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  84-Day Periodization Cycle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg mb-4">
                  <p className="text-sm text-green-400">
                    <strong>✓ Simple 84-Day Cycle:</strong> Day 1 to Day 84, then restart from Day 1.
                    <br />
                    Reference: <code className="bg-muted px-1 rounded">{CYCLE_START_DATE}</code> = Day 1 (CARDIO/Beginner)
                    <br />
                    <span className="text-yellow-400">★ Today: Day {todayInfo.dayIn84}/84 - {todayInfo.category}</span>
                  </p>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-3 mb-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-yellow-500/30 border border-yellow-500/50"></div>
                    <span>Strength Day</span>
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
                        <TableHead className="w-20">Day</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Focus</TableHead>
                        <TableHead>Difficulty</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {PERIODIZATION_84DAY.map((entry) => {
                        const isToday = entry.day === todayInfo.dayIn84;
                        const isTomorrow = entry.day === tomorrowInfo.dayIn84;
                        const isRecovery = entry.category === "RECOVERY";
                        const isStrength = entry.category === "STRENGTH";
                        
                        return (
                          <TableRow 
                            key={entry.day} 
                            className={`
                              ${isTomorrow ? "bg-primary/10" : ""}
                              ${isToday ? "bg-blue-500/10" : ""}
                              ${isRecovery ? "bg-green-500/5" : ""}
                              ${isStrength && !isToday && !isTomorrow ? "bg-yellow-500/5" : ""}
                            `}
                          >
                            <TableCell className="font-bold text-primary">Day {entry.day}</TableCell>
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
                              {entry.strengthFocus ? (
                                <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                                  {entry.strengthFocus}
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

                <p className="text-sm text-muted-foreground mt-3">
                  The cycle repeats every 84 days. Recovery days (10, 28, 38, 56, 66, 84) have no difficulty level.
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
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-green-400" />
                    <p className="text-sm font-medium text-green-400">84-Day Cycle Status</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-2 bg-background/50 rounded">
                      <p className="text-xs text-muted-foreground">Today ({todayDateStr})</p>
                      <p className="font-bold">Day {todayInfo.dayIn84}/84</p>
                      <Badge variant="secondary" className="mt-1 text-xs">{todayInfo.category}</Badge>
                    </div>
                    <div className="p-2 bg-background/50 rounded">
                      <p className="text-xs text-muted-foreground">Tomorrow ({tomorrowDateStr})</p>
                      <p className="font-bold">Day {tomorrowInfo.dayIn84}/84</p>
                      <Badge variant="secondary" className="mt-1 text-xs">{tomorrowInfo.category}</Badge>
                    </div>
                    <div className="p-2 bg-background/50 rounded">
                      <p className="text-xs text-muted-foreground">Today's Difficulty</p>
                      {todayInfo.difficulty.level ? (
                        <Badge className={`mt-1 ${getDifficultyBadgeClass(todayInfo.difficulty.level)}`}>
                          {todayInfo.difficulty.level}
                        </Badge>
                      ) : (
                        <p className="font-bold text-muted-foreground">Recovery</p>
                      )}
                    </div>
                    <div className="p-2 bg-background/50 rounded">
                      <p className="text-xs text-muted-foreground">Tomorrow's Difficulty</p>
                      {tomorrowInfo.difficulty.level ? (
                        <Badge className={`mt-1 ${getDifficultyBadgeClass(tomorrowInfo.difficulty.level)}`}>
                          {tomorrowInfo.difficulty.level}
                        </Badge>
                      ) : (
                        <p className="font-bold text-muted-foreground">Recovery</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleClearFormatUsage}
                    disabled={isSaving}
                  >
                    Clear Format Usage Tracking
                  </Button>
                </div>

                {/* Format Usage */}
                {wodState?.format_usage && Object.keys(wodState.format_usage as Record<string, any>).length > 0 && (
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm font-medium mb-2">Tracked Format Usage:</p>
                    <div className="text-xs text-muted-foreground font-mono">
                      {JSON.stringify(wodState.format_usage, null, 2)}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Overrides Tab */}
          <TabsContent value="overrides" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Manual Overrides</CardTitle>
              </CardHeader>
              <CardContent>
                {wodState?.manual_overrides && Object.keys(wodState.manual_overrides as Record<string, any>).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(wodState.manual_overrides as Record<string, any>).map(([date, override]) => (
                      <div key={date} className="p-2 bg-muted/30 rounded flex justify-between items-center">
                        <div>
                          <span className="font-medium">{date}</span>
                          <span className="text-muted-foreground ml-2">→ {override.category || 'Custom'}</span>
                        </div>
                        <Badge variant="outline">Override Active</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No manual overrides configured.</p>
                )}
                <p className="text-xs text-muted-foreground mt-4">
                  Set overrides in the WOD Schedule Preview section.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
