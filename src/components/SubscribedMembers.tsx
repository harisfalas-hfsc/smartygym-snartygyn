import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, MessageCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SubscribedUser {
  user_id: string;
  full_name: string;
  avatar_url?: string;
  plan_type: string;
}

interface SubscribedMembersProps {
  onMessageUser: (userId: string, userName: string, avatarUrl?: string) => void;
}

export const SubscribedMembers = ({ onMessageUser }: SubscribedMembersProps) => {
  const [members, setMembers] = useState<SubscribedUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscribedMembers();
  }, []);

  const fetchSubscribedMembers = async () => {
    try {
      // Get all users with active subscriptions (paid plans)
      const { data: subscriptions, error: subError } = await supabase
        .from('user_subscriptions')
        .select('user_id, plan_type')
        .neq('plan_type', 'free')
        .eq('status', 'active');

      if (subError) throw subError;

      if (!subscriptions || subscriptions.length === 0) {
        setMembers([]);
        setLoading(false);
        return;
      }

      // Get profile info for these users
      const userIds = subscriptions.map(sub => sub.user_id);
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);

      if (profileError) throw profileError;

      // Combine subscription and profile data
      const combinedData = subscriptions.map(sub => {
        const profile = profiles?.find(p => p.user_id === sub.user_id);
        return {
          user_id: sub.user_id,
          full_name: profile?.full_name || 'Unknown User',
          avatar_url: profile?.avatar_url,
          plan_type: sub.plan_type,
        };
      });

      setMembers(combinedData);
    } catch (error) {
      console.error('Error fetching subscribed members:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscribed Members</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Subscribed Members ({members.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {members.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">
            No subscribed members yet
          </p>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {members.map((member) => (
                <div
                  key={member.user_id}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
                >
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={member.avatar_url} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <User className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center space-y-1">
                    <p className="font-semibold text-sm truncate w-full">
                      {member.full_name}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {member.plan_type}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => onMessageUser(member.user_id, member.full_name, member.avatar_url || undefined)}
                  >
                    <MessageCircle className="h-3 w-3 mr-1" />
                    Message
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
