import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Trash2, Calculator, Scale, TrendingUp, Target, Plus, ChevronDown, CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { PageBreadcrumbs } from "@/components/PageBreadcrumbs";
import { useShowBackButton } from "@/hooks/useShowBackButton";
import { MeasurementDialog } from "@/components/logbook/MeasurementDialog";
import { MeasurementGoalDialog } from "@/components/logbook/MeasurementGoalDialog";
import { RecordDetailDialog } from "@/components/calculators/RecordDetailDialog";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, subMonths, subDays } from "date-fns";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";

interface OneRMRecord {
  id: string;
  created_at: string;
  weight_lifted: number;
  reps: number;
  one_rm_result: number;
  exercise_name: string | null;
}

interface BMRRecord {
  id: string;
  created_at: string;
  age: number;
  weight: number;
  height: number;
  gender: string;
  bmr_result: number;
}

interface CalorieRecord {
  id: string;
  created_at: string;
  age: number;
  weight: number;
  height: number;
  gender: string;
  activity_level: string;
  goal: string;
  maintenance_calories: number;
  target_calories: number;
}

interface MeasurementRecord {
  id: string;
  created_at: string;
  tool_result: {
    weight?: number;
    bodyFat?: number;
    muscleMass?: number;
  } | null;
}

interface MeasurementGoal {
  id: string;
  target_weight: number | null;
  target_body_fat: number | null;
  target_muscle_mass: number | null;
  target_date: string | null;
}

type MeasurementData = {
  id: string;
  created_at: string;
  tool_result: unknown;
};

type RecordType = "1rm" | "bmr" | "macro" | "measurement";

// Predefined exercises list for 1RM Calculator
const EXERCISES = [
  "Bench Press",
  "Back Squats",
  "Deadlifts",
  "Bulgarian Split Squats, Right Leg",
  "Bulgarian Split Squats, Left Leg",
  "Shoulder Press, Right Arm",
  "Shoulder Press, Left Arm",
  "Military Presses",
  "Single Leg RDL, Right Leg",
  "Single Leg RDL, Left Leg",
  "Barbell Bicep Curls",
  "Concentrated Bicep Curls, Right Arm",
  "Concentrated Bicep Curls, Left Arm"
] as const;

// Measurement types for filter
const MEASUREMENT_TYPES = ["Weight", "Body Fat", "Muscle Mass"] as const;

// Exercise colors for multi-line chart
const EXERCISE_COLORS: Record<string, string> = {
  "Bench Press": "hsl(195, 82%, 55%)",
  "Back Squats": "hsl(142, 71%, 45%)",
  "Deadlifts": "hsl(24, 95%, 53%)",
  "Bulgarian Split Squats, Right Leg": "hsl(262, 83%, 58%)",
  "Bulgarian Split Squats, Left Leg": "hsl(280, 87%, 65%)",
  "Shoulder Press, Right Arm": "hsl(43, 96%, 56%)",
  "Shoulder Press, Left Arm": "hsl(45, 93%, 47%)",
  "Military Presses": "hsl(173, 80%, 40%)",
  "Single Leg RDL, Right Leg": "hsl(340, 75%, 55%)",
  "Single Leg RDL, Left Leg": "hsl(330, 65%, 45%)",
  "Barbell Bicep Curls": "hsl(210, 70%, 50%)",
  "Concentrated Bicep Curls, Right Arm": "hsl(16, 85%, 45%)",
  "Concentrated Bicep Curls, Left Arm": "hsl(10, 78%, 54%)",
};

// Stroke dash patterns for line differentiation
const EXERCISE_STROKE_PATTERNS: Record<string, string> = {
  "Bench Press": "0",
  "Back Squats": "8 4",
  "Deadlifts": "4 4",
  "Bulgarian Split Squats, Right Leg": "12 4",
  "Bulgarian Split Squats, Left Leg": "12 4 4 4",
  "Shoulder Press, Right Arm": "2 2",
  "Shoulder Press, Left Arm": "6 2 2 2",
  "Military Presses": "16 4",
  "Single Leg RDL, Right Leg": "8 2",
  "Single Leg RDL, Left Leg": "8 2 4 2",
  "Barbell Bicep Curls": "4 8",
  "Concentrated Bicep Curls, Right Arm": "10 2 2 2 2 2",
  "Concentrated Bicep Curls, Left Arm": "6 6",
};

export default function CalculatorHistory() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { goBack } = useShowBackButton();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "1rm");
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [selectedMeasurementTypes, setSelectedMeasurementTypes] = useState<string[]>([]);
  const [timeFilter, setTimeFilter] = useState<string>("all");
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>();
  
  // BMR time filter state
  const [bmrTimeFilter, setBmrTimeFilter] = useState<string>("all");
  const [bmrCustomStartDate, setBmrCustomStartDate] = useState<Date | undefined>();
  const [bmrCustomEndDate, setBmrCustomEndDate] = useState<Date | undefined>();
  
  // Measurement time filter state
  const [measurementTimeFilter, setMeasurementTimeFilter] = useState<string>("all");
  const [measurementCustomStartDate, setMeasurementCustomStartDate] = useState<Date | undefined>();
  const [measurementCustomEndDate, setMeasurementCustomEndDate] = useState<Date | undefined>();
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>();
  
  const [oneRMHistory, setOneRMHistory] = useState<OneRMRecord[]>([]);
  const [bmrHistory, setBMRHistory] = useState<BMRRecord[]>([]);
  const [calorieHistory, setCalorieHistory] = useState<CalorieRecord[]>([]);
  const [measurementHistory, setMeasurementHistory] = useState<MeasurementRecord[]>([]);
  const [measurementGoal, setMeasurementGoal] = useState<MeasurementGoal | null>(null);
  
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; type: string; id: string } | null>(null);
  const [isMeasurementDialogOpen, setIsMeasurementDialogOpen] = useState(false);
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  
  // Record detail dialog state
  const [selectedRecord, setSelectedRecord] = useState<{
    type: RecordType;
    record: OneRMRecord | BMRRecord | CalorieRecord | { id: string; date: string; weight: number | null; bodyFat: number | null; muscleMass: number | null; } | null;
  } | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setUser(user);
    await fetchAllData(user.id);
    setLoading(false);
  };

  const fetchAllData = async (userId: string) => {
    await Promise.all([
      fetchOneRMHistory(userId),
      fetchBMRHistory(userId),
      fetchCalorieHistory(userId),
      fetchMeasurementHistory(userId),
      fetchMeasurementGoal(userId),
    ]);
  };

  const fetchOneRMHistory = async (userId: string) => {
    const { data } = await supabase
      .from("onerm_history")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (data) setOneRMHistory(data);
  };

  const fetchBMRHistory = async (userId: string) => {
    const { data } = await supabase
      .from("bmr_history")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (data) setBMRHistory(data);
  };

  const fetchCalorieHistory = async (userId: string) => {
    const { data } = await supabase
      .from("calorie_history")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (data) setCalorieHistory(data);
  };

  const fetchMeasurementHistory = async (userId: string) => {
    const { data } = await supabase
      .from("user_activity_log")
      .select("id, created_at, tool_result")
      .eq("user_id", userId)
      .eq("content_type", "measurement")
      .not("tool_result", "is", null)
      .order("created_at", { ascending: false });
    if (data) {
      // Filter out records without actual measurement values
      const validData = data.filter((d: MeasurementData) => {
        const result = d.tool_result as MeasurementRecord['tool_result'];
        return result && (result.weight || result.bodyFat || result.muscleMass);
      });
      const typedData = validData.map((d: MeasurementData) => ({
        id: d.id,
        created_at: d.created_at,
        tool_result: d.tool_result as MeasurementRecord['tool_result'],
      }));
      setMeasurementHistory(typedData);
    }
  };

  const fetchMeasurementGoal = async (userId: string) => {
    const { data } = await supabase
      .from("user_measurement_goals")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    if (data) setMeasurementGoal(data);
  };

  const handleDelete = async () => {
    if (!deleteDialog || !user) return;
    
    const { type, id } = deleteDialog;
    let error = null;

    if (type === "1rm") {
      const result = await supabase.from("onerm_history").delete().eq("id", id);
      error = result.error;
      if (!error) await fetchOneRMHistory(user.id);
    } else if (type === "bmr") {
      const result = await supabase.from("bmr_history").delete().eq("id", id);
      error = result.error;
      if (!error) await fetchBMRHistory(user.id);
    } else if (type === "macro") {
      const result = await supabase.from("calorie_history").delete().eq("id", id);
      error = result.error;
      if (!error) await fetchCalorieHistory(user.id);
    } else if (type === "measurement") {
      const result = await supabase.from("user_activity_log").delete().eq("id", id);
      error = result.error;
      if (!error) await fetchMeasurementHistory(user.id);
    }

    if (error) {
      toast({ title: "Error", description: "Failed to delete record", variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: "Record deleted successfully" });
    }
    setDeleteDialog(null);
    setSelectedRecord(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Get latest measurement for goal progress
  const latestMeasurement = measurementHistory[0];
  const currentWeight = latestMeasurement?.tool_result?.weight;
  const currentBodyFat = latestMeasurement?.tool_result?.bodyFat;
  const currentMuscleMass = latestMeasurement?.tool_result?.muscleMass;

  // Calculate goal progress
  const calculateProgress = (current: number | undefined, target: number | null, isDecrease: boolean = false) => {
    if (!current || !target) return null;
    if (isDecrease) {
      // For decreasing goals (like body fat), higher current = less progress
      const diff = current - target;
      if (diff <= 0) return 100; // Already at or below target
      // Assume starting point was 10 units higher than target for progress calc
      const startingPoint = target + 10;
      const progress = ((startingPoint - current) / (startingPoint - target)) * 100;
      return Math.max(0, Math.min(100, progress));
    } else {
      // For increasing goals (like muscle mass)
      if (current >= target) return 100;
      // Assume starting point was 10 units lower than target
      const startingPoint = target - 10;
      const progress = ((current - startingPoint) / (target - startingPoint)) * 100;
      return Math.max(0, Math.min(100, progress));
    }
  };

  // Get unique exercises for filter
  const uniqueExercises = [...new Set(oneRMHistory.map(r => r.exercise_name).filter(Boolean))] as string[];

  // Generic time filter function
  const applyTimeFilter = <T extends { created_at: string }>(
    history: T[],
    filter: string,
    customStart?: Date,
    customEnd?: Date
  ): T[] => {
    const now = new Date();
    let startDate: Date | null = null;
    
    switch (filter) {
      case "30":
        startDate = subDays(now, 30);
        break;
      case "90":
        startDate = subMonths(now, 3);
        break;
      case "180":
        startDate = subMonths(now, 6);
        break;
      case "custom":
        if (customStart && customEnd) {
          return history.filter(r => {
            const recordDate = new Date(r.created_at);
            return recordDate >= customStart && recordDate <= customEnd;
          });
        }
        return history;
      default:
        return history;
    }
    
    if (startDate) {
      return history.filter(r => new Date(r.created_at) >= startDate!);
    }
    return history;
  };

  // Get time filtered 1RM history
  const getTimeFilteredHistory = (history: OneRMRecord[]) => {
    return applyTimeFilter(history, timeFilter, customStartDate, customEndDate);
  };

  // Prepare chart data with time and exercise filters
  const timeFilteredHistory = getTimeFilteredHistory(oneRMHistory);
  const filteredOneRMHistory = selectedExercises.length === 0 
    ? timeFilteredHistory 
    : timeFilteredHistory.filter(r => r.exercise_name && selectedExercises.includes(r.exercise_name));

  // Transform data for multi-exercise progress chart
  const prepareOneRMProgressData = () => {
    const sortedData = [...filteredOneRMHistory].reverse();
    const exercisesToShow = selectedExercises.length === 0 ? [...EXERCISES] : selectedExercises;
    
    // Group by date and create data points with all selected exercises
    const dateMap = new Map<string, Record<string, number | string>>();
    
    sortedData.forEach(r => {
      const dateKey = formatShortDate(r.created_at);
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, { date: dateKey });
      }
      const exerciseName = r.exercise_name || "Unknown";
      if (exercisesToShow.includes(exerciseName)) {
        dateMap.get(dateKey)![exerciseName] = r.one_rm_result;
      }
    });
    
    return Array.from(dateMap.values());
  };

  const oneRMProgressData = prepareOneRMProgressData();

  // Filter BMR history by time
  const filteredBMRHistory = applyTimeFilter(bmrHistory, bmrTimeFilter, bmrCustomStartDate, bmrCustomEndDate);
  
  const bmrChartData = [...filteredBMRHistory].reverse().map((r) => ({
    date: formatShortDate(r.created_at),
    bmr: r.bmr_result,
    weight: r.weight,
  }));

  // Filter Measurement history by time
  const timeFilteredMeasurementHistory = applyTimeFilter(measurementHistory, measurementTimeFilter, measurementCustomStartDate, measurementCustomEndDate);
  
  // Filter by measurement type
  const filteredMeasurementHistory = selectedMeasurementTypes.length === 0 
    ? timeFilteredMeasurementHistory
    : timeFilteredMeasurementHistory.filter(r => {
        const hasWeight = r.tool_result?.weight && selectedMeasurementTypes.includes("Weight");
        const hasBodyFat = r.tool_result?.bodyFat && selectedMeasurementTypes.includes("Body Fat");
        const hasMuscleMass = r.tool_result?.muscleMass && selectedMeasurementTypes.includes("Muscle Mass");
        return hasWeight || hasBodyFat || hasMuscleMass;
      });

  const measurementChartData = [...filteredMeasurementHistory].reverse().map((r) => ({
    date: formatShortDate(r.created_at),
    weight: r.tool_result?.weight || 0,
    bodyFat: r.tool_result?.bodyFat || 0,
    muscleMass: r.tool_result?.muscleMass || 0,
  }));

  // Handle record click
  const handleRecordClick = (type: RecordType, record: OneRMRecord | BMRRecord | CalorieRecord | MeasurementRecord) => {
    if (type === "measurement") {
      const m = record as MeasurementRecord;
      setSelectedRecord({
        type,
        record: {
          id: m.id,
          date: m.created_at,
          weight: m.tool_result?.weight || null,
          bodyFat: m.tool_result?.bodyFat || null,
          muscleMass: m.tool_result?.muscleMass || null,
        }
      });
    } else {
      setSelectedRecord({ type, record: record as OneRMRecord | BMRRecord | CalorieRecord });
    }
  };

  const handleDeleteFromDialog = () => {
    if (selectedRecord) {
      setDeleteDialog({ open: true, type: selectedRecord.type, id: selectedRecord.record?.id || "" });
    }
  };

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      <PageBreadcrumbs
        items={[
          { label: "Dashboard", href: "/userdashboard" },
          { label: "Calculator History" },
        ]}
      />

      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={goBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Calculator & Measurement History</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-6 h-auto">
          <TabsTrigger value="1rm" className="text-xs sm:text-sm py-2">1RM Calculator</TabsTrigger>
          <TabsTrigger value="bmr" className="text-xs sm:text-sm py-2">BMR Calculator</TabsTrigger>
          <TabsTrigger value="macro" className="text-xs sm:text-sm py-2">Macro Calculator</TabsTrigger>
          <TabsTrigger value="measurements" className="text-xs sm:text-sm py-2">Measurements</TabsTrigger>
        </TabsList>

        {/* 1RM Tab */}
        <TabsContent value="1rm" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              1RM History ({filteredOneRMHistory.length} of {oneRMHistory.length} records)
            </h2>
            <Button onClick={() => navigate("/1rmcalculator")}>Add New</Button>
          </div>

          {oneRMHistory.length > 1 && (
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <div className="flex flex-col gap-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    1RM Progress Over Time
                  </CardTitle>
                  <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2">
                    {/* Time Period Filter */}
                    <Select value={timeFilter} onValueChange={setTimeFilter}>
                      <SelectTrigger className="w-full sm:w-[140px]">
                        <SelectValue placeholder="Time period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="30">1 Month</SelectItem>
                        <SelectItem value="90">3 Months</SelectItem>
                        <SelectItem value="180">6 Months</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {/* Custom Date Range */}
                    {timeFilter === "custom" && (
                      <>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm" className={cn("w-[130px] justify-start text-left font-normal border border-input bg-background hover:bg-accent", !customStartDate && "text-muted-foreground")}>
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {customStartDate ? format(customStartDate, "MMM d, yyyy") : "Start date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={customStartDate}
                              onSelect={setCustomStartDate}
                              initialFocus
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                        <span className="text-muted-foreground">to</span>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm" className={cn("w-[130px] justify-start text-left font-normal border border-input bg-background hover:bg-accent", !customEndDate && "text-muted-foreground")}>
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {customEndDate ? format(customEndDate, "MMM d, yyyy") : "End date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={customEndDate}
                              onSelect={setCustomEndDate}
                              initialFocus
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </>
                    )}
                    
                    {/* Exercise Filter */}
                    <Popover>
                      <PopoverTrigger asChild>
                    <Button variant="ghost" className="w-full sm:w-[200px] justify-between border border-input bg-background hover:bg-accent">
                          {selectedExercises.length === 0
                            ? "All Exercises" 
                            : `${selectedExercises.length} exercise${selectedExercises.length > 1 ? 's' : ''} selected`}
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[280px] p-3 max-h-[300px] overflow-y-auto">
                        <div className="space-y-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full justify-start"
                          onClick={() => setSelectedExercises([])}
                        >
                          Show All Exercises
                        </Button>
                          <Separator />
                          <div className="space-y-2 pt-1">
                            {EXERCISES.map((exercise) => (
                              <div key={exercise} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`exercise-${exercise}`}
                                  checked={selectedExercises.includes(exercise)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedExercises([...selectedExercises, exercise]);
                                    } else {
                                      setSelectedExercises(selectedExercises.filter(e => e !== exercise));
                                    }
                                  }}
                                />
                                <label 
                                  htmlFor={`exercise-${exercise}`} 
                                  className="text-sm cursor-pointer flex-1"
                                >
                                  {exercise}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={oneRMProgressData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    {(selectedExercises.length === 0 ? [...EXERCISES] : selectedExercises).map((exercise) => (
                      <Line 
                        key={exercise}
                        type="monotone" 
                        dataKey={exercise} 
                        stroke={EXERCISE_COLORS[exercise] || "hsl(var(--primary))"} 
                        strokeWidth={2.5} 
                        strokeDasharray={EXERCISE_STROKE_PATTERNS[exercise] || "0"}
                        name={`${exercise} (kg)`}
                        connectNulls
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            {filteredOneRMHistory.map((record) => (
              <Card 
                key={record.id} 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleRecordClick("1rm", record)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{record.one_rm_result.toFixed(1)} kg</div>
                    {record.exercise_name && <div className="text-sm text-muted-foreground">{record.exercise_name}</div>}
                    <div className="text-sm text-muted-foreground">
                      {record.weight_lifted}kg × {record.reps} reps
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{formatDate(record.created_at)}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteDialog({ open: true, type: "1rm", id: record.id });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
            {filteredOneRMHistory.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  {oneRMHistory.length === 0 
                    ? "No 1RM calculations yet. Start by calculating your first one!"
                    : "No records match your current filters."}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* BMR Tab */}
        <TabsContent value="bmr" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              BMR History ({filteredBMRHistory.length} of {bmrHistory.length} records)
            </h2>
            <Button onClick={() => navigate("/bmrcalculator")}>Add New</Button>
          </div>

          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <div className="flex flex-col gap-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  BMR Progress Over Time
                </CardTitle>
                <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2">
                  {/* Time Period Filter */}
                  <Select value={bmrTimeFilter} onValueChange={setBmrTimeFilter}>
                    <SelectTrigger className="w-full sm:w-[140px]">
                      <SelectValue placeholder="Time period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="30">1 Month</SelectItem>
                      <SelectItem value="90">3 Months</SelectItem>
                      <SelectItem value="180">6 Months</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {/* Custom Date Range */}
                  {bmrTimeFilter === "custom" && (
                    <div className="flex flex-wrap items-center gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="sm" className={cn("w-[130px] justify-start text-left font-normal border border-input bg-background hover:bg-accent", !bmrCustomStartDate && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {bmrCustomStartDate ? format(bmrCustomStartDate, "MMM d, yyyy") : "Start date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={bmrCustomStartDate}
                            onSelect={setBmrCustomStartDate}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <span className="text-muted-foreground">to</span>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="sm" className={cn("w-[130px] justify-start text-left font-normal border border-input bg-background hover:bg-accent", !bmrCustomEndDate && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {bmrCustomEndDate ? format(bmrCustomEndDate, "MMM d, yyyy") : "End date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={bmrCustomEndDate}
                            onSelect={setBmrCustomEndDate}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredBMRHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={bmrChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="bmr" stroke="hsl(var(--primary))" strokeWidth={2.5} name="BMR (cal)" dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="weight" stroke="hsl(var(--muted-foreground))" strokeWidth={2.5} strokeDasharray="8 4" name="Weight (kg)" dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Calculator className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No BMR data yet. Calculate your first BMR to see your progress!</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-2">
            {filteredBMRHistory.map((record) => (
              <Card 
                key={record.id} 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleRecordClick("bmr", record)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{record.bmr_result.toFixed(0)} cal/day</div>
                    <div className="text-sm text-muted-foreground">
                      {record.gender === "male" ? "Male" : "Female"}, {record.age} years
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {record.height}cm, {record.weight}kg
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{formatDate(record.created_at)}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteDialog({ open: true, type: "bmr", id: record.id });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
            {filteredBMRHistory.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  {bmrHistory.length === 0 
                    ? "No BMR calculations yet. Start by calculating your first one!"
                    : "No records match your current filters."}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Macro Tab */}
        <TabsContent value="macro" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Macro History ({calorieHistory.length} records)
            </h2>
            <Button onClick={() => navigate("/macrocalculator")}>Add New</Button>
          </div>

          <div className="space-y-2">
            {calorieHistory.map((record) => (
              <Card 
                key={record.id} 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleRecordClick("macro", record)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{record.target_calories.toFixed(0)} cal/day</div>
                    <div className="text-sm text-muted-foreground capitalize">Goal: {record.goal}</div>
                    <div className="text-sm text-muted-foreground">
                      Activity: {record.activity_level.replace("_", " ")}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{formatDate(record.created_at)}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteDialog({ open: true, type: "macro", id: record.id });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
            {calorieHistory.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No macro calculations yet. Start by calculating your first one!
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Measurements Tab */}
        <TabsContent value="measurements" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center flex-wrap gap-2">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" />
              Measurements ({filteredMeasurementHistory.length} of {measurementHistory.length} records)
            </h2>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setIsGoalDialogOpen(true)}>
                <Target className="h-4 w-4 mr-2" />
                {measurementGoal ? "Edit Goals" : "Set Goals"}
              </Button>
              <Button onClick={() => setIsMeasurementDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add New
              </Button>
            </div>
          </div>

          {/* Goal Progress Section */}
          {measurementGoal && (measurementGoal.target_weight || measurementGoal.target_body_fat || measurementGoal.target_muscle_mass) && (
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Goal Progress
                  {measurementGoal.target_date && (
                    <span className="text-xs font-normal text-muted-foreground ml-auto">
                      Target: {formatDate(measurementGoal.target_date)}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {measurementGoal.target_weight && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Weight</span>
                      <span className="font-medium">
                        {currentWeight ? `${currentWeight} kg` : "No data"} → {measurementGoal.target_weight} kg
                      </span>
                    </div>
                    <Progress 
                      value={currentWeight && measurementGoal.target_weight 
                        ? (currentWeight > measurementGoal.target_weight 
                          ? calculateProgress(currentWeight, measurementGoal.target_weight, true) 
                          : calculateProgress(currentWeight, measurementGoal.target_weight, false))
                        : 0} 
                      className="h-2"
                    />
                    {currentWeight && measurementGoal.target_weight && (
                      <p className="text-xs text-muted-foreground">
                        {currentWeight === measurementGoal.target_weight 
                          ? "🎉 Target reached!" 
                          : currentWeight > measurementGoal.target_weight 
                            ? `${(currentWeight - measurementGoal.target_weight).toFixed(1)} kg to lose`
                            : `${(measurementGoal.target_weight - currentWeight).toFixed(1)} kg to gain`}
                      </p>
                    )}
                  </div>
                )}

                {measurementGoal.target_body_fat && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Body Fat</span>
                      <span className="font-medium">
                        {currentBodyFat ? `${currentBodyFat}%` : "No data"} → {measurementGoal.target_body_fat}%
                      </span>
                    </div>
                    <Progress 
                      value={calculateProgress(currentBodyFat, measurementGoal.target_body_fat, true) || 0} 
                      className="h-2"
                    />
                    {currentBodyFat && measurementGoal.target_body_fat && (
                      <p className="text-xs text-muted-foreground">
                        {currentBodyFat <= measurementGoal.target_body_fat 
                          ? "🎉 Target reached!" 
                          : `${(currentBodyFat - measurementGoal.target_body_fat).toFixed(1)}% to lose`}
                      </p>
                    )}
                  </div>
                )}

                {measurementGoal.target_muscle_mass && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Muscle Mass</span>
                      <span className="font-medium">
                        {currentMuscleMass ? `${currentMuscleMass} kg` : "No data"} → {measurementGoal.target_muscle_mass} kg
                      </span>
                    </div>
                    <Progress 
                      value={calculateProgress(currentMuscleMass, measurementGoal.target_muscle_mass, false) || 0} 
                      className="h-2"
                    />
                    {currentMuscleMass && measurementGoal.target_muscle_mass && (
                      <p className="text-xs text-muted-foreground">
                        {currentMuscleMass >= measurementGoal.target_muscle_mass 
                          ? "🎉 Target reached!" 
                          : `${(measurementGoal.target_muscle_mass - currentMuscleMass).toFixed(1)} kg to gain`}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <div className="flex flex-col gap-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Body Measurements Over Time
                </CardTitle>
                <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2">
                  {/* Time Period Filter */}
                  <Select value={measurementTimeFilter} onValueChange={setMeasurementTimeFilter}>
                    <SelectTrigger className="w-full sm:w-[140px]">
                      <SelectValue placeholder="Time period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="30">1 Month</SelectItem>
                      <SelectItem value="90">3 Months</SelectItem>
                      <SelectItem value="180">6 Months</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {/* Measurement Type Filter */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" className="w-full sm:w-[200px] justify-between border border-input bg-background hover:bg-accent">
                        {selectedMeasurementTypes.length === 0
                          ? "All Measurements" 
                          : `${selectedMeasurementTypes.length} type${selectedMeasurementTypes.length > 1 ? 's' : ''} selected`}
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[220px] p-3">
                      <div className="space-y-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full justify-start"
                          onClick={() => setSelectedMeasurementTypes([])}
                        >
                          Show All Measurements
                        </Button>
                        <Separator />
                        <div className="space-y-2 pt-1">
                          {MEASUREMENT_TYPES.map((type) => (
                            <div key={type} className="flex items-center space-x-2">
                              <Checkbox
                                id={`measurement-${type}`}
                                checked={selectedMeasurementTypes.includes(type)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedMeasurementTypes([...selectedMeasurementTypes, type]);
                                  } else {
                                    setSelectedMeasurementTypes(selectedMeasurementTypes.filter(t => t !== type));
                                  }
                                }}
                              />
                              <label 
                                htmlFor={`measurement-${type}`} 
                                className="text-sm cursor-pointer flex-1"
                              >
                                {type}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  
                  {/* Custom Date Range */}
                  {measurementTimeFilter === "custom" && (
                    <div className="flex flex-wrap items-center gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="sm" className={cn("w-[130px] justify-start text-left font-normal border border-input bg-background hover:bg-accent", !measurementCustomStartDate && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {measurementCustomStartDate ? format(measurementCustomStartDate, "MMM d, yyyy") : "Start date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={measurementCustomStartDate}
                            onSelect={setMeasurementCustomStartDate}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <span className="text-muted-foreground">to</span>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="sm" className={cn("w-[130px] justify-start text-left font-normal border border-input bg-background hover:bg-accent", !measurementCustomEndDate && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {measurementCustomEndDate ? format(measurementCustomEndDate, "MMM d, yyyy") : "End date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={measurementCustomEndDate}
                            onSelect={setMeasurementCustomEndDate}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredMeasurementHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={measurementChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Legend />
                    {(selectedMeasurementTypes.length === 0 || selectedMeasurementTypes.includes("Weight")) && (
                      <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={2.5} name="Weight (kg)" dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    )}
                    {(selectedMeasurementTypes.length === 0 || selectedMeasurementTypes.includes("Body Fat")) && (
                      <Line type="monotone" dataKey="bodyFat" stroke="hsl(var(--destructive))" strokeWidth={2.5} strokeDasharray="8 4" name="Body Fat (%)" dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    )}
                    {(selectedMeasurementTypes.length === 0 || selectedMeasurementTypes.includes("Muscle Mass")) && (
                      <Line type="monotone" dataKey="muscleMass" stroke="hsl(var(--chart-2))" strokeWidth={2.5} strokeDasharray="4 4" name="Muscle Mass (kg)" dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    )}
                    {/* Goal reference lines */}
                    {(selectedMeasurementTypes.length === 0 || selectedMeasurementTypes.includes("Weight")) && measurementGoal?.target_weight && (
                      <ReferenceLine y={measurementGoal.target_weight} stroke="hsl(var(--primary))" strokeDasharray="5 5" label={{ value: `Goal: ${measurementGoal.target_weight}kg`, fill: 'hsl(var(--primary))', fontSize: 10 }} />
                    )}
                    {(selectedMeasurementTypes.length === 0 || selectedMeasurementTypes.includes("Body Fat")) && measurementGoal?.target_body_fat && (
                      <ReferenceLine y={measurementGoal.target_body_fat} stroke="hsl(var(--destructive))" strokeDasharray="5 5" label={{ value: `Goal: ${measurementGoal.target_body_fat}%`, fill: 'hsl(var(--destructive))', fontSize: 10 }} />
                    )}
                    {(selectedMeasurementTypes.length === 0 || selectedMeasurementTypes.includes("Muscle Mass")) && measurementGoal?.target_muscle_mass && (
                      <ReferenceLine y={measurementGoal.target_muscle_mass} stroke="hsl(var(--chart-2))" strokeDasharray="5 5" label={{ value: `Goal: ${measurementGoal.target_muscle_mass}kg`, fill: 'hsl(var(--chart-2))', fontSize: 10 }} />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Scale className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No measurement data yet. Start tracking your body measurements!</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-2">
            {filteredMeasurementHistory.map((record) => (
              <Card 
                key={record.id} 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleRecordClick("measurement", record)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">
                      {record.tool_result?.weight && `${record.tool_result.weight} kg`}
                      {record.tool_result?.weight && (record.tool_result?.bodyFat || record.tool_result?.muscleMass) && " | "}
                      {record.tool_result?.bodyFat && `BF: ${record.tool_result.bodyFat}%`}
                      {record.tool_result?.bodyFat && record.tool_result?.muscleMass && " | "}
                      {record.tool_result?.muscleMass && `MM: ${record.tool_result.muscleMass} kg`}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{formatDate(record.created_at)}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteDialog({ open: true, type: "measurement", id: record.id });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
            {filteredMeasurementHistory.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  {measurementHistory.length === 0 
                    ? "No measurements yet. Start tracking your body measurements!"
                    : "No records match your current filters."}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog?.open || false} onOpenChange={(open) => !open && setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this record? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Measurement Dialog */}
      <MeasurementDialog
        isOpen={isMeasurementDialogOpen}
        onClose={() => setIsMeasurementDialogOpen(false)}
        userId={user?.id || ""}
        onSaved={() => user && fetchMeasurementHistory(user.id)}
      />

      {/* Measurement Goal Dialog */}
      <MeasurementGoalDialog
        isOpen={isGoalDialogOpen}
        onClose={() => setIsGoalDialogOpen(false)}
        userId={user?.id || ""}
        currentGoal={measurementGoal}
        onSaved={() => user && fetchMeasurementGoal(user.id)}
      />

      {/* Record Detail Dialog */}
      <RecordDetailDialog
        isOpen={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        recordType={selectedRecord?.type || "1rm"}
        record={selectedRecord?.record || null}
        onDelete={handleDeleteFromDialog}
      />
    </div>
  );
}
