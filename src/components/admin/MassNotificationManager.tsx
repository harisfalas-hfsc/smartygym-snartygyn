import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Send, Users, Loader2 } from "lucide-react";

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
  const [customContent, setCustomContent] = useState("");
  const [subject, setSubject] = useState("");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

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
    setSelectedTemplate(template || null);
    if (template) {
      setSubject(template.subject);
    }
  };

  const recipientFilters = [
    { value: "all", label: "All Users" },
    { value: "subscribers", label: "Subscribers Only (Gold + Platinum)" },
    { value: "gold", label: "Gold Members Only" },
    { value: "platinum", label: "Platinum Members Only" },
    { value: "free", label: "Free Users Only" }
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

    if (!customContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter content for the notification",
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
          customContent: customContent,
          customSubject: subject
        }
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: `Notification sent to ${data.recipientCount} users`,
      });

      // Reset form
      setNotificationType("");
      setCustomContent("");
      setSubject("");
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
    <div className="space-y-6">
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
            <Label htmlFor="notification-type">Notification Template</Label>
            <Select value={notificationType} onValueChange={handleTemplateChange}>
              <SelectTrigger id="notification-type">
                <SelectValue placeholder="Choose a template" />
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

          {/* Template Preview */}
          {selectedTemplate && (
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <p className="text-sm font-semibold">Template Preview:</p>
              <div className="space-y-1">
                <p className="text-sm"><span className="font-medium">Subject:</span> {selectedTemplate.subject}</p>
                <p className="text-sm"><span className="font-medium">Content:</span></p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedTemplate.content}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Note: [Content] will be replaced with your custom content below.
              </p>
            </div>
          )}

          {/* Custom Subject (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="custom-subject">
              Custom Subject <span className="text-muted-foreground">(Optional - leave empty to use template)</span>
            </Label>
            <Input
              id="custom-subject"
              placeholder="e.g., New HIIT Workout - Cardio Blast"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          {/* Custom Content */}
          <div className="space-y-2">
            <Label htmlFor="custom-content">
              Content Details <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="custom-content"
              placeholder="Enter the specific details for this notification (e.g., workout name, program name, offer details). This will replace [Content] in the template."
              value={customContent}
              onChange={(e) => setCustomContent(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-sm text-muted-foreground">
              This content will be inserted into the selected template where [Content] appears.
            </p>
          </div>

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
            disabled={loading || !notificationType || !customContent.trim()}
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
    </div>
  );
}
