import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useGoogleCalendarConnection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const checkConnection = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_calendar_connections')
        .select('is_active, auto_sync_enabled')
        .eq('user_id', session.user.id)
        .eq('provider', 'google')
        .maybeSingle();

      if (error) {
        console.error('Error checking calendar connection:', error);
        setIsConnected(false);
        setAutoSyncEnabled(false);
      } else if (data && data.is_active) {
        setIsConnected(true);
        setAutoSyncEnabled(data.auto_sync_enabled ?? false);
      } else {
        setIsConnected(false);
        setAutoSyncEnabled(false);
      }
    } catch (error) {
      console.error('Error checking calendar connection:', error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const syncToCalendar = async (eventData: {
    scheduled_date: string;
    scheduled_time?: string;
    content_name: string;
    content_type: 'workout' | 'program';
    notes?: string;
  }, scheduled_workout_id?: string) => {
    if (!isConnected) {
      console.log('Calendar not connected, skipping sync');
      return { synced: false, event_id: null };
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('No session for calendar sync');
        return { synced: false, event_id: null };
      }

      console.log('Syncing to Google Calendar:', eventData);

      const response = await supabase.functions.invoke('sync-google-calendar', {
        body: {
          action: 'create',
          scheduled_workout_id,
          event_data: eventData
        }
      });

      if (response.error) {
        console.error('Calendar sync error:', response.error);
        return { synced: false, event_id: null, error: response.error.message };
      }

      if (response.data?.reconnect_required) {
        toast.error('Please reconnect your Google Calendar', {
          description: 'Your calendar connection has expired'
        });
        setIsConnected(false);
        return { synced: false, event_id: null, reconnect_required: true };
      }

      if (response.data?.success) {
        console.log('Successfully synced to Google Calendar:', response.data.event_id);
        return {
          synced: true,
          event_id: response.data.event_id
        };
      }

      return { synced: false, event_id: null };
    } catch (error) {
      console.error('Failed to sync to calendar:', error);
      return { synced: false, event_id: null };
    }
  };

  const syncCompletedActivity = async (activityData: {
    name: string;
    type: 'workout' | 'program' | 'checkin';
    completed_at: string;
    score?: number;
    category?: string;
  }) => {
    if (!isConnected || !autoSyncEnabled) {
      return { synced: false };
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return { synced: false };

      const completedDate = new Date(activityData.completed_at);
      
      let summary = '';
      let description = '';
      
      if (activityData.type === 'workout') {
        summary = `✅ ${activityData.name}`;
        description = 'Completed SmartyGym Workout';
      } else if (activityData.type === 'program') {
        summary = `🏆 ${activityData.name} - Completed!`;
        description = 'Completed SmartyGym Training Program';
      } else if (activityData.type === 'checkin') {
        summary = `📊 Daily Check-in (Score: ${activityData.score || 'N/A'})`;
        description = `SmartyGym Daily Check-in\nCategory: ${activityData.category || 'N/A'}`;
      }

      const response = await supabase.functions.invoke('sync-google-calendar', {
        body: {
          action: 'create',
          event_data: {
            scheduled_date: completedDate.toISOString().split('T')[0],
            scheduled_time: completedDate.toTimeString().slice(0, 5),
            content_name: summary,
            content_type: activityData.type,
            notes: description
          }
        }
      });

      if (response.error) {
        console.error('Error syncing completed activity:', response.error);
        return { synced: false };
      }

      return { synced: response.data?.success || false };
    } catch (error) {
      console.error('Failed to sync completed activity:', error);
      return { synced: false };
    }
  };

  const bulkExportActivities = useCallback(async (onProgress?: (progress: number, message: string) => void) => {
    if (!isConnected) {
      toast.error('Please connect your Google Calendar first');
      return { success: false, exported: 0 };
    }

    setIsSyncing(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please log in to export activities');
        return { success: false, exported: 0 };
      }

      onProgress?.(10, 'Starting export...');

      // Get date range (last 6 months to today)
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6);
      const startDateStr = startDate.toISOString().split('T')[0];

      onProgress?.(20, 'Fetching your activities...');

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

      if (response.error) {
        console.error('Bulk export error:', response.error);
        
        if (response.error.message?.includes('reconnect')) {
          toast.error('Please reconnect your Google Calendar', {
            description: 'Your calendar connection has expired'
          });
          setIsConnected(false);
          return { success: false, exported: 0, reconnect_required: true };
        }
        
        toast.error('Failed to export activities', {
          description: response.error.message
        });
        return { success: false, exported: 0 };
      }

      onProgress?.(100, 'Export complete!');

      const exported = response.data?.exported || 0;
      const failed = response.data?.failed || 0;

      if (exported > 0) {
        toast.success(`Exported ${exported} activities to Google Calendar`, {
          description: failed > 0 ? `${failed} failed to export` : undefined
        });
      } else {
        toast.info('No activities to export', {
          description: 'Complete some workouts or check-ins first'
        });
      }

      return { success: true, exported, failed };
    } catch (error) {
      console.error('Bulk export failed:', error);
      toast.error('Failed to export activities');
      return { success: false, exported: 0 };
    } finally {
      setIsSyncing(false);
    }
  }, [isConnected]);

  const setAutoSync = async (enabled: boolean) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return false;

      const { error } = await supabase
        .from('user_calendar_connections')
        .update({ auto_sync_enabled: enabled })
        .eq('user_id', session.user.id)
        .eq('provider', 'google');

      if (error) {
        console.error('Error updating auto-sync:', error);
        return false;
      }

      setAutoSyncEnabled(enabled);
      return true;
    } catch (error) {
      console.error('Failed to update auto-sync:', error);
      return false;
    }
  };

  return {
    isConnected,
    autoSyncEnabled,
    isLoading,
    isSyncing,
    checkConnection,
    syncToCalendar,
    syncCompletedActivity,
    bulkExportActivities,
    setAutoSync
  };
};
