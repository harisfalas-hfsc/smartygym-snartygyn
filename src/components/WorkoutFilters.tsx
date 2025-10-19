import { Button } from "@/components/ui/button";

interface WorkoutFiltersProps {
  goalFilter: string;
  equipmentFilter: string;
  durationFilter: string;
  onGoalChange: (goal: string) => void;
  onEquipmentChange: (equipment: string) => void;
  onDurationChange: (duration: string) => void;
}

export const WorkoutFilters = ({
  goalFilter,
  equipmentFilter,
  durationFilter,
  onGoalChange,
  onEquipmentChange,
  onDurationChange,
}: WorkoutFiltersProps) => {
  const goals = ["All", "Strength", "Fat Loss", "Mobility", "Stability", "Wellness"];
  const equipment = ["All", "Bodyweight", "Dumbbells", "Bands", "Gym"];
  const durations = ["All", "10", "20", "30", "45"];

  return (
    <div className="space-y-4 mb-8">
      {/* Goal Filters */}
      <div>
        <h3 className="text-sm font-semibold mb-2">Goal</h3>
        <div className="flex flex-wrap gap-2">
          {goals.map((goal) => (
            <Button
              key={goal}
              variant={goalFilter === goal.toLowerCase() ? "default" : "outline"}
              size="sm"
              onClick={() => onGoalChange(goal.toLowerCase())}
            >
              {goal}
            </Button>
          ))}
        </div>
      </div>

      {/* Equipment Filters */}
      <div>
        <h3 className="text-sm font-semibold mb-2">Equipment</h3>
        <div className="flex flex-wrap gap-2">
          {equipment.map((equip) => (
            <Button
              key={equip}
              variant={equipmentFilter === equip.toLowerCase() ? "default" : "outline"}
              size="sm"
              onClick={() => onEquipmentChange(equip.toLowerCase())}
            >
              {equip}
            </Button>
          ))}
        </div>
      </div>

      {/* Duration Filters */}
      <div>
        <h3 className="text-sm font-semibold mb-2">Duration (minutes)</h3>
        <div className="flex flex-wrap gap-2">
          {durations.map((duration) => (
            <Button
              key={duration}
              variant={durationFilter === duration.toLowerCase() ? "default" : "outline"}
              size="sm"
              onClick={() => onDurationChange(duration.toLowerCase())}
            >
              {duration === "All" ? "All" : `${duration} min`}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
