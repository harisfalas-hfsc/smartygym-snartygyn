import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckinRecord } from '@/hooks/useCheckins';
import { 
  Lightbulb, 
  Droplets, 
  Footprints, 
  Moon,
  TrendingUp,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

interface CheckInFeedbackProps {
  checkins: CheckinRecord[];
}

interface FeedbackItem {
  type: 'success' | 'warning' | 'tip';
  icon: React.ElementType;
  title: string;
  message: string;
}

export function CheckInFeedback({ checkins }: CheckInFeedbackProps) {
  const feedback = useMemo(() => {
    const items: FeedbackItem[] = [];
    
    // Get last 7 days with complete check-ins
    const last7Days = checkins
      .slice(0, 7)
      .filter(c => c.status === 'complete');

    if (last7Days.length === 0) {
      items.push({
        type: 'tip',
        icon: Lightbulb,
        title: 'Getting Started',
        message: 'Complete your first week of check-ins to receive personalized insights about your habits.'
      });
      return items;
    }

    // Calculate averages
    const avgDailyScore = last7Days.reduce((sum, c) => sum + (c.daily_smarty_score || 0), 0) / last7Days.length;
    const avgHydration = last7Days.reduce((sum, c) => sum + (c.hydration_score || 0), 0) / last7Days.length;
    const avgMovement = last7Days.reduce((sum, c) => sum + (c.movement_score || 0), 0) / last7Days.length;
    const avgSleep = last7Days.reduce((sum, c) => sum + (c.sleep_score || 0), 0) / last7Days.length;
    const avgProtein = last7Days.reduce((sum, c) => sum + (c.protein_score_norm || 0), 0) / last7Days.length;

    // Overall score feedback
    if (avgDailyScore >= 80) {
      items.push({
        type: 'success',
        icon: TrendingUp,
        title: 'Strong Week!',
        message: 'You\'re building solid habits. Keep this momentum going!'
      });
    } else if (avgDailyScore >= 60) {
      items.push({
        type: 'tip',
        icon: Lightbulb,
        title: 'Good Progress',
        message: 'Nice work this week! There\'s still room to improve one or two habits.'
      });
    } else {
      items.push({
        type: 'warning',
        icon: AlertCircle,
        title: 'Challenging Week',
        message: 'This week was tough. Pick one area—sleep, water, or movement—and focus on improving it next week.'
      });
    }

    // Hydration feedback
    if (avgHydration < 6) {
      items.push({
        type: 'warning',
        icon: Droplets,
        title: 'Hydration Needs Work',
        message: 'Your hydration has been low this week. Aim for at least 1.5 to 2.0 liters of water most days.'
      });
    } else if (avgHydration >= 8) {
      items.push({
        type: 'success',
        icon: Droplets,
        title: 'Great Hydration!',
        message: 'Hydration looks excellent this week. Keep doing what you\'re doing!'
      });
    }

    // Movement feedback
    if (avgMovement < 6) {
      items.push({
        type: 'warning',
        icon: Footprints,
        title: 'Move More',
        message: 'You had several low-movement days. Try to avoid zero-step days by adding short walks.'
      });
    } else if (avgMovement >= 8) {
      items.push({
        type: 'success',
        icon: Footprints,
        title: 'Excellent Movement!',
        message: 'Great movement levels this week. You\'re staying active on most days!'
      });
    }

    // Sleep feedback
    if (avgSleep < 6) {
      items.push({
        type: 'warning',
        icon: Moon,
        title: 'Prioritize Sleep',
        message: 'Your sleep is below the ideal range. Focus on consistent bedtimes and aim for 7-8 hours.'
      });
    } else if (avgSleep >= 8) {
      items.push({
        type: 'success',
        icon: Moon,
        title: 'Solid Sleep!',
        message: 'Good job with your sleep. Consistent recovery helps performance.'
      });
    }

    // Protein feedback  
    if (avgProtein < 6) {
      items.push({
        type: 'tip',
        icon: Lightbulb,
        title: 'Protein Tip',
        message: 'You\'re not hitting protein targets consistently. Add protein to each meal to support recovery.'
      });
    }

    return items;
  }, [checkins]);

  const getIconStyle = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400';
      case 'warning':
        return 'bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-400';
      default:
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lightbulb className="h-5 w-5" />
          Weekly Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {feedback.map((item, index) => {
          const Icon = item.icon;
          return (
            <div 
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
            >
              <div className={`p-2 rounded-full shrink-0 ${getIconStyle(item.type)}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium text-sm">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.message}</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}