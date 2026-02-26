import { useState, useEffect, useRef, useCallback } from "react";
import { Helmet } from "react-helmet";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageBreadcrumbs } from "@/components/PageBreadcrumbs";
import { SEOEnhancer } from "@/components/SEOEnhancer";
import { Search, Flame, Beef, Wheat, Droplets, Leaf, Loader2, Plus, Minus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { generateFAQSchema } from "@/utils/seoSchemas";

interface FoodItem {
  fdcId: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

const CalorieCounter = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [grams, setGrams] = useState("100");
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const requestIdRef = useRef(0);

  const searchFood = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 3) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    const thisRequestId = ++requestIdRef.current;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("search-food-nutrition", {
        body: { query: searchQuery },
      });
      if (error) throw error;
      // Ignore stale responses
      if (thisRequestId !== requestIdRef.current) return;
      setResults(data.foods || []);
      setShowDropdown(true);
    } catch (err) {
      console.error("Food search error:", err);
      if (thisRequestId === requestIdRef.current) setResults([]);
    } finally {
      if (thisRequestId === requestIdRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 3) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    debounceRef.current = setTimeout(() => searchFood(query), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, searchFood]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectFood = (food: FoodItem) => {
    setSelectedFood(food);
    setQuery(food.name);
    setShowDropdown(false);
  };

  const gramsNum = parseFloat(grams) || 0;
  const multiplier = gramsNum / 100;

  const adjustGrams = (delta: number) => {
    setGrams((prev) => {
      const next = Math.max(1, (parseInt(prev) || 0) + delta);
      return String(next);
    });
  };

  const macros = selectedFood
    ? [
        { label: "Calories", value: (selectedFood.calories * multiplier).toFixed(0), unit: "kcal", icon: Flame, color: "text-orange-500" },
        { label: "Protein", value: (selectedFood.protein * multiplier).toFixed(1), unit: "g", icon: Beef, color: "text-red-500" },
        { label: "Carbs", value: (selectedFood.carbs * multiplier).toFixed(1), unit: "g", icon: Wheat, color: "text-amber-500" },
        { label: "Fat", value: (selectedFood.fat * multiplier).toFixed(1), unit: "g", icon: Droplets, color: "text-blue-500" },
        { label: "Fiber", value: (selectedFood.fiber * multiplier).toFixed(1), unit: "g", icon: Leaf, color: "text-green-500" },
      ]
    : null;

  return (
    <>
      <Helmet>
        <title>Calorie Counter | Food Nutrition Lookup | SmartyGym</title>
        <meta name="description" content="Free calorie counter. Search any food, enter quantity in grams, and instantly see calories, protein, carbs, fat, and fiber. Powered by USDA database with 300,000+ foods." />
        <script type="application/ld+json">
          {JSON.stringify(generateFAQSchema([
            { question: "How does the SmartyGym Calorie Counter work?", answer: "Search for any food by name. The tool uses the USDA FoodData Central database with 300,000+ foods. Select your food, enter the quantity in grams, and instantly see calories and macros." },
            { question: "Is the Calorie Counter free?", answer: "Yes, the calorie counter is completely free to use and does not require an account." },
          ]))}
        </script>
      </Helmet>

      <SEOEnhancer
        entities={["SmartyGym", "Calorie Counter", "USDA FoodData"]}
        topics={["calorie counting", "nutrition lookup", "food database"]}
        expertise={["nutrition science"]}
        contentType="tool"
        aiSummary="Free calorie counter powered by the USDA food database."
        aiKeywords={["calorie counter", "food calories", "nutrition lookup", "macro calculator"]}
        relatedContent={["macro calculator", "BMR calculator"]}
      />

      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-2xl px-4 pb-8">
          <PageBreadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Tools", href: "/tools" },
              { label: "Calorie Counter" },
            ]}
          />

          <h1 className="text-2xl md:text-3xl font-bold text-center mb-6">Calorie Counter</h1>

          {/* Search */}
          <div className="relative mb-4" ref={dropdownRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search food (e.g. chicken, banana, rice)..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (selectedFood) setSelectedFood(null);
                }}
                className="pl-10 pr-10"
              />
              {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />}
            </div>

            {showDropdown && results.length > 0 && (
              <Card className="absolute z-50 w-full mt-1 max-h-64 overflow-y-auto shadow-lg">
                <CardContent className="p-1">
                  {results.map((food) => (
                    <button
                      key={food.fdcId}
                      onClick={() => selectFood(food)}
                      className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors"
                    >
                      <span className="font-medium text-foreground">{food.name}</span>
                      <span className="text-muted-foreground ml-2 text-xs">{food.calories.toFixed(0)} kcal/100g</span>
                    </button>
                  ))}
                </CardContent>
              </Card>
            )}

            {showDropdown && !loading && results.length === 0 && query.length >= 3 && (
              <Card className="absolute z-50 w-full mt-1 shadow-lg">
                <CardContent className="p-4 text-center text-sm text-muted-foreground">
                  No foods found for "{query}"
                </CardContent>
              </Card>
            )}
          </div>

          {/* Quantity with +/- buttons */}
          {selectedFood && (
            <div className="mb-6">
              <label className="text-sm font-medium text-foreground mb-1 block">Quantity (grams)</label>
              <div className="flex items-center gap-2 max-w-[220px]">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => adjustGrams(-10)}
                  aria-label="Decrease by 10g"
                  className="h-10 w-10 shrink-0"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Input
                  type="number"
                  min="1"
                  value={grams}
                  onChange={(e) => setGrams(e.target.value)}
                  className="text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => adjustGrams(10)}
                  aria-label="Increase by 10g"
                  className="h-10 w-10 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Results */}
          {macros && (
            <Card className="border-2 border-primary/40">
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground mb-4 text-center">
                  <span className="font-semibold text-foreground">{selectedFood!.name}</span> — {gramsNum}g
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  {macros.map((m) => {
                    const Icon = m.icon;
                    return (
                      <div key={m.label} className="flex flex-col items-center gap-1">
                        <Icon className={`w-5 h-5 ${m.color}`} />
                        <span className="text-xl font-bold text-foreground">{m.value}</span>
                        <span className="text-xs text-muted-foreground">{m.unit} {m.label}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {!selectedFood && (
            <p className="text-center text-sm text-muted-foreground mt-8">
              Search for a food above to see its nutritional values.
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default CalorieCounter;
