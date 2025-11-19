import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet";
import { SEOEnhancer } from "@/components/SEOEnhancer";
import { PageTitleCard } from "@/components/PageTitleCard";
import { PageBreadcrumbs } from "@/components/PageBreadcrumbs";
import { ProductCard } from "@/components/shop/ProductCard";
import { PersonalRecommendation } from "@/components/shop/PersonalRecommendation";
import { MinimalDisclosure } from "@/components/shop/MinimalDisclosure";
import { ContentLoadingSkeleton } from "@/components/ContentLoadingSkeleton";
import { ShoppingBag } from "lucide-react";

const Shop = () => {
  const { data: products, isLoading } = useQuery({
    queryKey: ["shop-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shop_products")
        .select("*")
        .order("is_featured", { ascending: false })
        .order("display_order", { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <>
      <Helmet>
        <title>Recommended Fitness Gear by Haris Falas | SmartyGym</title>
        <meta name="description" content="Hand-picked fitness equipment and gear recommended by certified strength coach Haris Falas. Quality products for home workouts and gym training." />
        <meta name="keywords" content="fitness gear, workout equipment, home gym, resistance bands, dumbbells, yoga mats, fitness accessories, Haris Falas recommendations" />
      </Helmet>
      
      <SEOEnhancer
        entities={["SmartyGym", "Haris Falas", "Fitness Equipment"]}
        topics={["fitness gear", "home gym", "workout equipment"]}
        expertise={["strength training equipment", "fitness accessories"]}
        contentType="product recommendations"
      />
      
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <PageBreadcrumbs 
          items={[
            { label: "Home", href: "/" },
            { label: "Shop" }
          ]} 
        />
        
        <PageTitleCard
          icon={ShoppingBag}
          title="Recommended Fitness Gear"
          subtitle="Equipment I personally use and recommend"
        />

        <PersonalRecommendation />

        {isLoading ? (
          <ContentLoadingSkeleton />
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No products found.
            </p>
          </div>
        )}

        <MinimalDisclosure />
      </main>
    </>
  );
};

export default Shop;
