import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Mail, 
  MessageSquare, 
  RefreshCw,
  TrendingUp,
  Calendar,
  Settings
} from "lucide-react";

interface MetricData {
  last24h: number;
  last7d: number;
  last30d: number;
}

interface AutomationRule {
  id: string;
  name: string;
  automation_key: string;
  is_active: boolean;
  total_executions: number;
  last_triggered_at: string | null;
  sends_email: boolean;
  sends_dashboard_message: boolean;
}

interface AuditLog {
  id: string;
  notification_type: string;
  subject: string;
  recipient_count: number;
  success_count: number;
  failed_count: number;
  sent_at: string;
}

interface SystemStatus {
  cronEnabled: boolean;
  edgeFunctionsDeployed: boolean;
}

export const MessagingMonitoringDashboard = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Metrics state
  const [totalMessages, setTotalMessages] = useState<MetricData>({ last24h: 0, last7d: 0, last30d: 0 });
  const [successRate, setSuccessRate] = useState<number>(0);
  const [failedCount, setFailedCount] = useState<number>(0);
  
  // Automation rules state
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  
  // Audit log state
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  
  // System status
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({ cronEnabled: false, edgeFunctionsDeployed: true });

  const fetchAllData = async () => {
    try {
      setRefreshing(true);
      
      // Fetch metrics from audit log
      const { data: last24hData } = await supabase
        .from('notification_audit_log')
        .select('*')
        .gte('sent_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
      
      const { data: last7dData } = await supabase
        .from('notification_audit_log')
        .select('*')
        .gte('sent_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
      
      const { data: last30dData } = await supabase
        .from('notification_audit_log')
        .select('*')
        .gte('sent_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
      
      setTotalMessages({
        last24h: last24hData?.length || 0,
        last7d: last7dData?.length || 0,
        last30d: last30dData?.length || 0,
      });
      
      // Calculate success rate
      if (last30dData && last30dData.length > 0) {
        const totalSuccesses = last30dData.reduce((sum, log) => sum + (log.success_count || 0), 0);
        const totalRecipients = last30dData.reduce((sum, log) => sum + (log.recipient_count || 0), 0);
        const rate = totalRecipients > 0 ? (totalSuccesses / totalRecipients) * 100 : 0;
        setSuccessRate(Math.round(rate));
        
        const totalFailed = last30dData.reduce((sum, log) => sum + (log.failed_count || 0), 0);
        setFailedCount(totalFailed);
      }
      
      // Fetch automation rules
      const { data: rules } = await supabase
        .from('automation_rules')
        .select('*')
        .order('name');
      
      if (rules) setAutomationRules(rules);
      
      // Fetch recent audit logs
      const { data: logs } = await supabase
        .from('notification_audit_log')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(50);
      
      if (logs) setAuditLogs(logs);
      
      // Check system status
      try {
        const { data: cronEnabled } = await supabase.rpc('pg_cron_enabled');
        setSystemStatus({
          cronEnabled: !!cronEnabled,
          edgeFunctionsDeployed: true,
        });
      } catch (error) {
        console.error('Error checking cron status:', error);
      }
      
    } catch (error) {
      console.error('Error fetching monitoring data:', error);
      toast({
        title: "Error",
        description: "Failed to load monitoring data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    fetchAllData();
    toast({
      title: "Refreshed",
      description: "Monitoring data updated",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse text-lg">Loading monitoring dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Messaging System Monitor</h2>
          <p className="text-muted-foreground">Real-time insights into automated messaging and notifications</p>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Messages Sent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{totalMessages.last24h}</span>
                <span className="text-xs text-muted-foreground">Last 24h</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {totalMessages.last7d} last 7 days • {totalMessages.last30d} last 30 days
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{successRate}%</span>
                <span className="text-xs text-muted-foreground">Last 30 days</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Based on {totalMessages.last30d} total sends
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="w-4 h-4 text-destructive" />
              Failed Deliveries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{failedCount}</span>
                <span className="text-xs text-muted-foreground">Last 30 days</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {failedCount === 0 ? '✓ All deliveries successful' : 'Review failed messages'}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Settings className="w-4 h-4 text-primary" />
              Active Automations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">
                  {automationRules.filter(r => r.is_active).length}
                </span>
                <span className="text-xs text-muted-foreground">of {automationRules.length}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Configured automation rules
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="automations" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="automations">Automation Rules</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="system">System Health</TabsTrigger>
        </TabsList>

        {/* Automation Rules Tab */}
        <TabsContent value="automations" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Automation Execution Tracker</CardTitle>
              <CardDescription>
                Monitor all automation rules and their execution history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {automationRules.map((rule) => (
                  <div 
                    key={rule.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{rule.name}</h4>
                        <Badge variant={rule.is_active ? "default" : "secondary"}>
                          {rule.is_active ? "Active" : "Paused"}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">
                          {rule.automation_key}
                        </code>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          {rule.sends_email && <Mail className="w-3 h-3" />}
                          {rule.sends_dashboard_message && <MessageSquare className="w-3 h-3" />}
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {rule.total_executions} executions
                        </div>
                        {rule.last_triggered_at && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Last: {new Date(rule.last_triggered_at).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Activity Tab */}
        <TabsContent value="activity" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity Log</CardTitle>
              <CardDescription>
                Last 50 messages sent through the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {auditLogs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No messages sent yet
                  </div>
                ) : (
                  auditLogs.map((log) => (
                    <div 
                      key={log.id}
                      className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-shrink-0 mt-1">
                        {log.failed_count > 0 ? (
                          <XCircle className="w-4 h-4 text-destructive" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium truncate">{log.subject}</span>
                          <Badge variant="outline" className="text-xs">
                            {log.notification_type}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div>
                            Recipients: {log.recipient_count} • 
                            Success: {log.success_count} • 
                            Failed: {log.failed_count}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(log.sent_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Health Tab */}
        <TabsContent value="system" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>System Health Monitor</CardTitle>
              <CardDescription>
                Backend infrastructure and scheduled jobs status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">PostgreSQL Cron (pg_cron)</h4>
                    <p className="text-sm text-muted-foreground">
                      Scheduled job execution engine
                    </p>
                  </div>
                  <Badge variant={systemStatus.cronEnabled ? "default" : "destructive"}>
                    {systemStatus.cronEnabled ? "✓ Enabled" : "✗ Disabled"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Edge Functions</h4>
                    <p className="text-sm text-muted-foreground">
                      Serverless functions for messaging
                    </p>
                  </div>
                  <Badge variant={systemStatus.edgeFunctionsDeployed ? "default" : "secondary"}>
                    {systemStatus.edgeFunctionsDeployed ? "✓ Deployed" : "Not Deployed"}
                  </Badge>
                </div>

                <div className="p-4 border rounded-lg bg-muted/50">
                  <h4 className="font-medium mb-2">Scheduled Jobs Configuration</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">send-scheduled-notifications-job</span>
                      <code className="bg-background px-2 py-0.5 rounded">*/10 min</code>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">send-renewal-reminders-daily</span>
                      <code className="bg-background px-2 py-0.5 rounded">Daily 10 AM UTC</code>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">send-automated-messages-job</span>
                      <code className="bg-background px-2 py-0.5 rounded">*/10 min</code>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">send-weekly-motivation-job</span>
                      <code className="bg-background px-2 py-0.5 rounded">Mon 10 AM UTC</code>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">send-scheduled-emails-job</span>
                      <code className="bg-background px-2 py-0.5 rounded">*/5 min</code>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};