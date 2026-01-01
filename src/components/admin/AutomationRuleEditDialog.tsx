import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Settings, FileText, Info, Plus, History, Mail, MessageSquare, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface AutomationRule {
  id: string;
  automation_key: string;
  rule_type: string;
  name: string;
  description: string;
  trigger_type: string;
  trigger_config: any;
  message_type: string;
  target_audience: string;
  is_active: boolean;
  sends_email: boolean;
  sends_dashboard_message: boolean;
}

interface MessageTemplate {
  id: string;
  template_name: string;
  message_type: string;
  subject: string;
  content: string;
  is_active: boolean;
  is_default: boolean;
  automation_key?: string;
  dashboard_subject?: string;
  dashboard_content?: string;
  email_subject?: string;
  email_content?: string;
  updated_at?: string;
}

interface AuditLogEntry {
  id: string;
  sent_at: string;
  subject: string;
  recipient_count: number;
  success_count: number;
  failed_count: number;
}

interface AutomationRuleEditDialogProps {
  rule: AutomationRule;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Placeholder hints for different message types
const placeholderHints: Record<string, string[]> = {
  morning_wod: ["{category}", "{workout_count}", "{workout_list}", "{difficulty_line}"],
  morning_wod_recovery: ["{workout_name}"],
  morning_ritual: ["{day_number}", "{ritual_date}"],
  welcome: ["{user_name}", "{user_email}"],
  purchase_confirmation: ["{item_name}", "{price}", "{user_name}"],
  default: ["{user_name}", "{user_email}"],
};

export const AutomationRuleEditDialog = ({
  rule,
  open,
  onOpenChange,
}: AutomationRuleEditDialogProps) => {
  const [formData, setFormData] = useState(rule);
  const [delayMinutes, setDelayMinutes] = useState(
    rule.trigger_config?.delay_minutes?.toString() || "0"
  );
  const [templateData, setTemplateData] = useState<MessageTemplate | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("settings");
  const [contentChannel, setContentChannel] = useState<"dashboard" | "email">("dashboard");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch ALL templates for this message_type (not just one)
  const { data: templates, isLoading: templateLoading, error: templateError } = useQuery({
    queryKey: ["message-templates-list", rule.message_type],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("automated_message_templates")
        .select("*")
        .eq("message_type", rule.message_type as any)
        .order("is_default", { ascending: false })
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return (data || []) as MessageTemplate[];
    },
    enabled: open,
  });

  // Fetch send history - prioritize automation_key for accurate history
  const { data: sendHistory } = useQuery({
    queryKey: ["notification-history", rule.automation_key, rule.message_type],
    queryFn: async () => {
      // Build query to find relevant audit entries
      // Priority 1: Match by automation_key in metadata (most accurate)
      // Priority 2: Match by message_type/notification_type (legacy fallback)
      
      const { data: allEntries, error } = await supabase
        .from("notification_audit_log")
        .select("id, sent_at, subject, recipient_count, success_count, failed_count, message_type, notification_type, metadata")
        .order("sent_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      
      const entries = allEntries || [];
      
      // Filter entries that match this rule
      const matchingEntries = entries.filter(entry => {
        // Check if metadata contains matching automation_key
        const metadata = entry.metadata as Record<string, any> | null;
        if (metadata?.automation_key === rule.automation_key) {
          return true;
        }
        
        // Fallback: match by message_type or notification_type
        // Map automation_keys to their corresponding notification types
        const automationKeyToTypes: Record<string, string[]> = {
          'morning_wod_notification': ['wod_notification', 'morning_wod'],
          'morning_ritual_notification': ['daily_ritual', 'morning_ritual'],
          'morning_wod_recovery_notification': ['wod_recovery_notification', 'morning_wod_recovery'],
          'welcome_notification': ['welcome', 'welcome_email'],
          'workout_of_day': ['announcement_update', 'wod_notification'],
          'daily_ritual': ['daily_ritual'],
          'checkin_reminders': ['checkin_reminder'],
        };
        
        const matchTypes = automationKeyToTypes[rule.automation_key] || [rule.message_type];
        return matchTypes.includes(entry.message_type) || matchTypes.includes(entry.notification_type);
      });
      
      return matchingEntries.slice(0, 10) as AuditLogEntry[];
    },
    enabled: open && activeTab === "history",
  });

  // Auto-select the correct template when templates load
  // Priority: 1) match automation_key + is_default, 2) match automation_key, 3) is_default, 4) first available
  useEffect(() => {
    if (templates && templates.length > 0) {
      // Filter to only active templates
      const activeTemplates = templates.filter(t => t.is_active);
      
      // Filter templates that match this rule's automation_key
      const matchingKey = activeTemplates.filter(t => t.automation_key === rule.automation_key);
      
      if (matchingKey.length > 0) {
        // Among templates with matching automation_key, prefer the default one
        const defaultInKey = matchingKey.find(t => t.is_default);
        // Otherwise pick the most recently updated
        const sortedByDate = [...matchingKey].sort((a, b) => 
          new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime()
        );
        const selected = defaultInKey || sortedByDate[0];
        setSelectedTemplateId(selected.id);
        setTemplateData(selected);
        return;
      }
      
      // No matching automation_key, fallback to any default
      const defaultTemplate = activeTemplates.find(t => t.is_default);
      if (defaultTemplate) {
        setSelectedTemplateId(defaultTemplate.id);
        setTemplateData(defaultTemplate);
        return;
      }
      
      // Final fallback to the first active template
      const firstActive = activeTemplates[0] || templates[0];
      setSelectedTemplateId(firstActive.id);
      setTemplateData(firstActive);
    } else {
      setSelectedTemplateId(null);
      setTemplateData(null);
    }
  }, [templates, rule.automation_key]);

  // Update templateData when selection changes
  useEffect(() => {
    if (selectedTemplateId && templates) {
      const selected = templates.find(t => t.id === selectedTemplateId);
      if (selected) {
        setTemplateData(selected);
      }
    }
  }, [selectedTemplateId, templates]);

  // Reset form when rule changes
  useEffect(() => {
    setFormData(rule);
    setDelayMinutes(rule.trigger_config?.delay_minutes?.toString() || "0");
  }, [rule]);

  const updateRuleMutation = useMutation({
    mutationFn: async (data: Partial<AutomationRule>) => {
      const updatedConfig = {
        ...data.trigger_config,
        delay_minutes: parseInt(delayMinutes) || 0,
      };

      const { error } = await supabase
        .from("automation_rules")
        .update({
          ...data,
          trigger_config: updatedConfig,
        })
        .eq("id", rule.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automation-rules"] });
    },
    onError: (error) => {
      throw error;
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: async (data: Partial<MessageTemplate>) => {
      if (!templateData?.id) return;

      const { error } = await supabase
        .from("automated_message_templates")
        .update({
          subject: data.subject,
          content: data.content,
          dashboard_subject: data.dashboard_subject,
          dashboard_content: data.dashboard_content,
          email_subject: data.email_subject,
          email_content: data.email_content,
          updated_at: new Date().toISOString(),
        })
        .eq("id", templateData.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["message-templates-list", rule.message_type] });
    },
    onError: (error) => {
      throw error;
    },
  });

  const createTemplateMutation = useMutation({
    mutationFn: async () => {
      // Find existing default to copy content from (so user never starts from scratch)
      const existingDefault = templates?.find(t => t.is_default);
      const copySubject = existingDefault?.subject || `${rule.name} - Notification`;
      const copyContent = existingDefault?.content || `Content for ${rule.name}. Edit to customize.`;
      const copyDashboardSubject = existingDefault?.dashboard_subject || copySubject;
      const copyDashboardContent = existingDefault?.dashboard_content || copyContent;
      const copyEmailSubject = existingDefault?.email_subject || copySubject;
      const copyEmailContent = existingDefault?.email_content || copyContent;

      // Create as DRAFT: NOT active, NOT default - user must explicitly save and activate
      // Link to this rule's automation_key for deterministic selection
      const { data, error } = await supabase
        .from("automated_message_templates")
        .insert({
          message_type: rule.message_type as any,
          template_name: `${rule.name} (Draft)`,
          subject: copySubject,
          content: copyContent,
          dashboard_subject: copyDashboardSubject,
          dashboard_content: copyDashboardContent,
          email_subject: copyEmailSubject,
          email_content: copyEmailContent,
          automation_key: rule.automation_key, // Link to this rule
          is_active: false,  // DRAFT - not active
          is_default: false, // DRAFT - not default
        })
        .select()
        .single();

      if (error) throw error;
      return data as MessageTemplate;
    },
    onSuccess: (data) => {
      setTemplateData(data);
      setSelectedTemplateId(data.id);
      queryClient.invalidateQueries({ queryKey: ["message-templates-list", rule.message_type] });
      toast({
        title: "Draft Template Created",
        description: "Edit the content, then click 'Set as Default' to make it live.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to create template: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const setAsDefaultMutation = useMutation({
    mutationFn: async (templateId: string) => {
      // Get the template we're setting as default to know its automation_key
      const targetTemplate = templates?.find(t => t.id === templateId);
      const targetAutomationKey = targetTemplate?.automation_key || rule.automation_key;

      // CRITICAL FIX: Only unset defaults for templates with the SAME (message_type, automation_key)
      // This prevents breaking other automations that share the same message_type
      let unsetQuery = supabase
        .from("automated_message_templates")
        .update({ is_default: false })
        .eq("message_type", rule.message_type as any);
      
      if (targetAutomationKey) {
        unsetQuery = unsetQuery.eq("automation_key", targetAutomationKey);
      }
      
      await unsetQuery;

      // Then set the new default
      const { error } = await supabase
        .from("automated_message_templates")
        .update({ is_default: true })
        .eq("id", templateId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["message-templates-list", rule.message_type] });
      toast({
        title: "Default Updated",
        description: "This template is now the default for this automation",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to set default: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Update rule settings
      await updateRuleMutation.mutateAsync(formData);

      // Update template content if changed
      if (templateData) {
        await updateTemplateMutation.mutateAsync(templateData);
      }

      toast({
        title: "Success",
        description: "Automation rule and content updated successfully",
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to update: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const selected = templates?.find(t => t.id === templateId);
    if (selected) {
      setTemplateData(selected);
    }
  };

  const isLoading = updateRuleMutation.isPending || updateTemplateMutation.isPending || createTemplateMutation.isPending || setAsDefaultMutation.isPending;
  const hints = placeholderHints[rule.message_type] || placeholderHints.default;

  // Get current channel content
  const getCurrentSubject = () => {
    if (!templateData) return "";
    if (contentChannel === "dashboard") {
      return templateData.dashboard_subject || templateData.subject || "";
    }
    return templateData.email_subject || templateData.subject || "";
  };

  const getCurrentContent = () => {
    if (!templateData) return "";
    if (contentChannel === "dashboard") {
      return templateData.dashboard_content || templateData.content || "";
    }
    return templateData.email_content || templateData.content || "";
  };

  const updateChannelContent = (field: "subject" | "content", value: string) => {
    if (!templateData) return;
    
    if (contentChannel === "dashboard") {
      setTemplateData({
        ...templateData,
        dashboard_subject: field === "subject" ? value : templateData.dashboard_subject,
        dashboard_content: field === "content" ? value : templateData.dashboard_content,
        // Also update legacy fields for backward compatibility
        subject: field === "subject" ? value : templateData.subject,
        content: field === "content" ? value : templateData.content,
      });
    } else {
      setTemplateData({
        ...templateData,
        email_subject: field === "subject" ? value : templateData.email_subject,
        email_content: field === "content" ? value : templateData.email_content,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configure Automation Rule</DialogTitle>
          <DialogDescription>
            Update settings and content for "{rule.name}"
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="content" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Content
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="settings" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Rule Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
              </div>

              {rule.rule_type === "event" && (
                <div className="space-y-2">
                  <Label htmlFor="delay">Delay (minutes)</Label>
                  <Input
                    id="delay"
                    type="number"
                    min="0"
                    value={delayMinutes}
                    onChange={(e) => setDelayMinutes(e.target.value)}
                    placeholder="0 for immediate"
                  />
                  <p className="text-xs text-muted-foreground">
                    Set to 0 for immediate delivery, or specify minutes to delay
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="target_audience">Target Audience</Label>
                <Input
                  id="target_audience"
                  value={formData.target_audience}
                  onChange={(e) =>
                    setFormData({ ...formData, target_audience: e.target.value })
                  }
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Define who receives this automation
                </p>
              </div>

              <div className="border rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-sm">Delivery Channels</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sends_email">Send Email</Label>
                    <p className="text-xs text-muted-foreground">
                      Deliver via email using Resend
                    </p>
                  </div>
                  <Switch
                    id="sends_email"
                    checked={formData.sends_email}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, sends_email: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sends_dashboard_message">Send Dashboard Message</Label>
                    <p className="text-xs text-muted-foreground">
                      Show in user's message panel
                    </p>
                  </div>
                  <Switch
                    id="sends_dashboard_message"
                    checked={formData.sends_dashboard_message}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, sends_dashboard_message: checked })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border rounded-lg p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="is_active">Automation Status</Label>
                  <p className="text-xs text-muted-foreground">
                    {formData.is_active ? "Currently active" : "Currently paused"}
                  </p>
                </div>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked })
                  }
                />
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-4 mt-4">
              {templateLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : templateError ? (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center">
                  <p className="text-sm text-destructive">
                    Error loading templates: {(templateError as Error).message}
                  </p>
                </div>
              ) : templates && templates.length > 0 && templateData ? (
                <>
                  {/* Context header showing which rule/template is being edited */}
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-sm">
                    <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                      <div><span className="font-medium text-foreground">Rule:</span> {rule.name}</div>
                      <div><span className="font-medium text-foreground">Template:</span> {templateData.template_name}</div>
                      <div><span className="font-medium text-foreground">Message Type:</span> <code className="bg-background px-1 rounded text-xs">{rule.message_type}</code></div>
                      <div><span className="font-medium text-foreground">Key:</span> <code className="bg-background px-1 rounded text-xs">{rule.automation_key}</code></div>
                    </div>
                  </div>
                  {/* Template selector if multiple exist */}
                  {templates.length > 1 && (
                    <div className="space-y-2">
                      <Label>Select Template</Label>
                      <div className="flex gap-2">
                        <Select value={selectedTemplateId || ""} onValueChange={handleTemplateSelect}>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select a template" />
                          </SelectTrigger>
                          <SelectContent>
                            {templates.map((t) => (
                              <SelectItem key={t.id} value={t.id}>
                                <div className="flex items-center gap-2">
                                  {t.template_name}
                                  {t.is_default && (
                                    <Badge variant="secondary" className="text-xs">Default</Badge>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {templateData && !templateData.is_default && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setAsDefaultMutation.mutate(templateData.id)}
                            disabled={setAsDefaultMutation.isPending}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Set as Default
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        The default template is the one used when sending notifications.
                      </p>
                    </div>
                  )}

                  {/* Channel tabs for separate email/dashboard content */}
                  <div className="border rounded-lg p-1 bg-muted/30">
                    <div className="flex gap-1">
                      {formData.sends_dashboard_message && (
                        <Button
                          type="button"
                          variant={contentChannel === "dashboard" ? "secondary" : "ghost"}
                          size="sm"
                          className="flex-1"
                          onClick={() => setContentChannel("dashboard")}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Dashboard Message
                        </Button>
                      )}
                      {formData.sends_email && (
                        <Button
                          type="button"
                          variant={contentChannel === "email" ? "secondary" : "ghost"}
                          size="sm"
                          className="flex-1"
                          onClick={() => setContentChannel("email")}
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Email
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="bg-muted/50 border rounded-lg p-3 flex items-start gap-2">
                    <Info className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    <div className="text-xs text-muted-foreground">
                      <p className="font-medium mb-1">Available Placeholders:</p>
                      <div className="flex flex-wrap gap-1">
                        {hints.map((hint) => (
                          <code key={hint} className="bg-background px-1.5 py-0.5 rounded text-foreground">
                            {hint}
                          </code>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">
                      {contentChannel === "email" ? "Email Subject Line" : "Message Title"}
                    </Label>
                    <Input
                      id="subject"
                      value={getCurrentSubject()}
                      onChange={(e) => updateChannelContent("subject", e.target.value)}
                      placeholder={contentChannel === "email" ? "Email subject line" : "Dashboard message title"}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">
                      {contentChannel === "email" ? "Email Content" : "Message Content"}
                    </Label>
                    <RichTextEditor
                      value={getCurrentContent()}
                      onChange={(value) => updateChannelContent("content", value)}
                      placeholder={contentChannel === "email" 
                        ? "Email content (supports HTML formatting)" 
                        : "Dashboard message content"
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      {contentChannel === "email" 
                        ? "Rich formatting is supported for emails." 
                        : "This content appears in the user's dashboard notification panel."
                      }
                    </p>
                  </div>
                </>
              ) : (
                <div className="bg-muted/50 border rounded-lg p-6 text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    No template found for message type: <code className="bg-background px-1 rounded">{rule.message_type}</code>
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Create a template to customize the content for this automation.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => createTemplateMutation.mutate()}
                    disabled={createTemplateMutation.isPending}
                  >
                    {createTemplateMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="mr-2 h-4 w-4" />
                    )}
                    Create Draft Template
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    A draft will be created. Edit it, then use "Set as Default" to activate.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4 mt-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Recent Sends
                </h4>
                <p className="text-xs text-muted-foreground">
                  Last 10 notifications sent for this automation
                </p>
              </div>

              {sendHistory && sendHistory.length > 0 ? (
                <div className="space-y-2">
                  {sendHistory.map((entry) => (
                    <div key={entry.id} className="border rounded-lg p-3 text-sm">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium truncate flex-1">{entry.subject}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {format(new Date(entry.sent_at), "MMM d, HH:mm")}
                        </span>
                      </div>
                      <div className="flex gap-3 text-xs text-muted-foreground">
                        <span>Recipients: {entry.recipient_count || 0}</span>
                        <span className="text-green-600">Sent: {entry.success_count || 0}</span>
                        {(entry.failed_count || 0) > 0 && (
                          <span className="text-destructive">Failed: {entry.failed_count}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-muted/50 border rounded-lg p-6 text-center">
                  <History className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    No send history found for this automation
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};