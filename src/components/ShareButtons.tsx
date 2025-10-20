import { Button } from "@/components/ui/button";
import { Share2, Facebook } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const ShareButtons = ({ title, url }: { title: string; url: string }) => {
  const { toast } = useToast();

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: url,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url);
      toast({
        title: "Link copied",
        description: "Share link has been copied to clipboard",
      });
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleShare} className="w-full">
      <Share2 className="h-4 w-4 mr-2" />
      Share
    </Button>
  );
};
