import { ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, Heart, Star } from "lucide-react";

export interface ActivityItem {
  id: string;
  name: string;
  type: string;
  rating?: number | null;
  is_completed?: boolean;
  is_favorite?: boolean;
}

interface ActivityListSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  icon?: ReactNode;
  items: ActivityItem[];
  emptyText?: string;
  onItemClick: (item: ActivityItem) => void;
}

export function ActivityListSheet({
  open,
  onOpenChange,
  title,
  icon,
  items,
  emptyText = "Nothing here yet",
  onItemClick,
}: ActivityListSheetProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cnPanel}
      >
        <DialogHeader className="sticky top-0 z-10 bg-background border-b px-5 pt-5 pb-4 text-left space-y-0">
          <DialogTitle className="flex items-center gap-2 text-base pr-10">
            {icon}
            <span>{title}</span>
            <Badge variant="secondary" className="ml-1">{items.length}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">{emptyText}</p>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onItemClick(item);
                    onOpenChange(false);
                  }}
                  className="w-full text-left p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors min-h-[44px]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-2 break-words">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {item.type}
                        </Badge>
                        {item.rating ? (
                          <span className="inline-flex items-center gap-1 text-xs">
                            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                            {item.rating}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {item.is_completed && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                      {item.is_favorite && (
                        <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 z-10 bg-background border-t px-4 py-3">
          <DialogClose asChild>
            <Button variant="outline" className="w-full min-h-11 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Floating panel: mobile = inset with margin from every edge (above bottom nav),
// desktop = right-side floating panel with breathing room from all edges.
const cnPanel = [
  // Reset shadcn defaults
  "p-0 gap-0 max-w-none w-auto max-h-none overflow-hidden",
  "translate-x-0 translate-y-0 left-auto top-auto",
  // Mobile: floating panel inset from all edges, above bottom nav (~3.5rem)
  "fixed left-3 right-3",
  "top-[calc(env(safe-area-inset-top,0px)+4rem)]",
  "bottom-[calc(env(safe-area-inset-bottom,0px)+4.5rem)]",
  "rounded-2xl border shadow-2xl",
  "flex flex-col",
  // Desktop: right-side floating panel
  "sm:left-auto sm:right-6 sm:top-24 sm:bottom-6",
  "sm:w-[440px] sm:max-w-[440px]",
  "sm:rounded-2xl",
].join(" ");