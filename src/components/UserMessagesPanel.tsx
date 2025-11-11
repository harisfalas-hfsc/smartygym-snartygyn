import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { MessageSquare, Mail, Paperclip, Download } from "lucide-react";
import { useEffect } from "react";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  category: string;
  status: string;
  created_at: string;
  read_at: string | null;
  response: string | null;
  responded_at: string | null;
  response_read_at: string | null;
  user_id: string | null;
  attachments: any[];
}

export const UserMessagesPanel = () => {
  const { data: rawMessages = [], isLoading, refetch } = useQuery({
    queryKey: ['user-messages'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Transform the data to ensure attachments is an array
  const messages: ContactMessage[] = (rawMessages || []).map(msg => ({
    ...msg,
    attachments: Array.isArray(msg.attachments) ? msg.attachments : []
  }));

  // Mark all responses as read when component mounts
  useEffect(() => {
    const markAsRead = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('contact_messages')
        .update({ response_read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .not('response', 'is', null)
        .is('response_read_at', null);
      
      refetch();
    };

    markAsRead();
  }, [refetch]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'support':
        return <MessageSquare className="h-4 w-4" />;
      case 'coach_direct':
        return <Mail className="h-4 w-4" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (message: ContactMessage) => {
    if (message.response && !message.response_read_at) {
      return <Badge variant="destructive">New Response</Badge>;
    } else if (message.response) {
      return <Badge variant="default" className="bg-green-600">Responded</Badge>;
    } else if (message.status === 'read') {
      return <Badge variant="secondary">Read</Badge>;
    } else {
      return <Badge variant="outline">Pending</Badge>;
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading messages...</div>;
  }

  if (messages.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>You haven't sent any messages yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">My Messages</h2>
        <p className="text-muted-foreground">
          View your contact messages and responses from the team
        </p>

        {messages.map((message) => (
          <Card key={message.id} className={!message.response_read_at && message.response ? 'border-green-500' : ''}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getCategoryIcon(message.category)}
                    <h3 className="font-semibold">{message.subject}</h3>
                    {!message.response_read_at && message.response && (
                      <Badge variant="destructive">New Response</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {message.message}
                  </p>
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(message.created_at), 'MMM dd, yyyy HH:mm')}
                    </span>
                    {getStatusBadge(message)}
                    <Badge variant="outline" className="text-xs">
                      {message.category.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant={!message.response_read_at && message.response ? "default" : "outline"}
                >
                  View
                </Button>
              </div>

              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Attachments ({message.attachments.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {message.attachments.map((attachment: any, index: number) => (
                      <div key={index} className="flex items-center gap-1 bg-muted px-2 py-1 rounded text-xs">
                        <Paperclip className="h-3 w-3" />
                        <span className="truncate max-w-[150px]">{attachment.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
};