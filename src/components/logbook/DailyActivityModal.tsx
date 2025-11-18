import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Calendar, User, Calculator } from "lucide-react";
import { useActivityLog } from "@/hooks/useActivityLog";
import { format } from "date-fns";

interface DailyActivityModalProps {
  date: Date;
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export const DailyActivityModal = ({ date, isOpen, onClose, userId }: DailyActivityModalProps) => {
  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const { activities, isLoading } = useActivityLog(userId);

  const dayActivities = activities.filter(a => a.activity_date === dateStr);

  const workouts = dayActivities.filter(a => a.content_type === 'workout');
  const programs = dayActivities.filter(a => a.content_type === 'program');
  const personalTraining = dayActivities.filter(a => a.content_type === 'personal_training');
  const tools = dayActivities.filter(a => a.content_type === 'tool');

  const getBadgeVariant = (actionType: string): "default" | "secondary" | "outline" => {
    if (actionType.includes('completed')) return 'default';
    if (actionType.includes('viewed')) return 'secondary';
    return 'outline';
  };

  const getActionLabel = (actionType: string) => {
    const labels: Record<string, string> = {
      'viewed': 'Viewed',
      'completed': 'Completed',
      'calculated': 'Calculated',
      'program_started': '🔥 Started',
      'program_day_viewed': 'Day Viewed',
      'program_day_completed': 'Day Completed',
      'pt_started': '🔥 Started',
      'pt_day_viewed': 'Day Viewed',
      'pt_day_completed': 'Day Completed',
    };
    return labels[actionType] || actionType;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Activity Log - {format(date, 'MMMM d, yyyy')}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : dayActivities.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No activities recorded for this day
          </div>
        ) : (
          <div className="space-y-6">
            {/* Workouts Section */}
            {workouts.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Dumbbell className="h-4 w-4 text-green-500" />
                  Workouts ({workouts.length})
                </h3>
                <div className="space-y-2">
                  {workouts.map(activity => (
                    <Card key={activity.id}>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{activity.item_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(activity.created_at), 'h:mm a')}
                            </p>
                          </div>
                          <Badge variant={getBadgeVariant(activity.action_type)}>
                            {getActionLabel(activity.action_type)}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Programs Section */}
            {programs.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  Training Programs ({programs.length})
                </h3>
                <div className="space-y-2">
                  {programs.map(activity => (
                    <Card key={activity.id}>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{activity.item_name}</p>
                            {activity.program_week && activity.program_day && (
                              <p className="text-sm text-muted-foreground">
                                Week {activity.program_week}, Day {activity.program_day}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(activity.created_at), 'h:mm a')}
                            </p>
                          </div>
                          <Badge variant={getBadgeVariant(activity.action_type)}>
                            {getActionLabel(activity.action_type)}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Personal Training Section */}
            {personalTraining.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="h-4 w-4 text-orange-500" />
                  Personal Training ({personalTraining.length})
                </h3>
                <div className="space-y-2">
                  {personalTraining.map(activity => (
                    <Card key={activity.id}>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{activity.item_name}</p>
                            {activity.program_week && activity.program_day && (
                              <p className="text-sm text-muted-foreground">
                                Week {activity.program_week}, Day {activity.program_day}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(activity.created_at), 'h:mm a')}
                            </p>
                          </div>
                          <Badge variant={getBadgeVariant(activity.action_type)}>
                            {getActionLabel(activity.action_type)}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Tools Section */}
            {tools.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-purple-500" />
                  Calculator Tools ({tools.length})
                </h3>
                <div className="space-y-2">
                  {tools.map(activity => (
                    <Card key={activity.id}>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{activity.item_name}</p>
                            {activity.tool_result && (
                              <p className="text-sm text-muted-foreground mt-1">
                                Result: {typeof activity.tool_result === 'object' 
                                  ? Object.entries(activity.tool_result).map(([key, value]) => 
                                      `${key}: ${value}`
                                    ).join(', ')
                                  : activity.tool_result}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(activity.created_at), 'h:mm a')}
                            </p>
                          </div>
                          <Badge variant="outline" className="bg-purple-500/10">
                            Calculated
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
