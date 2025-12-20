import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, Dumbbell, Sun, Zap, Plus, BookOpen, FileText, BarChart3, Bell } from "lucide-react";
import { toast } from "sonner";

interface DashboardNotificationPreferences {
  dashboard_wod: boolean;
  dashboard_ritual: boolean;
  dashboard_monday_motivation: boolean;
  dashboard_new_workout: boolean;
  dashboard_new_program: boolean;
  dashboard_new_article: boolean;
  dashboard_weekly_activity: boolean;
  dashboard_checkin_reminders: boolean;
}

const DEFAULT_PREFERENCES: DashboardNotificationPreferences = {
  dashboard_wod: true,
  dashboard_ritual: true,
  dashboard_monday_motivation: true,
  dashboard_new_workout: true,
  dashboard_new_program: true,
  dashboard_new_article: true,
  dashboard_weekly_activity: true,
  dashboard_checkin_reminders: true,
};

const NOTIFICATION_OPTIONS = [
  {
    key: "dashboard_wod" as keyof DashboardNotificationPreferences,
    label: "Workout of the Day",
    description: "Daily WOD notification in your dashboard",
    icon: Dumbbell,
  },
  {
    key: "dashboard_ritual" as keyof DashboardNotificationPreferences,
    label: "Smarty Ritual",
    description: "Daily ritual notifications in your dashboard",
    icon: Sun,
  },
  {
    key: "dashboard_monday_motivation" as keyof DashboardNotificationPreferences,
    label: "Monday Motivation",
    description: "Weekly motivational message every Monday",
    icon: Zap,
  },
  {
    key: "dashboard_new_workout" as keyof DashboardNotificationPreferences,
    label: "New Workouts",
    description: "Get notified when new workouts are added",
    icon: Plus,
  },
  {
    key: "dashboard_new_program" as keyof DashboardNotificationPreferences,
    label: "New Training Programs",
    description: "Get notified when new programs are added",
    icon: BookOpen,
  },
  {
    key: "dashboard_new_article" as keyof DashboardNotificationPreferences,
    label: "New Blog Articles",
    description: "Get notified when new articles are published",
    icon: FileText,
  },
  {
    key: "dashboard_weekly_activity" as keyof DashboardNotificationPreferences,
    label: "Weekly Activity Report",
    description: "Your weekly fitness activity summary",
    icon: BarChart3,
  },
  {
    key: "dashboard_checkin_reminders" as keyof DashboardNotificationPreferences,
    label: "Check-in Reminders",
    description: "Morning and evening check-in reminders",
    icon: Bell,
  },
];

export const DashboardNotificationSubscriptionManager = () => {
  const [preferences, setPreferences] = useState<DashboardNotificationPreferences>(DEFAULT_PREFERENCES);
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
          dashboard_wod: prefs.dashboard_wod !== false,
          dashboard_ritual: prefs.dashboard_ritual !== false,
          dashboard_monday_motivation: prefs.dashboard_monday_motivation !== false,
          dashboard_new_workout: prefs.dashboard_new_workout !== false,
          dashboard_new_program: prefs.dashboard_new_program !== false,
          dashboard_new_article: prefs.dashboard_new_article !== false,
          dashboard_weekly_activity: prefs.dashboard_weekly_activity !== false,
          dashboard_checkin_reminders: prefs.dashboard_checkin_reminders !== false,
        });
      }
    } catch (err) {
      console.error("Error fetching preferences:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreference = async (key: keyof DashboardNotificationPreferences, value: boolean) => {
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
      toast.success(value ? "Notification enabled" : "Notification disabled");
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
        <CardTitle className="text-lg">Dashboard Notifications</CardTitle>
        <CardDescription>
          Control which automated messages you receive in your dashboard inbox.
        </CardDescription>
        <p className="text-xs text-muted-foreground mt-2 italic">
          Note: Messages sent directly from Smarty Gym admin are always delivered and cannot be disabled.
        </p>
      </CardHeader>
      <CardContent className="space-y-1">
        {NOTIFICATION_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isChecked = preferences[option.key];
          const isDisabled = isSaving === option.key;
          
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
      </CardContent>
    </Card>
  );
};
