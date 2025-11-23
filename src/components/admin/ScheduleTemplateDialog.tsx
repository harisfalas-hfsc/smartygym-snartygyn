import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ScheduleTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId: string;
  templateName: string;
  onSuccess: () => void;
}

export const ScheduleTemplateDialog = ({ open, onOpenChange, templateId, templateName, onSuccess }: ScheduleTemplateDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    timezone: "UTC",
    recurrence: "once",
    customInterval: "",
    targetAudience: "all"
  });

  const handleSchedule = async () => {
    if (!formData.date || !formData.time) {
      toast({
        title: "Validation Error",
        description: "Please select both date and time",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    // Combine date and time into ISO string
    const scheduledTime = new Date(`${formData.date}T${formData.time}`).toISOString();
    const nextScheduledTime = scheduledTime;

    const { error } = await supabase
      .from('automated_message_templates')
      .update({
        scheduled_time: scheduledTime,
        next_scheduled_time: nextScheduledTime,
        timezone: formData.timezone,
        recurrence_pattern: formData.recurrence === 'custom' ? 'custom' : formData.recurrence,
        recurrence_interval: formData.recurrence === 'custom' ? formData.customInterval : null,
        target_audience: formData.targetAudience,
        status: 'active'
      })
      .eq('id', templateId);

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to schedule template",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Template scheduled successfully",
      });
      onSuccess();
      onOpenChange(false);
      // Reset form
      setFormData({
        date: "",
        time: "",
        timezone: "UTC",
        recurrence: "once",
        customInterval: "",
        targetAudience: "all"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Schedule Template</DialogTitle>
          <DialogDescription>
            Configure time-based scheduling for "{templateName}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Start Date *
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <Label htmlFor="time" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Time *
              </Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="timezone">Timezone</Label>
            <Select value={formData.timezone} onValueChange={(val) => setFormData({ ...formData, timezone: val })}>
              <SelectTrigger id="timezone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="America/New_York">EST (New York)</SelectItem>
                <SelectItem value="America/Chicago">CST (Chicago)</SelectItem>
                <SelectItem value="America/Denver">MST (Denver)</SelectItem>
                <SelectItem value="America/Los_Angeles">PST (Los Angeles)</SelectItem>
                <SelectItem value="Europe/London">GMT (London)</SelectItem>
                <SelectItem value="Europe/Paris">CET (Paris)</SelectItem>
                <SelectItem value="Asia/Tokyo">JST (Tokyo)</SelectItem>
                <SelectItem value="Australia/Sydney">AEDT (Sydney)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="recurrence">Recurrence Pattern</Label>
            <Select value={formData.recurrence} onValueChange={(val) => setFormData({ ...formData, recurrence: val })}>
              <SelectTrigger id="recurrence">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="once">Once (One-time send)</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="every_2_days">Every 2 Days</SelectItem>
                <SelectItem value="every_3_days">Every 3 Days</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="custom">Custom Interval</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.recurrence === 'custom' && (
            <div>
              <Label htmlFor="customInterval">Custom Interval</Label>
              <Input
                id="customInterval"
                placeholder="e.g., 5 days, 2 weeks, 10 hours"
                value={formData.customInterval}
                onChange={(e) => setFormData({ ...formData, customInterval: e.target.value })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Examples: "5 days", "2 weeks", "10 hours"
              </p>
            </div>
          )}

          <div>
            <Label htmlFor="targetAudience" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Target Audience
            </Label>
            <Select value={formData.targetAudience} onValueChange={(val) => setFormData({ ...formData, targetAudience: val })}>
              <SelectTrigger id="targetAudience">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="free_users">Free Users Only</SelectItem>
                <SelectItem value="premium_users">Premium Users Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-muted p-4 rounded-lg text-sm">
            <p className="font-medium mb-2">📌 Hybrid Mode Info:</p>
            <p className="text-muted-foreground">
              This template will work in <strong>both ways</strong>:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
              <li>Event-triggered: Sent automatically when user action occurs (if set as Default)</li>
              <li>Time-based: Sent on schedule to target audience as configured here</li>
            </ul>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSchedule} disabled={loading} className="flex-1">
              <Calendar className="h-4 w-4 mr-2" />
              {loading ? "Scheduling..." : "Schedule Template"}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};