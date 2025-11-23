import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send, User, Mail, Loader2 } from "lucide-react";

interface UserProfile {
  user_id: string;
  email: string | null;
  full_name: string | null;
  plan_type: string;
}

interface MessageTemplate {
  id: string;
  message_type: string;
  template_name: string;
  subject: string;
  content: string;
  is_active: boolean;
  is_default: boolean;
}

const MESSAGE_TYPES = {
  welcome: "Welcome Message",
  purchase_workout: "Workout Purchase",
  purchase_program: "Program Purchase",
  purchase_personal_training: "Personal Training",
  purchase_subscription: "Subscription",
  renewal_reminder: "Renewal Reminder",
  renewal_thank_you: "Renewal Thank You",
  cancellation: "Cancellation",
};

export const TestMessageSender = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedMessageType, setSelectedMessageType] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    fetchUsers();
    fetchTemplates();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-users-with-emails');
      
      if (error) throw error;
      
      if (data?.users) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    }
  };

  const fetchTemplates = async () => {
    const { data, error } = await supabase
      .from('automated_message_templates')
      .select('*')
      .eq('is_active', true)
      .order('message_type')
      .order('is_default', { ascending: false });

    if (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Error",
        description: "Failed to load templates",
        variant: "destructive",
      });
    } else {
      setTemplates(data || []);
    }
  };

  const handleMessageTypeChange = (messageType: string) => {
    setSelectedMessageType(messageType);
    setSelectedTemplateId("");
    setSubject("");
    setContent("");
    
    // Auto-select default template if available
    const defaultTemplate = templates.find(
      t => t.message_type === messageType && t.is_default
    );
    if (defaultTemplate) {
      setSelectedTemplateId(defaultTemplate.id);
      setSubject(defaultTemplate.subject);
      setContent(defaultTemplate.content);
    }
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSubject(template.subject);
      setContent(template.content);
    }
  };

  const handleSendTestMessage = async () => {
    if (!selectedUserId) {
      toast({
        title: "Validation Error",
        description: "Please select a user",
        variant: "destructive",
      });
      return;
    }

    if (!selectedMessageType) {
      toast({
        title: "Validation Error",
        description: "Please select a message type",
        variant: "destructive",
      });
      return;
    }

    if (!subject || !content) {
      toast({
        title: "Validation Error",
        description: "Subject and content are required",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-system-message', {
        body: {
          userId: selectedUserId,
          messageType: selectedMessageType,
          customData: {}
        }
      });

      if (error) throw error;

      const selectedUser = users.find(u => u.user_id === selectedUserId);
      toast({
        title: "Test Message Sent",
        description: `Message successfully sent to ${selectedUser?.email || 'selected user'}`,
      });

      // Reset form
      setSelectedUserId("");
      setSelectedMessageType("");
      setSelectedTemplateId("");
      setSubject("");
      setContent("");
    } catch (error) {
      console.error('Error sending test message:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send test message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const filteredTemplates = templates.filter(t => t.message_type === selectedMessageType);
  const selectedUser = users.find(u => u.user_id === selectedUserId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5" />
          Test Message Sender
        </CardTitle>
        <CardDescription>
          Send test messages to individual users for workflow testing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* User Selection */}
        <div className="space-y-2">
          <Label htmlFor="user-select" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Select User
          </Label>
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger id="user-select">
              <SelectValue placeholder="Choose a user..." />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.user_id} value={user.user_id}>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3" />
                    <span>{user.email || 'No email'}</span>
                    {user.full_name && (
                      <span className="text-muted-foreground">({user.full_name})</span>
                    )}
                    <span className="text-xs text-muted-foreground ml-2">
                      {user.plan_type}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedUser && (
            <p className="text-sm text-muted-foreground">
              Selected: {selectedUser.email} ({selectedUser.plan_type})
            </p>
          )}
        </div>

        {/* Message Type Selection */}
        <div className="space-y-2">
          <Label htmlFor="message-type-select">Message Type</Label>
          <Select value={selectedMessageType} onValueChange={handleMessageTypeChange}>
            <SelectTrigger id="message-type-select">
              <SelectValue placeholder="Choose message type..." />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(MESSAGE_TYPES).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Template Selection */}
        {selectedMessageType && filteredTemplates.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="template-select">Template</Label>
            <Select value={selectedTemplateId} onValueChange={handleTemplateChange}>
              <SelectTrigger id="template-select">
                <SelectValue placeholder="Choose a template..." />
              </SelectTrigger>
              <SelectContent>
                {filteredTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.template_name}
                    {template.is_default && " (Default)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Subject */}
        {selectedMessageType && (
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Message subject"
            />
          </div>
        )}

        {/* Content */}
        {selectedMessageType && (
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Message content"
              rows={8}
            />
            <p className="text-xs text-muted-foreground">
              Available placeholders: [Plan], [Date], [Amount], [Content]
            </p>
          </div>
        )}

        {/* Send Button */}
        <Button
          onClick={handleSendTestMessage}
          disabled={!selectedUserId || !selectedMessageType || !subject || !content || sending}
          className="w-full"
        >
          {sending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send Test Message
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
