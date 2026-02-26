

# Calorie Counter Tool - Using USDA Food Database

## Overview
Add a new "Calorie Counter" tool to the Smarty Tools page. Users type a food name, see live search results from the USDA FoodData Central API (free, 300,000+ foods, no API key required), select a food, enter the quantity in grams, and instantly see calories and macros.

## How It Works
- As you type a food name (e.g. "chicken breast"), a dropdown shows matching results from the USDA database
- Select the food you want, enter the quantity (e.g. 200g)
- The tool calculates and displays: Calories, Protein, Carbs, Fat, and Fiber

## Technical Plan

### 1. Create Edge Function for USDA API Proxy
**File:** `supabase/functions/search-food-nutrition/index.ts`
- Proxies requests to USDA FoodData Central API (`https://api.nal.usda.gov/fdc/v1/foods/search`)
- The USDA API is free and does not require an API key for basic access (or uses the free demo key `DEMO_KEY`)
- Accepts a search query, returns food names with per-100g nutritional values (calories, protein, carbs, fat, fiber)
- Handles CORS for the web app

### 2. Create Calorie Counter Page
**File:** `src/pages/CalorieCounter.tsx`
- Search input with debounced typing (300ms delay to avoid excessive API calls)
- Dropdown list of matching foods appearing as you type
- Quantity input (grams) with a default of 100g
- Results card showing calculated nutrition per the entered quantity
- Follows the same page structure as existing tools (breadcrumbs, Helmet SEO, SEOEnhancer)

### 3. Add Route
**File:** `src/App.tsx`
- Add route `/caloriecounter` pointing to the new page
- Place it alongside the other tool routes

### 4. Add to Tools Page
**File:** `src/pages/Tools.tsx`
- Add the Calorie Counter card to the `tools` array with a `Search` icon from lucide-react
- Appears in both mobile carousel and desktop grid
- Will need a background image for the desktop card (will use a placeholder or generate one)

### 5. Add Background Image
- Add a calorie counter background image to `src/assets/tools/`

### 6. Update Tools Page SEO
- Update the Helmet meta tags and FAQ schema to include the Calorie Counter tool

