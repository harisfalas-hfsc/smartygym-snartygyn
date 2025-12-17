import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, CalendarOff, Check, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LogBookCalendarSyncProps {
  oneRMHistory: any[];
  bmrHistory: any[];
  calorieHistory: any[];
  measurementHistory: any[];
}

export function LogBookCalendarSync({ 
  oneRMHistory, 
  bmrHistory, 
  calorieHistory, 
  measurementHistory 
}: LogBookCalendarSyncProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [loading, setLoading] = useState(true);

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
        .select('is_active')
        .eq('user_id', user.id)
        .eq('provider', 'google')
        .maybeSingle();

      setIsConnected(!!connection?.is_active);
      setLoading(false);
    } catch (error) {
      console.error('Error checking calendar connection status:', error);
      setLoading(false);
    }
  };

  const syncLogBookData = async () => {
    setIsSyncing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please log in to sync calendar');
        return;
      }

      // Prepare activities to sync
      const activities: any[] = [];

      // Add 1RM history
      oneRMHistory.forEach(record => {
        activities.push({
          type: '1rm',
          date: record.created_at.split('T')[0],
          summary: `📊 1RM: ${record.one_rm_result.toFixed(1)}kg${record.exercise_name ? ` (${record.exercise_name})` : ''}`,
          description: `1RM Calculator Result\nWeight: ${record.weight_lifted}kg × ${record.reps} reps = ${record.one_rm_result.toFixed(1)}kg`
        });
      });

      // Add BMR history
      bmrHistory.forEach(record => {
        activities.push({
          type: 'bmr',
          date: record.created_at.split('T')[0],
          summary: `📊 BMR: ${record.bmr_result.toFixed(0)} cal/day`,
          description: `BMR Calculator Result\n${record.gender === 'male' ? 'Male' : 'Female'}, ${record.age} years, ${record.height}cm, ${record.weight}kg`
        });
      });

      // Add Macro/Calorie history
      calorieHistory.forEach(record => {
        activities.push({
          type: 'macro',
          date: record.created_at.split('T')[0],
          summary: `📊 Macros: ${record.target_calories.toFixed(0)} cal/day`,
          description: `Macro Calculator Result\nGoal: ${record.goal}\nActivity: ${record.activity_level.replace('_', ' ')}\nMaintenance: ${record.maintenance_calories} cal`
        });
      });

      // Add Measurements
      measurementHistory.forEach(record => {
        const result = record.tool_result || {};
        const parts = [];
        if (result.weight) parts.push(`${result.weight}kg`);
        if (result.body_fat) parts.push(`BF: ${result.body_fat}%`);
        if (result.muscle_mass) parts.push(`MM: ${result.muscle_mass}kg`);
        
        activities.push({
          type: 'measurement',
          date: record.created_at.split('T')[0],
          summary: `📊 Measurement: ${parts.join(' | ') || 'Body Measurement'}`,
          description: `Body Measurement\n${parts.join('\n')}`
        });
      });

      if (activities.length === 0) {
        toast.info('No calculator or measurement records to sync');
        return;
      }

      const { data, error } = await supabase.functions.invoke('sync-google-calendar', {
        body: { action: 'sync-logbook-data', activities }
      });

      if (error) throw error;
      
      if (data?.needsReconnect) {
        toast.error('Please reconnect your Google Calendar');
        return;
      }

      if (data?.success) {
        toast.success(`Synced ${data.synced || activities.length} records to Google Calendar`);
      } else {
        throw new Error(data?.error || 'Failed to sync records');
      }
    } catch (error: any) {
      console.error('Error syncing logbook data:', error);
      toast.error(error.message || 'Failed to sync calendar');
    } finally {
      setIsSyncing(false);
    }
  };

  // Don't show if still loading or not connected to Google Calendar
  if (loading || !isConnected) {
    return null;
  }

  const totalRecords = oneRMHistory.length + bmrHistory.length + calorieHistory.length + measurementHistory.length;

  return (
    <Card className="border-primary/20 bg-primary/5 mt-3">
      <CardContent className="py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <Calendar className="h-5 w-5 text-primary flex-shrink-0" />
            <div>
              <p className="font-medium text-sm">
                Sync Calculators & Measurements
              </p>
              <p className="text-xs text-muted-foreground">
                Export {totalRecords} records to Google Calendar as past events
              </p>
            </div>
          </div>
          <Button
            variant="default"
            size="sm"
            onClick={syncLogBookData}
            disabled={isSyncing || totalRecords === 0}
            className="flex-shrink-0"
          >
            {isSyncing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Calendar className="mr-2 h-4 w-4" />
            )}
            {isSyncing ? 'Syncing...' : 'Export to Calendar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
