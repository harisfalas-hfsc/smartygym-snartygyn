import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, MessageSquare, Calendar, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface LeaderboardEntry {
  user_id: string;
  full_name: string | null;
  nickname: string | null;
  total_completions: number;
}

interface Comment {
  id: string;
  user_id: string;
  workout_name: string | null;
  program_name: string | null;
  comment_text: string;
  created_at: string;
  profiles: {
    full_name: string | null;
    nickname: string | null;
  } | null;
}

const Community = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
    fetchComments();
  }, []);

  const fetchLeaderboard = async () => {
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

      // Combine and count completions per user
      const allCompletions = [
        ...(workoutData || []),
        ...(programData || []),
      ];

      const completionCounts: { [key: string]: number } = {};
      allCompletions.forEach((item) => {
        completionCounts[item.user_id] = (completionCounts[item.user_id] || 0) + 1;
      });

      // Get user profiles for top users
      const topUserIds = Object.entries(completionCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 20)
        .map(([userId]) => userId);

      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, full_name, nickname")
        .in("user_id", topUserIds);

      if (profilesError) throw profilesError;

      // Combine data
      const leaderboardData: LeaderboardEntry[] = topUserIds.map((userId) => {
        const profile = profilesData?.find((p) => p.user_id === userId);
        return {
          user_id: userId,
          full_name: profile?.full_name || null,
          nickname: profile?.nickname || null,
          total_completions: completionCounts[userId] || 0,
        };
      });

      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setIsLoadingLeaderboard(false);
    }
  };

  const fetchComments = async () => {
    try {
      const { data: commentsData, error: commentsError } = await supabase
        .from("workout_comments")
        .select("id, user_id, workout_name, program_name, comment_text, created_at")
        .order("created_at", { ascending: false })
        .limit(50);

      if (commentsError) throw commentsError;

      // Fetch profiles for comment authors
      const userIds = [...new Set(commentsData?.map((c) => c.user_id) || [])];
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, full_name, nickname")
        .in("user_id", userIds);

      if (profilesError) throw profilesError;

      // Combine comments with profiles
      const commentsWithProfiles = commentsData?.map((comment) => ({
        ...comment,
        profiles: profilesData?.find((p) => p.user_id === comment.user_id) || null,
      }));

      setComments(commentsWithProfiles || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const getDisplayName = (entry: { full_name?: string | null; nickname?: string | null }) => {
    return entry.nickname || entry.full_name || "Anonymous User";
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
        <title>Community | Smarty Gym</title>
        <meta
          name="description"
          content="Join the Smarty Gym community! View the leaderboard of top performers and read reviews from premium members."
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Community</h1>
            <p className="text-muted-foreground">
              Join our community of fitness enthusiasts
            </p>
          </div>

          {/* Leaderboard Section */}
          <Card className="mb-8 border-2 border-primary/30 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Trophy className="h-6 w-6 text-primary" />
                Leaderboard - Top Performers
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Members with the most completed workouts and training programs
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoadingLeaderboard ? (
                <div className="space-y-3">
                  {[...Array(10)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Trophy className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p>No completions yet. Be the first to complete a workout!</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-primary/30">
                        <TableHead className="w-16">Rank</TableHead>
                        <TableHead>Member</TableHead>
                        <TableHead className="text-right">Completions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaderboard.map((entry, index) => (
                        <TableRow
                          key={entry.user_id}
                          className="border-primary/20 hover:bg-primary/5"
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <span>{getMedalIcon(index) || `#${index + 1}`}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {getDisplayName(entry)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold">
                              {entry.total_completions}
                            </span>
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
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <MessageSquare className="h-6 w-6 text-primary" />
                Community Comments
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Reviews and feedback from premium members
              </p>
            </CardHeader>
            <CardContent className="pt-6">
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
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="p-4 rounded-lg border-2 border-primary/20 bg-gradient-to-r from-background to-primary/5 hover:border-primary/40 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-primary" />
                          <span className="font-semibold text-sm">
                            {getDisplayName(comment.profiles || {})}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDistanceToNow(new Date(comment.created_at), {
                            addSuffix: true,
                          })}
                        </div>
                      </div>
                      <p className="text-xs text-primary font-medium mb-2">
                        {comment.workout_name
                          ? `Workout: ${comment.workout_name}`
                          : `Program: ${comment.program_name}`}
                      </p>
                      <p className="text-sm leading-relaxed">{comment.comment_text}</p>
                    </div>
                  ))}
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
