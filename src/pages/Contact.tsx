import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PageTitleCard } from "@/components/PageTitleCard";
import { ArrowLeft, Mail, MessageSquare, Send, MapPin, Phone, Lock } from "lucide-react";
import { BackToTop } from "@/components/BackToTop";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useShowBackButton } from "@/hooks/useShowBackButton";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const contactSchema = z.object({
  name: z.string().trim().min(1, { message: "Name is required" }).max(100, { message: "Name must be less than 100 characters" }),
  email: z.string().trim().email({ message: "Invalid email address" }).max(255, { message: "Email must be less than 255 characters" }),
  subject: z.string().trim().min(1, { message: "Subject is required" }).max(200, { message: "Subject must be less than 200 characters" }),
  message: z.string().trim().min(1, { message: "Message is required" }).max(2000, { message: "Message must be less than 2000 characters" })
});

const Contact = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { canGoBack, goBack } = useShowBackButton();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [coachFormData, setCoachFormData] = useState({
    subject: "",
    message: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [coachErrors, setCoachErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCoachSubmitting, setIsCoachSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [userProfile, setUserProfile] = useState<{ full_name: string; } | null>(null);

  // Check authentication and subscription status
  useEffect(() => {
    const checkAuthAndSubscription = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setIsAuthenticated(true);
        
        // Get user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', session.user.id)
          .single();
        
        if (profile) {
          setUserProfile(profile);
          // Auto-fill form data
          setFormData(prev => ({
            ...prev,
            name: profile.full_name || "",
            email: session.user.email || ""
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            email: session.user.email || ""
          }));
        }
        
        // Check subscription
        try {
          const { data: subscriptionData } = await supabase.functions.invoke('check-subscription');
          if (subscriptionData?.subscribed) {
            setHasSubscription(true);
          }
        } catch (error) {
          console.error('Error checking subscription:', error);
        }
      }
    };

    checkAuthAndSubscription();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAuthAndSubscription();
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    try {
      const validatedData = contactSchema.parse(formData);
      setIsSubmitting(true);

      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();

      // Save to database instead of sending email
      const { error } = await supabase
        .from('contact_messages')
        .insert([{
          user_id: session?.user?.id || null,
          name: validatedData.name,
          email: validatedData.email,
          subject: validatedData.subject,
          message: validatedData.message,
          category: 'general',
          status: 'new'
        }]);

      if (error) throw error;

      toast({
        title: "Message sent!",
        description: "We'll get back to you as soon as possible.",
      });

      // Reset form, but keep auto-filled data if logged in
      if (isAuthenticated) {
        setFormData(prev => ({ 
          ...prev,
          subject: "",
          message: ""
        }));
      } else {
        setFormData({ name: "", email: "", subject: "", message: "" });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            fieldErrors[err.path[0]] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCoachSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCoachErrors({});
    
    if (!isAuthenticated || !hasSubscription) {
      toast({
        title: "Access Denied",
        description: "You need an active subscription to contact the coach directly.",
        variant: "destructive",
      });
      return;
    }
    
    const coachSchema = z.object({
      subject: z.string().trim().min(1, { message: "Subject is required" }).max(200),
      message: z.string().trim().min(1, { message: "Message is required" }).max(2000)
    });
    
    try {
      const validatedData = coachSchema.parse(coachFormData);
      setIsCoachSubmitting(true);

      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();

      // Save to database instead of sending email
      const { error } = await supabase
        .from('contact_messages')
        .insert([{
          user_id: session?.user?.id || null,
          name: formData.name,
          email: formData.email,
          subject: validatedData.subject,
          message: validatedData.message,
          category: 'coach_direct',
          status: 'new'
        }]);

      if (error) throw error;

      toast({
        title: "Message sent to coach!",
        description: "Haris will get back to you soon.",
      });

      setCoachFormData({ subject: "", message: "" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            fieldErrors[err.path[0]] = err.message;
          }
        });
        setCoachErrors(fieldErrors);
      } else {
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsCoachSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleCoachChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCoachFormData(prev => ({ ...prev, [name]: value }));
    if (coachErrors[name]) {
      setCoachErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact Us - Smarty Gym Cyprus | Get in Touch with Haris Falas | smartygym.com</title>
        <meta name="description" content="Contact Smarty Gym Cyprus - Get expert fitness advice from Sports Scientist Haris Falas. Convenient & flexible online training support. Reach us at smartygym.com" />
        <meta name="keywords" content="contact Smarty Gym, Haris Falas Cyprus contact, fitness coach Cyprus, personal training Cyprus, online gym support, smartygym contact, Cyprus fitness expert, sports scientist Cyprus, training inquiry Cyprus, gym Reimagined, convenient fitness, flexible online gym" />
        
        <meta property="og:title" content="Contact Smarty Gym Cyprus | Haris Falas" />
        <meta property="og:description" content="Get in touch with Sports Scientist Haris Falas at Smarty Gym Cyprus for expert fitness guidance and personalized training support" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://smartygym.com/contact" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Contact Smarty Gym Cyprus" />
        <meta name="twitter:description" content="Reach out to Haris Falas for expert fitness coaching at smartygym.com" />
        
        <link rel="canonical" href="https://smartygym.com/contact" />
        
        {/* Structured Data - ContactPage & LocalBusiness */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "name": "Contact Smarty Gym",
            "description": "Get in touch with Haris Falas and the Smarty Gym team for Cyprus online fitness support and training inquiries",
            "url": "https://smartygym.com/contact",
            "mainEntity": {
              "@type": "LocalBusiness",
              "name": "Smarty Gym",
              "url": "https://smartygym.com",
              "email": "admin@smartygym.com",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "CY"
              },
              "founder": {
                "@type": "Person",
                "name": "Haris Falas",
                "jobTitle": "Sports Scientist & Strength and Conditioning Coach"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "Customer Service",
                "availableLanguage": ["en", "el"]
              }
            }
          })}
        </script>
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <BackToTop />
        <div className="container mx-auto max-w-6xl px-4 py-8">
          {canGoBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={goBack}
              className="mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}

          {/* Hero Section */}
          <PageTitleCard title="Contact" icon={Mail} />
          <header className="text-center mb-8">
            <p className="text-center text-muted-foreground mb-4">
              Have questions? Need support? Want to discuss your fitness goals?
            </p>
            
            {/* Info Ribbon */}
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-8 text-center max-w-3xl mx-auto">
              <p className="text-sm text-muted-foreground">
                Get in touch with <a href="/coach-profile" className="text-primary hover:underline font-medium"><strong>Haris Falas</strong></a> and the Smarty Gym team
              </p>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Send Us a Message</CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll get back to you within 24 hours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                     <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your full name"
                        className={errors.name ? "border-destructive" : ""}
                        disabled={isAuthenticated}
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive">{errors.name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your.email@example.com"
                        className={errors.email ? "border-destructive" : ""}
                        disabled={isAuthenticated}
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">{errors.email}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="What is this about?"
                        className={errors.subject ? "border-destructive" : ""}
                      />
                      {errors.subject && (
                        <p className="text-sm text-destructive">{errors.subject}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us how we can help you..."
                        rows={6}
                        className={errors.message ? "border-destructive" : ""}
                      />
                      {errors.message && (
                        <p className="text-sm text-destructive">{errors.message}</p>
                      )}
                    </div>

                    <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                      <Send className="w-4 h-4 mr-2" />
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Email Us</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    For general inquiries and support
                  </p>
                  <a href="mailto:admin@smartygym.com" className="text-primary hover:underline font-semibold">
                    admin@smartygym.com
                  </a>
                  <p className="text-xs text-muted-foreground mt-2">
                    Direct contact with <a href="/coach-profile" className="text-primary hover:underline font-medium"><strong>Haris Falas</strong></a> and the team
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-primary/5 to-accent/10 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    Direct Access to Your Coach
                    {!hasSubscription && <Lock className="h-4 w-4" />}
                  </CardTitle>
                  <CardDescription>
                    {hasSubscription 
                      ? "Send a message directly to Haris Falas"
                      : "Available for Premium members only"
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {hasSubscription ? (
                    <form onSubmit={handleCoachSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="coach-subject">Subject *</Label>
                        <Input
                          id="coach-subject"
                          name="subject"
                          value={coachFormData.subject}
                          onChange={handleCoachChange}
                          placeholder="What is this about?"
                          className={coachErrors.subject ? "border-destructive" : ""}
                        />
                        {coachErrors.subject && (
                          <p className="text-sm text-destructive">{coachErrors.subject}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="coach-message">Message *</Label>
                        <Textarea
                          id="coach-message"
                          name="message"
                          value={coachFormData.message}
                          onChange={handleCoachChange}
                          placeholder="Tell Haris how he can help you..."
                          rows={4}
                          className={coachErrors.message ? "border-destructive" : ""}
                        />
                        {coachErrors.message && (
                          <p className="text-sm text-destructive">{coachErrors.message}</p>
                        )}
                      </div>

                      <Button type="submit" className="w-full" disabled={isCoachSubmitting}>
                        <Send className="w-4 h-4 mr-2" />
                        {isCoachSubmitting ? "Sending..." : "Contact Haris"}
                      </Button>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        As a Premium member, you can reach out directly to <a href="/coach-profile" className="text-primary hover:underline font-medium"><strong>Haris Falas</strong></a>. 
                        No robots, no automated responses — just real human support when you need it.
                      </p>
                      <Button 
                        onClick={() => navigate("/premiumbenefits")} 
                        className="w-full"
                        variant="default"
                      >
                        Upgrade to Premium
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Response Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    We typically respond within 24 hours during business days. Premium members receive priority support.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* FAQ Quick Links */}
          <section className="mt-12">
            <Card>
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Looking for Quick Answers?</h2>
                <p className="text-muted-foreground mb-6">
                  Check out our About page for frequently asked questions
                </p>
                <Button variant="outline" onClick={() => navigate("/about")}>
                  View FAQ
                </Button>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </>
  );
};

export default Contact;
