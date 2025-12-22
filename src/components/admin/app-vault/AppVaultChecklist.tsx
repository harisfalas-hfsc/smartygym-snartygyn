import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, AlertCircle } from "lucide-react";

interface ChecklistItem {
  id: string;
  label: string;
  description?: string;
  completed: boolean;
  critical?: boolean;
}

interface AppVaultChecklistProps {
  title: string;
  icon: React.ReactNode;
  items: ChecklistItem[];
}

export function AppVaultChecklist({ title, icon, items }: AppVaultChecklistProps) {
  const completedCount = items.filter(i => i.completed).length;
  const progress = Math.round((completedCount / items.length) * 100);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              {icon}
            </div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription>
                {completedCount} of {items.length} items ready
              </CardDescription>
            </div>
          </div>
          <Badge variant={progress === 100 ? "default" : progress > 50 ? "secondary" : "outline"}>
            {progress}%
          </Badge>
        </div>
        
        <div className="w-full bg-muted rounded-full h-2 mt-4">
          <div 
            className="bg-primary h-2 rounded-full transition-all" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div 
            key={item.id} 
            className={`flex items-start gap-3 p-2 rounded-lg ${
              item.completed ? 'bg-green-500/10' : item.critical ? 'bg-destructive/10' : ''
            }`}
          >
            {item.completed ? (
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
            ) : item.critical ? (
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
            )}
            <div className="flex-1">
              <p className={`text-sm font-medium ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                {item.label}
              </p>
              {item.description && (
                <p className="text-xs text-muted-foreground">{item.description}</p>
              )}
            </div>
            {item.critical && !item.completed && (
              <Badge variant="destructive" className="text-xs">Required</Badge>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
