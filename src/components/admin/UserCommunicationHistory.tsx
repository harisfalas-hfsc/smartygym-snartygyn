import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mail, MessageSquare, Bell, Send, User, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { format } from "date-fns";

interface CommunicationItem {
  id: string;
  source: 'contact' | 'system' | 'email_audit';
  type: string;
  subject: string;
  content: string;
  created_at: string;
  direction: 'incoming' | 'outgoing';
  status?: string;
}

interface UserCommunicationHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
  userEmail: string;
  userName: string;
}

export const UserCommunicationHistory = ({
  open,
  onOpenChange,
  userId,
  userEmail,
  userName,
}: UserCommunicationHistoryProps) => {
  const [communications, setCommunications] = useState<CommunicationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && (userId || userEmail)) {
      fetchAllCommunications();
    }
  }, [open, userId, userEmail]);

  const fetchAllCommunications = async () => {
    setLoading(true);
    const allCommunications: CommunicationItem[] = [];

    try {
      // 1. Fetch contact messages (user-initiated)
      const contactQuery = supabase
        .from('contact_messages')
        .select('id, subject, message, created_at, status, response, responded_at')
        .order('created_at', { ascending: false });

      if (userId) {
        contactQuery.eq('user_id', userId);
      } else {
        contactQuery.eq('email', userEmail);
      }

      const { data: contactMessages } = await contactQuery;

      if (contactMessages) {
        contactMessages.forEach(msg => {
          // Add incoming message
          allCommunications.push({
            id: `contact-${msg.id}`,
            source: 'contact',
            type: 'Contact Form',
            subject: msg.subject,
            content: msg.message,
            created_at: msg.created_at,
            direction: 'incoming',
            status: msg.status,
          });

          // Add admin response if exists
          if (msg.response && msg.responded_at) {
            allCommunications.push({
              id: `contact-response-${msg.id}`,
              source: 'contact',
              type: 'Admin Response',
              subject: `Re: ${msg.subject}`,
              content: msg.response,
              created_at: msg.responded_at,
              direction: 'outgoing',
            });
          }
        });
      }

      // 2. Fetch system messages (admin-initiated dashboard messages)
      if (userId) {
        const { data: systemMessages } = await supabase
          .from('user_system_messages')
          .select('id, subject, content, message_type, created_at, is_read')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (systemMessages) {
          systemMessages.forEach(msg => {
            allCommunications.push({
              id: `system-${msg.id}`,
              source: 'system',
              type: msg.message_type?.replace(/_/g, ' ') || 'System Message',
              subject: msg.subject,
              content: msg.content,
              created_at: msg.created_at,
              direction: 'outgoing',
              status: msg.is_read ? 'read' : 'unread',
            });
          });
        }
      }

      // 3. Fetch email audit log entries for this user
      // Note: notification_audit_log stores batch sends, so we check metadata for individual users
      const { data: auditLogs } = await supabase
        .from('notification_audit_log')
        .select('id, subject, content, message_type, notification_type, sent_at, metadata')
        .order('sent_at', { ascending: false })
        .limit(50);

      if (auditLogs) {
        auditLogs.forEach(log => {
          // Check if this user was a recipient (stored in metadata)
          const metadata = log.metadata as any;
          const recipients = metadata?.recipients || metadata?.userIds || [];
          const recipientEmails = metadata?.emails || [];
          
          const wasRecipient = 
            (userId && recipients.includes(userId)) ||
            recipientEmails.includes(userEmail);

          if (wasRecipient || recipients.length === 0) {
            // If no specific recipients tracked, show announcements to all
            allCommunications.push({
              id: `audit-${log.id}`,
              source: 'email_audit',
              type: log.message_type?.replace(/_/g, ' ') || 'Email',
              subject: log.subject,
              content: log.content,
              created_at: log.sent_at || '',
              direction: 'outgoing',
            });
          }
        });
      }

      // Sort all communications by date (newest first)
      allCommunications.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setCommunications(allCommunications);
    } catch (error) {
      console.error('Error fetching communications:', error);
    }

    setLoading(false);
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'contact':
        return <MessageSquare className="h-4 w-4" />;
      case 'system':
        return <Bell className="h-4 w-4" />;
      case 'email_audit':
        return <Mail className="h-4 w-4" />;
      default:
        return <Send className="h-4 w-4" />;
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'contact':
        return 'bg-blue-500';
      case 'system':
        return 'bg-purple-500';
      case 'email_audit':
        return 'bg-green-500';
      default:
        return 'bg-muted';
    }
  };

  const getDirectionStyles = (direction: string) => {
    if (direction === 'incoming') {
      return 'bg-muted border-l-4 border-blue-500';
    }
    return 'bg-primary/5 border-l-4 border-primary';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Communication History
          </DialogTitle>
          <DialogDescription>
            All communications with {userName} ({userEmail})
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : communications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No communications found with this user
            </div>
          ) : (
            <div className="space-y-4 pr-4">
              {communications.map(comm => (
                <div
                  key={comm.id}
                  className={`p-4 rounded-lg ${getDirectionStyles(comm.direction)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${getSourceColor(comm.source)} text-white`}>
                      {getSourceIcon(comm.source)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant="outline" className="capitalize text-xs">
                          {comm.type}
                        </Badge>
                        {comm.direction === 'incoming' ? (
                          <Badge variant="secondary" className="text-xs flex items-center gap-1">
                            <ArrowDownLeft className="h-3 w-3" />
                            Incoming
                          </Badge>
                        ) : (
                          <Badge className="bg-primary text-primary-foreground text-xs flex items-center gap-1">
                            <ArrowUpRight className="h-3 w-3" />
                            Outgoing
                          </Badge>
                        )}
                        {comm.status && (
                          <Badge 
                            variant={comm.status === 'read' ? 'outline' : 'default'}
                            className="text-xs capitalize"
                          >
                            {comm.status}
                          </Badge>
                        )}
                      </div>
                      <h4 className="font-semibold text-sm">{comm.subject}</h4>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                        {comm.content.replace(/<[^>]*>/g, '').substring(0, 200)}
                        {comm.content.length > 200 && '...'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {comm.created_at && format(new Date(comm.created_at), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
