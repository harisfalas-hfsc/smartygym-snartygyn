import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AvatarUpload } from "@/components/AvatarUpload";
import { Button } from "@/components/ui/button";

interface AvatarSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName?: string;
}

export const AvatarSetupDialog = ({ open, onOpenChange, userId, userName }: AvatarSetupDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to SmartyGym!</DialogTitle>
          <DialogDescription>
            Let's set up your profile. Upload an avatar so other members can recognize you.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6">
          <AvatarUpload 
            userId={userId}
            userName={userName}
            onAvatarUpdate={() => {}}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Skip for now
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
