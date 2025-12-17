import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, CalendarOff, Check, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function RitualCalendarSync() {
  const [isConnected, setIsConnected] = useState(false);
  const [isSynced, setIsSynced] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: connection } = await supabase
        .from('user_calendar_connections')
        .select('is_active, ritual_reminder_event_ids')
        .eq('user_id', user.id)
        .eq('provider', 'google')
        .maybeSingle();

      if (connection?.is_active) {
        setIsConnected(true);
        // Check if we have event IDs stored (meaning sync is active)
        const eventIds = connection.ritual_reminder_event_ids as { 
          morning_event_id?: string; 
          midday_event_id?: string; 
          evening_event_id?: string; 
        } | null;
        setIsSynced(!!eventIds?.morning_event_id && !!eventIds?.midday_event_id && !!eventIds?.evening_event_id);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error checking calendar sync status:', error);
      setLoading(false);
    }
  };

  const toggleSync = async () => {
    setUpdating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please log in to manage calendar sync');
        return;
      }

      if (isSynced) {
        // Delete the recurring events
        const { data, error } = await supabase.functions.invoke('sync-google-calendar', {
          body: { action: 'delete-ritual-reminders' }
        });

        if (error) throw error;
        
        if (data?.needsReconnect) {
          toast.error('Please reconnect your Google Calendar');
          return;
        }

        if (data?.success) {
          setIsSynced(false);
          toast.success('Ritual reminders removed from Google Calendar');
        } else {
          throw new Error(data?.error || 'Failed to remove reminders');
        }
      } else {
        // Create the recurring events
        const { data, error } = await supabase.functions.invoke('sync-google-calendar', {
          body: { action: 'create-ritual-reminders' }
        });

        if (error) throw error;
        
        if (data?.needsReconnect) {
          toast.error('Please reconnect your Google Calendar');
          return;
        }

        if (data?.success) {
          setIsSynced(true);
          toast.success('Ritual reminders added to Google Calendar (8 AM, 1 PM, 5 PM daily)');
        } else {
          throw new Error(data?.error || 'Failed to create reminders');
        }
      }
    } catch (error: any) {
      console.error('Error toggling calendar sync:', error);
      toast.error(error.message || 'Failed to update calendar sync');
    } finally {
      setUpdating(false);
    }
  };

  // Don't show if still loading or not connected to Google Calendar
  if (loading || !isConnected) {
    return null;
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-center sm:text-left">
            {isSynced ? (
              <Calendar className="h-5 w-5 text-primary flex-shrink-0" />
            ) : (
              <CalendarOff className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            )}
            <div>
              <p className="font-medium text-sm">
                {isSynced ? 'Calendar Sync Active' : 'Sync to Google Calendar?'}
              </p>
              <p className="text-xs text-muted-foreground">
                {isSynced 
                  ? 'Daily reminders at 8 AM, 1 PM & 5 PM in your calendar' 
                  : 'Add recurring ritual reminders to your calendar'}
              </p>
            </div>
          </div>
          <Button
            variant={isSynced ? "outline" : "default"}
            size="sm"
            onClick={toggleSync}
            disabled={updating}
            className="flex-shrink-0"
          >
            {updating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : isSynced ? (
              <Check className="mr-2 h-4 w-4" />
            ) : (
              <Calendar className="mr-2 h-4 w-4" />
            )}
            {isSynced ? 'Synced' : 'Sync'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
