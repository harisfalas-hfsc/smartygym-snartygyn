import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useActivitiesByDate } from "@/hooks/useActivityLog";
import { DailyActivityModal } from "./DailyActivityModal";

interface LogBookCalendarProps {
  userId: string;
  filter: string;
  onDayClick?: (date: Date) => void;
}

export const LogBookCalendar = ({ userId, filter }: LogBookCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { activitiesByDate, isLoading } = useActivitiesByDate(userId, filter);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const monthName = monthNames[currentDate.getMonth()];
  const year = currentDate.getFullYear();

  const getActivityBadges = (day: number) => {
    const dateStr = `${year}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const activities = activitiesByDate[dateStr] || [];
    
    const badges = new Set<string>();
    activities.forEach(activity => {
      if (activity.content_type === 'workout') {
        badges.add(activity.action_type === 'completed' ? 'workout-completed' : 'workout-viewed');
      } else if (activity.content_type === 'program') {
        if (activity.action_type === 'program_started') {
          badges.add('program-ongoing');
        } else if (activity.action_type === 'program_day_completed') {
          badges.add('program-completed');
        } else {
          badges.add('program-viewed');
        }
      } else if (activity.content_type === 'personal_training') {
        if (activity.action_type === 'pt_started') {
          badges.add('pt-ongoing');
        } else if (activity.action_type === 'pt_day_completed') {
          badges.add('pt-completed');
        } else {
          badges.add('pt-viewed');
        }
      } else if (activity.content_type === 'tool') {
        badges.add('tool');
      }
    });

    return Array.from(badges);
  };

  const getBadgeColor = (badge: string) => {
    const colors: Record<string, string> = {
      'workout-viewed': 'bg-gray-400',
      'workout-completed': 'bg-green-500',
      'program-viewed': 'bg-gray-400',
      'program-ongoing': 'bg-orange-500',
      'program-completed': 'bg-blue-500',
      'pt-viewed': 'bg-gray-400',
      'pt-ongoing': 'bg-orange-400',
      'pt-completed': 'bg-purple-500',
      'tool': 'bg-pink-500',
    };
    return colors[badge] || 'bg-gray-400';
  };

  const handleDayClick = (day: number) => {
    const date = new Date(year, currentDate.getMonth(), day);
    setSelectedDate(date);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-48" />
            <div className="grid grid-cols-7 gap-2">
              {[...Array(35)].map((_, i) => (
                <div key={i} className="h-20 bg-muted rounded" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {monthName} {year}
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={previousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Day Names */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty cells for days before month starts */}
            {[...Array(firstDay)].map((_, i) => (
              <div key={`empty-${i}`} className="p-2" />
            ))}

            {/* Days of the month */}
            {[...Array(daysInMonth)].map((_, i) => {
              const day = i + 1;
              const badges = getActivityBadges(day);
              const hasActivity = badges.length > 0;
              const dateStr = `${year}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isToday = new Date().toISOString().split('T')[0] === dateStr;

              return (
                <button
                  key={day}
                  onClick={() => handleDayClick(day)}
                  className={`
                    relative p-2 rounded-lg text-center transition-all
                    ${hasActivity ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-muted'}
                    ${isToday ? 'ring-2 ring-primary' : ''}
                  `}
                >
                  <div className="text-sm font-medium mb-1">{day}</div>
                  {badges.length > 0 && (
                    <div className="flex gap-1 justify-center flex-wrap">
                      {badges.map((badge, idx) => (
                        <div
                          key={idx}
                          className={`w-2 h-2 rounded-full ${getBadgeColor(badge)}`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-sm font-medium mb-3">Activity Legend</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-400" />
                <span>Viewed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span>Workout Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span>Program Ongoing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span>Program Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span>PT Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-pink-500" />
                <span>Tool Used</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Activity Modal */}
      {selectedDate && (
        <DailyActivityModal
          date={selectedDate}
          isOpen={selectedDate !== null}
          onClose={() => setSelectedDate(null)}
          userId={userId}
        />
      )}
    </>
  );
};
