import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useGoogleCalendarConnection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
        .single();

      if (data && data.is_active) {
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
    // Only check if connected - allow manual sync even when auto-sync is disabled
    if (!isConnected) {
      return { synced: false, event_id: null };
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return { synced: false, event_id: null };

      const response = await supabase.functions.invoke('sync-google-calendar', {
        body: {
          action: 'create',
          scheduled_workout_id,
          event_data: eventData
        }
      });

      if (response.error) {
        console.error('Calendar sync error:', response.error);
        return { synced: false, event_id: null };
      }

      return {
        synced: response.data.success,
        event_id: response.data.event_id
      };
    } catch (error) {
      console.error('Failed to sync to calendar:', error);
      return { synced: false, event_id: null };
    }
  };

  return {
    isConnected,
    autoSyncEnabled,
    isLoading,
    checkConnection,
    syncToCalendar
  };
};
