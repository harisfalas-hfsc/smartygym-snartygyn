import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Save, Settings, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AppStoreSettings {
  id: string;
  app_name: string;
  subtitle: string;
  short_description: string;
  keywords: string;
  full_description: string;
  whats_new: string;
  promotional_text: string;
  support_url: string;
  marketing_url: string;
  privacy_policy_url: string;
  terms_of_service_url: string;
  support_email: string;
  category: string;
  content_rating: string;
}

export const AppStoreSettingsEditor = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<AppStoreSettings | null>(null);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("app_store_settings")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setSettings(data);
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("app_store_settings")
        .update({
          app_name: settings.app_name,
          subtitle: settings.subtitle,
          short_description: settings.short_description,
          keywords: settings.keywords,
          full_description: settings.full_description,
          whats_new: settings.whats_new,
          promotional_text: settings.promotional_text,
          support_url: settings.support_url,
          marketing_url: settings.marketing_url,
          privacy_policy_url: settings.privacy_policy_url,
          terms_of_service_url: settings.terms_of_service_url,
          support_email: settings.support_email,
          category: settings.category,
          content_rating: settings.content_rating,
        })
        .eq("id", settings.id);

      if (error) throw error;
      toast.success("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: keyof AppStoreSettings, value: string) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!settings) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No settings found. Please refresh the page.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-blue-500" />
          App Store Content Settings
        </CardTitle>
        <CardDescription>
          Edit all text content for your app store listings. Changes are saved to the database and used when generating the Appy Pie package.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Info */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="app_name">App Name</Label>
            <Input
              id="app_name"
              value={settings.app_name}
              onChange={(e) => updateField("app_name", e.target.value)}
              placeholder="SmartyGym"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtitle (iOS)</Label>
            <Input
              id="subtitle"
              value={settings.subtitle}
              onChange={(e) => updateField("subtitle", e.target.value)}
              placeholder="Your gym reimagined anywhere, anytime"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="short_description">Short Description (Android - 80 chars max)</Label>
          <Input
            id="short_description"
            value={settings.short_description}
            onChange={(e) => updateField("short_description", e.target.value)}
            maxLength={80}
            placeholder="Professional fitness coaching..."
          />
          <p className="text-xs text-muted-foreground">{settings.short_description.length}/80 characters</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="keywords">Keywords (comma-separated)</Label>
          <Input
            id="keywords"
            value={settings.keywords}
            onChange={(e) => updateField("keywords", e.target.value)}
            placeholder="fitness,workout,gym,training..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="full_description">Full Description</Label>
          <Textarea
            id="full_description"
            value={settings.full_description}
            onChange={(e) => updateField("full_description", e.target.value)}
            rows={12}
            placeholder="Enter your full app description..."
          />
          <p className="text-xs text-muted-foreground">{settings.full_description.length}/4000 characters</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="whats_new">What's New</Label>
          <Textarea
            id="whats_new"
            value={settings.whats_new}
            onChange={(e) => updateField("whats_new", e.target.value)}
            rows={4}
            placeholder="Version 1.0.0 - Initial Release..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="promotional_text">Promotional Text</Label>
          <Textarea
            id="promotional_text"
            value={settings.promotional_text}
            onChange={(e) => updateField("promotional_text", e.target.value)}
            rows={2}
            placeholder="Short promotional text..."
          />
        </div>

        {/* URLs */}
        <div className="pt-4 border-t">
          <h4 className="font-semibold mb-4">Links & Contact</h4>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="support_email">Support Email</Label>
              <Input
                id="support_email"
                type="email"
                value={settings.support_email}
                onChange={(e) => updateField("support_email", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="support_url">Support URL</Label>
              <Input
                id="support_url"
                type="url"
                value={settings.support_url}
                onChange={(e) => updateField("support_url", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="privacy_policy_url">Privacy Policy URL</Label>
              <Input
                id="privacy_policy_url"
                type="url"
                value={settings.privacy_policy_url}
                onChange={(e) => updateField("privacy_policy_url", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="terms_of_service_url">Terms of Service URL</Label>
              <Input
                id="terms_of_service_url"
                type="url"
                value={settings.terms_of_service_url}
                onChange={(e) => updateField("terms_of_service_url", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="marketing_url">Marketing URL</Label>
              <Input
                id="marketing_url"
                type="url"
                value={settings.marketing_url}
                onChange={(e) => updateField("marketing_url", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Category & Rating */}
        <div className="pt-4 border-t">
          <h4 className="font-semibold mb-4">Category & Rating</h4>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={settings.category}
                onChange={(e) => updateField("category", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content_rating">Content Rating</Label>
              <Input
                id="content_rating"
                value={settings.content_rating}
                onChange={(e) => updateField("content_rating", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={fetchSettings}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
