import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowLeft, Eye, CheckCircle, Search, X, Sparkles, Star, Crown, ShoppingCart, Check } from "lucide-react";
import { AccessGate } from "@/components/AccessGate";
import { CompactFilters } from "@/components/CompactFilters";
import { PageBreadcrumbs } from "@/components/PageBreadcrumbs";
import { ContentLoadingSkeleton } from "@/components/ContentLoadingSkeleton";
import { useAllWorkouts } from "@/hooks/useWorkoutData";
import { useWorkoutInteractions } from "@/hooks/useWorkoutInteractions";
import { supabase } from "@/integrations/supabase/client";
import { stripHtmlTags } from "@/lib/text";

type EquipmentFilter = "all" | "bodyweight" | "equipment";
type LevelFilter = "all" | "beginner" | "intermediate" | "advanced";
type FormatFilter = "all" | "circuit" | "amrap" | "for time" | "tabata" | "reps & sets" | "emom" | "mix";
type DurationFilter = "all" | "15" | "20" | "30" | "45" | "60" | "various";
type StatusFilter = "all" | "viewed" | "completed" | "not-viewed" | "favorites";
type SortByFilter = "newest" | "oldest" | "name-asc" | "name-desc";
type AccessFilter = "all" | "free" | "premium" | "purchasable";

export interface Workout {
  id: string;
  name: string;
  description: string;
  duration: string;
  equipment: "bodyweight" | "equipment";
  level: "beginner" | "intermediate" | "advanced";
  format: "circuit" | "amrap" | "for time" | "tabata" | "reps & sets" | "mix";
  imageUrl: string;
  isFree?: boolean;
}

const WorkoutDetail = () => {
  const navigate = useNavigate();
  const { type } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [equipmentFilter, setEquipmentFilter] = useState<EquipmentFilter>("all");
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("all");
  const [formatFilter, setFormatFilter] = useState<FormatFilter>("all");
  const [durationFilter, setDurationFilter] = useState<DurationFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortByFilter>("newest");
  const [accessFilter, setAccessFilter] = useState<AccessFilter>("all");
  const [userId, setUserId] = useState<string | undefined>();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  if (import.meta.env.DEV) {
    console.log("🎯 WorkoutDetail mounted - type:", type);
  }
  
  // Fetch current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id);
      if (import.meta.env.DEV) {
        console.log("👤 User ID:", user?.id || "NOT LOGGED IN");
      }
    });
  }, []);
  
  // Fetch workouts and interactions from database
  const { data: allWorkouts = [], isLoading } = useAllWorkouts();
  const { data: interactions = [] } = useWorkoutInteractions(userId);

  // Helper function to check if workout is new (created within last 7 days)
  const isNew = (createdAt: string | undefined) => {
    if (!createdAt) return false;
    const daysSinceCreation = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceCreation <= 7;
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm("");
    setEquipmentFilter("all");
    setLevelFilter("all");
    setFormatFilter("all");
    setDurationFilter("all");
    setStatusFilter("all");
    setSortBy("newest");
    setAccessFilter("all");
  };

  const hasActiveFilters = searchTerm || equipmentFilter !== "all" || levelFilter !== "all" || 
    formatFilter !== "all" || durationFilter !== "all" || statusFilter !== "all" || sortBy !== "newest" || accessFilter !== "all";
  
  if (import.meta.env.DEV) {
    console.log("📦 All Workouts:", allWorkouts.length, allWorkouts);
    console.log("⏳ Loading:", isLoading);
  }
  
  // Map URL type to database category
  const categoryMap: { [key: string]: string } = {
    "strength": "STRENGTH",
    "calorie-burning": "CALORIE BURNING",
    "metabolic": "METABOLIC",
    "cardio": "CARDIO",
    "mobility": "MOBILITY & STABILITY",
    "challenge": "CHALLENGE"
  };

  const workoutTitles: { [key: string]: string } = {
    "strength": "Strength Workouts",
    "calorie-burning": "Calorie Burning Workouts",
    "metabolic": "Metabolic Workouts",
    "cardio": "Cardio Workouts",
    "mobility": "Mobility & Stability Workouts",
    "challenge": "Challenge Workouts"
  };

  const handleWorkoutClick = (workoutId: string) => {
    navigate(`/individualworkout/${workoutId}`);
  };

  const title = workoutTitles[type || ""] || "Workout";
  const mappedCategory = categoryMap[type || "strength"];
  
  // First filter by category from URL
  const currentTypeWorkouts = allWorkouts.filter(workout => {
    const categoryMatch = workout.category?.toUpperCase().includes(mappedCategory);
    return categoryMatch;
  });
  
  if (import.meta.env.DEV) {
    console.log("📦 Category filtered workouts:", currentTypeWorkouts.length);
  }

  // Filter and sort workouts with memoization
  const filteredWorkouts = useMemo(() => {
    let filtered = currentTypeWorkouts.filter(workout => {
      // Search filter
      if (debouncedSearch) {
        const searchLower = debouncedSearch.toLowerCase();
        const matchesName = workout.name.toLowerCase().includes(searchLower);
        const matchesDescription = workout.description?.toLowerCase().includes(searchLower);
        const matchesCategory = workout.category?.toLowerCase().includes(searchLower);
        if (!matchesName && !matchesDescription && !matchesCategory) return false;
      }

      // Equipment filter
      if (equipmentFilter !== "all" && workout.equipment?.toLowerCase() !== equipmentFilter) return false;
      
      // Level filter
      if (levelFilter !== "all" && workout.difficulty?.toLowerCase() !== levelFilter) return false;
      
      // Format filter
      if (formatFilter !== "all") {
        const workoutFormat = workout.format?.toLowerCase();
        if (formatFilter === "reps & sets" && workoutFormat !== "reps & sets") return false;
        if (formatFilter === "for time" && workoutFormat !== "for time") return false;
        if (formatFilter !== "reps & sets" && formatFilter !== "for time" && workoutFormat !== formatFilter) return false;
      }
      
      // Duration filter
      if (durationFilter !== "all") {
        const workoutDuration = workout.duration?.toLowerCase();
        if (durationFilter === "various") {
          if (!workoutDuration?.includes("various") && !workoutDuration?.includes("varies")) return false;
        } else {
          const durationNumber = workout.duration?.match(/\d+/)?.[0];
          if (durationNumber !== durationFilter) return false;
        }
      }
      
      // Status filter
      if (statusFilter !== "all" && userId) {
        const interaction = interactions.find(i => i.workout_id === workout.id);
        if (statusFilter === "viewed" && !interaction?.has_viewed) return false;
        if (statusFilter === "completed" && !interaction?.is_completed) return false;
        if (statusFilter === "not-viewed" && interaction?.has_viewed) return false;
        if (statusFilter === "favorites" && !interaction?.is_favorite) return false;
      }
      
      // Access filter
      if (accessFilter === "free" && workout.is_premium) return false;
      if (accessFilter === "premium" && !workout.is_premium) return false;
      if (accessFilter === "purchasable" && (!workout.is_standalone_purchase || !workout.price)) return false;
      
      return true;
    });

    // Sort workouts
    const sorted = [...filtered];
    switch (sortBy) {
      case "newest":
        sorted.sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA;
        });
        break;
      case "oldest":
        sorted.sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateA - dateB;
        });
        break;
      case "name-asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
    }

    return sorted;
  }, [currentTypeWorkouts, debouncedSearch, equipmentFilter, levelFilter, formatFilter, 
      durationFilter, statusFilter, sortBy, accessFilter, userId, interactions]);

  return (
    <>
      {isLoading ? (
        <div className="min-h-screen bg-background py-8 px-4">
          <div className="container mx-auto max-w-7xl">
            <ContentLoadingSkeleton />
          </div>
        </div>
      ) : (
        <>
      <Helmet>
        <title>{title} Online Workouts | Online Fitness | Haris Falas | SmartyGym</title>
        <meta name="description" content={`${title} online workouts by Sports Scientist Haris Falas. Professional ${type || 'fitness'} workouts from beginner to advanced. AMRAP, HIIT, TABATA, circuit training. Free and premium online workouts for worldwide access.`} />
        <meta name="keywords" content={`online workouts, ${title}, ${type} workouts, online fitness, Haris Falas workouts, HIIT workouts, AMRAP workouts, TABATA training, circuit training, bodyweight workouts, online gym, home workouts`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={`${title} Online Workouts | Online Fitness by Haris Falas`} />
        <meta property="og:description" content={`Professional ${title.toLowerCase()} online workouts designed by Sports Scientist Haris Falas`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://smartygym.com/workout/${type || ''}`} />
        <meta property="og:site_name" content="SmartyGym" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${title} Online Workouts | Haris Falas`} />
        <meta name="twitter:description" content={`Professional ${title.toLowerCase()} by Cyprus Sports Scientist`} />
        
        <link rel="canonical" href={`https://smartygym.com/workout/${type || ''}`} />
        
        {/* Structured Data - Collection of Workouts */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": `${title} Online Workouts`,
            "description": `Collection of professional online ${title.toLowerCase()} designed by Cyprus Sports Scientist Haris Falas`,
            "numberOfItems": filteredWorkouts.length,
            "provider": {
              "@type": "Person",
              "name": "Haris Falas",
              "jobTitle": "Sports Scientist & Personal Trainer",
              "description": "Online fitness expert specializing in functional training"
            },
            "itemListElement": filteredWorkouts.slice(0, 10).map((workout, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "item": {
                "@type": "ExercisePlan",
                "name": workout.name,
                "description": workout.description,
                "image": workout.image_url,
                "duration": workout.duration,
                "workLocation": "Online / Home / Gym"
              }
            }))
          })}
        </script>
      </Helmet>
      
      <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/workout")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span className="text-xs sm:text-sm">Back</span>
        </Button>
        
        <PageBreadcrumbs 
          items={[
            { label: "Home", href: "/" },
            { label: "Workouts", href: "/workout" },
            { label: title }
          ]} 
        />
        
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search workouts by name or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10 text-sm h-10"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => setSearchTerm('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Compact Filters */}
        <CompactFilters
          filters={[
            {
              name: "Equipment",
              value: equipmentFilter,
              onChange: (value) => setEquipmentFilter(value as EquipmentFilter),
              placeholder: "Equipment",
              options: [
                { value: "all", label: "All Equipment" },
                { value: "bodyweight", label: "Bodyweight" },
                { value: "equipment", label: "Equipment" },
              ],
            },
            {
              name: "Level",
              value: levelFilter,
              onChange: (value) => setLevelFilter(value as LevelFilter),
              placeholder: "Level",
              options: [
                { value: "all", label: "All Levels" },
                { value: "beginner", label: "Beginner" },
                { value: "intermediate", label: "Intermediate" },
                { value: "advanced", label: "Advanced" },
              ],
            },
            {
              name: "Format",
              value: formatFilter,
              onChange: (value) => setFormatFilter(value as FormatFilter),
              placeholder: "Format",
              options: [
                { value: "all", label: "All Formats" },
                { value: "circuit", label: "Circuit" },
                { value: "amrap", label: "AMRAP" },
                { value: "for time", label: "For Time" },
                { value: "tabata", label: "Tabata" },
                { value: "reps & sets", label: "Reps & Sets" },
                { value: "emom", label: "EMOM" },
                { value: "mix", label: "Mix" },
              ],
            },
            {
              name: "Duration",
              value: durationFilter,
              onChange: (value) => setDurationFilter(value as DurationFilter),
              placeholder: "Duration",
              options: [
                { value: "all", label: "All Durations" },
                { value: "15", label: "15 min" },
                { value: "20", label: "20 min" },
                { value: "30", label: "30 min" },
                { value: "45", label: "45 min" },
                { value: "60", label: "60 min" },
                { value: "various", label: "Various" },
              ],
            },
            {
              name: "Access",
              value: accessFilter,
              onChange: (value) => setAccessFilter(value as AccessFilter),
              placeholder: "Access Level",
              options: [
                { value: "all", label: "All Content" },
                { value: "free", label: "🆓 Free Only" },
                { value: "premium", label: "👑 Premium Only" },
                { value: "purchasable", label: "💶 Purchasable" },
              ],
            },
            ...(userId ? [{
              name: "Status",
              value: statusFilter,
              onChange: (value) => setStatusFilter(value as StatusFilter),
              placeholder: "Status",
              options: [
                { value: "all", label: "All Workouts" },
                { value: "viewed", label: "👁️ Viewed" },
                { value: "completed", label: "✓ Completed" },
                { value: "not-viewed", label: "✨ Not Viewed Yet" },
                { value: "favorites", label: "⭐ Favorites" },
              ],
            }] : []),
            {
              name: "Sort By",
              value: sortBy,
              onChange: (value) => setSortBy(value as SortByFilter),
              placeholder: "Sort By",
              options: [
                { value: "newest", label: "🆕 Newest First" },
                { value: "oldest", label: "📅 Oldest First" },
                { value: "name-asc", label: "🔤 Name A-Z" },
                { value: "name-desc", label: "🔤 Name Z-A" },
              ],
            },
          ]}
        />

        {/* Results Counter & Clear Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 px-1">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Showing {filteredWorkouts.length} of {currentTypeWorkouts.length} workouts
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
          
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="w-full sm:w-auto text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Clear All Filters
            </Button>
          )}
        </div>

        {/* Workout Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredWorkouts.map((workout) => {
            const interaction = userId ? interactions.find(i => i.workout_id === workout.id) : null;
            const isViewed = interaction?.has_viewed;
            const isCompleted = interaction?.is_completed;
            const isFavorite = interaction?.is_favorite;
            const isNewWorkout = isNew(workout.created_at);
            
            return (
              <Card
                key={workout.id}
                className="overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-gold bg-card border-border relative"
                onClick={() => navigate(`/workout/${type}/${workout.id}`)}
              >
                {/* NEW Badge */}
                {isNewWorkout && (
                  <div className="absolute top-2 right-2 z-10">
                    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">
                      <Sparkles className="h-3 w-3 shrink-0" />
                      NEW
                    </span>
                  </div>
                )}

                <div className="relative h-48 w-full overflow-hidden">
                  <img 
                    src={workout.image_url} 
                    alt={`${workout.name} - ${workout.duration} ${workout.difficulty} ${workout.equipment === 'BODYWEIGHT' ? 'bodyweight' : 'equipment-based'} ${workout.format} workout by Haris Falas Sports Scientist at SmartyGym.com`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                
                <div className="p-4 space-y-3">
                  <h3 className="font-semibold text-base sm:text-lg">{workout.name}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{stripHtmlTags(workout.description || "")}</p>
                  
                  {/* Status Indicators Row */}
                  {userId && (
                    <div className="flex items-center gap-2 flex-wrap">
                      {isCompleted && (
                        <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                          <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                          <span className="hidden sm:inline">Completed</span>
                        </div>
                      )}
                      
                      {isViewed && !isCompleted && (
                        <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                          <span className="hidden sm:inline">Viewed</span>
                        </div>
                      )}
                      
                      {isFavorite && (
                        <div className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400">
                          <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-current shrink-0" />
                          <span className="hidden sm:inline">Favorite</span>
                        </div>
                      )}
                      
                      {isNewWorkout && (
                        <div className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400 font-semibold">
                          <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                          <span>NEW</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Access Badge */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{workout.duration}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    {workout.is_premium ? (
                      workout.is_standalone_purchase && workout.price ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex items-center gap-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-semibold px-2 py-1 rounded-full cursor-help">
                              <ShoppingCart className="h-3 w-3 shrink-0" />
                              BUY €{Number(workout.price).toFixed(2)}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="max-w-xs text-center">
                            Purchase this workout individually without a subscription. One-time payment, lifetime access!
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                          <Crown className="h-3 w-3 shrink-0" />
                          <span className="hidden sm:inline">Premium</span>
                        </span>
                      )
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-gradient-to-r from-green-500 to-teal-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                        <Check className="h-3 w-3 shrink-0" />
                        FREE
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {filteredWorkouts.length === 0 && (
          <Card className="p-8">
            <p className="text-center text-muted-foreground">
              No workouts found for this combination. Try different filters.
            </p>
          </Card>
        )}
      </div>
      </div>
      </>
      )}
    </>
  );
};

export default WorkoutDetail;
