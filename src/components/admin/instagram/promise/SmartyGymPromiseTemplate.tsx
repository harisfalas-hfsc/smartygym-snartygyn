import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const SmartyGymPromiseTemplate = () => {
  return (
    <div className="w-[1080px] h-[1080px] bg-background p-12 flex items-center justify-center">
      <Card className="border-primary border-4 w-full h-full bg-gradient-to-br from-primary/10 to-accent/10">
        <CardContent className="p-12 flex flex-col justify-center h-full space-y-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-5xl font-bold mb-6 text-primary">The SmartyGym Promise</h2>
          </div>
          
          <div className="space-y-6 max-w-3xl mx-auto">
            <p className="text-2xl leading-relaxed text-center">
              Every workout and training program at <span className="text-primary font-semibold">SmartyGym</span> is crafted with one goal: 
              to help you reach YOUR fitness goals, whatever they may be.
            </p>
            <p className="text-2xl leading-relaxed text-center">
              Whether you're building muscle, losing weight, improving endurance, or simply staying active, 
              we provide the structure, guidance, and flexibility you need to succeed — on your terms, in your time, wherever you are.
            </p>
            <p className="text-3xl font-bold text-center text-primary mt-8">
              Real coaching. Real results. Anywhere you train.
            </p>
          </div>
          
          <div className="text-center mt-8">
            <p className="text-2xl font-semibold text-primary">smartygym.com</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
