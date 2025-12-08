import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, Users, Loader2, Clock, Zap, Bell } from "lucide-react";
import { ScheduledNotificationsManager } from "./ScheduledNotificationsManager";

interface Template {
  id: string;
  message_type: string;
  template_name: string;
  subject: string;
  content: string;
}

export function MassNotificationManager() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [recipientFilter, setRecipientFilter] = useState<string>("all");
  const [notificationType, setNotificationType] = useState<string>("");
  const [editableSubject, setEditableSubject] = useState("");
  const [editableContent, setEditableContent] = useState("");
  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    const { data, error } = await supabase
      .from('automated_message_templates')
      .select('*')
      .eq('is_active', true)
      .order('template_name');

    if (error) {
      console.error('Error fetching templates:', error);
      return;
    }

    // Filter for announcement templates
    const announcementTemplates = (data || []).filter(t => 
      t.message_type && t.message_type.toString().startsWith('announcement_')
    );
    setTemplates(announcementTemplates);
  };

  const handleTemplateChange = (value: string) => {
    setNotificationType(value);
    const template = templates.find(t => t.message_type === value);
    if (template) {
      setEditableSubject(template.subject);
      setEditableContent(template.content);
    } else {
      setEditableSubject("");
      setEditableContent("");
    }
  };

  const recipientFilters = [
    { value: "all", label: "All Users" },
    { value: "subscribers", label: "Subscribers Only (Gold + Platinum)" },
    { value: "gold", label: "Gold Members Only" },
    { value: "platinum", label: "Platinum Members Only" },
    { value: "purchasers", label: "Users with Purchases" },
    { value: "free", label: "Free Users Only" },
    { value: "corporate_admins", label: "🏢 Corporate Admins Only" },
    { value: "corporate_members", label: "👥 Corporate Members Only" },
    { value: "corporate_all", label: "🏢 All Corporate Users" }
  ];

  const handleSendNotification = async () => {
    if (!notificationType) {
      toast({
        title: "Error",
        description: "Please select a notification template",
        variant: "destructive"
      });
      return;
    }

    if (!editableSubject.trim() || !editableContent.trim()) {
      toast({
        title: "Error",
        description: "Please ensure both subject and content are filled",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-mass-notification', {
        body: {
          messageType: notificationType,
          recipientFilter: recipientFilter,
          subject: editableSubject,
          content: editableContent
        }
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: `Notification sent to ${data.recipientCount} users`,
      });

      // Reset form - reload original template
      const template = templates.find(t => t.message_type === notificationType);
      if (template) {
        setEditableSubject(template.subject);
        setEditableContent(template.content);
      }
      setNotificationType("");
      setEditableSubject("");
      setEditableContent("");
      setRecipientFilter("all");
    } catch (error: any) {
      console.error("Error sending mass notification:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send notification",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-6 space-y-6">
      <Tabs defaultValue="instant" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="instant" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Instant Notifications
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Scheduled Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="instant" className="mt-6 space-y-6">
          {/* Mass Notification Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Send Mass Notification
              </CardTitle>
              <CardDescription>
                Send announcements and notifications to your users. Messages will appear in their dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Recipient Filter */}
              <div className="space-y-2">
                <Label htmlFor="recipient-filter" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Select Recipients
                </Label>
                <Select value={recipientFilter} onValueChange={setRecipientFilter}>
                  <SelectTrigger id="recipient-filter">
                    <SelectValue placeholder="Choose recipient group" />
                  </SelectTrigger>
                  <SelectContent>
                    {recipientFilters.map((filter) => (
                      <SelectItem key={filter.value} value={filter.value}>
                        {filter.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Notification Template */}
              <div className="space-y-2">
                <Label htmlFor="notification-type">Select Notification Template</Label>
                <Select value={notificationType} onValueChange={handleTemplateChange}>
                  <SelectTrigger id="notification-type">
                    <SelectValue placeholder="Choose a template to customize" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.message_type}>
                        {template.template_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Editable Subject */}
              {notificationType && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="editable-subject">
                      Subject <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="editable-subject"
                      placeholder="Notification subject"
                      value={editableSubject}
                      onChange={(e) => setEditableSubject(e.target.value)}
                    />
                  </div>

                  {/* Editable Content */}
                  <div className="space-y-2">
                    <Label htmlFor="editable-content">
                      Message Content <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="editable-content"
                      placeholder="Edit the notification message"
                      value={editableContent}
                      onChange={(e) => setEditableContent(e.target.value)}
                      rows={8}
                      className="resize-none font-mono text-sm break-words-safe"
                    />
                    <p className="text-xs text-muted-foreground">
                      Edit the template above before sending. Original template will be restored after sending.
                    </p>
                  </div>
                </>
              )}

              {/* Recipient Info */}
              {notificationType && (
                <div className="p-4 bg-accent/50 rounded-lg space-y-1">
                  <p className="text-sm font-medium">Recipients:</p>
                  <p className="text-sm text-muted-foreground">
                    {recipientFilters.find(f => f.value === recipientFilter)?.label}
                  </p>
                </div>
              )}

              {/* Send Button */}
              <Button
                onClick={handleSendNotification}
                disabled={loading || !notificationType || !editableSubject.trim() || !editableContent.trim()}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Notifications...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Notification
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="mt-6">
          <ScheduledNotificationsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
