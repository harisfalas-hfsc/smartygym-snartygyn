import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { AppVaultSection } from "@/components/admin/app-vault/AppVaultSection";
import { AppVaultDocExporter } from "@/components/admin/app-vault/AppVaultDocExporter";
import { AppVaultChecklist } from "@/components/admin/app-vault/AppVaultChecklist";
import { supabase } from "@/integrations/supabase/client";
import { 
  Fingerprint, 
  Palette, 
  Globe, 
  Bell, 
  Apple, 
  Play, 
  Server, 
  Shield, 
  Wrench,
  FileText,
  Loader2
} from "lucide-react";

interface VaultField {
  id: string;
  section: string;
  field_key: string;
  field_value: string | null;
  field_type: string;
  notes: string | null;
  display_order: number;
}

const SECTIONS = [
  { id: 'identity', label: 'Identity', icon: Fingerprint, description: 'App name, bundle IDs, descriptions, and metadata' },
  { id: 'branding', label: 'Branding', icon: Palette, description: 'Colors, fonts, icons, and visual assets' },
  { id: 'pwa', label: 'PWA', icon: Globe, description: 'Progressive Web App configuration' },
  { id: 'firebase', label: 'Firebase', icon: Bell, description: 'Push notifications and cloud messaging' },
  { id: 'apple', label: 'Apple iOS', icon: Apple, description: 'App Store Connect requirements' },
  { id: 'google', label: 'Google Play', icon: Play, description: 'Play Console requirements' },
  { id: 'hosting', label: 'Hosting', icon: Server, description: 'Infrastructure and environment' },
  { id: 'ownership', label: 'Ownership', icon: Shield, description: 'Access, migration, and backup' },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench, description: 'Updates and deployment' },
];

export default function SmartyGymAppVault() {
  const [activeTab, setActiveTab] = useState('overview');
  const [vaultData, setVaultData] = useState<VaultField[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVaultData();
  }, []);

  const fetchVaultData = async () => {
    try {
      const { data, error } = await supabase
        .from('app_vault_data')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setVaultData(data || []);
    } catch (err) {
      console.error("Error fetching vault data:", err);
    } finally {
      setLoading(false);
    }
  };

  const getFieldsBySection = (section: string) => {
    return vaultData.filter(f => f.section === section);
  };

  const getCompletionStats = () => {
    const total = vaultData.length;
    const filled = vaultData.filter(f => f.field_value && !f.field_value.includes('[To be configured]')).length;
    return { total, filled, percentage: total > 0 ? Math.round((filled / total) * 100) : 0 };
  };

  const stats = getCompletionStats();

  // Generate checklists based on actual data
  const generateAppleChecklist = () => {
    const appleFields = getFieldsBySection('apple');
    const identityFields = getFieldsBySection('identity');
    
    return [
      { id: '1', label: 'Apple Developer Account', description: 'Active developer membership', completed: true, critical: true },
      { id: '2', label: 'Bundle Identifier', description: 'Unique app identifier', completed: !!identityFields.find(f => f.field_key === 'bundle_id_ios')?.field_value, critical: true },
      { id: '3', label: 'App Icon (1024x1024)', description: 'High-resolution icon', completed: false, critical: true },
      { id: '4', label: 'Privacy Policy URL', description: 'Required for submission', completed: !!identityFields.find(f => f.field_key === 'privacy_policy_url')?.field_value, critical: true },
      { id: '5', label: 'App Description', description: 'Store listing description', completed: !!identityFields.find(f => f.field_key === 'long_description')?.field_value, critical: true },
      { id: '6', label: 'Screenshots', description: 'All required device sizes', completed: false },
      { id: '7', label: 'APNs Configuration', description: 'Push notification setup', completed: false },
      { id: '8', label: 'Provisioning Profile', description: 'Distribution profile', completed: false },
    ];
  };

  const generateGoogleChecklist = () => {
    const identityFields = getFieldsBySection('identity');
    
    return [
      { id: '1', label: 'Google Play Console Account', description: 'Developer account setup', completed: true, critical: true },
      { id: '2', label: 'Package Name', description: 'Unique package identifier', completed: !!identityFields.find(f => f.field_key === 'package_name_android')?.field_value, critical: true },
      { id: '3', label: 'App Icon (512x512)', description: 'High-resolution icon', completed: false, critical: true },
      { id: '4', label: 'Feature Graphic (1024x500)', description: 'Store listing banner', completed: false, critical: true },
      { id: '5', label: 'Privacy Policy URL', description: 'Required for submission', completed: !!identityFields.find(f => f.field_key === 'privacy_policy_url')?.field_value, critical: true },
      { id: '6', label: 'Short Description', description: 'Max 80 characters', completed: !!identityFields.find(f => f.field_key === 'short_description')?.field_value, critical: true },
      { id: '7', label: 'Full Description', description: 'Store listing description', completed: !!identityFields.find(f => f.field_key === 'long_description')?.field_value, critical: true },
      { id: '8', label: 'Screenshots', description: 'Phone and tablet sizes', completed: false },
      { id: '9', label: 'Data Safety Form', description: 'Privacy declarations', completed: false },
      { id: '10', label: 'Content Rating', description: 'IARC questionnaire', completed: true },
    ];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-primary/10 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Vault Completion</p>
          <p className="text-2xl font-bold text-primary">{stats.percentage}%</p>
          <p className="text-xs text-muted-foreground">{stats.filled} of {stats.total} fields</p>
        </div>
        <div className="bg-green-500/10 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Sections Configured</p>
          <p className="text-2xl font-bold text-green-500">{SECTIONS.length}</p>
          <p className="text-xs text-muted-foreground">All categories ready</p>
        </div>
        <div className="bg-orange-500/10 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Export Format</p>
          <p className="text-2xl font-bold text-orange-500">Word</p>
          <p className="text-xs text-muted-foreground">Editable .docx files</p>
        </div>
      </div>

      {/* Document Exporter */}
      <AppVaultDocExporter sections={SECTIONS.map(s => s.id)} />

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <ScrollArea className="w-full">
          <TabsList className="inline-flex w-max">
            <TabsTrigger value="overview" className="gap-2">
              <FileText className="h-4 w-4" />
              Overview
            </TabsTrigger>
            {SECTIONS.map(section => (
              <TabsTrigger key={section.id} value={section.id} className="gap-2">
                <section.icon className="h-4 w-4" />
                {section.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <div className="mt-6">
          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-0 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AppVaultChecklist
                title="Apple iOS Submission Checklist"
                icon={<Apple className="h-5 w-5" />}
                items={generateAppleChecklist()}
              />
              <AppVaultChecklist
                title="Google Play Submission Checklist"
                icon={<Play className="h-5 w-5" />}
                items={generateGoogleChecklist()}
              />
            </div>

            {/* Quick Summary of All Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SECTIONS.map(section => {
                const fields = getFieldsBySection(section.id);
                const filled = fields.filter(f => f.field_value && !f.field_value.includes('[To be configured]')).length;
                return (
                  <div 
                    key={section.id}
                    className="border rounded-lg p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => setActiveTab(section.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <section.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{section.label}</p>
                        <p className="text-xs text-muted-foreground">{filled}/{fields.length} fields</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* Section Tabs */}
          {SECTIONS.map(section => (
            <TabsContent key={section.id} value={section.id} className="mt-0">
              <AppVaultSection
                title={section.label}
                description={section.description}
                icon={<section.icon className="h-5 w-5" />}
                fields={getFieldsBySection(section.id)}
                onUpdate={fetchVaultData}
              />
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
}
