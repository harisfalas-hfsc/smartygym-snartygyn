import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Mail, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RefreshCw,
  Send,
  AlertTriangle
} from "lucide-react";

interface AdminEmailStatus {
  type: string;
  displayName: string;
  lastSent: string | null;
  lastStatus: 'sent' | 'failed' | 'unknown';
  schedule: string;
  recipient: string;
}

export const AdminEmailMonitor = () => {
  const { toast } = useToast();
  const [emailStatuses, setEmailStatuses] = useState<AdminEmailStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string>('');

  const fetchEmailStatuses = async () => {
    setIsLoading(true);
    try {
      // Get admin email from settings
      const { data: settingsData } = await supabase
        .from('system_settings')
        .select('setting_value')
        .eq('setting_key', 'admin_notification_email')
        .maybeSingle();
      
      const settingValue = settingsData?.setting_value as { email?: string } | null;
      const email = settingValue?.email || 'smartygym@outlook.com';
      setAdminEmail(email);

      // Get last 30 days of email delivery logs for admin email types
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      
      const { data: emailLogs } = await supabase
        .from('email_delivery_log')
        .select('message_type, status, sent_at, to_email')
        .in('message_type', [
          'system_health_audit',
          'seo_weekly_report', 
          'contact_notification',
          'wod_generation_failure',
          'admin_notification'
        ])
        .gte('sent_at', thirtyDaysAgo)
        .order('sent_at', { ascending: false });

      // Get notification audit logs for additional context
      const { data: auditLogs } = await supabase
        .from('notification_audit_log')
        .select('notification_type, sent_at, success_count, failed_count')
        .in('notification_type', [
          'system_health_audit',
          'seo_weekly_report',
          'admin_notification'
        ])
        .gte('sent_at', thirtyDaysAgo)
        .order('sent_at', { ascending: false });

      // Build status map
      const adminEmailTypes = [
        { type: 'system_health_audit', displayName: 'System Health Audit', schedule: 'Daily 17:00 Cyprus' },
        { type: 'seo_weekly_report', displayName: 'SEO Weekly Report', schedule: 'Sunday 05:00 Cyprus' },
        { type: 'contact_notification', displayName: 'Contact Requests', schedule: 'On new contact' },
        { type: 'wod_generation_failure', displayName: 'WOD Failure Alerts', schedule: 'On failure' },
      ];

      const statuses: AdminEmailStatus[] = adminEmailTypes.map(et => {
        // Find the latest log for this type
        const latestLog = emailLogs?.find(l => l.message_type === et.type);
        const latestAudit = auditLogs?.find(l => l.notification_type === et.type);
        
        let lastSent = latestLog?.sent_at || latestAudit?.sent_at || null;
        let lastStatus: 'sent' | 'failed' | 'unknown' = 'unknown';
        
        if (latestLog) {
          lastStatus = latestLog.status === 'sent' ? 'sent' : 'failed';
        } else if (latestAudit) {
          lastStatus = (latestAudit.success_count || 0) > 0 ? 'sent' : 'failed';
        }

        return {
          type: et.type,
          displayName: et.displayName,
          lastSent,
          lastStatus,
          schedule: et.schedule,
          recipient: email
        };
      });

      setEmailStatuses(statuses);
    } catch (error) {
      console.error("Failed to fetch email statuses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmailStatuses();
  }, []);

  const sendTestEmail = async () => {
    setIsSendingTest(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-test-admin-email');
      
      if (error) throw error;
      
      toast({
        title: "Test Email Sent",
        description: `Check ${adminEmail} for the test email`,
      });
      
      // Refresh statuses after a delay
      setTimeout(() => fetchEmailStatuses(), 3000);
    } catch (error: any) {
      console.error("Test email failed:", error);
      toast({
        title: "Test Email Failed",
        description: error.message || "Could not send test email",
        variant: "destructive",
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  const formatLastSent = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    
    const date = new Date(dateStr);
    const now = new Date();
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 1) return `${Math.round(diffHours * 60)} min ago`;
    if (diffHours < 24) return `${Math.round(diffHours)} hours ago`;
    if (diffHours < 48) return 'Yesterday';
    
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent': 
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Sent</Badge>;
      case 'failed': 
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">Failed</Badge>;
      default: 
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">Unknown</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-500" />
              Admin Email Monitor
            </CardTitle>
            <CardDescription>
              Track delivery of admin notifications to {adminEmail}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchEmailStatuses}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              size="sm" 
              onClick={sendTestEmail}
              disabled={isSendingTest}
            >
              {isSendingTest ? (
                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-1" />
              )}
              Send Test
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground">
            Loading email statuses...
          </div>
        ) : (
          <div className="space-y-3">
            {emailStatuses.map((status) => (
              <div 
                key={status.type}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(status.lastStatus)}
                  <div>
                    <div className="font-medium">{status.displayName}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {status.schedule}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm">{formatLastSent(status.lastSent)}</div>
                    {getStatusBadge(status.lastStatus)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-950 text-sm">
          <div className="font-medium text-blue-700 dark:text-blue-300">📬 Admin Email Address</div>
          <div className="text-blue-600 dark:text-blue-400 mt-1">{adminEmail}</div>
          <div className="text-xs text-blue-500 dark:text-blue-500 mt-1">
            Configured in System Settings → Admin Notification Email
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
