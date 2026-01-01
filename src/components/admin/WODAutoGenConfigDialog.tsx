import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { format, addDays } from "date-fns";
import { CalendarIcon, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { CronTimeInput } from "./CronTimeInput";
import { utcToCyprus, cyprusToUtc } from "@/lib/cyprusDate";

interface WODAutoGenConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WODAutoGenConfigDialog = ({ open, onOpenChange }: WODAutoGenConfigDialogProps) => {
  const queryClient = useQueryClient();
  
  // Store time in Cyprus timezone for the UI
  const [isEnabled, setIsEnabled] = useState(true);
  const [cyprusHour, setCyprusHour] = useState(0); // 00:30 Cyprus = 22:30 UTC
  const [cyprusMinute, setCyprusMinute] = useState(30);
  const [pauseMode, setPauseMode] = useState<"none" | "tomorrow" | "days" | "indefinite">("none");
  const [pauseUntilDate, setPauseUntilDate] = useState<Date | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch current config
  const { data: config, isLoading } = useQuery({
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

  // Initialize form from config (convert UTC to Cyprus)
  useEffect(() => {
    if (config) {
      setIsEnabled(config.is_enabled);
      
      // Convert stored UTC time to Cyprus time for display
      const utcHour = config.generation_hour_utc ?? 22;
      const utcMinute = (config as any).generation_minute_utc ?? 30;
      setCyprusHour(utcToCyprus(utcHour));
      setCyprusMinute(utcMinute);
      
      if (config.paused_until) {
        const pausedDate = new Date(config.paused_until);
        const tomorrow = addDays(new Date(), 1);
        tomorrow.setHours(0, 0, 0, 0);
        pausedDate.setHours(0, 0, 0, 0);
        
        if (pausedDate.getTime() === tomorrow.getTime()) {
          setPauseMode("tomorrow");
        } else {
          setPauseMode("days");
          setPauseUntilDate(pausedDate);
        }
      } else if (!config.is_enabled && config.pause_reason === "indefinite") {
        setPauseMode("indefinite");
      } else {
        setPauseMode("none");
      }
    }
  }, [config]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let pausedUntil: string | null = null;
      let pauseReason: string | null = null;
      let enabled = isEnabled;

      if (pauseMode === "tomorrow") {
        const tomorrow = addDays(new Date(), 1);
        tomorrow.setHours(23, 59, 59, 999);
        pausedUntil = tomorrow.toISOString();
        pauseReason = "Paused for tomorrow";
      } else if (pauseMode === "days" && pauseUntilDate) {
        pauseUntilDate.setHours(23, 59, 59, 999);
        pausedUntil = pauseUntilDate.toISOString();
        pauseReason = `Paused until ${format(pauseUntilDate, "MMM dd, yyyy")}`;
      } else if (pauseMode === "indefinite") {
        enabled = false;
        pauseReason = "indefinite";
      }

      // Convert Cyprus time to UTC for storage
      const utcHour = cyprusToUtc(cyprusHour);

      // Update config in database
      const { error: configError } = await supabase
        .from("wod_auto_generation_config")
        .update({
          is_enabled: enabled,
          generation_hour_utc: utcHour,
          generation_minute_utc: cyprusMinute,
          paused_until: pausedUntil,
          pause_reason: pauseReason,
        } as any)
        .eq("id", config?.id);

      if (configError) throw configError;

      // Update the cron job time if enabled and not paused
      if (enabled && pauseMode === "none") {
        const { error: cronError } = await supabase.rpc("update_wod_cron_schedule", {
          new_hour: utcHour,
          new_minute: cyprusMinute,
        });

        if (cronError) {
          console.warn("Failed to update cron schedule:", cronError);
          // Don't fail the whole operation for cron update
        }
      }

      const utcTimeStr = `${utcHour.toString().padStart(2, '0')}:${cyprusMinute.toString().padStart(2, '0')}`;
      const cyprusTimeStr = `${cyprusHour.toString().padStart(2, '0')}:${cyprusMinute.toString().padStart(2, '0')}`;

      toast.success("WOD auto-generation settings saved", {
        description: enabled && pauseMode === "none" 
          ? `Generation scheduled at ${cyprusTimeStr} Cyprus (${utcTimeStr} UTC)`
          : pauseMode === "indefinite" 
            ? "Auto-generation disabled until manually resumed"
            : `Paused: ${pauseReason}`,
      });

      queryClient.invalidateQueries({ queryKey: ["wod-auto-gen-config"] });
      queryClient.invalidateQueries({ queryKey: ["cron-jobs"] });
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error saving WOD config:", error);
      toast.error("Failed to save settings", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleEnabled = (checked: boolean) => {
    setIsEnabled(checked);
    if (checked) {
      setPauseMode("none");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            WOD Auto-Generation Settings
          </DialogTitle>
          <DialogDescription>
            Configure when the Workout of the Day is automatically generated
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-muted-foreground">Loading configuration...</div>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-gen-enabled">Auto-Generation</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically generate WODs daily
                </p>
              </div>
              <Switch
                id="auto-gen-enabled"
                checked={isEnabled && pauseMode === "none"}
                onCheckedChange={handleToggleEnabled}
              />
            </div>

            {/* Generation Time - Using CronTimeInput for proper hour+minute */}
            <CronTimeInput
              hour={cyprusHour}
              minute={cyprusMinute}
              onHourChange={setCyprusHour}
              onMinuteChange={setCyprusMinute}
              label="Generation Time"
              showTimezonePreview={true}
            />

            {/* Pause Options */}
            <div className="space-y-3">
              <Label>Pause Auto-Generation</Label>
              <RadioGroup value={pauseMode} onValueChange={(value: any) => setPauseMode(value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="none" id="pause-none" />
                  <Label htmlFor="pause-none" className="font-normal cursor-pointer">
                    Don't pause (run daily)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="tomorrow" id="pause-tomorrow" />
                  <Label htmlFor="pause-tomorrow" className="font-normal cursor-pointer">
                    Skip tomorrow only
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="days" id="pause-days" />
                  <Label htmlFor="pause-days" className="font-normal cursor-pointer">
                    Pause until specific date
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="indefinite" id="pause-indefinite" />
                  <Label htmlFor="pause-indefinite" className="font-normal cursor-pointer">
                    Pause indefinitely (manual control only)
                  </Label>
                </div>
              </RadioGroup>

              {/* Date picker for "days" mode */}
              {pauseMode === "days" && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !pauseUntilDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {pauseUntilDate ? format(pauseUntilDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={pauseUntilDate}
                      onSelect={setPauseUntilDate}
                      disabled={(date) => date <= new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            </div>

            {/* Warning for pause modes */}
            {pauseMode !== "none" && (
              <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-md">
                <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                <p className="text-xs text-yellow-500">
                  {pauseMode === "tomorrow" && "No WOD will be automatically generated tomorrow. You can still generate manually."}
                  {pauseMode === "days" && pauseUntilDate && `No WODs will be auto-generated until ${format(pauseUntilDate, "MMM dd, yyyy")}. Manual generation still available.`}
                  {pauseMode === "indefinite" && "Auto-generation is completely disabled. You must generate WODs manually until you resume."}
                </p>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || isLoading}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
