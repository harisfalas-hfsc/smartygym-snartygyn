import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Play, Heart, RefreshCw, Search, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";

interface Exercise {
  id: string;
  name: string;
  video_id: string;
  video_url: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

const ExerciseLibrary = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentGifUrl, setCurrentGifUrl] = useState<string>("");
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [favoriteExercises, setFavoriteExercises] = useState<string[]>([]);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setFavoriteExercises([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    loadFavorites();
    checkSubscription();
    loadExercises();
  }, [user]);

  const loadExercises = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("exercises")
        .select("*")
        .order("name");

      if (error) throw error;

      setExercises(data || []);
    } catch (error) {
      console.error("Error loading exercises:", error);
      toast({
        title: "Error",
        description: "Failed to load exercises",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadFavorites = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from("favorite_exercises")
      .select("exercise_name")
      .eq("user_id", user.id);
    
    if (data) {
      setFavoriteExercises(data.map(d => d.exercise_name));
    }
  };

  const checkSubscription = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase.functions.invoke('check-subscription');
      if (data?.subscribed) {
        setHasSubscription(true);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const syncExercises = async () => {
    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-wger-exercises');
      
      if (error) throw error;
      
      toast({
        title: "Sync Complete",
        description: data.message || `Successfully synced ${data.stats?.synced || 0} exercises`,
      });
      
      // Reload exercises from database
      await loadExercises();
    } catch (error: any) {
      console.error("Error syncing ExerciseDB exercises:", error);
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync exercises from ExerciseDB API",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const toggleFavorite = async (exerciseName: string) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to access favorites",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }

    if (!hasSubscription) {
      toast({
        title: "Premium membership required",
        description: "Upgrade to premium to favorite exercises",
        variant: "destructive"
      });
      navigate("/premiumbenefits");
      return;
    }

    const isFavorite = favoriteExercises.includes(exerciseName);

    if (isFavorite) {
      // Remove from favorites
      const { error } = await supabase
        .from("favorite_exercises")
        .delete()
        .eq("user_id", user.id)
        .eq("exercise_name", exerciseName);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to remove from favorites",
          variant: "destructive"
        });
      } else {
        setFavoriteExercises(prev => prev.filter(name => name !== exerciseName));
        toast({
          title: "Removed from favorites",
          description: `${exerciseName} has been removed from your favorites`
        });
      }
    } else {
      // Add to favorites
      const { error } = await supabase
        .from("favorite_exercises")
        .insert({
          user_id: user.id,
          exercise_name: exerciseName
        });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to add to favorites",
          variant: "destructive"
        });
      } else {
        setFavoriteExercises(prev => [...prev, exerciseName]);
        toast({
          title: "Added to favorites",
          description: `${exerciseName} has been added to your favorites`
        });
      }
    }
  };

  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch = searchQuery === "" || 
      exercise.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handlePlay = (gifUrl: string) => {
    setCurrentGifUrl(gifUrl);
    setIsVideoDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsVideoDialogOpen(false);
    setCurrentGifUrl("");
  };

  return (
    <>
      <Helmet>
        <title>Exercise Library - Smarty Gym | 1000+ Exercise Videos by Haris Falas</title>
        <meta name="description" content="Browse 1000+ exercise videos at smartygym.com by Haris Falas. Comprehensive exercise library with GIF demonstrations. Gym reimagined for anywhere, anytime training." />
        <meta name="keywords" content="smartygym exercises, smarty gym, smartygym.com, Haris Falas, exercise library, workout exercises, exercise videos, convenient fitness, gym reimagined, flexible training" />
        
        <meta property="og:title" content="Exercise Library - Smarty Gym | 1000+ Exercise Videos" />
        <meta property="og:description" content="1000+ exercises with GIF demonstrations by Haris Falas - comprehensive library for training anywhere" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://smartygym.com/exerciselibrary" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Exercise Library - Smarty Gym" />
        <meta name="twitter:description" content="1000+ exercise videos at smartygym.com for convenient training" />
        
        <link rel="canonical" href="https://smartygym.com/exerciselibrary" />
      </Helmet>
      
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-7xl mx-auto py-4 sm:py-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="text-xs sm:text-sm">Back</span>
          </Button>
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6 sm:mb-8">
            Exercise Library
          </h1>

          {/* Sync Button */}
          <div className="text-center mb-6">
            <Button
              onClick={syncExercises}
              disabled={isSyncing}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing with ExerciseDB...' : 'Sync Exercise Videos'}
            </Button>
            {exercises.length > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                {exercises.length} exercises available
              </p>
            )}
          </div>

          {/* Search Bar */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search exercises..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Exercise Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : exercises.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground mb-4">
                  No exercises found. Click "Sync Exercise Videos" to load exercises from ExerciseDB.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                Showing {filteredExercises.length} of {exercises.length} exercises
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredExercises.map((exercise) => (
                  <Card key={exercise.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-sm sm:text-base line-clamp-2">
                          {exercise.name}
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFavorite(exercise.name)}
                          className="h-8 w-8 p-0 flex-shrink-0"
                        >
                          <Heart
                            className={`h-4 w-4 ${
                              favoriteExercises.includes(exercise.name)
                                ? "fill-red-500 text-red-500"
                                : ""
                            }`}
                          />
                        </Button>
                      </div>

                      {exercise.video_url && (
                        <div className="flex justify-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePlay(exercise.video_url)}
                            className="gap-2"
                          >
                            <Play className="h-4 w-4" />
                            Watch Demo
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Video Dialog */}
      <Dialog open={isVideoDialogOpen} onOpenChange={setIsVideoDialogOpen}>
        <DialogContent className="max-w-4xl">
          {currentGifUrl && (
            <div className="aspect-video w-full flex items-center justify-center bg-black">
              <img 
                src={currentGifUrl} 
                alt="Exercise demonstration" 
                className="max-w-full max-h-full object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExerciseLibrary;
