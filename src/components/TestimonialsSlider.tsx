import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";

// SEO-optimized testimonials for homepage slider
// Full testimonials available at /community - SmartyGym reviews, HFM reviews, smartygym.com reviews
const testimonials = [
  {
    id: 1,
    text: "Best online training I've tried — I feel stronger every week.",
    author: "Maria K.",
    rating: 5,
    date: "2025-11-14",
  },
  {
    id: 2,
    text: "The structure keeps me consistent. Highly recommend SmartyGym!",
    author: "Andreas P.",
    rating: 5,
    date: "2025-11-16",
  },
  {
    id: 3,
    text: "Finally, a program that actually works. Science-based training at its best.",
    author: "Sophie L.",
    rating: 5,
    date: "2025-11-19",
  },
  {
    id: 4,
    text: "Coach Haris knows exactly what works. SmartyGym is the best online fitness platform.",
    author: "Dimitra G.",
    rating: 5,
    date: "2025-10-22",
  },
  {
    id: 5,
    text: "After 3 months with SmartyGym, I feel 10 years younger. Amazing results!",
    author: "Konstantinos D.",
    rating: 5,
    date: "2025-11-01",
  },
  {
    id: 6,
    text: "The science-based approach is refreshing. Real results backed by sports science.",
    author: "Eleni A.",
    rating: 5,
    date: "2025-11-05",
  },
];

export const TestimonialsSlider = () => {
  return (
    <section 
      className="space-y-4"
      itemScope 
      itemType="https://schema.org/Product"
    >
      <meta itemProp="name" content="SmartyGym - Online Fitness Platform" />
      <meta itemProp="brand" content="SmartyGym" />
      
      {/* Hidden AggregateRating for SEO - SmartyGym reviews, HFM reviews, Haris Falas reviews, smartygym.com reviews */}
      <div itemProp="aggregateRating" itemScope itemType="https://schema.org/AggregateRating" className="sr-only">
        <meta itemProp="ratingValue" content="4.59" />
        <meta itemProp="reviewCount" content="22" />
        <meta itemProp="bestRating" content="5" />
        <meta itemProp="worstRating" content="1" />
        <span>SmartyGym reviews - 22 verified reviews with 4.59 average rating. Read HFM reviews, Smarty Gym reviews, and smartygym.com reviews from real users.</span>
      </div>
      
      <h3 className="text-xl font-semibold text-center">What Our Members Say</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {testimonials.map((testimonial) => (
          <Card 
            key={testimonial.id} 
            className="p-6 bg-card border-border"
            itemProp="review"
            itemScope
            itemType="https://schema.org/Review"
          >
            <div 
              className="flex gap-1 mb-3"
              itemProp="reviewRating"
              itemScope
              itemType="https://schema.org/Rating"
            >
              <meta itemProp="ratingValue" content={String(testimonial.rating)} />
              <meta itemProp="bestRating" content="5" />
              {Array.from({ length: testimonial.rating }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-primary text-primary" aria-hidden="true" />
              ))}
              <span className="sr-only">{testimonial.rating} out of 5 stars</span>
            </div>
            <p className="text-sm text-foreground mb-3 italic" itemProp="reviewBody">"{testimonial.text}"</p>
            <p className="text-xs text-muted-foreground font-medium">
              — <span itemProp="author" itemScope itemType="https://schema.org/Person">
                <span itemProp="name">{testimonial.author}</span>
              </span>
            </p>
            <meta itemProp="datePublished" content={testimonial.date} />
          </Card>
        ))}
      </div>
    </section>
  );
};
