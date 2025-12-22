import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FileText, Download, Loader2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AppVaultDocExporterProps {
  sections: string[];
}

const SECTION_LABELS: Record<string, string> = {
  identity: "Application Identity & Metadata",
  branding: "Branding & Visual Assets",
  pwa: "PWA Configuration",
  firebase: "Firebase & Push Notifications",
  apple: "Apple iOS Submission Requirements",
  google: "Google Play Store Submission Requirements",
  hosting: "Hosting & Infrastructure",
  ownership: "Ownership & Access",
  maintenance: "Maintenance & Updates",
};

export function AppVaultDocExporter({ sections }: AppVaultDocExporterProps) {
  const [exporting, setExporting] = useState<string | null>(null);

  const exportDocument = async (section: string | 'all') => {
    setExporting(section);
    try {
      const { data, error } = await supabase.functions.invoke('generate-app-vault-document', {
        body: { section },
      });

      if (error) throw error;
      if (!data?.document) throw new Error('No document generated');

      // Create download from base64
      const blob = new Blob(
        [Uint8Array.from(atob(data.document), c => c.charCodeAt(0))],
        { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }
      );
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.filename || `SmartyGym-${section}-${new Date().toISOString().split('T')[0]}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`${section === 'all' ? 'Complete vault' : SECTION_LABELS[section]} exported successfully`);
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Failed to export document");
    } finally {
      setExporting(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg">Export Documentation</CardTitle>
            <CardDescription>Download Word documents for submission or sharing</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => exportDocument('all')}
            disabled={!!exporting}
            className="gap-2"
          >
            {exporting === 'all' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Export Complete Vault
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={!!exporting} className="gap-2">
                Export Section
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              {sections.map((section) => (
                <DropdownMenuItem
                  key={section}
                  onClick={() => exportDocument(section)}
                  className="cursor-pointer"
                  disabled={!!exporting}
                >
                  {exporting === section ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4 mr-2" />
                  )}
                  {SECTION_LABELS[section] || section}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="text-xs text-muted-foreground">
          Documents are generated as editable Word files (.docx) with all current vault data.
        </p>
      </CardContent>
    </Card>
  );
}
