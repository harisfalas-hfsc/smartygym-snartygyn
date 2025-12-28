import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Clock, AlertTriangle } from "lucide-react";

interface CronTimeConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentHour?: number;
}

// Generate hour options (0-23)
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => ({
  value: i.toString(),
  label: `${i.toString().padStart(2, '0')}:00 UTC`,
  cyprusTime: `${((i + 2) % 24).toString().padStart(2, '0')}:00 Cyprus (summer)`,
}));

export const CronTimeConfigDialog = ({ open, onOpenChange, currentHour = 5 }: CronTimeConfigDialogProps) => {
  const [selectedHour, setSelectedHour] = useState(currentHour.toString());
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Update the cron job schedule using a database function
      const { error } = await supabase.rpc('update_wod_cron_schedule' as any, {
        new_hour: parseInt(selectedHour)
      });

      if (error) {
        // If RPC doesn't exist, show manual instructions
        if (error.message.includes("function") || error.code === "42883") {
          toast.info("Manual Update Required", {
            description: `To change the cron time, run: SELECT cron.schedule('generate-workout-of-day-daily', '0 ${selectedHour} * * *', ...)`,
            duration: 10000,
          });
        } else {
          throw error;
        }
      } else {
        toast.success("Cron schedule updated!", {
          description: `WODs will now generate at ${selectedHour.padStart(2, '0')}:00 UTC`,
        });
      }

      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating cron:", error);
      toast.error("Failed to update schedule", {
        description: "The cron job schedule requires database admin access to modify.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const selectedOption = HOUR_OPTIONS.find(h => h.value === selectedHour);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Configure WOD Generation Time
          </DialogTitle>
          <DialogDescription>
            Change when the daily WOD is automatically generated. Currently set to 05:00 UTC (07:00 Cyprus).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Generation Time (UTC)</Label>
            <Select value={selectedHour} onValueChange={setSelectedHour}>
              <SelectTrigger>
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent side="bottom" align="start" className="max-h-60">
                {HOUR_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col">
                      <span>{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.cyprusTime}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedOption && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm">
                <strong>Selected:</strong> {selectedOption.label}
              </p>
              <p className="text-sm text-muted-foreground">
                {selectedOption.cyprusTime}
              </p>
            </div>
          )}

          <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-500">Note</p>
              <p className="text-muted-foreground">
                Changing this will affect when users receive their daily WOD notification. 
                The 7-day periodization cycle will continue without interruption.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
