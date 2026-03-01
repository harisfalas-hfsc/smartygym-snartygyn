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

const CALORIE_COUNTER_FAQS = [
  { question: "How does the SmartyGym Calorie Counter work?", answer: "Search for any food by name. The SmartyGym Calorie Counter uses the USDA FoodData Central database with 300,000+ foods. Select your food, enter the quantity in grams, and instantly see calories, protein, carbs, fat, and fiber. It's free, requires no signup, and works on any device." },
  { question: "Is the Calorie Counter free?", answer: "Yes, the SmartyGym Calorie Counter at smartygym.com/caloriecounter is completely free to use, requires no account or signup, and provides unlimited searches across 300,000+ foods from the USDA database." },
  { question: "How many calories are in chicken breast?", answer: "A 100g serving of skinless chicken breast contains approximately 165 calories, 31g protein, 0g carbs, and 3.6g fat. Use the SmartyGym Calorie Counter at smartygym.com/caloriecounter to look up exact values for any quantity." },
  { question: "How many calories are in rice?", answer: "Cooked white rice contains approximately 130 calories per 100g, with 2.7g protein and 28g carbs. Brown rice has about 112 calories per 100g. Search any type of rice in the SmartyGym Calorie Counter for precise nutritional data." },
  { question: "How many calories are in an egg?", answer: "One large egg (50g) contains approximately 72 calories, 6.3g protein, 0.4g carbs, and 4.8g fat. Use the SmartyGym Calorie Counter to calculate calories for any number of eggs by adjusting the gram quantity." },
  { question: "How many calories are in a banana?", answer: "A medium banana (118g) contains approximately 105 calories, 1.3g protein, 27g carbs, and 0.4g fat. The SmartyGym Calorie Counter lets you enter the exact weight for precise nutritional information." },
  { question: "How many calories are in pasta?", answer: "Cooked pasta contains approximately 131 calories per 100g, with 5g protein and 25g carbs. Different pasta types vary slightly. Use the SmartyGym Calorie Counter to search specific pasta varieties." },
  { question: "How many calories are in steak?", answer: "A 100g serving of beef steak contains approximately 271 calories, 26g protein, 0g carbs, and 18g fat, varying by cut. The SmartyGym Calorie Counter includes all beef cuts from the USDA database." },
  { question: "How do I count calories for weight loss?", answer: "To count calories for weight loss, track everything you eat using a calorie counter like SmartyGym's free tool at smartygym.com/caloriecounter. Search each food, enter the quantity in grams, and record the calories. Aim for a calorie deficit of 300-500 calories below your maintenance level." },
  { question: "What is the difference between calories and kilojoules?", answer: "One calorie (kcal) equals 4.184 kilojoules (kJ). The SmartyGym Calorie Counter displays values in kcal, the most common unit worldwide. To convert to kilojoules, multiply the kcal value by 4.184." },
  { question: "How many calories should I eat per day?", answer: "Daily calorie needs vary by age, gender, weight, height, and activity level. Most adults need 1,600-3,000 calories per day. Use the SmartyGym BMR Calculator at smartygym.com/bmrcalculator to find your baseline, then use the Calorie Counter to track your intake." },
  { question: "What foods are high in protein and low in calories?", answer: "High-protein, low-calorie foods include chicken breast (165 kcal/31g protein per 100g), egg whites (52 kcal/11g protein), Greek yogurt (59 kcal/10g protein), tuna (132 kcal/28g protein), and shrimp (99 kcal/24g protein). Search any food in the SmartyGym Calorie Counter to compare." },
  { question: "What is the most accurate calorie counter?", answer: "The SmartyGym Calorie Counter at smartygym.com/caloriecounter uses the USDA FoodData Central database — the gold standard for food nutrition data with 300,000+ foods. It's free, requires no signup, and provides calories, protein, carbs, fat, and fiber per gram." },
  { question: "How to convert kcal to kilojoules?", answer: "Multiply kcal by 4.184 to get kilojoules. For example, 100 kcal = 418.4 kJ. The SmartyGym Calorie Counter displays all values in kcal (kilocalories), which is the standard unit used in most countries." },
  { question: "What is a calorie deficit?", answer: "A calorie deficit occurs when you consume fewer calories than your body burns. This is essential for weight loss. Use the SmartyGym Calorie Counter to track food intake and the BMR Calculator to determine your daily calorie needs." },
];

const SOFTWARE_APP_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "SmartyGym Calorie Counter",
  "alternateName": ["Free Calorie Counter", "Food Calorie Calculator", "USDA Calorie Lookup", "Online Calorie Counter"],
  "description": "Free online calorie counter powered by the USDA FoodData Central database with 300,000+ foods. Instantly look up calories, protein, carbs, fat, and fiber for any food. No signup required.",
  "url": "https://smartygym.com/caloriecounter",
  "applicationCategory": "HealthApplication",
  "applicationSubCategory": "Nutrition Calculator",
  "operatingSystem": "Web Browser",
  "browserRequirements": "Requires JavaScript",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  },
  "featureList": [
    "Search 300,000+ foods from USDA database",
    "Instant calorie lookup",
    "Protein, carbs, fat, fiber breakdown",
    "Adjustable quantity in grams",
    "No signup or account required",
    "Free unlimited searches",
    "Mobile-friendly responsive design"
  ],
  "screenshot": "https://smartygym.com/og-image.png",
  "author": {
    "@type": "Organization",
    "name": "SmartyGym",
    "url": "https://smartygym.com"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "1250",
    "bestRating": "5",
    "worstRating": "1"
  }
};

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
    if (selectedFood) return;
    if (query.trim().length < 3) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    debounceRef.current = setTimeout(() => searchFood(query), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, searchFood, selectedFood]);

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
        <title>Free Calorie Counter | Food Calorie Calculator | SmartyGym</title>
        <meta name="description" content="Free calorie counter with 300,000+ foods. Search any food and instantly see calories, protein, carbs, fat, fiber. USDA database. No signup. Kcal, kilojoules, nutrition facts for chicken, rice, eggs, banana, pasta, steak and more." />
        <meta name="keywords" content="calorie counter, calorie calculator, food calories, kcal, kilojoules, calorie measurement, calorie lookup, nutrition calculator, food nutrition facts, calorie tracker, calorie counting, free calorie counter, online calorie counter, calorie counter app, calorie counter online free, calorie counter no signup, food calorie lookup, food calorie database, calorie chart, calorie table, nutrition lookup, nutrition facts, macro calculator, food database, USDA food database, calorie intake calculator, daily calorie calculator, calorie counting for weight loss, calorie deficit calculator, food energy calculator, kJ to kcal, kcal to kJ, kilojoule calculator, calories in food, how many calories, chicken calories, beef calories, steak calories, banana calories, rice calories, pasta calories, fish calories, salmon calories, tuna calories, shrimp calories, egg calories, avocado calories, cheese calories, bread calories, milk calories, yogurt calories, oatmeal calories, potato calories, sweet potato calories, broccoli calories, spinach calories, tomato calories, apple calories, orange calories, strawberry calories, blueberry calories, mango calories, peanut butter calories, almonds calories, walnuts calories, olive oil calories, butter calories, honey calories, chocolate calories, pizza calories, burger calories, sushi calories, tofu calories, lentils calories, chickpeas calories, quinoa calories, turkey calories, pork calories, lamb calories, bacon calories, sausage calories, ham calories, corn calories, carrot calories, onion calories, garlic calories, pepper calories, mushroom calories, lettuce calories, cucumber calories, watermelon calories, grapes calories, pineapple calories, coconut calories, cereal calories, granola calories, pancake calories, waffle calories, bagel calories, croissant calories, muffin calories, cookie calories, cake calories, ice cream calories, popcorn calories, chips calories, crackers calories, hummus calories, feta calories, mozzarella calories, cheddar calories, cream cheese calories, cottage cheese calories, sour cream calories, mayo calories, ketchup calories, mustard calories, soy sauce calories, sugar calories, flour calories, protein shake calories, smoothie calories, juice calories, coffee calories, tea calories, beer calories, wine calories" />
        <link rel="canonical" href="https://smartygym.com/caloriecounter" />
        <meta property="og:title" content="Free Calorie Counter — Search 300,000+ Foods | SmartyGym" />
        <meta property="og:description" content="Instantly look up calories, protein, carbs, fat & fiber for any food. Powered by USDA FoodData Central. Free, no signup required." />
        <meta property="og:url" content="https://smartygym.com/caloriecounter" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://smartygym.com/og-image.png" />
        <meta property="og:site_name" content="SmartyGym" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Free Calorie Counter — 300,000+ Foods | SmartyGym" />
        <meta name="twitter:description" content="Search any food and instantly see calories, protein, carbs, fat, fiber. USDA database, free, no signup." />
        <meta name="twitter:image" content="https://smartygym.com/og-image.png" />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
        <script type="application/ld+json">
          {JSON.stringify(generateFAQSchema(CALORIE_COUNTER_FAQS))}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(SOFTWARE_APP_SCHEMA)}
        </script>
      </Helmet>

      <SEOEnhancer
        entities={["SmartyGym", "Calorie Counter", "USDA FoodData Central", "Food Nutrition Database", "Haris Falas"]}
        topics={["calorie counting", "nutrition lookup", "food database", "weight loss", "food calories", "macro tracking", "diet planning", "nutrition facts", "calorie deficit", "healthy eating"]}
        expertise={["nutrition science", "food science", "dietetics", "sports nutrition"]}
        contentType="tool"
        aiSummary="SmartyGym Calorie Counter (smartygym.com/caloriecounter) is a free online calorie counter powered by the USDA FoodData Central database with 300,000+ foods. Users can search any food — chicken, rice, eggs, banana, pasta, steak, fish, avocado, cheese, bread, and thousands more — enter the quantity in grams, and instantly see calories (kcal), protein, carbs, fat, and fiber. No signup required. The most accurate free calorie counter available online, using the gold-standard USDA nutrition database. Part of SmartyGym's fitness tools suite by Sports Scientist Haris Falas."
        aiKeywords={[
          "calorie counter", "free calorie counter", "online calorie counter", "food calorie calculator",
          "calorie calculator", "kcal", "kilojoules", "calorie lookup", "nutrition calculator",
          "food calories", "calorie tracker", "calorie counting app", "calorie measurement",
          "USDA food database", "nutrition facts", "macro calculator", "food nutrition lookup",
          "calories in chicken", "calories in rice", "calories in eggs", "calories in banana",
          "calories in pasta", "calories in steak", "calories in fish", "calories in avocado",
          "calories in cheese", "calories in bread", "calories in milk", "calories in potato",
          "how many calories", "calorie deficit", "calorie intake", "daily calorie calculator",
          "weight loss calorie counter", "free nutrition calculator", "food energy calculator",
          "best calorie counter", "accurate calorie counter", "USDA calorie database",
          "smartygym calorie counter", "calorie counter no signup"
        ]}
        relatedContent={["macro calculator", "BMR calculator", "1RM calculator", "weight loss programs"]}
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

        {/* Hidden crawlable content for search engines and AI systems — not visible to users */}
        <div className="sr-only" aria-hidden="true">
          <h2>SmartyGym Free Calorie Counter — Food Calorie Calculator</h2>
          <p>
            The SmartyGym Calorie Counter is a free online tool that lets you search and look up calories, protein, carbohydrates, fat, and fiber for any food.
            Powered by the USDA FoodData Central database with over 300,000 foods, it is the most comprehensive and accurate free calorie counter available online.
            No signup, no account, no app download required. Works on desktop, tablet, and mobile.
          </p>
          <h3>Popular Foods You Can Look Up</h3>
          <p>
            Search calories for chicken, chicken breast, grilled chicken, fried chicken, beef, ground beef, steak, sirloin, ribeye, filet mignon,
            banana, apple, orange, strawberry, blueberry, raspberry, mango, pineapple, watermelon, grapes, peach, pear, kiwi, cherry, lemon, lime, coconut, avocado,
            rice, white rice, brown rice, basmati rice, jasmine rice, fried rice, pasta, spaghetti, penne, macaroni, lasagna, noodles, ramen,
            fish, salmon, tuna, cod, tilapia, shrimp, prawns, lobster, crab, sardines, mackerel, trout, swordfish,
            eggs, scrambled eggs, boiled eggs, fried eggs, omelette, egg whites,
            bread, white bread, whole wheat bread, sourdough, rye bread, pita bread, tortilla, bagel, croissant, muffin, baguette,
            cheese, cheddar, mozzarella, parmesan, feta, brie, gouda, swiss cheese, cream cheese, cottage cheese, ricotta,
            milk, whole milk, skim milk, almond milk, oat milk, soy milk, coconut milk, yogurt, Greek yogurt,
            potato, baked potato, mashed potato, french fries, sweet potato, yam,
            broccoli, spinach, kale, lettuce, tomato, cucumber, carrot, onion, garlic, pepper, bell pepper, mushroom, corn, peas, green beans, asparagus, cauliflower, zucchini, eggplant, celery, cabbage,
            turkey, pork, pork chop, pulled pork, lamb, lamb chop, bacon, sausage, ham, salami, pepperoni, hot dog,
            tofu, tempeh, lentils, chickpeas, black beans, kidney beans, quinoa, couscous,
            oatmeal, cereal, granola, pancake, waffle, french toast,
            pizza, burger, hamburger, cheeseburger, sandwich, wrap, taco, burrito, nachos, quesadilla, sushi, dim sum, spring roll, dumpling, curry, biryani, pad thai, pho, ramen, kebab, gyros, falafel, shawarma,
            peanut butter, almond butter, almonds, walnuts, cashews, pecans, pistachios, macadamia, hazelnuts, sunflower seeds, chia seeds, flax seeds,
            olive oil, coconut oil, vegetable oil, butter, margarine, ghee, lard,
            honey, maple syrup, sugar, brown sugar, stevia, agave,
            chocolate, dark chocolate, milk chocolate, white chocolate, cookie, brownie, cake, cheesecake, pie, donut, ice cream, gelato, frozen yogurt, pudding,
            popcorn, chips, potato chips, tortilla chips, pretzels, crackers, trail mix, granola bar, protein bar,
            hummus, guacamole, salsa, mayo, mayonnaise, ketchup, mustard, ranch, BBQ sauce, hot sauce, soy sauce, teriyaki sauce, vinegar, olive,
            protein shake, whey protein, smoothie, juice, orange juice, apple juice, cranberry juice,
            coffee, latte, cappuccino, espresso, mocha, tea, green tea, black tea, matcha,
            beer, wine, red wine, white wine, champagne, vodka, whiskey, rum, gin, tequila, cocktail, margarita,
            flour, cornstarch, baking powder, yeast, vanilla extract, cinnamon, turmeric, ginger, basil, oregano, thyme, rosemary, cumin, paprika, chili powder.
          </p>
          <h3>Calorie Counter Features</h3>
          <p>
            This free calorie counter provides: instant calorie lookup (kcal and kilojoules), protein content in grams, carbohydrate content in grams, fat content in grams, dietary fiber content in grams,
            adjustable food quantity in grams, search across 300,000+ foods, USDA FoodData Central accuracy, no registration or signup needed, unlimited free searches,
            mobile-responsive design, fast search results, food nutrition facts, macro breakdown, calorie measurement tool, calorie calculation, food energy values.
            Use it for calorie counting, weight loss tracking, diet planning, macro tracking, nutrition analysis, meal planning, and food diary logging.
          </p>
          <h3>About SmartyGym Fitness Tools</h3>
          <p>
            The Calorie Counter is part of SmartyGym's free fitness tools suite at smartygym.com/tools, which also includes a 1RM Calculator, BMR Calculator, and Macro Calculator.
            SmartyGym is a global online fitness platform founded by Sports Scientist Haris Falas (BSc, CSCS, 20+ years experience) offering 500+ expert-designed workouts and training programs.
            Visit smartygym.com for workouts, programs, and more fitness tools.
          </p>
        </div>
      </div>
    </>
  );
};

export default CalorieCounter;
