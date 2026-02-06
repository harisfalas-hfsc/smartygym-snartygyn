import { useState, useEffect } from "react";
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
import { toast } from "sonner";
import { Button } from "@/components/ui/button";


const Shop = () => {
  const [sortBy, setSortBy] = useState<string>("featured");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  

  // Handle redirect after authentication
  useEffect(() => {
    const checkPendingPurchase = async () => {
      const pendingPurchase = sessionStorage.getItem('pendingPurchase');
      if (pendingPurchase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const purchaseData = JSON.parse(pendingPurchase);
          sessionStorage.removeItem('pendingPurchase');
          toast.success("Welcome! You can now complete your purchase", {
            description: `Continue with ${purchaseData.productTitle}`,
          });
          // Scroll to the product if we're on the shop page
          setTimeout(() => {
            const productElement = document.querySelector(`[data-product-id="${purchaseData.productId}"]`);
            if (productElement) {
              productElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 500);
        }
      }
    };
    checkPendingPurchase();
  }, []);

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
        <title>Fitness Equipment Shop | Haris Falas Recommendations | HFSC | SmartyGym</title>
        <meta name="description" content="Fitness equipment shop at smartygym.com. Quality gear personally recommended by Sports Scientist Haris Falas HFSC for online gym training. Trusted equipment for home workouts. Train smart anywhere, anytime." />
        <meta name="keywords" content="fitness equipment, gym equipment, home workout equipment, fitness shop, personal trainer recommendations, HFSC, Haris Falas, Sports Scientist, fitness gear, workout equipment, home gym equipment, online gym equipment, smartygym.com, HFSC Performance, training equipment" />
        
        {/* Greek Language */}
        <link rel="alternate" hrefLang="el" href="https://smartygym.com/shop" />
        <link rel="alternate" hrefLang="en-GB" href="https://smartygym.com/shop" />
      </Helmet>
      
      <SEOEnhancer
        entities={["SmartyGym", "HFSC Performance", "Haris Falas", "Fitness Equipment", "Gym Shop"]}
        topics={["fitness gear", "home gym equipment", "workout equipment", "training accessories"]}
        expertise={["strength training equipment", "fitness accessories", "sports equipment"]}
        contentType="product recommendations"
        greekKeywords={["γυμναστήριο εξοπλισμός", "fitness εξοπλισμός"]}
      />
      
      <main className="container mx-auto px-4 pb-6 max-w-7xl">
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
              { value: "Apparel & Accessories", label: "Apparel & Accessories" },
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
              <div key={product.id} data-product-id={product.id}>
                <ProductCard product={product} />
              </div>
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
