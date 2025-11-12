import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";

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

  const { data: items, isLoading } = useQuery({
    queryKey: ["featured-standalone-purchases"],
    queryFn: async () => {
      const [workoutsResult, programsResult] = await Promise.all([
        supabase
          .from("admin_workouts")
          .select("id, name, price, image_url, description, difficulty")
          .eq("is_standalone_purchase", true)
          .not("price", "is", null)
          .order("serial_number", { ascending: false })
          .limit(3),
        supabase
          .from("admin_training_programs")
          .select("id, name, price, image_url, description, difficulty")
          .eq("is_standalone_purchase", true)
          .not("price", "is", null)
          .order("serial_number", { ascending: false })
          .limit(3)
      ]);

      const workouts: StandaloneItem[] = (workoutsResult.data || []).map(w => ({
        ...w,
        type: 'workout' as const
      }));

      const programs: StandaloneItem[] = (programsResult.data || []).map(p => ({
        ...p,
        type: 'program' as const
      }));

      return [...workouts, ...programs].slice(0, 6);
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
      <section className="py-12 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8">
            <Skeleton className="h-8 w-64 mx-auto mb-2" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-96 w-full" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section className="py-12 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            Featured Standalone Purchases
          </h2>
          <p className="text-muted-foreground text-lg">
            Get individual workouts and programs without a subscription
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <Card 
              key={`${item.type}-${item.id}`} 
              className="overflow-hidden hover-lift cursor-pointer group"
              onClick={() => handleItemClick(item)}
            >
              <CardHeader className="p-0">
                <div className="relative aspect-video overflow-hidden">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <ShoppingCart className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">
                    €{item.price}
                  </Badge>
                  {item.type === 'program' && (
                    <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground">
                      Program
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="text-lg mb-2 line-clamp-2">
                  {item.name}
                </CardTitle>
                {item.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {item.description}
                  </p>
                )}
                {item.difficulty && (
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">
                      {item.difficulty}
                    </Badge>
                  </div>
                )}
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button 
                  className="w-full" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleItemClick(item);
                  }}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
