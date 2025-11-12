import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Dumbbell } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface StandaloneItem {
  id: string;
  name: string;
  type: 'workout' | 'program';
  price: number;
  image_url: string | null;
  description: string | null;
  difficulty: string | null;
}

export const FeaturedStandalonePurchases = () => {
  const navigate = useNavigate();

  const { data: items, isLoading } = useQuery<StandaloneItem[]>({
    queryKey: ["featured-standalone-purchases"],
    staleTime: 0,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    queryFn: async () => {
      console.log("🔍 Fetching standalone items...");
      const [workoutsResult, programsResult] = await Promise.all([
        supabase
          .from("admin_workouts")
          .select("id, name, price, image_url, description, difficulty")
          .eq("is_standalone_purchase", true)
          .not("price", "is", null)
          .order("serial_number", { ascending: false })
          .limit(20),
        supabase
          .from("admin_training_programs")
          .select("id, name, price, image_url, description, difficulty")
          .eq("is_standalone_purchase", true)
          .not("price", "is", null)
          .order("serial_number", { ascending: false })
          .limit(20)
      ]);

      console.log("📦 Workouts result:", workoutsResult);
      console.log("📦 Programs result:", programsResult);

      const workouts: StandaloneItem[] = (workoutsResult.data || []).map(w => ({
        ...w,
        type: 'workout' as const
      }));

      const programs: StandaloneItem[] = (programsResult.data || []).map(p => ({
        ...p,
        type: 'program' as const
      }));

      const combined = [...workouts, ...programs];
      console.log("✅ Total items:", combined.length, combined);
      return combined;
    },
  });

  const handleItemClick = (item: StandaloneItem) => {
    if (item.type === 'workout') {
      navigate(`/workout/${item.id}`);
    } else {
      navigate(`/trainingprogram/${item.id}`);
    }
  };

  if (isLoading) {
    return (
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="bg-card border-2 border-primary/30 rounded-xl p-6 shadow-gold">
            <div className="text-center mb-6">
              <Skeleton className="h-6 w-64 mx-auto mb-2" />
              <Skeleton className="h-4 w-80 mx-auto" />
            </div>
            <div className="flex gap-4 justify-center">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-48 w-56" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  const hasItems = items && items.length > 0;
  
  console.log("🎯 Featured Section - hasItems:", hasItems, "items:", items);

  return (
    <section className="py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="bg-card border-2 border-primary/30 rounded-xl p-6 md:p-8 shadow-gold">
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">
              Grab One Without a Plan
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Get individual workouts and programs without a plan
            </p>
          </div>

          {!hasItems && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No standalone items found. Check console for details.
              </p>
            </div>
          )}

          {hasItems && (

          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {items.map((item) => (
                <CarouselItem key={`${item.type}-${item.id}`} className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                  <Card 
                    className="overflow-hidden hover-lift cursor-pointer group border-primary/20 h-full"
                    onClick={() => handleItemClick(item)}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Dumbbell className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                      <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground font-bold">
                        €{item.price}
                      </Badge>
                    </div>
                    <CardContent className="p-3">
                      <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                        {item.name}
                      </h3>
                      {item.difficulty && (
                        <Badge variant="outline" className="text-xs">
                          {item.difficulty}
                        </Badge>
                      )}
                    </CardContent>
                    <CardFooter className="p-3 pt-0">
                      <Button 
                        size="sm"
                        className="w-full text-xs" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleItemClick(item);
                        }}
                      >
                        <ShoppingCart className="w-3 h-3 mr-1" />
                        Buy Now
                      </Button>
                    </CardFooter>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
          )}
        </div>
      </div>
    </section>
  );
};
