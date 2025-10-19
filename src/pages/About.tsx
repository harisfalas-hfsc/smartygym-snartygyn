import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, Award, Heart, Users, Target } from "lucide-react";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
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
        <section className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Welcome to Smarty Gym</h1>
          <p className="text-xl text-muted-foreground">Fitness without the chains</p>
        </section>

        {/* Mission Statement */}
        <Card className="mb-12">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold mb-4 text-center">Our Mission</h2>
            <p className="text-lg text-muted-foreground leading-relaxed text-center max-w-3xl mx-auto">
              At Smarty Gym our mission is simple: to provide functional, science-based fitness solutions that fit into your real life. 
              Our workouts and programs are built for real life — whether you're training at home, in the gym, or on the go. 
              No complicated equipment, no expensive memberships, just effective training that works.
            </p>
          </CardContent>
        </Card>

        {/* Core Values */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">What We Stand For</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>Science-Based</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Every workout is designed using proven training principles and sports science.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>Functional</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Train for real-life movements that improve your daily performance.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>Accessible</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Fitness for everyone, anywhere — no gym required, no chains attached.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>Results-Driven</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Focused on measurable progress and sustainable fitness habits.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Message from Head Coach */}
        <Card className="mb-12 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-2xl">Message from the Head Coach</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg leading-relaxed">
              <strong>Haris Falas - Sports Scientist & Strength & Conditioning Coach</strong>
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Welcome to Smarty Gym! As a sports scientist and S&C coach, I've spent years studying what truly works in fitness. 
              I created Smarty Gym because I believe everyone deserves access to quality, evidence-based training — 
              without the need for expensive gym memberships or complicated equipment.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our programs are designed to be practical, effective, and sustainable. Whether you're just starting your fitness journey 
              or you're an experienced athlete looking to optimize your training, Smarty Gym has something for you.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              My goal is to help you build a stronger, healthier body that serves you in everyday life. 
              Let's train smarter together.
            </p>
            <p className="font-semibold">- Haris Falas, Founder HFSC & SMARTY GYM</p>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          <Card>
            <CardContent className="p-6">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>What is Smarty Gym?</AccordionTrigger>
                  <AccordionContent>
                    Smarty Gym is an online fitness platform that provides science-based workouts, training programs, 
                    and nutrition guidance. Our mission is to make quality fitness accessible to everyone, 
                    regardless of location or budget.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>Do I need equipment to use Smarty Gym?</AccordionTrigger>
                  <AccordionContent>
                    No! We offer both bodyweight workouts that require no equipment and equipment-based programs. 
                    You can filter workouts based on what you have available — whether that's nothing, 
                    resistance bands, dumbbells, or full gym access.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>What makes Smarty Gym different?</AccordionTrigger>
                  <AccordionContent>
                    Smarty Gym combines sports science with practical functionality. Every workout is designed by 
                    qualified professionals with your real-life needs in mind. We focus on sustainable progress, 
                    not quick fixes or unrealistic promises.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger>Can beginners use Smarty Gym?</AccordionTrigger>
                  <AccordionContent>
                    Absolutely! We have programs specifically designed for beginners, with clear instructions and 
                    progressions. Each workout includes difficulty ratings and modifications to match your fitness level.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger>What's included in the Premium membership?</AccordionTrigger>
                  <AccordionContent>
                    Premium members get unlimited access to all workouts, structured training programs (4-8 weeks), 
                    nutrition plans, progress tracking, community support, and regular new content updates. 
                    Free users can access a selection of workouts and use our fitness calculators.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6">
                  <AccordionTrigger>How long are the workouts?</AccordionTrigger>
                  <AccordionContent>
                    Our workouts range from 10-minute quick sessions to 45-minute full workouts. 
                    You can filter by duration to find what fits your schedule.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-7">
                  <AccordionTrigger>Can I cancel my subscription anytime?</AccordionTrigger>
                  <AccordionContent>
                    Yes! You can cancel your subscription at any time. There are no long-term commitments or 
                    cancellation fees. Your access continues until the end of your billing period.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-8">
                  <AccordionTrigger>Who created Smarty Gym?</AccordionTrigger>
                  <AccordionContent>
                    Smarty Gym was founded by Haris Falas, a certified Sports Scientist and Strength & Conditioning Coach. 
                    All programs are designed using evidence-based training principles and years of coaching experience.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </section>

        {/* CTA Section */}
        <Card className="bg-primary/10 border-primary/20">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Start Your Journey?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join thousands of people who are training smarter with Smarty Gym. 
              Start with free workouts or unlock everything with Premium.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button size="lg" onClick={() => navigate("/workout")}>
                Try Free Workouts
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
                Join Premium
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default About;
