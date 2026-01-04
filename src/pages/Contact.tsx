import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PageBreadcrumbs } from "@/components/PageBreadcrumbs";
import { InfoRibbon } from "@/components/InfoRibbon";
import { ArrowLeft, MessageSquare, Send, MapPin, Phone, Lock, MessageCircle, Paperclip, X, Crown } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useShowBackButton } from "@/hooks/useShowBackButton";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAccessControl } from "@/hooks/useAccessControl";
import { cn } from "@/lib/utils";
import { SEOEnhancer } from "@/components/SEOEnhancer";

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
  const [attachments, setAttachments] = useState<File[]>([]);
  const [coachAttachments, setCoachAttachments] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const { userTier } = useAccessControl();
  const isPremium = userTier === "premium";

  // WhatsApp functionality
  const phoneNumber = "+35796000620";
  const whatsappMessage = "Hi! I'm interested in SmartyGym services.";
  
  const handleWhatsAppClick = () => {
    const url = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(url, '_blank');
  };

  const uploadFiles = async (files: File[]) => {
    const uploadedUrls = [];
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('contact-files').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('contact-files').getPublicUrl(fileName);
      uploadedUrls.push({ name: file.name, url: publicUrl, size: file.size, type: file.type });
    }
    return uploadedUrls;
  };

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
      
      // Determine user_id - if not logged in, try to match email to existing user
      let userId = session?.user?.id || null;
      
      if (!userId && validatedData.email) {
        try {
          const { data: lookupResult } = await supabase.functions.invoke('lookup-user-by-email', {
            body: { email: validatedData.email }
          });
          
          if (lookupResult?.found && lookupResult?.user_id) {
            userId = lookupResult.user_id;
            console.log('Matched email to existing user:', userId);
          }
        } catch (lookupError) {
          console.error('Error looking up user by email:', lookupError);
          // Continue without user_id if lookup fails
        }
      }

      // Upload attachments if any
      let attachmentData: any[] = [];
      if (attachments.length > 0) {
        setUploadingFiles(true);
        try {
          attachmentData = await uploadFiles(attachments);
        } catch (error) {
          console.error('File upload error:', error);
          toast({
            title: "File Upload Error",
            description: "Some files couldn't be uploaded. Message will be sent without attachments.",
            variant: "destructive",
          });
        } finally {
          setUploadingFiles(false);
        }
      }

      // Save to database and get the message ID
      const { data: insertedMessage, error } = await supabase
        .from('contact_messages')
        .insert([{
          user_id: userId,
          name: validatedData.name,
          email: validatedData.email,
          subject: validatedData.subject,
          message: validatedData.message,
          category: 'general',
          status: 'new',
          attachments: attachmentData
        }])
        .select('id')
        .single();

      if (error) throw error;

      // Send auto-reply to customer AND forward to admin (with messageId for history logging)
      try {
        await supabase.functions.invoke('send-contact-email', {
          body: {
            messageId: insertedMessage?.id, // Pass message ID for history logging
            name: validatedData.name,
            email: validatedData.email,
            subject: validatedData.subject,
            message: validatedData.message,
            recipientEmail: 'harisfalas@gmail.com',
            userStatus: isAuthenticated 
              ? (hasSubscription ? 'Premium Subscriber' : 'Free Member')
              : 'Guest'
          }
        });
      } catch (emailError) {
        console.error('Email notification error:', emailError);
        // Don't fail the whole submission if email fails
      }

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
      setAttachments([]);
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

      // Upload attachments if any
      let attachmentData: any[] = [];
      if (coachAttachments.length > 0) {
        setUploadingFiles(true);
        try {
          attachmentData = await uploadFiles(coachAttachments);
        } catch (error) {
          console.error('File upload error:', error);
          toast({
            title: "File Upload Error",
            description: "Some files couldn't be uploaded. Message will be sent without attachments.",
            variant: "destructive",
          });
        } finally {
          setUploadingFiles(false);
        }
      }

      // Save to database and get the message ID
      const { data: insertedMessage, error } = await supabase
        .from('contact_messages')
        .insert([{
          user_id: session?.user?.id || null,
          name: formData.name,
          email: formData.email,
          subject: validatedData.subject,
          message: validatedData.message,
          category: 'coach_direct',
          status: 'new',
          attachments: attachmentData
        }])
        .select('id')
        .single();

      if (error) throw error;

      // Send auto-reply to customer AND forward to admin (with messageId for history logging)
      try {
        await supabase.functions.invoke('send-contact-email', {
          body: {
            messageId: insertedMessage?.id, // Pass message ID for history logging
            name: formData.name,
            email: formData.email,
            subject: validatedData.subject,
            message: validatedData.message,
            recipientEmail: 'harisfalas@gmail.com',
            userStatus: 'Premium Subscriber (Direct to Coach)'
          }
        });
      } catch (emailError) {
        console.error('Email notification error:', emailError);
        // Don't fail the whole submission if email fails
      }

      toast({
        title: "Message sent to coach!",
        description: "Haris will get back to you soon.",
      });

      setCoachFormData({ subject: "", message: "" });
      setCoachAttachments([]);
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
        <title>Contact SmartyGym | Haris Falas HFSC | Online Gym Personal Trainer</title>
        <meta name="description" content="Contact SmartyGym at smartygym.com. Reach Sports Scientist Haris Falas HFSC for online gym personal training, expert fitness advice, and support." />
        <meta name="keywords" content="contact SmartyGym, contact Haris Falas, online personal trainer contact, HFSC contact, online gym contact, Sports Scientist contact, fitness coach contact, online gym support, smartygym.com contact, HFSC Performance contact, training inquiry" />
        
        <meta property="og:title" content="Contact SmartyGym.com | Haris Falas" />
        <meta property="og:description" content="Get in touch with Sports Scientist Haris Falas at SmartyGym.com for expert fitness guidance and personalized training support" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://smartygym.com/contact" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Contact SmartyGym.com" />
        <meta name="twitter:description" content="Reach out to Haris Falas for expert fitness coaching at smartygym.com" />
        
        <link rel="canonical" href="https://smartygym.com/contact" />
        
        {/* Structured Data - ContactPage & LocalBusiness */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "name": "Contact SmartyGym",
            "description": "Get in touch with Haris Falas and the SmartyGym team for online fitness platform support and training inquiries",
            "url": "https://smartygym.com/contact",
            "mainEntity": {
              "@type": "LocalBusiness",
              "name": "SmartyGym",
              "url": "https://smartygym.com",
              "email": "admin@smartygym.com",
              "founder": {
                "@type": "Person",
                "name": "Haris Falas",
                "jobTitle": "Sports Scientist & Strength and Conditioning Coach"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "Customer Service",
                "availableLanguage": ["en"]
              }
            }
          })}
        </script>
      </Helmet>

      <SEOEnhancer
        entities={["Contact SmartyGym", "Customer Support", "Haris Falas Contact", "Help Desk"]}
        topics={["customer service", "contact form", "support inquiries", "coach communication"]}
        expertise={["customer support", "fitness inquiries", "platform assistance"]}
        contentType="Contact Page"
        aiSummary="Contact SmartyGym: Reach Sports Scientist Haris Falas for expert fitness guidance, support inquiries, and personalized training questions. Premium members get direct coach access."
        aiKeywords={["contact smartygym", "haris falas contact", "fitness support", "gym inquiries", "coach contact", "customer service"]}
        relatedContent={["Coach Profile", "FAQ", "About", "Personal Training"]}
        targetAudience="users seeking support or information"
        pageType="ContactPage"
      />
      
      <div className="min-h-screen bg-background">
        
        <div className="container mx-auto max-w-6xl px-4 pb-8">
          {canGoBack && (
            <div className="mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={goBack}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </div>
          )}

          {/* Breadcrumbs */}
          <PageBreadcrumbs 
            items={[
              { label: "Home", href: "/" },
              { label: "Contact" }
            ]} 
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="h-full">
                <Card className="flex flex-col h-full">
                  <CardHeader>
                    <CardTitle className="text-2xl">Send Us a Message</CardTitle>
                    <CardDescription>
                      Fill out the form below and we'll get back to you within 24 hours
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your full name"
                        className={cn(errors.name ? "border-destructive" : "")}
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive">{errors.name}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your.email@example.com"
                        className={cn(errors.email ? "border-destructive" : "")}
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">{errors.email}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="How can we help?"
                        className={cn(errors.subject ? "border-destructive" : "")}
                      />
                      {errors.subject && (
                        <p className="text-sm text-destructive">{errors.subject}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us how we can help you..."
                        rows={6}
                        className={cn("resize-none", errors.message ? "border-destructive" : "")}
                      />
                      {errors.message && (
                        <p className="text-sm text-destructive">{errors.message}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label>Attachments (Optional)</Label>
                      <div className="space-y-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('file-input')?.click()}
                          className="w-full"
                        >
                          <Paperclip className="w-4 h-4 mr-2" />
                          Attach Files
                        </Button>
                        <input
                          id="file-input"
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            if (attachments.length + files.length > 5) {
                              toast({
                                title: "Too many files",
                                description: "You can attach up to 5 files per message",
                                variant: "destructive",
                              });
                              return;
                            }
                            const oversized = files.filter(f => f.size > 10 * 1024 * 1024);
                            if (oversized.length > 0) {
                              toast({
                                title: "File too large",
                                description: "Each file must be less than 10MB",
                                variant: "destructive",
                              });
                              return;
                            }
                            setAttachments([...attachments, ...files]);
                            e.target.value = '';
                          }}
                          className="hidden"
                        />
                        {attachments.length > 0 && (
                          <div className="space-y-1">
                            {attachments.map((file, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                                <span className="truncate">{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 mt-3">
                    <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                      <Send className="w-4 h-4 mr-2" />
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </Button>
                  </CardFooter>
                </Card>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-6 flex flex-col h-full">

              {hasSubscription ? (
                <form onSubmit={handleCoachSubmit} className="h-full">
                  <Card className="flex flex-col h-full bg-gradient-to-br from-primary/5 to-accent/10 border-primary/20">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        Direct Access to Your Coach
                        {!hasSubscription && <Lock className="h-4 w-4" />}
                      </CardTitle>
                      <CardDescription>
                        Send a message directly to <a href="/coach-profile" className="text-primary hover:underline font-medium">Haris Falas</a>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-3">
                      <div className="space-y-1.5">
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

                      <div className="space-y-1.5">
                        <Label htmlFor="coach-message">Message *</Label>
                        <Textarea
                          id="coach-message"
                          name="message"
                          value={coachFormData.message}
                          onChange={handleCoachChange}
                          placeholder="Tell Haris how he can help you..."
                          rows={10}
                          className={cn("resize-none", coachErrors.message ? "border-destructive" : "")}
                        />
                        {coachErrors.message && (
                          <p className="text-sm text-destructive">{coachErrors.message}</p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="coach-attachments">
                          Attachments <span className="text-xs text-muted-foreground">(optional, max 5 files)</span>
                        </Label>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById('coach-file-input')?.click()}
                            disabled={uploadingFiles || coachAttachments.length >= 5}
                          >
                            <Paperclip className="w-4 h-4 mr-2" />
                            Attach Files
                          </Button>
                          <input
                            id="coach-file-input"
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                            className="hidden"
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              if (files.length + coachAttachments.length > 5) {
                                toast({
                                  title: "Too many files",
                                  description: "Maximum 5 files allowed",
                                  variant: "destructive",
                                });
                                return;
                              }
                              const invalidFiles = files.filter(f => f.size > 10 * 1024 * 1024);
                              if (invalidFiles.length > 0) {
                                toast({
                                  title: "File too large",
                                  description: "Each file must be less than 10MB",
                                  variant: "destructive",
                                });
                                return;
                              }
                              setCoachAttachments([...coachAttachments, ...files]);
                              e.target.value = '';
                            }}
                          />
                        </div>
                        
                        {coachAttachments.length > 0 && (
                          <div className="space-y-1 mt-2">
                            {coachAttachments.map((file, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-secondary rounded-md text-sm">
                                <span className="truncate flex-1">{file.name}</span>
                                <span className="text-xs text-muted-foreground ml-2">
                                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                </span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setCoachAttachments(prev => prev.filter((_, i) => i !== index))}
                                  className="ml-2 h-6 w-6 p-0"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-3 pt-0 mt-3">
                      <Button type="submit" className="w-full" disabled={isCoachSubmitting}>
                        <Send className="w-4 h-4 mr-2" />
                        {isCoachSubmitting ? "Sending..." : "Contact Haris"}
                      </Button>

                      <Button 
                        onClick={handleWhatsAppClick}
                        className="w-full bg-[#25D366] hover:bg-[#20BA5A]"
                        type="button"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Direct Communication via WhatsApp
                      </Button>
                    </CardFooter>
                  </Card>
                </form>
              ) : (
                <Card className="flex flex-col h-full bg-gradient-to-br from-primary/5 to-accent/10 border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      Direct Access to Your Coach
                      <Lock className="h-4 w-4" />
                    </CardTitle>
                    <CardDescription>
                      Available for Premium members only
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between space-y-4">
                    <p className="text-sm text-muted-foreground">
                      As a Premium member, you can reach out directly to <a href="/coach-profile" className="text-primary hover:underline font-medium"><strong>Haris Falas</strong></a>. 
                      No robots, no automated responses — just real human support when you need it.
                    </p>
                    {!isPremium && (
                      <Button 
                        onClick={() => navigate("/premiumbenefits")} 
                        className="w-full"
                        variant="default"
                      >
                        <Crown className="mr-2 h-4 w-4" />
                        Upgrade to Premium
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

            </div>
          </div>

          {/* Response Time Notice */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              We typically respond within 24 hours during business days. Premium members receive priority support.
            </p>
          </div>

        </div>
      </div>
    </>
  );
};

export default Contact;
