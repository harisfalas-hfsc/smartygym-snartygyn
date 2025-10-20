import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// 100 diverse exercise examples
const exercises = [
  // Chest Exercises
  { name: "Push-ups", description: "Classic bodyweight chest exercise", video_id: "IODxDxX7oi4", video_url: "https://www.youtube.com/watch?v=IODxDxX7oi4" },
  { name: "Bench Press", description: "Barbell chest press", video_id: "gRVjAtPip0Y", video_url: "https://www.youtube.com/watch?v=gRVjAtPip0Y" },
  { name: "Dumbbell Flyes", description: "Chest isolation exercise", video_id: "eozdVDA78K0", video_url: "https://www.youtube.com/watch?v=eozdVDA78K0" },
  { name: "Incline Press", description: "Upper chest development", video_id: "SrqOu55lrYU", video_url: "https://www.youtube.com/watch?v=SrqOu55lrYU" },
  { name: "Decline Press", description: "Lower chest focus", video_id: "LfyQBUKR8SE", video_url: "https://www.youtube.com/watch?v=LfyQBUKR8SE" },
  
  // Back Exercises
  { name: "Pull-ups", description: "Bodyweight back exercise", video_id: "eGo4IYlbE5g", video_url: "https://www.youtube.com/watch?v=eGo4IYlbE5g" },
  { name: "Deadlift", description: "Compound back and leg exercise", video_id: "op9kVnSso6Q", video_url: "https://www.youtube.com/watch?v=op9kVnSso6Q" },
  { name: "Bent Over Row", description: "Mid-back strengthening", video_id: "FWJR5Ve8bnQ", video_url: "https://www.youtube.com/watch?v=FWJR5Ve8bnQ" },
  { name: "Lat Pulldown", description: "Back width builder", video_id: "CAwf7n6Luuc", video_url: "https://www.youtube.com/watch?v=CAwf7n6Luuc" },
  { name: "Single Arm Row", description: "Unilateral back work", video_id: "roCP6wCXPqo", video_url: "https://www.youtube.com/watch?v=roCP6wCXPqo" },
  
  // Leg Exercises
  { name: "Squats", description: "King of leg exercises", video_id: "ultWZbUMPL8", video_url: "https://www.youtube.com/watch?v=ultWZbUMPL8" },
  { name: "Lunges", description: "Unilateral leg strength", video_id: "QOVaHwm-Q6U", video_url: "https://www.youtube.com/watch?v=QOVaHwm-Q6U" },
  { name: "Leg Press", description: "Machine-based leg builder", video_id: "IZxyjW7MPJQ", video_url: "https://www.youtube.com/watch?v=IZxyjW7MPJQ" },
  { name: "Romanian Deadlift", description: "Hamstring developer", video_id: "gL7BB5zAOWU", video_url: "https://www.youtube.com/watch?v=gL7BB5zAOWU" },
  { name: "Bulgarian Split Squat", description: "Advanced single leg exercise", video_id: "2C-uNgKwPLE", video_url: "https://www.youtube.com/watch?v=2C-uNgKwPLE" },
  
  // Shoulder Exercises
  { name: "Overhead Press", description: "Compound shoulder builder", video_id: "F3QY5vMz_6I", video_url: "https://www.youtube.com/watch?v=F3QY5vMz_6I" },
  { name: "Lateral Raises", description: "Side delt isolation", video_id: "3VcKaXpzqRo", video_url: "https://www.youtube.com/watch?v=3VcKaXpzqRo" },
  { name: "Front Raises", description: "Front delt focus", video_id: "TN4N7QOG6_U", video_url: "https://www.youtube.com/watch?v=TN4N7QOG6_U" },
  { name: "Face Pulls", description: "Rear delt and upper back", video_id: "rep-qVOkqgk", video_url: "https://www.youtube.com/watch?v=rep-qVOkqgk" },
  { name: "Arnold Press", description: "Complete shoulder activation", video_id: "6Z15_WdXmVw", video_url: "https://www.youtube.com/watch?v=6Z15_WdXmVw" },
  
  // Arm Exercises
  { name: "Bicep Curls", description: "Classic bicep builder", video_id: "ykJmrZ5v0Oo", video_url: "https://www.youtube.com/watch?v=ykJmrZ5v0Oo" },
  { name: "Hammer Curls", description: "Brachialis focus", video_id: "TwD-YGVP4Bk", video_url: "https://www.youtube.com/watch?v=TwD-YGVP4Bk" },
  { name: "Tricep Dips", description: "Bodyweight tricep work", video_id: "6kALZikXxLc", video_url: "https://www.youtube.com/watch?v=6kALZikXxLc" },
  { name: "Tricep Pushdowns", description: "Cable tricep isolation", video_id: "2-LAMcpzODU", video_url: "https://www.youtube.com/watch?v=2-LAMcpzODU" },
  { name: "Skull Crushers", description: "Lying tricep extension", video_id: "d_KZxkY_0cM", video_url: "https://www.youtube.com/watch?v=d_KZxkY_0cM" },
  
  // Core Exercises
  { name: "Plank", description: "Core stability", video_id: "ASdvN_XEl_c", video_url: "https://www.youtube.com/watch?v=ASdvN_XEl_c" },
  { name: "Russian Twists", description: "Oblique strengthening", video_id: "wkD8rjkodUI", video_url: "https://www.youtube.com/watch?v=wkD8rjkodUI" },
  { name: "Mountain Climbers", description: "Dynamic core work", video_id: "nmwgirgXLYM", video_url: "https://www.youtube.com/watch?v=nmwgirgXLYM" },
  { name: "Leg Raises", description: "Lower ab focus", video_id: "JB2oyawG9KI", video_url: "https://www.youtube.com/watch?v=JB2oyawG9KI" },
  { name: "Ab Wheel Rollout", description: "Advanced core exercise", video_id: "EXm0oBvYHYs", video_url: "https://www.youtube.com/watch?v=EXm0oBvYHYs" },
  
  // Additional Exercises (continuing to 100)
  { name: "Burpees", description: "Full body cardio", video_id: "dZgVxmf6jkA", video_url: "https://www.youtube.com/watch?v=dZgVxmf6jkA" },
  { name: "Box Jumps", description: "Explosive leg power", video_id: "NBY9-kTuHEk", video_url: "https://www.youtube.com/watch?v=NBY9-kTuHEk" },
  { name: "Kettlebell Swings", description: "Hip hinge power", video_id: "YSxHifyI6s8", video_url: "https://www.youtube.com/watch?v=YSxHifyI6s8" },
  { name: "Battle Ropes", description: "Upper body cardio", video_id: "u8yCAwwJ2Hc", video_url: "https://www.youtube.com/watch?v=u8yCAwwJ2Hc" },
  { name: "Farmer's Walk", description: "Grip and core strength", video_id: "rt17lmnaLSM", video_url: "https://www.youtube.com/watch?v=rt17lmnaLSM" },
  { name: "Turkish Get-Up", description: "Full body stability", video_id: "0bWRPC49-KI", video_url: "https://www.youtube.com/watch?v=0bWRPC49-KI" },
  { name: "Cable Crossover", description: "Chest fly variation", video_id: "taI4XduLpTk", video_url: "https://www.youtube.com/watch?v=taI4XduLpTk" },
  { name: "T-Bar Row", description: "Thick back builder", video_id: "j3Igk5DrZss", video_url: "https://www.youtube.com/watch?v=j3Igk5DrZss" },
  { name: "Chest Dips", description: "Lower chest emphasis", video_id: "2z8JmcrW-As", video_url: "https://www.youtube.com/watch?v=2z8JmcrW-As" },
  { name: "Concentration Curls", description: "Peak bicep contraction", video_id: "Jvj-n30xYqA", video_url: "https://www.youtube.com/watch?v=Jvj-n30xYqA" },
  
  // More exercises (40-60)
  { name: "Step-Ups", description: "Functional leg strength", video_id: "dQqApCGd5Ss", video_url: "https://www.youtube.com/watch?v=dQqApCGd5Ss" },
  { name: "Glute Bridge", description: "Hip extension", video_id: "wPM8icPu6H8", video_url: "https://www.youtube.com/watch?v=wPM8icPu6H8" },
  { name: "Hip Thrust", description: "Glute builder", video_id: "LM8XHLYJoYs", video_url: "https://www.youtube.com/watch?v=LM8XHLYJoYs" },
  { name: "Calf Raises", description: "Calf development", video_id: "gwLzBJYoWlI", video_url: "https://www.youtube.com/watch?v=gwLzBJYoWlI" },
  { name: "Sumo Deadlift", description: "Wide stance deadlift", video_id: "G-HKNCNEAZc", video_url: "https://www.youtube.com/watch?v=G-HKNCNEAZc" },
  { name: "Front Squat", description: "Quad-focused squat", video_id: "uYumuL_G_V0", video_url: "https://www.youtube.com/watch?v=uYumuL_G_V0" },
  { name: "Goblet Squat", description: "Beginner squat variation", video_id: "MeIiIdhvXT4", video_url: "https://www.youtube.com/watch?v=MeIiIdhvXT4" },
  { name: "Walking Lunges", description: "Dynamic leg work", video_id: "L8fvypPrzzs", video_url: "https://www.youtube.com/watch?v=L8fvypPrzzs" },
  { name: "Wall Sits", description: "Isometric quad work", video_id: "y-wV4Venusw", video_url: "https://www.youtube.com/watch?v=y-wV4Venusw" },
  { name: "Jump Squats", description: "Explosive lower body", video_id: "A-cFYWvaHr0", video_url: "https://www.youtube.com/watch?v=A-cFYWvaHr0" },
  { name: "Single Leg Deadlift", description: "Balance and hamstrings", video_id: "zmc_TxpLsj0", video_url: "https://www.youtube.com/watch?v=zmc_TxpLsj0" },
  { name: "Sissy Squat", description: "Quad isolation", video_id: "xN6P7dIWIFU", video_url: "https://www.youtube.com/watch?v=xN6P7dIWIFU" },
  { name: "Good Morning", description: "Hamstring and lower back", video_id: "qtB16ehZ3IQ", video_url: "https://www.youtube.com/watch?v=qtB16ehZ3IQ" },
  { name: "Leg Curls", description: "Hamstring isolation", video_id: "1Tq3QdYUuHs", video_url: "https://www.youtube.com/watch?v=1Tq3QdYUuHs" },
  { name: "Leg Extensions", description: "Quad isolation", video_id: "YyvSfVjQeL0", video_url: "https://www.youtube.com/watch?v=YyvSfVjQeL0" },
  { name: "Adductor Machine", description: "Inner thigh work", video_id: "5VvqJsVDkck", video_url: "https://www.youtube.com/watch?v=5VvqJsVDkck" },
  { name: "Abductor Machine", description: "Outer hip work", video_id: "tSJfPmJKwUc", video_url: "https://www.youtube.com/watch?v=tSJfPmJKwUc" },
  { name: "Cable Pull Through", description: "Hip hinge pattern", video_id: "0BuVDK8ovU8", video_url: "https://www.youtube.com/watch?v=0BuVDK8ovU8" },
  { name: "Reverse Lunge", description: "Knee-friendly lunge", video_id: "xXEDDYX8gDY", video_url: "https://www.youtube.com/watch?v=xXEDDYX8gDY" },
  { name: "Curtsy Lunge", description: "Glute activation", video_id: "dPdBgPH3uMo", video_url: "https://www.youtube.com/watch?v=dPdBgPH3uMo" },
  
  // More exercises (60-80)
  { name: "Upright Row", description: "Trap and shoulder work", video_id: "8Gg5C9fI7Cc", video_url: "https://www.youtube.com/watch?v=8Gg5C9fI7Cc" },
  { name: "Shrugs", description: "Trap development", video_id: "_VqCTQdx79s", video_url: "https://www.youtube.com/watch?v=_VqCTQdx79s" },
  { name: "Reverse Flyes", description: "Rear delt isolation", video_id: "tTKY4Rl_V9s", video_url: "https://www.youtube.com/watch?v=tTKY4Rl_V9s" },
  { name: "Cable Lateral Raise", description: "Constant tension delts", video_id: "PPrzBWZDOhA", video_url: "https://www.youtube.com/watch?v=PPrzBWZDOhA" },
  { name: "Pike Push-Up", description: "Bodyweight shoulder press", video_id: "x5AvPuLvV5A", video_url: "https://www.youtube.com/watch?v=x5AvPuLvV5A" },
  { name: "Handstand Push-Up", description: "Advanced shoulder work", video_id: "tQhrk6WMcKw", video_url: "https://www.youtube.com/watch?v=tQhrk6WMcKw" },
  { name: "Cable Chest Press", description: "Machine chest work", video_id: "D8s8Hso7idE", video_url: "https://www.youtube.com/watch?v=D8s8Hso7idE" },
  { name: "Pec Deck", description: "Chest fly machine", video_id: "Z57CtFmRMxA", video_url: "https://www.youtube.com/watch?v=Z57CtFmRMxA" },
  { name: "Inverted Row", description: "Horizontal pull", video_id: "hXTc1mDnZCw", video_url: "https://www.youtube.com/watch?v=hXTc1mDnZCw" },
  { name: "Chin-Ups", description: "Bicep-focused pull", video_id: "bGUzTvS1c9I", video_url: "https://www.youtube.com/watch?v=bGUzTvS1c9I" },
  { name: "Chest Supported Row", description: "Isolated back work", video_id: "OwKtcH5JFbE", video_url: "https://www.youtube.com/watch?v=OwKtcH5JFbE" },
  { name: "Meadows Row", description: "Unilateral back builder", video_id: "U5zrloYWwuw", video_url: "https://www.youtube.com/watch?v=U5zrloYWwuw" },
  { name: "Seal Row", description: "Momentum-free back work", video_id: "7WW8fQHOzTI", video_url: "https://www.youtube.com/watch?v=7WW8fQHOzTI" },
  { name: "Rack Pull", description: "Partial deadlift", video_id: "vkc6hPJ-ZbY", video_url: "https://www.youtube.com/watch?v=vkc6hPJ-ZbY" },
  { name: "Hyperextension", description: "Lower back strength", video_id: "ktEFg1eFZrw", video_url: "https://www.youtube.com/watch?v=ktEFg1eFZrw" },
  { name: "Superman", description: "Bodyweight back extension", video_id: "z6PJMT2y8GQ", video_url: "https://www.youtube.com/watch?v=z6PJMT2y8GQ" },
  { name: "Bird Dog", description: "Core stability", video_id: "wiFNA3sqjCA", video_url: "https://www.youtube.com/watch?v=wiFNA3sqjCA" },
  { name: "Dead Bug", description: "Anti-extension core", video_id: "g_BYB0R-4Ws", video_url: "https://www.youtube.com/watch?v=g_BYB0R-4Ws" },
  { name: "Pallof Press", description: "Anti-rotation core", video_id: "AH_QZLm_0-s", video_url: "https://www.youtube.com/watch?v=AH_QZLm_0-s" },
  { name: "Cable Crunch", description: "Weighted ab work", video_id: "Pr8ChaE1Xr4", video_url: "https://www.youtube.com/watch?v=Pr8ChaE1Xr4" },
  
  // Final exercises (80-100)
  { name: "Hanging Leg Raise", description: "Advanced ab exercise", video_id: "L_LQXz4LMR0", video_url: "https://www.youtube.com/watch?v=L_LQXz4LMR0" },
  { name: "Bicycle Crunches", description: "Oblique activation", video_id: "9FGilxCbdz8", video_url: "https://www.youtube.com/watch?v=9FGilxCbdz8" },
  { name: "V-Ups", description: "Full ab contraction", video_id: "7UVgs18Y1P4", video_url: "https://www.youtube.com/watch?v=7UVgs18Y1P4" },
  { name: "Flutter Kicks", description: "Lower ab endurance", video_id: "ANVdMDaYRts", video_url: "https://www.youtube.com/watch?v=ANVdMDaYRts" },
  { name: "Sit-Ups", description: "Traditional ab exercise", video_id: "TJPjSh9iH1o", video_url: "https://www.youtube.com/watch?v=TJPjSh9iH1o" },
  { name: "Preacher Curl", description: "Isolated bicep work", video_id: "fIWP-FRFNU0", video_url: "https://www.youtube.com/watch?v=fIWP-FRFNU0" },
  { name: "Incline Curl", description: "Bicep stretch position", video_id: "soxrZlIl35U", video_url: "https://www.youtube.com/watch?v=soxrZlIl35U" },
  { name: "Zottman Curl", description: "Bicep and forearm", video_id: "ZrpRBgswtHs", video_url: "https://www.youtube.com/watch?v=ZrpRBgswtHs" },
  { name: "Spider Curl", description: "Peak bicep contraction", video_id: "3J0wzjQBNKk", video_url: "https://www.youtube.com/watch?v=3J0wzjQBNKk" },
  { name: "Close Grip Bench", description: "Tricep mass builder", video_id: "nEF0bv2FW94", video_url: "https://www.youtube.com/watch?v=nEF0bv2FW94" },
  { name: "Overhead Tricep Extension", description: "Long head focus", video_id: "nRiJVZDpdL0", video_url: "https://www.youtube.com/watch?v=nRiJVZDpdL0" },
  { name: "Diamond Push-Ups", description: "Bodyweight tricep work", video_id: "J0DnG1_S92I", video_url: "https://www.youtube.com/watch?v=J0DnG1_S92I" },
  { name: "Bench Dips", description: "Tricep bodyweight exercise", video_id: "0326dy_-CzM", video_url: "https://www.youtube.com/watch?v=0326dy_-CzM" },
  { name: "Kickbacks", description: "Tricep isolation", video_id: "6SS6K3lAwZ8", video_url: "https://www.youtube.com/watch?v=6SS6K3lAwZ8" },
  { name: "Wrist Curls", description: "Forearm flexors", video_id: "16S7b7BfTPc", video_url: "https://www.youtube.com/watch?v=16S7b7BfTPc" },
  { name: "Reverse Wrist Curls", description: "Forearm extensors", video_id: "EbROS5p0IWc", video_url: "https://www.youtube.com/watch?v=EbROS5p0IWc" },
  { name: "Jumping Jacks", description: "Cardio warm-up", video_id: "iSSAk4XCsRA", video_url: "https://www.youtube.com/watch?v=iSSAk4XCsRA" },
  { name: "High Knees", description: "Running in place", video_id: "8opcQdC-V-U", video_url: "https://www.youtube.com/watch?v=8opcQdC-V-U" },
  { name: "Butt Kicks", description: "Dynamic hamstring warm-up", video_id: "r5VF5bt_fOA", video_url: "https://www.youtube.com/watch?v=r5VF5bt_fOA" },
  { name: "Inchworm", description: "Dynamic stretch", video_id: "nI-SV0CwBrg", video_url: "https://www.youtube.com/watch?v=nI-SV0CwBrg" },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    // Check if exercises already exist
    const { count } = await supabaseClient
      .from("exercises")
      .select("*", { count: "exact", head: true });

    if (count && count >= 100) {
      return new Response(
        JSON.stringify({ message: "Exercises already populated", count }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Insert exercises
    const { data, error } = await supabaseClient
      .from("exercises")
      .upsert(exercises, { onConflict: "video_id" });

    if (error) throw error;

    return new Response(
      JSON.stringify({ message: "Successfully populated 100 exercises", count: exercises.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
