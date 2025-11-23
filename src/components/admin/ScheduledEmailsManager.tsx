import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, Mail, Trash2, Ban, Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

interface ScheduledEmail {
  id: string;
  subject: string;
  body: string;
  template_id: string | null;
  target_audience: string;
  recipient_emails: string[] | null;
  scheduled_time: string;
  timezone: string;
  status: string;
  created_at: string;
  sent_at: string | null;
  error_message: string | null;
  recipient_count: number | null;
  recurrence_pattern: string;
  recurrence_interval: string | null;
  last_sent_at: string | null;
  next_scheduled_time: string | null;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

const TIMEZONES = [
  { value: "UTC", label: "UTC" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Europe/Paris", label: "Paris (CET)" },
  { value: "Europe/Athens", label: "Athens (EET)" },
  { value: "America/New_York", label: "New York (EST)" },
  { value: "America/Los_Angeles", label: "Los Angeles (PST)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Asia/Dubai", label: "Dubai (GST)" },
  { value: "Australia/Sydney", label: "Sydney (AEST)" },
];

export const ScheduledEmailsManager = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [emails, setEmails] = useState<ScheduledEmail[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [formData, setFormData] = useState({
    subject: "",
    body: "",
    template_id: "",
    target_audience: "all",
    scheduled_date: "",
    scheduled_time: "",
    timezone: "UTC",
    recurrence_pattern: "once",
    recurrence_interval: "",
  });

  useEffect(() => {
    fetchScheduledEmails();
    fetchTemplates();
  }, []);

  const fetchScheduledEmails = async () => {
    try {
      const { data, error } = await supabase
        .from("scheduled_emails")
        .select("*")
        .order("scheduled_time", { ascending: true });

      if (error) throw error;
      setEmails(data || []);
    } catch (error: any) {
      console.error("Error fetching scheduled emails:", error);
      toast({
        title: "Error",
        description: "Failed to load scheduled emails",
        variant: "destructive",
      });
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from("email_templates")
        .select("id, name, subject, body")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setTemplates(data || []);
    } catch (error: any) {
      console.error("Error fetching templates:", error);
    }
  };

  const handleScheduleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject || !formData.body || !formData.scheduled_date || !formData.scheduled_time) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (formData.recurrence_pattern === "custom" && !formData.recurrence_interval) {
      toast({
        title: "Error",
        description: "Please specify the custom interval in days",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const scheduledDateTime = new Date(`${formData.scheduled_date}T${formData.scheduled_time}:00`);
      
      const { error } = await supabase
        .from("scheduled_emails")
        .insert({
          subject: formData.subject,
          body: formData.body,
          template_id: formData.template_id || null,
          target_audience: formData.target_audience,
          scheduled_time: scheduledDateTime.toISOString(),
          timezone: formData.timezone,
          status: "pending",
          created_by: user?.id,
          recurrence_pattern: formData.recurrence_pattern,
          recurrence_interval: formData.recurrence_interval || null,
          next_scheduled_time: formData.recurrence_pattern !== "once" ? scheduledDateTime.toISOString() : null,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: formData.recurrence_pattern === "once" 
          ? "Email scheduled successfully"
          : "Recurring email scheduled successfully",
      });

      setFormData({
        subject: "",
        body: "",
        template_id: "",
        target_audience: "all",
        scheduled_date: "",
        scheduled_time: "",
        timezone: "UTC",
        recurrence_pattern: "once",
        recurrence_interval: "",
      });

      fetchScheduledEmails();
    } catch (error: any) {
      console.error("Error scheduling email:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to schedule email",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEmail = async (id: string) => {
    try {
      const { error } = await supabase
        .from("scheduled_emails")
        .update({ status: "cancelled" })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Email cancelled",
      });

      fetchScheduledEmails();
    } catch (error: any) {
      console.error("Error cancelling email:", error);
      toast({
        title: "Error",
        description: "Failed to cancel email",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEmail = async (id: string) => {
    try {
      const { error } = await supabase
        .from("scheduled_emails")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Email deleted",
      });

      fetchScheduledEmails();
    } catch (error: any) {
      console.error("Error deleting email:", error);
      toast({
        title: "Error",
        description: "Failed to delete email",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string, recurrencePattern: string) => {
    if (recurrencePattern !== "once" && status === "pending") {
      return (
        <Badge variant="secondary" className="gap-1">
          <RefreshCw className="h-3 w-3" />
          Recurring
        </Badge>
      );
    }
    
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "default",
      sent: "secondary",
      failed: "destructive",
      cancelled: "outline",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getRecurrenceLabel = (pattern: string) => {
    switch (pattern) {
      case "once":
        return "One-time";
      case "daily":
        return "Daily";
      case "weekly":
        return "Weekly (1x/week)";
      case "twice_weekly":
        return "Twice per week";
      case "three_times_weekly":
        return "3x per week";
      case "custom":
        return "Custom";
      default:
        return pattern;
    }
  };

  const formatScheduledTime = (time: string, timezone: string) => {
    try {
      return formatInTimeZone(parseISO(time), timezone, "PPpp");
    } catch {
      return format(parseISO(time), "PPpp");
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    if (templateId === "no-template") {
      setFormData({
        ...formData,
        template_id: "",
        subject: "",
        body: "",
      });
      return;
    }
    
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setFormData({
        ...formData,
        template_id: templateId,
        subject: template.subject,
        body: template.body,
      });
    }
  };

  return (
    <div className="pt-6 space-y-6">
      {/* Schedule New Email */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule New Email
          </CardTitle>
          <CardDescription>
            Schedule emails to be sent at specific times with timezone support and recurring options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleScheduleEmail} className="space-y-4">
            {/* Template Selection */}
            {templates.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="template">Use Template (optional)</Label>
                <Select
                  value={formData.template_id}
                  onValueChange={handleTemplateSelect}
                >
                  <SelectTrigger id="template">
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-template">No template</SelectItem>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Email Subject *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Important Update"
                  maxLength={200}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="target">Target Audience *</Label>
                <Select
                  value={formData.target_audience}
                  onValueChange={(value) => setFormData({ ...formData, target_audience: value })}
                >
                  <SelectTrigger id="target">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Registered Users</SelectItem>
                    <SelectItem value="free">Free Users</SelectItem>
                    <SelectItem value="gold">Gold Members</SelectItem>
                    <SelectItem value="platinum">Platinum Members</SelectItem>
                    <SelectItem value="subscribers">All Premium Subscribers</SelectItem>
                    <SelectItem value="purchasers">Users with Purchases</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Email Message *</Label>
              <Textarea
                id="body"
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                placeholder="Your email message..."
                rows={8}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.scheduled_time}
                  onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={formData.timezone}
                  onValueChange={(value) => setFormData({ ...formData, timezone: value })}
                >
                  <SelectTrigger id="timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Recurrence Pattern */}
            <div className="grid gap-2">
              <Label htmlFor="recurrence_pattern">Recurrence</Label>
              <Select
                value={formData.recurrence_pattern}
                onValueChange={(value) =>
                  setFormData({ ...formData, recurrence_pattern: value })
                }
              >
                <SelectTrigger id="recurrence_pattern">
                  <SelectValue placeholder="Select recurrence" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="once">One-time (no repeat)</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly (1x per week)</SelectItem>
                  <SelectItem value="twice_weekly">Twice per week</SelectItem>
                  <SelectItem value="three_times_weekly">3x per week</SelectItem>
                  <SelectItem value="custom">Custom interval</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Custom Interval */}
            {formData.recurrence_pattern === "custom" && (
              <div className="grid gap-2">
                <Label htmlFor="recurrence_interval">
                  Repeat every X days
                </Label>
                <Input
                  id="recurrence_interval"
                  type="number"
                  min="1"
                  placeholder="e.g., 7 for weekly"
                  value={formData.recurrence_interval}
                  onChange={(e) =>
                    setFormData({ ...formData, recurrence_interval: e.target.value })
                  }
                  required
                />
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full md:w-auto">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Scheduling...
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4 mr-2" /> Schedule Email
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Scheduled Emails List */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Emails</CardTitle>
          <CardDescription>
            Manage and monitor your scheduled email campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Audience</TableHead>
                  <TableHead>Scheduled Time</TableHead>
                  <TableHead>Recurrence</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emails.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No scheduled emails
                    </TableCell>
                  </TableRow>
                ) : (
                  emails.map((email) => (
                    <TableRow key={email.id}>
                      <TableCell className="font-medium">{email.subject}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {email.target_audience.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-3 w-3" />
                          {formatScheduledTime(
                            email.next_scheduled_time || email.scheduled_time,
                            email.timezone
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={email.recurrence_pattern !== "once" ? "secondary" : "outline"}>
                          {getRecurrenceLabel(email.recurrence_pattern)}
                        </Badge>
                        {email.last_sent_at && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Last: {format(parseISO(email.last_sent_at), "PPpp")}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(email.status, email.recurrence_pattern)}</TableCell>
                      <TableCell>{email.recipient_count || 0}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {email.status === "pending" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelEmail(email.id)}
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteEmail(email.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};