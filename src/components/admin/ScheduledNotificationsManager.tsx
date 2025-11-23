import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, Send, Trash2, Ban, Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

interface ScheduledNotification {
  id: string;
  title: string;
  body: string;
  url: string | null;
  icon: string | null;
  target_audience: string;
  scheduled_time: string;
  timezone: string | null;
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

export const ScheduledNotificationsManager = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<ScheduledNotification[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    url: "/",
    icon: "/smarty-gym-logo.png",
    target_audience: "all",
    scheduled_date: "",
    scheduled_time: "",
    timezone: "UTC",
    recurrence_pattern: "once",
    recurrence_interval: "",
  });

  useEffect(() => {
    fetchScheduledNotifications();
  }, []);

  const fetchScheduledNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from("scheduled_notifications")
        .select("*")
        .order("scheduled_time", { ascending: true });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error: any) {
      console.error("Error fetching scheduled notifications:", error);
      toast({
        title: "Error",
        description: "Failed to load scheduled notifications",
        variant: "destructive",
      });
    }
  };

  const handleScheduleNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.body || !formData.scheduled_date || !formData.scheduled_time) {
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
        .from("scheduled_notifications")
        .insert({
          title: formData.title,
          body: formData.body,
          url: formData.url,
          icon: formData.icon,
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
          ? "Notification scheduled successfully"
          : "Recurring notification scheduled successfully",
      });

      setFormData({
        title: "",
        body: "",
        url: "/",
        icon: "/smarty-gym-logo.png",
        target_audience: "all",
        scheduled_date: "",
        scheduled_time: "",
        timezone: "UTC",
        recurrence_pattern: "once",
        recurrence_interval: "",
      });

      fetchScheduledNotifications();
    } catch (error: any) {
      console.error("Error scheduling notification:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to schedule notification",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from("scheduled_notifications")
        .update({ status: "cancelled" })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Notification cancelled",
      });

      fetchScheduledNotifications();
    } catch (error: any) {
      console.error("Error cancelling notification:", error);
      toast({
        title: "Error",
        description: "Failed to cancel notification",
        variant: "destructive",
      });
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from("scheduled_notifications")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Notification deleted",
      });

      fetchScheduledNotifications();
    } catch (error: any) {
      console.error("Error deleting notification:", error);
      toast({
        title: "Error",
        description: "Failed to delete notification",
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

  return (
    <div className="pt-6 space-y-6">
      {/* Schedule New Notification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule New Notification
          </CardTitle>
          <CardDescription>
            Schedule push notifications to be sent at specific times with timezone support and recurring options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleScheduleNotification} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Notification Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Important Update"
                  maxLength={100}
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
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="subscribers">All Subscribers</SelectItem>
                    <SelectItem value="gold">Gold Members</SelectItem>
                    <SelectItem value="platinum">Platinum Members</SelectItem>
                    <SelectItem value="purchasers">Users with Purchases</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Message *</Label>
              <Textarea
                id="body"
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                placeholder="Your notification message..."
                rows={3}
                maxLength={500}
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

            {/* Custom Interval (only show if custom selected) */}
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

            <div className="space-y-2">
              <Label htmlFor="url">Destination URL (optional)</Label>
              <Input
                id="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="/workouts"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full md:w-auto">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Scheduling...
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4 mr-2" /> Schedule Notification
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Scheduled Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Notifications</CardTitle>
          <CardDescription>
            Manage and monitor your scheduled push notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Audience</TableHead>
                  <TableHead>Scheduled Time</TableHead>
                  <TableHead>Recurrence</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No scheduled notifications
                    </TableCell>
                  </TableRow>
                ) : (
                  notifications.map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell className="font-medium">{notification.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {notification.target_audience.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-3 w-3" />
                          {formatScheduledTime(
                            notification.next_scheduled_time || notification.scheduled_time,
                            notification.timezone || "UTC"
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={notification.recurrence_pattern !== "once" ? "secondary" : "outline"}>
                          {getRecurrenceLabel(notification.recurrence_pattern)}
                        </Badge>
                        {notification.last_sent_at && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Last: {format(parseISO(notification.last_sent_at), "PPpp")}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(notification.status, notification.recurrence_pattern)}</TableCell>
                      <TableCell>{notification.recipient_count || 0}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {(notification.status === "pending" || notification.recurrence_pattern !== "once") && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelNotification(notification.id)}
                            >
                              <Ban className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteNotification(notification.id)}
                          >
                            <Trash2 className="h-3 w-3" />
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
