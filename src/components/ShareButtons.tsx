import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const ShareButtons = ({ title, url }: { title: string; url: string }) => {
  const { toast } = useToast();

  const handleShare = async () => {
    // Check if Web Share API is available
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Check out this article: ${title}`,
          url: url,
        });
        toast({
          title: "Shared successfully",
          description: "Article has been shared",
        });
      } catch (err) {
        // User cancelled or error occurred
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
          // Fallback to clipboard
          copyToClipboard();
        }
      }
    } else {
      // Fallback: copy to clipboard
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "Link copied!",
        description: "Share link has been copied to clipboard",
      });
    }).catch(() => {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    });
  };

  return (
    <Button variant="outline" size="sm" onClick={handleShare} className="w-full">
      <Share2 className="h-4 w-4 mr-2" />
      Share
    </Button>
  );
};
