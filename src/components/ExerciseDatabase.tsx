import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Search, X, Dumbbell, Activity, Target, Gauge, FolderOpen } from "lucide-react";
import ExerciseDetailModal from "./ExerciseDetailModal";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Interface matching ExerciseDB schema in database
interface Exercise {
  id: string;
  name: string;
  body_part: string;
  equipment: string;
  target: string;
  secondary_muscles: string[];
  instructions: string[];
  gif_url: string | null;
  description: string | null;
  difficulty: string | null;
  category: string | null;
}

const ExerciseDatabase = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [nameSearch, setNameSearch] = useState("");
  const [bodyPartFilter, setBodyPartFilter] = useState("");
  const [equipmentFilter, setEquipmentFilter] = useState("");
  const [targetFilter, setTargetFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Dynamic filter options from database
  const [bodyParts, setBodyParts] = useState<string[]>([]);
  const [equipmentOptions, setEquipmentOptions] = useState<string[]>([]);
  const [targetOptions, setTargetOptions] = useState<string[]>([]);
  const [difficultyOptions, setDifficultyOptions] = useState<string[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  
  const { toast } = useToast();

  // Load filter options from database on mount
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        // Fetch all distinct values in parallel
        const [bodyPartRes, equipmentRes, targetRes, difficultyRes, categoryRes] = await Promise.all([
          supabase.from('exercises').select('body_part').order('body_part'),
          supabase.from('exercises').select('equipment').order('equipment'),
          supabase.from('exercises').select('target').order('target'),
          supabase.from('exercises').select('difficulty').order('difficulty'),
          supabase.from('exercises').select('category').order('category'),
        ]);

        if (bodyPartRes.data) {
          const unique = [...new Set(bodyPartRes.data.map(d => d.body_part).filter(Boolean))];
          setBodyParts(unique);
        }
        if (equipmentRes.data) {
          const unique = [...new Set(equipmentRes.data.map(d => d.equipment).filter(Boolean))];
          setEquipmentOptions(unique);
        }
        if (targetRes.data) {
          const unique = [...new Set(targetRes.data.map(d => d.target).filter(Boolean))];
          setTargetOptions(unique);
        }
        if (difficultyRes.data) {
          const unique = [...new Set(difficultyRes.data.map(d => d.difficulty).filter(Boolean))];
          setDifficultyOptions(unique);
        }
        if (categoryRes.data) {
          const unique = [...new Set(categoryRes.data.map(d => d.category).filter(Boolean))];
          setCategoryOptions(unique);
        }
      } catch (error) {
        console.error('Error loading filter options:', error);
      }
    };

    loadFilterOptions();
  }, []);

  const fetchExercises = async () => {
    setLoading(true);
    try {
      let query = supabase.from('exercises').select('*');

      // Apply filters
      if (bodyPartFilter && bodyPartFilter !== "all") {
        query = query.eq('body_part', bodyPartFilter);
      }
      if (equipmentFilter && equipmentFilter !== "all") {
        query = query.eq('equipment', equipmentFilter);
      }
      if (targetFilter && targetFilter !== "all") {
        query = query.eq('target', targetFilter);
      }
      if (difficultyFilter && difficultyFilter !== "all") {
        query = query.eq('difficulty', difficultyFilter);
      }
      if (categoryFilter && categoryFilter !== "all") {
        query = query.eq('category', categoryFilter);
      }
      if (nameSearch.trim()) {
        query = query.ilike('name', `%${nameSearch.trim()}%`);
      }

      query = query.order('name').limit(50);

      const { data, error } = await query;

      if (error) throw error;

      setExercises(data || []);
      setHasSearched(true);
    } catch (error: any) {
      console.error('Error fetching exercises:', error);
      toast({
        title: "Error loading exercises",
        description: error.message || "Failed to fetch exercises from database",
        variant: "destructive",
      });
      setExercises([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchExercises();
  };

  const clearFilters = () => {
    setNameSearch("");
    setBodyPartFilter("");
    setEquipmentFilter("");
    setTargetFilter("");
    setDifficultyFilter("");
    setCategoryFilter("");
    setExercises([]);
    setHasSearched(false);
  };

  const handleExerciseClick = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setModalOpen(true);
  };

  const hasFilters = nameSearch.trim() ||
                     (bodyPartFilter && bodyPartFilter !== "all") || 
                     (equipmentFilter && equipmentFilter !== "all") || 
                     (targetFilter && targetFilter !== "all") ||
                     (difficultyFilter && difficultyFilter !== "all") ||
                     (categoryFilter && categoryFilter !== "all");

  // Capitalize first letter of each word
  const formatLabel = (str: string) => {
    return str.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground flex items-center gap-1">
          <Search className="h-3 w-3 text-primary" />
          Search by Name
        </label>
        <Input
          type="text"
          placeholder="Search exercise by name (e.g., Sit-up, Air Bike)"
          value={nameSearch}
          onChange={(e) => setNameSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="border-primary/50"
        />
      </div>

      {/* Filters - 5 column grid */}
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
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
                {bodyParts.map((part) => (
                  <SelectItem key={part} value={part}>{formatLabel(part)}</SelectItem>
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
                {equipmentOptions.map((eq) => (
                  <SelectItem key={eq} value={eq}>{formatLabel(eq)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Target Muscle Filter */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground flex items-center gap-1">
              <Target className="h-3 w-3 text-orange-500" />
              Target Muscle
            </label>
            <Select value={targetFilter} onValueChange={setTargetFilter}>
              <SelectTrigger className="border-orange-500/50">
                <SelectValue placeholder="All Targets" />
              </SelectTrigger>
              <SelectContent side="bottom">
                <SelectItem value="all">All Targets</SelectItem>
                {targetOptions.map((target) => (
                  <SelectItem key={target} value={target}>{formatLabel(target)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Difficulty Filter */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground flex items-center gap-1">
              <Gauge className="h-3 w-3 text-red-500" />
              Difficulty
            </label>
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="border-red-500/50">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent side="bottom">
                <SelectItem value="all">All Levels</SelectItem>
                {difficultyOptions.map((diff) => (
                  <SelectItem key={diff} value={diff}>{formatLabel(diff)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category Filter */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground flex items-center gap-1">
              <FolderOpen className="h-3 w-3 text-blue-500" />
              Category
            </label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="border-blue-500/50">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent side="bottom">
                <SelectItem value="all">All Categories</SelectItem>
                {categoryOptions.map((cat) => (
                  <SelectItem key={cat} value={cat}>{formatLabel(cat)}</SelectItem>
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
          {nameSearch.trim() && (
            <Badge variant="outline" className="border-primary text-primary">
              <Search className="h-3 w-3 mr-1" />
              "{nameSearch}"
            </Badge>
          )}
          {bodyPartFilter && bodyPartFilter !== "all" && (
            <Badge variant="outline" className="border-green-500 text-green-600 dark:text-green-400">
              <Activity className="h-3 w-3 mr-1" />
              {formatLabel(bodyPartFilter)}
            </Badge>
          )}
          {equipmentFilter && equipmentFilter !== "all" && (
            <Badge variant="outline" className="border-purple-500 text-purple-600 dark:text-purple-400">
              <Dumbbell className="h-3 w-3 mr-1" />
              {formatLabel(equipmentFilter)}
            </Badge>
          )}
          {targetFilter && targetFilter !== "all" && (
            <Badge variant="outline" className="border-orange-500 text-orange-600 dark:text-orange-400">
              <Target className="h-3 w-3 mr-1" />
              {formatLabel(targetFilter)}
            </Badge>
          )}
          {difficultyFilter && difficultyFilter !== "all" && (
            <Badge variant="outline" className="border-red-500 text-red-600 dark:text-red-400">
              <Gauge className="h-3 w-3 mr-1" />
              {formatLabel(difficultyFilter)}
            </Badge>
          )}
          {categoryFilter && categoryFilter !== "all" && (
            <Badge variant="outline" className="border-blue-500 text-blue-600 dark:text-blue-400">
              <FolderOpen className="h-3 w-3 mr-1" />
              {formatLabel(categoryFilter)}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto pr-2">
          {exercises.map((exercise) => (
            <div
              key={exercise.id}
              onClick={() => handleExerciseClick(exercise)}
              className="group cursor-pointer bg-card border border-border rounded-lg p-4 hover:border-primary/50 hover:shadow-lg transition-all duration-200"
            >
              {/* GIF Preview if available */}
              {exercise.gif_url && (
                <div className="w-full aspect-square rounded-md overflow-hidden bg-muted mb-3">
                  <img 
                    src={exercise.gif_url} 
                    alt={exercise.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    loading="lazy"
                  />
                </div>
              )}
              
              {/* Exercise Info */}
              <div className="space-y-2">
                <h3 className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-2">
                  {exercise.name}
                </h3>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary" className="text-xs">
                    <Activity className="h-3 w-3 mr-1" />
                    {formatLabel(exercise.body_part)}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Target className="h-3 w-3 mr-1" />
                    {formatLabel(exercise.target)}
                  </Badge>
                  {exercise.difficulty && (
                    <Badge variant="outline" className="text-xs border-red-500/50 text-red-600 dark:text-red-400">
                      {formatLabel(exercise.difficulty)}
                    </Badge>
                  )}
                  {exercise.category && (
                    <Badge variant="outline" className="text-xs border-blue-500/50 text-blue-600 dark:text-blue-400">
                      {formatLabel(exercise.category)}
                    </Badge>
                  )}
                </div>
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
