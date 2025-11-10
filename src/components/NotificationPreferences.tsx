import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Bell, Mail, TrendingUp, Calendar, Users, Trophy, Save } from "lucide-react";
import { toast } from "sonner";

interface NotificationPrefs {
  workout_reminders: boolean;
  newsletter: boolean;
  promotional_emails: boolean;
  renewal_reminders: boolean;
  community_updates: boolean;
  workout_completion_emails: boolean;
}

export function NotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPrefs>({
    workout_reminders: true,
    newsletter: true,
    promotional_emails: true,
    renewal_reminders: true,
    community_updates: true,
    workout_completion_emails: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setPreferences({
          workout_reminders: data.workout_reminders,
          newsletter: data.newsletter,
          promotional_emails: data.promotional_emails,
          renewal_reminders: data.renewal_reminders,
          community_updates: data.community_updates,
          workout_completion_emails: data.workout_completion_emails,
        });
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      toast.error('Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: keyof NotificationPrefs) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...preferences,
        });

      if (error) throw error;

      toast.success('Notification preferences saved');
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-pulse text-lg">Loading preferences...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Manage how you want to receive updates and notifications from SmartyGym
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Workout Related */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">Workout Notifications</h3>
          </div>
          <div className="space-y-4 pl-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex-1 space-y-1">
                <Label htmlFor="workout_reminders">Workout Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Receive reminders to complete your scheduled workouts
                </p>
              </div>
              <Switch
                id="workout_reminders"
                checked={preferences.workout_reminders}
                onCheckedChange={() => handleToggle('workout_reminders')}
              />
            </div>

            <div className="flex items-center justify-between space-x-4">
              <div className="flex-1 space-y-1">
                <Label htmlFor="workout_completion_emails">Completion Celebrations</Label>
                <p className="text-sm text-muted-foreground">
                  Get congratulatory emails when you complete workouts and reach milestones
                </p>
              </div>
              <Switch
                id="workout_completion_emails"
                checked={preferences.workout_completion_emails}
                onCheckedChange={() => handleToggle('workout_completion_emails')}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Communication */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">Email Communications</h3>
          </div>
          <div className="space-y-4 pl-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex-1 space-y-1">
                <Label htmlFor="newsletter">Newsletter</Label>
                <p className="text-sm text-muted-foreground">
                  Weekly fitness tips, workout suggestions, and platform updates
                </p>
              </div>
              <Switch
                id="newsletter"
                checked={preferences.newsletter}
                onCheckedChange={() => handleToggle('newsletter')}
              />
            </div>

            <div className="flex items-center justify-between space-x-4">
              <div className="flex-1 space-y-1">
                <Label htmlFor="promotional_emails">Promotional Emails</Label>
                <p className="text-sm text-muted-foreground">
                  Special offers, new features, and exclusive deals
                </p>
              </div>
              <Switch
                id="promotional_emails"
                checked={preferences.promotional_emails}
                onCheckedChange={() => handleToggle('promotional_emails')}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Account & Subscription */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">Account & Subscription</h3>
          </div>
          <div className="space-y-4 pl-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex-1 space-y-1">
                <Label htmlFor="renewal_reminders">Renewal Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified before your subscription renews or expires
                </p>
              </div>
              <Switch
                id="renewal_reminders"
                checked={preferences.renewal_reminders}
                onCheckedChange={() => handleToggle('renewal_reminders')}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Community */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">Community Updates</h3>
          </div>
          <div className="space-y-4 pl-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex-1 space-y-1">
                <Label htmlFor="community_updates">Community Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Updates about comments, replies, and community activities
                </p>
              </div>
              <Switch
                id="community_updates"
                checked={preferences.community_updates}
                onCheckedChange={() => handleToggle('community_updates')}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Save Button */}
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-muted-foreground">
            {hasChanges ? 'You have unsaved changes' : 'All changes saved'}
          </p>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || saving}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
