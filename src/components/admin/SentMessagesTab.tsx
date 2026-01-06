import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Search, Mail, Bell, Users, Eye, CheckCircle, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SentMessage {
  id: string;
  subject: string;
  content: string;
  message_type: string;
  notification_type: string;
  recipient_count: number | null;
  success_count: number | null;
  failed_count: number | null;
  sent_at: string | null;
  sent_by: string | null;
  recipient_filter: string | null;
  metadata: any;
}

export const SentMessagesTab = () => {
  const [sentMessages, setSentMessages] = useState<SentMessage[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<SentMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState<SentMessage | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  useEffect(() => {
    fetchSentMessages();
  }, []);

  useEffect(() => {
    let filtered = sentMessages;

    if (searchQuery) {
      filtered = filtered.filter(msg =>
        msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.message_type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterType !== "all") {
      filtered = filtered.filter(msg => msg.notification_type === filterType);
    }

    setFilteredMessages(filtered);
  }, [sentMessages, searchQuery, filterType]);

  const fetchSentMessages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notification_audit_log')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching sent messages:', error);
      } else {
        setSentMessages(data || []);
        setFilteredMessages(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  const getNotificationTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'dashboard':
        return <Bell className="h-4 w-4" />;
      case 'both':
        return <Users className="h-4 w-4" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  const getMessageTypeBadge = (type: string) => {
    const typeMap: Record<string, { color: string; label: string }> = {
      'announcement_new_service': { color: 'bg-blue-500', label: 'New Service' },
      'announcement_update': { color: 'bg-green-500', label: 'Update' },
      'new_category_announcement': { color: 'bg-purple-500', label: 'New Category' },
      'daily_motivation': { color: 'bg-yellow-500', label: 'Daily Motivation' },
      'weekly_summary': { color: 'bg-orange-500', label: 'Weekly Summary' },
      'subscription_reminder': { color: 'bg-red-500', label: 'Subscription' },
    };

    const config = typeMap[type] || { color: 'bg-muted', label: type.replace(/_/g, ' ') };
    return (
      <Badge className={`${config.color} text-white capitalize`}>
        {config.label}
      </Badge>
    );
  };

  const getSuccessRate = (success: number | null, failed: number | null) => {
    const total = (success || 0) + (failed || 0);
    if (total === 0) return null;
    return Math.round(((success || 0) / total) * 100);
  };

  const handleViewMessage = (message: SentMessage) => {
    setSelectedMessage(message);
    setShowDetailDialog(true);
  };

  // Get unique notification types for filter
  const notificationTypes = [...new Set(sentMessages.map(m => m.notification_type))];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sent messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {notificationTypes.map(type => (
              <SelectItem key={type} value={type} className="capitalize">
                {type.replace(/_/g, ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{sentMessages.length}</p>
              <p className="text-sm text-muted-foreground">Total Sent</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {sentMessages.reduce((acc, m) => acc + (m.success_count || 0), 0)}
              </p>
              <p className="text-sm text-muted-foreground">Delivered</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {sentMessages.reduce((acc, m) => acc + (m.failed_count || 0), 0)}
              </p>
              <p className="text-sm text-muted-foreground">Failed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {sentMessages.reduce((acc, m) => acc + (m.recipient_count || 0), 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Recipients</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Messages List */}
      {filteredMessages.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No sent messages found
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMessages.map(message => {
            const successRate = getSuccessRate(message.success_count, message.failed_count);
            return (
              <Card key={message.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {getNotificationTypeIcon(message.notification_type)}
                        {getMessageTypeBadge(message.message_type)}
                        <Badge variant="outline" className="capitalize">
                          {message.notification_type}
                        </Badge>
                      </div>
                      <h3 className="font-semibold truncate">{message.subject}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {message.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                      </p>
                      <div className="flex items-center gap-4 mt-3 flex-wrap">
                        {message.sent_at && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(message.sent_at), 'MMM dd, yyyy HH:mm')}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {message.recipient_count || 0} recipients
                        </span>
                        {successRate !== null && (
                          <span className={`text-xs flex items-center gap-1 ${successRate >= 90 ? 'text-green-600' : successRate >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {successRate >= 90 ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                            {successRate}% success
                          </span>
                        )}
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleViewMessage(message)}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Message Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Sent Message Details</DialogTitle>
            <DialogDescription>
              View the details of this sent communication
            </DialogDescription>
          </DialogHeader>
          {selectedMessage && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4 pr-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold">Message Type</p>
                    {getMessageTypeBadge(selectedMessage.message_type)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Notification Type</p>
                    <Badge variant="outline" className="capitalize">
                      {selectedMessage.notification_type}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Sent At</p>
                    <p className="text-sm">
                      {selectedMessage.sent_at
                        ? format(new Date(selectedMessage.sent_at), 'MMM dd, yyyy HH:mm')
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Recipients</p>
                    <p className="text-sm">{selectedMessage.recipient_count || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Successful</p>
                    <p className="text-sm text-green-600">{selectedMessage.success_count || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Failed</p>
                    <p className="text-sm text-red-600">{selectedMessage.failed_count || 0}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold mb-2">Subject</p>
                  <p className="text-sm bg-muted p-2 rounded">{selectedMessage.subject}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold mb-2">Content</p>
                  <div 
                    className="text-sm bg-muted p-4 rounded prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: selectedMessage.content }}
                  />
                </div>

                {selectedMessage.recipient_filter && (
                  <div>
                    <p className="text-sm font-semibold mb-2">Recipient Filter</p>
                    <p className="text-sm bg-muted p-2 rounded capitalize">
                      {selectedMessage.recipient_filter.replace(/_/g, ' ')}
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
