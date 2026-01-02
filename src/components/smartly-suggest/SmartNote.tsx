import { Info, AlertTriangle, Sparkles } from "lucide-react";
import { SmartNote } from "@/utils/smartly-suggest/smartNoteGenerator";
import { cn } from "@/lib/utils";

interface SmartNoteDisplayProps {
  note: SmartNote;
}

export const SmartNoteDisplay = ({ note }: SmartNoteDisplayProps) => {
  const getIcon = () => {
    switch (note.type) {
      case 'caution':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'encouragement':
        return <Sparkles className="h-4 w-4 text-primary" />;
      default:
        return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getBackgroundColor = () => {
    switch (note.type) {
      case 'caution':
        return 'bg-amber-500/5 border-amber-500/20';
      case 'encouragement':
        return 'bg-primary/5 border-primary/20';
      default:
        return 'bg-muted/50 border-border';
    }
  };

  return (
    <div 
      className={cn(
        "flex items-start gap-3 p-4 rounded-xl border",
        getBackgroundColor()
      )}
    >
      <div className="mt-0.5 shrink-0">
        {getIcon()}
      </div>
      <p className="text-sm text-foreground/80 leading-relaxed">
        {note.message}
      </p>
    </div>
  );
};
