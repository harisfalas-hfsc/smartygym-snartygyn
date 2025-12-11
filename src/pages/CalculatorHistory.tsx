import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Trash2, Calculator, Scale, TrendingUp } from "lucide-react";
import { PageBreadcrumbs } from "@/components/PageBreadcrumbs";
import { useShowBackButton } from "@/hooks/useShowBackButton";
import { MeasurementDialog } from "@/components/logbook/MeasurementDialog";
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
    body_fat?: number;
    muscle_mass?: number;
  } | null;
}

type MeasurementData = {
  id: string;
  created_at: string;
  tool_result: unknown;
};

export default function CalculatorHistory() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { goBack } = useShowBackButton();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "1rm");
  
  const [oneRMHistory, setOneRMHistory] = useState<OneRMRecord[]>([]);
  const [bmrHistory, setBMRHistory] = useState<BMRRecord[]>([]);
  const [calorieHistory, setCalorieHistory] = useState<CalorieRecord[]>([]);
  const [measurementHistory, setMeasurementHistory] = useState<MeasurementRecord[]>([]);
  
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; type: string; id: string } | null>(null);
  const [isMeasurementDialogOpen, setIsMeasurementDialogOpen] = useState(false);

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
      .order("created_at", { ascending: false });
    if (data) {
      const typedData = data.map((d: MeasurementData) => ({
        id: d.id,
        created_at: d.created_at,
        tool_result: d.tool_result as MeasurementRecord['tool_result'],
      }));
      setMeasurementHistory(typedData);
    }
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

  // Prepare chart data
  const oneRMChartData = [...oneRMHistory].reverse().map((r) => ({
    date: formatShortDate(r.created_at),
    result: r.one_rm_result,
    exercise: r.exercise_name || "Unknown",
  }));

  const bmrChartData = [...bmrHistory].reverse().map((r) => ({
    date: formatShortDate(r.created_at),
    bmr: r.bmr_result,
    weight: r.weight,
  }));

  const macroChartData = [...calorieHistory].reverse().map((r) => ({
    date: formatShortDate(r.created_at),
    target: r.target_calories,
    maintenance: r.maintenance_calories,
  }));

  const measurementChartData = [...measurementHistory].reverse().map((r) => ({
    date: formatShortDate(r.created_at),
    weight: r.tool_result?.weight || 0,
    bodyFat: r.tool_result?.body_fat || 0,
    muscleMass: r.tool_result?.muscle_mass || 0,
  }));

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
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="1rm">1RM Calculator</TabsTrigger>
          <TabsTrigger value="bmr">BMR Calculator</TabsTrigger>
          <TabsTrigger value="macro">Macro Calculator</TabsTrigger>
          <TabsTrigger value="measurements">Measurements</TabsTrigger>
        </TabsList>

        {/* 1RM Tab */}
        <TabsContent value="1rm" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              1RM History ({oneRMHistory.length} records)
            </h2>
            <Button onClick={() => navigate("/one-rm-calculator")}>Add New</Button>
          </div>

          {oneRMHistory.length > 1 && (
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  1RM Trend Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={oneRMChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Line type="monotone" dataKey="result" stroke="hsl(var(--primary))" strokeWidth={2} name="1RM (kg)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            {oneRMHistory.map((record) => (
              <Card key={record.id}>
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
                    onClick={() => setDeleteDialog({ open: true, type: "1rm", id: record.id })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
            {oneRMHistory.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No 1RM calculations yet. Start by calculating your first one!
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* BMR Tab */}
        <TabsContent value="bmr" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              BMR History ({bmrHistory.length} records)
            </h2>
            <Button onClick={() => navigate("/bmr-calculator")}>Add New</Button>
          </div>

          {bmrHistory.length > 1 && (
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  BMR Trend Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={bmrChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="bmr" stroke="hsl(var(--primary))" strokeWidth={2} name="BMR (cal)" />
                    <Line type="monotone" dataKey="weight" stroke="hsl(var(--muted-foreground))" strokeWidth={2} name="Weight (kg)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            {bmrHistory.map((record) => (
              <Card key={record.id}>
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
                    onClick={() => setDeleteDialog({ open: true, type: "bmr", id: record.id })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
            {bmrHistory.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No BMR calculations yet. Start by calculating your first one!
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
            <Button onClick={() => navigate("/macro-tracking-calculator")}>Add New</Button>
          </div>

          {calorieHistory.length > 1 && (
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Calorie Target Trend Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={macroChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="target" stroke="hsl(var(--primary))" strokeWidth={2} name="Target (cal)" />
                    <Line type="monotone" dataKey="maintenance" stroke="hsl(var(--muted-foreground))" strokeWidth={2} name="Maintenance (cal)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            {calorieHistory.map((record) => (
              <Card key={record.id}>
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
                    onClick={() => setDeleteDialog({ open: true, type: "macro", id: record.id })}
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
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" />
              Measurements ({measurementHistory.length} records)
            </h2>
            <Button onClick={() => setIsMeasurementDialogOpen(true)}>Add New</Button>
          </div>

          {measurementHistory.length > 1 && (
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Body Measurements Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={measurementChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={2} name="Weight (kg)" />
                    <Line type="monotone" dataKey="bodyFat" stroke="hsl(var(--destructive))" strokeWidth={2} name="Body Fat (%)" />
                    <Line type="monotone" dataKey="muscleMass" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Muscle Mass (kg)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            {measurementHistory.map((record) => (
              <Card key={record.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">
                      {record.tool_result?.weight && `${record.tool_result.weight} kg`}
                      {record.tool_result?.weight && (record.tool_result?.body_fat || record.tool_result?.muscle_mass) && " | "}
                      {record.tool_result?.body_fat && `BF: ${record.tool_result.body_fat}%`}
                      {record.tool_result?.body_fat && record.tool_result?.muscle_mass && " | "}
                      {record.tool_result?.muscle_mass && `MM: ${record.tool_result.muscle_mass} kg`}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{formatDate(record.created_at)}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => setDeleteDialog({ open: true, type: "measurement", id: record.id })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
            {measurementHistory.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No measurements yet. Start tracking your body measurements!
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
    </div>
  );
}
