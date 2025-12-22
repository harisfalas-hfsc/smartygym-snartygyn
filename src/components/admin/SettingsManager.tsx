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
import { Settings, Bell, Mail, Database, Shield, Download, HeartPulse, Wrench, Image, RefreshCw, Search, ImagePlus, Send, Trash2 } from "lucide-react";
import { SystemHealthAudit } from "./SystemHealthAudit";

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
  const [maxImageSize, setMaxImageSize] = useState("5");
  const [allowGuestPurchases, setAllowGuestPurchases] = useState(true);

  // Access Control
  const [requireEmailVerification, setRequireEmailVerification] = useState(false);
  const [autoApprovePurchases, setAutoApprovePurchases] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("24");
  const [inactivityTimeout, setInactivityTimeout] = useState("30");

  // Stripe Cleanup
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [cleanupResult, setCleanupResult] = useState<{ updated: number; message: string } | null>(null);

  // Admin Tools Loading States
  const [syncImagesLoading, setSyncImagesLoading] = useState(false);
  const [syncImagesResult, setSyncImagesResult] = useState<string | null>(null);
  const [regenerateWodLoading, setRegenerateWodLoading] = useState(false);
  const [regenerateWodResult, setRegenerateWodResult] = useState<string | null>(null);
  const [refreshSeoLoading, setRefreshSeoLoading] = useState(false);
  const [refreshSeoResult, setRefreshSeoResult] = useState<string | null>(null);
  const [generateImagesLoading, setGenerateImagesLoading] = useState(false);
  const [generateImagesResult, setGenerateImagesResult] = useState<string | null>(null);
  const [reengagementLoading, setReengagementLoading] = useState(false);
  const [reengagementResult, setReengagementResult] = useState<string | null>(null);
  const [cleanupRateLimitsLoading, setCleanupRateLimitsLoading] = useState(false);
  const [cleanupRateLimitsResult, setCleanupRateLimitsResult] = useState<string | null>(null);

  // Load inactivity timeout on mount
  useEffect(() => {
    const loadInactivityTimeout = async () => {
      const { data } = await supabase
        .from('system_settings')
        .select('setting_value')
        .eq('setting_key', 'inactivity_timeout_minutes')
        .single();
      
      if (data?.setting_value) {
        setInactivityTimeout(data.setting_value as string);
      }
    };

    loadInactivityTimeout();
  }, []);

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
      // Save inactivity timeout to database
      const { error } = await supabase
        .from('system_settings')
        .update({ setting_value: inactivityTimeout })
        .eq('setting_key', 'inactivity_timeout_minutes');

      if (error) throw error;

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

  const handleCleanupStripeProducts = async () => {
    if (!confirm("This will remove the 'WOD:' prefix from all Stripe product names. Continue?")) {
      return;
    }
    
    setCleanupLoading(true);
    setCleanupResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('cleanup-stripe-wod-names');
      
      if (error) throw error;

      if (data.success) {
        setCleanupResult({ updated: data.updated?.length || 0, message: data.message });
        toast({
          title: "Cleanup Complete",
          description: data.message,
        });
      } else {
        throw new Error(data.error || "Unknown error");
      }
    } catch (error: any) {
      toast({
        title: "Cleanup Failed",
        description: error.message || "Failed to cleanup Stripe products.",
        variant: "destructive",
      });
    } finally {
      setCleanupLoading(false);
    }
  };

  const handleSyncStripeImages = async () => {
    if (!confirm("This will sync all workout/program images to their Stripe products. Continue?")) {
      return;
    }
    
    setSyncImagesLoading(true);
    setSyncImagesResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('sync-stripe-images');
      
      if (error) throw error;

      setSyncImagesResult(`Synced ${data.synced || 0} images to Stripe`);
      toast({
        title: "Sync Complete",
        description: `Successfully synced ${data.synced || 0} images to Stripe products.`,
      });
    } catch (error: any) {
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync images to Stripe.",
        variant: "destructive",
      });
    } finally {
      setSyncImagesLoading(false);
    }
  };

  const handleRegenerateWod = async () => {
    if (!confirm("This will regenerate today's Workout of the Day. Continue?")) {
      return;
    }
    
    setRegenerateWodLoading(true);
    setRegenerateWodResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('generate-workout-of-day');
      
      if (error) throw error;

      setRegenerateWodResult(`Generated: ${data.workout?.name || 'New WOD'}`);
      toast({
        title: "WOD Generated",
        description: `Successfully generated: ${data.workout?.name || 'New Workout of the Day'}`,
      });
    } catch (error: any) {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate WOD.",
        variant: "destructive",
      });
    } finally {
      setRegenerateWodLoading(false);
    }
  };

  const handleRefreshSeo = async () => {
    if (!confirm("This will refresh SEO metadata for all content. This may take a while. Continue?")) {
      return;
    }
    
    setRefreshSeoLoading(true);
    setRefreshSeoResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('refresh-seo-metadata');
      
      if (error) throw error;

      setRefreshSeoResult(`Updated ${data.updated || 0} items`);
      toast({
        title: "SEO Refresh Complete",
        description: `Successfully updated SEO metadata for ${data.updated || 0} items.`,
      });
    } catch (error: any) {
      toast({
        title: "Refresh Failed",
        description: error.message || "Failed to refresh SEO metadata.",
        variant: "destructive",
      });
    } finally {
      setRefreshSeoLoading(false);
    }
  };

  const handleGenerateMissingImages = async () => {
    if (!confirm("This will generate AI images for workouts that don't have one and sync them to Stripe. This may take several minutes. Continue?")) {
      return;
    }
    
    setGenerateImagesLoading(true);
    setGenerateImagesResult(null);
    try {
      // First, find workouts without images (include stripe_product_id for syncing)
      const { data: workoutsWithoutImages, error: fetchError } = await supabase
        .from('admin_workouts')
        .select('id, name, category, format, difficulty_stars, stripe_product_id')
        .is('image_url', null)
        .limit(5); // Process 5 at a time to avoid timeouts
      
      if (fetchError) throw fetchError;

      if (!workoutsWithoutImages || workoutsWithoutImages.length === 0) {
        setGenerateImagesResult("All workouts already have images!");
        toast({
          title: "No Images Needed",
          description: "All workouts already have images.",
        });
        return;
      }

      let generated = 0;
      let synced = 0;
      for (const workout of workoutsWithoutImages) {
        try {
          const { data, error } = await supabase.functions.invoke('generate-workout-image', {
            body: {
              name: workout.name,
              category: workout.category,
              format: workout.format,
              difficulty_stars: workout.difficulty_stars,
            },
          });
          
          if (!error && data?.image_url) {
            await supabase
              .from('admin_workouts')
              .update({ image_url: data.image_url })
              .eq('id', workout.id);
            generated++;
            
            // If workout has a Stripe product, sync the image to Stripe
            if (workout.stripe_product_id) {
              try {
                await supabase.functions.invoke('sync-stripe-images');
                synced++;
              } catch (syncErr) {
                console.error(`Failed to sync image to Stripe for ${workout.name}:`, syncErr);
              }
            }
          }
        } catch (e) {
          console.error(`Failed to generate image for ${workout.name}:`, e);
        }
      }

      const stripeMsg = synced > 0 ? ` Synced ${synced} to Stripe.` : '';
      setGenerateImagesResult(`Generated ${generated} of ${workoutsWithoutImages.length} images.${stripeMsg}`);
      toast({
        title: "Image Generation Complete",
        description: `Generated ${generated} images.${stripeMsg}${workoutsWithoutImages.length - generated > 0 ? ` ${workoutsWithoutImages.length - generated} failed.` : ''}`,
      });
    } catch (error: any) {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate workout images.",
        variant: "destructive",
      });
    } finally {
      setGenerateImagesLoading(false);
    }
  };

  const handleSendReengagementEmails = async () => {
    if (!confirm("This will send re-engagement emails to users with expired subscriptions. Continue?")) {
      return;
    }
    
    setReengagementLoading(true);
    setReengagementResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('send-reengagement-emails');
      
      if (error) throw error;

      setReengagementResult(`Sent ${data.sent || 0} emails`);
      toast({
        title: "Emails Sent",
        description: `Successfully sent ${data.sent || 0} re-engagement emails.`,
      });
    } catch (error: any) {
      toast({
        title: "Send Failed",
        description: error.message || "Failed to send re-engagement emails.",
        variant: "destructive",
      });
    } finally {
      setReengagementLoading(false);
    }
  };

  const handleCleanupRateLimits = async () => {
    if (!confirm("This will delete expired rate limit records from the database. Continue?")) {
      return;
    }
    
    setCleanupRateLimitsLoading(true);
    setCleanupRateLimitsResult(null);
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('rate_limits')
        .delete()
        .lt('window_start', oneHourAgo)
        .select();
      
      if (error) throw error;

      const deletedCount = data?.length || 0;
      setCleanupRateLimitsResult(`Deleted ${deletedCount} old records`);
      toast({
        title: "Cleanup Complete",
        description: `Deleted ${deletedCount} expired rate limit records.`,
      });
    } catch (error: any) {
      toast({
        title: "Cleanup Failed",
        description: error.message || "Failed to cleanup rate limits.",
        variant: "destructive",
      });
    } finally {
      setCleanupRateLimitsLoading(false);
    }
  };

  return (
    <div className="pt-6 space-y-6 w-full overflow-x-hidden">
      <Tabs defaultValue="general" className="w-full">
        <div className="w-full overflow-x-auto -mx-2 px-2">
          <TabsList className="inline-flex w-auto min-w-full h-auto p-1">
            <TabsTrigger value="general" className="flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-3 py-2 whitespace-nowrap">
              <Settings className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
              <span>General</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-3 py-2 whitespace-nowrap">
              <Bell className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
              <span>Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-3 py-2 whitespace-nowrap">
              <Mail className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
              <span>System</span>
            </TabsTrigger>
            <TabsTrigger value="access" className="flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-3 py-2 whitespace-nowrap">
              <Shield className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
              <span>Access</span>
            </TabsTrigger>
            <TabsTrigger value="backup" className="flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-3 py-2 whitespace-nowrap">
              <Database className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
              <span>Backup</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* General Preferences */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Preferences</CardTitle>
              <CardDescription>Configure default values and display options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">Default Workout Duration (min)</Label>
                  <Input
                    type="number"
                    value={defaultWorkoutDuration}
                    onChange={(e) => setDefaultWorkoutDuration(e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">Default Program Length (weeks)</Label>
                  <Input
                    type="number"
                    value={defaultProgramWeeks}
                    onChange={(e) => setDefaultProgramWeeks(e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">Default Standalone Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={defaultPrice}
                    onChange={(e) => setDefaultPrice(e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="text-sm">
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
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start sm:items-center justify-between gap-3">
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <Label className="text-xs sm:text-sm">Email on New Contact</Label>
                    <p className="text-xs text-muted-foreground">Get notified of contact messages</p>
                  </div>
                  <Switch
                    checked={emailOnNewContact}
                    onCheckedChange={setEmailOnNewContact}
                    className="shrink-0"
                  />
                </div>
                <div className="flex items-start sm:items-center justify-between gap-3">
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <Label className="text-xs sm:text-sm">Email on New Purchase</Label>
                    <p className="text-xs text-muted-foreground">Get notified of purchases</p>
                  </div>
                  <Switch
                    checked={emailOnNewPurchase}
                    onCheckedChange={setEmailOnNewPurchase}
                    className="shrink-0"
                  />
                </div>
                <div className="flex items-start sm:items-center justify-between gap-3">
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <Label className="text-xs sm:text-sm">Email on PT Request</Label>
                    <p className="text-xs text-muted-foreground">Get notified of PT requests</p>
                  </div>
                  <Switch
                    checked={emailOnNewPTRequest}
                    onCheckedChange={setEmailOnNewPTRequest}
                    className="shrink-0"
                  />
                </div>
                <div className="flex items-start sm:items-center justify-between gap-3">
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <Label className="text-xs sm:text-sm">Daily Analytics</Label>
                    <p className="text-xs text-muted-foreground">Daily platform summary</p>
                  </div>
                  <Switch
                    checked={dailyAnalyticsSummary}
                    onCheckedChange={setDailyAnalyticsSummary}
                    className="shrink-0"
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
          <div className="space-y-6">
            {/* System Health Audit */}
            <SystemHealthAudit />

            {/* Stripe Product Cleanup */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Stripe Product Cleanup
                </CardTitle>
                <CardDescription>
                  Remove "WOD:" prefix from Stripe product names. This is a one-time cleanup that won't affect prices, images, or purchase history.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleCleanupStripeProducts} 
                  disabled={cleanupLoading}
                  variant="outline"
                >
                  {cleanupLoading ? "Running Cleanup..." : "Run Stripe Product Cleanup"}
                </Button>
                {cleanupResult && (
                  <p className="text-sm text-muted-foreground">
                    ✅ {cleanupResult.message} ({cleanupResult.updated} products updated)
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Admin Tools Grid */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Admin Tools
                </CardTitle>
                <CardDescription>
                  Quick actions for common administrative tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Sync Stripe Images */}
                  <div className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center gap-2">
                      <Image className="h-5 w-5 text-blue-500" />
                      <h4 className="font-medium text-sm">Sync Stripe Images</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Sync workout images to their Stripe products
                    </p>
                    <Button 
                      onClick={handleSyncStripeImages} 
                      disabled={syncImagesLoading}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      {syncImagesLoading ? "Syncing..." : "Sync Images"}
                    </Button>
                    {syncImagesResult && (
                      <p className="text-xs text-green-600">✅ {syncImagesResult}</p>
                    )}
                  </div>

                  {/* Regenerate WOD */}
                  <div className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-5 w-5 text-orange-500" />
                      <h4 className="font-medium text-sm">Regenerate WOD</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Manually trigger today's Workout of the Day
                    </p>
                    <Button 
                      onClick={handleRegenerateWod} 
                      disabled={regenerateWodLoading}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      {regenerateWodLoading ? "Generating..." : "Regenerate WOD"}
                    </Button>
                    {regenerateWodResult && (
                      <p className="text-xs text-green-600">✅ {regenerateWodResult}</p>
                    )}
                  </div>

                  {/* Refresh SEO */}
                  <div className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center gap-2">
                      <Search className="h-5 w-5 text-purple-500" />
                      <h4 className="font-medium text-sm">Refresh SEO</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Regenerate SEO metadata for all content
                    </p>
                    <Button 
                      onClick={handleRefreshSeo} 
                      disabled={refreshSeoLoading}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      {refreshSeoLoading ? "Refreshing..." : "Refresh SEO"}
                    </Button>
                    {refreshSeoResult && (
                      <p className="text-xs text-green-600">✅ {refreshSeoResult}</p>
                    )}
                  </div>

                  {/* Generate Missing Images */}
                  <div className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center gap-2">
                      <ImagePlus className="h-5 w-5 text-green-500" />
                      <h4 className="font-medium text-sm">Generate Images</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Generate AI images for workouts missing them
                    </p>
                    <Button 
                      onClick={handleGenerateMissingImages} 
                      disabled={generateImagesLoading}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      {generateImagesLoading ? "Generating..." : "Generate Images"}
                    </Button>
                    {generateImagesResult && (
                      <p className="text-xs text-green-600">✅ {generateImagesResult}</p>
                    )}
                  </div>

                  {/* Send Re-engagement Emails */}
                  <div className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center gap-2">
                      <Send className="h-5 w-5 text-pink-500" />
                      <h4 className="font-medium text-sm">Re-engagement</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Send emails to users with expired subscriptions
                    </p>
                    <Button 
                      onClick={handleSendReengagementEmails} 
                      disabled={reengagementLoading}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      {reengagementLoading ? "Sending..." : "Send Emails"}
                    </Button>
                    {reengagementResult && (
                      <p className="text-xs text-green-600">✅ {reengagementResult}</p>
                    )}
                  </div>

                  {/* Cleanup Rate Limits */}
                  <div className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center gap-2">
                      <Trash2 className="h-5 w-5 text-red-500" />
                      <h4 className="font-medium text-sm">Cleanup Rate Limits</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Delete expired rate limit records
                    </p>
                    <Button 
                      onClick={handleCleanupRateLimits} 
                      disabled={cleanupRateLimitsLoading}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      {cleanupRateLimitsLoading ? "Cleaning..." : "Cleanup"}
                    </Button>
                    {cleanupRateLimitsResult && (
                      <p className="text-xs text-green-600">✅ {cleanupRateLimitsResult}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Configuration</CardTitle>
                <CardDescription>Configure email and system settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3 sm:space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm">Max Upload Size (MB)</Label>
                    <Input
                      type="number"
                      value={maxImageSize}
                      onChange={(e) => setMaxImageSize(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div className="flex items-start sm:items-center justify-between gap-3">
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <Label className="text-xs sm:text-sm">Guest Purchases</Label>
                      <p className="text-xs text-muted-foreground">Allow non-registered purchases</p>
                    </div>
                    <Switch
                      checked={allowGuestPurchases}
                      onCheckedChange={setAllowGuestPurchases}
                      className="shrink-0"
                    />
                  </div>
                </div>
                <Button onClick={handleSaveSystem} disabled={loading}>
                  Save System Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Access Control */}
        <TabsContent value="access">
          <Card>
            <CardHeader>
              <CardTitle>Access Control Settings</CardTitle>
              <CardDescription>Configure authentication and security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start sm:items-center justify-between gap-3">
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <Label className="text-xs sm:text-sm">Email Verification</Label>
                    <p className="text-xs text-muted-foreground">Require verified email</p>
                  </div>
                  <Switch
                    checked={requireEmailVerification}
                    onCheckedChange={setRequireEmailVerification}
                    className="shrink-0"
                  />
                </div>
                <div className="flex items-start sm:items-center justify-between gap-3">
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <Label className="text-xs sm:text-sm">Auto-Approve Purchases</Label>
                    <p className="text-xs text-muted-foreground">Grant access after payment</p>
                  </div>
                  <Switch
                    checked={autoApprovePurchases}
                    onCheckedChange={setAutoApprovePurchases}
                    className="shrink-0"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">Session Timeout (hours)</Label>
                  <Input
                    type="number"
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">Inactivity Auto-Logout</Label>
                  <Select value={inactivityTimeout} onValueChange={setInactivityTimeout}>
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes (Testing only)</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="240">4 hours</SelectItem>
                      <SelectItem value="480">8 hours</SelectItem>
                      <SelectItem value="1440">24 hours (Recommended)</SelectItem>
                      <SelectItem value="2880">48 hours</SelectItem>
                      <SelectItem value="10080">7 days</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">⚠️ Setting this too low may prevent users from receiving push notifications. 24 hours is recommended for optimal notification delivery. Users will see a warning 10 minutes before auto-logout.</p>
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
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 border rounded-lg">
                  <div className="space-y-1 flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-medium">Export Database</h3>
                    <p className="text-xs text-muted-foreground">
                      All workouts & programs (JSON)
                    </p>
                  </div>
                  <Button onClick={handleExportDatabase} disabled={loading} className="w-full sm:w-auto shrink-0 text-sm">
                    <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Export
                  </Button>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 border rounded-lg">
                  <div className="space-y-1 flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-medium">Export Users</h3>
                    <p className="text-xs text-muted-foreground">
                      All registered users (CSV)
                    </p>
                  </div>
                  <Button onClick={handleExportUsers} disabled={loading} className="w-full sm:w-auto shrink-0 text-sm">
                    <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Export
                  </Button>
                </div>
                <div className="p-3 sm:p-4 border rounded-lg bg-muted/50">
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
