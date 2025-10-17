import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bike, ExternalLink, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StravaTrackingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planName: string;
  planType: "workout" | "program";
}

export function StravaTrackingDialog({
  open,
  onOpenChange,
  planName,
  planType,
}: StravaTrackingDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const checkStravaConnection = async () => {
    setChecking(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: connection } = await supabase
        .from("strava_connections")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      setIsConnected(!!connection);
    } catch (error) {
      console.error("Error checking Strava connection:", error);
    } finally {
      setChecking(false);
    }
  };

  const handleStravaConnect = async () => {
    const clientId = "140946";
    const redirectUri = `https://cvccrvyimyzrxcwzmxwk.supabase.co/functions/v1/strava-oauth-callback`;
    const scope = "activity:read_all,activity:write";
    
    const authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
    
    window.open(authUrl, "_blank", "width=600,height=800");
    
    toast({
      title: "Connecting to Strava",
      description: "Complete the authorization in the popup window",
    });

    // Poll for connection
    const pollInterval = setInterval(async () => {
      await checkStravaConnection();
      if (isConnected) {
        clearInterval(pollInterval);
        toast({
          title: "Connected!",
          description: "Strava has been connected successfully",
        });
      }
    }, 2000);

    // Stop polling after 60 seconds
    setTimeout(() => clearInterval(pollInterval), 60000);
  };

  const handleStartTracking = () => {
    window.open("https://www.strava.com/upload/select", "_blank");
    toast({
      title: "Opening Strava",
      description: "Start your workout and track it on Strava",
    });
    onOpenChange(false);
  };

  const handleSyncActivities = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Not authenticated",
          description: "Please log in to sync activities",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.functions.invoke("strava-fetch-activities", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      toast({
        title: "Activities synced",
        description: "Your Strava activities have been updated",
      });
    } catch (error) {
      console.error("Sync error:", error);
      toast({
        title: "Sync failed",
        description: "Failed to sync activities. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Check connection status when dialog opens
  useState(() => {
    if (open) {
      checkStravaConnection();
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bike className="h-5 w-5 text-primary" />
            Track Your {planType === "workout" ? "Workout" : "Training"}
          </DialogTitle>
          <DialogDescription>
            Connect with Strava to track your progress
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="text-center p-4 bg-muted rounded-lg">
            <p className="font-medium mb-1">{planName}</p>
            <p className="text-sm text-muted-foreground">
              Ready to start training?
            </p>
          </div>

          {checking ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground mt-2">Checking connection...</p>
            </div>
          ) : !isConnected ? (
            <div className="space-y-4">
              <div className="text-center">
                <Bike className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Connect Strava to Track</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Link your Strava account to automatically track your workouts and monitor your progress
                </p>
              </div>
              <Button 
                onClick={handleStravaConnect} 
                className="w-full"
              >
                <Bike className="mr-2 h-4 w-4" />
                Connect with Strava
              </Button>
              <Button 
                onClick={() => onOpenChange(false)} 
                variant="outline"
                className="w-full"
              >
                Start Without Tracking
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                <Bike className="h-5 w-5" />
                <span className="font-medium">Strava Connected</span>
              </div>
              
              <div className="space-y-2">
                <Button 
                  onClick={handleStartTracking}
                  className="w-full"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open Strava & Start Tracking
                </Button>
                
                <Button 
                  onClick={handleSyncActivities}
                  variant="outline"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <Bike className="mr-2 h-4 w-4" />
                      Sync Activities Now
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground mt-2">
                  Your activities will automatically appear in your dashboard
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
