import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { AutomationRuleEditDialog } from "./AutomationRuleEditDialog";
import { Settings, Calendar, Zap, Mail, MessageSquare, Clock, Users } from "lucide-react";
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
  last_triggered_at: string | null;
  next_trigger_at: string | null;
  total_executions: number;
  created_at: string;
  updated_at: string;
}

export const AutomationRulesManager = () => {
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: rules, isLoading } = useQuery({
    queryKey: ["automation-rules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("automation_rules")
        .select("*")
        .order("rule_type", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;
      return data as AutomationRule[];
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("automation_rules")
        .update({ is_active })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automation-rules"] });
      toast({
        title: "Success",
        description: "Automation status updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update automation: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const getTriggerIcon = (triggerType: string) => {
    switch (triggerType) {
      case "signup":
        return <Users className="w-4 h-4" />;
      case "purchase":
        return <Zap className="w-4 h-4" />;
      case "subscription_renewal":
        return <Calendar className="w-4 h-4" />;
      case "cron":
        return <Clock className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  const getTriggerDescription = (rule: AutomationRule) => {
    const config = rule.trigger_config || {};
    
    if (rule.rule_type === "event") {
      const delay = config.delay_minutes || 0;
      if (delay === 0) return "Immediate";
      return `${delay} minute${delay > 1 ? "s" : ""} after ${rule.trigger_type}`;
    } else {
      return config.description || config.schedule || "Scheduled";
    }
  };

  const eventBasedRules = rules?.filter((r) => r.rule_type === "event") || [];
  const scheduledRules = rules?.filter((r) => r.rule_type === "scheduled") || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading automation rules...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Automation Rules</h3>
          <p className="text-sm text-muted-foreground">
            Manage all automated messaging workflows
          </p>
        </div>
      </div>

      {/* Event-Based Automations */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          <h4 className="text-md font-semibold">Event-Based Automations</h4>
          <Badge variant="outline">{eventBasedRules.length}</Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {eventBasedRules.map((rule) => (
            <Card key={rule.id} className={!rule.is_active ? "opacity-60" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getTriggerIcon(rule.trigger_type)}
                    <CardTitle className="text-base">{rule.name}</CardTitle>
                  </div>
                  <Switch
                    checked={rule.is_active}
                    onCheckedChange={(checked) =>
                      toggleActiveMutation.mutate({ id: rule.id, is_active: checked })
                    }
                  />
                </div>
                <CardDescription className="text-xs">{rule.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Trigger:</span>
                  </div>
                  <span className="font-medium">{getTriggerDescription(rule)}</span>

                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Template:</span>
                  </div>
                  <span className="font-medium text-xs">{rule.message_type}</span>

                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Audience:</span>
                  </div>
                  <span className="font-medium text-xs">{rule.target_audience.replace(/_/g, " ")}</span>
                </div>

                <div className="flex gap-2 pt-2">
                  {rule.sends_email && (
                    <Badge variant="secondary" className="text-xs">
                      <Mail className="w-3 h-3 mr-1" />
                      Email
                    </Badge>
                  )}
                  {rule.sends_dashboard_message && (
                    <Badge variant="secondary" className="text-xs">
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Dashboard
                    </Badge>
                  )}
                </div>

                {rule.total_executions > 0 && (
                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    Sent {rule.total_executions} time{rule.total_executions > 1 ? "s" : ""}
                    {rule.last_triggered_at && (
                      <span> · Last: {format(new Date(rule.last_triggered_at), "PPp")}</span>
                    )}
                  </div>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => setEditingRule(rule)}
                >
                  <Settings className="w-3 h-3 mr-1" />
                  Configure
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Time-Based Automations */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <h4 className="text-md font-semibold">Time-Based Automations</h4>
          <Badge variant="outline">{scheduledRules.length}</Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {scheduledRules.map((rule) => (
            <Card key={rule.id} className={!rule.is_active ? "opacity-60" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getTriggerIcon(rule.trigger_type)}
                    <CardTitle className="text-base">{rule.name}</CardTitle>
                  </div>
                  <Switch
                    checked={rule.is_active}
                    onCheckedChange={(checked) =>
                      toggleActiveMutation.mutate({ id: rule.id, is_active: checked })
                    }
                  />
                </div>
                <CardDescription className="text-xs">{rule.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Schedule:</span>
                  </div>
                  <span className="font-medium">{getTriggerDescription(rule)}</span>

                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Template:</span>
                  </div>
                  <span className="font-medium text-xs">{rule.message_type}</span>

                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Audience:</span>
                  </div>
                  <span className="font-medium text-xs">{rule.target_audience.replace(/_/g, " ")}</span>
                </div>

                <div className="flex gap-2 pt-2">
                  {rule.sends_email && (
                    <Badge variant="secondary" className="text-xs">
                      <Mail className="w-3 h-3 mr-1" />
                      Email
                    </Badge>
                  )}
                  {rule.sends_dashboard_message && (
                    <Badge variant="secondary" className="text-xs">
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Dashboard
                    </Badge>
                  )}
                </div>

                {rule.total_executions > 0 && (
                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    Sent {rule.total_executions} time{rule.total_executions > 1 ? "s" : ""}
                    {rule.last_triggered_at && (
                      <span> · Last: {format(new Date(rule.last_triggered_at), "PPp")}</span>
                    )}
                  </div>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => setEditingRule(rule)}
                >
                  <Settings className="w-3 h-3 mr-1" />
                  Configure
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {editingRule && (
        <AutomationRuleEditDialog
          rule={editingRule}
          open={!!editingRule}
          onOpenChange={(open) => !open && setEditingRule(null)}
        />
      )}
    </div>
  );
};
