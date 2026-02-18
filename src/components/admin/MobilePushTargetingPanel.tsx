import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Users, Dumbbell, Sun, Zap, Plus, BookOpen, FileText, BarChart3, Bell, Smartphone, RefreshCw, Copy, Check, Trophy, CalendarClock } from "lucide-react";
import { toast } from "sonner";

interface PushStats {
  total_users: number;
  mobile_push_master: number;
  mobile_push_wod: number;
  mobile_push_ritual: number;
  mobile_push_monday_motivation: number;
  mobile_push_new_workout: number;
  mobile_push_new_program: number;
  mobile_push_new_article: number;
  mobile_push_weekly_activity: number;
  mobile_push_checkin_reminders: number;
  mobile_push_goal_achievement: number;
  mobile_push_scheduled_workout_reminders: number;
  mobile_push_scheduled_program_reminders: number;
}

const PREFERENCE_OPTIONS = [
  {
    key: "mobile_push_wod",
    label: "Workout of the Day",
    icon: Dumbbell,
  },
  {
    key: "mobile_push_ritual",
    label: "Smarty Ritual",
    icon: Sun,
  },
  {
    key: "mobile_push_monday_motivation",
    label: "Monday Motivation",
    icon: Zap,
  },
  {
    key: "mobile_push_new_workout",
    label: "New Workouts",
    icon: Plus,
  },
  {
    key: "mobile_push_new_program",
    label: "New Programs",
    icon: BookOpen,
  },
  {
    key: "mobile_push_new_article",
    label: "New Articles",
    icon: FileText,
  },
  {
    key: "mobile_push_weekly_activity",
    label: "Weekly Activity",
    icon: BarChart3,
  },
  {
    key: "mobile_push_checkin_reminders",
    label: "Check-in Reminders",
    icon: Bell,
  },
  {
    key: "mobile_push_goal_achievement",
    label: "Goal Achievements",
    icon: Trophy,
  },
  {
    key: "mobile_push_scheduled_workout_reminders",
    label: "Scheduled Workout Reminders",
    icon: CalendarClock,
  },
  {
    key: "mobile_push_scheduled_program_reminders",
    label: "Scheduled Program Reminders",
    icon: CalendarClock,
  },
];

export const MobilePushTargetingPanel = () => {
  const [stats, setStats] = useState<PushStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      // Fetch all profiles with notification preferences
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("notification_preferences")
        .not("notification_preferences", "is", null);

      if (error) throw error;

      const total_users = profiles?.length || 0;
      
      const countEnabled = (key: string) => {
        return profiles?.filter(p => {
          const prefs = p.notification_preferences as Record<string, any>;
          // For master toggle, count if explicitly true or not set (default true)
          if (key === "mobile_push_master") {
            return prefs?.mobile_push_master !== false;
          }
          // For individual prefs, only count if master is enabled AND this pref is enabled
          return prefs?.mobile_push_master !== false && prefs?.[key] !== false;
        }).length || 0;
      };

      setStats({
        total_users,
        mobile_push_master: countEnabled("mobile_push_master"),
        mobile_push_wod: countEnabled("mobile_push_wod"),
        mobile_push_ritual: countEnabled("mobile_push_ritual"),
        mobile_push_monday_motivation: countEnabled("mobile_push_monday_motivation"),
        mobile_push_new_workout: countEnabled("mobile_push_new_workout"),
        mobile_push_new_program: countEnabled("mobile_push_new_program"),
        mobile_push_new_article: countEnabled("mobile_push_new_article"),
        mobile_push_weekly_activity: countEnabled("mobile_push_weekly_activity"),
        mobile_push_checkin_reminders: countEnabled("mobile_push_checkin_reminders"),
        mobile_push_goal_achievement: countEnabled("mobile_push_goal_achievement"),
        mobile_push_scheduled_workout_reminders: countEnabled("mobile_push_scheduled_workout_reminders"),
        mobile_push_scheduled_program_reminders: countEnabled("mobile_push_scheduled_program_reminders"),
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
      toast.error("Failed to load targeting stats");
    } finally {
      setIsLoading(false);
    }
  };

  const copyCount = (key: string, count: number) => {
    navigator.clipboard.writeText(count.toString());
    setCopiedKey(key);
    toast.success(`Copied: ${count} users`);
    setTimeout(() => setCopiedKey(null), 2000);
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
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Mobile Push Notification Targeting
            </CardTitle>
            <CardDescription>
              User counts by notification preference for AppMySite manual sending
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchStats} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Master Stats */}
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold">Total Users with Preferences</p>
              <p className="text-sm text-muted-foreground">
                {stats?.mobile_push_master || 0} have mobile push enabled (master toggle)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {stats?.total_users || 0}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => copyCount("total", stats?.total_users || 0)}
            >
              {copiedKey === "total" ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Individual Preference Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PREFERENCE_OPTIONS.map((option) => {
            const Icon = option.icon;
            const count = stats?.[option.key as keyof PushStats] || 0;
            const percentage = stats?.total_users 
              ? Math.round((count / stats.total_users) * 100) 
              : 0;
            
            return (
              <div
                key={option.key}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{option.label}</p>
                    <p className="text-xs text-muted-foreground">{percentage}% of users</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono">
                    {count}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => copyCount(option.key, count)}
                  >
                    {copiedKey === option.key ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground mt-4 italic">
          Note: Counts show users who have the master mobile push toggle enabled AND the specific notification type enabled. 
          Default is enabled for all types unless explicitly disabled by the user.
        </p>
      </CardContent>
    </Card>
  );
};
