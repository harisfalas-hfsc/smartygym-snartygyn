import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Calendar, Check, Loader2, Unlink, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface GoogleCalendarConnectProps {
  onConnectionChange?: (connected: boolean) => void;
}

export const GoogleCalendarConnect = ({ onConnectionChange }: GoogleCalendarConnectProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const { toast } = useToast();

  // Check connection status on mount and URL params
  useEffect(() => {
    checkConnectionStatus();

    // Check for OAuth callback results
    const urlParams = new URLSearchParams(window.location.search);
    const calendarConnected = urlParams.get('calendar_connected');
    const calendarError = urlParams.get('calendar_error');

    if (calendarConnected === 'true') {
      toast({
        title: "Google Calendar Connected! 📅",
        description: "Your calendar is now synced with SmartyGym.",
      });
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
      checkConnectionStatus();
    }

    if (calendarError) {
      toast({
        title: "Connection Failed",
        description: `Could not connect to Google Calendar: ${calendarError}`,
        variant: "destructive",
      });
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const checkConnectionStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsLoading(false);
        return;
      }

      const response = await supabase.functions.invoke('google-calendar-oauth', {
        body: {},
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      // Check via query params since invoke doesn't support them directly
      const { data, error } = await supabase
        .from('user_calendar_connections')
        .select('is_active, auto_sync_enabled')
        .eq('user_id', session.user.id)
        .eq('provider', 'google')
        .single();

      if (data && data.is_active) {
        setIsConnected(true);
        setAutoSyncEnabled(data.auto_sync_enabled ?? false);
        onConnectionChange?.(true);
      } else {
        setIsConnected(false);
        onConnectionChange?.(false);
      }
    } catch (error) {
      console.error('Error checking calendar status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Login Required",
          description: "Please log in to connect your calendar.",
          variant: "destructive",
        });
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
    } catch (error: any) {
      console.error('Error connecting calendar:', error);
      toast({
        title: "Connection Error",
        description: error.message || "Failed to connect to Google Calendar.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-calendar-oauth?action=disconnect`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (data.success) {
        setIsConnected(false);
        setAutoSyncEnabled(false);
        onConnectionChange?.(false);
        toast({
          title: "Calendar Disconnected",
          description: "Your Google Calendar has been disconnected.",
        });
      } else {
        throw new Error(data.error || 'Failed to disconnect');
      }
    } catch (error: any) {
      console.error('Error disconnecting calendar:', error);
      toast({
        title: "Disconnect Error",
        description: error.message || "Failed to disconnect calendar.",
        variant: "destructive",
      });
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleToggleAutoSync = async (enabled: boolean) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-calendar-oauth?action=toggle-auto-sync`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ enabled })
        }
      );

      const data = await response.json();

      if (data.success) {
        setAutoSyncEnabled(enabled);
        toast({
          title: enabled ? "Auto-Sync Enabled" : "Auto-Sync Disabled",
          description: enabled
            ? "Scheduled workouts will automatically sync to your calendar."
            : "Workouts will no longer auto-sync to your calendar.",
        });
      }
    } catch (error) {
      console.error('Error toggling auto-sync:', error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Google Calendar
        </CardTitle>
        <CardDescription>
          Sync your scheduled workouts and activities with Google Calendar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isConnected ? (
          <>
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <Check className="h-4 w-4" />
              Connected to Google Calendar
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-sync">Auto-sync workouts</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically add scheduled workouts to your calendar
                </p>
              </div>
              <Switch
                id="auto-sync"
                checked={autoSyncEnabled}
                onCheckedChange={handleToggleAutoSync}
              />
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleDisconnect}
              disabled={isDisconnecting}
            >
              {isDisconnecting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Unlink className="h-4 w-4 mr-2" />
              )}
              Disconnect Calendar
            </Button>
          </>
        ) : (
          <Button
            className="w-full"
            onClick={handleConnect}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ExternalLink className="h-4 w-4 mr-2" />
            )}
            Connect Google Calendar
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
