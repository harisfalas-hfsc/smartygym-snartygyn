import { useState } from "react";
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
import { CompactFilters } from "@/components/CompactFilters";
import { ShoppingBag } from "lucide-react";

const Shop = () => {
  const [sortBy, setSortBy] = useState<string>("featured");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const { data: products, isLoading } = useQuery({
    queryKey: ["shop-products", sortBy, categoryFilter],
    queryFn: async () => {
      let query = supabase.from("shop_products").select("*");
      
      // Apply category filter first
      if (categoryFilter !== "all") {
        query = query.eq("category", categoryFilter);
      }
      
      // Then apply sorting
      switch (sortBy) {
        case "featured":
          query = query.order("is_featured", { ascending: false })
                       .order("display_order", { ascending: true });
          break;
        case "newest":
          query = query.order("created_at", { ascending: false });
          break;
        case "oldest":
          query = query.order("created_at", { ascending: true });
          break;
        case "price-low":
          query = query.order("price_range", { ascending: true });
          break;
        case "price-high":
          query = query.order("price_range", { ascending: false });
          break;
      }
      
      const { data, error } = await query;
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

        <CompactFilters
        filters={[
          {
            name: "Category",
            value: categoryFilter,
            onChange: setCategoryFilter,
            options: [
              { value: "all", label: "All Categories" },
              { value: "Fitness", label: "Fitness" },
              { value: "Nutrition", label: "Nutrition" },
              { value: "Clothing", label: "Clothing" },
              { value: "Apparel", label: "Apparel" },
              { value: "Accessories", label: "Accessories" },
            ],
            placeholder: "All Categories",
          },
            {
              name: "Sort By",
              value: sortBy,
              onChange: setSortBy,
              options: [
                { value: "featured", label: "Featured First" },
                { value: "newest", label: "Newest First" },
                { value: "oldest", label: "Oldest First" },
                { value: "price-low", label: "Price: Low to High" },
                { value: "price-high", label: "Price: High to Low" },
              ],
              placeholder: "Featured First",
            },
          ]}
        />

        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-muted-foreground">
            {products?.length || 0} products
            {categoryFilter !== "all" && ` in ${categoryFilter}`}
          </p>
        </div>

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
