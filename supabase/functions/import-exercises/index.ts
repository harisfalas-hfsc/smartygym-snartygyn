import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get CSV from request body
    const { csvContent } = await req.json();
    
    if (!csvContent) {
      return new Response(
        JSON.stringify({ error: "Missing csvContent in request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Parse CSV
    const lines = csvContent.trim().split("\n");
    const headers = lines[0].split(",");
    
    console.log("Headers:", headers);
    console.log("Total lines:", lines.length);
    
    // Find column indices
    const colIndex: { [key: string]: number } = {};
    headers.forEach((h: string, i: number) => {
      colIndex[h.trim()] = i;
    });
    
    const exercises: any[] = [];
    
    // Parse each row (skip header)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;
      
      // Parse CSV line properly handling commas in quoted fields
      const values = parseCSVLine(line);
      
      // Collect secondary muscles (non-empty values)
      const secondaryMuscles: string[] = [];
      for (let j = 0; j <= 5; j++) {
        const key = `secondaryMuscles/${j}`;
        if (colIndex[key] !== undefined) {
          const val = values[colIndex[key]]?.trim();
          if (val) secondaryMuscles.push(val);
        }
      }
      
      // Collect instructions (non-empty values)
      const instructions: string[] = [];
      for (let j = 0; j <= 10; j++) {
        const key = `instructions/${j}`;
        if (colIndex[key] !== undefined) {
          const val = values[colIndex[key]]?.trim();
          if (val) instructions.push(val);
        }
      }
      
      const exercise = {
        id: values[colIndex["id"]]?.trim(),
        name: values[colIndex["name"]]?.trim(),
        body_part: values[colIndex["bodyPart"]]?.trim(),
        equipment: values[colIndex["equipment"]]?.trim(),
        target: values[colIndex["target"]]?.trim(),
        secondary_muscles: secondaryMuscles,
        instructions: instructions,
        gif_url: null,
      };
      
      if (exercise.id && exercise.name) {
        exercises.push(exercise);
      }
    }
    
    console.log(`Parsed ${exercises.length} exercises`);
    
    // Clear existing exercises
    await supabase.from("exercises").delete().neq("id", "");
    
    // Insert in batches of 100
    const batchSize = 100;
    let inserted = 0;
    let errors = 0;
    
    for (let i = 0; i < exercises.length; i += batchSize) {
      const batch = exercises.slice(i, i + batchSize);
      const { error } = await supabase.from("exercises").insert(batch);
      
      if (error) {
        console.error(`Batch error at ${i}:`, error);
        errors += batch.length;
      } else {
        inserted += batch.length;
      }
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        total_parsed: exercises.length,
        inserted,
        errors,
        sample: exercises.slice(0, 3),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Parse a CSV line properly handling quoted fields
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}
