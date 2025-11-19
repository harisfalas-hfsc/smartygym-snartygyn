import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet";
import { SEOEnhancer } from "@/components/SEOEnhancer";
import { PageTitleCard } from "@/components/PageTitleCard";
import { CategoryFilter } from "@/components/shop/CategoryFilter";
import { ProductCard } from "@/components/shop/ProductCard";
import { AffiliateDisclosure } from "@/components/shop/AffiliateDisclosure";
import { ContentLoadingSkeleton } from "@/components/ContentLoadingSkeleton";
import { ShoppingBag } from "lucide-react";

const Shop = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: products, isLoading } = useQuery({
    queryKey: ["shop-products", selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from("shop_products")
        .select("*")
        .order("is_featured", { ascending: false })
        .order("display_order", { ascending: true });

      if (selectedCategory !== "all") {
        query = query.eq("category", selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const categories = [
    { value: "all", label: "All Products" },
    { value: "Resistance Bands", label: "Resistance Bands" },
    { value: "Dumbbells & Weights", label: "Dumbbells & Weights" },
    { value: "Yoga & Mobility", label: "Yoga & Mobility" },
    { value: "Cardio Equipment", label: "Cardio Equipment" },
    { value: "Recovery Tools", label: "Recovery Tools" },
    { value: "Apparel & Accessories", label: "Apparel & Accessories" },
  ];

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
        <PageTitleCard
          icon={ShoppingBag}
          title="Recommended Fitness Gear"
          subtitle="Hand-picked equipment I use and trust"
        />

        <AffiliateDisclosure />

        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

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
              No products found in this category.
            </p>
          </div>
        )}
      </main>
    </>
  );
};

export default Shop;
