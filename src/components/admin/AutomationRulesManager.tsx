import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { AutomationRuleEditDialog } from "./AutomationRuleEditDialog";
import { Settings, Calendar, Zap, Mail, MessageSquare, Clock, Users, Archive, Eye, EyeOff, Loader2 } from "lucide-react";
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
  const [showArchived, setShowArchived] = useState(false);
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

  // Helper to check if a rule is a legacy/archived rule
  const isLegacyRule = (rule: AutomationRule): boolean => {
    const legacyIndicators = [
      'Legacy',
      'legacy',
      'ARCHIVED',
      'Now Part of',
      'Use Daily Digest'
    ];
    return (
      legacyIndicators.some(indicator => 
        rule.name.includes(indicator) || (rule.description || '').includes(indicator)
      ) ||
      // Specific legacy automation keys
      ['workout_of_day', 'daily_ritual'].includes(rule.automation_key)
    );
  };

  // Helper to check if rule controls a cron job
  const isCronControlled = (rule: AutomationRule): boolean => {
    const config = rule.trigger_config || {};
    return !!config.cron_job_name || !!config.edge_function_name;
  };

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active, rule }: { id: string; is_active: boolean; rule: AutomationRule }) => {
      const config = rule.trigger_config || {};
      
      // Update the automation rule
      const { error: ruleError } = await supabase
        .from("automation_rules")
        .update({ is_active })
        .eq("id", id);

      if (ruleError) throw ruleError;

      // If this rule controls a cron job, also update cron_job_metadata
      if (config.cron_job_name) {
        const { error: cronError } = await supabase
          .from("cron_job_metadata")
          .update({ is_active })
          .eq("job_name", config.cron_job_name);

        if (cronError) {
          console.warn("Could not update cron job metadata:", cronError.message);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automation-rules"] });
      queryClient.invalidateQueries({ queryKey: ["cron-jobs"] });
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

  // Filter rules based on showArchived state
  const filteredRules = (rules || []).filter(rule => {
    if (showArchived) return true;
    return !isLegacyRule(rule);
  });

  const eventBasedRules = filteredRules.filter((r) => r.rule_type === "event");
  const scheduledRules = filteredRules.filter((r) => r.rule_type === "scheduled");
  
  // Count hidden legacy rules for the toggle
  const hiddenLegacyCount = (rules || []).filter(isLegacyRule).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const renderRuleCard = (rule: AutomationRule) => {
    const isLegacy = isLegacyRule(rule);
    const isCombined = rule.trigger_config?.is_combined_notification === true;

    return (
      <Card 
        key={rule.id} 
        className={`${!rule.is_active ? "opacity-60" : ""} ${isLegacy ? "border-dashed border-muted-foreground/30" : ""}`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {getTriggerIcon(rule.trigger_type)}
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base truncate">{rule.name}</CardTitle>
                {isCombined && (
                  <Badge variant="default" className="mt-1 text-xs">
                    Combined Daily
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isLegacy && (
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  <Archive className="w-3 h-3 mr-1" />
                  Archived
                </Badge>
              )}
              <Switch
                checked={rule.is_active}
                onCheckedChange={(checked) =>
                  toggleActiveMutation.mutate({ id: rule.id, is_active: checked, rule })
                }
                disabled={toggleActiveMutation.isPending}
              />
            </div>
          </div>
          <CardDescription className="text-xs line-clamp-2">{rule.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">
                {rule.rule_type === "event" ? "Trigger:" : "Schedule:"}
              </span>
            </div>
            <span className="font-medium">{getTriggerDescription(rule)}</span>

            <div className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">Type:</span>
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
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-semibold">Automation Rules</h3>
          <p className="text-sm text-muted-foreground">
            Manage all automated messaging workflows
          </p>
        </div>
        
        {hiddenLegacyCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowArchived(!showArchived)}
          >
            {showArchived ? (
              <>
                <EyeOff className="w-4 h-4 mr-2" />
                Hide Archived ({hiddenLegacyCount})
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Show Archived ({hiddenLegacyCount})
              </>
            )}
          </Button>
        )}
      </div>

      {/* Event-Based Automations */}
      {eventBasedRules.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <h4 className="text-md font-semibold">Event-Based Automations</h4>
            <Badge variant="outline">{eventBasedRules.length}</Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {eventBasedRules.map(renderRuleCard)}
          </div>
        </div>
      )}

      {/* Time-Based Automations */}
      {scheduledRules.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <h4 className="text-md font-semibold">Time-Based Automations</h4>
            <Badge variant="outline">{scheduledRules.length}</Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {scheduledRules.map(renderRuleCard)}
          </div>
        </div>
      )}

      {filteredRules.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          {showArchived 
            ? "No automation rules found." 
            : "No active automation rules. Click 'Show Archived' to see legacy rules."
          }
        </div>
      )}

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
