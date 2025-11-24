import { Award, CheckCircle2, Heart, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const WhatWeStandForCompositeTemplate = () => {
  return (
    <div className="w-[1080px] h-[1080px] bg-background p-8 flex items-center justify-center">
      <Card className="border-primary border-4 w-full h-full bg-gradient-to-br from-background to-primary/5">
        <CardContent className="p-8 flex flex-col h-full space-y-6">
          {/* Title */}
          <div className="text-center">
            <h2 className="text-5xl font-bold text-foreground mb-2">
              What We Stand For
            </h2>
            <p className="text-xl text-muted-foreground">Our core values and principles</p>
          </div>

          {/* Grid of 4 Value Cards */}
          <div className="grid grid-cols-2 gap-6 flex-1">
            {/* Evidence-Based */}
            <div className="flex flex-col items-center gap-4 p-6 bg-background rounded-lg border-2 border-primary/30 hover:shadow-lg transition-all">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Award className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-3xl font-bold text-center">Evidence-Based</h3>
              <p className="text-base text-muted-foreground text-center leading-relaxed">
                Every program is backed by sports science, biomechanics, and proven training principles — not trends or guesswork.
              </p>
            </div>

            {/* Structure & Clarity */}
            <div className="flex flex-col items-center gap-4 p-6 bg-background rounded-lg border-2 border-primary/30 hover:shadow-lg transition-all">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-3xl font-bold text-center">Structure & Clarity</h3>
              <p className="text-base text-muted-foreground text-center leading-relaxed">
                Clear workout plans, step-by-step guidance, and structured progression so you always know what to do and why.
              </p>
            </div>

            {/* Human Connection */}
            <div className="flex flex-col items-center gap-4 p-6 bg-background rounded-lg border-2 border-primary/30 hover:shadow-lg transition-all">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-3xl font-bold text-center">Human Connection</h3>
              <p className="text-base text-muted-foreground text-center leading-relaxed">
                Real coaching, personalized support, and direct access to expert guidance — not chatbots or automated responses.
              </p>
            </div>

            {/* Results-Driven */}
            <div className="flex flex-col items-center gap-4 p-6 bg-background rounded-lg border-2 border-primary/30 hover:shadow-lg transition-all">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Target className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-3xl font-bold text-center">Results-Driven</h3>
              <p className="text-base text-muted-foreground text-center leading-relaxed">
                Our programs are designed to deliver measurable results — strength gains, fat loss, endurance, or whatever your goal is.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-2xl font-semibold text-primary">smartygym.com</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
