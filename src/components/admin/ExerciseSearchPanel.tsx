import { useState, useCallback } from "react";
import { Search, Plus, X, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useExerciseLibrary } from "@/hooks/useExerciseLibrary";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface ExerciseSearchPanelProps {
  onInsertExercise: (exerciseId: string, exerciseName: string) => void;
  className?: string;
}

/**
 * Collapsible search panel for finding and inserting exercises into editors
 * Inserts exercise with special markup: {{exercise:id:name}}
 */
export const ExerciseSearchPanel = ({
  onInsertExercise,
  className = "",
}: ExerciseSearchPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { searchExercises, isLoading } = useExerciseLibrary();
  
  const searchResults = searchQuery.length >= 2 
    ? searchExercises(searchQuery, 15) 
    : [];
  
  const handleInsert = useCallback((id: string, name: string) => {
    onInsertExercise(id, name);
    setSearchQuery("");
  }, [onInsertExercise]);
  
  const formatLabel = (str: string) => {
    return str.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };
  
  return (
    <Collapsible 
      open={isOpen} 
      onOpenChange={setIsOpen}
      className={`border rounded-lg bg-muted/30 ${className}`}
    >
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-full flex items-center justify-between p-2 h-auto"
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            <Search className="h-4 w-4" />
            Search Exercise Library
          </span>
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="px-2 pb-2">
        <div className="space-y-2 pt-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Type exercise name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          {isLoading && (
            <p className="text-xs text-muted-foreground text-center py-2">
              Loading exercises...
            </p>
          )}
          
          {!isLoading && searchQuery.length >= 2 && searchResults.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-2">
              No exercises found matching "{searchQuery}"
            </p>
          )}
          
          {searchResults.length > 0 && (
            <ScrollArea className="h-[200px]">
              <div className="space-y-1">
                {searchResults.map((exercise) => (
                  <div
                    key={exercise.id}
                    className="flex items-center justify-between gap-2 p-2 rounded hover:bg-muted/50 group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {exercise.name}
                      </p>
                      <div className="flex gap-1 flex-wrap">
                        <Badge variant="secondary" className="text-[10px] px-1 py-0">
                          {formatLabel(exercise.body_part)}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] px-1 py-0">
                          {formatLabel(exercise.equipment)}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleInsert(exercise.id, exercise.name)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
          
          <p className="text-[10px] text-muted-foreground">
            Click "Add" to insert exercise with View button link
          </p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default ExerciseSearchPanel;
