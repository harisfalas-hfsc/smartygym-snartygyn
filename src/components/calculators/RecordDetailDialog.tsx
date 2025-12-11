import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, Dumbbell, Flame, Calculator, Scale } from "lucide-react";
import { format } from "date-fns";

interface OneRMRecord {
  id: string;
  exercise_name: string | null;
  weight_lifted: number;
  reps: number;
  one_rm_result: number;
  created_at: string;
}

interface BMRRecord {
  id: string;
  bmr_result: number;
  age: number;
  gender: string;
  height: number;
  weight: number;
  created_at: string;
}

interface CalorieRecord {
  id: string;
  maintenance_calories: number;
  target_calories: number;
  activity_level: string;
  goal: string;
  age: number;
  gender: string;
  height: number;
  weight: number;
  created_at: string;
}

interface MeasurementRecord {
  id: string;
  date: string;
  weight: number | null;
  bodyFat: number | null;
  muscleMass: number | null;
}

type RecordType = "1rm" | "bmr" | "macro" | "measurement";

interface RecordDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  recordType: RecordType;
  record: OneRMRecord | BMRRecord | CalorieRecord | MeasurementRecord | null;
  onDelete: () => void;
}

export const RecordDetailDialog = ({
  isOpen,
  onClose,
  recordType,
  record,
  onDelete
}: RecordDetailDialogProps) => {
  if (!record) return null;

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "PPP 'at' p");
  };

  const getActivityLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      sedentary: "Sedentary (little or no exercise)",
      light: "Light (1-3 days/week)",
      moderate: "Moderate (3-5 days/week)",
      active: "Active (6-7 days/week)",
      veryActive: "Very Active (twice/day)"
    };
    return labels[level] || level;
  };

  const getGoalLabel = (goal: string) => {
    const labels: Record<string, string> = {
      lose: "Lose Weight",
      maintain: "Maintain Weight",
      gain: "Gain Weight"
    };
    return labels[goal] || goal;
  };

  const renderContent = () => {
    switch (recordType) {
      case "1rm": {
        const r = record as OneRMRecord;
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Dumbbell className="h-5 w-5" />
              <span className="font-semibold text-lg">{r.exercise_name || "1RM Calculation"}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">Weight Lifted</p>
                <p className="text-lg font-bold">{r.weight_lifted} kg</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">Reps Performed</p>
                <p className="text-lg font-bold">{r.reps} reps</p>
              </div>
            </div>
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-xs text-muted-foreground">Estimated 1RM (Epley Formula)</p>
              <p className="text-2xl font-bold text-primary">{r.one_rm_result} kg</p>
            </div>
            <div className="text-sm text-muted-foreground">
              Recorded: {formatDate(r.created_at)}
            </div>
          </div>
        );
      }

      case "bmr": {
        const r = record as BMRRecord;
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Flame className="h-5 w-5" />
              <span className="font-semibold text-lg">BMR Calculation</span>
            </div>
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-xs text-muted-foreground">Basal Metabolic Rate (Mifflin-St Jeor)</p>
              <p className="text-2xl font-bold text-primary">{r.bmr_result} cal/day</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">Age</p>
                <p className="font-semibold">{r.age} years</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">Gender</p>
                <p className="font-semibold capitalize">{r.gender}</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">Height</p>
                <p className="font-semibold">{r.height} cm</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">Weight</p>
                <p className="font-semibold">{r.weight} kg</p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Recorded: {formatDate(r.created_at)}
            </div>
          </div>
        );
      }

      case "macro": {
        const r = record as CalorieRecord;
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Calculator className="h-5 w-5" />
              <span className="font-semibold text-lg">Macro Calculation</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">Maintenance</p>
                <p className="text-xl font-bold">{r.maintenance_calories} cal</p>
              </div>
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-xs text-muted-foreground">Target Calories</p>
                <p className="text-xl font-bold text-primary">{r.target_calories} cal</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">Goal</p>
                <p className="font-semibold">{getGoalLabel(r.goal)}</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">Activity Level</p>
                <p className="font-semibold">{getActivityLevelLabel(r.activity_level)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-2 bg-muted/50 rounded">
                <p className="text-xs text-muted-foreground">Age: {r.age}</p>
              </div>
              <div className="p-2 bg-muted/50 rounded">
                <p className="text-xs text-muted-foreground">Gender: {r.gender}</p>
              </div>
              <div className="p-2 bg-muted/50 rounded">
                <p className="text-xs text-muted-foreground">Height: {r.height}cm</p>
              </div>
              <div className="p-2 bg-muted/50 rounded">
                <p className="text-xs text-muted-foreground">Weight: {r.weight}kg</p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Recorded: {formatDate(r.created_at)}
            </div>
          </div>
        );
      }

      case "measurement": {
        const r = record as MeasurementRecord;
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Scale className="h-5 w-5" />
              <span className="font-semibold text-lg">Body Measurement</span>
            </div>
            <div className="space-y-3">
              {r.weight && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Weight</p>
                  <p className="text-2xl font-bold">{r.weight} kg</p>
                </div>
              )}
              {r.bodyFat && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Body Fat</p>
                  <p className="text-2xl font-bold">{r.bodyFat}%</p>
                </div>
              )}
              {r.muscleMass && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Muscle Mass</p>
                  <p className="text-2xl font-bold">{r.muscleMass} kg</p>
                </div>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              Recorded: {format(new Date(r.date), "PPP")}
            </div>
          </div>
        );
      }
    }
  };

  const getTitle = () => {
    switch (recordType) {
      case "1rm": return "1RM Record Details";
      case "bmr": return "BMR Record Details";
      case "macro": return "Macro Record Details";
      case "measurement": return "Measurement Details";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>
        
        {renderContent()}

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Record
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
