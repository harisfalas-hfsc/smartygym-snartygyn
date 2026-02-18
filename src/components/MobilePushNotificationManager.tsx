import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, Dumbbell, Sun, Zap, Plus, BookOpen, FileText, BarChart3, Bell, Smartphone, CalendarClock, Trophy } from "lucide-react";
import { toast } from "sonner";

interface MobilePushPreferences {
  mobile_push_wod: boolean;
  mobile_push_ritual: boolean;
  mobile_push_monday_motivation: boolean;
  mobile_push_new_workout: boolean;
  mobile_push_new_program: boolean;
  mobile_push_new_article: boolean;
  mobile_push_weekly_activity: boolean;
  mobile_push_checkin_reminders: boolean;
  mobile_push_scheduled_workout_reminders: boolean;
  mobile_push_scheduled_program_reminders: boolean;
  mobile_push_goal_achievement: boolean;
  mobile_push_master: boolean;
}

const DEFAULT_PREFERENCES: MobilePushPreferences = {
  mobile_push_wod: true,
  mobile_push_ritual: true,
  mobile_push_monday_motivation: true,
  mobile_push_new_workout: true,
  mobile_push_new_program: true,
  mobile_push_new_article: true,
  mobile_push_weekly_activity: true,
  mobile_push_checkin_reminders: true,
  mobile_push_scheduled_workout_reminders: true,
  mobile_push_scheduled_program_reminders: true,
  mobile_push_goal_achievement: true,
  mobile_push_master: true,
};

const NOTIFICATION_OPTIONS = [
  {
    key: "mobile_push_wod" as keyof MobilePushPreferences,
    label: "Workout of the Day",
    description: "Daily WOD push notification on your mobile device",
    icon: Dumbbell,
  },
  {
    key: "mobile_push_ritual" as keyof MobilePushPreferences,
    label: "Smarty Ritual",
    description: "Daily ritual push notifications",
    icon: Sun,
  },
  {
    key: "mobile_push_monday_motivation" as keyof MobilePushPreferences,
    label: "Monday Motivation",
    description: "Weekly motivational push every Monday",
    icon: Zap,
  },
  {
    key: "mobile_push_new_workout" as keyof MobilePushPreferences,
    label: "New Workouts",
    description: "Get notified when new workouts are added",
    icon: Plus,
  },
  {
    key: "mobile_push_new_program" as keyof MobilePushPreferences,
    label: "New Training Programs",
    description: "Get notified when new programs are added",
    icon: BookOpen,
  },
  {
    key: "mobile_push_new_article" as keyof MobilePushPreferences,
    label: "New Blog Articles",
    description: "Get notified when new articles are published",
    icon: FileText,
  },
  {
    key: "mobile_push_weekly_activity" as keyof MobilePushPreferences,
    label: "Weekly Activity Report",
    description: "Your weekly fitness activity summary",
    icon: BarChart3,
  },
  {
    key: "mobile_push_checkin_reminders" as keyof MobilePushPreferences,
    label: "Check-in Reminders",
    description: "Morning and evening check-in reminders",
    icon: Bell,
  },
  {
    key: "mobile_push_scheduled_workout_reminders" as keyof MobilePushPreferences,
    label: "Scheduled Workout Reminders",
    description: "Get reminded about your scheduled workouts",
    icon: CalendarClock,
  },
  {
    key: "mobile_push_scheduled_program_reminders" as keyof MobilePushPreferences,
    label: "Scheduled Program Reminders",
    description: "Get reminded about your scheduled training programs",
    icon: CalendarClock,
  },
  {
    key: "mobile_push_goal_achievement" as keyof MobilePushPreferences,
    label: "Goal Achievements",
    description: "Get notified when you reach your fitness goals",
    icon: Trophy,
  },
];

export const MobilePushNotificationManager = () => {
  const [preferences, setPreferences] = useState<MobilePushPreferences>(DEFAULT_PREFERENCES);
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
          mobile_push_wod: prefs.mobile_push_wod !== false,
          mobile_push_ritual: prefs.mobile_push_ritual !== false,
          mobile_push_monday_motivation: prefs.mobile_push_monday_motivation !== false,
          mobile_push_new_workout: prefs.mobile_push_new_workout !== false,
          mobile_push_new_program: prefs.mobile_push_new_program !== false,
          mobile_push_new_article: prefs.mobile_push_new_article !== false,
          mobile_push_weekly_activity: prefs.mobile_push_weekly_activity !== false,
          mobile_push_checkin_reminders: prefs.mobile_push_checkin_reminders !== false,
          mobile_push_scheduled_workout_reminders: prefs.mobile_push_scheduled_workout_reminders !== false,
          mobile_push_scheduled_program_reminders: prefs.mobile_push_scheduled_program_reminders !== false,
          mobile_push_goal_achievement: prefs.mobile_push_goal_achievement !== false,
          mobile_push_master: prefs.mobile_push_master !== false,
        });
      }
    } catch (err) {
      console.error("Error fetching preferences:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreference = async (key: keyof MobilePushPreferences, value: boolean) => {
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
      toast.success(value ? "Mobile notification enabled" : "Mobile notification disabled");
    } catch (err) {
      console.error("Error updating preference:", err);
      toast.error("Failed to update preference");
    } finally {
      setIsSaving(null);
    }
  };

  const toggleAllPreferences = async (enable: boolean) => {
    setIsSaving("mobile_push_master");
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to update preferences");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("notification_preferences")
        .eq("user_id", user.id)
        .single();

      const currentPrefs = (profile?.notification_preferences as Record<string, any>) || {};
      
      const updatedPrefs = {
        ...currentPrefs,
        mobile_push_master: enable,
        mobile_push_wod: enable,
        mobile_push_ritual: enable,
        mobile_push_monday_motivation: enable,
        mobile_push_new_workout: enable,
        mobile_push_new_program: enable,
        mobile_push_new_article: enable,
        mobile_push_weekly_activity: enable,
        mobile_push_checkin_reminders: enable,
        mobile_push_scheduled_workout_reminders: enable,
        mobile_push_scheduled_program_reminders: enable,
        mobile_push_goal_achievement: enable,
      };

      const { error } = await supabase
        .from("profiles")
        .update({ notification_preferences: updatedPrefs })
        .eq("user_id", user.id);

      if (error) {
        console.error("Error updating preferences:", error);
        toast.error("Failed to update preferences");
        return;
      }

      setPreferences({
        mobile_push_master: enable,
        mobile_push_wod: enable,
        mobile_push_ritual: enable,
        mobile_push_monday_motivation: enable,
        mobile_push_new_workout: enable,
        mobile_push_new_program: enable,
        mobile_push_new_article: enable,
        mobile_push_weekly_activity: enable,
        mobile_push_checkin_reminders: enable,
        mobile_push_scheduled_workout_reminders: enable,
        mobile_push_scheduled_program_reminders: enable,
        mobile_push_goal_achievement: enable,
      });
      
      toast.success(enable ? "All mobile notifications enabled" : "All mobile notifications disabled");
    } catch (err) {
      console.error("Error updating preferences:", err);
      toast.error("Failed to update preferences");
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
        <CardTitle className="text-lg flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Mobile App Push Notifications
        </CardTitle>
        <CardDescription>
          Control which push notifications you receive on the Smarty Gym mobile app.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        {/* Master Toggle */}
        <div className="flex items-center justify-between py-4 border-b bg-muted/30 rounded-lg px-3 mb-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 p-2 rounded-lg bg-primary/20">
              <Smartphone className="h-4 w-4 text-primary" />
            </div>
            <div className="space-y-0.5">
              <Label htmlFor="mobile_push_master" className="text-sm font-semibold cursor-pointer">
                All Mobile Push Notifications
              </Label>
              <p className="text-xs text-muted-foreground">
                Master toggle to enable/disable all mobile app notifications
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isSaving === "mobile_push_master" && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
            <Switch
              id="mobile_push_master"
              checked={preferences.mobile_push_master}
              onCheckedChange={(checked) => toggleAllPreferences(checked)}
              disabled={isSaving === "mobile_push_master"}
            />
          </div>
        </div>

        {/* Individual Options */}
        {NOTIFICATION_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isChecked = preferences[option.key] && preferences.mobile_push_master;
          const isDisabled = isSaving === option.key || !preferences.mobile_push_master;
          
          return (
            <div
              key={option.key}
              className={`flex items-center justify-between py-4 border-b last:border-0 ${
                !preferences.mobile_push_master ? "opacity-50" : ""
              }`}
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
