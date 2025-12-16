import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, X, Dumbbell, Activity, ChevronLeft, ChevronRight } from "lucide-react";
import ExerciseDetailModal from "./ExerciseDetailModal";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";

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

type ItemsPerPage = 12 | 24 | 'all';

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

  // Pagination state
  const [itemsPerPage, setItemsPerPage] = useState<ItemsPerPage>(12);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchExercises = async (page: number = 1) => {
    setLoading(true);
    try {
      const limit = itemsPerPage === 'all' ? 500 : itemsPerPage;
      const offset = itemsPerPage === 'all' ? 0 : (page - 1) * itemsPerPage;
      
      const params: Record<string, string | number> = { limit, offset };
      
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
      setTotalCount(data?.total || 0);
      setCurrentPage(page);
      setHasSearched(true);
    } catch (error: any) {
      console.error('Error fetching exercises:', error);
      toast({
        title: "Error loading exercises",
        description: error.message || "Failed to fetch exercises from API",
        variant: "destructive",
      });
      setExercises([]);
      setTotalCount(0);
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
    setCurrentPage(1);
    fetchExercises(1);
  };

  const clearFilters = () => {
    setBodyPartFilter("");
    setEquipmentFilter("");
    setTypeFilter("");
    setExercises([]);
    setHasSearched(false);
    setCurrentPage(1);
    setTotalCount(0);
  };

  const handleExerciseClick = (exercise: ExerciseSearchResult) => {
    fetchExerciseDetail(exercise.id);
  };

  const handleItemsPerPageChange = (value: ItemsPerPage) => {
    setItemsPerPage(value);
    if (hasSearched) {
      setCurrentPage(1);
      // Will refetch in useEffect
    }
  };

  // Refetch when itemsPerPage changes (only if already searched)
  useEffect(() => {
    if (hasSearched) {
      fetchExercises(1);
    }
  }, [itemsPerPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchExercises(page);
    }
  };

  const hasFilters = (bodyPartFilter && bodyPartFilter !== "all") || 
                     (equipmentFilter && equipmentFilter !== "all") || 
                     (typeFilter && typeFilter !== "all");

  const totalPages = itemsPerPage === 'all' ? 1 : Math.ceil(totalCount / itemsPerPage);

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

      {/* Results Header with Show Selector */}
      {hasSearched && exercises.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-border">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{totalCount}</span> exercises found
            {itemsPerPage !== 'all' && totalCount > itemsPerPage && (
              <span> • Showing {Math.min(exercises.length, itemsPerPage)} per page</span>
            )}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Show:</span>
            <div className="flex gap-1">
              {([12, 24, 'all'] as ItemsPerPage[]).map((value) => (
                <Button
                  key={value}
                  variant={itemsPerPage === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleItemsPerPageChange(value)}
                  className="h-7 px-3 text-xs"
                >
                  {value === 'all' ? 'All' : value}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading exercises...</span>
        </div>
      ) : exercises.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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

      {/* Pagination Controls */}
      {hasSearched && exercises.length > 0 && itemsPerPage !== 'all' && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                  className="gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
              </PaginationItem>
              
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => handlePageChange(pageNum)}
                      isActive={currentPage === pageNum}
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                  className="gap-1"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
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
