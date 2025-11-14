import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { sendPushNotification } from "@/utils/notificationUtils";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

export default function NotificationTest() {
  const { toast } = useToast();
  const [userId, setUserId] = useState("");
  const [title, setTitle] = useState("Test Notification");
  const [body, setBody] = useState("This is a test notification from SmartyGym");
  const [loading, setLoading] = useState(false);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);

  const handleTestNotification = async () => {
    setLoading(true);
    try {
      // Get current user if no userId specified
      const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;
      
      if (!targetUserId) {
        throw new Error("No user ID specified");
      }

      await sendPushNotification(targetUserId, title, body, "/userdashboard");
      
      toast({
        title: "Notification Sent",
        description: "Test notification has been dispatched.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      
      setSubscriptions(data || []);
      
      toast({
        title: "Active Subscriptions",
        description: `Found ${data?.length || 0} active subscriptions`,
      });
      
      console.log('Active subscriptions:', data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <div className="flex-1 container mx-auto p-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Push Notification Testing Tool</CardTitle>
            <p className="text-sm text-muted-foreground">Admin tool for testing push notifications and checking active subscriptions</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="user-id">User ID (leave empty for self)</Label>
                <Input
                  id="user-id"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Optional: specific user ID"
                />
              </div>
              
              <div>
                <Label htmlFor="title">Notification Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="body">Notification Body</Label>
                <Input
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2 flex-wrap">
                <Button onClick={handleTestNotification} disabled={loading}>
                  {loading ? "Sending..." : "Send Test Notification"}
                </Button>
                
                <Button onClick={handleCheckSubscriptions} variant="outline">
                  Check Active Subscriptions
                </Button>
              </div>
            </div>

            {subscriptions.length > 0 && (
              <div className="border rounded-lg p-4 space-y-2">
                <h3 className="font-semibold">Active Subscriptions: {subscriptions.length}</h3>
                <div className="text-xs text-muted-foreground space-y-1">
                  {subscriptions.map((sub, idx) => (
                    <div key={idx} className="border-b pb-1">
                      User: {sub.user_id} | Created: {new Date(sub.created_at).toLocaleDateString()}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
