import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

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

interface AutomationRuleEditDialogProps {
  rule: AutomationRule;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AutomationRuleEditDialog = ({
  rule,
  open,
  onOpenChange,
}: AutomationRuleEditDialogProps) => {
  const [formData, setFormData] = useState(rule);
  const [delayMinutes, setDelayMinutes] = useState(
    rule.trigger_config?.delay_minutes?.toString() || "0"
  );
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<AutomationRule>) => {
      // Update trigger_config with new delay
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
      toast({
        title: "Success",
        description: "Automation rule updated successfully",
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update rule: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configure Automation Rule</DialogTitle>
          <DialogDescription>
            Update the configuration for "{rule.name}"
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
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

            <div className="bg-muted p-3 rounded-lg text-xs space-y-1">
              <p className="font-semibold">Message Template</p>
              <p className="text-muted-foreground">
                Message Type: <span className="font-mono">{rule.message_type}</span>
              </p>
              <p className="text-muted-foreground">
                Edit message content in the "Automated Messages" tab
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending && (
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
