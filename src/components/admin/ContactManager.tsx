import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, MessageSquare, Eye, CheckCircle, X, ArrowLeft, Send, Search, Filter, FileText, Paperclip, Download, Upload, BarChart3, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { ContactAnalytics } from "./ContactAnalytics";

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
  user_id: string | null;
  attachments: any[];
}

interface ResponseTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: string;
}

interface MessageHistoryItem {
  id: string;
  contact_message_id: string;
  message_type: 'original' | 'auto_reply' | 'admin_response' | 'customer_reply';
  content: string;
  sender: 'customer' | 'system' | 'admin';
  created_at: string;
}

export const ContactManager = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<ContactMessage[]>([]);
  const [templates, setTemplates] = useState<ResponseTemplate[]>([]);
  const [messageHistory, setMessageHistory] = useState<MessageHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [isResponding, setIsResponding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [uploadingAttachments, setUploadingAttachments] = useState(false);
  const [isAdminVerified, setIsAdminVerified] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<ContactMessage | null>(null);

  useEffect(() => {
    verifyAdminAccess();
    fetchMessages();
    fetchTemplates();

    // Subscribe to real-time updates and send push notification to admin
    const channel = supabase
      .channel('contact_messages_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'contact_messages'
        },
        async (payload) => {
          fetchMessages();
          toast({
            title: "New Contact Message",
            description: "A new message has been received",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const verifyAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        if (import.meta.env.DEV) {
          console.error('[ContactManager] No user session');
        }
        setIsAdminVerified(false);
        return;
      }

      // Check admin role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (roleError || !roleData) {
        if (import.meta.env.DEV) {
          console.error('[ContactManager] Not an admin:', roleError);
        }
        setIsAdminVerified(false);
        toast({
          title: "Access Denied",
          description: "Admin access required",
          variant: "destructive",
        });
        return;
      }

      setIsAdminVerified(true);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[ContactManager] Error verifying admin access:', error);
      }
      setIsAdminVerified(false);
    }
  };

  useEffect(() => {
    // Apply filters
    let filtered = messages;

    if (searchQuery) {
      filtered = filtered.filter(msg => 
        msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter(msg => msg.status === filterStatus);
    }

    if (filterCategory !== "all") {
      filtered = filtered.filter(msg => msg.category === filterCategory);
    }

    setFilteredMessages(filtered);
  }, [messages, searchQuery, filterStatus, filterCategory]);

  const fetchTemplates = async () => {
    const { data, error } = await supabase
      .from('response_templates')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (!error && data) {
      setTemplates(data);
    }
  };

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching messages:', error);
      }
      toast({
        title: "Error",
        description: "Failed to load contact messages",
        variant: "destructive",
      });
    } else {
      const messagesWithAttachments = (data || []).map(msg => ({
        ...msg,
        attachments: Array.isArray(msg.attachments) ? msg.attachments : []
      }));
      setMessages(messagesWithAttachments);
      setFilteredMessages(messagesWithAttachments);
    }
    setLoading(false);
  };

  const fetchMessageHistory = async (messageId: string) => {
    const { data, error } = await supabase
      .from('contact_message_history')
      .select('*')
      .eq('contact_message_id', messageId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessageHistory(data as MessageHistoryItem[]);
    } else {
      setMessageHistory([]);
    }
  };

  const handleViewMessage = async (message: ContactMessage) => {
    setSelectedMessage(message);
    setResponseText(message.response || "");
    setMessageHistory([]); // Reset history while loading
    setShowMessageDialog(true);

    // Fetch conversation history
    fetchMessageHistory(message.id);

    // Mark as read if not already read
    if (!message.read_at) {
      try {
        // Validate admin session before update
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          if (import.meta.env.DEV) {
            console.error('[ContactManager] Auth validation failed:', authError);
          }
          toast({
            title: "Authentication Error",
            description: "Your session has expired. Please refresh and log in again.",
            variant: "destructive",
          });
          return;
        }

        // Verify admin role
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .single();

        if (roleError || !roleData) {
          if (import.meta.env.DEV) {
            console.error('[ContactManager] Admin role check failed:', roleError);
          }
          toast({
            title: "Permission Denied",
            description: "You do not have admin privileges.",
            variant: "destructive",
          });
          return;
        }

        // Attempt to mark as read
        const { error, data } = await supabase
          .from('contact_messages')
          .update({ read_at: new Date().toISOString(), status: 'read' })
          .eq('id', message.id)
          .select();
        
        if (error) {
          if (import.meta.env.DEV) {
            console.error('[ContactManager] Mark as read failed - Full error details:', {
              message: error.message,
              code: error.code,
              details: error.details,
              hint: error.hint,
              messageId: message.id,
              userId: user.id
            });
          }
          
          toast({
            title: "Database Error",
            description: `Failed to mark message as read: ${error.message || 'Unknown error'}`,
            variant: "destructive",
          });
        } else {
          if (import.meta.env.DEV) {
            console.log('[ContactManager] Successfully marked message as read:', data);
          }
          fetchMessages();
        }
      } catch (e: any) {
        if (import.meta.env.DEV) {
          console.error('[ContactManager] Unexpected error marking as read:', {
            error: e,
            message: e?.message,
            stack: e?.stack,
            messageId: message.id
          });
        }
        
        toast({
          title: "Unexpected Error",
          description: e?.message || "An unexpected error occurred.",
          variant: "destructive",
        });
      }
    }
  };

  const handleStatusUpdate = async (messageId: string, newStatus: string) => {
    try {
      // Validate session
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        toast({
          title: "Authentication Error",
          description: "Your session has expired. Please refresh and log in again.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('contact_messages')
        .update({ status: newStatus })
        .eq('id', messageId);

      if (error) {
        if (import.meta.env.DEV) {
          console.error('[ContactManager] Status update failed:', {
            message: error.message,
            code: error.code,
            details: error.details,
            messageId
          });
        }
        
        toast({
          title: "Database Error",
          description: `Failed to update status: ${error.message || 'Unknown error'}`,
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Success",
        description: "Message status updated",
      });
      fetchMessages();
    } catch (e: any) {
      if (import.meta.env.DEV) {
        console.error('[ContactManager] Unexpected error updating status:', e);
      }
      toast({
        title: "Unexpected Error",
        description: e?.message || "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setResponseText(template.content);
    }
    setSelectedTemplate(templateId);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedMessage || !event.target.files?.length) return;

    setUploadingAttachments(true);
    const files = Array.from(event.target.files);
    const uploadedUrls: string[] = [];

    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${selectedMessage.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('message-attachments')
          .upload(fileName, file);

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('message-attachments')
          .getPublicUrl(fileName);
        
        uploadedUrls.push(publicUrl);
      }

      // Update message with new attachments
      const currentAttachments = selectedMessage.attachments || [];
      await supabase
        .from('contact_messages')
        .update({ 
          attachments: [...currentAttachments, ...uploadedUrls.map(url => ({ url, name: files[uploadedUrls.indexOf(url)].name }))]
        })
        .eq('id', selectedMessage.id);

      toast({
        title: "Success",
        description: "Attachments uploaded successfully",
      });
      
      fetchMessages();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Upload error:', error);
      }
      toast({
        title: "Error",
        description: "Failed to upload attachments",
        variant: "destructive",
      });
    } finally {
      setUploadingAttachments(false);
    }
  };

  const handleSendResponse = async () => {
    if (!selectedMessage || !responseText.trim()) return;

    setIsResponding(true);
    
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ 
          response: responseText,
          responded_at: new Date().toISOString(),
          status: 'responded',
          response_read_at: null
        })
        .eq('id', selectedMessage.id);

      if (error) {
        if (import.meta.env.DEV) {
          console.error('[ContactManager] Save response failed:', error);
        }
        toast({
          title: "Error",
          description: "Failed to save response",
          variant: "destructive",
        });
        setIsResponding(false);
        return;
      }

      // Log admin response to message history
      try {
        await supabase
          .from('contact_message_history')
          .insert({
            contact_message_id: selectedMessage.id,
            message_type: 'admin_response',
            content: responseText,
            sender: 'admin'
          });
      } catch (historyError) {
        if (import.meta.env.DEV) {
          console.error('[ContactManager] Error logging response to history:', historyError);
        }
      }

      // Send email notification and push notification
      if (selectedMessage.user_id && selectedMessage.email) {
        try {
          // Send email notification
          await supabase.functions.invoke('send-contact-response-notification', {
            body: {
              userId: selectedMessage.user_id,
              userEmail: selectedMessage.email,
              userName: selectedMessage.name,
              subject: selectedMessage.subject,
              responsePreview: responseText,
            }
          });
        } catch (notificationError) {
          if (import.meta.env.DEV) {
            console.error('[ContactManager] Error sending email notification:', notificationError);
          }
        }
      }

      toast({
        title: "Response Sent",
        description: "Response has been saved and user has been notified",
      });
      setShowMessageDialog(false);
      fetchMessages();
    } catch (e) {
      if (import.meta.env.DEV) {
        console.error('[ContactManager] Unexpected error sending response:', e);
      }
      toast({
        title: "Error",
        description: "Failed to send response",
        variant: "destructive",
      });
    }
    
    setIsResponding(false);
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'support':
        return 'bg-blue-500';
      case 'coach_direct':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      new: { variant: "default", label: "New" },
      read: { variant: "secondary", label: "Read" },
      responded: { variant: "outline", label: "Responded" },
      closed: { variant: "outline", label: "Closed" }
    };
    
    const config = variants[status] || variants.new;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleDeleteClick = (message: ContactMessage) => {
    setMessageToDelete(message);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!messageToDelete) return;
    
    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', messageToDelete.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to delete message",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Message deleted successfully",
      });
      fetchMessages();
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setMessageToDelete(null);
    }
  };

  const newMessages = messages.filter(m => m.status === 'new');
  const readMessages = messages.filter(m => m.status === 'read');
  const respondedMessages = messages.filter(m => m.status === 'responded');
  const closedMessages = messages.filter(m => m.status === 'closed');

  const generalMessages = messages.filter(m => m.category === 'general');
  const supportMessages = messages.filter(m => m.category === 'support');
  const coachMessages = messages.filter(m => m.category === 'coach_direct');

  const MessageCard = ({ message }: { message: ContactMessage }) => (
    <Card key={message.id} className={`${message.status === 'new' ? 'border-primary' : ''}`}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${getCategoryColor(message.category)}`} />
              <h3 className="font-semibold">{message.name}</h3>
              {message.status === 'new' && <Badge variant="destructive">New</Badge>}
              {message.user_id && <Badge variant="outline">Has Account</Badge>}
              {!message.user_id && <Badge variant="secondary">Visitor</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">{message.email}</p>
            <p className="font-medium mt-2">{message.subject}</p>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{message.message}</p>
            <div className="flex items-center gap-4 mt-3">
              <span className="text-xs text-muted-foreground">
                {format(new Date(message.created_at), 'MMM dd, yyyy HH:mm')}
              </span>
              {getStatusBadge(message.status)}
              <Badge variant="outline" className="flex items-center gap-1">
                {getCategoryIcon(message.category)}
                <span className="capitalize">{message.category.replace('_', ' ')}</span>
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => handleViewMessage(message)}>
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleDeleteClick(message)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="pt-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Contact Messages
          </CardTitle>
          <CardDescription>
            View and manage all contact requests and messages
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="responded">Responded</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="support">Support</SelectItem>
                <SelectItem value="coach_direct">Coach Direct</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{newMessages.length}</p>
                  <p className="text-sm text-muted-foreground">New</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{readMessages.length}</p>
                  <p className="text-sm text-muted-foreground">Read</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{respondedMessages.length}</p>
                  <p className="text-sm text-muted-foreground">Responded</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-600">{closedMessages.length}</p>
                  <p className="text-sm text-muted-foreground">Closed</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="all">
            <div className="w-full overflow-x-auto">
              <TabsList className="w-full inline-flex sm:grid sm:grid-cols-6 min-w-max sm:min-w-0">
                <TabsTrigger value="all" className="flex-shrink-0 whitespace-nowrap">
                  All ({messages.length})
                </TabsTrigger>
                <TabsTrigger value="general" className="flex-shrink-0 whitespace-nowrap">
                  General ({generalMessages.length})
                </TabsTrigger>
                <TabsTrigger value="support" className="flex-shrink-0 whitespace-nowrap">
                  Support ({supportMessages.length})
                </TabsTrigger>
                <TabsTrigger value="coach" className="flex-shrink-0 whitespace-nowrap">
                  Coach ({coachMessages.length})
                </TabsTrigger>
                <TabsTrigger value="new" className="flex-shrink-0 whitespace-nowrap">
                  New ({newMessages.length})
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex-shrink-0 whitespace-nowrap flex items-center gap-1">
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="space-y-4 mt-4">
              {filteredMessages.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No messages found</p>
              ) : (
                filteredMessages.map(message => <MessageCard key={message.id} message={message} />)
              )}
            </TabsContent>

            <TabsContent value="general" className="space-y-4 mt-4">
              {generalMessages.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No general messages</p>
              ) : (
                generalMessages.map(message => <MessageCard key={message.id} message={message} />)
              )}
            </TabsContent>

            <TabsContent value="support" className="space-y-4 mt-4">
              {supportMessages.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No support messages</p>
              ) : (
                supportMessages.map(message => <MessageCard key={message.id} message={message} />)
              )}
            </TabsContent>

            <TabsContent value="coach" className="space-y-4 mt-4">
              {coachMessages.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No direct coach messages</p>
              ) : (
                coachMessages.map(message => <MessageCard key={message.id} message={message} />)
              )}
            </TabsContent>

            <TabsContent value="new" className="space-y-4 mt-4">
              {newMessages.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No new messages</p>
              ) : (
                newMessages.map(message => <MessageCard key={message.id} message={message} />)
              )}
            </TabsContent>

            <TabsContent value="analytics" className="mt-4">
              <ContactAnalytics />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Message Detail Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Contact Message Details</DialogTitle>
            <DialogDescription>
              View and respond to this message
            </DialogDescription>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold">From</p>
                  <p className="text-sm">{selectedMessage.name}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Email</p>
                  <a 
                    href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                    className="text-sm text-primary hover:underline cursor-pointer flex items-center gap-1 font-medium"
                  >
                    <Mail className="h-3 w-3" />
                    {selectedMessage.email}
                  </a>
                  {!selectedMessage.user_id && (
                    <Badge variant="secondary" className="mt-1 text-xs">
                      Visitor Message
                    </Badge>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold">Category</p>
                  <Badge variant="outline" className="flex items-center gap-1 w-fit">
                    {getCategoryIcon(selectedMessage.category)}
                    <span className="capitalize">{selectedMessage.category.replace('_', ' ')}</span>
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-semibold">Status</p>
                  {getStatusBadge(selectedMessage.status)}
                </div>
                <div>
                  <p className="text-sm font-semibold">Received</p>
                  <p className="text-sm">{format(new Date(selectedMessage.created_at), 'MMM dd, yyyy HH:mm')}</p>
                </div>
                {selectedMessage.read_at && (
                  <div>
                    <p className="text-sm font-semibold">Read At</p>
                    <p className="text-sm">{format(new Date(selectedMessage.read_at), 'MMM dd, yyyy HH:mm')}</p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm font-semibold mb-2">Subject</p>
                <p className="text-sm">{selectedMessage.subject}</p>
              </div>

              {/* Conversation History Section */}
              <div className="space-y-4">
                <p className="text-sm font-semibold">Conversation History</p>
                
                {/* Original Customer Message */}
                <div className="bg-muted p-4 rounded-lg border-l-4 border-muted-foreground/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">Customer</Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(selectedMessage.created_at), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>

                {/* Auto-Reply (if exists in history) */}
                {messageHistory
                  .filter(h => h.message_type === 'auto_reply')
                  .map(h => (
                    <div key={h.id} className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border-l-4 border-blue-500">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-blue-500 hover:bg-blue-600">Auto-Reply</Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(h.created_at), 'MMM dd, yyyy HH:mm')}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{h.content}</p>
                    </div>
                  ))}

                {/* Admin Responses from history */}
                {messageHistory
                  .filter(h => h.message_type === 'admin_response')
                  .map(h => (
                    <div key={h.id} className="bg-primary/10 p-4 rounded-lg border-l-4 border-primary">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-primary hover:bg-primary/90">Admin Response</Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(h.created_at), 'MMM dd, yyyy HH:mm')}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{h.content}</p>
                    </div>
                  ))}

                {/* Legacy response display (for messages without history) */}
                {selectedMessage.response && messageHistory.filter(h => h.message_type === 'admin_response').length === 0 && (
                  <div className="bg-primary/10 p-4 rounded-lg border-l-4 border-primary">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-primary hover:bg-primary/90">Admin Response</Badge>
                      {selectedMessage.responded_at && (
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(selectedMessage.responded_at), 'MMM dd, yyyy HH:mm')}
                        </span>
                      )}
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{selectedMessage.response}</p>
                  </div>
                )}
              </div>

              {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2">Attachments</p>
                  <div className="space-y-2">
                    {selectedMessage.attachments.map((attachment: any, index: number) => (
                      <div key={index} className="flex items-center gap-2 bg-muted p-2 rounded">
                        <Paperclip className="h-4 w-4" />
                        <span className="text-sm flex-1">{attachment.name}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(attachment.url, '_blank')}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!selectedMessage.response && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="template">Use Template (Optional)</Label>
                    <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder={templates.length > 0 ? "Select a template..." : "No templates available"} />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.length > 0 ? (
                          templates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">
                            Create templates in Response Templates Manager
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="response">Add Response</Label>
                    <Textarea
                      id="response"
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder="Type your response here..."
                      rows={6}
                      className="break-words-safe resize-none"
                    />
                  </div>

                  <div>
                    <Label htmlFor="attachments">Attach Files (Optional)</Label>
                    <div className="mt-2">
                      <label className="cursor-pointer">
                        <Input
                          id="attachments"
                          type="file"
                          multiple
                          onChange={handleFileUpload}
                          className="hidden"
                          disabled={uploadingAttachments}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          disabled={uploadingAttachments}
                          onClick={() => document.getElementById('attachments')?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {uploadingAttachments ? "Uploading..." : "Upload Attachments"}
                        </Button>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                {selectedMessage.status === 'new' && (
                  <Button 
                    variant="outline"
                    onClick={() => {
                      handleStatusUpdate(selectedMessage.id, 'read');
                      setShowMessageDialog(false);
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Read
                  </Button>
                )}
                {/* Send to Dashboard - only for registered users */}
                {selectedMessage.user_id && selectedMessage.status !== 'closed' && !selectedMessage.response && (
                  <Button onClick={handleSendResponse} disabled={isResponding || !responseText.trim()}>
                    <Send className="h-4 w-4 mr-2" />
                    {isResponding ? "Saving..." : "Send to Dashboard"}
                  </Button>
                )}
                {/* Send via Email - available for ALL messages (registered or visitor) */}
                {!selectedMessage.response && (
                  <Button
                    variant={selectedMessage.user_id ? "outline" : "default"}
                    onClick={() => {
                      const subject = encodeURIComponent(`Re: ${selectedMessage.subject}`);
                      const body = encodeURIComponent(responseText || `Dear ${selectedMessage.name},\n\nThank you for contacting SmartyGym.\n\n[Your response here]\n\nBest regards,\nThe SmartyGym Team`);
                      window.open(`mailto:${selectedMessage.email}?subject=${subject}&body=${body}`, '_blank');
                    }}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Send via Email
                  </Button>
                )}
                {selectedMessage.status !== 'closed' && (
                  <Button 
                    variant="outline"
                    onClick={() => {
                      handleStatusUpdate(selectedMessage.id, 'closed');
                      setShowMessageDialog(false);
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Close
                  </Button>
                )}
                <Button variant="ghost" onClick={() => setShowMessageDialog(false)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message from {messageToDelete?.name}? This action cannot be undone.
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
    </div>
  );
};