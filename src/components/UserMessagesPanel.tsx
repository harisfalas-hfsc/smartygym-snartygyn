import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { MessageSquare, Mail, Paperclip, Download, Zap, User, Eye, EyeOff, Trash2, ExternalLink, CheckSquare, Square, Settings2 } from "lucide-react";
import { HTMLContent } from "@/components/ui/html-content";
import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { EmailSubscriptionManager } from "@/components/EmailSubscriptionManager";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

type ViewFilter = 'all' | 'unread';

export const UserMessagesPanel = () => {
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<{ id: string; type: 'system' | 'contact' } | null>(null);
  const [viewFilter, setViewFilter] = useState<ViewFilter>('all');
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState('all');
  const queryClient = useQueryClient();

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

  // Filter messages based on viewFilter
  const filteredSystemMessages = useMemo(() => {
    if (viewFilter === 'all') return systemMessages;
    return systemMessages.filter(m => !m.is_read);
  }, [systemMessages, viewFilter]);

  const filteredContactMessages = useMemo(() => {
    if (viewFilter === 'all') return contactMessages;
    return contactMessages.filter(m => m.response && !m.response_read_at);
  }, [contactMessages, viewFilter]);

  // Get visible messages based on active tab
  const visibleMessageIds = useMemo(() => {
    const ids = new Set<string>();
    if (activeTab === 'all' || activeTab === 'system') {
      filteredSystemMessages.forEach(m => ids.add(`system-${m.id}`));
    }
    if (activeTab === 'all' || activeTab === 'contact') {
      filteredContactMessages.forEach(m => ids.add(`contact-${m.id}`));
    }
    return ids;
  }, [activeTab, filteredSystemMessages, filteredContactMessages]);

  // Clean up selected messages that are no longer visible
  const validSelectedMessages = useMemo(() => {
    const valid = new Set<string>();
    selectedMessages.forEach(id => {
      if (visibleMessageIds.has(id)) {
        valid.add(id);
      }
    });
    return valid;
  }, [selectedMessages, visibleMessageIds]);

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
        queryClient.invalidateQueries({ queryKey: ['unread-messages-count'] });
      }
    } else if (type === 'contact') {
      const message = contactMessages.find(m => m.id === messageId);
      if (message && message.response && !message.response_read_at) {
        try {
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

          await refetchContact();
          queryClient.invalidateQueries({ queryKey: ['unread-messages-count'] });
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
          console.error('[UserMessagesPanel] Toggle system message read state failed:', error);
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
          console.error('[UserMessagesPanel] Toggle contact message read state failed:', error);
          toast.error(`Failed to update: ${error.message || 'Unknown error'}`);
          return;
        }
        
        toast.success(!currentState ? "Response marked as read" : "Response marked as unread");
        refetchContact();
      }
      
      queryClient.invalidateQueries({ queryKey: ['unread-messages-count'] });
    } catch (e: any) {
      console.error('[UserMessagesPanel] Toggle read exception:', e);
      toast.error(e?.message || "Failed to update message status");
    }
  };

  const handleDeleteClick = (messageId: string, type: 'system' | 'contact') => {
    setMessageToDelete({ id: messageId, type });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!messageToDelete) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Authentication failed");
      return;
    }

    try {
      if (messageToDelete.type === 'system') {
        const { error } = await supabase
          .from('user_system_messages')
          .delete()
          .eq('id', messageToDelete.id)
          .eq('user_id', user.id);

        if (error) {
          console.error('[UserMessagesPanel] Delete system message failed:', error);
          toast.error(`Failed to delete: ${error.message}`);
          return;
        }

        toast.success("Message deleted");
        refetchSystem();
      }

      queryClient.invalidateQueries({ queryKey: ['unread-messages-count'] });
    } catch (e: any) {
      console.error('[UserMessagesPanel] Delete exception:', e);
      toast.error(e?.message || "Failed to delete message");
    } finally {
      setDeleteDialogOpen(false);
      setMessageToDelete(null);
    }
  };

  // Selection handlers
  const handleSelectMessage = (messageKey: string, checked: boolean) => {
    setSelectedMessages(prev => {
      const next = new Set(prev);
      if (checked) {
        next.add(messageKey);
      } else {
        next.delete(messageKey);
      }
      return next;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedMessages(new Set(visibleMessageIds));
    } else {
      setSelectedMessages(new Set());
    }
  };

  const isAllSelected = visibleMessageIds.size > 0 && validSelectedMessages.size === visibleMessageIds.size;
  const isSomeSelected = validSelectedMessages.size > 0 && validSelectedMessages.size < visibleMessageIds.size;

  // Bulk action handlers
  const handleBulkMarkRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Authentication failed");
      return;
    }

    try {
      const systemIds: string[] = [];
      const contactIds: string[] = [];

      validSelectedMessages.forEach(key => {
        const [type, id] = key.split('-');
        if (type === 'system') {
          const msg = systemMessages.find(m => m.id === id);
          if (msg && !msg.is_read) systemIds.push(id);
        } else if (type === 'contact') {
          const msg = contactMessages.find(m => m.id === id);
          if (msg && msg.response && !msg.response_read_at) contactIds.push(id);
        }
      });

      if (systemIds.length === 0 && contactIds.length === 0) {
        toast.info("All selected messages are already read");
        return;
      }

      if (systemIds.length > 0) {
        const { error } = await supabase
          .from('user_system_messages')
          .update({ is_read: true })
          .in('id', systemIds);
        if (error) throw error;
      }

      if (contactIds.length > 0) {
        const { error } = await supabase
          .from('contact_messages')
          .update({ response_read_at: new Date().toISOString() })
          .in('id', contactIds);
        if (error) throw error;
      }

      toast.success(`Marked ${systemIds.length + contactIds.length} messages as read`);
      refetchSystem();
      refetchContact();
      setSelectedMessages(new Set());
      queryClient.invalidateQueries({ queryKey: ['unread-messages-count'] });
    } catch (e: any) {
      console.error('[UserMessagesPanel] Bulk mark read failed:', e);
      toast.error(e?.message || "Failed to mark messages as read");
    }
  };

  const handleBulkMarkUnread = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Authentication failed");
      return;
    }

    try {
      const systemIds: string[] = [];
      const contactIds: string[] = [];

      validSelectedMessages.forEach(key => {
        const [type, id] = key.split('-');
        if (type === 'system') {
          const msg = systemMessages.find(m => m.id === id);
          if (msg && msg.is_read) systemIds.push(id);
        } else if (type === 'contact') {
          const msg = contactMessages.find(m => m.id === id);
          if (msg && msg.response && msg.response_read_at) contactIds.push(id);
        }
      });

      if (systemIds.length === 0 && contactIds.length === 0) {
        toast.info("All selected messages are already unread");
        return;
      }

      if (systemIds.length > 0) {
        const { error } = await supabase
          .from('user_system_messages')
          .update({ is_read: false })
          .in('id', systemIds);
        if (error) throw error;
      }

      if (contactIds.length > 0) {
        const { error } = await supabase
          .from('contact_messages')
          .update({ response_read_at: null })
          .in('id', contactIds);
        if (error) throw error;
      }

      toast.success(`Marked ${systemIds.length + contactIds.length} messages as unread`);
      refetchSystem();
      refetchContact();
      setSelectedMessages(new Set());
      queryClient.invalidateQueries({ queryKey: ['unread-messages-count'] });
    } catch (e: any) {
      console.error('[UserMessagesPanel] Bulk mark unread failed:', e);
      toast.error(e?.message || "Failed to mark messages as unread");
    }
  };

  const handleBulkDeleteClick = () => {
    const systemIdsToDelete = [...validSelectedMessages].filter(key => key.startsWith('system-'));
    if (systemIdsToDelete.length === 0) {
      toast.error("No deletable messages selected. Contact messages cannot be deleted.");
      return;
    }
    setBulkDeleteDialogOpen(true);
  };

  const handleBulkDeleteConfirm = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Authentication failed");
      return;
    }

    try {
      const systemIds = [...validSelectedMessages]
        .filter(key => key.startsWith('system-'))
        .map(key => key.replace('system-', ''));

      if (systemIds.length === 0) {
        toast.error("No deletable messages selected");
        setBulkDeleteDialogOpen(false);
        return;
      }

      const { error } = await supabase
        .from('user_system_messages')
        .delete()
        .in('id', systemIds)
        .eq('user_id', user.id);

      if (error) {
        console.error('[UserMessagesPanel] Bulk delete failed:', error);
        toast.error(`Failed to delete: ${error.message}`);
        return;
      }

      toast.success(`Deleted ${systemIds.length} messages`);
      refetchSystem();
      setSelectedMessages(new Set());
      queryClient.invalidateQueries({ queryKey: ['unread-messages-count'] });
    } catch (e: any) {
      console.error('[UserMessagesPanel] Bulk delete exception:', e);
      toast.error(e?.message || "Failed to delete messages");
    } finally {
      setBulkDeleteDialogOpen(false);
    }
  };

  const extractLink = (content: string): string | null => {
    const hrefMatch = content.match(/href="([^"]+)"/);
    return hrefMatch ? hrefMatch[1] : null;
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
      case 'announcement_update':
        return <Zap className="h-4 w-4 text-primary" />;
      case 'renewal_reminder':
      case 'renewal_thank_you':
        return <Zap className="h-4 w-4 text-yellow-600" />;
      case 'motivational_weekly':
        return <MessageSquare className="h-4 w-4 text-green-600" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getMessageTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      welcome: 'Welcome',
      announcement_update: 'Announcement',
      renewal_reminder: 'Renewal Reminder',
      renewal_thank_you: 'Thank You',
      motivational_weekly: 'Motivation',
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

  const renderSystemMessage = (message: SystemMessage, showBorder = true) => {
    const link = extractLink(message.content);
    const messageKey = `system-${message.id}`;
    const isSelected = validSelectedMessages.has(messageKey);
    
    return (
      <Card key={messageKey} className={!message.is_read && showBorder ? 'border-blue-500' : ''}>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => handleSelectMessage(messageKey, !!checked)}
                onClick={(e) => e.stopPropagation()}
                className="mt-1"
              />
              {getMessageTypeIcon(message.message_type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h3 className="font-semibold">{message.subject}</h3>
                {!message.is_read && <Badge variant="destructive">New</Badge>}
                <Badge variant="outline" className="text-xs">
                  <Zap className="h-3 w-3 mr-1" />
                  {getMessageTypeLabel(message.message_type)}
                </Badge>
                <div className="ml-auto flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleToggleRead(message.id, 'system', message.is_read)}
                    title={message.is_read ? "Mark as unread" : "Mark as read"}
                  >
                    {message.is_read ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => handleDeleteClick(message.id, 'system')}
                    title="Delete message"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="bg-muted p-4 rounded-lg text-sm content-container mb-3">
                <HTMLContent content={message.content} />
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-xs text-muted-foreground">
                  {format(new Date(message.created_at), 'MMM dd, yyyy HH:mm')}
                </span>
                {link && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7"
                    onClick={() => window.open(link, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View Content
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderContactMessage = (message: ContactMessage, showBorder = true) => {
    const messageKey = `contact-${message.id}`;
    const isSelected = validSelectedMessages.has(messageKey);
    
    return (
      <Card key={messageKey} className={!message.response_read_at && message.response && showBorder ? 'border-green-500' : ''}>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => handleSelectMessage(messageKey, !!checked)}
                onClick={(e) => e.stopPropagation()}
                className="mt-1"
              />
              {getCategoryIcon(message.category)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h3 className="font-semibold">{message.subject}</h3>
                {!message.response_read_at && message.response && (
                  <Badge variant="destructive">New Response</Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  <User className="h-3 w-3 mr-1" />
                  Your Message
                </Badge>
                {message.response && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-auto h-7 w-7"
                    onClick={() => handleToggleRead(message.id, 'contact', !!message.response_read_at)}
                    title={message.response_read_at ? "Mark response as unread" : "Mark response as read"}
                  >
                    {message.response_read_at ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                )}
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
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const deletableCount = [...validSelectedMessages].filter(key => key.startsWith('system-')).length;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">My Messages</h2>
      <p className="text-muted-foreground">
        View your messages, system notifications, and responses from the team
      </p>

      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        {/* Header row with tabs, filter, and bulk actions */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <TabsList className="w-full sm:w-auto grid grid-cols-4">
            <TabsTrigger value="all">All ({contactMessages.length + systemMessages.length})</TabsTrigger>
            <TabsTrigger value="system">System ({systemMessages.length})</TabsTrigger>
            <TabsTrigger value="contact">My Requests ({contactMessages.length})</TabsTrigger>
            <TabsTrigger value="subscriptions" className="gap-1">
              <Settings2 className="h-3 w-3" />
              <span className="hidden sm:inline">Subscriptions</span>
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2 sm:ml-auto">
            <Select value={viewFilter} onValueChange={(value: ViewFilter) => setViewFilter(value)}>
              <SelectTrigger className="w-[130px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">View All</SelectItem>
                <SelectItem value="unread">View Unread</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bulk actions bar */}
        {visibleMessageIds.size > 0 && (
          <div className="flex flex-wrap items-center gap-2 p-3 bg-muted rounded-lg mb-4">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
                className={isSomeSelected ? 'data-[state=checked]:bg-primary/50' : ''}
              />
              <span className="text-sm font-medium">
                {validSelectedMessages.size > 0 
                  ? `${validSelectedMessages.size} selected` 
                  : 'Select all'}
              </span>
            </div>
            
            {validSelectedMessages.size > 0 && (
              <>
                <div className="h-4 w-px bg-border mx-2 hidden sm:block" />
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkMarkRead}
                    className="h-8"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Mark Read
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkMarkUnread}
                    className="h-8"
                  >
                    <EyeOff className="h-3 w-3 mr-1" />
                    Mark Unread
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkDeleteClick}
                    className="h-8 text-destructive hover:text-destructive"
                    disabled={deletableCount === 0}
                    title={deletableCount === 0 ? "Contact messages cannot be deleted" : `Delete ${deletableCount} system messages`}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete {deletableCount > 0 && `(${deletableCount})`}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedMessages(new Set())}
                    className="h-8"
                  >
                    Clear
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        <TabsContent value="all" className="space-y-4 mt-0">
          {filteredSystemMessages.length === 0 && filteredContactMessages.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">
                  {viewFilter === 'unread' ? 'No unread messages' : 'No messages'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {filteredSystemMessages.map((message) => renderSystemMessage(message))}
              {filteredContactMessages.map((message) => renderContactMessage(message))}
            </>
          )}
        </TabsContent>

        <TabsContent value="system" className="space-y-4 mt-0">
          {filteredSystemMessages.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">
                  {viewFilter === 'unread' ? 'No unread system messages' : 'No system messages yet'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredSystemMessages.map((message) => renderSystemMessage(message, false))
          )}
        </TabsContent>

        <TabsContent value="contact" className="space-y-4 mt-0">
          {filteredContactMessages.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">
                  {viewFilter === 'unread' ? 'No unread contact messages' : 'No contact messages yet'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredContactMessages.map((message) => renderContactMessage(message, false))
          )}
        </TabsContent>

        <TabsContent value="subscriptions" className="mt-0">
          <EmailSubscriptionManager />
        </TabsContent>
      </Tabs>

      {/* Single delete dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk delete dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deletableCount} Messages</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deletableCount} system message{deletableCount !== 1 ? 's' : ''}? 
              This action cannot be undone.
              {validSelectedMessages.size > deletableCount && (
                <span className="block mt-2 text-muted-foreground">
                  Note: {validSelectedMessages.size - deletableCount} contact message{validSelectedMessages.size - deletableCount !== 1 ? 's' : ''} will not be deleted as contact messages cannot be removed.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete {deletableCount} Message{deletableCount !== 1 ? 's' : ''}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
