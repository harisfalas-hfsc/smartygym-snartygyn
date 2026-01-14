import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, AlertTriangle, Trash2, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DeleteAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  onAccountDeleted: () => void;
}

export function DeleteAccountDialog({
  isOpen,
  onClose,
  userEmail,
  onAccountDeleted,
}: DeleteAccountDialogProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [understood, setUnderstood] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const resetAndClose = () => {
    setStep(1);
    setUnderstood(false);
    setConfirmationText("");
    setIsDeleting(false);
    onClose();
  };

  const handleDownloadBeforeDelete = async () => {
    setIsExporting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("export-user-data", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

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
        description: "Your data backup has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Could not export data. You can still proceed with deletion.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmationText !== "DELETE") {
      toast({
        title: "Invalid Confirmation",
        description: "Please type DELETE to confirm account deletion.",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    setStep(3);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("delete-user-account", {
        body: { confirmationText },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // Sign out the user
      await supabase.auth.signOut();

      toast({
        title: "Account Deleted",
        description: "Your account and all data have been permanently deleted.",
      });

      onAccountDeleted();
    } catch (error) {
      console.error("Delete error:", error);
      setStep(2);
      setIsDeleting(false);
      toast({
        title: "Deletion Failed",
        description: error instanceof Error ? error.message : "Failed to delete account. Please try again or contact support.",
        variant: "destructive",
      });
    }
  };

  const dataToBeDeleted = [
    "Profile information and preferences",
    "Workout history and interactions",
    "Training program progress",
    "Check-in data and scores",
    "Calculator history (1RM, BMR, Calories)",
    "Goals and measurements",
    "Messages and notifications",
    "Purchases and subscriptions",
    "Badges and achievements",
    "All other personal data",
  ];

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && resetAndClose()}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Your Account
          </AlertDialogTitle>
        </AlertDialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <AlertDialogDescription className="text-sm">
              This action is <strong>permanent and irreversible</strong>. All your data will be deleted, including:
            </AlertDialogDescription>

            <ul className="text-sm text-muted-foreground space-y-1 pl-4">
              {dataToBeDeleted.map((item, i) => (
                <li key={i} className="list-disc">
                  {item}
                </li>
              ))}
            </ul>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
              <p className="text-sm text-amber-700 dark:text-amber-400">
                <strong>Tip:</strong> Download your data before deleting your account to keep a backup of your fitness history.
              </p>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleDownloadBeforeDelete}
              disabled={isExporting}
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {isExporting ? "Downloading..." : "Download My Data First"}
            </Button>

            <div className="flex items-start space-x-2 pt-2">
              <Checkbox
                id="understand"
                checked={understood}
                onCheckedChange={(checked) => setUnderstood(checked === true)}
              />
              <Label htmlFor="understand" className="text-sm leading-tight cursor-pointer">
                I understand that this action is permanent and all my data will be deleted forever.
              </Label>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={resetAndClose}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => setStep(2)}
                disabled={!understood}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <AlertDialogDescription className="text-sm">
              To confirm deletion of <strong>{userEmail}</strong>, please type <strong>DELETE</strong> below:
            </AlertDialogDescription>

            <Input
              placeholder="Type DELETE to confirm"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value.toUpperCase())}
              className="text-center font-mono tracking-widest"
              autoFocus
            />

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleDeleteAccount}
                disabled={confirmationText !== "DELETE" || isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Forever
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-destructive" />
              <div className="text-center">
                <p className="font-medium">Deleting your account...</p>
                <p className="text-sm text-muted-foreground mt-1">
                  This may take a moment. Please don't close this window.
                </p>
              </div>
            </div>
          </div>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
