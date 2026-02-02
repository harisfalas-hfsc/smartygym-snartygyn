import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, Dumbbell, Target, Activity, Loader2 } from "lucide-react";
import { useExerciseLibrary, useExerciseDetails, Exercise } from "@/hooks/useExerciseLibrary";
import ExerciseDetailModal from "@/components/ExerciseDetailModal";

interface ExerciseLibraryPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatLabel = (str: string) => {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const ExerciseLibraryPopup = ({ open, onOpenChange }: ExerciseLibraryPopupProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  
  const { exercises, isLoading, searchExercises } = useExerciseLibrary();
  const { data: selectedExercise } = useExerciseDetails(selectedExerciseId);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const searchResults = useMemo(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      return exercises.slice(0, 15);
    }
    return searchExercises(debouncedQuery, 15);
  }, [debouncedQuery, exercises, searchExercises]);

  const handleExerciseClick = (exerciseId: string) => {
    setSelectedExerciseId(exerciseId);
    setDetailModalOpen(true);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSearchQuery("");
      setDebouncedQuery("");
    }
    onOpenChange(newOpen);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[70vh] sm:max-h-[85vh] border-2 border-border">
          <DialogHeader>
            <DialogTitle className="text-center text-primary flex items-center justify-center gap-2">
              <Dumbbell className="h-5 w-5" />
              Exercise Library
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11"
                autoFocus
              />
            </div>

            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading exercises...</span>
              </div>
            )}

            {!isLoading && (
              <p className="text-xs text-muted-foreground">
                {debouncedQuery.length >= 2 
                  ? `${searchResults.length} result${searchResults.length !== 1 ? 's' : ''} for "${debouncedQuery}"`
                  : `Showing ${searchResults.length} exercises • Type to search`
                }
              </p>
            )}

            {!isLoading && (
              <ScrollArea className="h-[35vh] sm:h-[50vh] pr-4">
                <div className="space-y-2">
                  {searchResults.map((exercise) => (
                    <div
                      key={exercise.id}
                      onClick={() => handleExerciseClick(exercise.id)}
                      className="p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 cursor-pointer transition-colors"
                    >
                      <p className="font-medium text-sm mb-2">{exercise.name}</p>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="secondary" className="text-xs py-0">
                          <Activity className="h-3 w-3 mr-1" />
                          {formatLabel(exercise.body_part)}
                        </Badge>
                        <Badge variant="secondary" className="text-xs py-0">
                          <Target className="h-3 w-3 mr-1" />
                          {formatLabel(exercise.target)}
                        </Badge>
                        <Badge variant="outline" className="text-xs py-0">
                          {formatLabel(exercise.equipment)}
                        </Badge>
                      </div>
                    </div>
                  ))}

                  {searchResults.length === 0 && debouncedQuery.length >= 2 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Dumbbell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No exercises found for "{debouncedQuery}"</p>
                      <p className="text-xs mt-1">Try a different search term</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ExerciseDetailModal
        exercise={selectedExercise as Exercise | null}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
      />
    </>
  );
};
