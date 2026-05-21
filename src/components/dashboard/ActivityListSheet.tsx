import { ReactNode } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Heart, Star } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={
          isMobile
            ? "h-[88vh] max-h-[88vh] rounded-t-2xl p-0 flex flex-col gap-0"
            : "w-full sm:max-w-md p-0 flex flex-col gap-0"
        }
      >
        <SheetHeader className="sticky top-0 z-10 bg-background border-b px-5 pt-5 pb-4 text-left">
          <SheetTitle className="flex items-center gap-2 text-base pr-10">
            {icon}
            <span>{title}</span>
            <Badge variant="secondary" className="ml-1">{items.length}</Badge>
          </SheetTitle>
        </SheetHeader>

        <div
          className="flex-1 overflow-y-auto px-4 py-3"
          style={{ paddingBottom: "max(env(safe-area-inset-bottom), 1rem)" }}
        >
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
      </SheetContent>
    </Sheet>
  );
}