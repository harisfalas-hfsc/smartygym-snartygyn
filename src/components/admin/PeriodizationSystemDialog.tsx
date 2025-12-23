import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Star, Dumbbell, Info, Settings, RotateCcw, Save, AlertTriangle, CalendarDays } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { format, addDays } from "date-fns";
import type { Json } from "@/integrations/supabase/types";
import {
  CATEGORY_CYCLE_8DAY,
  DIFFICULTY_PATTERN_BASE,
  FORMATS_BY_CATEGORY,
  CYCLE_START_DATE,
  getWODInfoForDate,
  getDifficultyForDay
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
  const [isEditing, setIsEditing] = useState(false);
  const [editDayCount, setEditDayCount] = useState<number>(0);
  const [editWeekNumber, setEditWeekNumber] = useState<number>(1);
  const [isSaving, setIsSaving] = useState(false);

  // Get today's and tomorrow's date-based info (source of truth)
  const todayDateStr = format(new Date(), "yyyy-MM-dd");
  const tomorrowDateStr = format(addDays(new Date(), 1), "yyyy-MM-dd");
  const todayInfo = getWODInfoForDate(todayDateStr);
  const tomorrowInfo = getWODInfoForDate(tomorrowDateStr);

  // Legacy counter-based values (for display only, not used for generation)
  const legacyDayInCycle = wodState ? (wodState.day_count % 8) + 1 : 1;
  const legacyWeekNumber = wodState?.week_number || Math.floor((wodState?.day_count || 0) / 8) + 1;

  const handleStartEdit = () => {
    setEditDayCount(wodState?.day_count || 0);
    setEditWeekNumber(wodState?.week_number || 1);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (!wodState?.id) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("workout_of_day_state")
        .update({
          day_count: editDayCount,
          week_number: editWeekNumber,
          updated_at: new Date().toISOString()
        })
        .eq("id", wodState.id);

      if (error) throw error;

      toast.success("Legacy counters updated", {
        description: `Day count: ${editDayCount}, Week: ${editWeekNumber}`
      });
      
      queryClient.invalidateQueries({ queryKey: ["wod-state"] });
      setIsEditing(false);
    } catch (error: any) {
      toast.error("Failed to update", { description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

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

  const handleResetWeekStars = async () => {
    if (!wodState?.id) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("workout_of_day_state")
        .update({
          used_stars_in_week: {},
          updated_at: new Date().toISOString()
        })
        .eq("id", wodState.id);

      if (error) throw error;

      toast.success("Week stars reset");
      queryClient.invalidateQueries({ queryKey: ["wod-state"] });
    } catch (error: any) {
      toast.error("Failed to reset", { description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  // Preview what the new settings would result in
  const previewDayInCycle = (editDayCount % 8) + 1;
  const previewCategory = CATEGORY_CYCLE_8DAY[editDayCount % 8];
  
  // Calculate shifted pattern for current week using calendar-based week
  const shiftAmount = (tomorrowInfo.weekNumber - 1) % 8;
  const getShiftedDifficulty = (dayIndex: number) => {
    const shiftedIndex = (dayIndex + shiftAmount) % 8;
    return DIFFICULTY_PATTERN_BASE[shiftedIndex];
  };

  const getDifficultyColor = (level: string) => {
    if (level === "Beginner") return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    if (level === "Intermediate") return "bg-green-500/20 text-green-400 border-green-500/30";
    return "bg-red-500/20 text-red-400 border-red-500/30";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            WOD Periodization System
          </DialogTitle>
          <DialogDescription>
            Complete view of the workout rotation, difficulty patterns, and format rules
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="category" className="mt-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="category">Category</TabsTrigger>
            <TabsTrigger value="difficulty">Difficulty</TabsTrigger>
            <TabsTrigger value="formats">Formats</TabsTrigger>
            <TabsTrigger value="state">Current State</TabsTrigger>
            <TabsTrigger value="overrides">Overrides</TabsTrigger>
          </TabsList>

          {/* Category Rotation Tab */}
          <TabsContent value="category" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  8-Day Category Cycle (Calendar-Anchored)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg mb-4">
                  <p className="text-sm text-green-400">
                    <strong>✓ Calendar-Anchored System:</strong> Categories are now determined by the calendar date, not counters. 
                    Reference: <code className="bg-muted px-1 rounded">{CYCLE_START_DATE}</code> = Day 1 (CHALLENGE)
                  </p>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Day</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {CATEGORY_CYCLE_8DAY.map((category, index) => (
                      <TableRow 
                        key={index} 
                        className={index + 1 === tomorrowInfo.dayInCycle ? "bg-primary/10" : ""}
                      >
                        <TableCell className="font-medium">Day {index + 1}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{category}</Badge>
                        </TableCell>
                        <TableCell>
                          {index + 1 === todayInfo.dayInCycle ? (
                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                              Today
                            </Badge>
                          ) : index + 1 === tomorrowInfo.dayInCycle ? (
                            <Badge className="bg-primary/20 text-primary border-primary/30">
                              Tomorrow's WOD
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <p className="text-sm text-muted-foreground mt-4">
                  The cycle repeats every 8 days. After Day 8 (PILATES), it returns to Day 1 (CHALLENGE).
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Difficulty Pattern Tab */}
          <TabsContent value="difficulty" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Difficulty Rotation with Weekly Shift
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium">Week {tomorrowInfo.weekNumber} Pattern (shifted by {shiftAmount} positions)</p>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Day</TableHead>
                      <TableHead>Base Pattern</TableHead>
                      <TableHead>This Week's Difficulty</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {DIFFICULTY_PATTERN_BASE.map((pattern, index) => {
                      const shifted = getShiftedDifficulty(index);
                      return (
                        <TableRow 
                          key={index}
                          className={index + 1 === tomorrowInfo.dayInCycle ? "bg-primary/10" : ""}
                        >
                          <TableCell className="font-medium">Day {index + 1}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getDifficultyColor(pattern.level)}>
                              {pattern.level} ({pattern.range[0]}-{pattern.range[1]}★)
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getDifficultyColor(shifted.level)}>
                              {shifted.level} ({shifted.range[0]}-{shifted.range[1]}★)
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                <div className="p-3 bg-muted/30 rounded-lg space-y-2">
                  <p className="text-sm font-medium">How Difficulty Rotation Works:</p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                    <li>Base pattern: Intermediate → Advanced → Beginner → Advanced → Intermediate → Beginner → Advanced → Intermediate</li>
                    <li>Each week, the pattern shifts by 1 position</li>
                    <li>This ensures categories don't always get the same difficulty</li>
                    <li>Within each range (e.g., 3-4★), stars alternate to prevent repetition</li>
                  </ul>
                </div>
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
                            {formats.map((format) => (
                              <Badge 
                                key={format} 
                                variant="outline" 
                                className={formats.length === 1 ? "border-yellow-500/50 text-yellow-400" : ""}
                              >
                                {format}
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
                    <li>Other categories rotate through multiple formats daily</li>
                    <li>Format usage is tracked to ensure variety</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Current State Tab */}
          <TabsContent value="state" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Current System State
                  </div>
                  {!isEditing ? (
                    <Button variant="outline" size="sm" onClick={handleStartEdit}>
                      <Settings className="h-3 w-3 mr-1" />
                      Edit Legacy Counters
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={handleCancelEdit} disabled={isSaving}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSaveEdit} disabled={isSaving}>
                        <Save className="h-3 w-3 mr-1" />
                        Save
                      </Button>
                    </div>
                  )}
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
                      <p className="font-bold">Day {todayInfo.dayInCycle}/8</p>
                      <Badge variant="secondary" className="mt-1 text-xs">{todayInfo.category}</Badge>
                    </div>
                    <div className="p-2 bg-background/50 rounded">
                      <p className="text-xs text-muted-foreground">Tomorrow ({tomorrowDateStr})</p>
                      <p className="font-bold">Day {tomorrowInfo.dayInCycle}/8</p>
                      <Badge variant="secondary" className="mt-1 text-xs">{tomorrowInfo.category}</Badge>
                    </div>
                    <div className="p-2 bg-background/50 rounded">
                      <p className="text-xs text-muted-foreground">Current Week</p>
                      <p className="font-bold">Week {tomorrowInfo.weekNumber}</p>
                    </div>
                    <div className="p-2 bg-background/50 rounded">
                      <p className="text-xs text-muted-foreground">Difficulty</p>
                      <Badge className={`mt-1 text-xs ${getDifficultyColor(tomorrowInfo.difficulty.level)}`}>
                        {tomorrowInfo.difficulty.level} ({tomorrowInfo.difficulty.range[0]}-{tomorrowInfo.difficulty.range[1]}★)
                      </Badge>
                    </div>
                  </div>
                </div>

                {isEditing ? (
                  <>
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                      <p className="text-sm text-yellow-400">
                        These are legacy counters. Categories are now determined by calendar date, not these values.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Total Day Count (Legacy)</Label>
                        <Input
                          type="number"
                          min={0}
                          value={editDayCount}
                          onChange={(e) => setEditDayCount(parseInt(e.target.value) || 0)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Legacy value: Day {previewDayInCycle}/8 → {previewCategory}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label>Week Number (Legacy)</Label>
                        <Input
                          type="number"
                          min={1}
                          value={editWeekNumber}
                          onChange={(e) => setEditWeekNumber(parseInt(e.target.value) || 1)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Used for internal tracking only
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm font-medium mb-2 text-muted-foreground">Legacy Counters (for reference only):</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-2 bg-background/50 rounded">
                        <p className="text-xs text-muted-foreground">Day Count</p>
                        <p className="text-lg font-bold text-muted-foreground">{wodState?.day_count || 0}</p>
                      </div>
                      <div className="p-2 bg-background/50 rounded">
                        <p className="text-xs text-muted-foreground">Legacy Day in Cycle</p>
                        <p className="text-lg font-bold text-muted-foreground">{legacyDayInCycle}/8</p>
                      </div>
                      <div className="p-2 bg-background/50 rounded">
                        <p className="text-xs text-muted-foreground">Legacy Week</p>
                        <p className="text-lg font-bold text-muted-foreground">{legacyWeekNumber}</p>
                      </div>
                    </div>
                  </div>
                )}

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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResetWeekStars}
                      disabled={isSaving}
                    >
                      Reset Week Stars
                    </Button>
                  </div>
                </div>

                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm font-medium mb-2">Used Stars This Week:</p>
                  <div className="flex flex-wrap gap-2">
                    {wodState?.used_stars_in_week && typeof wodState.used_stars_in_week === 'object' && !Array.isArray(wodState.used_stars_in_week) && Object.keys(wodState.used_stars_in_week).length > 0 ? (
                      Object.entries(wodState.used_stars_in_week as Record<string, boolean>).map(([star, used]) => (
                        used && (
                          <Badge key={star} variant="outline">
                            {star}★ used
                          </Badge>
                        )
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No stars used yet this week</span>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm font-medium mb-2">Format Usage Tracking:</p>
                  <div className="flex flex-wrap gap-2">
                    {wodState?.format_usage && typeof wodState.format_usage === 'object' && !Array.isArray(wodState.format_usage) && Object.keys(wodState.format_usage).length > 0 ? (
                      Object.entries(wodState.format_usage as Record<string, unknown>).map(([format, count]) => (
                        <Badge key={format} variant="outline">
                          {format}: {String(count)}x
                        </Badge>
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
                    <li>They do NOT break the calendar-based rotation</li>
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
