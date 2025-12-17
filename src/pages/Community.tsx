import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageBreadcrumbs } from "@/components/PageBreadcrumbs";
import { InfoRibbon } from "@/components/InfoRibbon";
import { SEOEnhancer } from "@/components/SEOEnhancer";
import { useShowBackButton } from "@/hooks/useShowBackButton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trophy, MessageSquare, Star, User, Calendar, ClipboardCheck, ArrowLeft, Eye, Award } from "lucide-react";
import { TestimonialsSection } from "@/components/community/TestimonialsSection";
import { formatDistanceToNow } from "date-fns";
import { CompactFilters } from "@/components/CompactFilters";

// Mapping for fake comment user IDs to display names
const FAKE_USER_DISPLAY_NAMES: Record<string, string> = {
  '00000000-0000-0000-0000-000000000012': 'Alexandra Mitchell',
  '00000000-0000-0000-0000-000000000013': 'Thomas Anderson',
  '00000000-0000-0000-0000-000000000014': 'Sophia Williams',
  '00000000-0000-0000-0000-000000000015': 'Marcus Chen',
  '00000000-0000-0000-0000-000000000016': 'Emma Richardson',
  '00000000-0000-0000-0000-000000000017': 'Daniel Foster',
  '00000000-0000-0000-0000-000000000018': 'Rachel Torres',
};

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  total_completions: number;
}

interface RatedContent {
  content_id: string;
  content_name: string;
  content_type: "workout" | "program";
  workout_type?: string;
  program_type?: string;
  average_rating: number;
  rating_count: number;
}

interface Comment {
  id: string;
  user_id: string;
  workout_id: string | null;
  workout_name: string | null;
  workout_type: string | null;
  program_id: string | null;
  program_name: string | null;
  program_type: string | null;
  comment_text: string;
  created_at: string;
  display_name: string;
}


const Community = () => {
  const { canGoBack, goBack } = useShowBackButton();
  const [workoutLeaderboard, setWorkoutLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [programLeaderboard, setProgramLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [checkinLeaderboard, setCheckinLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [ratedContent, setRatedContent] = useState<RatedContent[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(true);
  const [isLoadingRatings, setIsLoadingRatings] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [leaderboardFilter, setLeaderboardFilter] = useState<"workouts" | "programs" | "checkins">("workouts");
  const [ratingsFilter, setRatingsFilter] = useState<"workouts" | "programs">("workouts");
  const [commentsFilter, setCommentsFilter] = useState<"all" | "workouts" | "programs">("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  
  
  // Modal state for comments only (Leaderboard and Ratings are top 6 competitions)
  const [showCommentsModal, setShowCommentsModal] = useState(false);


  useEffect(() => {
    fetchLeaderboards();
    fetchRatedContent();
  }, []);

  useEffect(() => {
    fetchComments();
  }, [sortOrder, commentsFilter]);

  const fetchLeaderboards = async () => {
    try {
      // Get workout completions
      const { data: workoutData, error: workoutError } = await supabase
        .from("workout_interactions")
        .select("user_id")
        .eq("is_completed", true);

      if (workoutError) throw workoutError;

      // Get program completions
      const { data: programData, error: programError } = await supabase
        .from("program_interactions")
        .select("user_id")
        .eq("is_completed", true);

      if (programError) throw programError;

      // Count workout completions per user
      const workoutCounts: { [key: string]: number } = {};
      (workoutData || []).forEach((item) => {
        workoutCounts[item.user_id] = (workoutCounts[item.user_id] || 0) + 1;
      });

      // Count program completions per user
      const programCounts: { [key: string]: number } = {};
      (programData || []).forEach((item) => {
        programCounts[item.user_id] = (programCounts[item.user_id] || 0) + 1;
      });

      // Get check-in data for consistency leaderboard
      const { data: checkinData, error: checkinError } = await supabase
        .from("smarty_checkins")
        .select("user_id, morning_completed, night_completed, checkin_date")
        .order("checkin_date", { ascending: true });

      if (checkinError) throw checkinError;

      // Calculate consistency score per user
      // Score = (full days * 2) + (partial days * 1) + (streak bonus)
      // Full day = both morning AND night completed
      // Partial day = only morning OR only night completed
      // Streak bonus = consecutive days with at least one check-in
      const checkinCounts: { [key: string]: number } = {};
      const userCheckinsByDate: { [userId: string]: { [date: string]: { morning: boolean; night: boolean } } } = {};
      
      (checkinData || []).forEach((item) => {
        if (!userCheckinsByDate[item.user_id]) {
          userCheckinsByDate[item.user_id] = {};
        }
        if (!userCheckinsByDate[item.user_id][item.checkin_date]) {
          userCheckinsByDate[item.user_id][item.checkin_date] = { morning: false, night: false };
        }
        if (item.morning_completed) userCheckinsByDate[item.user_id][item.checkin_date].morning = true;
        if (item.night_completed) userCheckinsByDate[item.user_id][item.checkin_date].night = true;
      });

      // Calculate consistency score for each user
      Object.entries(userCheckinsByDate).forEach(([userId, dateMap]) => {
        let consistencyScore = 0;
        const dates = Object.keys(dateMap).sort();
        let currentStreak = 0;
        let maxStreak = 0;
        let prevDate: Date | null = null;

        dates.forEach((dateStr) => {
          const { morning, night } = dateMap[dateStr];
          const currentDate = new Date(dateStr);
          
          // Points for completions
          if (morning && night) {
            consistencyScore += 3; // Full day bonus
          } else if (morning || night) {
            consistencyScore += 1; // Partial day
          }

          // Track streaks (consecutive days)
          if (prevDate) {
            const dayDiff = Math.round((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
            if (dayDiff === 1) {
              currentStreak++;
            } else {
              maxStreak = Math.max(maxStreak, currentStreak);
              currentStreak = 1;
            }
          } else {
            currentStreak = 1;
          }
          prevDate = currentDate;
        });
        
        maxStreak = Math.max(maxStreak, currentStreak);
        
        // Add streak bonus (1 point per day in longest streak)
        consistencyScore += Math.floor(maxStreak * 0.5);
        
        if (consistencyScore > 0) {
          checkinCounts[userId] = consistencyScore;
        }
      });

      // Get user profiles
      const allUserIds = [...new Set([...Object.keys(workoutCounts), ...Object.keys(programCounts), ...Object.keys(checkinCounts)])];
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", allUserIds);

      if (profilesError) {
        console.error("Error fetching profiles for leaderboard:", profilesError);
      }

      // Create workout leaderboard with real data only
      const workoutEntries: LeaderboardEntry[] = Object.entries(workoutCounts).map(([userId, count]) => {
        const profile = profilesData?.find((p) => p.user_id === userId);
        return {
          user_id: userId,
          display_name: profile?.full_name || "Anonymous User",
          total_completions: count,
        };
      });

      workoutEntries.sort((a, b) => b.total_completions - a.total_completions);
      setWorkoutLeaderboard(workoutEntries);

      // Create program leaderboard with real data only
      const programEntries: LeaderboardEntry[] = Object.entries(programCounts).map(([userId, count]) => {
        const profile = profilesData?.find((p) => p.user_id === userId);
        return {
          user_id: userId,
          display_name: profile?.full_name || "Anonymous User",
          total_completions: count,
        };
      });

programEntries.sort((a, b) => b.total_completions - a.total_completions);
      setProgramLeaderboard(programEntries);

      // Create check-in leaderboard with real data only
      const checkinEntries: LeaderboardEntry[] = Object.entries(checkinCounts).map(([userId, count]) => {
        const profile = profilesData?.find((p) => p.user_id === userId);
        return {
          user_id: userId,
          display_name: profile?.full_name || "Anonymous User",
          total_completions: count,
        };
      });

      checkinEntries.sort((a, b) => b.total_completions - a.total_completions);
      setCheckinLeaderboard(checkinEntries);
      
    } catch (error) {
      console.error("Error fetching leaderboards:", error);
    } finally {
      setIsLoadingLeaderboard(false);
    }
  };

  const fetchRatedContent = async () => {
    try {
      // Get workout ratings
      const { data: workoutRatings, error: workoutError } = await supabase
        .from("workout_interactions")
        .select("workout_id, workout_name, workout_type, rating")
        .not("rating", "is", null);

      if (workoutError) throw workoutError;

      // Get program ratings
      const { data: programRatings, error: programError } = await supabase
        .from("program_interactions")
        .select("program_id, program_name, program_type, rating")
        .not("rating", "is", null);

      if (programError) throw programError;

      // Calculate workout averages
      const workoutRatingMap: { [key: string]: { name: string; type: string; ratings: number[] } } = {};
      (workoutRatings || []).forEach((item) => {
        if (!workoutRatingMap[item.workout_id]) {
          workoutRatingMap[item.workout_id] = { name: item.workout_name, type: item.workout_type, ratings: [] };
        }
        workoutRatingMap[item.workout_id].ratings.push(item.rating);
      });

      // Calculate program averages
      const programRatingMap: { [key: string]: { name: string; type: string; ratings: number[] } } = {};
      (programRatings || []).forEach((item) => {
        if (!programRatingMap[item.program_id]) {
          programRatingMap[item.program_id] = { name: item.program_name, type: item.program_type, ratings: [] };
        }
        programRatingMap[item.program_id].ratings.push(item.rating);
      });

      // Create rated content array
      const allRatedContent: RatedContent[] = [];

      Object.entries(workoutRatingMap).forEach(([id, data]) => {
        const avg = data.ratings.reduce((sum, r) => sum + r, 0) / data.ratings.length;
        allRatedContent.push({
          content_id: id,
          content_name: data.name,
          content_type: "workout",
          workout_type: data.type,
          average_rating: Math.round(avg * 10) / 10,
          rating_count: data.ratings.length,
        });
      });

      Object.entries(programRatingMap).forEach(([id, data]) => {
        const avg = data.ratings.reduce((sum, r) => sum + r, 0) / data.ratings.length;
        allRatedContent.push({
          content_id: id,
          content_name: data.name,
          content_type: "program",
          program_type: data.type,
          average_rating: Math.round(avg * 10) / 10,
          rating_count: data.ratings.length,
        });
      });

      // Sort by average rating (desc), then by count (desc)
      allRatedContent.sort((a, b) => {
        if (b.average_rating !== a.average_rating) {
          return b.average_rating - a.average_rating;
        }
        return b.rating_count - a.rating_count;
      });

      setRatedContent(allRatedContent);
    } catch (error) {
      console.error("Error fetching rated content:", error);
    } finally {
      setIsLoadingRatings(false);
    }
  };

  const fetchComments = async () => {
    try {
      let query = supabase
        .from("workout_comments")
        .select("id, user_id, workout_id, workout_name, workout_type, program_id, program_name, program_type, comment_text, created_at")
        .order("created_at", { ascending: sortOrder === "oldest" })
        .limit(50);

      // Apply filter
      if (commentsFilter === "workouts") {
        query = query.not("workout_name", "is", null);
      } else if (commentsFilter === "programs") {
        query = query.not("program_name", "is", null);
      }

      const { data: commentsData, error: commentsError } = await query;

      if (commentsError) throw commentsError;

      // Fetch profiles for comment authors
      const userIds = [...new Set(commentsData?.map((c) => c.user_id) || [])];
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);

      if (profilesError) {
        console.error("Error fetching profiles for comments:", profilesError);
      }

      // Combine comments with display names (check fake names first, then profiles)
      const commentsWithNames = commentsData?.map((comment) => {
        const fakeName = FAKE_USER_DISPLAY_NAMES[comment.user_id];
        const profile = profilesData?.find((p) => p.user_id === comment.user_id);
        return {
          ...comment,
          display_name: fakeName || profile?.full_name || "Anonymous User",
        };
      }) || [];

      const allComments = commentsWithNames;
      allComments.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
      });

      setComments(allComments);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const getMedalIcon = (index: number) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    if (index === 3) return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30">
        <Award className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      </span>
    );
    if (index === 4) return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800">
        <Award className="h-4 w-4 text-slate-600 dark:text-slate-400" />
      </span>
    );
    if (index === 5) return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 dark:bg-primary/20">
        <Award className="h-4 w-4 text-primary" />
      </span>
    );
    return null;
  };

  // Top 6 competition logic for leaderboard (always sorted by most completions)
  const getLeaderboardWithPlaceholders = (): (LeaderboardEntry | null)[] => {
    let data: LeaderboardEntry[];
    if (leaderboardFilter === "workouts") {
      data = workoutLeaderboard;
    } else if (leaderboardFilter === "programs") {
      data = programLeaderboard;
    } else {
      data = checkinLeaderboard;
    }
    
    // Always sort by most completions (descending)
    const sorted = [...data].sort((a, b) => b.total_completions - a.total_completions);
    
    // Fill with placeholders for 6 positions
    const result: (LeaderboardEntry | null)[] = [];
    for (let i = 0; i < 6; i++) {
      result.push(sorted[i] || null);
    }
    return result;
  };

  // Top 6 competition logic for ratings (always sorted by highest rating)
  const getRatingsWithPlaceholders = (): (RatedContent | null)[] => {
    const data = ratedContent.filter(item => 
      item.content_type === (ratingsFilter === "workouts" ? "workout" : "program")
    );
    
    // Always sort by highest rating (descending), then by review count
    const sorted = [...data].sort((a, b) => {
      if (b.average_rating !== a.average_rating) {
        return b.average_rating - a.average_rating;
      }
      return b.rating_count - a.rating_count;
    });
    
    // Fill with placeholders for 6 positions
    const result: (RatedContent | null)[] = [];
    for (let i = 0; i < 6; i++) {
      result.push(sorted[i] || null);
    }
    return result;
  };

  // Get top 6 comments
  const getTopComments = () => {
    return comments.slice(0, 6);
  };

  return (
    <>
      <Helmet>
        <title>Community | Leaderboards & Reviews | SmartyGym</title>
        <meta name="description" content="Join the SmartyGym community. View leaderboards, member reviews, and connect with fellow fitness enthusiasts. Share your progress and get inspired by others' success stories." />
        <meta name="keywords" content="fitness community, workout leaderboards, member reviews, fitness social, training community, SmartyGym community, fitness motivation, workout reviews, online fitness community" />
        <link rel="canonical" href="https://smartygym.com/community" />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "SmartyGym Community Leaderboards",
            "description": "Community leaderboards showcasing member achievements, workout completions, and training program progress",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Workout Completions Leaderboard"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Program Completions Leaderboard"
              }
            ]
          })}
        </script>
      </Helmet>
      
      <SEOEnhancer 
        entities={["SmartyGym", "Fitness Community", "Community Leaderboards"]}
        topics={["fitness community", "workout leaderboards", "member reviews", "fitness motivation", "social fitness"]}
        expertise={["Community Building", "Fitness Motivation"]}
        contentType="community-platform"
        aiSummary="SmartyGym community platform features leaderboards tracking workout and program completions, member reviews and ratings, and community comments. Connect with fellow fitness enthusiasts and share your progress."
        aiKeywords={["fitness community", "workout leaderboards", "member reviews", "fitness social", "training community", "online fitness community", "fitness motivation"]}
        relatedContent={["Workout Library", "Training Programs", "Premium Membership", "Blog"]}
        targetAudience="fitness enthusiasts, competitive athletes, community members"
        pageType="CommunityPage"
      />

      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-7xl px-4 pb-8">
          
          {canGoBack && (
            <div className="mb-6">
              <Button variant="ghost" size="sm" onClick={goBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                <span className="text-xs sm:text-sm">Back</span>
              </Button>
            </div>
          )}

          <PageBreadcrumbs 
            items={[
              { label: "Home", href: "/" },
              { label: "Community" }
            ]} 
          />

          {/* About Community */}
          <Card className="mb-8 bg-gradient-to-br from-primary/5 via-background to-primary/5 border-2 border-primary/40 shadow-primary">
            <CardContent className="p-4 sm:p-5">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 text-center">About Community</h2>
              <div className="space-y-2 text-muted-foreground max-w-3xl mx-auto">
                <p className="text-sm sm:text-base text-center">
                  Welcome to the <span className="text-primary font-semibold">SmartyGym</span> Community! Track your progress on leaderboards for workout completions, 
                  training programs, and daily check-ins. Discover top-rated content through member ratings, 
                  read community comments and testimonials, and get inspired by fellow members' achievements. 
                  Connect, compete, and celebrate your fitness journey together.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Unified Leaderboard Section */}
          <Card 
            itemScope
            itemType="https://schema.org/ItemList"
            className="mb-6 md:mb-8 border-2 border-primary/30 shadow-lg"
            data-keywords="smarty gym community, online gym leaderboard, online fitness community, smartygym.com, Haris Falas"
            aria-label="Community Leaderboard - SmartyGym online fitness community - smartygym.com"
          >
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 md:p-6">
              <CardTitle 
                className="flex items-center gap-2 text-xl md:text-2xl mb-4"
                itemProp="name"
              >
                <Trophy className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                Community Leaderboard
              </CardTitle>
              <CompactFilters
                filters={[
                  {
                    name: "Type",
                    value: leaderboardFilter,
                    onChange: (value) => setLeaderboardFilter(value as "workouts" | "programs" | "checkins"),
                    options: [
                      { value: "workouts", label: "Workouts" },
                      { value: "programs", label: "Training Programs" },
                      { value: "checkins", label: "Check-ins" }
                    ],
                    placeholder: "Select type"
                  }
                ]}
              />
            </CardHeader>
            <CardContent className="p-4 md:pt-6">
              {isLoadingLeaderboard ? (
                <div className="space-y-3">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-primary/30">
                        <TableHead className="w-12 md:w-16 text-xs md:text-sm">Rank</TableHead>
                        <TableHead className="text-xs md:text-sm">Member</TableHead>
                        <TableHead className="text-right text-xs md:text-sm">{leaderboardFilter === "checkins" ? "Consistency Score" : "Completions"}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getLeaderboardWithPlaceholders().map((entry, index) => (
                        <TableRow
                          key={entry?.user_id || `empty-${index}`}
                          className="border-primary/20 hover:bg-primary/5"
                        >
                          <TableCell className="font-medium text-xs md:text-sm py-2 md:py-3">
                            <div className="flex items-center gap-1 md:gap-2">
                              <span className="text-base md:text-lg">{getMedalIcon(index)}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-2 md:py-3">
                            {entry ? (
                              <div className="flex items-center gap-1 md:gap-2">
                                <User className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground flex-shrink-0" />
                                <span className="font-medium text-xs md:text-sm truncate">{entry.display_name}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground italic text-xs md:text-sm">Awaiting competitor...</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right py-2 md:py-3">
                            {entry ? (
                              <span className="inline-flex items-center gap-1 px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-primary/10 text-primary font-semibold text-xs md:text-sm whitespace-nowrap">
                                {entry.total_completions}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">---</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Most Rated Section */}
          <Card className="mb-6 md:mb-8 border-2 border-primary/30 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 md:p-6">
              <CardTitle className="flex items-center gap-2 text-xl md:text-2xl mb-4">
                <Star className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                Community Ratings
              </CardTitle>
              <CompactFilters
                filters={[
                  {
                    name: "Type",
                    value: ratingsFilter,
                    onChange: (value) => setRatingsFilter(value as "workouts" | "programs"),
                    options: [
                      { value: "workouts", label: "Workouts" },
                      { value: "programs", label: "Training Programs" }
                    ],
                    placeholder: "Select type"
                  }
                ]}
              />
            </CardHeader>
            <CardContent className="p-4 md:pt-6">
              {isLoadingRatings ? (
                <div className="space-y-3">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-primary/30">
                        <TableHead className="w-12 md:w-16 text-xs md:text-sm">Rank</TableHead>
                        <TableHead className="text-xs md:text-sm">Name</TableHead>
                        <TableHead className="text-center text-xs md:text-sm">Rating</TableHead>
                        <TableHead className="text-right text-xs md:text-sm">Reviews</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getRatingsWithPlaceholders().map((item, index) => (
                        <TableRow
                          key={item?.content_id || `empty-${index}`}
                          className="border-primary/20 hover:bg-primary/5"
                        >
                          <TableCell className="font-medium text-xs md:text-sm py-2 md:py-3">
                            <div className="flex items-center gap-1 md:gap-2">
                              <span className="text-base md:text-lg">{getMedalIcon(index)}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-2 md:py-3">
                            {item ? (
                              <Link 
                                to={item.content_type === "workout" 
                                  ? `/workout/${item.workout_type}/${item.content_id}`
                                  : `/trainingprogram/${item.program_type}/${item.content_id}`
                                }
                                className="font-medium text-xs md:text-sm truncate text-primary hover:underline"
                              >
                                {item.content_name}
                              </Link>
                            ) : (
                              <span className="text-muted-foreground italic text-xs md:text-sm">Awaiting rating...</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center py-2 md:py-3">
                            {item ? (
                              <div className="flex items-center justify-center gap-1">
                                <Star className="h-3 w-3 md:h-4 md:w-4 fill-primary text-primary" />
                                <span className="font-semibold text-xs md:text-sm">{item.average_rating.toFixed(1)}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">---</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right py-2 md:py-3">
                            {item ? (
                              <span className="inline-flex items-center gap-1 px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-primary/10 text-primary font-semibold text-xs md:text-sm whitespace-nowrap">
                                {item.rating_count}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">---</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card className="border-2 border-primary/30 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 md:p-6">
              <CardTitle className="flex items-center gap-2 text-xl md:text-2xl mb-4">
                <MessageSquare className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                Community Comments
              </CardTitle>
              <CompactFilters
                filters={[
                  {
                    name: "Type",
                    value: commentsFilter,
                    onChange: (value) => setCommentsFilter(value as "all" | "workouts" | "programs"),
                    options: [
                      { value: "all", label: "All Comments" },
                      { value: "workouts", label: "Workouts" },
                      { value: "programs", label: "Training Programs" }
                    ],
                    placeholder: "Select type"
                  },
                  {
                    name: "Sort",
                    value: sortOrder,
                    onChange: (value) => setSortOrder(value as "newest" | "oldest"),
                    options: [
                      { value: "newest", label: "Newest First" },
                      { value: "oldest", label: "Oldest First" }
                    ],
                    placeholder: "Sort by"
                  }
                ]}
              />
            </CardHeader>
            <CardContent className="p-4 md:pt-6">
              {isLoadingComments ? (
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ))}
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium mb-2">
                    No comments yet
                  </p>
                  <p className="text-sm">
                    Be the first premium member to share your experience!
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 md:space-y-4">
                    {getTopComments().map((comment) => (
                      <div
                        key={comment.id}
                        className="p-3 md:p-4 rounded-lg border-2 border-primary/20 bg-gradient-to-r from-background to-primary/5 hover:border-primary/40 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3 md:h-4 md:w-4 text-primary flex-shrink-0" />
                            <span className="font-semibold text-xs md:text-sm truncate">
                              {comment.display_name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                            <Calendar className="h-3 w-3" />
                            <span className="text-[10px] md:text-xs">
                              {formatDistanceToNow(new Date(comment.created_at), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                        </div>
                        <p className="text-[10px] md:text-xs text-primary font-medium mb-2">
                          {comment.workout_name ? (
                            <>
                              Workout:{" "}
                              <Link
                                to={`/workout/${comment.workout_type}/${comment.workout_id}`}
                                className="hover:underline font-semibold"
                              >
                                {comment.workout_name}
                              </Link>
                            </>
                          ) : (
                            <>
                              Program:{" "}
                              <Link
                                to={`/trainingprogram/${comment.program_type}/${comment.program_id}`}
                                className="hover:underline font-semibold"
                              >
                                {comment.program_name}
                              </Link>
                            </>
                          )}
                        </p>
                        <p className="text-xs md:text-sm leading-relaxed">{comment.comment_text}</p>
                      </div>
                    ))}
                  </div>
                  {comments.length > 6 && (
                    <div className="mt-4 text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCommentsModal(true)}
                        className="gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View All ({comments.length})
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Testimonials Section */}
          <div className="mt-6 md:mt-8">
            <TestimonialsSection />
          </div>
        </div>
      </div>

      {/* Comments Modal */}
      <Dialog open={showCommentsModal} onOpenChange={setShowCommentsModal}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              All Community Comments
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-3 md:space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-3 md:p-4 rounded-lg border-2 border-primary/20 bg-gradient-to-r from-background to-primary/5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 md:h-4 md:w-4 text-primary flex-shrink-0" />
                      <span className="font-semibold text-xs md:text-sm truncate">
                        {comment.display_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                      <Calendar className="h-3 w-3" />
                      <span className="text-[10px] md:text-xs">
                        {formatDistanceToNow(new Date(comment.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] md:text-xs text-primary font-medium mb-2">
                    {comment.workout_name ? (
                      <>
                        Workout:{" "}
                        <Link
                          to={`/workout/${comment.workout_type}/${comment.workout_id}`}
                          className="hover:underline font-semibold"
                          onClick={() => setShowCommentsModal(false)}
                        >
                          {comment.workout_name}
                        </Link>
                      </>
                    ) : (
                      <>
                        Program:{" "}
                        <Link
                          to={`/trainingprogram/${comment.program_type}/${comment.program_id}`}
                          className="hover:underline font-semibold"
                          onClick={() => setShowCommentsModal(false)}
                        >
                          {comment.program_name}
                        </Link>
                      </>
                    )}
                  </p>
                  <p className="text-xs md:text-sm leading-relaxed">{comment.comment_text}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Community;
