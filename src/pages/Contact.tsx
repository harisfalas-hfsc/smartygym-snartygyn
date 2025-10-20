import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, MessageSquare, Send, MapPin, Phone } from "lucide-react";
import { BackToTop } from "@/components/BackToTop";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, { message: "Name is required" }).max(100, { message: "Name must be less than 100 characters" }),
  email: z.string().trim().email({ message: "Invalid email address" }).max(255, { message: "Email must be less than 255 characters" }),
  subject: z.string().trim().min(1, { message: "Subject is required" }).max(200, { message: "Subject must be less than 200 characters" }),
  message: z.string().trim().min(1, { message: "Message is required" }).max(2000, { message: "Message must be less than 2000 characters" })
});

const Contact = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    try {
      const validatedData = contactSchema.parse(formData);
      setIsSubmitting(true);

      // Here you would typically send to your backend or email service
      // For now, we'll just show a success message
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Message sent!",
        description: "We'll get back to you as soon as possible.",
      });

      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            fieldErrors[err.path[0]] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact Us - Smarty Gym | Get in Touch with Haris Falas</title>
        <meta name="description" content="Contact Smarty Gym and reach out to Haris Falas directly. Get support, ask questions about our training programs, or discuss your fitness goals." />
        <meta name="keywords" content="contact smarty gym, fitness support, personal training inquiry, Haris Falas contact" />
        
        <meta property="og:title" content="Contact Smarty Gym - Get Expert Fitness Support" />
        <meta property="og:description" content="Reach out to our team for personalized fitness guidance and support." />
        <meta property="og:type" content="website" />
        
        <link rel="canonical" href={window.location.href} />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <BackToTop />
        <div className="container mx-auto max-w-6xl px-4 py-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>

          {/* Hero Section */}
          <header className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Get in Touch</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Have questions? Need support? Want to discuss your fitness goals? We're here to help.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <MessageSquare className="w-6 h-6 text-primary" />
                    Send Us a Message
                  </CardTitle>
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
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-primary" />
                    Email Us
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    For general inquiries and support
                  </p>
                  <a href="mailto:info@smartygym.com" className="text-primary hover:underline">
                    info@smartygym.com
                  </a>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-primary/5 to-accent/10 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg">Direct Access to Your Coach</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    As a Premium member, you can reach out directly to Haris Falas and the coaching team. 
                    No robots, no automated responses — just real human support when you need it.
                  </p>
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
