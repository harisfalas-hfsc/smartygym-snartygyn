import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RitualShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ritualDate: string;
  dayNumber: number;
}

export const RitualShareDialog = ({ 
  open, 
  onOpenChange, 
  ritualDate, 
  dayNumber 
}: RitualShareDialogProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/daily-ritual?share=true&date=${ritualDate}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Share this link with friends",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually",
        variant: "destructive",
      });
    }
  };

  const formattedDate = new Date(ritualDate).toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Daily Smarty Ritual - ${formattedDate}`,
          text: "Check out today's Daily Smarty Ritual from SmartyGym!",
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or error
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Daily Ritual</DialogTitle>
          <DialogDescription>
            Share today's ritual with friends. They'll need a Premium subscription or can unlock it for €1.99.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <Input
            value={shareUrl}
            readOnly
            className="flex-1"
          />
          <Button type="button" size="icon" onClick={handleCopy}>
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
        {navigator.share && (
          <Button variant="outline" onClick={handleNativeShare} className="w-full">
            <Share2 className="mr-2 h-4 w-4" />
            Share via...
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
};
