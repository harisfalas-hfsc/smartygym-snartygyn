import { Dialog, DialogContent } from "@/components/ui/dialog";
import { getRestrictedEmbedUrl } from "@/utils/youtube";

interface ExerciseVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string | null;
  title: string;
  description?: string | null;
}

const ExerciseVideoModal = ({ isOpen, onClose, videoId, title, description }: ExerciseVideoModalProps) => {
  if (!videoId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-[95vw] p-0 overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-lg line-clamp-1">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-2">{description}</p>
          )}
        </div>
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            className="absolute inset-0 w-full h-full"
            src={getRestrictedEmbedUrl(videoId, true)}
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseVideoModal;
