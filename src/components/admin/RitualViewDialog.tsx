import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Sunrise, Sun, Moon } from "lucide-react";
import { format } from "date-fns";

interface Ritual {
  id: string;
  ritual_date?: string;
  day_number: number;
  morning_content: string;
  midday_content: string;
  evening_content: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ritual: Ritual | null;
  contextDate?: string | null;
}

export const RitualViewDialog = ({ open, onOpenChange, ritual, contextDate }: Props) => {
  if (!ritual) return null;
  const dateStr = contextDate || ritual.ritual_date;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            <span>Daily Ritual</span>
            <Badge variant="secondary">Ritual {ritual.day_number}</Badge>
            {dateStr && (
              <Badge variant="outline" className="text-xs">
                {(() => { try { return format(new Date(dateStr), "EEE, MMM d, yyyy"); } catch { return dateStr; } })()}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>Read-only preview of the ritual content shown to users.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <section>
            <h3 className="flex items-center gap-2 text-sm font-semibold mb-2">
              <Sunrise className="h-4 w-4 text-orange-500" /> Morning · Activation
            </h3>
            <div
              className="prose prose-sm dark:prose-invert max-w-none rounded-md border p-4 bg-muted/30"
              dangerouslySetInnerHTML={{ __html: ritual.morning_content || "<em>(empty)</em>" }}
            />
          </section>
          <section>
            <h3 className="flex items-center gap-2 text-sm font-semibold mb-2">
              <Sun className="h-4 w-4 text-yellow-600" /> Midday · Reset
            </h3>
            <div
              className="prose prose-sm dark:prose-invert max-w-none rounded-md border p-4 bg-muted/30"
              dangerouslySetInnerHTML={{ __html: ritual.midday_content || "<em>(empty)</em>" }}
            />
          </section>
          <section>
            <h3 className="flex items-center gap-2 text-sm font-semibold mb-2">
              <Moon className="h-4 w-4 text-purple-600" /> Evening · Unwind
            </h3>
            <div
              className="prose prose-sm dark:prose-invert max-w-none rounded-md border p-4 bg-muted/30"
              dangerouslySetInnerHTML={{ __html: ritual.evening_content || "<em>(empty)</em>" }}
            />
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
};