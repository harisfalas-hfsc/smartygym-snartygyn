import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Dumbbell, Sun, Zap, Plus, BookOpen, FileText, BarChart3, Bell, Calendar, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

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
  
  // Google Calendar state
  const [isCalendarConnected, setIsCalendarConnected] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false);
  const [isCalendarLoading, setIsCalendarLoading] = useState(true);
  const [isCalendarSaving, setIsCalendarSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportMessage, setExportMessage] = useState("");

  useEffect(() => {
    fetchPreferences();
    checkCalendarConnection();
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

  const checkCalendarConnection = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsCalendarLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_calendar_connections")
        .select("is_active, auto_sync_enabled")
        .eq("user_id", user.id)
        .eq("provider", "google")
        .maybeSingle();

      if (error) {
        console.error("Error checking calendar connection:", error);
        setIsCalendarLoading(false);
        return;
      }

      if (data) {
        setIsCalendarConnected(data.is_active ?? false);
        setAutoSyncEnabled(data.auto_sync_enabled ?? false);
      }
    } catch (err) {
      console.error("Error checking calendar connection:", err);
    } finally {
      setIsCalendarLoading(false);
    }
  };

  const handleCalendarConnect = async () => {
    setIsCalendarSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please log in to connect your calendar");
        return;
      }

      const currentUrl = window.location.origin + window.location.pathname;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-calendar-oauth?action=connect&redirect_url=${encodeURIComponent(currentUrl)}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (data.auth_url) {
        window.location.href = data.auth_url;
      } else {
        throw new Error(data.error || 'Failed to get authorization URL');
      }
    } catch (err) {
      console.error("Error connecting calendar:", err);
      toast.error("Failed to connect Google Calendar");
    } finally {
      setIsCalendarSaving(false);
    }
  };

  const handleCalendarDisconnect = async () => {
    setIsCalendarSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("user_calendar_connections")
        .delete()
        .eq("user_id", user.id)
        .eq("provider", "google");

      if (error) {
        console.error("Error disconnecting calendar:", error);
        toast.error("Failed to disconnect calendar");
        return;
      }

      setIsCalendarConnected(false);
      setAutoSyncEnabled(false);
      toast.success("Google Calendar disconnected");
    } catch (err) {
      console.error("Error disconnecting calendar:", err);
      toast.error("Failed to disconnect calendar");
    } finally {
      setIsCalendarSaving(false);
    }
  };

  const bulkExportActivities = async () => {
    setIsExporting(true);
    setExportProgress(0);
    setExportMessage("Starting export...");
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please log in to export activities");
        return;
      }

      setExportProgress(20);
      setExportMessage("Fetching your activities...");

      // Get date range (last 6 months to today)
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6);
      const startDateStr = startDate.toISOString().split('T')[0];

      setExportProgress(40);
      setExportMessage("Syncing to Google Calendar...");

      const response = await supabase.functions.invoke('sync-google-calendar', {
        body: {
          action: 'bulk-export',
          activities: {
            activity_types: ['workouts', 'programs', 'checkins'],
            start_date: startDateStr,
            end_date: endDate
          }
        }
      });

      setExportProgress(100);

      if (response.error) {
        console.error('Bulk export error:', response.error);
        
        if (response.data?.reconnect_required) {
          toast.error('Please reconnect your Google Calendar', {
            description: 'Your calendar connection has expired'
          });
          setIsCalendarConnected(false);
          return;
        }
        
        toast.error('Failed to export activities', {
          description: response.error.message
        });
        return;
      }

      const exported = response.data?.exported || 0;
      const failed = response.data?.failed || 0;

      if (exported > 0) {
        toast.success(`Exported ${exported} activities to Google Calendar`, {
          description: failed > 0 ? `${failed} failed to export` : 'All activities synced successfully!'
        });
      } else {
        toast.info('No activities to export', {
          description: 'Complete some workouts or check-ins first'
        });
      }
    } catch (err) {
      console.error("Error exporting activities:", err);
      toast.error("Failed to export activities");
    } finally {
      setIsExporting(false);
      setExportProgress(0);
      setExportMessage("");
    }
  };

  const handleAutoSyncToggle = async (enabled: boolean) => {
    setIsCalendarSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("user_calendar_connections")
        .update({ auto_sync_enabled: enabled })
        .eq("user_id", user.id)
        .eq("provider", "google");

      if (error) {
        console.error("Error updating auto-sync:", error);
        toast.error("Failed to update auto-sync setting");
        return;
      }

      setAutoSyncEnabled(enabled);
      
      if (enabled) {
        toast.success("Auto-sync enabled", {
          description: "New activities will automatically sync to your calendar"
        });
        
        // Auto-export past activities when enabling
        toast.info("Exporting your past activities...", {
          description: "This may take a moment"
        });
        await bulkExportActivities();
      } else {
        toast.success("Auto-sync disabled");
      }
    } catch (err) {
      console.error("Error updating auto-sync:", err);
      toast.error("Failed to update auto-sync setting");
    } finally {
      setIsCalendarSaving(false);
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

        {/* Google Calendar Integration Row */}
        <div className="flex items-center justify-between py-4 border-b">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 p-2 rounded-lg bg-primary/10">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">
                Google Calendar Integration
              </Label>
              <p className="text-xs text-muted-foreground">
                {isCalendarConnected 
                  ? "Sync your workouts and activities with Google Calendar"
                  : "Connect to sync scheduled workouts with your Google Calendar"
                }
              </p>
              <p className="text-xs text-primary font-medium">
                {isCalendarLoading ? "Checking..." : isCalendarConnected ? "✓ Connected" : "Not connected"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(isCalendarLoading || isCalendarSaving) && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
            {!isCalendarLoading && (
              isCalendarConnected ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="auto-sync-toggle"
                      checked={autoSyncEnabled}
                      onCheckedChange={handleAutoSyncToggle}
                      disabled={isCalendarSaving || isExporting}
                    />
                    <Label htmlFor="auto-sync-toggle" className="text-xs text-muted-foreground cursor-pointer">
                      Auto-sync
                    </Label>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={bulkExportActivities}
                    disabled={isCalendarSaving || isExporting}
                    className="text-xs"
                  >
                    {isExporting ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <RefreshCw className="h-3 w-3 mr-1" />
                    )}
                    Sync Now
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCalendarConnect}
                  disabled={isCalendarSaving}
                >
                  Connect
                </Button>
              )
            )}
          </div>
        </div>

        {/* Export Progress */}
        {isExporting && (
          <div className="py-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{exportMessage}</span>
              <span>{exportProgress}%</span>
            </div>
            <Progress value={exportProgress} className="h-2" />
          </div>
        )}

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
