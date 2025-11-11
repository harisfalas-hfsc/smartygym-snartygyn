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
import { Mail, MessageSquare, Eye, CheckCircle, X, ArrowLeft, Send, Search, Filter, FileText, Paperclip, Download } from "lucide-react";
import { format } from "date-fns";

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

export const ContactManager = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<ContactMessage[]>([]);
  const [templates, setTemplates] = useState<ResponseTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [isResponding, setIsResponding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  useEffect(() => {
    fetchMessages();
    fetchTemplates();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('contact_messages_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'contact_messages'
        },
        () => {
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
      console.error('Error fetching messages:', error);
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

  const handleViewMessage = async (message: ContactMessage) => {
    setSelectedMessage(message);
    setResponseText(message.response || "");
    setShowMessageDialog(true);

    // Mark as read if not already read
    if (!message.read_at) {
      await supabase
        .from('contact_messages')
        .update({ read_at: new Date().toISOString(), status: 'read' })
        .eq('id', message.id);
      
      fetchMessages();
    }
  };

  const handleStatusUpdate = async (messageId: string, newStatus: string) => {
    const { error } = await supabase
      .from('contact_messages')
      .update({ status: newStatus })
      .eq('id', messageId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Message status updated",
      });
      fetchMessages();
    }
  };

  const handleSendResponse = async () => {
    if (!selectedMessage || !responseText.trim()) return;

    setIsResponding(true);
    const { error } = await supabase
      .from('contact_messages')
      .update({ 
        response: responseText,
        responded_at: new Date().toISOString(),
        status: 'responded'
      })
      .eq('id', selectedMessage.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save response",
        variant: "destructive",
      });
    } else {
      // Send email notification
      if (selectedMessage.user_id && selectedMessage.email) {
        try {
          await supabase.functions.invoke('send-contact-response-notification', {
            body: {
              userId: selectedMessage.user_id,
              userEmail: selectedMessage.email,
              userName: selectedMessage.name,
              subject: selectedMessage.subject,
              responsePreview: responseText,
            }
          });
        } catch (emailError) {
          console.error('Error sending notification email:', emailError);
        }
      }

      toast({
        title: "Response Sent",
        description: "Response has been saved and user has been notified",
      });
      setShowMessageDialog(false);
      fetchMessages();
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
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
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
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">
                All ({messages.length})
              </TabsTrigger>
              <TabsTrigger value="general">
                General ({generalMessages.length})
              </TabsTrigger>
              <TabsTrigger value="support">
                Support ({supportMessages.length})
              </TabsTrigger>
              <TabsTrigger value="coach">
                Coach ({coachMessages.length})
              </TabsTrigger>
              <TabsTrigger value="new">
                New ({newMessages.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4 mt-4">
              {messages.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No messages yet</p>
              ) : (
                messages.map(message => <MessageCard key={message.id} message={message} />)
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
                  <p className="text-sm">{selectedMessage.email}</p>
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

              <div>
                <p className="text-sm font-semibold mb-2">Message</p>
                <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap text-sm">
                  {selectedMessage.message}
                </div>
              </div>

              {selectedMessage.response && (
                <div>
                  <p className="text-sm font-semibold mb-2">Your Response</p>
                  <div className="bg-primary/10 p-4 rounded-lg whitespace-pre-wrap text-sm">
                    {selectedMessage.response}
                  </div>
                  {selectedMessage.responded_at && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Responded on {format(new Date(selectedMessage.responded_at), 'MMM dd, yyyy HH:mm')}
                    </p>
                  )}
                </div>
              )}

              {!selectedMessage.response && (
                <div className="space-y-2">
                  <Label htmlFor="response">Add Response (Internal Note)</Label>
                  <Textarea
                    id="response"
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Add your response or notes here..."
                    rows={6}
                  />
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
                {selectedMessage.user_id && selectedMessage.status !== 'closed' && !selectedMessage.response && (
                  <Button onClick={handleSendResponse} disabled={isResponding || !responseText.trim()}>
                    <Send className="h-4 w-4 mr-2" />
                    {isResponding ? "Saving..." : "Send Response to Dashboard"}
                  </Button>
                )}
                {!selectedMessage.user_id && (
                  <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-3 rounded-lg flex-1">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      💡 This is a visitor message. Respond via email: <strong>{selectedMessage.email}</strong>
                    </p>
                  </div>
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
    </>
  );
};