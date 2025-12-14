import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, Dumbbell, Sun, Zap, Plus, BookOpen, FileText, BarChart3, Bell } from "lucide-react";
import { toast } from "sonner";

interface EmailPreferences {
  email_wod: boolean;
  email_ritual: boolean;
  email_monday_motivation: boolean;
  email_new_workout: boolean;
  email_new_program: boolean;
  email_new_article: boolean;
  email_weekly_activity: boolean;
  email_checkin_reminders: boolean;
  opt_out_all: boolean;
}

const DEFAULT_PREFERENCES: EmailPreferences = {
  email_wod: true,
  email_ritual: true,
  email_monday_motivation: true,
  email_new_workout: true,
  email_new_program: true,
  email_new_article: true,
  email_weekly_activity: true,
  email_checkin_reminders: true,
  opt_out_all: false,
};

const EMAIL_OPTIONS = [
  {
    key: "email_wod" as keyof EmailPreferences,
    label: "Workout of the Day",
    description: "Daily WOD delivered to your inbox every morning",
    timing: "Sent daily at 7:00 AM",
    icon: Dumbbell,
  },
  {
    key: "email_ritual" as keyof EmailPreferences,
    label: "Smarty Ritual",
    description: "Daily morning, midday, and evening ritual notifications",
    timing: "Sent daily at 7:05 AM",
    icon: Sun,
  },
  {
    key: "email_monday_motivation" as keyof EmailPreferences,
    label: "Monday Motivation",
    description: "Weekly motivational message every Monday",
    timing: "Sent every Monday at 10:00 AM",
    icon: Zap,
  },
  {
    key: "email_new_workout" as keyof EmailPreferences,
    label: "New Workouts",
    description: "Get notified when new workouts are added",
    timing: "Sent within 5 minutes of publication",
    icon: Plus,
  },
  {
    key: "email_new_program" as keyof EmailPreferences,
    label: "New Training Programs",
    description: "Get notified when new programs are added",
    timing: "Sent within 5 minutes of publication",
    icon: BookOpen,
  },
  {
    key: "email_new_article" as keyof EmailPreferences,
    label: "New Blog Articles",
    description: "Get notified when new articles are published",
    timing: "Sent within 5 minutes of publication",
    icon: FileText,
  },
  {
    key: "email_weekly_activity" as keyof EmailPreferences,
    label: "Weekly Activity Report",
    description: "Your weekly fitness activity summary every Monday",
    timing: "Sent every Monday at 10:00 AM",
    icon: BarChart3,
  },
  {
    key: "email_checkin_reminders" as keyof EmailPreferences,
    label: "Check-in Reminders",
    description: "Morning and evening check-in reminders",
    timing: "Sent at 8:00 AM & 8:00 PM daily",
    icon: Bell,
  },
];

export const EmailSubscriptionManager = () => {
  const [preferences, setPreferences] = useState<EmailPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("notification_preferences")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching preferences:", error);
        return;
      }

      if (profile?.notification_preferences) {
        const prefs = profile.notification_preferences as Record<string, any>;
        setPreferences({
          email_wod: prefs.email_wod !== false,
          email_ritual: prefs.email_ritual !== false,
          email_monday_motivation: prefs.email_monday_motivation !== false,
          email_new_workout: prefs.email_new_workout !== false,
          email_new_program: prefs.email_new_program !== false,
          email_new_article: prefs.email_new_article !== false,
          email_weekly_activity: prefs.email_weekly_activity !== false,
          email_checkin_reminders: prefs.email_checkin_reminders !== false || prefs.checkin_reminders === true,
          opt_out_all: prefs.opt_out_all === true,
        });
      }
    } catch (err) {
      console.error("Error fetching preferences:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreference = async (key: keyof EmailPreferences, value: boolean) => {
    setIsSaving(key);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to update preferences");
        return;
      }

      // Get current preferences
      const { data: profile } = await supabase
        .from("profiles")
        .select("notification_preferences")
        .eq("user_id", user.id)
        .single();

      const currentPrefs = (profile?.notification_preferences as Record<string, any>) || {};
      
      // Update the specific preference
      const updatedPrefs = {
        ...currentPrefs,
        [key]: value,
        // Also update legacy checkin_reminders field for compatibility
        ...(key === "email_checkin_reminders" ? { checkin_reminders: value } : {}),
      };

      const { error } = await supabase
        .from("profiles")
        .update({ notification_preferences: updatedPrefs })
        .eq("user_id", user.id);

      if (error) {
        console.error("Error updating preferences:", error);
        toast.error("Failed to update preference");
        return;
      }

      setPreferences(prev => ({ ...prev, [key]: value }));
      toast.success(value ? "Subscribed to emails" : "Unsubscribed from emails");
    } catch (err) {
      console.error("Error updating preference:", err);
      toast.error("Failed to update preference");
    } finally {
      setIsSaving(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Email Notifications</CardTitle>
        <CardDescription>
          Control which emails you receive. Dashboard notifications are not affected by these settings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        {EMAIL_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isChecked = preferences[option.key] && !preferences.opt_out_all;
          const isDisabled = preferences.opt_out_all || isSaving === option.key;
          
          return (
            <div
              key={option.key}
              className="flex items-center justify-between py-4 border-b last:border-0"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-2 rounded-lg bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="space-y-0.5">
                  <Label htmlFor={option.key} className="text-sm font-medium cursor-pointer">
                    {option.label}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {option.description}
                  </p>
                  <p className="text-xs text-primary font-medium">
                    {option.timing}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isSaving === option.key && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
                <Switch
                  id={option.key}
                  checked={isChecked}
                  onCheckedChange={(checked) => updatePreference(option.key, checked)}
                  disabled={isDisabled}
                />
              </div>
            </div>
          );
        })}

        {preferences.opt_out_all && (
          <div className="mt-4 p-4 bg-destructive/10 rounded-lg">
            <p className="text-sm text-destructive">
              You have unsubscribed from all emails. To receive individual notifications, 
              please update your preferences via the link in any email or contact support.
            </p>
          </div>
        )}

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">
            <strong>Note:</strong> Essential account emails (password resets, purchase confirmations, 
            subscription renewals) will always be sent regardless of these settings.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
