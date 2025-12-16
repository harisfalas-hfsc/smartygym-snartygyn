import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Play, Video, X, Filter, Search } from "lucide-react";
import { getYouTubeThumbnail } from "@/utils/youtube";
import ExerciseVideoModal from "./ExerciseVideoModal";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MUSCLE_CATEGORIES, MUSCLE_GROUPS, WORKOUT_CATEGORIES, PROGRAM_CATEGORIES, WORKOUT_PHASES } from "@/constants/exerciseCategories";

interface ExerciseVideo {
  id: string;
  title: string;
  description: string | null;
  youtube_video_id: string;
  category: string;
  muscle_group: string | null;
  target_muscle: string | null;
  workout_category: string | null;
  program_category: string | null;
  workout_phase: string | null;
  display_order: number;
  is_promotional: boolean;
  created_at: string;
}

interface Filters {
  muscleGroup: string;
  targetMuscle: string;
  workoutPhase: string;
  workoutCategory: string;
  programCategory: string;
  promotionalSort: 'all' | 'latest' | 'oldest';
}

const ExerciseVideoGrid = () => {
  const [selectedVideo, setSelectedVideo] = useState<ExerciseVideo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Filters>({
    muscleGroup: '',
    targetMuscle: '',
    workoutPhase: '',
    workoutCategory: '',
    programCategory: '',
    promotionalSort: 'all'
  });

  const { data: videos, isLoading } = useQuery({
    queryKey: ['exercise-library-videos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exercise_library_videos')
        .select('*')
        .eq('is_visible', true)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ExerciseVideo[];
    }
  });

  const filteredVideos = useMemo(() => {
    if (!videos) return [];
    
    let result = videos.filter(video => {
      // Search by title (case-insensitive)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!video.title.toLowerCase().includes(query)) return false;
      }
      
      // Promotional filter - when not 'all', only show promotional videos
      if (filters.promotionalSort !== 'all' && !video.is_promotional) return false;
      
      if (filters.muscleGroup && video.muscle_group !== filters.muscleGroup) return false;
      if (filters.targetMuscle && video.target_muscle !== filters.targetMuscle) return false;
      if (filters.workoutPhase && video.workout_phase !== filters.workoutPhase) return false;
      if (filters.workoutCategory && video.workout_category !== filters.workoutCategory) return false;
      if (filters.programCategory && video.program_category !== filters.programCategory) return false;
      return true;
    });

    // Sort promotional videos by date
    if (filters.promotionalSort === 'latest') {
      result = [...result].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (filters.promotionalSort === 'oldest') {
      result = [...result].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }

    return result;
  }, [videos, filters, searchQuery]);

  const availableMuscles = filters.muscleGroup
    ? MUSCLE_CATEGORIES[filters.muscleGroup as keyof typeof MUSCLE_CATEGORIES] || []
    : [];

  const handleMuscleGroupChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      muscleGroup: value === 'all' ? '' : value,
      targetMuscle: '' // Reset target muscle when group changes
    }));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({
      muscleGroup: '',
      targetMuscle: '',
      workoutPhase: '',
      workoutCategory: '',
      programCategory: '',
      promotionalSort: 'all'
    });
  };

  const hasActiveFilters = searchQuery || filters.muscleGroup || filters.targetMuscle || filters.workoutPhase || filters.workoutCategory || filters.programCategory || filters.promotionalSort !== 'all';

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-video w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search video by name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-blue-400"
          />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>Filter by:</span>
        </div>
        
        {/* Grouped Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Promotional Context Group - FIRST */}
          <div className="border border-pink-500 rounded-lg p-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">Search promotional video context</p>
            <Select
              value={filters.promotionalSort}
              onValueChange={(value) => setFilters(prev => ({ ...prev, promotionalSort: value as 'all' | 'latest' | 'oldest' }))}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="View Promotional" />
              </SelectTrigger>
              <SelectContent side="bottom">
                <SelectItem value="all">All Videos</SelectItem>
                <SelectItem value="latest">Promotional (Latest)</SelectItem>
                <SelectItem value="oldest">Promotional (Oldest)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Muscle Targeting Group */}
          <div className="border border-green-500 rounded-lg p-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">Search video by muscle targeting</p>
            <div className="flex flex-col gap-2">
              <Select
                value={filters.muscleGroup || 'all'}
                onValueChange={handleMuscleGroupChange}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Body Region" />
                </SelectTrigger>
                <SelectContent side="bottom">
                  <SelectItem value="all">All Body Regions</SelectItem>
                  {MUSCLE_GROUPS.map((group) => (
                    <SelectItem key={group} value={group}>{group}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.targetMuscle || 'all'}
                onValueChange={(value) => setFilters(prev => ({ ...prev, targetMuscle: value === 'all' ? '' : value }))}
                disabled={!filters.muscleGroup}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Target Muscle" />
                </SelectTrigger>
                <SelectContent side="bottom">
                  <SelectItem value="all">All Muscles</SelectItem>
                  {availableMuscles.map((muscle) => (
                    <SelectItem key={muscle} value={muscle}>{muscle}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Workout Context Group */}
          <div className="border border-purple-500 rounded-lg p-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">Search video by workout context</p>
            <div className="flex flex-col gap-2">
              <Select
                value={filters.workoutPhase || 'all'}
                onValueChange={(value) => setFilters(prev => ({ ...prev, workoutPhase: value === 'all' ? '' : value }))}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Workout Phase" />
                </SelectTrigger>
                <SelectContent side="bottom">
                  <SelectItem value="all">All Phases</SelectItem>
                  {WORKOUT_PHASES.map((phase) => (
                    <SelectItem key={phase} value={phase}>{phase}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.workoutCategory || 'all'}
                onValueChange={(value) => setFilters(prev => ({ ...prev, workoutCategory: value === 'all' ? '' : value }))}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Workout Type" />
                </SelectTrigger>
                <SelectContent side="bottom">
                  <SelectItem value="all">All Workout Types</SelectItem>
                  {WORKOUT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Program Context Group */}
          <div className="border border-orange-500 rounded-lg p-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">Search video by program context</p>
            <Select
              value={filters.programCategory || 'all'}
              onValueChange={(value) => setFilters(prev => ({ ...prev, programCategory: value === 'all' ? '' : value }))}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Program Type" />
              </SelectTrigger>
              <SelectContent side="bottom">
                <SelectItem value="all">All Program Types</SelectItem>
                {PROGRAM_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters & Clear */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {searchQuery && (
              <Badge variant="secondary" className="gap-1">
                Search: "{searchQuery}"
                <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery('')} />
              </Badge>
            )}
            {filters.muscleGroup && (
              <Badge variant="secondary" className="gap-1">
                {filters.muscleGroup}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters(prev => ({ ...prev, muscleGroup: '', targetMuscle: '' }))} />
              </Badge>
            )}
            {filters.targetMuscle && (
              <Badge variant="secondary" className="gap-1">
                {filters.targetMuscle}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters(prev => ({ ...prev, targetMuscle: '' }))} />
              </Badge>
            )}
            {filters.workoutPhase && (
              <Badge variant="secondary" className="gap-1">
                {filters.workoutPhase}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters(prev => ({ ...prev, workoutPhase: '' }))} />
              </Badge>
            )}
            {filters.workoutCategory && (
              <Badge variant="secondary" className="gap-1">
                {filters.workoutCategory}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters(prev => ({ ...prev, workoutCategory: '' }))} />
              </Badge>
            )}
            {filters.programCategory && (
              <Badge variant="secondary" className="gap-1">
                {filters.programCategory}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters(prev => ({ ...prev, programCategory: '' }))} />
              </Badge>
            )}
            {filters.promotionalSort !== 'all' && (
              <Badge variant="secondary" className="gap-1 bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200">
                Promotional ({filters.promotionalSort})
                <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters(prev => ({ ...prev, promotionalSort: 'all' }))} />
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 text-xs">
              Clear all
            </Button>
          </div>
        )}

        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          Showing {filteredVideos.length} of {videos?.length || 0} videos
        </div>
      </div>

      {/* Video Grid */}
      {filteredVideos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Video className="h-12 w-12 mb-4 opacity-50" />
          {hasActiveFilters ? (
            <>
              <p>No videos match your filters.</p>
              <Button variant="link" onClick={clearFilters}>Clear filters</Button>
            </>
          ) : (
            <>
              <p>No exercise videos available yet.</p>
              <p className="text-sm">Check back soon!</p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[500px] overflow-y-auto pr-2">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              className="group cursor-pointer"
              onClick={() => setSelectedVideo(video)}
            >
              <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                <img
                  src={getYouTubeThumbnail(video.youtube_video_id, 'mq')}
                  alt={video.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-primary/90 rounded-full p-3">
                    <Play className="h-6 w-6 text-primary-foreground fill-current" />
                  </div>
                </div>
                {/* Promotional badge */}
                {video.is_promotional && (
                  <div className="absolute top-2 right-2 bg-pink-500 text-white text-xs px-2 py-0.5 rounded">
                    Promo
                  </div>
                )}
                {/* Show most relevant category badge */}
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {video.target_muscle || video.muscle_group || video.workout_phase || video.workout_category || video.program_category || 'General'}
                </div>
              </div>
              <p className="mt-2 text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                {video.title}
              </p>
            </div>
          ))}
        </div>
      )}

      <ExerciseVideoModal
        isOpen={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
        videoId={selectedVideo?.youtube_video_id || null}
        title={selectedVideo?.title || ''}
        description={selectedVideo?.description}
      />
    </>
  );
};

export default ExerciseVideoGrid;