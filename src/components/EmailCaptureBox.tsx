import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const EmailCaptureBox = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email) {
      toast({
        title: "Missing fields",
        description: "Please enter both name and email",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('subscribe-newsletter', {
        body: { name, email }
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "You've joined the SmartyGym newsletter. Check your inbox!",
      });
      
      // Redirect to thank you page
      setTimeout(() => {
        window.location.href = "/newsletter-thank-you";
      }, 1500);
      
      setName("");
      setEmail("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-primary/5 border-primary/20">
      <h3 className="font-semibold text-lg mb-2">Get one new workout every week — free!</h3>
      <p className="text-sm text-muted-foreground mb-4">
        We respect your time — no spam, only smart training.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <Input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1"
        />
        <Input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Joining..." : "Join Now"}
        </Button>
      </form>
    </Card>
  );
};
