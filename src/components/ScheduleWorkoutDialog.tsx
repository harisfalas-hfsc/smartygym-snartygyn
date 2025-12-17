import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, Clock, Bell } from "lucide-react";
import { format, addDays, isBefore, startOfDay } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useGoogleCalendarConnection } from "@/hooks/useGoogleCalendarConnection";
import { cn } from "@/lib/utils";

interface ScheduleWorkoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contentId: string;
  contentName: string;
  contentType: "workout" | "program";
  onScheduled?: () => void;
}

export const ScheduleWorkoutDialog = ({
  isOpen,
  onClose,
  contentId,
  contentName,
  contentType,
  onScheduled
}: ScheduleWorkoutDialogProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(addDays(new Date(), 1));
  const [selectedTime, setSelectedTime] = useState<string>("09:00");
  const [reminderMinutes, setReminderMinutes] = useState<string>("30");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addToGoogleCalendar, setAddToGoogleCalendar] = useState(false);
  const { toast } = useToast();
  const { isConnected, autoSyncEnabled, syncToCalendar } = useGoogleCalendarConnection();

  // Auto-enable Google Calendar if auto-sync is enabled
  useEffect(() => {
    if (autoSyncEnabled) {
      setAddToGoogleCalendar(true);
    }
  }, [autoSyncEnabled]);

  const handleSchedule = async () => {
    if (!selectedDate) {
      toast({
        title: "Date Required",
        description: "Please select a date for your scheduled workout.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Login Required",
          description: "Please log in to schedule workouts.",
          variant: "destructive",
        });
        return;
      }

      const scheduledDate = format(selectedDate, 'yyyy-MM-dd');

      // Insert scheduled workout
      const { data: scheduledWorkout, error } = await supabase
        .from('scheduled_workouts')
        .insert({
          user_id: session.user.id,
          content_type: contentType,
          content_id: contentId,
          content_name: contentName,
          scheduled_date: scheduledDate,
          scheduled_time: selectedTime || null,
          reminder_before_minutes: parseInt(reminderMinutes),
          notes: notes || null,
          status: 'scheduled'
        })
        .select()
        .single();

      if (error) throw error;

      // Sync to Google Calendar if requested
      let calendarSynced = false;
      if (addToGoogleCalendar && isConnected) {
        const syncResult = await syncToCalendar({
          scheduled_date: scheduledDate,
          scheduled_time: selectedTime,
          content_name: contentName,
          content_type: contentType,
          notes: notes || undefined
        }, scheduledWorkout?.id);

        calendarSynced = syncResult.synced;

        // Update the scheduled workout with Google Calendar event ID if synced
        if (syncResult.event_id && scheduledWorkout) {
          await supabase
            .from('scheduled_workouts')
            .update({ google_calendar_event_id: syncResult.event_id })
            .eq('id', scheduledWorkout.id);
        }
      }

      toast({
        title: "Workout Scheduled! 📅",
        description: `${contentName} scheduled for ${format(selectedDate, 'MMMM d, yyyy')}${selectedTime ? ` at ${selectedTime}` : ''}${calendarSynced ? ' (synced to Google Calendar)' : ''}`,
      });

      onScheduled?.();
      onClose();
      
      // Reset form
      setSelectedDate(addDays(new Date(), 1));
      setSelectedTime("09:00");
      setReminderMinutes("30");
      setNotes("");
      setAddToGoogleCalendar(autoSyncEnabled);
    } catch (error) {
      console.error('Error scheduling workout:', error);
      toast({
        title: "Error",
        description: "Failed to schedule workout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = startOfDay(new Date());

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Schedule {contentType === 'workout' ? 'Workout' : 'Program'}
          </DialogTitle>
          <DialogDescription>
            Add "{contentName}" to your calendar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Date Picker */}
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => isBefore(date, today)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Picker */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Time (optional)
            </Label>
            <Input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Reminder */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Remind me before
            </Label>
            <Select value={reminderMinutes} onValueChange={setReminderMinutes}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
                <SelectItem value="1440">1 day</SelectItem>
                <SelectItem value="0">No reminder</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Google Calendar Sync */}
          {isConnected && (
            <div className="flex items-center space-x-2 py-2">
              <Checkbox
                id="google-calendar"
                checked={addToGoogleCalendar}
                onCheckedChange={(checked) => setAddToGoogleCalendar(checked === true)}
              />
              <label
                htmlFor="google-calendar"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Add to Google Calendar
              </label>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              placeholder="Add any notes for this scheduled workout..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSchedule} disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Scheduling..." : "Schedule"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
