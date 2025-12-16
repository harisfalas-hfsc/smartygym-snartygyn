import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, X, Dumbbell, Activity } from "lucide-react";
import ExerciseDetailModal from "./ExerciseDetailModal";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Exact valid API values
const BODY_PARTS = ['Legs', 'Back', 'Chest', 'Shoulders', 'Arms', 'Core'];
const EQUIPMENT = [
  'Barbell', 'Dumbbell', 'Machine', 'Bodyweight', 'Kettlebell', 
  'ResistanceBand', 'BattleRope', 'MedicineBall', 'BosuBall', 
  'PowerSled', 'SmithMachine', 'StabilityBall', 'TrapBar', 
  'Stepper', 'WheelRoller', 'Towel', 'Landmine', 'Cable'
];
const TYPES = ['Compound', 'Isolation'];

// Interface matching exact Gym Fit API search response
interface ExerciseSearchResult {
  id: string;
  name: string;
  bodyPart: string;
}

// Interface for full exercise detail from API
interface ExerciseDetail {
  name: string;
  bodyPart: string;
  muscles: {
    role: string;
    name: string;
    group: string;
  }[];
  instructions: {
    order: number;
    description: string;
  }[];
  alternatives: {
    id: string;
    name: string;
  }[];
  variations: {
    id: string;
    name: string;
  }[];
}

const ExerciseDatabase = () => {
  const [exercises, setExercises] = useState<ExerciseSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [bodyPartFilter, setBodyPartFilter] = useState("");
  const [equipmentFilter, setEquipmentFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [selectedExercise, setSelectedExercise] = useState<ExerciseDetail | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { limit: 50, offset: 0 };
      
      if (bodyPartFilter && bodyPartFilter !== "all") params.bodyPart = bodyPartFilter;
      if (equipmentFilter && equipmentFilter !== "all") params.equipment = equipmentFilter;
      if (typeFilter && typeFilter !== "all") params.type = typeFilter;

      const { data, error } = await supabase.functions.invoke('fetch-gym-fit-exercises', {
        body: { endpoint: 'searchExercises', params }
      });

      if (error) throw error;
      
      if (data.error) {
        throw new Error(data.error);
      }

      setExercises(Array.isArray(data?.results) ? data.results : []);
      setHasSearched(true);
    } catch (error: any) {
      console.error('Error fetching exercises:', error);
      toast({
        title: "Error loading exercises",
        description: error.message || "Failed to fetch exercises from API",
        variant: "destructive",
      });
      setExercises([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchExerciseDetail = async (exerciseId: string) => {
    setDetailLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-gym-fit-exercises', {
        body: { endpoint: 'getExercise', params: { id: exerciseId } }
      });

      if (error) throw error;
      
      if (data.error) {
        throw new Error(data.error);
      }

      setSelectedExercise(data);
      setModalOpen(true);
    } catch (error: any) {
      console.error('Error fetching exercise detail:', error);
      toast({
        title: "Error loading exercise details",
        description: error.message || "Failed to fetch exercise details",
        variant: "destructive",
      });
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSearch = () => {
    fetchExercises();
  };

  const clearFilters = () => {
    setBodyPartFilter("");
    setEquipmentFilter("");
    setTypeFilter("");
    setExercises([]);
    setHasSearched(false);
  };

  const handleExerciseClick = (exercise: ExerciseSearchResult) => {
    fetchExerciseDetail(exercise.id);
  };

  const hasFilters = (bodyPartFilter && bodyPartFilter !== "all") || 
                     (equipmentFilter && equipmentFilter !== "all") || 
                     (typeFilter && typeFilter !== "all");

  return (
    <div className="space-y-6">
      {/* Filters - Dropdown selects with exact API values */}
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Body Part Filter */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground flex items-center gap-1">
              <Activity className="h-3 w-3 text-green-500" />
              Body Part
            </label>
            <Select value={bodyPartFilter} onValueChange={setBodyPartFilter}>
              <SelectTrigger className="border-green-500/50">
                <SelectValue placeholder="All Body Parts" />
              </SelectTrigger>
              <SelectContent side="bottom">
                <SelectItem value="all">All Body Parts</SelectItem>
                {BODY_PARTS.map((part) => (
                  <SelectItem key={part} value={part}>{part}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Equipment Filter */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground flex items-center gap-1">
              <Dumbbell className="h-3 w-3 text-purple-500" />
              Equipment
            </label>
            <Select value={equipmentFilter} onValueChange={setEquipmentFilter}>
              <SelectTrigger className="border-purple-500/50">
                <SelectValue placeholder="All Equipment" />
              </SelectTrigger>
              <SelectContent side="bottom">
                <SelectItem value="all">All Equipment</SelectItem>
                {EQUIPMENT.map((eq) => (
                  <SelectItem key={eq} value={eq}>{eq}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Type Filter */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground flex items-center gap-1">
              <Search className="h-3 w-3 text-orange-500" />
              Type
            </label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="border-orange-500/50">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent side="bottom">
                <SelectItem value="all">All Types</SelectItem>
                {TYPES.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Search Actions */}
        <div className="flex gap-2">
          <Button onClick={handleSearch} disabled={loading} className="flex-1 sm:flex-none">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
            Search Exercises
          </Button>
          
          {hasFilters && (
            <Button variant="ghost" size="icon" onClick={clearFilters}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2">
          {bodyPartFilter && bodyPartFilter !== "all" && (
            <Badge variant="outline" className="border-green-500 text-green-600 dark:text-green-400">
              <Activity className="h-3 w-3 mr-1" />
              {bodyPartFilter}
            </Badge>
          )}
          {equipmentFilter && equipmentFilter !== "all" && (
            <Badge variant="outline" className="border-purple-500 text-purple-600 dark:text-purple-400">
              <Dumbbell className="h-3 w-3 mr-1" />
              {equipmentFilter}
            </Badge>
          )}
          {typeFilter && typeFilter !== "all" && (
            <Badge variant="outline" className="border-orange-500 text-orange-600 dark:text-orange-400">
              <Search className="h-3 w-3 mr-1" />
              {typeFilter}
            </Badge>
          )}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading exercises...</span>
        </div>
      ) : exercises.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[300px] overflow-y-auto pr-2">
          {exercises.map((exercise) => (
            <div
              key={exercise.id}
              onClick={() => handleExerciseClick(exercise)}
              className="group cursor-pointer bg-card border border-border rounded-lg p-4 hover:border-primary/50 hover:shadow-lg transition-all duration-200"
            >
              {detailLoading && (
                <div className="absolute inset-0 bg-background/50 flex items-center justify-center rounded-lg">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              )}
              
              {/* Exercise Info */}
              <div className="space-y-2">
                <h3 className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-2">
                  {exercise.name}
                </h3>
                <Badge variant="secondary" className="text-xs">
                  <Activity className="h-3 w-3 mr-1" />
                  {exercise.bodyPart}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      ) : hasSearched ? (
        <div className="text-center py-12 text-muted-foreground">
          <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No exercises found with those filters.</p>
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Select filters and click Search to browse exercises</p>
        </div>
      )}

      {/* Detail Modal */}
      <ExerciseDetailModal
        exercise={selectedExercise}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
};

export default ExerciseDatabase;
