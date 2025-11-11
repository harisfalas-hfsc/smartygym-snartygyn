import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Mail, Clock, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ContactMessage {
  id: string;
  subject: string;
  message: string;
  category: string;
  status: string;
  created_at: string;
  response: string | null;
  responded_at: string | null;
}

export const UserMessagesPanel = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    fetchMessages();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('user_messages')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'contact_messages',
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMessages = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setMessages(data);
    }
    setLoading(false);
  };

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
    if (message.response) {
      return <Badge variant="default" className="bg-green-600">Responded</Badge>;
    } else if (message.status === 'read') {
      return <Badge variant="secondary">Read</Badge>;
    } else {
      return <Badge variant="outline">Pending</Badge>;
    }
  };

  if (loading) {
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
          <Card key={message.id} className={message.response ? 'border-green-200' : ''}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getCategoryIcon(message.category)}
                    <h3 className="font-semibold">{message.subject}</h3>
                    {message.response && <Badge variant="default" className="bg-green-600">New Response</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {message.message}
                  </p>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(message.created_at), 'MMM dd, yyyy')}
                    </span>
                    {getStatusBadge(message)}
                    {message.response && (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Response received {format(new Date(message.responded_at!), 'MMM dd')}
                      </span>
                    )}
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant={message.response ? "default" : "outline"}
                  onClick={() => {
                    setSelectedMessage(message);
                    setShowDialog(true);
                  }}
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Message Detail Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Message Details</DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-6">
              <div>
                <p className="text-sm font-semibold mb-2">Subject</p>
                <p className="text-sm">{selectedMessage.subject}</p>
              </div>

              <div>
                <p className="text-sm font-semibold mb-2">Your Message</p>
                <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap text-sm">
                  {selectedMessage.message}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Sent on {format(new Date(selectedMessage.created_at), 'MMMM dd, yyyy at HH:mm')}
                </p>
              </div>

              {selectedMessage.response ? (
                <div>
                  <p className="text-sm font-semibold mb-2 text-green-600">Response from SmartyGym Team</p>
                  <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-4 rounded-lg whitespace-pre-wrap text-sm">
                    {selectedMessage.response}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Responded on {format(new Date(selectedMessage.responded_at!), 'MMMM dd, yyyy at HH:mm')}
                  </p>
                </div>
              ) : (
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    ⏳ Your message has been received. We'll respond as soon as possible.
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};