import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Star, Dumbbell, Info, Settings, RotateCcw, Save, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

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

// Difficulty pattern
const DIFFICULTY_PATTERN_BASE = [
  { level: "Intermediate", range: "3-4★" },
  { level: "Advanced", range: "5-6★" },
  { level: "Beginner", range: "1-2★" },
  { level: "Advanced", range: "5-6★" },
  { level: "Intermediate", range: "3-4★" },
  { level: "Beginner", range: "1-2★" },
  { level: "Advanced", range: "5-6★" }
];

// Format rules by category
const FORMATS_BY_CATEGORY: Record<string, string[]> = {
  "STRENGTH": ["REPS & SETS"],
  "MOBILITY & STABILITY": ["REPS & SETS"],
  "CARDIO": ["CIRCUIT", "EMOM", "FOR TIME", "AMRAP", "TABATA"],
  "METABOLIC": ["CIRCUIT", "AMRAP", "EMOM", "FOR TIME", "TABATA"],
  "CALORIE BURNING": ["CIRCUIT", "TABATA", "AMRAP", "FOR TIME", "EMOM"],
  "CHALLENGE": ["CIRCUIT", "TABATA", "AMRAP", "EMOM", "FOR TIME", "MIX"]
};

import type { Json } from "@/integrations/supabase/types";

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

  const dayInCycle = wodState ? (wodState.day_count % 7) + 1 : 1;
  const weekNumber = wodState?.week_number || Math.floor((wodState?.day_count || 0) / 7) + 1;

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

      toast.success("Periodization updated", {
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

  const handleResetToDay = async (targetDay: number) => {
    if (!wodState?.id) return;
    
    const newDayCount = targetDay - 1; // Day 1 = day_count 0
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("workout_of_day_state")
        .update({
          day_count: newDayCount,
          updated_at: new Date().toISOString()
        })
        .eq("id", wodState.id);

      if (error) throw error;

      toast.success(`Reset to Day ${targetDay}`, {
        description: `Next WOD will be ${CATEGORY_CYCLE_7DAY[newDayCount % 7]}`
      });
      
      queryClient.invalidateQueries({ queryKey: ["wod-state"] });
    } catch (error: any) {
      toast.error("Failed to reset", { description: error.message });
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
  const previewDayInCycle = (editDayCount % 7) + 1;
  const previewCategory = CATEGORY_CYCLE_7DAY[editDayCount % 7];
  
  // Calculate shifted pattern for current week
  const shiftAmount = (weekNumber - 1) % 7;
  const getShiftedDifficulty = (dayIndex: number) => {
    const shiftedIndex = (dayIndex + shiftAmount) % 7;
    return DIFFICULTY_PATTERN_BASE[shiftedIndex];
  };

  const getDifficultyColor = (level: string) => {
    if (level === "Beginner") return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"; // Beginner = YELLOW
    if (level === "Intermediate") return "bg-green-500/20 text-green-400 border-green-500/30"; // Intermediate = GREEN
    return "bg-red-500/20 text-red-400 border-red-500/30"; // Advanced = RED
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
                  7-Day Category Cycle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Day</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {CATEGORY_CYCLE_7DAY.map((category, index) => (
                      <TableRow 
                        key={index} 
                        className={index + 1 === dayInCycle ? "bg-primary/10" : ""}
                      >
                        <TableCell className="font-medium">Day {index + 1}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{category}</Badge>
                        </TableCell>
                        <TableCell>
                          {index + 1 === dayInCycle ? (
                            <Badge className="bg-primary/20 text-primary border-primary/30">
                              Next WOD
                            </Badge>
                          ) : index + 1 < dayInCycle ? (
                            <span className="text-muted-foreground text-sm">Completed</span>
                          ) : (
                            <span className="text-muted-foreground text-sm">Upcoming</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <p className="text-sm text-muted-foreground mt-4">
                  The cycle repeats every 7 days. After Day 7 (CALORIE BURNING), it returns to Day 1 (CHALLENGE).
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
                  <p className="text-sm font-medium">Week {weekNumber} Pattern (shifted by {shiftAmount} positions)</p>
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
                          className={index + 1 === dayInCycle ? "bg-primary/10" : ""}
                        >
                          <TableCell className="font-medium">Day {index + 1}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getDifficultyColor(pattern.level)}>
                              {pattern.level} ({pattern.range})
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getDifficultyColor(shifted.level)}>
                              {shifted.level} ({shifted.range})
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
                    <li>Base pattern: Intermediate → Advanced → Beginner → Advanced → Intermediate → Beginner → Advanced</li>
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
                    <li><strong>STRENGTH</strong> and <strong>MOBILITY & STABILITY</strong> use ONLY "Reps & Sets" format</li>
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
                      Edit
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
                {isEditing ? (
                  <>
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                      <p className="text-sm text-yellow-400">
                        Changing these values will affect the WOD rotation. Use with caution.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Total Day Count</Label>
                        <Input
                          type="number"
                          min={0}
                          value={editDayCount}
                          onChange={(e) => setEditDayCount(parseInt(e.target.value) || 0)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Day in cycle: {previewDayInCycle}/7 → {previewCategory}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label>Week Number</Label>
                        <Input
                          type="number"
                          min={1}
                          value={editWeekNumber}
                          onChange={(e) => setEditWeekNumber(parseInt(e.target.value) || 1)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Affects difficulty pattern shift
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground">Total Day Count</p>
                      <p className="text-xl font-bold">{wodState?.day_count || 0}</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground">Day in Cycle</p>
                      <p className="text-xl font-bold">{dayInCycle} / 7</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground">Week Number</p>
                      <p className="text-xl font-bold">{weekNumber}</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground">Next Category</p>
                      <Badge variant="secondary" className="mt-1">
                        {CATEGORY_CYCLE_7DAY[(wodState?.day_count || 0) % 7]}
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Quick Reset Buttons */}
                <div className="p-3 bg-muted/30 rounded-lg space-y-3">
                  <p className="text-sm font-medium">Quick Actions:</p>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                      <Button
                        key={day}
                        variant="outline"
                        size="sm"
                        onClick={() => handleResetToDay(day)}
                        disabled={isSaving}
                        className="text-xs"
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Reset to Day {day}
                      </Button>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-border/50">
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
                    <li>They do NOT break the rotation system</li>
                    <li>The day count continues to increment normally</li>
                    <li>After an override, the next day resumes normal rotation</li>
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
                    To add a manual override, update the <code className="bg-muted px-1 rounded">manual_overrides</code> field 
                    in the <code className="bg-muted px-1 rounded">workout_of_day_state</code> table with a date key 
                    (YYYY-MM-DD format) and override settings.
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
