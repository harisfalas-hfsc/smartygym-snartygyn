import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// This is set at build time
const BUILD_TIME = new Date().toISOString();

export function BuildVersionIndicator() {
  const buildDate = new Date(BUILD_TIME);
  const formattedDate = buildDate.toLocaleString('en-CY', {
    timeZone: 'Europe/Nicosia',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className="text-xs gap-1 cursor-help">
            <Info className="h-3 w-3" />
            Build: {formattedDate}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>App version built at this time.</p>
          <p className="text-xs text-muted-foreground">Use to verify deployments.</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
