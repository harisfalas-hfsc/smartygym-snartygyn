import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageBreadcrumbs } from "@/components/PageBreadcrumbs";
import { InfoRibbon } from "@/components/InfoRibbon";
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
import { Trophy, MessageSquare, Star, User, ArrowUpDown, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { CompactFilters } from "@/components/CompactFilters";
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
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";

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
  const [workoutLeaderboard, setWorkoutLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [programLeaderboard, setProgramLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [ratedContent, setRatedContent] = useState<RatedContent[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(true);
  const [isLoadingRatings, setIsLoadingRatings] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [leaderboardFilter, setLeaderboardFilter] = useState<"workouts" | "programs">("workouts");
  const [ratingsFilter, setRatingsFilter] = useState<"workouts" | "programs">("workouts");
  const [commentsFilter, setCommentsFilter] = useState<"all" | "workouts" | "programs">("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  
  // Pagination state
  const [leaderboardPage, setLeaderboardPage] = useState(1);
  const [ratingsPage, setRatingsPage] = useState(1);
  const [commentsPage, setCommentsPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  
  // Sorting state
  const [leaderboardSort, setLeaderboardSort] = useState<"completions-desc" | "completions-asc" | "name-asc" | "name-desc">("completions-desc");
  const [ratingsSort, setRatingsSort] = useState<"rating-desc" | "rating-asc" | "reviews-desc" | "name-asc">("rating-desc");

  // Reset pagination when filters/sort change
  useEffect(() => {
    setLeaderboardPage(1);
  }, [leaderboardFilter, leaderboardSort]);

  useEffect(() => {
    setRatingsPage(1);
  }, [ratingsFilter, ratingsSort]);

  useEffect(() => {
    setCommentsPage(1);
  }, [commentsFilter, sortOrder]);

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

      // Get user profiles
      const allUserIds = [...new Set([...Object.keys(workoutCounts), ...Object.keys(programCounts)])];
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

      // Combine comments with display names (real only)
      const commentsWithNames = commentsData?.map((comment) => {
        const profile = profilesData?.find((p) => p.user_id === comment.user_id);
        return {
          ...comment,
          display_name: profile?.full_name || "Anonymous User",
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
    return null;
  };

  // Sorting and pagination logic for leaderboard
  const getSortedLeaderboard = () => {
    const data = leaderboardFilter === "workouts" ? workoutLeaderboard : programLeaderboard;
    const sorted = [...data];
    
    switch (leaderboardSort) {
      case "completions-desc":
        sorted.sort((a, b) => b.total_completions - a.total_completions);
        break;
      case "completions-asc":
        sorted.sort((a, b) => a.total_completions - b.total_completions);
        break;
      case "name-asc":
        sorted.sort((a, b) => a.display_name.localeCompare(b.display_name));
        break;
      case "name-desc":
        sorted.sort((a, b) => b.display_name.localeCompare(a.display_name));
        break;
    }
    
    return sorted;
  };

  const getPaginatedLeaderboard = () => {
    const sorted = getSortedLeaderboard();
    const start = (leaderboardPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return sorted.slice(start, end);
  };

  const leaderboardTotalPages = Math.ceil(getSortedLeaderboard().length / ITEMS_PER_PAGE);

  // Sorting and pagination logic for ratings
  const getSortedRatings = () => {
    const data = ratedContent.filter(item => item.content_type === (ratingsFilter === "workouts" ? "workout" : "program"));
    const sorted = [...data];
    
    switch (ratingsSort) {
      case "rating-desc":
        sorted.sort((a, b) => {
          if (b.average_rating !== a.average_rating) {
            return b.average_rating - a.average_rating;
          }
          return b.rating_count - a.rating_count;
        });
        break;
      case "rating-asc":
        sorted.sort((a, b) => a.average_rating - b.average_rating);
        break;
      case "reviews-desc":
        sorted.sort((a, b) => b.rating_count - a.rating_count);
        break;
      case "name-asc":
        sorted.sort((a, b) => a.content_name.localeCompare(b.content_name));
        break;
    }
    
    return sorted;
  };

  const getPaginatedRatings = () => {
    const sorted = getSortedRatings();
    const start = (ratingsPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return sorted.slice(start, end);
  };

  const ratingsTotalPages = Math.ceil(getSortedRatings().length / ITEMS_PER_PAGE);

  // Pagination logic for comments
  const getPaginatedComments = () => {
    const start = (commentsPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return comments.slice(start, end);
  };

  const commentsTotalPages = Math.ceil(comments.length / ITEMS_PER_PAGE);

  return (
    <>
      <Helmet>
        <title>Fitness Community Cyprus | SmartyGym Leaderboard & Member Reviews | Online Gym</title>
        <meta
          name="description"
          content="Join Cyprus' #1 online gym community at smartygym.com! View online fitness leaderboards, workout rankings, training program achievements & premium member reviews. Connect with Haris Falas & fellow fitness enthusiasts."
        />
        <meta name="keywords" content="online gym community Cyprus, fitness community Cyprus, workout leaderboard, training rankings, gym reviews Cyprus, online fitness community, smartygym community, SmartyGym members, Cyprus gym community, fitness motivation Cyprus, workout achievements, training community online, gym leaderboard Cyprus, fitness reviews Cyprus, Haris Falas community" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          
          <PageBreadcrumbs 
            items={[
              { label: "Home", href: "/" },
              { label: "Community" }
            ]} 
          />

          {/* Unified Leaderboard Section */}
          <Card 
            itemScope
            itemType="https://schema.org/ItemList"
            className="mb-6 md:mb-8 border-2 border-primary/30 shadow-lg"
            data-keywords="smarty gym community, online gym leaderboard, online fitness community, smartygym.com, Haris Falas Cyprus"
            aria-label="Community Leaderboard - SmartyGym Cyprus online fitness community - smartygym.com"
          >
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 md:p-6">
              <CardTitle 
                className="flex items-center gap-2 text-xl md:text-2xl mb-4"
                itemProp="name"
              >
                <Trophy className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                Community Leaderboard
              </CardTitle>
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <div className="flex-1">
                  <CompactFilters
                    filters={[
                      {
                        name: "Type",
                        value: leaderboardFilter,
                        onChange: (value) => setLeaderboardFilter(value as "workouts" | "programs"),
                        options: [
                          { value: "workouts", label: "Workouts" },
                          { value: "programs", label: "Training Programs" }
                        ],
                        placeholder: "Select type"
                      }
                    ]}
                  />
                </div>
                <div className="w-full sm:w-auto">
                  <Select value={leaderboardSort} onValueChange={(value: any) => setLeaderboardSort(value)}>
                    <SelectTrigger className="w-full sm:w-[200px] bg-background/80 border-primary/30 hover:border-primary/50">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-primary/30">
                      <SelectItem value="completions-desc">Most Completions</SelectItem>
                      <SelectItem value="completions-asc">Least Completions</SelectItem>
                      <SelectItem value="name-asc">Name A-Z</SelectItem>
                      <SelectItem value="name-desc">Name Z-A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:pt-6">
              {isLoadingLeaderboard ? (
                <div className="space-y-3">
                  {[...Array(10)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (leaderboardFilter === "workouts" ? workoutLeaderboard : programLeaderboard).length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Trophy className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium mb-2">
                    No completions yet
                  </p>
                  <p className="text-sm">
                    {leaderboardFilter === "workouts" 
                      ? "Start your fitness journey today and be the first on the leaderboard!"
                      : "Complete a training program and see your name here!"
                    }
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[400px] md:h-[500px] pr-2 md:pr-4">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-primary/30">
                          <TableHead className="w-12 md:w-16 text-xs md:text-sm">Rank</TableHead>
                          <TableHead className="text-xs md:text-sm">Member</TableHead>
                          <TableHead className="text-right text-xs md:text-sm">Completions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getPaginatedLeaderboard().map((entry, index) => {
                          const actualIndex = (leaderboardPage - 1) * ITEMS_PER_PAGE + index;
                          return (
                            <TableRow
                              key={entry.user_id}
                              className="border-primary/20 hover:bg-primary/5"
                            >
                              <TableCell className="font-medium text-xs md:text-sm py-2 md:py-3">
                                <div className="flex items-center gap-1 md:gap-2">
                                  <span className="text-base md:text-lg">{getMedalIcon(actualIndex) || `#${actualIndex + 1}`}</span>
                                </div>
                              </TableCell>
                              <TableCell className="py-2 md:py-3">
                                <div className="flex items-center gap-1 md:gap-2">
                                  <User className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground flex-shrink-0" />
                                  <span className="font-medium text-xs md:text-sm truncate">{entry.display_name}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right py-2 md:py-3">
                                <span className="inline-flex items-center gap-1 px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-primary/10 text-primary font-semibold text-xs md:text-sm whitespace-nowrap">
                                  {entry.total_completions}
                                </span>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </ScrollArea>
              )}
              {!isLoadingLeaderboard && getSortedLeaderboard().length > 0 && (
                <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-primary/20 pt-4">
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Showing {Math.min((leaderboardPage - 1) * ITEMS_PER_PAGE + 1, getSortedLeaderboard().length)}-{Math.min(leaderboardPage * ITEMS_PER_PAGE, getSortedLeaderboard().length)} of {getSortedLeaderboard().length}
                  </p>
                  {leaderboardTotalPages > 1 && (
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => setLeaderboardPage(p => Math.max(1, p - 1))}
                            className={leaderboardPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                        {[...Array(leaderboardTotalPages)].map((_, i) => (
                          <PaginationItem key={i}>
                            <PaginationLink
                              onClick={() => setLeaderboardPage(i + 1)}
                              isActive={leaderboardPage === i + 1}
                              className="cursor-pointer"
                            >
                              {i + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => setLeaderboardPage(p => Math.min(leaderboardTotalPages, p + 1))}
                            className={leaderboardPage === leaderboardTotalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
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
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <div className="flex-1">
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
                </div>
                <div className="w-full sm:w-auto">
                  <Select value={ratingsSort} onValueChange={(value: any) => setRatingsSort(value)}>
                    <SelectTrigger className="w-full sm:w-[200px] bg-background/80 border-primary/30 hover:border-primary/50">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-primary/30">
                      <SelectItem value="rating-desc">Highest Rated</SelectItem>
                      <SelectItem value="rating-asc">Lowest Rated</SelectItem>
                      <SelectItem value="reviews-desc">Most Reviews</SelectItem>
                      <SelectItem value="name-asc">Name A-Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:pt-6">
              {isLoadingRatings ? (
                <div className="space-y-3">
                  {[...Array(10)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : ratedContent.filter(item => item.content_type === (ratingsFilter === "workouts" ? "workout" : "program")).length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Star className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium mb-2">
                    No ratings yet
                  </p>
                  <p className="text-sm">
                    Be the first to rate a {ratingsFilter === "workouts" ? "workout" : "training program"}!
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[400px] md:h-[500px] pr-2 md:pr-4">
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
                        {getPaginatedRatings().map((item, index) => {
                          const actualIndex = (ratingsPage - 1) * ITEMS_PER_PAGE + index;
                          return (
                            <TableRow
                              key={item.content_id}
                              className="border-primary/20 hover:bg-primary/5"
                            >
                              <TableCell className="font-medium text-xs md:text-sm py-2 md:py-3">
                                <div className="flex items-center gap-1 md:gap-2">
                                  <span className="text-base md:text-lg">{getMedalIcon(actualIndex) || `#${actualIndex + 1}`}</span>
                                </div>
                              </TableCell>
                              <TableCell className="py-2 md:py-3">
                                <Link 
                                  to={item.content_type === "workout" 
                                    ? `/workout/${item.workout_type}/${item.content_id}`
                                    : `/training-programs/${item.program_type}/${item.content_id}`
                                  }
                                  className="font-medium text-xs md:text-sm truncate text-primary hover:underline"
                                >
                                  {item.content_name}
                                </Link>
                              </TableCell>
                              <TableCell className="text-center py-2 md:py-3">
                                <div className="flex items-center justify-center gap-1">
                                  <Star className="h-3 w-3 md:h-4 md:w-4 fill-primary text-primary" />
                                  <span className="font-semibold text-xs md:text-sm">{item.average_rating.toFixed(1)}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right py-2 md:py-3">
                                <span className="inline-flex items-center gap-1 px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-primary/10 text-primary font-semibold text-xs md:text-sm whitespace-nowrap">
                                  {item.rating_count}
                                </span>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </ScrollArea>
              )}
              {!isLoadingRatings && getSortedRatings().length > 0 && (
                <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-primary/20 pt-4">
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Showing {Math.min((ratingsPage - 1) * ITEMS_PER_PAGE + 1, getSortedRatings().length)}-{Math.min(ratingsPage * ITEMS_PER_PAGE, getSortedRatings().length)} of {getSortedRatings().length}
                  </p>
                  {ratingsTotalPages > 1 && (
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => setRatingsPage(p => Math.max(1, p - 1))}
                            className={ratingsPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                        {[...Array(ratingsTotalPages)].map((_, i) => (
                          <PaginationItem key={i}>
                            <PaginationLink
                              onClick={() => setRatingsPage(i + 1)}
                              isActive={ratingsPage === i + 1}
                              className="cursor-pointer"
                            >
                              {i + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => setRatingsPage(p => Math.min(ratingsTotalPages, p + 1))}
                            className={ratingsPage === ratingsTotalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card className="border-2 border-primary/30 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
                  <MessageSquare className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                  Community Comments
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
                  className="flex items-center gap-2 text-xs md:text-sm"
                >
                  <ArrowUpDown className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="whitespace-nowrap hidden sm:inline">{sortOrder === "newest" ? "Newest First" : "Oldest First"}</span>
                </Button>
              </div>
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
                  }
                ]}
              />
            </CardHeader>
            <CardContent className="p-4 md:pt-6">
              {isLoadingComments ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
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
                <ScrollArea className="h-[630px] md:h-[700px] pr-2 md:pr-4">
                  <div className="space-y-3 md:space-y-4">
                    {getPaginatedComments().map((comment) => (
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
                                to={`/training-programs/${comment.program_type}/${comment.program_id}`}
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
                </ScrollArea>
              )}
              {!isLoadingComments && comments.length > 0 && (
                <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-primary/20 pt-4">
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Showing {Math.min((commentsPage - 1) * ITEMS_PER_PAGE + 1, comments.length)}-{Math.min(commentsPage * ITEMS_PER_PAGE, comments.length)} of {comments.length}
                  </p>
                  {commentsTotalPages > 1 && (
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => setCommentsPage(p => Math.max(1, p - 1))}
                            className={commentsPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                        {[...Array(commentsTotalPages)].map((_, i) => (
                          <PaginationItem key={i}>
                            <PaginationLink
                              onClick={() => setCommentsPage(i + 1)}
                              isActive={commentsPage === i + 1}
                              className="cursor-pointer"
                            >
                              {i + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => setCommentsPage(p => Math.min(commentsTotalPages, p + 1))}
                            className={commentsPage === commentsTotalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Community;
