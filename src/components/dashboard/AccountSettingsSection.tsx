import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Trash2, Loader2, Shield, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { DeleteAccountDialog } from "./DeleteAccountDialog";

interface AccountSettingsSectionProps {
  userEmail: string;
  onAccountDeleted: () => void;
}

export function AccountSettingsSection({ userEmail, onAccountDeleted }: AccountSettingsSectionProps) {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDownloadData = async () => {
    setIsExporting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      const { data, error } = await supabase.functions.invoke("export-user-data", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      // Create blob and download
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `smartygym-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Data Exported",
        description: "Your personal data has been downloaded successfully.",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export your data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5" />
            Account & Privacy
          </CardTitle>
          <CardDescription>
            Manage your account data and privacy settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Download Data Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg bg-muted/50">
            <div className="flex-1">
              <h4 className="font-medium text-sm">Download Your Data</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Export all your personal data as a JSON file (GDPR compliant)
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadData}
              disabled={isExporting}
              className="shrink-0"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {isExporting ? "Exporting..." : "Download Data"}
            </Button>
          </div>

          {/* Delete Account Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg bg-destructive/5 border border-destructive/20">
            <div className="flex-1">
              <h4 className="font-medium text-sm text-destructive flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Delete Your Account
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="shrink-0"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      <DeleteAccountDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        userEmail={userEmail}
        onAccountDeleted={onAccountDeleted}
      />
    </>
  );
}
