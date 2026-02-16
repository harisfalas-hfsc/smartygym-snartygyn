import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Search, X, Dumbbell, Activity, Target, Gauge, FolderOpen } from "lucide-react";
import ExerciseDetailModal from "./ExerciseDetailModal";
import ExerciseFrameAnimation from "./ExerciseFrameAnimation";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  frame_start_url: string | null;
  frame_end_url: string | null;
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
  const [resultCount, setResultCount] = useState(0);
  
  // Dynamic filter options from database
  const [bodyParts, setBodyParts] = useState<string[]>([]);
  const [equipmentOptions, setEquipmentOptions] = useState<string[]>([]);
  const [targetOptions, setTargetOptions] = useState<string[]>([]);
  const [difficultyOptions, setDifficultyOptions] = useState<string[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  
  const { toast } = useToast();
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Helper function to fetch all rows with pagination (overcomes 1000 row limit)
  const fetchAllRows = async (column: string) => {
    const allData: any[] = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from('exercises')
        .select(column)
        .order(column)
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) throw error;
      
      if (data && data.length > 0) {
        allData.push(...data);
        hasMore = data.length === pageSize;
        page++;
      } else {
        hasMore = false;
      }
    }

    return allData;
  };

  // Load filter options from database on mount
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        // Fetch all distinct values in parallel with pagination
        const [bodyPartData, equipmentData, targetData, difficultyData, categoryData] = await Promise.all([
          fetchAllRows('body_part'),
          fetchAllRows('equipment'),
          fetchAllRows('target'),
          fetchAllRows('difficulty'),
          fetchAllRows('category'),
        ]);

        setBodyParts([...new Set(bodyPartData.map(d => d.body_part).filter(Boolean))].sort());
        setEquipmentOptions([...new Set(equipmentData.map(d => d.equipment).filter(Boolean))].sort());
        setTargetOptions([...new Set(targetData.map(d => d.target).filter(Boolean))].sort());
        setDifficultyOptions([...new Set(difficultyData.map(d => d.difficulty).filter(Boolean))].sort());
        setCategoryOptions([...new Set(categoryData.map(d => d.category).filter(Boolean))].sort());
      } catch (error) {
        console.error('Error loading filter options:', error);
      }
    };

    loadFilterOptions();
  }, []);

  // Enhanced search term normalization - handles plurals, hyphens, and common variations
  const normalizeSearchTerm = (term: string): string[] => {
    const normalized = term.toLowerCase().trim();
    if (!normalized) return [];
    
    const variations = new Set<string>([normalized]);
    
    // Handle "body weight" vs "bodyweight"
    if (normalized.includes('body weight')) {
      variations.add(normalized.replace('body weight', 'bodyweight'));
    }
    if (normalized.includes('bodyweight')) {
      variations.add(normalized.replace('bodyweight', 'body weight'));
    }
    
    // Handle "dumbbell" vs "dumbell" (common typo)
    if (normalized.includes('dumbell')) {
      variations.add(normalized.replace('dumbell', 'dumbbell'));
    }
    if (normalized.includes('dumbbell')) {
      variations.add(normalized.replace('dumbbell', 'dumbell'));
    }
    
    // Handle hyphens vs spaces (e.g., "push-up" vs "push up")
    if (normalized.includes('-')) {
      variations.add(normalized.replace(/-/g, ' '));
      variations.add(normalized.replace(/-/g, ''));
    }
    if (normalized.includes(' ')) {
      variations.add(normalized.replace(/ /g, '-'));
      variations.add(normalized.replace(/ /g, ''));
    }
    
    // Handle plural forms - remove trailing 's' or 'es'
    if (normalized.endsWith('s')) {
      const withoutS = normalized.slice(0, -1);
      variations.add(withoutS);
      // Also apply hyphen/space logic to singular form
      if (withoutS.includes('-')) {
        variations.add(withoutS.replace(/-/g, ' '));
      }
    }
    if (normalized.endsWith('es')) {
      variations.add(normalized.slice(0, -2));
    }
    
    // Add common exercise name variations
    const exerciseAliases: Record<string, string[]> = {
      'pushup': ['push-up', 'push up'],
      'push-up': ['pushup', 'push up'],
      'push up': ['push-up', 'pushup'],
      'pullup': ['pull-up', 'pull up'],
      'pull-up': ['pullup', 'pull up'],
      'pull up': ['pull-up', 'pullup'],
      'situp': ['sit-up', 'sit up'],
      'sit-up': ['situp', 'sit up'],
      'sit up': ['sit-up', 'situp'],
      'chinup': ['chin-up', 'chin up'],
      'chin-up': ['chinup', 'chin up'],
      'chin up': ['chin-up', 'chinup'],
    };
    
    for (const [key, aliases] of Object.entries(exerciseAliases)) {
      if (normalized.includes(key)) {
        aliases.forEach(alias => {
          variations.add(normalized.replace(key, alias));
        });
      }
    }
    
    return [...variations];
  };

  const fetchExercises = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from('exercises').select('*');

      // Apply dropdown filters
      if (bodyPartFilter && bodyPartFilter !== "all") {
        query = query.eq('body_part', bodyPartFilter);
      }
      if (equipmentFilter && equipmentFilter !== "all") {
        query = query.eq('equipment', equipmentFilter);
      }
      if (targetFilter && targetFilter !== "all") {
        query = query.eq('target', targetFilter);
      }
      
      // Handle NULL values for difficulty filter
      if (difficultyFilter && difficultyFilter !== "all") {
        query = query.eq('difficulty', difficultyFilter);
      }
      
      // Handle NULL values for category filter
      if (categoryFilter && categoryFilter !== "all") {
        query = query.eq('category', categoryFilter);
      }
      
      // Smart search: search across multiple fields with enhanced normalization
      if (nameSearch.trim()) {
        const searchVariations = normalizeSearchTerm(nameSearch);
        
        if (searchVariations.length > 0) {
          // Build OR conditions for each search variation across multiple columns
          const orConditions = searchVariations.flatMap(term => [
            `name.ilike.%${term}%`,
            `target.ilike.%${term}%`,
            `body_part.ilike.%${term}%`,
            `equipment.ilike.%${term}%`,
            `category.ilike.%${term}%`
          ]).join(',');
          
          query = query.or(orConditions);
        }
      }

      query = query.order('name').limit(100);

      const { data, error } = await query;

      if (error) throw error;

      setExercises(data || []);
      setResultCount(data?.length || 0);
      setHasSearched(true);
    } catch (error: any) {
      console.error('Error fetching exercises:', error);
      toast({
        title: "Error loading exercises",
        description: error.message || "Failed to fetch exercises from database",
        variant: "destructive",
      });
      setExercises([]);
      setResultCount(0);
    } finally {
      setLoading(false);
    }
  }, [nameSearch, bodyPartFilter, equipmentFilter, targetFilter, difficultyFilter, categoryFilter, toast]);

  // Debounced live search - triggers 500ms after user stops typing
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    // Only auto-search if there's a search term or any filter is set
    const hasAnyFilter = nameSearch.trim() || 
      (bodyPartFilter && bodyPartFilter !== "all") ||
      (equipmentFilter && equipmentFilter !== "all") ||
      (targetFilter && targetFilter !== "all") ||
      (difficultyFilter && difficultyFilter !== "all") ||
      (categoryFilter && categoryFilter !== "all");
    
    if (hasAnyFilter) {
      debounceTimer.current = setTimeout(() => {
        fetchExercises();
      }, 500);
    }
    
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [nameSearch, bodyPartFilter, equipmentFilter, targetFilter, difficultyFilter, categoryFilter, fetchExercises]);

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
    setResultCount(0);
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
      {/* Smart Search Bar */}
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground flex items-center gap-1">
          <Search className="h-3 w-3 text-primary" />
          Smart Search (name, muscle, body part, equipment, category)
        </label>
        <div className="relative">
          <Input
            type="text"
            placeholder='Try "push-ups", "quads", "body weight", "chest", "dumbbell"...'
            value={nameSearch}
            onChange={(e) => setNameSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="border-primary/50 pr-10"
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
        {hasSearched && !loading && (
          <p className="text-xs text-muted-foreground">
            Found {resultCount} exercise{resultCount !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Mobile: Clear button only when there's a search term */}
      {nameSearch.trim() && (
        <div className="md:hidden flex justify-end">
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" /> Clear
          </Button>
        </div>
      )}

      {/* Filters - Hidden on mobile, visible on md+ */}
      <div className="hidden md:flex flex-col gap-4">
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
              <SelectContent 
                position="popper" 
                side="bottom" 
                align="start"
                sideOffset={4}
                className="max-h-60 overflow-y-auto z-[100] bg-popover"
              >
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
              <SelectContent 
                position="popper" 
                side="bottom" 
                align="start"
                sideOffset={4}
                className="max-h-60 overflow-y-auto z-[100] bg-popover"
              >
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
              <SelectContent 
                position="popper" 
                side="bottom" 
                align="start"
                sideOffset={4}
                className="max-h-60 overflow-y-auto z-[100] bg-popover"
              >
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
              <SelectContent 
                position="popper" 
                side="bottom" 
                align="start"
                sideOffset={4}
                className="max-h-60 overflow-y-auto z-[100] bg-popover"
              >
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
              <SelectContent 
                position="popper" 
                side="bottom" 
                align="start"
                sideOffset={4}
                className="max-h-60 overflow-y-auto z-[100] bg-popover"
              >
                <SelectItem value="all">All Categories</SelectItem>
                {categoryOptions.map((cat) => (
                  <SelectItem key={cat} value={cat}>{formatLabel(cat)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Search Actions - Desktop only */}
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
      {loading && !exercises.length ? (
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
              {/* GIF or Frame Animation Preview */}
              {exercise.gif_url ? (
                <div className="w-full aspect-square rounded-md overflow-hidden bg-muted mb-3">
                  <img 
                    src={exercise.gif_url} 
                    alt={exercise.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    loading="lazy"
                  />
                </div>
              ) : exercise.frame_start_url && exercise.frame_end_url ? (
                <div className="mb-3">
                  <ExerciseFrameAnimation
                    frameStartUrl={exercise.frame_start_url}
                    frameEndUrl={exercise.frame_end_url}
                    altText={exercise.name}
                  />
                </div>
              ) : null}
              
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
        <div className="text-center py-12 text-muted-foreground space-y-3">
          <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="font-medium">No exercises found with those filters.</p>
          <div className="text-sm space-y-1">
            <p>💡 Tips:</p>
            <ul className="list-disc list-inside text-left max-w-md mx-auto">
              <li>Try using the dropdown filters (Target Muscle, Equipment, etc.)</li>
              <li>Search works across: name, target muscle, body part, equipment, category</li>
              <li>Try simpler terms: "squat", "push", "pull", "chest", "legs"</li>
              <li>Singular forms work better: "push-up" instead of "push-ups"</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Start typing to search or use filters above</p>
          <p className="text-sm mt-1">Results appear automatically as you type</p>
        </div>
      )}

      {/* Exercise Detail Modal */}
      <ExerciseDetailModal
        exercise={selectedExercise}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
};

export default ExerciseDatabase;
