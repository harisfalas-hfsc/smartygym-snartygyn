import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
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
import { Trophy, MessageSquare, Calendar, User, ArrowUpDown, Dumbbell, Target, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  total_completions: number;
}

interface Comment {
  id: string;
  user_id: string;
  workout_name: string | null;
  program_name: string | null;
  comment_text: string;
  created_at: string;
  display_name: string;
}


const Community = () => {
  const [workoutLeaderboard, setWorkoutLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [programLeaderboard, setProgramLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  useEffect(() => {
    fetchLeaderboards();
  }, []);

  useEffect(() => {
    fetchComments();
  }, [sortOrder]);

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
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", allUserIds);

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

  const fetchComments = async () => {
    try {
      const { data: commentsData, error: commentsError } = await supabase
        .from("workout_comments")
        .select("id, user_id, workout_name, program_name, comment_text, created_at")
        .order("created_at", { ascending: sortOrder === "oldest" })
        .limit(50);

      if (commentsError) throw commentsError;

      // Fetch profiles for comment authors
      const userIds = [...new Set(commentsData?.map((c) => c.user_id) || [])];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);

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

          {/* Workout Leaderboard Section */}
          <Card 
            itemScope
            itemType="https://schema.org/ItemList"
            className="mb-6 md:mb-8 border-2 border-primary/30 shadow-lg"
            data-leaderboard-type="workouts"
            data-keywords="smarty gym community, online gym leaderboard, online fitness community, smartygym.com, Haris Falas Cyprus"
            aria-label="Workout leaderboard - SmartyGym Cyprus online fitness community - smartygym.com"
          >
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 md:p-6">
              <CardTitle 
                className="flex items-center gap-2 text-xl md:text-2xl"
                itemProp="name"
              >
                <Dumbbell className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                Workout Leaderboard - SmartyGym Community
              </CardTitle>
              <p 
                className="text-xs md:text-sm text-muted-foreground"
                itemProp="description"
              >
                Top members by completed workouts - Online gym community at smartygym.com
              </p>
              <meta itemProp="provider" content="SmartyGym Cyprus - smartygym.com - Haris Falas" />
            </CardHeader>
            <CardContent className="p-4 md:pt-6">
              {isLoadingLeaderboard ? (
                <div className="space-y-3">
                  {[...Array(10)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : workoutLeaderboard.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Trophy className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium mb-2">
                    No completions yet
                  </p>
                  <p className="text-sm">
                    Start your fitness journey today and be the first on the leaderboard!
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
                        {workoutLeaderboard.map((entry, index) => (
                          <TableRow
                            key={entry.user_id}
                            className="border-primary/20 hover:bg-primary/5"
                          >
                            <TableCell className="font-medium text-xs md:text-sm py-2 md:py-3">
                              <div className="flex items-center gap-1 md:gap-2">
                                <span className="text-base md:text-lg">{getMedalIcon(index) || `#${index + 1}`}</span>
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
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Program Leaderboard Section */}
          <Card className="mb-6 md:mb-8 border-2 border-primary/30 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 md:p-6">
              <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
                <Target className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                Training Program Leaderboard
              </CardTitle>
              <p className="text-xs md:text-sm text-muted-foreground">
                Top members by completed training programs
              </p>
            </CardHeader>
            <CardContent className="p-4 md:pt-6">
              {isLoadingLeaderboard ? (
                <div className="space-y-3">
                  {[...Array(10)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : programLeaderboard.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium mb-2">
                    No program completions yet
                  </p>
                  <p className="text-sm">
                    Complete a training program and see your name here!
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
                        {programLeaderboard.map((entry, index) => (
                          <TableRow
                            key={entry.user_id}
                            className="border-primary/20 hover:bg-primary/5"
                          >
                            <TableCell className="font-medium text-xs md:text-sm py-2 md:py-3">
                              <div className="flex items-center gap-1 md:gap-2">
                                <span className="text-base md:text-lg">{getMedalIcon(index) || `#${index + 1}`}</span>
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
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card className="border-2 border-primary/30 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 md:p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
                    <MessageSquare className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                    Community Comments
                  </CardTitle>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">
                    Reviews and feedback from premium members
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
                  className="flex items-center gap-2 text-xs md:text-sm w-full md:w-auto"
                >
                  <ArrowUpDown className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="whitespace-nowrap">{sortOrder === "newest" ? "Newest First" : "Oldest First"}</span>
                </Button>
              </div>
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
                <ScrollArea className="h-[500px] md:h-[600px] pr-2 md:pr-4">
                  <div className="space-y-3 md:space-y-4">
                    {comments.map((comment) => (
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
                          {comment.workout_name
                            ? `Workout: ${comment.workout_name}`
                            : `Program: ${comment.program_name}`}
                        </p>
                        <p className="text-xs md:text-sm leading-relaxed">{comment.comment_text}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Community;
