import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { exerciseId, exerciseName } = await req.json();

    if (!exerciseId || !exerciseName) {
      return new Response(JSON.stringify({ error: 'exerciseId and exerciseName are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate two frame images using Lovable AI
    const generateImage = async (prompt: string): Promise<Uint8Array> => {
      const response = await fetch("https://api.lovable.dev/v1/ai/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          prompt,
          aspect_ratio: "1:1",
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Image generation failed: ${response.status} - ${errorText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      return new Uint8Array(arrayBuffer);
    };

    console.log(`Generating start frame for "${exerciseName}"...`);
    const startPrompt = `Simple clean anatomical line-art sketch on plain white background: ${exerciseName} STARTING position (standing upright, feet shoulder-width apart). Gender-neutral human figure shown from the side. No text, no labels, no background elements, minimal black line-art style. Exercise illustration for a fitness app.`;
    const startImage = await generateImage(startPrompt);

    console.log(`Generating end frame for "${exerciseName}"...`);
    const endPrompt = `Simple clean anatomical line-art sketch on plain white background: ${exerciseName} BOTTOM position (deep squat, thighs parallel to ground, arms extended forward). Gender-neutral human figure shown from the side. No text, no labels, no background elements, minimal black line-art style. Exercise illustration for a fitness app.`;
    const endImage = await generateImage(endPrompt);

    // Upload to exercise-gifs bucket
    const startPath = `${exerciseId}_start.png`;
    const endPath = `${exerciseId}_end.png`;

    const { error: startUploadError } = await supabase.storage
      .from('exercise-gifs')
      .upload(startPath, startImage, {
        contentType: 'image/png',
        upsert: true,
      });

    if (startUploadError) throw new Error(`Start frame upload failed: ${startUploadError.message}`);

    const { error: endUploadError } = await supabase.storage
      .from('exercise-gifs')
      .upload(endPath, endImage, {
        contentType: 'image/png',
        upsert: true,
      });

    if (endUploadError) throw new Error(`End frame upload failed: ${endUploadError.message}`);

    // Get public URLs
    const { data: startUrlData } = supabase.storage
      .from('exercise-gifs')
      .getPublicUrl(startPath);

    const { data: endUrlData } = supabase.storage
      .from('exercise-gifs')
      .getPublicUrl(endPath);

    const frameStartUrl = startUrlData.publicUrl;
    const frameEndUrl = endUrlData.publicUrl;

    // Update exercise record
    const { error: updateError } = await supabase
      .from('exercises')
      .update({
        frame_start_url: frameStartUrl,
        frame_end_url: frameEndUrl,
      })
      .eq('id', exerciseId);

    if (updateError) throw new Error(`Exercise update failed: ${updateError.message}`);

    console.log(`Frames generated and saved for exercise "${exerciseName}"`);

    return new Response(JSON.stringify({
      success: true,
      frameStartUrl,
      frameEndUrl,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating exercise frames:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Failed to generate exercise frames',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
