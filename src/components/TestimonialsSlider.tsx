import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    id: 1,
    text: "Best online training I've tried — I feel stronger every week.",
    author: "Maria K.",
    rating: 5,
  },
  {
    id: 2,
    text: "The structure keeps me consistent. Highly recommend SmartyGym!",
    author: "Andreas P.",
    rating: 5,
  },
  {
    id: 3,
    text: "Finally, a program that actually works. Science-based training at its best.",
    author: "Sophie L.",
    rating: 5,
  },
];

export const TestimonialsSlider = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-center">What Our Members Say</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {testimonials.map((testimonial) => (
          <Card key={testimonial.id} className="p-6 bg-card border-border">
            <div className="flex gap-1 mb-3">
              {Array.from({ length: testimonial.rating }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-primary text-primary" />
              ))}
            </div>
            <p className="text-sm text-foreground mb-3 italic">"{testimonial.text}"</p>
            <p className="text-xs text-muted-foreground font-medium">— {testimonial.author}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};
