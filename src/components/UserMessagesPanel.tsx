import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { MessageSquare, Mail, Paperclip, Download, Zap, User, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

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

interface SystemMessage {
  id: string;
  message_type: string;
  subject: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export const UserMessagesPanel = () => {
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());

  const { data: rawContactMessages = [], isLoading: contactLoading, refetch: refetchContact } = useQuery({
    queryKey: ['user-contact-messages'],
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

  const { data: systemMessages = [], isLoading: systemLoading, refetch: refetchSystem } = useQuery({
    queryKey: ['user-system-messages'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_system_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const contactMessages: ContactMessage[] = (rawContactMessages || []).map(msg => ({
    ...msg,
    attachments: Array.isArray(msg.attachments) ? msg.attachments : []
  }));

  const isLoading = contactLoading || systemLoading;

  const handleMessageClick = async (messageId: string, type: 'system' | 'contact') => {
    if (expandedMessages.has(messageId)) {
      setExpandedMessages(prev => {
        const next = new Set(prev);
        next.delete(messageId);
        return next;
      });
      return;
    }

    setExpandedMessages(prev => new Set(prev).add(messageId));

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (type === 'system') {
      const message = systemMessages.find(m => m.id === messageId);
      if (message && !message.is_read) {
        await supabase
          .from('user_system_messages')
          .update({ is_read: true })
          .eq('id', messageId);
        
        refetchSystem();
        window.dispatchEvent(new CustomEvent('messages-read'));
      }
    } else if (type === 'contact') {
      const message = contactMessages.find(m => m.id === messageId);
      if (message && message.response && !message.response_read_at) {
        try {
          // Single atomic update
          const { error } = await supabase
            .from('contact_messages')
            .update({ response_read_at: new Date().toISOString() })
            .eq('id', messageId)
            .is('response_read_at', null);
          
          if (error) {
            console.error('[UserMessagesPanel] Mark contact message as read failed:', error);
            toast.error('Failed to mark message as read');
            return;
          }

          // Refetch to update UI
          await refetchContact();
          window.dispatchEvent(new CustomEvent('messages-read'));
        } catch (e: any) {
          console.error('[UserMessagesPanel] Unexpected error:', e);
          toast.error(e?.message || "Failed to mark message as read");
        }
      }
    }
  };

  const handleToggleRead = async (messageId: string, type: 'system' | 'contact', currentState: boolean) => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('[UserMessagesPanel] Auth error in toggle:', authError);
      toast.error("Authentication failed. Please refresh and try again.");
      return;
    }

    try {
      if (type === 'system') {
        const { error } = await supabase
          .from('user_system_messages')
          .update({ is_read: !currentState })
          .eq('id', messageId);
        
        if (error) {
          console.error('[UserMessagesPanel] Toggle system message read state failed:', {
            message: error.message,
            code: error.code,
            details: error.details,
            messageId
          });
          toast.error(`Failed to update: ${error.message || 'Unknown error'}`);
          return;
        }
        
        toast.success(!currentState ? "Message marked as read" : "Message marked as unread");
        refetchSystem();
      } else if (type === 'contact') {
        const { error } = await supabase
          .from('contact_messages')
          .update({ response_read_at: !currentState ? new Date().toISOString() : null })
          .eq('id', messageId);
        
        if (error) {
          console.error('[UserMessagesPanel] Toggle contact message read state failed:', {
            message: error.message,
            code: error.code,
            details: error.details,
            messageId
          });
          toast.error(`Failed to update: ${error.message || 'Unknown error'}`);
          return;
        }
        
        toast.success(!currentState ? "Response marked as read" : "Response marked as unread");
        refetchContact();
      }
      
      window.dispatchEvent(new CustomEvent('messages-read'));
    } catch (e: any) {
      console.error('[UserMessagesPanel] Toggle read exception:', {
        error: e,
        message: e?.message,
        stack: e?.stack,
        messageId,
        type
      });
      toast.error(e?.message || "Failed to update message status");
    }
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

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'welcome':
        return <User className="h-4 w-4 text-green-600" />;
      case 'purchase_workout':
      case 'purchase_program':
      case 'purchase_personal_training':
      case 'purchase_subscription':
        return <MessageSquare className="h-4 w-4 text-blue-600" />;
      case 'renewal_reminder':
      case 'renewal_thank_you':
        return <Zap className="h-4 w-4 text-yellow-600" />;
      case 'cancellation':
        return <MessageSquare className="h-4 w-4 text-red-600" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getMessageTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      welcome: 'Welcome',
      purchase_workout: 'Workout Purchase',
      purchase_program: 'Program Purchase',
      purchase_personal_training: 'Personal Training',
      purchase_subscription: 'Subscription',
      renewal_reminder: 'Renewal Reminder',
      renewal_thank_you: 'Thank You',
      cancellation: 'Cancellation'
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading messages...</div>;
  }

  if (contactMessages.length === 0 && systemMessages.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>You don't have any messages yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">My Messages</h2>
      <p className="text-muted-foreground">
        View your messages, system notifications, and responses from the team
      </p>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All ({contactMessages.length + systemMessages.length})</TabsTrigger>
          <TabsTrigger value="system">System ({systemMessages.length})</TabsTrigger>
          <TabsTrigger value="contact">My Requests ({contactMessages.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-4">
          {systemMessages.map((message) => (
            <Card key={`system-${message.id}`} className={!message.is_read ? 'border-blue-500' : ''}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  {getMessageTypeIcon(message.message_type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{message.subject}</h3>
                      {!message.is_read && <Badge variant="destructive">New</Badge>}
                      <Badge variant="outline" className="text-xs">
                        <Zap className="h-3 w-3 mr-1" />
                        System
                      </Badge>
                    </div>
                    <div className="bg-muted p-4 rounded-lg text-sm text-display break-words-safe content-container mb-3">
                      {message.content}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(message.created_at), 'MMM dd, yyyy HH:mm')}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {getMessageTypeLabel(message.message_type)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {contactMessages.map((message) => (
            <Card key={`contact-${message.id}`} className={!message.response_read_at && message.response ? 'border-green-500' : ''}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getCategoryIcon(message.category)}
                      <h3 className="font-semibold">{message.subject}</h3>
                      {!message.response_read_at && message.response && (
                        <Badge variant="destructive">New Response</Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        <User className="h-3 w-3 mr-1" />
                        Your Message
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {message.message}
                    </p>
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(message.created_at), 'MMM dd, yyyy HH:mm')}
                      </span>
                      {message.response ? (
                        <Badge variant="default" className="bg-green-600">Coach Replied</Badge>
                      ) : (
                        <Badge variant="secondary">Pending</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {message.response && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-semibold mb-2 text-green-600">Coach Response:</p>
                    <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-3 rounded-lg text-sm text-display break-words-safe content-container">
                      {message.response}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {format(new Date(message.responded_at!), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                )}

                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-muted-foreground mb-2">Attachments</p>
                    <div className="flex flex-wrap gap-2">
                      {message.attachments.map((attachment: any, index: number) => (
                        <div key={index} className="flex items-center gap-1 bg-muted px-2 py-1 rounded text-xs">
                          <Paperclip className="h-3 w-3" />
                          <span className="truncate max-w-[150px]">{attachment.name}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-5 w-5 p-0"
                            onClick={() => window.open(attachment.url, '_blank')}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="system" className="space-y-4 mt-4">
          {systemMessages.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No system messages yet</p>
              </CardContent>
            </Card>
          ) : (
            systemMessages.map((message) => (
              <Card key={message.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    {getMessageTypeIcon(message.message_type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{message.subject}</h3>
                        <Badge variant="outline" className="text-xs">
                          {getMessageTypeLabel(message.message_type)}
                        </Badge>
                      </div>
                      <div className="bg-muted p-4 rounded-lg text-sm text-display break-words-safe content-container mb-3">
                        {message.content}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(message.created_at), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="contact" className="space-y-4 mt-4">
          {contactMessages.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No contact messages yet</p>
              </CardContent>
            </Card>
          ) : (
            contactMessages.map((message) => (
              <Card key={message.id}>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(message.category)}
                      <h3 className="font-semibold">{message.subject}</h3>
                      {!message.response_read_at && message.response && (
                        <Badge variant="destructive">New Response</Badge>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Your message:</p>
                      <p className="text-sm text-muted-foreground">{message.message}</p>
                    </div>
                    
                    {message.response && (
                      <div className="pt-3 border-t">
                        <p className="text-sm font-semibold mb-2 text-green-600">Coach Response:</p>
                        <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-3 rounded-lg text-sm text-display break-words-safe content-container">
                          {message.response}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(new Date(message.responded_at!), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                    )}

                    {!message.response && (
                      <Badge variant="secondary">Pending Response</Badge>
                    )}

                    <p className="text-xs text-muted-foreground">
                      Sent: {format(new Date(message.created_at), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};