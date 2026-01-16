import { ClipboardCheck } from "lucide-react";
import { Link } from "react-router-dom";

export function ParQReminder() {
  return (
    <div className="flex items-center gap-3 p-4 bg-amber-50/50 dark:bg-amber-900/10 rounded-lg border border-amber-200/50 dark:border-amber-800/30">
      <ClipboardCheck className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0" />
      <p className="text-sm text-muted-foreground">
        Before starting any exercise program,{" "}
        <Link 
          to="/dashboard?tab=account" 
          className="font-medium text-primary hover:underline"
        >
          ensure your PAR-Q health assessment
        </Link>{" "}
        is complete and up to date.
      </p>
    </div>
  );
}
