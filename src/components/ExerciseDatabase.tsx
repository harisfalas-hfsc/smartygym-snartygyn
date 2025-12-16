import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, X, Dumbbell, Target, Activity } from "lucide-react";
import ExerciseDetailModal from "./ExerciseDetailModal";
import { useToast } from "@/hooks/use-toast";

interface Exercise {
  id: string;
  name: string;
  bodyPart: string;
  target: string;
  equipment: string;
  gifUrl: string;
  secondaryMuscles?: string[];
  instructions?: string[];
}

const BODY_PARTS = [
  "back", "cardio", "chest", "lower arms", "lower legs", 
  "neck", "shoulders", "upper arms", "upper legs", "waist"
];

const EQUIPMENT_LIST = [
  "assisted", "band", "barbell", "body weight", "bosu ball", "cable", 
  "dumbbell", "elliptical machine", "ez barbell", "hammer", "kettlebell", 
  "leverage machine", "medicine ball", "olympic barbell", "resistance band",
  "roller", "rope", "skierg machine", "sled machine", "smith machine",
  "stability ball", "stationary bike", "stepmill machine", "tire",
  "trap bar", "upper body ergometer", "weighted", "wheel roller"
];

const ExerciseDatabase = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [bodyPartFilter, setBodyPartFilter] = useState<string>("");
  const [equipmentFilter, setEquipmentFilter] = useState<string>("");
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  const fetchExercises = async (endpoint: string, params: Record<string, string> = {}) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-gym-fit-exercises', {
        body: { endpoint, params: { ...params, limit: 50 } }
      });

      if (error) throw error;
      
      if (data.error) {
        throw new Error(data.error);
      }

      setExercises(Array.isArray(data) ? data : []);
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

  const handleSearch = () => {
    if (searchQuery.trim()) {
      fetchExercises('search', { name: searchQuery.trim() });
    } else if (bodyPartFilter) {
      fetchExercises('bodyPart', { bodyPart: bodyPartFilter });
    } else if (equipmentFilter) {
      fetchExercises('equipment', { equipment: equipmentFilter });
    } else {
      fetchExercises('exercises');
    }
  };

  const handleBodyPartChange = (value: string) => {
    setBodyPartFilter(value);
    setSearchQuery("");
    if (value) {
      fetchExercises('bodyPart', { bodyPart: value });
    }
  };

  const handleEquipmentChange = (value: string) => {
    setEquipmentFilter(value);
    setSearchQuery("");
    if (value) {
      fetchExercises('equipment', { equipment: value });
    }
  };

  const clearFilters = () => {
    setBodyPartFilter("");
    setEquipmentFilter("");
    setSearchQuery("");
    setExercises([]);
    setHasSearched(false);
  };

  const handleExerciseClick = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setModalOpen(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Body Part Filter */}
        <Select value={bodyPartFilter} onValueChange={handleBodyPartChange}>
          <SelectTrigger className="w-full sm:w-[180px] border-green-500/50">
            <Activity className="h-4 w-4 mr-2 text-green-500" />
            <SelectValue placeholder="Body Part" />
          </SelectTrigger>
          <SelectContent side="bottom">
            {BODY_PARTS.map((part) => (
              <SelectItem key={part} value={part} className="capitalize">
                {part}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Equipment Filter */}
        <Select value={equipmentFilter} onValueChange={handleEquipmentChange}>
          <SelectTrigger className="w-full sm:w-[180px] border-purple-500/50">
            <Dumbbell className="h-4 w-4 mr-2 text-purple-500" />
            <SelectValue placeholder="Equipment" />
          </SelectTrigger>
          <SelectContent side="bottom" className="max-h-[300px]">
            {EQUIPMENT_LIST.map((equip) => (
              <SelectItem key={equip} value={equip} className="capitalize">
                {equip}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Search */}
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search exercises by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-9 border-primary/50"
            />
          </div>
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
          </Button>
        </div>

        {/* Clear Filters */}
        {(bodyPartFilter || equipmentFilter || searchQuery) && (
          <Button variant="ghost" size="icon" onClick={clearFilters}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {(bodyPartFilter || equipmentFilter) && (
        <div className="flex flex-wrap gap-2">
          {bodyPartFilter && (
            <Badge variant="outline" className="border-green-500 text-green-600 dark:text-green-400 capitalize">
              <Activity className="h-3 w-3 mr-1" />
              {bodyPartFilter}
            </Badge>
          )}
          {equipmentFilter && (
            <Badge variant="outline" className="border-purple-500 text-purple-600 dark:text-purple-400 capitalize">
              <Dumbbell className="h-3 w-3 mr-1" />
              {equipmentFilter}
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {exercises.map((exercise) => (
            <div
              key={exercise.id}
              onClick={() => handleExerciseClick(exercise)}
              className="group cursor-pointer bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all duration-200"
            >
              {/* Exercise Image */}
              <div className="aspect-square bg-muted overflow-hidden">
                <img
                  src={exercise.gifUrl}
                  alt={exercise.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              </div>
              
              {/* Exercise Info */}
              <div className="p-3 space-y-2">
                <h3 className="font-medium text-sm capitalize line-clamp-2 group-hover:text-primary transition-colors">
                  {exercise.name}
                </h3>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary" className="text-[10px] capitalize">
                    {exercise.bodyPart}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] capitalize border-orange-500/50 text-orange-600 dark:text-orange-400">
                    <Target className="h-2 w-2 mr-0.5" />
                    {exercise.target}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : hasSearched ? (
        <div className="text-center py-12 text-muted-foreground">
          <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No exercises found. Try a different search or filter.</p>
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Select a body part, equipment, or search to browse exercises</p>
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
