import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Send, Users, MessageCircle, Instagram, Facebook } from "lucide-react";
import smartyGymLogo from "@/assets/smarty-gym-logo.png";
import { DirectMessaging } from "@/components/DirectMessaging";
import { SubscribedMembers } from "@/components/SubscribedMembers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Message {
  id: string;
  user_id: string;
  user_name: string;
  message: string;
  created_at: string;
}

export default function Community() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showDirectMessage, setShowDirectMessage] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<{
    id: string;
    name: string;
    avatar?: string;
  } | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setUser(session.user);
    };
    checkAuth();

    fetchMessages();

    const channel = supabase
      .channel('community_messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_messages'
        },
        (payload) => {
          console.log('Realtime update:', payload);
          if (payload.eventType === 'INSERT') {
            setMessages((prev) => [...prev, payload.new as Message]);
          } else if (payload.eventType === 'DELETE') {
            setMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('community_messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(100);

    if (error) {
      console.error('Error fetching messages:', error);
    } else if (data) {
      setMessages(data);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !user) return;

    setLoading(true);
    try {
      const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
      
      const { error } = await supabase
        .from('community_messages')
        .insert({
          user_id: user.id,
          user_name: userName,
          message: newMessage.trim(),
        });

      if (error) throw error;

      setNewMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const handleMessageUser = (userId: string, userName: string, avatarUrl?: string) => {
    setSelectedRecipient({
      id: userId,
      name: userName,
      avatar: avatarUrl,
    });
    setShowDirectMessage(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {showDirectMessage && selectedRecipient && user && (
        <DirectMessaging
          currentUser={user}
          recipientId={selectedRecipient.id}
          recipientName={selectedRecipient.name}
          recipientAvatar={selectedRecipient.avatar}
          onClose={() => {
            setShowDirectMessage(false);
            setSelectedRecipient(null);
          }}
        />
      )}

      {/* Header */}
      <header className="border-b border-border py-3 sm:py-4 px-4 bg-card">
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-3">
            <div className="flex items-center gap-2 sm:gap-4">
              <img src={smartyGymLogo} alt="Smarty Gym" className="h-10 sm:h-12 w-auto" />
              <div>
                <h1 className="text-lg sm:text-2xl font-bold flex items-center gap-2">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  Community
                </h1>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")} className="flex-1 sm:flex-initial text-xs sm:text-sm">
                <ArrowLeft className="mr-1 sm:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
                <span className="sm:hidden">Back</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout} className="flex-1 sm:flex-initial text-xs sm:text-sm">
                Logout
              </Button>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <span className="text-sm text-muted-foreground">Follow us:</span>
            <a
              href="https://www.instagram.com/thesmartygym/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=61579302997368"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              href="https://www.tiktok.com/@thesmartygym?lang=en"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
              aria-label="TikTok"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto max-w-4xl p-4">
        <Tabs defaultValue="forum" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="forum">Forum</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
          </TabsList>

          <TabsContent value="forum" className="mt-4">
            <Card className="flex flex-col h-[600px]">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  Community Forum
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-0">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium text-muted-foreground">
                        No messages yet
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Be the first to share something!
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isCurrentUser = msg.user_id === user?.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              isCurrentUser
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <div className="flex items-baseline gap-2 mb-1">
                              <span className="font-semibold text-sm">
                                {isCurrentUser ? 'You' : msg.user_name}
                              </span>
                              <span className="text-xs opacity-70">
                                {formatTime(msg.created_at)}
                              </span>
                            </div>
                            <p className="text-sm break-words">{msg.message}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Share your thoughts..."
                      maxLength={500}
                      disabled={loading}
                    />
                    <Button type="submit" disabled={loading || !newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {newMessage.length}/500 characters
                  </p>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members" className="mt-4">
            <SubscribedMembers onMessageUser={handleMessageUser} />
          </TabsContent>

          <TabsContent value="social" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a href="https://www.instagram.com/thesmartygym/" target="_blank" rel="noopener noreferrer" className="group">
                <Card className="h-full transition-all hover:shadow-lg hover:scale-105 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10 border-pink-200 dark:border-pink-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                        <Instagram className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-lg font-bold">Instagram</div>
                        <div className="text-xs text-muted-foreground font-normal">@thesmartygym</div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Daily workout tips and motivation!
                    </p>
                    <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                      Follow
                    </Button>
                  </CardContent>
                </Card>
              </a>

              <a href="https://www.facebook.com/profile.php?id=61579302997368" target="_blank" rel="noopener noreferrer" className="group">
                <Card className="h-full transition-all hover:shadow-lg hover:scale-105 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-200 dark:border-blue-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-blue-600">
                        <Facebook className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-lg font-bold">Facebook</div>
                        <div className="text-xs text-muted-foreground font-normal">Smarty Gym</div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Join our fitness community!
                    </p>
                    <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                      Like
                    </Button>
                  </CardContent>
                </Card>
              </a>

              <a href="https://www.tiktok.com/@thesmartygym?lang=en" target="_blank" rel="noopener noreferrer" className="group">
                <Card className="h-full transition-all hover:shadow-lg hover:scale-105 bg-gradient-to-br from-gray-800/10 to-gray-900/10 border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-black dark:bg-white">
                        <svg className="h-5 w-5 text-white dark:text-black" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                        </svg>
                      </div>
                      <div>
                        <div className="text-lg font-bold">TikTok</div>
                        <div className="text-xs text-muted-foreground font-normal">@thesmartygym</div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Quick workout videos & challenges!
                    </p>
                    <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                      Follow
                    </Button>
                  </CardContent>
                </Card>
              </a>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
