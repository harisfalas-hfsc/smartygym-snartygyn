import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, BellOff, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function CheckinReminderSubscription() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('notification_preferences')
        .eq('user_id', user.id)
        .single();

      if (profile?.notification_preferences) {
        const prefs = profile.notification_preferences as Record<string, boolean>;
        setIsSubscribed(prefs.checkin_reminders === true);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error checking subscription status:', error);
      setLoading(false);
    }
  };

  const toggleSubscription = async () => {
    setUpdating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to manage reminders');
        return;
      }

      // Get current preferences
      const { data: profile } = await supabase
        .from('profiles')
        .select('notification_preferences')
        .eq('user_id', user.id)
        .single();

      const currentPrefs = (profile?.notification_preferences as Record<string, boolean>) || {};
      const newValue = !isSubscribed;

      // Update preferences
      const { error } = await supabase
        .from('profiles')
        .update({
          notification_preferences: {
            ...currentPrefs,
            checkin_reminders: newValue
          }
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setIsSubscribed(newValue);
      toast.success(newValue 
        ? 'Check-in reminders enabled! You will receive notifications at 8:00 AM and 8:00 PM.' 
        : 'Check-in reminders disabled.'
      );
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast.error('Failed to update reminder preferences');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return null;
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-center sm:text-left">
            {isSubscribed ? (
              <Bell className="h-5 w-5 text-primary flex-shrink-0" />
            ) : (
              <BellOff className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            )}
            <div>
              <p className="font-medium text-sm">
                {isSubscribed ? 'Reminders Active' : 'Get Check-in Reminders?'}
              </p>
              <p className="text-xs text-muted-foreground">
                {isSubscribed 
                  ? 'Daily reminders at 8:00 AM & 8:00 PM' 
                  : 'Receive notifications when check-in windows open'}
              </p>
            </div>
          </div>
          <Button
            variant={isSubscribed ? "outline" : "default"}
            size="sm"
            onClick={toggleSubscription}
            disabled={updating}
            className="flex-shrink-0"
          >
            {updating ? (
              <span className="animate-spin mr-2">⏳</span>
            ) : isSubscribed ? (
              <Check className="mr-2 h-4 w-4" />
            ) : (
              <Bell className="mr-2 h-4 w-4" />
            )}
            {isSubscribed ? 'Subscribed' : 'Subscribe'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}