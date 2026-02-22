import { useState } from "react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import ExerciseDetailModal from "@/components/ExerciseDetailModal";
import { useExerciseDetails } from "@/hooks/useExerciseLibrary";

interface ExerciseLinkButtonProps {
  exerciseName: string;
  exerciseId?: string | null;
  showViewButton?: boolean;
  className?: string;
}

/**
 * Component that displays an exercise name with an optional "View" button
 * If exerciseId is provided, shows a View button that opens the exercise detail modal
 */
export const ExerciseLinkButton = ({
  exerciseName,
  exerciseId,
  showViewButton = true,
  className = "",
}: ExerciseLinkButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: exerciseDetails } = useExerciseDetails(isModalOpen ? exerciseId : null);
  
  const hasViewButton = showViewButton && exerciseId;
  
  if (!hasViewButton) {
    return <span className={className}>{exerciseName}</span>;
  }
  
  return (
    <>
      <span className={className}>
        {exerciseName}
        <Button
          variant="ghost"
          size="sm"
          className="h-5 w-5 p-0 hover:bg-primary/10 inline-flex items-center justify-center align-middle ml-1 flex-shrink-0"
          style={{ display: 'inline-flex', verticalAlign: 'middle' }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsModalOpen(true);
          }}
          title={`View ${exerciseName} details`}
        >
          <Eye className="h-3.5 w-3.5 text-primary" />
        </Button>
      </span>
      
      {exerciseDetails && (
        <ExerciseDetailModal
          exercise={exerciseDetails}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
        />
      )}
    </>
  );
};

export default ExerciseLinkButton;
