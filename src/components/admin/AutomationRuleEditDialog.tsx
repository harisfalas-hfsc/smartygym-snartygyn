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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Settings, FileText, Info, Plus } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState("settings");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch associated template
  const { data: template, isLoading: templateLoading } = useQuery({
    queryKey: ["message-template", rule.message_type],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("automated_message_templates")
        .select("*")
        .eq("message_type", rule.message_type as any)
        .maybeSingle();

      if (error) throw error;
      return data as MessageTemplate | null;
    },
    enabled: open,
  });

  // Update local template state when fetched
  useEffect(() => {
    if (template) {
      setTemplateData(template);
    }
  }, [template]);

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
          updated_at: new Date().toISOString(),
        })
        .eq("id", templateData.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["message-template", rule.message_type] });
    },
    onError: (error) => {
      throw error;
    },
  });

  const createTemplateMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from("automated_message_templates")
        .insert({
          message_type: rule.message_type as any,
          template_name: rule.name,
          subject: `${rule.name} - Notification`,
          content: `This is the default content for ${rule.name}. Edit this message to customize what users receive.`,
          is_active: true,
          is_default: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data as MessageTemplate;
    },
    onSuccess: (data) => {
      setTemplateData(data);
      queryClient.invalidateQueries({ queryKey: ["message-template", rule.message_type] });
      toast({
        title: "Template Created",
        description: "You can now edit the content for this automation",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Update rule settings
      await updateRuleMutation.mutateAsync(formData);

      // Update template content if changed
      if (templateData && template) {
        if (templateData.subject !== template.subject || templateData.content !== template.content) {
          await updateTemplateMutation.mutateAsync(templateData);
        }
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

  const isLoading = updateRuleMutation.isPending || updateTemplateMutation.isPending || createTemplateMutation.isPending;
  const hints = placeholderHints[rule.message_type] || placeholderHints.default;

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
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="content" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Content
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
              ) : templateData ? (
                <>
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
                    <Label htmlFor="subject">Subject Line</Label>
                    <Input
                      id="subject"
                      value={templateData.subject}
                      onChange={(e) =>
                        setTemplateData({ ...templateData, subject: e.target.value })
                      }
                      placeholder="Email subject line"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Message Content</Label>
                    <Textarea
                      id="content"
                      value={templateData.content}
                      onChange={(e) =>
                        setTemplateData({ ...templateData, content: e.target.value })
                      }
                      rows={12}
                      className="font-mono text-sm"
                      placeholder="Message content (supports HTML for emails)"
                    />
                    <p className="text-xs text-muted-foreground">
                      This content is used for both dashboard messages and emails. HTML formatting is supported for emails.
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
                    Create Template
                  </Button>
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
