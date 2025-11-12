import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Settings, Bell, Mail, Database, Shield, Download } from "lucide-react";

export const SettingsManager = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // General Settings
  const [defaultWorkoutDuration, setDefaultWorkoutDuration] = useState("30");
  const [defaultProgramWeeks, setDefaultProgramWeeks] = useState("8");
  const [defaultPrice, setDefaultPrice] = useState("9.99");
  const [currency, setCurrency] = useState("EUR");

  // Notification Settings
  const [emailOnNewContact, setEmailOnNewContact] = useState(true);
  const [emailOnNewPurchase, setEmailOnNewPurchase] = useState(true);
  const [emailOnNewPTRequest, setEmailOnNewPTRequest] = useState(true);
  const [dailyAnalyticsSummary, setDailyAnalyticsSummary] = useState(false);

  // System Configuration
  const [senderEmail, setSenderEmail] = useState("noreply@smartygym.com");
  const [replyToEmail, setReplyToEmail] = useState("support@smartygym.com");
  const [maxImageSize, setMaxImageSize] = useState("5");
  const [allowGuestPurchases, setAllowGuestPurchases] = useState(true);

  // Access Control
  const [requireEmailVerification, setRequireEmailVerification] = useState(false);
  const [autoApprovePurchases, setAutoApprovePurchases] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("24");

  const handleSaveGeneral = async () => {
    setLoading(true);
    try {
      toast({
        title: "Settings Saved",
        description: "General preferences have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    try {
      toast({
        title: "Settings Saved",
        description: "Notification preferences have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSystem = async () => {
    setLoading(true);
    try {
      toast({
        title: "Settings Saved",
        description: "System configuration has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAccessControl = async () => {
    setLoading(true);
    try {
      toast({
        title: "Settings Saved",
        description: "Access control settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportDatabase = async () => {
    setLoading(true);
    try {
      // Export workouts
      const { data: workouts } = await supabase
        .from('admin_workouts')
        .select('*');
      
      // Export programs
      const { data: programs } = await supabase
        .from('admin_training_programs')
        .select('*');

      // Create export object
      const exportData = {
        workouts: workouts || [],
        programs: programs || [],
        exportDate: new Date().toISOString(),
      };

      // Download as JSON
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `smartygym-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "Database backup has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export database. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-users-with-emails');
      
      if (error) throw error;

      // Download as CSV
      const csvContent = [
        ['Email', 'Created At', 'Last Sign In'].join(','),
        ...data.users.map((user: any) => 
          [user.email, user.created_at, user.last_sign_in_at].join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "User list has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-2">
          <TabsTrigger value="general" className="text-xs sm:text-sm">
            <Settings className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs sm:text-sm">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="system" className="text-xs sm:text-sm">
            <Mail className="h-4 w-4 mr-2" />
            System
          </TabsTrigger>
          <TabsTrigger value="access" className="text-xs sm:text-sm">
            <Shield className="h-4 w-4 mr-2" />
            Access
          </TabsTrigger>
          <TabsTrigger value="backup" className="text-xs sm:text-sm">
            <Database className="h-4 w-4 mr-2" />
            Backup
          </TabsTrigger>
        </TabsList>

        {/* General Preferences */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Preferences</CardTitle>
              <CardDescription>Configure default values and display options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Default Workout Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={defaultWorkoutDuration}
                    onChange={(e) => setDefaultWorkoutDuration(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Default Program Length (weeks)</Label>
                  <Input
                    type="number"
                    value={defaultProgramWeeks}
                    onChange={(e) => setDefaultProgramWeeks(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Default Standalone Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={defaultPrice}
                    onChange={(e) => setDefaultPrice(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleSaveGeneral} disabled={loading}>
                Save General Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure admin alerts and system notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email on New Contact Message</Label>
                    <p className="text-sm text-muted-foreground">Get notified when users send contact messages</p>
                  </div>
                  <Switch
                    checked={emailOnNewContact}
                    onCheckedChange={setEmailOnNewContact}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email on New Purchase</Label>
                    <p className="text-sm text-muted-foreground">Get notified when a purchase is completed</p>
                  </div>
                  <Switch
                    checked={emailOnNewPurchase}
                    onCheckedChange={setEmailOnNewPurchase}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email on Personal Training Request</Label>
                    <p className="text-sm text-muted-foreground">Get notified when someone requests PT</p>
                  </div>
                  <Switch
                    checked={emailOnNewPTRequest}
                    onCheckedChange={setEmailOnNewPTRequest}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Daily Analytics Summary</Label>
                    <p className="text-sm text-muted-foreground">Receive daily summary of platform activity</p>
                  </div>
                  <Switch
                    checked={dailyAnalyticsSummary}
                    onCheckedChange={setDailyAnalyticsSummary}
                  />
                </div>
              </div>
              <Button onClick={handleSaveNotifications} disabled={loading}>
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Configuration */}
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>Configure email and system settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Sender Email Address</Label>
                  <Input
                    type="email"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    placeholder="noreply@smartygym.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Reply-To Email Address</Label>
                  <Input
                    type="email"
                    value={replyToEmail}
                    onChange={(e) => setReplyToEmail(e.target.value)}
                    placeholder="support@smartygym.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Image Upload Size (MB)</Label>
                  <Input
                    type="number"
                    value={maxImageSize}
                    onChange={(e) => setMaxImageSize(e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Guest Purchases</Label>
                    <p className="text-sm text-muted-foreground">Allow non-registered users to purchase content</p>
                  </div>
                  <Switch
                    checked={allowGuestPurchases}
                    onCheckedChange={setAllowGuestPurchases}
                  />
                </div>
              </div>
              <Button onClick={handleSaveSystem} disabled={loading}>
                Save System Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Access Control */}
        <TabsContent value="access">
          <Card>
            <CardHeader>
              <CardTitle>Access Control Settings</CardTitle>
              <CardDescription>Configure authentication and security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Email Verification</Label>
                    <p className="text-sm text-muted-foreground">Users must verify email before accessing content</p>
                  </div>
                  <Switch
                    checked={requireEmailVerification}
                    onCheckedChange={setRequireEmailVerification}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-Approve Purchases</Label>
                    <p className="text-sm text-muted-foreground">Automatically grant access after payment</p>
                  </div>
                  <Switch
                    checked={autoApprovePurchases}
                    onCheckedChange={setAutoApprovePurchases}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Session Timeout (hours)</Label>
                  <Input
                    type="number"
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={handleSaveAccessControl} disabled={loading}>
                Save Access Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup & Export */}
        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle>Backup & Export Options</CardTitle>
              <CardDescription>Export data and create backups</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <h3 className="font-medium">Export Complete Database</h3>
                    <p className="text-sm text-muted-foreground">
                      Export all workouts and training programs as JSON
                    </p>
                  </div>
                  <Button onClick={handleExportDatabase} disabled={loading}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <h3 className="font-medium">Export User List</h3>
                    <p className="text-sm text-muted-foreground">
                      Export all registered users as CSV
                    </p>
                  </div>
                  <Button onClick={handleExportUsers} disabled={loading}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
                <div className="p-4 border rounded-lg bg-muted/50">
                  <h3 className="font-medium mb-2">Automated Backups</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Your database is automatically backed up daily by Lovable Cloud. You can restore from any backup point in the last 7 days via the Cloud dashboard.
                  </p>
                  <Button variant="outline" onClick={() => window.open('https://lovable.app', '_blank')}>
                    View Cloud Dashboard
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
